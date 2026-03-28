# Guide d'ajout de contenu — Joud

> Ce fichier documente le format exact des données JSON pour chaque module d'exercice.
> Le contenu est stocké dans la table `content` (champ `data` = JSON stringifié).

---

## Structure de la table `content`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `module_slug` | TEXT | Slug du module (voir tableau ci-dessous) |
| `family_id` | INTEGER | ID de la famille (ex: 1 = Food & Drinks) |
| `subfamily_id` | INTEGER | ID de la sous-famille (ex: 1 = Le Salé) — 0 si pas de sous-famille |
| `target_audience` | TEXT | `primary` \| `college` \| `lycee` \| `adult` \| `all` |
| `data` | TEXT | JSON stringifié (voir format par module) |
| `order_index` | INTEGER | Ordre d'affichage dans la liste |

**Slugs par module :**

| Module | Slug |
|--------|------|
| Vocabulaire | `vocab` |
| Grammaire | `grammar` |
| Phrases | `phrase_types` |
| Lecture | `reading` |
| Dialogues | `dialogues` |
| Connecteurs | `connector` |
| Jeux de mots | `word_games` |
| Évaluation | `assessment` |

---

## 1. VOCABULAIRE (`vocab`)

```json
{
  "word": "apple",
  "translation": "pomme",
  "example": "I eat an apple every day.",
  "exampleTranslation": "Je mange une pomme tous les jours.",
  "audio": ""
}
```

| Champ | Requis | Description |
|-------|--------|-------------|
| `word` | ✅ | Mot anglais à apprendre |
| `translation` | ✅ | Traduction française |
| `example` | ✅ | Phrase exemple en anglais |
| `exampleTranslation` | ⬜ | Traduction de l'exemple |
| `audio` | ⬜ | Chemin fichier audio (laisser `""` si absent) |

---

## 2. GRAMMAIRE (`grammar`)

```json
{
  "title": "Present Simple",
  "rule": "We use the present simple for facts, habits and routines.",
  "simplified": "Pour les actions régulières, on ajoute -s avec he/she/it.",
  "examples": [
    "I play football every Sunday.",
    "She works at a hospital.",
    "They don't eat meat."
  ],
  "exercise": {
    "question": "Choose the correct form: She ___ to school every day.",
    "options": ["go", "goes", "going", "gone"],
    "correctAnswer": "goes"
  }
}
```

| Champ | Requis | Description |
|-------|--------|-------------|
| `title` | ✅ | Titre de la règle |
| `rule` | ✅ | Explication principale |
| `simplified` | ⬜ | Version simplifiée "En bref..." |
| `examples` | ✅ | Tableau de phrases exemples |
| `exercise.question` | ✅ | Question de l'exercice |
| `exercise.options` | ✅ | Tableau de réponses possibles (2–4) |
| `exercise.correctAnswer` | ✅ | Doit correspondre exactement à un élément de `options` |

---

## 3. PHRASES (`phrase_types`)

**Ce module a deux modes selon le public :**
- **Primary / Collège** → mode `blanks` (phrase à trous avec options)
- **Lycée / Adulte** → mode `free` (traduction libre)

### Mode Blanks (Primary, Collège)

```json
{
  "sentence": "He ___ to school every day.",
  "options": ["go", "goes", "going", "gone"],
  "correct_answer": "goes",
  "translation": "Il va à l'école tous les jours.",
  "explanation": "Avec he/she/it, on ajoute -s au verbe.",
  "tip": "💡 Présent simple : he/she/it → verbe + s"
}
```

### Mode Free (Lycée, Adulte)

```json
{
  "phrase_fr": "Je vais à l'école demain.",
  "phrase_en": "I will go to school tomorrow.",
  "build": "Subject + will + verb + complement",
  "explanation": "On utilise 'will' pour les intentions futures.",
  "tip": "☀️ Will = décision spontanée ou intention future simple."
}
```

| Champ | Mode | Requis | Description |
|-------|------|--------|-------------|
| `sentence` | blanks | ✅ | Phrase avec `___` comme emplacement |
| `options` | blanks | ✅ | Tableau de réponses (2–4 éléments) |
| `correct_answer` | blanks | ✅ | Réponse correcte (= un élément de `options`) |
| `phrase_fr` | free | ✅ | Phrase française à traduire |
| `phrase_en` | free | ✅ | Traduction anglaise attendue |
| `translation` | both | ⬜ | Traduction contextuelle (mode blanks) |
| `explanation` | both | ⬜ | Explication pédagogique (après validation) |
| `build` | free | ⬜ | Structure grammaticale (ex: S + V + C) |
| `tip` | both | ⬜ | Astuce contextuelle visible AVANT réponse |

