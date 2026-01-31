# ✅ INFRASTRUCTURE DATA PRÊTE !

Toute l'infrastructure pour ajouter de la data par **public** et par **niveau** est maintenant prête.

---

## 🎯 CE QUI A ÉTÉ FAIT

### 1. ✅ **Migration 010 : Ajout colonne `target_audience`**
- Fichier : `src/database/migrations/010_add_target_audience_to_content.ts`
- Ajoute la colonne `target_audience` à la table `content`
- Valeurs possibles : `'primary'`, `'college'`, `'lycee'`, `'adult'`, `'all'`
- Index créé pour optimiser les requêtes

### 2. ✅ **Schema mis à jour**
- Fichier : `src/database/schema.ts`
- Interface `Content` modifiée avec le nouveau champ `target_audience`
- Nouveaux types de contenu ajoutés : `sentence_blanks`, `reading_passage`, `grammar_rule`, `syntax`

### 3. ✅ **Queries modifiées**
- Fichier : `src/database/queries.ts`
- `getContentByFamilyAndLevel()` : Filtre maintenant par `target_audience`
- `insertContent()` : Insère maintenant le champ `target_audience`
- `getDailyReviewWords()` : Filtre par `target_audience`
- `getSpacedReviewWords()` : Filtre par `target_audience`

### 4. ✅ **Familles ajoutées**
- Fichier : `src/database/migrations/003_seed_families.ts`
- **Fast Vocabulary** : business_essentials, travel_essentials, tech_essentials
- **Phrases** : restaurant, shopping, daily_life
- **Dialogues** : at_airport, job_interview, meeting_friends
- **Grammar** : present, future, past
- **Reading** : short_stories, articles, emails
- **Connector** : logical_links, sentence_fusion, rephrasing

### 5. ✅ **6 fichiers de seed créés** (VIDES, prêts à remplir)

| Fichier | Module | Public(s) |
|---------|--------|-----------|
| `011_seed_content_fastvocab.ts` | Fast Vocabulary | **adult uniquement** |
| `012_seed_content_phrases.ts` | Phrases | **tous** (primary, college, lycee, adult) |
| `013_seed_content_dialogues.ts` | Dialogues | **tous** |
| `014_seed_content_grammar.ts` | Grammar | **tous** |
| `015_seed_content_reading.ts` | Reading | **tous** |
| `016_seed_content_connector.ts` | Connector | **lycee uniquement** |

### 6. ✅ **Migrations enregistrées**
- Fichier : `src/database/init.ts`
- Toutes les nouvelles migrations ajoutées et ordonnées

---

## 📝 COMMENT REMPLIR LA DATA

Chaque fichier de seed a cette structure :

```typescript
const contentSeed = [
  // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

  [
    businessId,  // ID de la famille (récupéré automatiquement)
    5,           // Niveau (1-4 pour primary/college/lycee, 1-7 pour adult)
    'word',      // Type de contenu
    JSON.stringify({
      word: 'Meeting',
      translation: 'Réunion',
      example: null,
      image: '👥',
      audio: null
    }),
    'easy',      // Difficulté : 'easy', 'medium', 'hard'
    'business,work',  // Tags (séparés par virgule)
    'adult'      // ⭐ PUBLIC : 'primary', 'college', 'lycee', 'adult', ou 'all'
  ],

  // Ajoute autant de lignes que tu veux ici...
];
```

---

## 🎨 STRUCTURE PAR PUBLIC

### **Primary** (Primaire)
- **Niveaux** : 1, 2, 3, 4
- **Modules** : Vocabulary, Phrases, Dialogues, Grammar, Reading, WordGames, Assessment
- **Vocabulaire** : Mots simples, quotidiens (cat, dog, red, blue)
- **Exemples** :
  ```typescript
  target_audience: 'primary'
  level: 1  // ou 2, 3, 4
  ```

### **College** (Collège)
- **Niveaux** : 1, 2, 3, 4
- **Modules** : Vocabulary, Phrases, Dialogues, Grammar, Reading, WordGames, Assessment
- **Vocabulaire** : Mots moyens (ambitious, curious, generous)
- **Exemples** :
  ```typescript
  target_audience: 'college'
  level: 1  // ou 2, 3, 4
  ```

### **Lycee** (Lycée)
- **Niveaux** : 1, 2, 3, 4
- **Modules** : Vocabulary, Phrases, Dialogues, Grammar, Reading, WordGames, Assessment, **Connector**
- **Vocabulaire** : Mots avancés (resilient, meticulous, pragmatic)
- **Exemples** :
  ```typescript
  target_audience: 'lycee'
  level: 1  // ou 2, 3, 4
  ```

