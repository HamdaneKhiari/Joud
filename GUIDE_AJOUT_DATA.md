# 📝 GUIDE D'AJOUT DE DATA - TOUS LES MODULES

Ce guide te montre **exactement où et comment ajouter du contenu** pour tester chaque module de Joud.

---

## 🗂️ STRUCTURE GÉNÉRALE

Pour ajouter du contenu :
1. **Créer une famille** dans `003_seed_families.ts` (si elle n'existe pas)
2. **Ajouter du contenu** dans le fichier de migration approprié

---

## 📚 MODULE 1 : VOCABULAIRE (vocab)

### **Fichier de migration** : `004_seed_content_vocab.ts`

### **Familles existantes** (dans 003_seed_families.ts) :
- `salutations` (id=1) - 👋 Salutations
- `family` (id=2) - 👨‍👩‍👧‍👦 Famille
- `colors` (id=3) - 🎨 Couleurs
- `food_drinks` (id=4) - 🍽️ Food & Drinks

### **Structure JSON** :
```typescript
[
  family_id,           // ID de la famille (ex: 4 pour food_drinks)
  level,               // 1, 2, 3, ou 4
  'word',              // Type de contenu
  JSON.stringify({
    word: 'Apple',               // Mot en anglais
    translation: 'Pomme',        // Traduction française
    example: 'I eat an apple every day.',  // Phrase d'exemple
    image: '🍎',                 // Emoji (optionnel)
    audio: null                  // Fichier audio (optionnel)
  }),
  'easy',              // Difficulté : 'easy', 'medium', 'hard'
  'food,fruit'         // Tags (séparés par virgule)
]
```

### **Exemple complet** :
```typescript
// Dans 004_seed_content_vocab.ts, ajouter dans le tableau contentSeed :
[
  3,  // colors
  1,
  'word',
  JSON.stringify({
    word: 'Blue',
    translation: 'Bleu',
    example: 'The sky is blue today.',
    image: '🔵',
    audio: null
  }),
  'easy',
  'colors,basic'
],
```

---

## ⚡ MODULE 2 : FAST VOCABULARY (fastvocab)

### **Fichier de migration** : **À CRÉER** `010_seed_content_fastvocab.ts`

### **Familles à créer** (dans 003_seed_families.ts) :
```typescript
// Ajouter dans familiesSeed :
['business_essentials', 'fastvocab', 'Business Essentials', 'briefcase', '💼', '50 mots business', 1],
['travel_essentials', 'fastvocab', 'Travel Essentials', 'airplane', '✈️', '50 mots voyage', 2],
['tech_essentials', 'fastvocab', 'Tech Essentials', 'laptop', '💻', '50 mots tech', 3],
```

### **Structure JSON** :
```typescript
// IDENTIQUE à Vocabulary, mais sans exemple (il sera masqué par le composant)
[
  family_id,
  level,
  'word',
  JSON.stringify({
    word: 'Meeting',
    translation: 'Réunion',
    example: null,           // Peut être null ou ignoré
    image: '👥',
    audio: null
  }),
  'easy',
  'business,professional'
]
```

### **Fichier à créer** : `010_seed_content_fastvocab.ts`
```typescript
import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  10,
  'seed_content_fastvocab',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer l'ID de la famille business_essentials
    const family = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'business_essentials'`
    );
    const familyId = family?.id || 1;

    const contentSeed = [
      [
        familyId,
        5,  // Niveau 5 (adulte)
        'word',
        JSON.stringify({
          word: 'Meeting',
          translation: 'Réunion',
          example: null,
          image: '👥',
          audio: null
        }),
        'easy',
        'business'
      ],
      // ... ajouter 50+ mots business
    ];

    await db.runAsync('DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "fastvocab")');

    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log('[Migration 010] ✓ Fast Vocabulary content seeded');
  },
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "fastvocab")');
    console.log('[Migration 010] ✓ Fast Vocabulary content cleared');
  }
);
```

**N'oublie pas** d'ajouter cette migration dans `runner.ts` :
```typescript
import migration010 from './010_seed_content_fastvocab';

