# 🏗️ Architecture des Données - JanaCore

## 📊 Hiérarchie Complète

```
┌──────────────────────────────────────────────────────────┐
│ IDENTITY (White Label - Type d'App)                     │
│ primary, college, lycee, adult                          │
│ Stocké dans: table `branding`                           │
│ Variable: identity.id                                   │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ LEVELS (Niveaux du Dashboard)                           │
│ "Les Bases", "L'Essentiel", "Avancé", "Expert"          │
│ Stocké dans: table `levels`                             │
│ Variable: dashboardLevelId (1, 2, 3, 4)                 │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ MODULES (Types d'exercices)                             │
│ Vocabulary, Grammar, Reading, Dialogues...              │
│ Stocké dans: table `modules`                            │
│ Variable: exerciseType ('vocab', 'grammar'...)          │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ FAMILIES (Thématiques)                                  │
│ Food & Drinks, Transport, Animals...                    │
│ Stocké dans: table `families`                           │
│ Variable: familyId (number) ou familyIdRaw (string)     │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ SUBFAMILIES (Division optionnelle)                      │
│ Le Salé, Le Sucré, Les Fruits...                        │
│ Stocké dans: table `level_labels` avec family_id        │
│ Variable: subfamilyId (1, 2, 3...)                      │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ CONTENT (Contenu réel)                                  │
│ Water, Bread, Coffee...                                 │
│ Stocké dans: table `content`                            │
│ Colonnes: family_id, subfamily_id, level               │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Convention de Nommage

### 1️⃣ **Identity (Type d'App)**
```typescript
// ✅ Bon
const { identity } = useTheme();
const identityId = identity.id; // 'primary', 'college', 'lycee', 'adult'

// ❌ Mauvais
const app = 'primary'; // Pas assez explicite
```

### 2️⃣ **Levels (Dashboard)**
```typescript
// ✅ Bon
const dashboardLevelId = 1; // "Les Bases"
const dashboardLevelId = 2; // "L'Essentiel"
const dashboardLevelId = 3; // "Avancé"
const dashboardLevelId = 4; // "Expert"

// ❌ Mauvais
const level = 1; // Trop vague ! Level de quoi ?
const realLevelId = 1; // Confus avec d'autres niveaux
```

### 3️⃣ **Modules (Exercices)**
```typescript
// ✅ Bon
const exerciseType = 'vocab';
const moduleSlug = 'vocabulary';

// ❌ Mauvais
const type = 'vocab'; // Trop vague
```

### 4️⃣ **Families (Thématiques)**
```typescript
// ✅ Bon
const familyId = 1; // Number (ID en DB)
const familyIdRaw = '1'; // String (pour AsyncStorage)
const familySlug = 'food_drinks'; // Slug lisible

// ❌ Mauvais
const id = 1; // Trop vague
```

### 5️⃣ **Subfamilies (Sous-catégories)**
```typescript
// ✅ Bon
const subfamilyId = 1; // Le Salé
const subfamilyId = 2; // Le Sucré

// ❌ Mauvais
const level = 1; // Conflit avec realLevelId !
const subId = 1; // Pas assez explicite
```

### 6️⃣ **FamilyId Composite (Pour la Progression)**
```typescript
// ✅ Bon
const compositeFamilyId = `${familyId}-${subfamilyId}`; // "1-1"

// Structure de progression résultante :
progress = {
  level1: { // dashboardLevelId = "Les Bases"
    vocab: {
      "1-1": { completed: 2, total: 2 }, // Food + Le Salé
      "1-2": { completed: 1, total: 2 }, // Food + Le Sucré
    }
  },
  level2: { // dashboardLevelId = "L'Essentiel"
    vocab: {
      "1-1": { completed: 5, total: 10 },
    }
  }
}
```

---

## 📦 Structure de la Table `content`

```sql
CREATE TABLE content (
  id INTEGER PRIMARY KEY,
  family_id INTEGER NOT NULL,       -- Famille (Food & Drinks)
  level INTEGER NOT NULL,            -- Vrai level (1=Primary, 2=Collège...)
  subfamily_id INTEGER DEFAULT NULL, -- Sous-famille (1=Le Salé, 2=Le Sucré, NULL si pas de sous-famille)
  content_type TEXT NOT NULL,        -- 'word', 'phrase', 'dialogue'...
  data TEXT NOT NULL,                -- JSON du contenu
  ...
);
```

### Exemple de données :
```sql
INSERT INTO content (family_id, level, subfamily_id, content_type, data) VALUES
  (1, 1, 1, 'word', '{"word":"Water","translation":"Eau"}'),  -- Food, Primary, Le Salé
  (1, 1, 1, 'word', '{"word":"Bread","translation":"Pain"}'), -- Food, Primary, Le Salé
  (1, 1, 2, 'word', '{"word":"Coffee","translation":"Café"}'),-- Food, Primary, Le Sucré
  (2, 1, NULL, 'assessment', '{"question":"..."}');           -- Assessment, Primary, pas de subfamily