### **Adult** (Adulte)
- **Niveaux** : 1, 2, 3, 4, 5, 6, 7
- **Modules** : Vocabulary, Phrases, Dialogues, Grammar, Reading, WordGames, Assessment, **Fast Vocab**
- **Vocabulaire** : Mots professionnels (stakeholder, synergy, leverage)
- **Exemples** :
  ```typescript
  target_audience: 'adult'
  level: 5  // ou 1, 2, 3, 4, 6, 7
  ```

### **All** (Tous)
- Contenu partagé par tous les publics
- Utilisé pour les contenus génériques
- **Exemples** :
  ```typescript
  target_audience: 'all'
  level: 1  // s'affichera pour primary/college/lycee/adult niveau 1
  ```

---

## 📚 EXEMPLES CONCRETS PAR MODULE

### **Fast Vocabulary (adult uniquement)**
```typescript
// 011_seed_content_fastvocab.ts
[
  businessId,
  5,  // Niveau 5 (adulte)
  'word',
  JSON.stringify({
    word: 'Meeting',
    translation: 'Réunion',
    example: null,  // Pas d'exemple en Fast Mode
    image: '👥',
    audio: null
  }),
  'easy',
  'business,work',
  'adult'  // ⭐ IMPORTANT : adult uniquement
],
```

### **Phrases (tous les publics)**
```typescript
// 012_seed_content_phrases.ts

// PRIMARY niveau 1
[
  restaurantId,
  1,
  'sentence_blanks',
  JSON.stringify({
    sentence: 'I ___ a pizza, please.',
    options: ['would like', 'want', 'need', 'take'],
    correct_answer: 'would like',
    translation: 'Je voudrais une pizza, s\'il vous plaît.',
    explanation: '"Would like" est plus poli que "want"',
    type: 'affirmative'
  }),
  'easy',
  'restaurant,polite',
  'primary'  // ⭐ Pour primary
],

// COLLEGE niveau 1
[
  restaurantId,
  1,
  'sentence_blanks',
  JSON.stringify({
    sentence: 'Could you ___ the menu, please?',
    options: ['bring me', 'give me', 'show me', 'take me'],
    correct_answer: 'bring me',
    translation: 'Pourriez-vous m\'apporter le menu, s\'il vous plaît ?',
    explanation: '"Could you" est la forme polie pour demander',
    type: 'interrogative'
  }),
  'medium',
  'restaurant,polite',
  'college'  // ⭐ Pour college
],
```

### **Dialogues (tous les publics)**
```typescript
// 013_seed_content_dialogues.ts

// PRIMARY niveau 1
[
  airportId,
  1,
  'dialogue',
  JSON.stringify({
    title: 'At the Airport',
    dialogue: [
      { speaker: 'Agent', text: 'Hello! Passport please.' },
      { speaker: 'You', text: 'Here you go.' }
    ],
    questions: [
      {
        question: 'What does the agent ask for?',
        options: ['Passport', 'Ticket', 'Money', 'Bag'],
        correct_answer: 'Passport'
      }
    ]
  }),
  'easy',
  'travel,airport',
  'primary'  // ⭐ Pour primary
],

// ADULT niveau 5
[
  interviewId,
  5,
  'dialogue',
  JSON.stringify({
    title: 'Job Interview',
    dialogue: [
      { speaker: 'Interviewer', text: 'Tell me about your professional background.' },
      { speaker: 'You', text: 'I have 10 years of experience in project management...' }
    ],
    questions: [
      {
        question: 'What is the topic of the interview?',
        options: ['Experience', 'Salary', 'Hobbies', 'Family'],
        correct_answer: 'Experience'
      }
    ]
  }),
  'hard',
  'job,professional',
  'adult'  // ⭐ Pour adult
],
```

### **Grammar (tous les publics)**
```typescript
// 014_seed_content_grammar.ts

// PRIMARY niveau 1
[
  presentId,
  1,
  'grammar_rule',
  JSON.stringify({
    rule_title: 'Present Simple',
    explanation: 'Le présent simple exprime une habitude.',
    examples: [
      'I eat breakfast every day.',
      'She works at school.'
    ],
    exercises: [
      {
        question: 'He ___ to work by bus.',
        options: ['go', 'goes', 'going', 'gone'],
        correct_answer: 'goes',
        explanation: 'Avec he/she/it, on ajoute -s'
      }
    ]
  }),
  'easy',
  'present,verbs',
  'primary'  // ⭐ Pour primary
],

// LYCEE niveau 3
[
  presentId,
  3,
  'grammar_rule',
  JSON.stringify({
    rule_title: 'Present Perfect Continuous',
    explanation: 'Exprime une action qui a commencé dans le passé et continue.',
    examples: [
      'I have been working here for 5 years.',
      'They have been studying since morning.'
    ],
    exercises: [
      {
        question: 'She ___ for an hour.',
        options: ['has been running', 'have been running', 'is running', 'runs'],
        correct_answer: 'has been running',
        explanation: 'Present perfect continuous avec "she" = has been + -ing'
      }
    ]
  }),
  'hard',
  'present,continuous,perfect',
  'lycee'  // ⭐ Pour lycée
],
```

