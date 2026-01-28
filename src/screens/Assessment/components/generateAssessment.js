// ============================================
// FICHIER: generateAssessment.js
// ✅ VERSION OPTIMISÉE - Diversité maximale avec fusion des pools
// ✅ Plus de limitation à "2 familles" - Pioche directe dans TOUT le contenu
// ============================================

import VOCAB_L1 from '../../../../data/vocabulary/level1/index';
import GRAMMAR_L1 from '../../../../data/grammar/level1/index';
import PHRASES_L1 from '../../../../data/phrases/level1/index';
import DIALOGUE_L1 from '../../../../data/dialogues/level1/index';
import READING_L1 from '../../../../data/reading/level1/index';
import { log } from '../../../../utils/logUtils';

/**
 * Mélange un tableau de manière aléatoire (Fisher-Yates)
 * Non-cryptographic randomness - Safe for quiz question shuffling
 * NOSONAR: Math.random() is intentionally used for non-security purposes
 */
const shuffle = (array) => {
  if (!array || !Array.isArray(array)) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Récupération des pools de données par niveau
 */
const getPoolsByLevel = (level) => {
  const levelNum = Number(level);

  if (levelNum === 1) {
    return {
      vocab: VOCAB_L1 || [],
      grammar: GRAMMAR_L1 || [],
      phrases: PHRASES_L1 || [],
      dialogues: DIALOGUE_L1 || [],
      reading: READING_L1 || [],
    };
  }

  log.warn('⚠️ Niveau non supporté:', level);
  return { vocab: [], grammar: [], phrases: [], dialogues: [], reading: [] };
};

/**
 * Génère des distracteurs intelligents pour le vocabulaire
 */
const generateVocabDistractors = (correctWord, allWords) => {
  // Filtrer pour avoir des mots différents
  const otherWords = allWords
    .filter(w => w.id !== correctWord.id)
    .map(w => w.french);
  
  // Prendre 3 distracteurs aléatoires
  const shuffled = shuffle(otherWords);
  const distractors = shuffled.slice(0, 3);
  
  // Si pas assez, ajouter des génériques
  while (distractors.length < 3) {
    const fallbacks = ['eau', 'maison', 'ami', 'livre', 'soleil', 'fleur'];
    // Non-cryptographic randomness - Safe for quiz distractor selection
    // NOSONAR: Math.random() is intentionally used for non-security purposes
    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    if (!distractors.includes(fallback) && fallback !== correctWord.french) {
      distractors.push(fallback);
    }
  }
  
  return distractors;
};

/**
 * GÉNÉRATEUR D'ÉVALUATION DYNAMIQUE
 * ✅ NOUVELLE LOGIQUE : Fusion de TOUS les éléments pour diversité maximale
 */
export const generateAssessment = (level) => {
  log.debug('🎯 Génération assessment - Niveau:', level);

  const pools = getPoolsByLevel(level);
  const questions = [];

  // =================== 1. VOCABULAIRE (5 questions max) ===================
  if (Array.isArray(pools.vocab) && pools.vocab.length > 0) {
    // ✅ NOUVELLE APPROCHE : Fusionner TOUTES les familles
    const allWords = pools.vocab.flatMap(family => 
      Array.isArray(family.words) ? family.words : []
    );
    
    // Mélanger et prendre 5 mots au hasard
    const selectedWords = shuffle(allWords).slice(0, 5);
    
    selectedWords.forEach((word, index) => {
      const distractors = generateVocabDistractors(word, allWords);
      
      questions.push({
        // Non-cryptographic randomness - Safe for unique ID generation (combined with timestamp)
        // NOSONAR: Math.random() is intentionally used for non-security purposes
        id: `vocab_${word.id}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${index}`,
        type: 'definition',
        theme: 'vocabulary',
        question: `What does "${word.french}" mean?`,
        questionFr: `Que signifie "${word.french}" ?`,
        options: shuffle([word.english, ...distractors]),
        correctAnswer: word.english,
        explanation: `"${word.english}" means "${word.french}".`,
        explanationFr: `"${word.english}" signifie "${word.french}".`,
      });
    });
  }

  // =================== 2. GRAMMAIRE (5 questions max) ===================
  if (Array.isArray(pools.grammar) && pools.grammar.length > 0) {
    // ✅ NOUVELLE APPROCHE : Fusionner TOUTES les règles
    const allRules = pools.grammar.flatMap(family => 
      Array.isArray(family.rules) ? family.rules : []
    );
    
    // Filtrer celles qui ont un exercice
    const rulesWithExercise = allRules.filter(rule => rule.exercise);
    
    // Mélanger et prendre 5 règles au hasard
    const selectedRules = shuffle(rulesWithExercise).slice(0, 5);
    
    selectedRules.forEach((rule, index) => {
      questions.push({
        // Non-cryptographic randomness - Safe for unique ID generation (combined with timestamp)
        // NOSONAR: Math.random() is intentionally used for non-security purposes
        id: `grammar_${rule.id}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${index}`,
        type: 'blanks',
        theme: 'grammar',
        question: rule.exercise.question,
        questionFr: rule.exercise.questionFr || rule.exercise.question,
        options: rule.exercise.options?.map(o => o.label || o) || [],
        correctAnswer: rule.exercise.correctAnswer,
        explanation: rule.exercise.correctFeedback || 'Correct!',
        explanationFr: rule.exercise.correctFeedbackFr || 'Correct!',
      });
    });
  }

  // =================== 3. PHRASES (5 questions max) ===================
  if (Array.isArray(pools.phrases) && pools.phrases.length > 0) {
    // ✅ NOUVELLE APPROCHE : Fusionner TOUTES les phrases
    const allPhrases = pools.phrases.flatMap(family => 
      Array.isArray(family.phrases) ? family.phrases : []
    );
    
    // Filtrer celles qui ont des blanks
    const phrasesWithBlanks = allPhrases.filter(phrase => 
      phrase.blanks && phrase.blanks.length > 0
    );
    
    // Mélanger et prendre 5 phrases au hasard
    const selectedPhrases = shuffle(phrasesWithBlanks).slice(0, 5);
    
    selectedPhrases.forEach((phrase, index) => {
      const blank = phrase.blanks[0];
      
      questions.push({
        // Non-cryptographic randomness - Safe for unique ID generation (combined with timestamp)
        // NOSONAR: Math.random() is intentionally used for non-security purposes
        id: `phrase_${phrase.id}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${index}`,
        type: 'blanks',
        theme: 'phrases',
        question: phrase.blank_sentence || phrase.english,
        questionFr: phrase.blank_translation || phrase.french,
        options: blank.options || [],
        correctAnswer: blank.answer,
        explanation: `The sentence is: "${phrase.english}"`,
        explanationFr: `La phrase est : "${phrase.french}"`,
      });
    });
  }

  // =================== 4. DIALOGUES (5 questions max) ===================
  if (Array.isArray(pools.dialogues) && pools.dialogues.length > 0) {
    // ✅ Fusionner toutes les questions de tous les dialogues
    const allDialogueQuestions = [];
    
    pools.dialogues.forEach(dialogue => {
      if (dialogue.questions && dialogue.questions.length > 0) {
        const passage = dialogue.messages
          ?.map(m => `${m.speaker}: ${m.text}`)
          .join('\n') || '';
        
        const passageFr = dialogue.messages
          ?.map(m => `${m.speaker}: ${m.textFr}`)
          .join('\n') || '';
        
        dialogue.questions.forEach((q, idx) => {
          allDialogueQuestions.push({
            dialogueId: dialogue.id,
            questionIndex: idx,
            passage,
            passageFr,
            ...q
          });
        });
      }
    });
    
    // Mélanger et prendre 5 questions au hasard
    const selectedQuestions = shuffle(allDialogueQuestions).slice(0, 5);
    
    selectedQuestions.forEach((q, index) => {
      questions.push({
        // Non-cryptographic randomness - Safe for unique ID generation (combined with timestamp)
        // NOSONAR: Math.random() is intentionally used for non-security purposes
        id: `dialogue_${q.dialogueId}_q${q.questionIndex}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${index}`,
        type: 'sentence',
        theme: 'conversations',
        passage: q.passage,
        passageFr: q.passageFr,
        question: q.question,
        questionFr: q.questionFr,
        options: q.options || [],
        correctAnswer: q.options[q.correctAnswer],
        explanation: 'Look at the dialogue carefully.',
        explanationFr: 'Regarde bien le dialogue.',
      });
    });
  }

  // =================== 5. LECTURE (5 questions max) ===================
  if (Array.isArray(pools.reading) && pools.reading.length > 0) {
    // ✅ Fusionner toutes les questions de tous les textes
    const allReadingQuestions = [];
    
    pools.reading.forEach(text => {
      if (text.questions && text.questions.length > 0) {
        text.questions.forEach((q, idx) => {
          allReadingQuestions.push({
            textId: text.id,
            questionIndex: idx,
            text: text.text,
            textFr: text.textFr,
            ...q
          });
        });
      }
    });
    
    // Mélanger et prendre 5 questions au hasard
    const selectedQuestions = shuffle(allReadingQuestions).slice(0, 5);
    
    selectedQuestions.forEach((q, index) => {
      questions.push({
        // Non-cryptographic randomness - Safe for unique ID generation (combined with timestamp)
        // NOSONAR: Math.random() is intentionally used for non-security purposes
        id: `reading_${q.textId}_q${q.questionIndex}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${index}`,
        type: 'sentence',
        theme: 'reading',
        passage: q.text,
        passageFr: q.textFr,
        question: q.question,
        questionFr: q.questionFr,
        options: q.options || [],
        correctAnswer: q.options[q.correctAnswer],
        explanation: q.hintFr || 'The answer is in the text.',
        explanationFr: q.hintFr || 'La réponse est dans le texte.',
      });
    });
  }

  // =================== SÉCURITÉ ===================
  if (questions.length === 0) {
    log.error('⚠️ Aucune question générée - Question d\'urgence activée');
    questions.push({
      id: 'emergency_q',
      type: 'definition',
      theme: 'vocabulary',
      question: 'Are you ready for the test?',
      questionFr: 'Es-tu prêt pour le test ?',
      options: ['Yes', "Let's go", 'Ready!', 'I am prepared'],
      correctAnswer: 'Yes',
      explanation: 'Good luck!',
      explanationFr: 'Bonne chance !',
    });
  }

  // Mélanger et limiter à 25 questions max
  const finalQuestions = shuffle(questions).slice(0, 25);
  
  // ✅ VÉRIFICATION ANTI-DOUBLON (diagnostic)
  const questionIds = finalQuestions.map(q => q.id);
  const uniqueIds = new Set(questionIds);

  if (uniqueIds.size !== questionIds.length) {
    log.error('⚠️ DOUBLON DÉTECTÉ !');
    log.debug('Total questions:', questionIds.length);
    log.debug('Questions uniques:', uniqueIds.size);
  }
  
  // ===== LOG FINAL =====
  const byTheme = {
    vocabulary: finalQuestions.filter(q => q.theme === 'vocabulary').length,
    grammar: finalQuestions.filter(q => q.theme === 'grammar').length,
    phrases: finalQuestions.filter(q => q.theme === 'phrases').length,
    conversations: finalQuestions.filter(q => q.theme === 'conversations').length,
    reading: finalQuestions.filter(q => q.theme === 'reading').length,
  };

  log.debug('✅ Assessment généré:', {
    totalQuestions: finalQuestions.length,
    byTheme,
  });

  return {
    // Non-cryptographic randomness - Safe for unique ID generation (combined with timestamp)
    // NOSONAR: Math.random() is intentionally used for non-security purposes
    id: `assessment_L${level}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    levelId: Number(level),
    questions: finalQuestions,
  };
};