const migrations = [
  // ... autres migrations
  migration010,
];
```

---

## 🎮 MODULE 3 : WORD GAMES (word_games)

### **Fichier de migration** : `005_seed_content_wordgames.ts`

### **Familles existantes** :
- `quick_match` (⚡ Quick Match)
- `grammar_detective` (🔍 Grammar Detective)
- `definition_master` (📖 Definition Master)

### **5 Types de jeux** :

#### **1. DEFINITION (QCM)**
```typescript
[
  family_id,
  level,
  'definition',
  JSON.stringify({
    word: 'Generous',
    definition: 'Someone who gives freely',
    options: ['Generous', 'Selfish', 'Lazy', 'Angry'],
    correct_answer: 'Generous'
  }),
  'medium',
  'adjectives'
]
```

#### **2. BLANKS (Phrases à trous)**
```typescript
[
  family_id,
  level,
  'blanks',
  JSON.stringify({
    sentence: 'She ___ to school every day.',
    options: ['goes', 'go', 'going', 'went'],
    correct_answer: 'goes',
    explanation: 'Present simple with "she" uses "goes"'
  }),
  'easy',
  'verbs,present'
]
```

#### **3. DETECTIVE (Trouver l'erreur)**
```typescript
[
  family_id,
  level,
  'detective',
  JSON.stringify({
    sentence: 'He don't like coffee',
    error_word: 'don't',
    correction: 'doesn't',
    explanation: 'Use "doesn\'t" with he/she/it'
  }),
  'medium',
  'grammar'
]
```

#### **4. IDIOMS (Expressions)**
```typescript
[
  family_id,
  level,
  'idioms',
  JSON.stringify({
    idiom: 'Break the ice',
    meaning: 'Lancer la conversation',
    example: 'He told a joke to break the ice.',
    options: [
      'Lancer la conversation',
      'Casser de la glace',
      'Arrêter une dispute',
      'Partir en vacances'
    ],
    correct_answer: 'Lancer la conversation'
  }),
  'hard',
  'expressions'
]
```

#### **5. SYNTAX (Réorganiser)**
```typescript
[
  family_id,
  level,
  'syntax',
  JSON.stringify({
    scrambled: ['is', 'book', 'This', 'interesting', 'very'],
    correct_order: ['This', 'book', 'is', 'very', 'interesting'],
    sentence: 'This book is very interesting'
  }),
  'medium',
  'syntax,order'
]
```

---

## 📖 MODULE 4 : PHRASES (phrase_types)

### **Fichier de migration** : **À CRÉER** `011_seed_content_phrases.ts`

### **Familles existantes** :
- `restaurant` (🍽️ Au Restaurant)

### **Structure JSON** :
```typescript
[
  family_id,
  level,
  'sentence_blanks',
  JSON.stringify({
    sentence: 'I ___ a coffee, please.',
    options: ['would like', 'want', 'need', 'have'],
    correct_answer: 'would like',
    translation: 'Je voudrais un café, s\'il vous plaît.',
    explanation: '"Would like" est plus poli que "want"',
    type: 'affirmative'  // ou 'interrogative', 'negative'
  }),
  'easy',
  'restaurant,polite'
]
```

---

## 🗣️ MODULE 5 : DIALOGUES (dialogues)

### **Fichier de migration** : **À CRÉER** `012_seed_content_dialogues.ts`

### **Familles à créer** (dans 003_seed_families.ts) :
```typescript
['at_airport', 'dialogues', 'At the Airport', 'airplane', '✈️', 'Dialogue à l\'aéroport', 1],
['job_interview', 'dialogues', 'Job Interview', 'account-tie', '💼', 'Entretien d\'embauche', 2],
```

### **Structure JSON** :
```typescript
[
  family_id,
  level,
  'dialogue',
  JSON.stringify({
    title: 'At the Airport',
    dialogue: [
      { speaker: 'Agent', text: 'Good morning! Passport please.' },
      { speaker: 'You', text: 'Here you go.' },
      { speaker: 'Agent', text: 'Thank you. Where are you traveling today?' },
      { speaker: 'You', text: 'I\'m going to Paris.' }
    ],
    questions: [
      {
        question: 'Where is the traveler going?',
        options: ['Paris', 'London', 'New York', 'Berlin'],
        correct_answer: 'Paris'
      },
      {
        question: 'What does the agent ask for first?',
        options: ['Passport', 'Ticket', 'Money', 'Bag'],
        correct_answer: 'Passport'
      }
    ]
  }),
  'medium',
  'travel,airport'
]
```

---

## 📚 MODULE 6 : GRAMMAIRE (grammar)

### **Fichier de migration** : **À CRÉER** `013_seed_content_grammar.ts`

### **Familles existantes** :
- `present` (⏰ Présent)
- `future` (🚀 Futur)

### **Structure JSON** :
```typescript
[
  family_id,
  level,
  'grammar_rule',
  JSON.stringify({
    rule_title: 'Present Simple',
    explanation: 'Le présent simple exprime une habitude ou une vérité générale.',
    examples: [
      'I eat breakfast every day.',
      'She works at a hospital.',
      'They don\'t like pizza.'
    ],
    exercises: [
      {
        question: 'He ___ to work by bus.',
        options: ['go', 'goes', 'going', 'gone'],
        correct_answer: 'goes',
        explanation: 'Avec he/she/it, on ajoute -s ou -es'
      }
    ]
  }),
  'easy',
  'present,verbs'
]
```

---

## 📖 MODULE 7 : LECTURE (reading)

### **Fichier de migration** : **À CRÉER** `014_seed_content_reading.ts`

### **Familles à créer** (dans 003_seed_families.ts) :
```typescript
['short_stories', 'reading', 'Short Stories', 'book-open-page-variant', '📖', 'Histoires courtes', 1],
['articles', 'reading', 'Articles', 'newspaper', '📰', 'Articles de presse', 2],
```

### **Structure JSON** :
```typescript
[
  family_id,
  level,
  'reading_passage',
  JSON.stringify({
    title: 'A Day at the Beach',
    passage: 'Last summer, my family and I went to the beach. The weather was perfect. The sun was shining and the water was warm. We built sandcastles and played volleyball. In the evening, we watched the beautiful sunset.',
    question_text: 'What did they build at the beach?',
    options: ['Sandcastles', 'Houses', 'Boats', 'Towers'],
    correct_answer: 'Sandcastles'
  }),
  'easy',
  'vacation,beach'
]
```

**Important** : ReadingCard attend `passage` et `question_text` (vérifié dans ReadingExerciseScreen.tsx:54)

---

## 🔗 MODULE 8 : CONNECTOR (connector - lycée)

### **Fichier de migration** : **À CRÉER** `015_seed_content_connector.ts`

### **Familles existantes** :
- `logical_links` (🔗 Logical Links)
- `sentence_fusion` (🔀 Sentence Fusion)
- `rephrasing` (♻️ Rephrasing)

### **Structure JSON** (type: logic) :
```typescript
[
  family_id,
  level,
  'logic',  // ou autre type selon ConnectorCardRenderer
  JSON.stringify({
    question: 'Choose the correct connector: I studied hard, ___ I failed the exam.',
    options: ['therefore', 'however', 'moreover', 'furthermore'],
    correct_answer: 'however',
    explanation: '"However" exprime une opposition/contraste'
  }),
  'hard',
  'connectors,logic'
]
```

---

## 🎯 MODULE 9 : ASSESSMENT (assessment)

### **Fichier de migration** : `006_seed_content_assessment.ts` ✅ **Déjà existant**

### **Famille existante** :
- `assessment_pool` (🎯 Assessment Pool)

### **Structure JSON** :
```typescript
[
  family_id,
  level,
  'assessment_question',
  JSON.stringify({
    question: 'What is the past tense of "go"?',
    options: ['goed', 'went', 'gone', 'going'],
    correct_answer: 'went',
    explanation: '"Went" est le passé simple de "go"'
  }),
  'medium',
  'verbs,past'
]
```

---

## 📊 RÉSUMÉ DES FICHIERS À CRÉER

| Module | Fichier à créer | Priorité |
|--------|----------------|----------|
| ✅ Vocabulary | `004_seed_content_vocab.ts` | Déjà existant |
| ✅ WordGames | `005_seed_content_wordgames.ts` | Déjà existant |
| ✅ Assessment | `006_seed_content_assessment.ts` | Déjà existant |
| 🔴 Fast Vocab | `010_seed_content_fastvocab.ts` | **Haute** (adulte) |
| 🔴 Phrases | `011_seed_content_phrases.ts` | **Haute** (tous) |
| 🔴 Dialogues | `012_seed_content_dialogues.ts` | **Haute** (tous) |
| 🔴 Grammar | `013_seed_content_grammar.ts` | **Moyenne** |
| 🔴 Reading | `014_seed_content_reading.ts` | **Moyenne** |
| 🔴 Connector | `015_seed_content_connector.ts` | **Basse** (lycée only) |

---

## 🚀 PROCÉDURE D'AJOUT

### **Étape 1 : Ajouter une famille** (si nécessaire)

Éditer `003_seed_families.ts` :
```typescript
const familiesSeed = [
  // ... familles existantes
  ['ma_nouvelle_famille', 'mon_module', 'Mon Titre', 'icon-name', '🎯', 'Description', 1],
];
```

### **Étape 2 : Créer le fichier de migration**

Créer `01X_seed_content_XXX.ts` :
```typescript
import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  10,  // Numéro de migration
  'seed_content_XXX',
  async (db: SQLite.SQLiteDatabase) => {
    const contentSeed = [
      // ... ton contenu ici
    ];

    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log('[Migration 01X] ✓ Content seeded');
  },
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM content WHERE ...');
    console.log('[Migration 01X] ✓ Content cleared');
  }
);
```

### **Étape 3 : Enregistrer la migration**

Éditer `runner.ts` :
```typescript
import migration010 from './010_seed_content_fastvocab';

