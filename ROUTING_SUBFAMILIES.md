# 🗺️ Routing avec Sous-Familles

## 📋 **Vue d'Ensemble**

Ce document explique comment le système de routing fonctionne pour les modules **avec** et **sans** sous-familles.

---

## ⚙️ **Configuration des Modules**

### Fichier : `src/config/moduleConfig.ts`

Ce fichier déclare quels modules utilisent des sous-familles :

```typescript
export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  // ✅ AVEC SOUS-FAMILLES
  vocab: { hasSubfamilies: true },
  phrase_types: { hasSubfamilies: true },
  grammar: { hasSubfamilies: true },
  dialogues: { hasSubfamilies: true },
  reading: { hasSubfamilies: true },

  // ❌ SANS SOUS-FAMILLES
  word_games: { hasSubfamilies: false },
  connector: { hasSubfamilies: false },
  assessment: { hasSubfamilies: false }
};
```

---

## 🔀 **Flow de Navigation**

### **Modules AVEC Sous-Familles** (Vocab, Phrases, Grammar, Dialogues, Reading)

```
Dashboard
  ↓
Niveau Selection (Les Bases, L'Essentiel...)
  ↓
Module Selection (Vocabulary, Phrases, Grammar...)
  ↓
┌─────────────────────────────────────────┐
│ FAMILY SELECTION                        │
│ (FamilySelectionScreen)                 │
│                                         │
│ Ex: Vocabulary → Food, Colors, Family  │
│ Ex: Phrases → Daily Life, Travel       │
│ Ex: Grammar → Present, Past, Future    │
└─────────────────────────────────────────┘
  ↓ Click sur "Food & Drinks"
┌─────────────────────────────────────────┐
│ SUBFAMILY SELECTION                     │
│ (SubFamilySelectionScreen)              │
│                                         │
│ Food & Drinks → Le Salé                │
│                 Le Sucré                │
│                 Les Boissons            │
└─────────────────────────────────────────┘
  ↓ Click sur "Le Salé"
┌─────────────────────────────────────────┐
│ EXERCICE                                │
│ (VocabularyExerciseScreen)              │
│                                         │
│ Affiche : Water, Bread, Salt...        │
└─────────────────────────────────────────┘
```

**URLs :**
```
/family/vocab?levelId=1
  ↓
/subfamily/1?moduleId=vocab&levelId=1
  ↓
/exercise/vocab?familyId=1&subfamilyId=1&levelId=1
```

---

### **Modules SANS Sous-Familles** (Word Games, Connector, Assessment)

```
Dashboard
  ↓
Niveau Selection
  ↓
Module Selection
  ↓
┌─────────────────────────────────────────┐
│ FAMILY SELECTION                        │
│ (FamilySelectionScreen)                 │
│                                         │
│ Ex: Word Games → Quick Match           │
│                  Definition Master      │
└─────────────────────────────────────────┘
  ↓ Click sur "Quick Match"
┌─────────────────────────────────────────┐
│ EXERCICE DIRECT                         │
│ (WordGamesExerciseScreen)               │
│                                         │
│ Commence l'exercice directement        │
└─────────────────────────────────────────┘
```

**URLs :**
```
/family/word_games?levelId=1
  ↓
/exercise/word_games?familyId=3&levelId=1
```

---

## 🧩 **Composants Clés**

### **1. FamilySelectionScreen**

**Rôle :** Affiche les familles d'un module

**Logique de Routing :**
```typescript
const handleFamilyPress = (familyId: string | number) => {
  const hasSubfamilies = moduleHasSubfamilies(moduleId);

  if (hasSubfamilies) {
    // Route vers SubFamilySelectionScreen
    router.push({
      pathname: '/subfamily/[subfamilyId]',
      params: { subfamilyId, moduleId, levelId }
    });
  } else {
    // Route directement vers l'exercice
    router.push({
      pathname: '/exercise/[exerciseId]',
      params: { exerciseId: moduleId, familyId, levelId }
    });
  }
};
```

---

### **2. SubFamilySelectionScreen** (Générique)

**Rôle :** Affiche les sous-familles d'une famille

**Généricité :** Fonctionne pour **tous** les modules avec sous-familles

**Params attendus :**
- `moduleId` : Le slug du module (vocab, phrase_types, grammar...)
- `familyId` : L'ID de la famille (1, 2, 3...)
- `levelId` : Le niveau du Dashboard (1, 2, 3, 4)

**Service utilisé :** `getSubFamiliesByFamily(db, familyId, identityId)`

**Requête SQL :**
```sql
SELECT
  level_number as subfamily_id,
  display_title as title,
  icon_name as icon,
  display_description as description
FROM level_labels
WHERE family_id = ? AND (identity_id = ? OR identity_id = 'adult')
GROUP BY level_number
ORDER BY level_number ASC
```

---

## 📊 **Structure de Données**

### **Table : `level_labels`**

Cette table stocke **2 types de labels** :

#### **A. Labels de Niveaux Globaux** (`family_id = NULL`)
```sql
level_number | identity_id | family_id | display_title | badge_text
-------------|-------------|-----------|---------------|------------
1            | adult       | NULL      | Niveau 1      | N1
2            | adult       | NULL      | Niveau 2      | N2
```

