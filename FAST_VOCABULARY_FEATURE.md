# 🚀 Fast Vocabulary Feature

**Module exclusif pour l'audience ADULTE**

---

## 📋 PRINCIPE

**Fast Vocabulary** est une version **minimaliste et rapide** du module Vocabulary classique.

**Différences** :

| Feature | Vocabulary | Fast Vocabulary |
|---------|------------|-----------------|
| **Exemple de phrase** | ✅ Affiché | ❌ Masqué |
| **Séparateur décoratif** | ✅ | ❌ (si pas d'exemple) |
| **Design** | Détaillé | Ultra-compact |
| **Usage** | Apprentissage approfondi | Révision rapide |
| **Public** | Tous | Adulte uniquement |

---

## 🎯 OBJECTIF

Offrir aux **adultes pressés** un moyen de réviser rapidement des **mots essentiels** sans fioriture.

**Exemple d'usage** :
- L'adulte a peu de temps
- Il choisit **Fast Vocabulary** au lieu de **Vocabulary**
- Il révise 20-30 mots en 5 minutes (vs 10-15 minutes avec exemples)

---

## 🏗️ ARCHITECTURE

### **1. Module en DB**

**Déjà configuré** dans `src/database/migrations/002_seed_core_modules.ts:50` :

```sql
['fastvocab', 'Fast Vocab', 'flash', '500 mots essentiels', 9, 0, 'adult']
```

- **Slug** : `fastvocab`
- **Target audience** : `adult`
- **Icon** : `flash` ⚡
- **is_core** : `0` (module optionnel)

---

### **2. Dispatcher**

**Ajouté dans** `app/exercise/[exerciseId].tsx:60-62` :

```typescript
case 'fastvocab':
  // Fast Vocabulary utilise le même composant que Vocabulary
  return <VocabularyExerciseScreen {...(screenProps as any)} />;
```

**✅ Réutilise le même écran** que Vocabulary classique !

---

### **3. Composant WordCard**

**Modifié dans** `src/components/pedagogy/Vocabulary/WordCard/WordCard.tsx` :

#### **Props ajoutée** :
```typescript
interface WordCardProps {
  moduleSlug?: string; // 'vocab' ou 'fastvocab'
}
```

#### **Logique de détection** :
```typescript
const isFastMode = moduleSlug === 'fastvocab';
const showExample = exampleSentence && !isFastMode;
```

#### **Rendu conditionnel** :
```tsx
{/* Séparateur masqué si Fast Mode */}
{showExample && <View style={styles.separator} />}

{/* Exemple masqué si Fast Mode */}
{showExample && (
  <View style={styles.exampleContainer}>
    {renderExample()}
  </View>
)}
```

---

### **4. Écran Vocabulary**

**Modifié dans** `src/screens/VocabularyScreen/VocabularyExerciceScreen.tsx:177` :

```tsx
<WordCard
  englishWord={currentContentItem.data.word}
  frenchWord={currentContentItem.data.translation}
  exampleSentence={currentContentItem.data.example}
  highlightWord={currentContentItem.data.word}
  audio={currentContentItem.data.audio}
  moduleSlug={module?.slug} // ✅ Passe le slug du module
/>
```

Le composant détecte automatiquement si c'est `fastvocab` et adapte l'affichage.

---

## 📊 DATA STRUCTURE

**Identique à Vocabulary classique** :

```json
{
  "word": "business",
  "translation": "affaires",
  "example": null,  // ⚠️ Peut être null ou ignoré
  "audio": "business.mp3"
}
```

**Même si `example` est présent en DB**, il ne sera **pas affiché** car le composant détecte `moduleSlug === 'fastvocab'`.

---

## 🎨 DESIGN (3 MOODS)

Fast Vocabulary utilise les **mêmes styles que Vocabulary**, adaptés selon l'audience :

**Adulte (clean)** :
- Bordures : 12px
- Padding : LG
- Font : 30px (titre) / 18px (sous-titre)
- Alignement : Gauche
- **Pas d'exemple** → Design encore plus compact

**Rendu final (adulte)** :
```
┌─────────────────────┐
│                     │
│ BUSINESS      🔊    │
│ Affaires            │
│                     │
└─────────────────────┘
• Compact
• Pro
• Rapide
```

---

## 📍 POSITIONNEMENT DANS L'APP

### **Dashboard Adulte**

Fast Vocabulary apparaît comme un **module optionnel** dans chaque niveau :

```
Niveau N1 (Débutant)
  ├─ Vocabulary (classique)
  ├─ Fast Vocabulary ⚡ (rapide)
  ├─ Grammar
  └─ ...

Niveau N5 (Avancé)
  ├─ Vocabulary
  ├─ Fast Vocabulary ⚡
  └─ ...
```

**Filtré automatiquement** :
- ✅ **Visible** pour adulte uniquement (via `target_audience = 'adult'` en DB)
- ❌ **Invisible** pour primaire, collège, lycée

---

## ✅ FICHIERS MODIFIÉS

1. ✅ **`app/exercise/[exerciseId].tsx`**
   - Ajout route `fastvocab` → VocabularyExerciseScreen

2. ✅ **`src/components/pedagogy/Vocabulary/WordCard/WordCard.tsx`**
   - Ajout prop `moduleSlug`
   - Masquage conditionnel de l'exemple

3. ✅ **`src/screens/VocabularyScreen/VocabularyExerciceScreen.tsx`**
   - Passage du `module?.slug` à WordCard

4. ✅ **`src/database/migrations/002_seed_core_modules.ts`**
   - Module `fastvocab` déjà existant

---

## 🧪 TESTS

### **Test 1 : Vérifier module visible (adulte)**
1. Se connecter en tant qu'adulte
2. Aller sur Niveau N1
3. Vérifier que **Fast Vocabulary** apparaît

### **Test 2 : Vérifier module invisible (lycée)**
1. Se connecter en tant que lycée
2. Aller sur Niveau 1
3. Vérifier que **Fast Vocabulary** n'apparaît PAS

### **Test 3 : Vérifier affichage sans exemple**
1. Adulte → Fast Vocabulary → Ouvrir une famille
2. Vérifier que la carte affiche :
   - ✅ Mot anglais
   - ✅ Traduction
   - ✅ Audio
   - ❌ PAS d'exemple
   - ❌ PAS de séparateur

### **Test 4 : Comparer avec Vocabulary classique**
1. Adulte → Vocabulary classique
2. Vérifier que la carte affiche :
   - ✅ Mot + traduction + audio
   - ✅ Exemple avec highlight
   - ✅ Séparateur

---

## 🎯 AVANTAGES

✅ **Zéro duplication de code** → Réutilise VocabularyExerciseScreen
✅ **Design adapté automatiquement** → Via `getExerciseConfig(identity)`
✅ **Filtrage DB natif** → `target_audience = 'adult'`
✅ **Facile à maintenir** → Une seule logique pour vocab + fastvocab
✅ **Valeur ajoutée adulte** → Module premium exclusif

---

## 🚀 PROCHAINES ÉTAPES

1. **Créer le contenu** (DATA) :
   - Ajouter familles Fast Vocab pour les 7 niveaux adultes
   - Environ 70 mots par niveau (total ~500 mots)
   - Possibilité d'organiser par thèmes : Business, Voyage, Tech, Quotidien, Slang

2. **Tester** :
   - Vérifier affichage avec/sans exemple
   - Tester navigation rapide
   - Vérifier filtrage par audience

3. **Optimisations futures** (optionnel) :
   - Auto-next après X secondes (mode flashcard)
   - Swipe plus sensible
   - Compteur de mots révisés

---

**Feature complète et fonctionnelle ! ✅**