> **Note `tip`** : affiché en permanence dans la carte. Ne mettre que sur les phrases où un contexte culturel/grammatical ajoute vraiment de la valeur.

---

## 4. LECTURE (`reading`)

> **Une ligne = un passage + une question.** Pour un texte avec 5 questions → 5 lignes avec le même `passage`.

```json
{
  "passage": "Marie lived in Paris for ten years. She loved the museums and the cafés. One day, she decided to move to the countryside to find peace.",
  "question_text": "Why did Marie decide to move to the countryside?",
  "options": ["She was bored", "To find peace", "She lost her job", "She got married"],
  "correct_answer": "To find peace",
  "hint": "Look at the last sentence."
}
```

| Champ | Requis | Description |
|-------|--------|-------------|
| `passage` | ✅ | Texte à lire (peut être le même sur plusieurs lignes) |
| `question_text` | ✅ | Question de compréhension |
| `options` | ✅ | Tableau de 4 réponses |
| `correct_answer` | ✅ | Doit correspondre exactement à un élément de `options` |
| `hint` | ⬜ | Indice optionnel |

---

## 5. DIALOGUES (`dialogues`)

> **Une ligne = un dialogue complet** (messages + questions).

```json
{
  "name": "At the Restaurant",
  "icon": "🍽️",
  "color": "#FF6B6B",
  "characters": [
    { "name": "Waiter", "color": "#2196F3" },
    { "name": "Emma", "color": "#4CAF50" }
  ],
  "messages": [
    { "speaker": "Waiter", "text": "Good evening! What would you like to order?" },
    { "speaker": "Emma", "text": "I'd like a salad and a glass of water, please." },
    { "speaker": "Waiter", "text": "Of course! Anything else?" },
    { "speaker": "Emma", "text": "No, that's all. Thank you." }
  ],
  "questions": [
    {
      "question": "What does Emma order to drink?",
      "options": ["Juice", "Coffee", "Water", "Tea"],
      "correctAnswer": 2
    },
    {
      "question": "How many items does Emma order?",
      "options": ["One", "Two", "Three", "Four"],
      "correctAnswer": 1
    }
  ]
}
```

| Champ | Requis | Description |
|-------|--------|-------------|
| `name` | ✅ | Titre du dialogue |
| `icon` | ⬜ | Emoji décoratif |
| `color` | ⬜ | Couleur hex du thème |
| `characters` | ✅ | Tableau de personnages avec `name` et `color` |
| `messages[].speaker` | ✅ | Doit correspondre à un `name` dans `characters` |
| `messages[].text` | ✅ | Réplique en anglais |
| `messages[].textFr` | ⬜ | Traduction française de la réplique |
| `questions[].question` | ✅ | Question de compréhension |
| `questions[].options` | ✅ | Tableau de 4 réponses |
| `questions[].correctAnswer` | ✅ | **Index** de la bonne réponse (0 = premier, 1 = deuxième...) |
| `questions[].hint` | ⬜ | Indice |

---

## 6. CONNECTEURS (`connector`)

> **Trois sous-types** — à préciser via le champ `content_type` lors du seed.

### 6a. Logic Links (`content_type: 'logic'`)

```json
{
  "sentence": "She studied hard ___ she failed the exam.",
  "options": ["because", "but", "and", "although"],
  "correctAnswer": "although",
  "translation": "Elle a étudié dur ___ elle a échoué l'examen."
}
```

### 6b. Sentence Fusion (`content_type: 'fusion'`)

```json
{
  "phrase1": "She was tired.",
  "phrase2": "She went to bed early.",
  "correctAnswer": "Since she was tired, she went to bed early.",
  "hint": "Use a subordinating conjunction.",
  "translation": "Elle était fatiguée. Elle s'est couchée tôt."
}
```

### 6c. Rephrasing (`content_type: 'rephrasing'`)

```json
{
  "baseSentence": "It is possible that it will rain tomorrow.",
  "instruction": "Rephrase using 'might'.",
  "correctAnswer": "It might rain tomorrow.",
  "translation": "Il est possible qu'il pleuve demain."
}
```

