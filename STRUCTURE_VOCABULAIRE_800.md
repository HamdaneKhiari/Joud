# 📚 Structure Vocabulaire Core 800 - Guide Complet

**Date** : 5 Février 2026
**Statut** : ✅ Structure Créée

---

## 🎯 Vue d'Ensemble

Organisation des **800 mots les plus fréquents en anglais** avec une structure **scalable** utilisant families et subfamilies.

---

## 📊 Architecture DB

### Table `families`
Une famille = une catégorie principale

```sql
families
├── id (PRIMARY KEY)
├── slug ('salutations')
├── module_slug ('vocab')
├── name ('Basics')
├── icon ('hand-wave')
└── emoji ('👋')
```

### Table `level_labels` (Subfamilies)
Les sous-catégories d'une famille

```sql
level_labels
├── family_id (FK → families.id)
├── level_number (ID de la subfamily: 1, 2, 3...)
├── identity_id ('all', 'adult', 'primary'...)
├── display_title ('Pronouns', 'Verbs'...)
├── icon_name ('account-circle')
└── display_description
```

### Table `content` (Words)
Les mots liés à une subfamily

```sql
content
├── family_id (FK → families.id)
├── level (ID de la subfamily)
├── content_type ('word')
├── data (JSON: {word, translation, example, exampleTranslation})
├── difficulty ('easy', 'medium', 'hard')
├── tags ('core100', 'core800'...)
└── target_audience ('all')
```

---

## 🏗️ Structure des 800 Mots

### Famille : `salutations` (Basics)

#### 10 Subfamilies Créées

| ID | Nom | Icône | Description | Mots |
|----|-----|-------|-------------|------|
| **1** | Pronouns | account-circle | Personal pronouns and possessives | 13 |
| **2** | Essential Verbs | run-fast | The most common action verbs | 27 |
| **3** | Prepositions | map-marker | Words showing position and direction | 9 |
| **4** | Questions | help-circle | Who, what, where, when, why, how | 6 |
| **5** | Adjectives | palette | Describing people and things | 10 |
| **6** | Time Words | clock | Now, today, always, never... | 9 |
| **7** | Connectors | link-variant | And, but, or, because, so... | 5 |
| **8** | People & Places | home | Man, woman, child, school, house... | 10 |
| **9** | Articles | text-box | A, an, the, this, that | 4 |
| **10** | Responses | comment-check | Yes, no, please, thanks... | 9 |

**Total : 100 mots répartis dans 10 subfamilies**

---

## 📝 Détail des Subfamilies

### Subfamily 1: Pronouns (13 mots)
```
I, YOU, HE, SHE, IT, WE, THEY,
MY, YOUR, HIS, HER, OUR, THEIR
```

### Subfamily 2: Essential Verbs (27 mots)
```
BE, HAVE, DO, GO, COME, GET, MAKE, TAKE, PUT, USE,
WANT, LIKE, CAN, EAT, DRINK, SLEEP, SAY, TELL,
KNOW, THINK, LOOK, SEE, LISTEN, HEAR, WORK
```

### Subfamily 3: Prepositions (9 mots)
```
IN, ON, AT, UNDER, TO, FROM, WITH, WITHOUT, FOR
```

### Subfamily 4: Questions (6 mots)
```
WHO, WHAT, WHERE, WHEN, WHY, HOW
```

### Subfamily 5: Adjectives (10 mots)
```
BIG, SMALL, GOOD, BAD, HAPPY, SAD,
HOT, COLD, HUNGRY, THIRSTY
```

### Subfamily 6: Time Words (9 mots)
```
NOW, TODAY, TOMORROW, YESTERDAY,
ALWAYS, NEVER, SOMETIMES, HERE, THERE
```

### Subfamily 7: Connectors (5 mots)
```
AND, BUT, OR, BECAUSE, SO
```

### Subfamily 8: People & Places (10 mots)
```
MAN, WOMAN, CHILD, FRIEND, SCHOOL,
HOUSE, WATER, FOOD, TIME, NAME
```

### Subfamily 9: Articles (4 mots)
```
A / AN, THE, THIS, THAT
```

### Subfamily 10: Responses (9 mots)
```
YES, NO, NOT, ALL, SOME, EVERY,
HELLO, THANKS, PLEASE
```

---

## 🚀 Comment Ajouter les 700 Mots Restants

### Étape 1: Créer Nouvelles Subfamilies (si nécessaire)

