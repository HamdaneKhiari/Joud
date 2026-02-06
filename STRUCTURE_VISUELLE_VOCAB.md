# 🗺️ Structure Visuelle du Vocabulaire

**Date** : 5 Février 2026

---

## 📊 Hiérarchie Complète

```
Module: Vocabulaire (vocab)
│
└── Famille: Basics (salutations) 👋
    │
    ├── Subfamily 1: Pronouns (13 mots)
    │   ├── I, YOU, HE, SHE, IT, WE, THEY
    │   └── MY, YOUR, HIS, HER, OUR, THEIR
    │
    ├── Subfamily 2: Essential Verbs (27 mots)
    │   ├── BE, HAVE, DO, GO, COME, GET, MAKE
    │   ├── TAKE, PUT, USE, WANT, LIKE, CAN
    │   ├── EAT, DRINK, SLEEP, SAY, TELL
    │   └── KNOW, THINK, LOOK, SEE, LISTEN, HEAR, WORK
    │
    ├── Subfamily 3: Prepositions (9 mots)
    │   └── IN, ON, AT, UNDER, TO, FROM, WITH, WITHOUT, FOR
    │
    ├── Subfamily 4: Questions (6 mots)
    │   └── WHO, WHAT, WHERE, WHEN, WHY, HOW
    │
    ├── Subfamily 5: Adjectives (10 mots)
    │   └── BIG, SMALL, GOOD, BAD, HAPPY, SAD, HOT, COLD, HUNGRY, THIRSTY
    │
    ├── Subfamily 6: Time Words (9 mots)
    │   └── NOW, TODAY, TOMORROW, YESTERDAY, ALWAYS, NEVER, SOMETIMES, HERE, THERE
    │
    ├── Subfamily 7: Connectors (5 mots)
    │   └── AND, BUT, OR, BECAUSE, SO
    │
    ├── Subfamily 8: People & Places (10 mots)
    │   └── MAN, WOMAN, CHILD, FRIEND, SCHOOL, HOUSE, WATER, FOOD, TIME, NAME
    │
    ├── Subfamily 9: Articles (4 mots)
    │   └── A / AN, THE, THIS, THAT
    │
    └── Subfamily 10: Responses (9 mots)
        └── YES, NO, NOT, ALL, SOME, EVERY, HELLO, THANKS, PLEASE
```

---

## 🎯 Vue Navigation Utilisateur

```
Écran Principal
     ↓
Module Vocabulaire
     ↓
Famille: Basics 👋
     ↓
     ├─→ Subfamily 1: Pronouns        [13 mots] →→→ Exercice
     ├─→ Subfamily 2: Essential Verbs [27 mots] →→→ Exercice
     ├─→ Subfamily 3: Prepositions     [9 mots] →→→ Exercice
     ├─→ Subfamily 4: Questions        [6 mots] →→→ Exercice
     ├─→ Subfamily 5: Adjectives      [10 mots] →→→ Exercice
     ├─→ Subfamily 6: Time Words       [9 mots] →→→ Exercice
     ├─→ Subfamily 7: Connectors       [5 mots] →→→ Exercice
     ├─→ Subfamily 8: People & Places [10 mots] →→→ Exercice
     ├─→ Subfamily 9: Articles         [4 mots] →→→ Exercice
     └─→ Subfamily 10: Responses       [9 mots] →→→ Exercice
```

---

## 🗄️ Schéma Base de Données

```
┌─────────────────────────┐
│      families           │
│─────────────────────────│
│ id: 1                   │
│ slug: 'salutations'     │
│ name: 'Basics'          │
│ emoji: '👋'             │
└─────────────────────────┘
          │
          │ (1 famille → N subfamilies)
          │
          ↓
┌─────────────────────────────────────┐
│      level_labels (subfamilies)     │
│─────────────────────────────────────│
│ family_id: 1, level_number: 1       │ → Pronouns
│ family_id: 1, level_number: 2       │ → Essential Verbs
│ family_id: 1, level_number: 3       │ → Prepositions
│ ...                                 │
│ family_id: 1, level_number: 10      │ → Responses
└─────────────────────────────────────┘
          │
          │ (1 subfamily → N words)
          │
          ↓
┌────────────────────────────────────────────────────┐
│               content (words)                      │
│────────────────────────────────────────────────────│
│ family_id: 1, level: 1, data: {"word": "I", ...}  │
│ family_id: 1, level: 1, data: {"word": "YOU",...} │
│ family_id: 1, level: 2, data: {"word": "BE",...}  │
│ family_id: 1, level: 2, data: {"word": "HAVE",...}│
│ ...                                                │
└────────────────────────────────────────────────────┘
```

---

## 📈 Distribution des 100 Mots

