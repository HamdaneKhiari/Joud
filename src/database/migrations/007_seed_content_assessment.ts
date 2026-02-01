/**
 * ============================================
 * MIGRATION 006: Seed Assessment Content
 * Insère le contenu Assessment (20 questions)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  7,
  'seed_content_assessment',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer l'assessment family_id dynamiquement
    const assessmentFamily = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE name = 'Assessment Pool' LIMIT 1`
    );

    if (!assessmentFamily) {
      throw new Error('Assessment Pool family not found');
    }

    const contentSeed = [
      // ===== VOCABULARY ASSESSMENT (7 questions) =====
      [assessmentFamily.id, 1, 'assessment_vocab', JSON.stringify({ question: 'What does "ambitious" mean?', options: ['Lazy', 'Having strong desire to succeed', 'Tired', 'Happy'], correctAnswer: 'Having strong desire to succeed', explanation: 'Ambitious means having a strong desire to achieve success', difficulty: 'medium' }), 'medium', 'vocabulary,adjectives'],
      [assessmentFamily.id, 1, 'assessment_vocab', JSON.stringify({ question: 'Choose the synonym for "difficult":', options: ['Easy', 'Challenging', 'Simple', 'Clear'], correctAnswer: 'Challenging', explanation: 'Challenging is a synonym for difficult', difficulty: 'easy' }), 'easy', 'vocabulary,synonyms'],
      [assessmentFamily.id, 1, 'assessment_vocab', JSON.stringify({ question: 'What is the opposite of "generous"?', options: ['Kind', 'Selfish', 'Happy', 'Brave'], correctAnswer: 'Selfish', explanation: 'Selfish is the opposite of generous', difficulty: 'easy' }), 'easy', 'vocabulary,antonyms'],
      [assessmentFamily.id, 2, 'assessment_vocab', JSON.stringify({ question: 'What does "procrastinate" mean?', options: ['To delay or postpone', 'To work hard', 'To celebrate', 'To organize'], correctAnswer: 'To delay or postpone', explanation: 'Procrastinate means to delay doing something', difficulty: 'hard' }), 'hard', 'vocabulary,verbs'],
      [assessmentFamily.id, 2, 'assessment_vocab', JSON.stringify({ question: 'Which word means "occurring twice a year"?', options: ['Annual', 'Biannual', 'Monthly', 'Daily'], correctAnswer: 'Biannual', explanation: 'Biannual means happening twice per year', difficulty: 'hard' }), 'hard', 'vocabulary,time'],
      [assessmentFamily.id, 1, 'assessment_vocab', JSON.stringify({ question: 'What does "comprehend" mean?', options: ['To understand', 'To forget', 'To run', 'To eat'], correctAnswer: 'To understand', explanation: 'Comprehend means to understand something', difficulty: 'medium' }), 'medium', 'vocabulary,verbs'],
      [assessmentFamily.id, 2, 'assessment_vocab', JSON.stringify({ question: 'Choose the word that means "brief and to the point":', options: ['Verbose', 'Concise', 'Lengthy', 'Elaborate'], correctAnswer: 'Concise', explanation: 'Concise means expressing much in few words', difficulty: 'hard' }), 'hard', 'vocabulary,adjectives'],

      // ===== GRAMMAR ASSESSMENT (7 questions) =====
      [assessmentFamily.id, 1, 'assessment_grammar', JSON.stringify({ sentence: 'She _____ to the market every Saturday.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 'goes', explanation: 'With "she" (third person singular), use "goes" in present simple', difficulty: 'easy' }), 'easy', 'grammar,present_simple'],
      [assessmentFamily.id, 1, 'assessment_grammar', JSON.stringify({ sentence: 'They _____ watching a movie right now.', options: ['is', 'are', 'was', 'were'], correctAnswer: 'are', explanation: 'With "they" (plural), use "are" in present continuous', difficulty: 'easy' }), 'easy', 'grammar,present_continuous'],
      [assessmentFamily.id, 2, 'assessment_grammar', JSON.stringify({ sentence: 'I _____ my homework when she called.', options: ['do', 'did', 'was doing', 'am doing'], correctAnswer: 'was doing', explanation: 'Use past continuous for an ongoing action interrupted by another event', difficulty: 'medium' }), 'medium', 'grammar,past_continuous'],
      [assessmentFamily.id, 2, 'assessment_grammar', JSON.stringify({ sentence: 'If I _____ enough money, I would buy that car.', options: ['have', 'had', 'will have', 'would have'], correctAnswer: 'had', explanation: 'Second conditional uses past simple in the if-clause', difficulty: 'medium' }), 'medium', 'grammar,conditionals'],
      [assessmentFamily.id, 3, 'assessment_grammar', JSON.stringify({ sentence: 'She _____ in Paris for five years before moving to London.', options: ['lives', 'lived', 'has lived', 'had lived'], correctAnswer: 'had lived', explanation: 'Use past perfect for an action completed before another past action', difficulty: 'hard' }), 'hard', 'grammar,past_perfect'],
      [assessmentFamily.id, 3, 'assessment_grammar', JSON.stringify({ sentence: 'The report _____ by the team yesterday.', options: ['completes', 'completed', 'was completed', 'is completed'], correctAnswer: 'was completed', explanation: 'Use passive voice (was completed) for past actions when the object is the focus', difficulty: 'hard' }), 'hard', 'grammar,passive_voice'],
      [assessmentFamily.id, 2, 'assessment_grammar', JSON.stringify({ sentence: 'Neither of the answers _____ correct.', options: ['are', 'is', 'were', 'be'], correctAnswer: 'is', explanation: '"Neither" is singular and requires a singular verb', difficulty: 'medium' }), 'medium', 'grammar,agreement'],

      // ===== SENTENCE CONSTRUCTION (6 questions) =====
      [assessmentFamily.id, 1, 'assessment_sentence', JSON.stringify({ prompt: 'Translate: "Je vais à l\'école"', correctAnswer: 'I go to school', alternatives: ['I am going to school'], explanation: 'Simple present or present continuous both work for habitual actions', difficulty: 'easy' }), 'easy', 'translation,basic'],
      [assessmentFamily.id, 2, 'assessment_sentence', JSON.stringify({ prompt: 'Reorder: "yesterday / to / went / I / the / park"', correctAnswer: 'I went to the park yesterday', explanation: 'Subject + verb + object + time expression', difficulty: 'medium' }), 'medium', 'sentence_structure,past'],
      [assessmentFamily.id, 2, 'assessment_sentence', JSON.stringify({ prompt: 'Complete with a connector: "I was tired _____ I went to bed early."', options: ['but', 'so', 'because', 'although'], correctAnswer: 'so', explanation: '"So" expresses the consequence/result', difficulty: 'medium' }), 'medium', 'connectors,logic'],
      [assessmentFamily.id, 3, 'assessment_sentence', JSON.stringify({ prompt: 'Rephrase using passive voice: "The teacher explained the lesson."', correctAnswer: 'The lesson was explained by the teacher', alternatives: ['The lesson was explained'], explanation: 'Passive: object becomes subject, use "was/were + past participle"', difficulty: 'hard' }), 'hard', 'transformation,passive'],
      [assessmentFamily.id, 3, 'assessment_sentence', JSON.stringify({ prompt: 'Combine using "although": "It was cold. We went swimming."', correctAnswer: 'Although it was cold, we went swimming', alternatives: ['We went swimming although it was cold'], explanation: '"Although" introduces a contrast between two clauses', difficulty: 'hard' }), 'hard', 'connectors,contrast'],
      [assessmentFamily.id, 3, 'assessment_sentence', JSON.stringify({ prompt: 'Reported speech: "I will call you tomorrow" → She said _____.', correctAnswer: 'she would call me the next day', alternatives: ['that she would call me the next day'], explanation: 'In reported speech: will→would, tomorrow→the next day', difficulty: 'hard' }), 'hard', 'grammar,reported_speech'],
    ];

    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log('[Migration 006] ✓ Assessment content seeded (20 questions)');
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      `DELETE FROM content WHERE content_type IN ('assessment_vocab', 'assessment_grammar', 'assessment_sentence')`
    );
    console.log('[Migration 006] ✓ Assessment content cleared');
  }
);