---

## 7. WORD GAMES (`word_games`)

> **8 types de jeux.** Le champ `type` détermine quelle carte est affichée.
> Le champ `target_audience` filtre les jeux disponibles par public :
> - `primary` : definition, audio_match, speed, blanks
> - `college` : + sentence, detective
> - `lycee` / `adult` : tous les 8

### 7a. Definition

```json
{
  "type": "definition",
  "word": "serendipity",
  "definition": "The occurrence of finding pleasant things by chance.",
  "options": ["Bad luck", "Finding things by chance", "A type of flower", "A French dessert"],
  "correctAnswer": "Finding things by chance"
}
```

### 7b. Blanks

```json
{
  "type": "blanks",
  "sentence": "She ___ to the gym every morning.",
  "options": ["go", "goes", "going", "went"],
  "correctAnswer": "goes",
  "hint": "Present simple + he/she/it"
}
```

### 7c. Sentence (Reorder)

```json
{
  "type": "sentence",
  "words": ["always", "I", "coffee", "drink", "morning", "in", "the"],
  "correctOrder": ["I", "always", "drink", "coffee", "in", "the", "morning"],
  "translation": "Je bois toujours du café le matin."
}
```

### 7d. Speed Match

```json
{
  "type": "speed",
  "pairs": [
    { "english": "apple", "french": "pomme" },
    { "english": "bread", "french": "pain" },
    { "english": "water", "french": "eau" },
    { "english": "milk", "french": "lait" }
  ],
  "timeLimit": 30
}
```

### 7e. Detective (Find the error)

```json
{
  "type": "detective",
  "sentence": "She go to school every day.",
  "errorWordIndex": 1,
  "correctWord": "goes",
  "explanation": "With she/he/it, use the -s form: goes."
}
```

> `errorWordIndex` = index du mot incorrect dans la phrase (0 = premier mot).

### 7f. Audio Match

```json
{
  "type": "audio_match",
  "pairs": [
    { "word": "apple", "audio": "apple.mp3" },
    { "word": "bread", "audio": "bread.mp3" },
    { "word": "milk", "audio": "milk.mp3" }
  ],
  "timeLimit": 30
}
```

### 7g. Reply (Situational)

```json
{
  "type": "reply",
  "situation": "Your colleague asks: 'Are you coming to the meeting?'",
  "prompt": "You want to confirm you'll be there.",
  "options": [
    "Yes, I'll be there.",
    "I don't know you.",
    "The meeting is cancelled.",
    "What meeting?"
  ],
  "correctAnswer": "Yes, I'll be there.",
  "explanation": "Polite confirmation in a professional context."
}
```

### 7h. Transformer (Word morphology)

```json
{
  "type": "transformer",
  "rootWord": "happy",
  "sentence": "She looked ___ when she heard the news.",
  "options": ["happy", "happily", "happiness", "happier"],
  "correctAnswer": "happily",
  "hint": "We need an adverb here (modifies 'looked').",
  "translation": "Elle avait l'air ___ quand elle a entendu la nouvelle."
}
```

---

## Règles générales

### `target_audience`
Chaque ligne de contenu cible un public spécifique :

| Valeur | Correspond à |
|--------|-------------|
| `primary` | École primaire |
| `college` | Collège |
| `lycee` | Lycée |
| `adult` | Adultes |
| `all` | Tous les publics |

> Pour les modules qui s'adaptent par public (Phrases, Word Games), préférer des lignes séparées par audience plutôt qu'`all`.

### `subfamily_id`
- Modules **avec** sous-familles : `vocab`, `grammar`, `phrase_types`, `reading`, `dialogues` → `subfamily_id` obligatoire (≥ 1)
- Modules **sans** sous-familles : `word_games`, `connector`, `assessment` → `subfamily_id = 0`

### Ordre des items
`order_index` détermine l'ordre d'affichage. Commencer à `1`, incrémenter de 1.

### Caractère `___`
Utilisé comme placeholder de blank dans :
- `phrase_types` (mode blanks) : champ `sentence`
- `word_games` type `blanks` : champ `sentence`
- `word_games` type `transformer` : champ `sentence`
- `connector` type `logic` : champ `sentence`
- `grammar` : champ `exercise.question` (optionnel)