#### **B. Labels de Sous-Familles** (`family_id != NULL`)
```sql
level_number | identity_id | family_id | display_title | icon_name
-------------|-------------|-----------|---------------|----------
1            | adult       | 1         | Le Salé       | 🧂
2            | adult       | 1         | Le Sucré      | 🍰
1            | adult       | 7         | Morning       | 🌅
2            | adult       | 7         | At Work       | 💼
```

**Astuce :** `level_number` est réutilisé comme ID de sous-famille (1, 2, 3...)

---

### **Table : `content`**

```sql
id | family_id | level | subfamily_id | content_type | data
---|-----------|-------|--------------|--------------|-----
1  | 1         | 1     | 1            | word         | {"word":"Water"...}
2  | 1         | 1     | 1            | word         | {"word":"Bread"...}
3  | 1         | 1     | 2            | word         | {"word":"Coffee"...}
4  | 7         | 1     | 1            | sentence     | {"phrase_en":"Good morning"...}
```

**Colonnes importantes :**
- `family_id` : La famille (Food=1, Daily Life=7...)
- `level` : Le niveau du Dashboard (1=Les Bases, 2=L'Essentiel...)
- `subfamily_id` : La sous-famille (1=Le Salé, 2=Le Sucré, NULL si pas de subfamily)

---

## 🎯 **Progression**

### **Modules avec Sous-Familles**

La progression utilise un **`compositeFamilyId`** : `"familyId-subfamilyId"`

```typescript
// VocabularyExerciseScreen
const compositeFamilyId = `${familyId}-${subfamilyId}`; // Ex: "1-1"
trackItemCompletion(dashboardLevelId, 'vocab', compositeFamilyId, ...);
```

**Structure AsyncStorage :**
```json
{
  "level1": {
    "vocab": {
      "1-1": { "completed": 10, "total": 15 }, // Food + Le Salé
      "1-2": { "completed": 5, "total": 15 },  // Food + Le Sucré
      "2": { "completed": 8, "total": 10 }     // Colors (pas de subfamily)
    }
  }
}
```

---

### **Modules sans Sous-Familles**

La progression utilise le **`familyId`** simple

```typescript
// WordGamesExerciseScreen
trackItemCompletion(dashboardLevelId, 'word_games', familyId, ...);
```

**Structure AsyncStorage :**
```json
{
  "level1": {
    "word_games": {
      "8": { "completed": 5, "total": 10 }, // Definition Master
      "9": { "completed": 3, "total": 10 }  // Quick Match
    }
  }
}
```

---

## ✅ **Checklist d'Implémentation**

Pour ajouter un nouveau module **avec sous-familles** :

1. [ ] **Déclarer dans `moduleConfig.ts`**
   ```typescript
   my_module: { hasSubfamilies: true }
   ```

2. [ ] **Créer les familles dans `004_seed_families.ts`**
   ```typescript
   ['my_family', 'my_module', 'My Family', 'icon', '🎯', 'Description', 10]
   ```

3. [ ] **Créer les labels de sous-familles dans une nouvelle migration**
   ```sql
   INSERT INTO level_labels (family_id, level_number, identity_id, display_title, icon_name, display_description)
   VALUES (family_id, 1, 'adult', 'Subfamily 1', '🎯', 'Description');
   ```

4. [ ] **Insérer le contenu avec `subfamily_id`**
   ```sql
   INSERT INTO content (family_id, level, subfamily_id, content_type, data)
   VALUES (family_id, 1, 1, 'my_type', '{"key":"value"}');
   ```

5. [ ] **Dans l'écran d'exercice, utiliser `compositeFamilyId`**
   ```typescript
   const compositeFamilyId = `${familyId}-${subfamilyId}`;
   trackItemCompletion(dashboardLevelId, exerciseType, compositeFamilyId, ...);
   ```

---

Pour ajouter un nouveau module **sans sous-familles** :

1. [ ] **Déclarer dans `moduleConfig.ts`**
   ```typescript
   my_module: { hasSubfamilies: false }
   ```

2. [ ] **Créer les familles dans `004_seed_families.ts`**

3. [ ] **Insérer le contenu SANS `subfamily_id`**
   ```sql
   INSERT INTO content (family_id, level, content_type, data)
   VALUES (family_id, 1, 'my_type', '{"key":"value"}');
   ```

4. [ ] **Dans l'écran d'exercice, utiliser `familyId` simple**
   ```typescript
   trackItemCompletion(dashboardLevelId, exerciseType, familyId, ...);
   ```

---

## 🐛 **Troubleshooting**

### **"Pas de sous-familles affichées"**
- Vérifier que `level_labels` contient des entrées avec `family_id = X`
- Vérifier que `moduleConfig.ts` déclare `hasSubfamilies: true`

### **"Clés dupliquées dans SubFamilySelectionScreen"**
- Utiliser `GROUP BY level_number` dans la requête SQL
- Vérifier qu'il n'y a pas de doublons dans `level_labels`

### **"Chargement infini dans l'exercice"**
- Vérifier que `subfamilyId` est bien passé dans les params
- Vérifier que `useExerciseContent` utilise `WHERE subfamily_id = ?`
- Vérifier que `subfamilyId` n'est pas `NaN` ou `undefined`

### **"Module sans subfamily va vers SubFamilySelection"**
- Vérifier que `moduleConfig.ts` déclare `hasSubfamilies: false`
- Vérifier que `FamilySelectionScreen` utilise `moduleHasSubfamilies()`

---

**Dernière mise à jour :** 2026-02-02
**Version :** 1.0