Exemple : Ajouter une subfamily "Numbers"

```typescript
// Dans une nouvelle migration
const familyId = basicsFam.id;

await db.runAsync(
  `INSERT INTO level_labels (
    family_id,
    level_number,
    identity_id,
    display_title,
    icon_name,
    display_description,
    badge_text
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [familyId, 11, 'all', 'Numbers', 'numeric', 'One, two, three...', '']
);
```

### Étape 2: Ajouter les Mots

```typescript
// Format de base
const newWords = [
  ['ONE', 'Un', 'I have one cat.', 'J\'ai un chat.'],
  ['TWO', 'Deux', 'Two dogs are playing.', 'Deux chiens jouent.'],
  // ...
];

for (const [word, translation, example, exampleTranslation] of newWords) {
  const data = JSON.stringify({
    word,
    translation,
    example,
    exampleTranslation
  });

  await db.runAsync(
    `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
     VALUES (?, ?, 'word', ?, 'easy', 'core800', 'all')`,
    [familyId, 11, data] // 11 = ID de la subfamily "Numbers"
  );
}
```

### Étape 3: Organiser par Thème

**Suggestions de subfamilies pour les 700 mots suivants** :

| ID | Subfamily | Mots estimés |
|----|-----------|--------------|
| 11 | Numbers | 30 |
| 12 | Colors | 20 |
| 13 | Body Parts | 25 |
| 14 | Family Members | 20 |
| 15 | Actions (Advanced) | 50 |
| 16 | Emotions | 30 |
| 17 | Nature | 40 |
| 18 | Transportation | 30 |
| 19 | Jobs & Professions | 35 |
| 20 | Technology | 40 |
| 21 | Food & Cooking | 50 |
| 22 | Health | 35 |
| 23 | Education | 40 |
| 24 | Social Life | 45 |
| 25 | Business | 40 |
| 26-35 | Autres thèmes | 170 |

**Total : ~700 mots**

---

## 📋 Format Standard des Mots

### JSON Structure
```json
{
  "word": "HELLO",
  "translation": "Bonjour",
  "example": "Hello, how are you?",
  "exampleTranslation": "Bonjour, comment vas-tu?"
}
```

### Champs Additionnels (Optionnels)
```json
{
  "word": "CAT",
  "translation": "Chat",
  "example": "I have a black cat.",
  "exampleTranslation": "J'ai un chat noir.",
  "image": "🐱",
  "audio": "cat.mp3",
  "phonetic": "/kæt/",
  "difficulty": "easy",
  "synonyms": ["feline"],
  "antonyms": ["dog"]
}
```

---

## 🎮 Comment les Écrans Utilisent Cette Structure

### VocabularyExerciceScreen

**Navigation** :
```typescript
// L'écran reçoit ces paramètres
{
  familyId: 1,        // ID de la famille "salutations"
  subfamilyId: 2,     // ID de la subfamily "Essential Verbs"
  levelId: 1          // Niveau du Dashboard
}
```

**Chargement des mots** :
```typescript
// Hook useExerciseContent charge les mots
const { contentItems } = useExerciseContent<VocabData>(familyId, subfamilyId);

// SQL exécuté en arrière-plan
SELECT * FROM content
WHERE family_id = 1
AND level = 2
AND content_type = 'word'
```

**Résultat** : Tous les mots de la subfamily "Essential Verbs" (BE, HAVE, DO...)

---

## 🔍 Requêtes SQL Utiles

### Compter les mots par subfamily
```sql
SELECT
  l.display_title AS subfamily,
  COUNT(c.id) AS word_count
FROM content c
JOIN level_labels l ON c.family_id = l.family_id AND c.level = l.level_number
WHERE c.family_id = (SELECT id FROM families WHERE slug = 'salutations')
AND c.content_type = 'word'
GROUP BY l.display_title;
```

### Lister tous les mots d'une subfamily
```sql
SELECT
  json_extract(data, '$.word') AS word,
  json_extract(data, '$.translation') AS translation
FROM content
WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations')
AND level = 2  -- Subfamily "Essential Verbs"
AND content_type = 'word';
```

### Vérifier l'intégrité
```sql
-- Mots sans subfamily
SELECT COUNT(*) FROM content
WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations')
AND level NOT IN (SELECT level_number FROM level_labels WHERE family_id = content.family_id);
```

---

## 🧪 Tests

### Test 1: Vérifier les subfamilies
```bash
sqlite3 janacore.db "
  SELECT level_number, display_title
  FROM level_labels
  WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations');