### **Reading (tous les publics)**
```typescript
// 015_seed_content_reading.ts

// PRIMARY niveau 1
[
  storiesId,
  1,
  'reading_passage',
  JSON.stringify({
    title: 'My Cat',
    passage: 'I have a cat. Her name is Luna. She is black and white. Luna likes to play with a ball. She sleeps on my bed.',
    question_text: 'What color is the cat?',
    options: ['Black and white', 'Brown', 'Grey', 'Orange'],
    correct_answer: 'Black and white'
  }),
  'easy',
  'animals,pets',
  'primary'  // ⭐ Pour primary
],

// ADULT niveau 5
[
  articlesId,
  5,
  'reading_passage',
  JSON.stringify({
    title: 'The Future of Remote Work',
    passage: 'The COVID-19 pandemic has accelerated the adoption of remote work across industries. Companies that once required physical presence are now embracing hybrid models. This shift has led to increased productivity for some, while others struggle with work-life balance. Experts predict that remote work will become the norm for knowledge workers, fundamentally changing urban development and real estate markets.',
    question_text: 'What has the pandemic accelerated?',
    options: [
      'Remote work adoption',
      'Office construction',
      'Employee turnover',
      'Commute times'
    ],
    correct_answer: 'Remote work adoption'
  }),
  'hard',
  'business,technology,work',
  'adult'  // ⭐ Pour adult
],
```

### **Connector (lycée uniquement)**
```typescript
// 016_seed_content_connector.ts

// LYCEE niveau 2
[
  logicalLinksId,
  2,
  'logic',
  JSON.stringify({
    question: 'I studied hard, ___ I failed the exam.',
    options: ['therefore', 'however', 'moreover', 'furthermore'],
    correct_answer: 'however',
    explanation: '"However" exprime une opposition/contraste'
  }),
  'medium',
  'connectors,logic,contrast',
  'lycee'  // ⭐ IMPORTANT : lycée uniquement
],
```

---

## 🚀 COMMENT TESTER

1. **Ouvre un fichier de seed** (ex: `012_seed_content_phrases.ts`)
2. **Ajoute quelques lignes de data** dans le tableau `contentSeed`
3. **Sauvegarde le fichier**
4. **Relance l'app** : `npm start`
5. Les migrations s'exécutent automatiquement
6. **Teste dans l'app** :
   - Change d'audience (primary, college, lycee, adult)
   - Va sur le module correspondant
   - Vérifie que le contenu affiché correspond bien au public

---

## 📊 RECOMMANDATIONS

### **Pour tester rapidement**
- Ajoute **5-10 items par famille** pour chaque public
- Teste les 4 publics pour voir la différence
- Vérifie que le filtrage fonctionne

### **Ordre de remplissage suggéré**
1. **Dialogues** (le plus visuel)
2. **Reading** (passages courts)
3. **Phrases** (restaurant, shopping)
4. **Fast Vocab** (business pour adultes)
5. **Grammar** (règles + exercices)
6. **Connector** (lycée uniquement)

### **Quantité de contenu par public**

| Module | Primary | College | Lycee | Adult |
|--------|---------|---------|-------|-------|
| Vocabulary | 200 mots | 300 mots | 400 mots | 500 mots |
| Fast Vocab | - | - | - | 500 mots |
| Phrases | 50 phrases | 75 phrases | 100 phrases | 150 phrases |
| Dialogues | 10 dialogues | 15 dialogues | 20 dialogues | 25 dialogues |
| Grammar | 20 règles | 30 règles | 40 règles | 50 règles |
| Reading | 20 passages | 30 passages | 40 passages | 50 passages |
| Connector | - | - | 30 exercices | - |

---

## ⚠️ IMPORTANT

### **Valeurs target_audience**
- `'primary'` : Primaire (6-11 ans)
- `'college'` : Collège (12-15 ans)
- `'lycee'` : Lycée (16-18 ans)
- `'adult'` : Adulte (18+ ans)
- `'all'` : Tous les publics

### **Niveaux par public**
- Primary, College, Lycee : **1, 2, 3, 4**
- Adult : **1, 2, 3, 4, 5, 6, 7**

### **Modules exclusifs**
- `fastvocab` → **adult uniquement**
- `connector` → **lycee uniquement**

---

**Tout est prêt ! Tu peux maintenant remplir les fichiers de seed avec ta vraie data ! 🚀**