```

---

## 🎯 Requêtes SQL

### Récupérer le contenu d'une sous-famille
```typescript
// useExerciseContent.ts
const contentResult = await db.getAllAsync(
  `SELECT id, data FROM content
   WHERE family_id = ? AND subfamily_id = ?`,
  [familyId, subfamilyId]
);
```

### Récupérer toutes les sous-familles d'une famille
```typescript
// subfamilyService.ts
const subfamilies = await db.getAllAsync(
  `SELECT level_number as subfamily_id, display_title as title, icon_name as icon
   FROM level_labels
   WHERE family_id = ? AND identity_id = ?`,
  [familyId, identityId]
);
```

---

## 🧪 Exemple de Flow Complet

### Scénario : User clique sur "Le Salé" dans Food & Drinks

```typescript
// 1. SubFamilySelectionScreen
const familyId = 1; // Food & Drinks
const subfamilies = await getSubFamiliesByFamily(db, familyId, identityId);
// Résultat : [{ subfamily_id: 1, title: "Le Salé" }, { subfamily_id: 2, title: "Le Sucré" }]

// 2. User clique sur "Le Salé"
router.push({
  pathname: '/exercise/[exerciseId]',
  params: {
    exerciseId: 'vocab',
    familyId: '1',
    level: '1' // subfamilyId
  }
});

// 3. VocabularyExerciseScreen
const familyIdNum = 1;
const subfamilyId = 1;
const realLevelId = 1; // Primary
const compositeFamilyId = "1-1"; // Pour la progression

// 4. Récupération du contenu
const { contentItems } = useExerciseContent(familyIdNum, subfamilyId);
// Requête : SELECT * FROM content WHERE family_id = 1 AND subfamily_id = 1
// Résultat : [{ word: "Water" }, { word: "Bread" }]

// 5. Sauvegarde de la progression
trackItemCompletion(realLevelId, 'vocab', compositeFamilyId, 0, 2);
// Stocké dans : progress.level1.vocab["1-1"] = { completed: 1, total: 2 }
```

---

## ⚠️ Pièges à Éviter

### ❌ Confondre Identity et Level
```typescript
// MAUVAIS
const levelId = 1; // Primary ? Les Bases ? On ne sait pas !
trackItemCompletion(levelId, 'vocab', familyId, ...);
// Résultat : Confusion totale !
```

### ❌ Utiliser `level` pour les sous-familles
```typescript
// MAUVAIS
const level = subfamilyId; // Conflit sémantique !
trackItemCompletion(level, 'vocab', familyId, ...);
// Résultat : progress.level1.vocab["1"] écrase tout !
```

### ❌ Ne pas passer le levelId du Dashboard
```typescript
// MAUVAIS (dans SubFamilySelectionScreen)
router.push({
  params: { familyId: 1, subfamilyId: 1 } // ❌ Pas de levelId !
});
// Résultat : VocabularyExerciseScreen ne sait pas dans quel niveau on est !
```

### ✅ Utiliser la convention correcte
```typescript
// BON (dans SubFamilySelectionScreen)
const dashboardLevelId = Number(params.levelId); // 1 = "Les Bases"
router.push({
  params: {
    exerciseId: 'vocab',
    familyId: '1',
    subfamilyId: '1',
    levelId: dashboardLevelId.toString()  // ✅ Passe le level du Dashboard
  }
});

// BON (dans VocabularyExerciseScreen)
const dashboardLevelId = Number(params.levelId); // 1 = "Les Bases"
const subfamilyId = Number(params.subfamilyId); // 1 = Le Salé
const compositeFamilyId = `${familyId}-${subfamilyId}`; // "1-1"
trackItemCompletion(dashboardLevelId, 'vocab', compositeFamilyId, ...);
// Résultat : progress.level1.vocab["1-1"] bien séparé
```

---

## 📝 Checklist de Validation

Avant d'ajouter une nouvelle feature :

- [ ] Les variables sont-elles nommées selon la convention ?
- [ ] `level` fait-il référence au **vrai level** (Primary, Collège) ?
- [ ] `subfamilyId` est-il utilisé uniquement pour le contenu ?
- [ ] La progression utilise-t-elle `compositeFamilyId` ?
- [ ] Les requêtes SQL utilisent-elles les bonnes colonnes ?

---

## 🔄 Migration 018 : Séparation de `level` et `subfamily_id`

**Problème résolu :**
- Avant : colonne `level` utilisée pour 2 choses (niveaux ET sous-familles)
- Après : `level` = vrai level, `subfamily_id` = sous-famille

**Impact :**
- Les requêtes utilisent maintenant `subfamily_id` au lieu de `level`
- Les familles sans sous-familles ont `subfamily_id = NULL`
- La progression utilise `compositeFamilyId` pour différencier les sous-familles

---

**Version :** 1.0 - 2026-02-02
**Auteur :** Claude Code
