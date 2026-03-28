/**
 * ============================================
 * MIGRATION 036: Seed Test Data
 * Crée les familles manquantes + contenu de test
 * pour TOUS les modules vides (grammar, reading,
 * dialogues, connector)
 * ============================================
 * À SUPPRIMER quand la vraie data sera prête
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

// Helper pour récupérer ou créer une famille
async function getOrCreateFamily( // NOSONAR — 8 paramètres nécessaires pour l'initialisation des familles
  db: SQLite.SQLiteDatabase,
  slug: string,
  moduleSlug: string,
  name: string,
  icon: string,
  emoji: string,
  description: string,
  orderIndex: number
): Promise<number> {
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM families WHERE slug = ?', [slug]
  );
  if (existing) return existing.id;

  await db.runAsync(
    `INSERT INTO families (slug, module_slug, name, icon, emoji, description, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [slug, moduleSlug, name, icon, emoji, description, orderIndex]
  );
  const created = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM families WHERE slug = ?', [slug]
  );
  return created!.id;
}

export default createMigration(
  36,
  'seed_test_data',
  async (db: SQLite.SQLiteDatabase) => {
    // ============================================
    // 1. GRAMMAR — famille "present" existe déjà
    // ============================================
    const presentFam = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM families WHERE slug = "present"'
    );
    if (presentFam) {
      const grammarContent = [
        // Subfamily 1 - Simple Present
        [presentFam.id, 1, 1, 'grammar_rule', JSON.stringify({
          rule_title: 'Present Simple',
          explanation: 'Le présent simple exprime une habitude ou une vérité générale.',
          simplified: 'Tu utilises le présent simple pour dire ce que tu fais tous les jours ou ce qui est toujours vrai. Avec he/she/it, ajoute un -s au verbe.',
          examples: ['I eat breakfast every day.', 'She works at a hospital.', "They don't like pizza."],
          exercises: [
            { question: 'He ___ to work by bus.', options: ['go', 'goes', 'going', 'gone'], correct_answer: 'goes', explanation: 'Avec he/she/it, on ajoute -s ou -es' },
            { question: 'They ___ football every Sunday.', options: ['play', 'plays', 'playing', 'played'], correct_answer: 'play', explanation: 'Avec they/we/you/I, pas de -s' },
            { question: 'She ___ English very well.', options: ['speak', 'speaks', 'speaking', 'spoke'], correct_answer: 'speaks', explanation: 'She = 3ème personne → -s' },
          ]
        }), 'easy', 'present,verbs,basics', 'all'],
        [presentFam.id, 1, 1, 'grammar_rule', JSON.stringify({
          rule_title: 'Present Simple - Negative',
          explanation: "Pour la forme négative, on utilise don't / doesn't + verbe base.",
          simplified: "Pour dire \"ne...pas\" en anglais : avec I/you/we/they c'est don't, avec he/she/it c'est doesn't. Le verbe reste sans -s après.",
          examples: ["I don't like fish.", "She doesn't play tennis.", "We don't have a car."],
          exercises: [
            { question: "She ___ like chocolate.", options: ["don't", "doesn't", "not", "isn't"], correct_answer: "doesn't", explanation: "She = 3ème personne → doesn't" },
            { question: "We ___ go to school on Sundays.", options: ["don't", "doesn't", "not", "aren't"], correct_answer: "don't", explanation: "We = 1ère personne pluriel → don't" },
          ]
        }), 'easy', 'present,negative', 'all'],
        // Subfamily 2 - Present Continuous
        [presentFam.id, 1, 2, 'grammar_rule', JSON.stringify({
          rule_title: 'Present Continuous',
          explanation: "On utilise be + verbe-ing pour une action en cours maintenant.",
          simplified: "Pour dire ce que tu es en train de faire maintenant : je suis (am/is/are) + verbe avec -ing. C'est comme \"je suis en train de...\"",
          examples: ['I am reading a book.', 'She is cooking dinner.', 'They are playing outside.'],
          exercises: [
            { question: 'She ___ a letter right now.', options: ['write', 'writes', 'is writing', 'wrote'], correct_answer: 'is writing', explanation: "Action en cours → be + -ing" },
            { question: 'They ___ TV at the moment.', options: ['watch', 'watches', 'are watching', 'watched'], correct_answer: 'are watching', explanation: "They + action en cours → are + -ing" },
          ]
        }), 'medium', 'present,continuous', 'all'],
        // Subfamily 3 - Present Perfect
        [presentFam.id, 1, 3, 'grammar_rule', JSON.stringify({
          rule_title: 'Present Perfect',
          explanation: "Have/has + past participle pour une action passée liée au présent.",
          simplified: "Le present perfect sert à parler d'une expérience de vie ou d'une action passée qui a encore un effet maintenant. Pense à : \"j'ai déjà fait ça\" = I have done.",
          examples: ['I have visited Paris.', 'She has finished her homework.', 'They have lived here for 5 years.'],
          exercises: [
            { question: 'She ___ this movie three times.', options: ['see', 'sees', 'has seen', 'saw'], correct_answer: 'has seen', explanation: "Expérience de vie → has + past participle" },
            { question: 'I ___ never ___ sushi.', options: ['have/eaten', 'has/eaten', 'have/eat', 'did/eat'], correct_answer: 'have/eaten', explanation: "I + never → have + past participle" },
          ]
        }), 'hard', 'present,perfect', 'all'],
      ];

      for (const item of grammarContent) {
        await db.runAsync(
          `INSERT INTO content (family_id, level, subfamily_id, content_type, data, difficulty, tags, target_audience)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          item
        );
      }
    }

    // ============================================
    // 2. DIALOGUES — créer les familles manquantes
    // ============================================
    const restaurantId = await getOrCreateFamily(db, 'at_restaurant', 'dialogues', 'At Restaurant', 'silverware-fork-knife', '🍽️', 'Dialogues au restaurant', 1);
    const shoppingId = await getOrCreateFamily(db, 'shopping', 'dialogues', 'Shopping', 'cart', '🛒', 'Dialogues au magasin', 2);
    const socialConvId = await getOrCreateFamily(db, 'social_conversations', 'dialogues', 'Social', 'chat', '💬', 'Conversations sociales', 3);

    const dialogueContent = [
      // At Restaurant - subfamily 1 (Ordering)
      [restaurantId, 1, 1, 'dialogue', JSON.stringify({
        title: 'Ordering Food',
        dialogue: [
          { speaker: 'Waiter', text: 'Good evening! Are you ready to order?' },
          { speaker: 'You', text: 'Yes, I would like the chicken salad, please.' },
          { speaker: 'Waiter', text: 'Would you like something to drink?' },
          { speaker: 'You', text: 'A glass of water, please.' },
          { speaker: 'Waiter', text: 'Great choice! I will be right back.' },
        ],
        questions: [
          { question: 'What did the customer order?', options: ['Pizza', 'Chicken salad', 'Soup', 'Steak'], correct_answer: 'Chicken salad' },
          { question: 'What drink was ordered?', options: ['Coffee', 'Juice', 'Water', 'Tea'], correct_answer: 'Water' },
        ]
      }), 'easy', 'restaurant,ordering', 'all'],
      // At Restaurant - subfamily 2 (Complaining)
      [restaurantId, 1, 2, 'dialogue', JSON.stringify({
        title: 'A Problem with the Order',
        dialogue: [
          { speaker: 'You', text: 'Excuse me, this is not what I ordered.' },
          { speaker: 'Waiter', text: 'I am so sorry! What did you order?' },
          { speaker: 'You', text: 'I asked for the fish, not the meat.' },
          { speaker: 'Waiter', text: 'I will fix that right away. Sorry again!' },
        ],
        questions: [
          { question: 'What was the problem?', options: ['Cold food', 'Wrong order', 'Too expensive', 'Slow service'], correct_answer: 'Wrong order' },
        ]
      }), 'medium', 'restaurant,complaint', 'all'],
      // Shopping - subfamily 1
      [shoppingId, 1, 1, 'dialogue', JSON.stringify({
        title: 'Looking for a Shirt',
        dialogue: [
          { speaker: 'You', text: 'Excuse me, do you have this shirt in medium?' },
          { speaker: 'Staff', text: 'Let me check. Yes, here you go!' },
          { speaker: 'You', text: 'How much is it?' },
          { speaker: 'Staff', text: 'It is 25 euros.' },
          { speaker: 'You', text: 'I will take it. Can I pay by card?' },
        ],
        questions: [
          { question: 'What size did the customer ask for?', options: ['Small', 'Medium', 'Large', 'XL'], correct_answer: 'Medium' },
          { question: 'How much was the shirt?', options: ['15 euros', '20 euros', '25 euros', '30 euros'], correct_answer: '25 euros' },
        ]
      }), 'easy', 'shopping,clothes', 'all'],
      // Social - subfamily 1
      [socialConvId, 1, 1, 'dialogue', JSON.stringify({
        title: 'Meeting Someone New',
        dialogue: [
          { speaker: 'You', text: 'Hi! My name is Alex. What is your name?' },
          { speaker: 'Friend', text: 'Hello! I am Sarah. Nice to meet you!' },
          { speaker: 'You', text: 'Nice to meet you too! Where are you from?' },
          { speaker: 'Friend', text: 'I am from France. And you?' },
          { speaker: 'You', text: 'I am from Morocco. Do you like it here?' },
        ],
        questions: [
          { question: 'Where is Sarah from?', options: ['Morocco', 'England', 'France', 'Spain'], correct_answer: 'France' },
        ]
      }), 'easy', 'social,introduction', 'all'],
    ];

    for (const item of dialogueContent) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, subfamily_id, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    // Re-seed dialogues subfamilies (since families now exist)
    const dialogueSubfamilies = [
      [restaurantId, 1, 'Ordering', 'silverware', 'Commander un repas'],
      [restaurantId, 2, 'Complaining', 'alert-circle', 'Faire une réclamation'],
      [restaurantId, 3, 'Paying', 'cash', "Demander l'addition"],
      [shoppingId, 1, 'Asking for Help', 'help-circle', "Demander de l'aide"],
      [shoppingId, 2, 'Trying On', 'hanger', 'Essayer des vêtements'],
      [shoppingId, 3, 'Paying', 'credit-card', 'Payer ses achats'],
      [socialConvId, 1, 'Meeting People', 'account-multiple', 'Faire connaissance'],
      [socialConvId, 2, 'Small Talk', 'chat', 'Discussion informelle'],
      [socialConvId, 3, 'Making Plans', 'calendar', 'Organiser une sortie'],
    ];

    for (const [famId, subId, title, icon, desc] of dialogueSubfamilies) {
      for (const identity of ['primary', 'college', 'lycee', 'adult']) {
        await db.runAsync(
          `INSERT OR IGNORE INTO level_labels (family_id, level_number, identity_id, display_title, icon_name, display_description, badge_text)
           VALUES (?, ?, ?, ?, ?, ?, '')`,
          [famId, subId, identity, title, icon, desc]
        );
      }
    }

    // ============================================
    // 3. READING — créer les familles manquantes
    // ============================================
    const storiesId = await getOrCreateFamily(db, 'short_stories', 'reading', 'Short Stories', 'book-open-variant', '📖', 'Histoires courtes', 1);
    const articlesId = await getOrCreateFamily(db, 'articles', 'reading', 'Articles', 'newspaper', '📰', 'Articles de presse', 2);
    const professionalId = await getOrCreateFamily(db, 'professional', 'reading', 'Professional', 'email', '💼', 'Textes professionnels', 3);

    const readingContent = [
      [storiesId, 1, 1, 'reading_passage', JSON.stringify({
        title: 'A Day at the Beach',
        passage: 'Last summer, my family and I went to the beach. The weather was perfect. The sun was shining and the water was warm. We built sandcastles and played volleyball. My little sister found beautiful shells. In the evening, we watched the sunset. It was a wonderful day.',
        question_text: 'What did they build at the beach?',
        options: ['Sandcastles', 'Houses', 'Boats', 'Towers'],
        correct_answer: 'Sandcastles'
      }), 'easy', 'vacation,beach', 'all'],
      [storiesId, 1, 2, 'reading_passage', JSON.stringify({
        title: 'The Lost Dog',
        passage: 'Tom found a small dog in the park. It was brown and white. The dog had no collar. Tom took the dog home and gave it food and water. The next day, he put up posters in the neighborhood. After two days, a happy family came to get their dog back. They thanked Tom very much.',
        question_text: 'Where did Tom find the dog?',
        options: ['At school', 'In the park', 'At the supermarket', 'On the street'],
        correct_answer: 'In the park'
      }), 'easy', 'animals,family', 'all'],
      [articlesId, 1, 1, 'reading_passage', JSON.stringify({
        title: 'Why Do We Sleep?',
        passage: 'Sleep is very important for our health. When we sleep, our body repairs itself. Our brain organizes memories and learns new things. Scientists say that children need 9 to 11 hours of sleep. Adults need 7 to 9 hours. Without enough sleep, we feel tired and cannot concentrate.',
        question_text: 'How many hours of sleep do children need?',
        options: ['5 to 7', '7 to 9', '9 to 11', '11 to 13'],
        correct_answer: '9 to 11'
      }), 'medium', 'science,health', 'all'],
      [professionalId, 1, 1, 'reading_passage', JSON.stringify({
        title: 'A Simple Email',
        passage: 'Dear Mr. Johnson,\n\nI am writing to confirm our meeting on Monday at 10 AM. I will bring the project report. Please let me know if you need anything else.\n\nBest regards,\nSarah',
        question_text: 'When is the meeting?',
        options: ['Tuesday at 9 AM', 'Monday at 10 AM', 'Wednesday at 2 PM', 'Friday at 3 PM'],
        correct_answer: 'Monday at 10 AM'
      }), 'medium', 'email,professional', 'adult'],
    ];

    for (const item of readingContent) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, subfamily_id, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    // Re-seed reading subfamilies
    const readingSubfamilies = [
      [storiesId, 1, 'Adventure', 'compass', "Histoires d'aventure"],
      [storiesId, 2, 'Family', 'home-heart', 'Histoires de famille'],
      [storiesId, 3, 'Friendship', 'account-heart', "Histoires d'amitié"],
      [articlesId, 1, 'News', 'newspaper', 'Actualités'],
      [articlesId, 2, 'Science', 'flask', 'Découvertes scientifiques'],
      [articlesId, 3, 'Culture', 'theater', 'Arts et culture'],
      [professionalId, 1, 'Emails', 'email', 'Emails professionnels'],
      [professionalId, 2, 'Reports', 'file-document', "Rapports d'activité"],
      [professionalId, 3, 'Letters', 'text-box', 'Courriers formels'],
    ];

    for (const [famId, subId, title, icon, desc] of readingSubfamilies) {
      for (const identity of ['primary', 'college', 'lycee', 'adult']) {
        await db.runAsync(
          `INSERT OR IGNORE INTO level_labels (family_id, level_number, identity_id, display_title, icon_name, display_description, badge_text)
           VALUES (?, ?, ?, ?, ?, ?, '')`,
          [famId, subId, identity, title, icon, desc]
        );
      }
    }

    // ============================================
    // 4. CONNECTOR — créer les familles manquantes (lycee only)
    // ============================================
    const logicalLinksId = await getOrCreateFamily(db, 'logical_links_connector', 'connector', 'Logical Links', 'link-variant', '🔗', 'Mots de liaison logiques', 1);
    const fusionId = await getOrCreateFamily(db, 'sentence_fusion', 'connector', 'Sentence Fusion', 'merge', '🔀', 'Fusion de phrases', 2);
    const rephrasingId = await getOrCreateFamily(db, 'rephrasing', 'connector', 'Rephrasing', 'refresh', '🔄', 'Reformulation', 3);

    const connectorContent = [
      [logicalLinksId, 1, 0, 'logic', JSON.stringify({
        question: 'Choose the correct connector: I studied hard, ___ I failed the exam.',
        options: ['therefore', 'however', 'moreover', 'furthermore'],
        correct_answer: 'however',
        explanation: '"However" exprime une opposition/contraste'
      }), 'medium', 'connectors,logic', 'lycee'],
      [logicalLinksId, 1, 0, 'logic', JSON.stringify({
        question: 'I was tired, ___ I went to bed early.',
        options: ['but', 'so', 'although', 'because'],
        correct_answer: 'so',
        explanation: '"So" exprime la conséquence'
      }), 'easy', 'connectors,consequence', 'lycee'],
      [fusionId, 1, 0, 'fusion', JSON.stringify({
        sentence1: 'It was raining.',
        sentence2: 'We went to the park.',
        connector_options: ['Although', 'Because', 'So', 'And'],
        correct_answer: 'Although it was raining, we went to the park.',
        correct_connector: 'Although',
        explanation: '"Although" combine deux idées contrastées'
      }), 'medium', 'fusion,contrast', 'lycee'],
      [rephrasingId, 1, 0, 'rephrasing', JSON.stringify({
        original: 'The teacher explained the lesson.',
        instruction: 'Rephrase using passive voice',
        correct_answer: 'The lesson was explained by the teacher.',
        alternatives: ['The lesson was explained.'],
        explanation: 'Passive: object → subject, use was/were + past participle'
      }), 'hard', 'rephrasing,passive', 'lycee'],
    ];

    for (const item of connectorContent) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, subfamily_id, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    // ============================================
    // 5. PHRASES — fix ancien contenu + nouveau contenu
    // ============================================
    // Fix: l'ancien contenu (migration 013) a subfamily_id = NULL → invisible
    // On supprime l'ancien contenu et on le remplace par du contenu propre
    const dailyLifeFam = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM families WHERE slug = "daily_life"'
    );
    if (dailyLifeFam) {
      // Supprimer l'ancien contenu phrases sans subfamily_id
      await db.runAsync(
        'DELETE FROM content WHERE family_id = ? AND subfamily_id IS NULL',
        [dailyLifeFam.id]
      );
      const phrasesContent = [
        // Subfamily 1 - Morning Routine
        [dailyLifeFam.id, 1, 1, 'sentence', JSON.stringify({
          // Mode blanks (primary/college) : sentence + options + correct_answer
          sentence: 'I ___ up at 7 o\'clock every morning.',
          options: ['wake', 'get', 'stand', 'open'],
          correct_answer: 'wake',
          // Mode free (lycee/adult) : phrase_fr + phrase_en + build
          phrase_fr: 'Je me réveille à 7h chaque matin.',
          phrase_en: 'I wake up at 7 o\'clock every morning.',
          build: 'Sujet (I) + Phrasal verb (wake up) + Heure (at 7)',
          translation: 'Je me réveille à 7h chaque matin.',
          explanation: '"Wake up" = se réveiller',
        }), 'easy', 'routine,morning', 'all'],
        [dailyLifeFam.id, 1, 1, 'sentence', JSON.stringify({
          sentence: 'I ___ my teeth before breakfast.',
          options: ['brush', 'wash', 'clean', 'cut'],
          correct_answer: 'brush',
          phrase_fr: 'Je me brosse les dents avant le petit-déjeuner.',
          phrase_en: 'I brush my teeth before breakfast.',
          build: 'Sujet (I) + Verbe (brush) + COD (my teeth) + Temps (before breakfast)',
          translation: 'Je me brosse les dents avant le petit-déjeuner.',
          explanation: '"Brush my teeth" = se brosser les dents',
        }), 'easy', 'routine,hygiene', 'all'],
        // Subfamily 2 - At School / Work
        [dailyLifeFam.id, 1, 2, 'sentence', JSON.stringify({
          sentence: 'The class ___ at 8:30.',
          options: ['starts', 'opens', 'begins', 'runs'],
          correct_answer: 'starts',
          phrase_fr: 'Le cours commence à 8h30.',
          phrase_en: 'The class starts at 8:30.',
          build: 'Sujet (The class) + Verbe (starts) + Heure (at 8:30)',
          translation: 'Le cours commence à 8h30.',
          explanation: '"Starts" ou "begins" pour le début d\'un événement',
        }), 'easy', 'school,time', 'all'],
        // Subfamily 3 - Shopping
        [dailyLifeFam.id, 1, 3, 'sentence', JSON.stringify({
          sentence: 'How ___ does this cost?',
          options: ['much', 'many', 'long', 'far'],
          correct_answer: 'much',
          phrase_fr: 'Combien ça coûte ?',
          phrase_en: 'How much does this cost?',
          build: 'How much + Auxiliaire (does) + Sujet (this) + Verbe (cost)',
          translation: 'Combien ça coûte ?',
          explanation: '"How much" pour le prix (indénombrable)',
        }), 'easy', 'shopping,price', 'all'],
        // Subfamily 4 - Transportation
        [dailyLifeFam.id, 1, 4, 'sentence', JSON.stringify({
          sentence: 'I ___ the bus to school.',
          options: ['take', 'drive', 'ride', 'go'],
          correct_answer: 'take',
          phrase_fr: 'Je prends le bus pour aller à l\'école.',
          phrase_en: 'I take the bus to school.',
          build: 'Sujet (I) + Verbe (take) + COD (the bus) + Direction (to school)',
          translation: 'Je prends le bus pour aller à l\'école.',
          explanation: '"Take the bus" = prendre le bus',
        }), 'easy', 'transport,bus', 'all'],
        // Subfamily 5 - Evening
        [dailyLifeFam.id, 1, 5, 'sentence', JSON.stringify({
          sentence: 'I go to ___ at 10 PM.',
          options: ['bed', 'sleep', 'rest', 'home'],
          correct_answer: 'bed',
          phrase_fr: 'Je vais au lit à 22h.',
          phrase_en: 'I go to bed at 10 PM.',
          build: 'Sujet (I) + Expression (go to bed) + Heure (at 10 PM)',
          translation: 'Je vais au lit à 22h.',
          explanation: '"Go to bed" = aller se coucher',
        }), 'easy', 'evening,sleep', 'all'],
      ];

      for (const item of phrasesContent) {
        await db.runAsync(
          `INSERT INTO content (family_id, level, subfamily_id, content_type, data, difficulty, tags, target_audience)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          item
        );
      }
    }

    console.log('[Migration 036] ✅ Test data seeded for all modules');
    console.log('   - Grammar: 4 rules (present simple, continuous, perfect)');
    console.log('   - Dialogues: 4 dialogues (restaurant, shopping, social)');
    console.log('   - Reading: 4 passages (stories, articles, professional)');
    console.log('   - Connector: 4 exercises (logic, fusion, rephrasing)');
    console.log('   - Phrases: 6 sentence blanks (daily life subfamilies)');
  },

  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    // Supprimer le contenu test
    const testFamilySlugs = [
      'at_restaurant', 'shopping', 'social_conversations',
      'short_stories', 'articles', 'professional',
      'logical_links_connector', 'sentence_fusion', 'rephrasing'
    ];

    for (const slug of testFamilySlugs) {
      await db.runAsync(
        'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE slug = ?)',
        [slug]
      );
      await db.runAsync(
        'DELETE FROM level_labels WHERE family_id IN (SELECT id FROM families WHERE slug = ?)',
        [slug]
      );
      await db.runAsync('DELETE FROM families WHERE slug = ?', [slug]);
    }

    // Supprimer grammar test content
    await db.runAsync(
      "DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE slug = 'present') AND tags LIKE '%basics%' OR tags LIKE '%negative%' OR tags LIKE '%continuous%' OR tags LIKE '%perfect%'"
    );

    console.log('[Migration 036] ✅ Test data cleared');
  }
);