const migrations = [
  migration001,
  // ...
  migration009,
  migration010,  // ← Ajouter ici
];
```

### **Étape 4 : Tester**

1. Supprimer la DB (si nécessaire) : Supprimer le fichier SQLite dans le dossier de l'app
2. Relancer l'app : `npm start`
3. Les migrations s'exécutent automatiquement au démarrage

---

## 🎯 RECOMMANDATIONS

### **Pour tester rapidement** :
1. Créer **1-2 familles par module**
2. Ajouter **5-10 items par famille**
3. Tester l'affichage et la validation

### **Ordre suggéré** :
1. **Dialogues** (plus visuel, facile à tester)
2. **Reading** (passages courts)
3. **Phrases** (restaurant, vie quotidienne)
4. **Fast Vocab** (business, voyage)
5. **Grammar** (règles + exercices)
6. **Connector** (lycée uniquement)

### **Contenu réaliste** :
- **Vocabulaire** : 20-30 mots par famille
- **WordGames** : 10-15 questions par jeu
- **Dialogues** : 3-5 dialogues par famille (2-3 questions chacun)
- **Reading** : 5-10 passages par famille
- **Grammar** : 3-5 règles + 10 exercices par règle
- **Fast Vocab** : 50-70 mots par thème (business, voyage, tech)

---

**Bon courage pour l'ajout de data ! 🚀**