```
Subfamily                    Mots    Pourcentage
─────────────────────────────────────────────────
Essential Verbs (2)          27      27% ████████████
Pronouns (1)                 13      13% ██████
People & Places (8)          10      10% ████
Adjectives (5)               10      10% ████
Prepositions (3)              9       9% ████
Time Words (6)                9       9% ████
Responses (10)                9       9% ████
Questions (4)                 6       6% ███
Connectors (7)                5       5% ██
Articles (9)                  4       4% ██
─────────────────────────────────────────────────
TOTAL                       100     100%
```

---

## 🔄 Flux de Données

```
1. User lance l'app
         ↓
2. DB init → Migration 028 & 029 exécutées
         ↓
3. Famille "salutations" créée
         ↓
4. 10 Subfamilies créées dans level_labels
         ↓
5. 100 Mots insérés dans content
         ↓
6. Chaque mot assigné à sa subfamily (level)
         ↓
7. User navigue: Vocabulaire → Basics → Pronouns
         ↓
8. VocabularyExerciceScreen charge:
   SELECT * FROM content
   WHERE family_id = 1 AND level = 1
         ↓
9. Affiche les 13 pronoms (I, YOU, HE...)
```

---

## 📝 Exemple Requête Complète

### Charger "Essential Verbs"

```sql
-- 1. Trouver l'ID de la famille
SELECT id FROM families WHERE slug = 'salutations';
-- Résultat: id = 1

-- 2. Trouver la subfamily "Essential Verbs"
SELECT level_number FROM level_labels
WHERE family_id = 1 AND display_title = 'Essential Verbs';
-- Résultat: level_number = 2

-- 3. Charger les mots
SELECT
  json_extract(data, '$.word') AS word,
  json_extract(data, '$.translation') AS translation,
  json_extract(data, '$.example') AS example
FROM content
WHERE family_id = 1 AND level = 2 AND content_type = 'word';
```

**Résultat** :
```
word       translation    example
─────────────────────────────────────────────────────
BE         Être           I want to be happy.
HAVE       Avoir          I have a cat.
DO         Faire          I do my work.
GO         Aller          I go to school.
...
```

---

## 🎨 UI Mockup

```
┌──────────────────────────────────────┐
│  Module Vocabulaire                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  👋 Basics                           │
│  Les mots essentiels                 │
│  ──────────────────────────────────  │
│                                      │
│  ✓ Pronouns         13 mots    ●●●○ │
│  ✓ Essential Verbs  27 mots    ●●●○ │
│  ○ Prepositions      9 mots    ○○○○ │
│  ○ Questions         6 mots    ○○○○ │
│  ○ Adjectives       10 mots    ○○○○ │
│  ○ Time Words        9 mots    ○○○○ │
│  ○ Connectors        5 mots    ○○○○ │
│  ○ People & Places  10 mots    ○○○○ │
│  ○ Articles          4 mots    ○○○○ │
│  ○ Responses         9 mots    ○○○○ │
│                                      │
└──────────────────────────────────────┘
```

---

## 🔧 Code Simplifié

### Navigation vers une Subfamily

```typescript
// Depuis l'écran de sélection
navigation.navigate('VocabularyExercise', {
  familyId: 1,        // Famille "salutations"
  subfamilyId: 2,     // Subfamily "Essential Verbs"
  levelId: 1          // Niveau Dashboard
});
```

### Chargement des Mots

```typescript
// Hook useExerciseContent
const { contentItems } = useExerciseContent<VocabData>(
  familyId: 1,
  subfamilyId: 2
);

// Résultat: Array de 27 mots (BE, HAVE, DO, GO...)
```

---

## ✅ Validation

### Checklist Intégrité

- [x] 1 Famille créée (salutations)
- [x] 10 Subfamilies créées (Pronouns, Verbs...)
- [x] 100 Mots insérés (avec exemples)
- [x] Chaque mot lié à sa subfamily correcte
- [x] Pas de mots orphelins (sans subfamily)
- [x] Format JSON valide pour tous les mots

### Tests Automatiques

```sql
-- Test 1: Compter les subfamilies
SELECT COUNT(*) FROM level_labels
WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations');
-- Attendu: 10

-- Test 2: Compter les mots
SELECT COUNT(*) FROM content
WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations')
AND tags = 'core100';
-- Attendu: 100

-- Test 3: Vérifier distribution
SELECT level, COUNT(*) FROM content
WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations')
GROUP BY level;
-- Attendu: 10 lignes (1 par subfamily)
```

---

## 🚀 Prochaines Extensions

### Pour les 700 Mots Suivants

```
Subfamily 11: Numbers          [30 mots]
Subfamily 12: Colors           [20 mots]
Subfamily 13: Body Parts       [25 mots]
Subfamily 14: Family Members   [20 mots]
Subfamily 15: Actions          [50 mots]
...
```

**Pattern identique** :
1. Créer la subfamily dans `level_labels`
2. Ajouter les mots dans `content` avec `level = subfamilyId`
3. Tag `core800` pour identification

---

**Structure scalable prête pour 800 mots !** 🎉
