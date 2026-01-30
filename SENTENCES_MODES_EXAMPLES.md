# 📝 Sentences Exercise - Dual Mode Examples

Ce fichier contient des exemples de data pour tester les **2 modes** de l'exercice Sentences.

---

## 🎯 Mode BLANKS (Primaire)

**Pour les enfants de primaire** : système de choix multiples avec phrase à trous.

### Exemple 1 : Verbe HAVE/HAS
```json
{
  "mode": "blanks",
  "sentence_with_blank": "I ___ a cat",
  "options": ["have", "has", "had", "having"],
  "correctAnswer": "have",
  "translation": "J'ai un chat",
  "explanation": "Avec 'I', on utilise toujours 'have' au présent, jamais 'has'."
}
```

### Exemple 2 : Verbe BE
```json
{
  "mode": "blanks",
  "sentence_with_blank": "She ___ happy",
  "options": ["is", "am", "are", "be"],
  "correctAnswer": "is",
  "translation": "Elle est heureuse",
  "explanation": "Avec 'She/He/It', on utilise 'is' au présent."
}
```

### Exemple 3 : Article A/AN
```json
{
  "mode": "blanks",
  "sentence_with_blank": "I want ___ apple",
  "options": ["a", "an", "the", "one"],
  "correctAnswer": "an",
  "translation": "Je veux une pomme",
  "explanation": "On utilise 'an' devant un mot qui commence par une voyelle (a, e, i, o, u)."
}
```

### Exemple 4 : DO/DOES
```json
{
  "mode": "blanks",
  "sentence_with_blank": "He ___ not like pizza",
  "options": ["do", "does", "did", "doing"],
  "correctAnswer": "does",
  "translation": "Il n'aime pas la pizza",
  "explanation": "Avec 'He/She/It', on utilise 'does' pour former la négation."
}
```

---

## ✍️ Mode FREE (Collège, Lycée, Adulte)

**Pour les niveaux plus avancés** : traduction libre avec auto-correction bienveillante.

### Exemple 1 : Présent simple
```json
{
  "mode": "free",
  "phrase_fr": "J'ai un chat",
  "phrase_en": "I have a cat",
  "concretement": "C'est la forme la plus simple du présent. Le sujet 'I' est toujours suivi de la base verbale 'have' sans modification.",
  "build": "Sujet (I) + Verbe (have) + Article (a) + Nom (cat)"
}
```

### Exemple 2 : Présent continu
```json
{
  "mode": "free",
  "phrase_fr": "Je mange une pomme",
  "phrase_en": "I am eating an apple",
  "concretement": "Le présent continu exprime une action en cours. On utilise BE (am/is/are) + verbe-ING.",
  "build": "Sujet (I) + BE (am) + Verbe-ING (eating) + Article (an) + Nom (apple)"
}
```

### Exemple 3 : Question au présent
```json
{
  "mode": "free",
  "phrase_fr": "Aimes-tu le chocolat ?",
  "phrase_en": "Do you like chocolate?",
  "concretement": "Pour poser une question au présent simple, on utilise DO/DOES en début de phrase, suivi du sujet et du verbe à l'infinitif.",
  "build": "Auxiliaire (Do) + Sujet (you) + Verbe (like) + Nom (chocolate) + ?"
}
```

### Exemple 4 : Passé simple
```json
{
  "mode": "free",
  "phrase_fr": "J'ai mangé une pomme hier",
  "phrase_en": "I ate an apple yesterday",
  "concretement": "Le passé simple (preterit) exprime une action terminée dans le passé. 'Ate' est la forme irrégulière du verbe 'eat'.",
  "build": "Sujet (I) + Verbe passé (ate) + Article (an) + Nom (apple) + Temps (yesterday)"
}
```

---

## 🗄️ Comment ajouter ces données en DB

### Via SQLite

```sql
-- Exemple pour mode BLANKS (Primaire)
INSERT INTO content (family_id, level, content_type, data) VALUES (
  (SELECT id FROM families WHERE module_slug = 'phrase_types' AND level = 1 LIMIT 1),
  1,
  'sentence_blanks',
  '{
    "mode": "blanks",
    "sentence_with_blank": "I ___ a cat",
    "options": ["have", "has", "had", "having"],
    "correctAnswer": "have",
    "translation": "J'\''ai un chat",
    "explanation": "Avec '\''I'\'', on utilise toujours '\''have'\'' au présent."
  }'
);

-- Exemple pour mode FREE (Collège+)
INSERT INTO content (family_id, level, content_type, data) VALUES (
  (SELECT id FROM families WHERE module_slug = 'phrase_types' AND level = 2 LIMIT 1),
  2,
  'sentence_free',
  '{
    "mode": "free",
    "phrase_fr": "J'\''ai un chat",
    "phrase_en": "I have a cat",
    "concretement": "C'\''est la forme la plus simple du présent...",
    "build": "Sujet (I) + Verbe (have) + Article (a) + Nom (cat)"
  }'
);
```

---

## ✅ Tests recommandés

### Test 1 : Mode BLANKS
1. Créer un contenu avec `mode: "blanks"`
2. Naviguer vers l'exercice Sentences (Primaire)
3. Vérifier l'affichage de la phrase avec trou
4. Sélectionner une réponse
5. Valider et vérifier le feedback

### Test 2 : Mode FREE
1. Créer un contenu avec `mode: "free"`
2. Naviguer vers l'exercice Sentences (Collège+)
3. Vérifier l'affichage du champ de saisie
4. Saisir une traduction
5. Valider et vérifier l'auto-correction

### Test 3 : White Label
1. Changer d'identité (primary → college → lycee)
2. Vérifier que les couleurs s'adaptent
3. Vérifier que le mood (playful/clean) fonctionne
4. Tester en mode dark

---

## 🎨 Styles White Label appliqués

### SentenceBlanksCard
- ✅ Couleurs adaptées à `identity.palette`
- ✅ Texte adapté à `identity.text` (primary/secondary/tertiary)
- ✅ Border radius adapté à `ui.cardRadius`
- ✅ Module color pour les accents
- ✅ Support mode dark/light

### SentenceCard (existant)
- ✅ Déjà white label compliant
- ✅ Pas de modification nécessaire

---

## 📦 Fichiers modifiés

1. **`src/hooks/exercises/useExerciseContent.ts`**
   - ✅ Interface `SentenceData` étendue

2. **`src/components/pedagogy/Sentence/SentenceBlanksCard.tsx`**
   - ✅ Nouveau composant pour mode blanks

3. **`src/components/pedagogy/Sentence/SentenceBlanksCard.styles.ts`**
   - ✅ Styles avec white label

4. **`src/screens/SentenceScreen/SentenceExerciceScreen.tsx`**
   - ✅ Détection du mode
   - ✅ Rendu conditionnel des composants
   - ✅ Validation adaptée aux 2 modes

---

## 🚀 Prochaines étapes

1. Ajouter des données de test en DB pour les 2 modes
2. Tester sur Primaire (blanks) et Collège (free)
3. Vérifier le white label sur les 4 audiences
4. Ajuster les feedbacks si nécessaire
5. Ajouter plus de variantes de questions blanks

---

**Tout est prêt pour les tests ! 🎉**