"

# Résultat attendu : 10 lignes (subfamilies 1 à 10)
```

### Test 2: Compter les mots par subfamily
```bash
sqlite3 janacore.db "
  SELECT level, COUNT(*) AS count
  FROM content
  WHERE family_id = (SELECT id FROM families WHERE slug = 'salutations')
  GROUP BY level;
"

# Résultat attendu : distribution des 100 mots
```

### Test 3: Accéder aux mots dans l'app
```
1. Lancer l'app
2. Module Vocabulaire → Basics (👋)
3. Choisir "Pronouns" → Voir les 13 pronoms
4. Choisir "Essential Verbs" → Voir les 27 verbes
```

---

## 📊 Dashboard & Analytics

### Progression par Subfamily
```sql
SELECT
  l.display_title,
  p.completed,
  p.score,
  COUNT(c.id) AS total_words
FROM progress p
JOIN level_labels l ON p.family_id = l.family_id AND p.level = l.level_number
JOIN content c ON c.family_id = p.family_id AND c.level = p.level
WHERE p.user_id = ?
AND p.family_id = (SELECT id FROM families WHERE slug = 'salutations')
GROUP BY l.display_title;
```

---

## ✅ Checklist Migration

- [x] Migration 028 : 100 mots insérés
- [x] Migration 029 : 10 subfamilies créées
- [x] Réorganisation des 100 mots par subfamily
- [x] Structure documentée
- [ ] Ajouter mots 101-200
- [ ] Ajouter mots 201-300
- [ ] ...
- [ ] Compléter jusqu'à 800 mots

---

## 🎯 Prochaines Étapes

### Court Terme
1. Tester l'affichage dans l'app
2. Vérifier la navigation entre subfamilies
3. Valider que les 100 mots sont bien répartis

### Moyen Terme
1. Créer migration 030 pour mots 101-200
2. Ajouter subfamilies supplémentaires (Numbers, Colors, Body Parts...)
3. Compléter progressivement jusqu'à 800 mots

### Long Terme
1. Système de révision espacée (SRS) par subfamily
2. Statistiques détaillées par thème
3. Recommandations personnalisées

---

## 📚 Exemple Complet : Ajouter 50 Nouveaux Mots

```typescript
// Migration 030 : Ajouter subfamily "Numbers" avec 30 mots

export default createMigration(
  30,
  'add_numbers_subfamily',
  async (db: SQLite.SQLiteDatabase) => {
    const basicsFam = await db.getFirstAsync<{id: number}>(
      'SELECT id FROM families WHERE slug = "salutations"'
    );
    if (!basicsFam) return;

    const familyId = basicsFam.id;
    const subfamilyId = 11;

    // 1. Créer la subfamily
    await db.runAsync(
      `INSERT INTO level_labels (
        family_id, level_number, identity_id,
        display_title, icon_name, display_description, badge_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [familyId, subfamilyId, 'all', 'Numbers', 'numeric', 'One to thirty', '']
    );

    // 2. Ajouter les mots
    const numbers = [
      ['ONE', 'Un', 'I have one cat.', 'J\'ai un chat.'],
      ['TWO', 'Deux', 'Two dogs are here.', 'Deux chiens sont ici.'],
      ['THREE', 'Trois', 'Three birds in the sky.', 'Trois oiseaux dans le ciel.'],
      // ... jusqu'à THIRTY
    ];

    for (const [word, translation, example, exampleTranslation] of numbers) {
      const data = JSON.stringify({ word, translation, example, exampleTranslation });
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, 'word', ?, 'easy', 'core800', 'all')`,
        [familyId, subfamilyId, data]
      );
    }

    console.log('✅ Subfamily Numbers + 30 mots ajoutés');
  }
);
```

---

## 🎓 Conclusion

La structure est maintenant **scalable** et organisée :

- ✅ **1 Famille** : Basics (salutations)
- ✅ **10 Subfamilies** : Pronouns, Verbs, Prepositions...
- ✅ **100 Mots** : Répartis logiquement
- ✅ **Prêt pour 700 mots** : Structure extensible

**Il suffit de créer de nouvelles migrations en suivant le pattern ci-dessus !** 🚀

---

**Développé avec ❤️ par l'équipe JanaArchitect**
