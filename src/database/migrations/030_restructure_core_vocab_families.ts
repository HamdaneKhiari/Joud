/**
 * ============================================
 * MIGRATION 030: Restructure Core Vocabulary
 * Crée 6 familles pour organiser les 100 mots Core
 * Supprime l'ancienne structure (famille "salutations")
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  30,
  'restructure_core_vocab_families',
  async (db: SQLite.SQLiteDatabase) => {
    // ============================================
    // 1. NETTOYAGE DE L'ANCIEN VOCABULAIRE
    // ============================================

    console.log('[Migration 030] Suppression de l\'ancien vocabulaire...');

    // Supprimer TOUTES les anciennes familles du module 'vocab'
    // (salutations, family, colors, food_drinks, logical_links)
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "vocab")'
    );
    await db.runAsync(
      'DELETE FROM level_labels WHERE family_id IN (SELECT id FROM families WHERE module_slug = "vocab")'
    );
    await db.runAsync('DELETE FROM families WHERE module_slug = "vocab"');

    // Supprimer aussi l'ancien module fastvocab si présent
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "fastvocab")'
    );
    await db.runAsync(
      'DELETE FROM level_labels WHERE family_id IN (SELECT id FROM families WHERE module_slug = "fastvocab")'
    );
    await db.runAsync('DELETE FROM families WHERE module_slug = "fastvocab"');

    console.log('[Migration 030] ✅ Ancien vocabulaire supprimé (toutes les anciennes familles vocab)');

    // ============================================
    // 2. CRÉATION DES 6 NOUVELLES FAMILLES
    // ============================================

    const families = [
      {
        slug: 'the-glue',
        name: 'The Glue',
        emoji: '🔗',
        icon: 'link-variant',
        description: 'Structure & Grammaire - Les mots qui lient tout ensemble',
      },
      {
        slug: 'action-center',
        name: 'Action Center',
        emoji: '⚡',
        icon: 'run-fast',
        description: 'Tous les verbes essentiels pour agir',
      },
      {
        slug: 'human-world',
        name: 'Human World',
        emoji: '👥',
        icon: 'account-group',
        description: 'Personnes & Émotions',
      },
      {
        slug: 'the-kingdom',
        name: 'The Kingdom',
        emoji: '🏰',
        icon: 'home',
        description: 'Lieux & Objets du quotidien',
      },
      {
        slug: 'quality-time',
        name: 'Quality & Time',
        emoji: '⏰',
        icon: 'clock',
        description: 'Nuances & Temps',
      },
      {
        slug: 'social',
        name: 'Social',
        emoji: '💬',
        icon: 'comment',
        description: 'Interactions sociales',
      },
    ];

    const familyIds: Record<string, number> = {};

    for (const fam of families) {
      await db.runAsync(
        `INSERT INTO families (module_slug, slug, name, emoji, icon, description, order_index)
         VALUES ('vocab', ?, ?, ?, ?, ?, ?)`,
        [fam.slug, fam.name, fam.emoji, fam.icon, fam.description, 0]
      );

      const result = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM families WHERE slug = ?',
        [fam.slug]
      );
      if (result) {
        familyIds[fam.slug] = result.id;
      }
    }

    console.log('[Migration 030] ✅ 6 familles créées');

    // ============================================
    // 3. CRÉATION DES SUBFAMILIES
    // ============================================

    const identities = ['primary', 'college', 'lycee', 'adult'];

    // Subfamilies pour THE GLUE
    const glueSubfamilies = [
      [1, 'Pronouns', 'account-circle', 'I, you, he, she...'],
      [2, 'Questions', 'help-circle', 'Who, what, where...'],
      [3, 'Connectors', 'link-variant', 'And, but, because...'],
      [4, 'Determiners', 'text-box', 'A, the, this, some...'],
      [5, 'Space & Position', 'map-marker', 'In, on, at, under...'],
      [6, 'Negation', 'close-circle', 'Yes, no, not'],
    ];

    // Subfamilies pour ACTION CENTER
    const actionSubfamilies = [
      [1, 'Super Verbs', 'flash', 'Be, have, do, go...'],
      [2, 'Desires & Modal', 'heart', 'Want, like, can'],
      [3, 'Senses & Brain', 'brain', 'Know, think, see...'],
      [4, 'Daily Actions', 'food', 'Eat, drink, sleep...'],
    ];

    // Subfamilies pour HUMAN WORLD
    const humanSubfamilies = [
      [1, 'People', 'account-group', 'Man, woman, child...'],
      [2, 'Feelings & States', 'emoticon-happy', 'Happy, sad, hungry...'],
      [3, 'Identity', 'card-account-details', 'Name'],
    ];

    // Subfamilies pour THE KINGDOM
    const kingdomSubfamilies = [
      [1, 'Environment', 'home-city', 'School, house, water...'],
    ];

    // Subfamilies pour QUALITY & TIME
    const qualitySubfamilies = [
      [1, 'Opposites', 'compare', 'Big, small, good, bad'],
      [2, 'Time Markers', 'clock-outline', 'Now, today, always...'],
    ];

    // Subfamilies pour SOCIAL
    const socialSubfamilies = [
      [1, 'Greetings', 'hand-wave', 'Hello, thanks, please'],
    ];

    const allSubfamilies = [
      { familySlug: 'the-glue', subfamilies: glueSubfamilies },
      { familySlug: 'action-center', subfamilies: actionSubfamilies },
      { familySlug: 'human-world', subfamilies: humanSubfamilies },
      { familySlug: 'the-kingdom', subfamilies: kingdomSubfamilies },
      { familySlug: 'quality-time', subfamilies: qualitySubfamilies },
      { familySlug: 'social', subfamilies: socialSubfamilies },
    ];

    for (const { familySlug, subfamilies } of allSubfamilies) {
      const familyId = familyIds[familySlug];
      if (!familyId) continue;

      for (const identity of identities) {
        for (const [levelNumber, title, icon, desc] of subfamilies) {
          await db.runAsync(
            `INSERT INTO level_labels (
              family_id, level_number, identity_id,
              display_title, icon_name, display_description, badge_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [familyId, levelNumber, identity, title, icon, desc, '']
          );
        }
      }
    }

    console.log('[Migration 030] ✅ Subfamilies créées');

    // ============================================
    // 4. INSERTION DES 100 MOTS
    // ============================================

    // Format : [word, translation, example, exampleTranslation, familySlug, subfamilyId]
    const core100Words = [
      // THE GLUE - Pronouns (subfamily 1)
      ['I', 'Je', 'I am a student.', 'Je suis un étudiant.', 'the-glue', 1],
      ['YOU', 'Tu / Vous', 'You are my friend.', 'Tu es mon ami.', 'the-glue', 1],
      ['HE', 'Il', 'He is a boy.', 'C\'est un garçon.', 'the-glue', 1],
      ['SHE', 'Elle', 'She is a girl.', 'C\'est une fille.', 'the-glue', 1],
      ['IT', 'Il / Elle (objet/animal)', 'It is a small dog.', 'C\'est un petit chien.', 'the-glue', 1],
      ['WE', 'Nous', 'We are here.', 'Nous sommes ici.', 'the-glue', 1],
      ['THEY', 'Ils / Elles', 'They are happy.', 'Ils sont heureux.', 'the-glue', 1],
      ['MY', 'Mon / Ma / Mes', 'This is my house.', 'C\'est ma maison.', 'the-glue', 1],
      ['YOUR', 'Ton / Votre', 'Where is your book?', 'Où est ton livre ?', 'the-glue', 1],
      ['HIS', 'Son / Sa (à lui)', 'His car is blue.', 'Sa voiture est bleue.', 'the-glue', 1],
      ['HER', 'Son / Sa (à elle)', 'Her name is Anna.', 'Son nom est Anna.', 'the-glue', 1],
      ['OUR', 'Notre / Nos', 'Our family is big.', 'Notre famille est grande.', 'the-glue', 1],
      ['THEIR', 'Leur / Leurs', 'Their house is old.', 'Leur maison est vieille.', 'the-glue', 1],

      // THE GLUE - Questions (subfamily 2)
      ['WHO', 'Qui', 'Who is this man?', 'Qui est cet homme ?', 'the-glue', 2],
      ['WHAT', 'Quoi / Quel', 'What is your name?', 'Quel est ton nom ?', 'the-glue', 2],
      ['WHERE', 'Où', 'Where is the bathroom?', 'Où est la salle de bain ?', 'the-glue', 2],
      ['WHEN', 'Quand', 'When do we eat?', 'Quand mangeons-nous ?', 'the-glue', 2],
      ['WHY', 'Pourquoi', 'Why are you sad?', 'Pourquoi es-tu triste ?', 'the-glue', 2],
      ['HOW', 'Comment', 'How are you?', 'Comment vas-tu ?', 'the-glue', 2],

      // THE GLUE - Connectors (subfamily 3)
      ['AND', 'Et', 'A cat and a dog.', 'Un chat et un chien.', 'the-glue', 3],
      ['BUT', 'Mais', 'I like tea but not coffee.', 'J\'aime le thé mais pas le café.', 'the-glue', 3],
      ['OR', 'Ou', 'Red or blue?', 'Rouge ou bleu ?', 'the-glue', 3],
      ['BECAUSE', 'Parce que', 'I sleep because I am tired.', 'Je dors parce que je suis fatigué.', 'the-glue', 3],
      ['SO', 'Donc / Alors', 'I am sick, so I stay at home.', 'Je suis malade, donc je reste à la maison.', 'the-glue', 3],
      ['WITH', 'Avec', 'I play with my friend.', 'Je joue avec mon ami.', 'the-glue', 3],
      ['WITHOUT', 'Sans', 'I drink tea without milk.', 'Je bois du thé sans lait.', 'the-glue', 3],
      ['FOR', 'Pour', 'This is for you.', 'C\'est pour toi.', 'the-glue', 3],
      ['TO', 'Vers / À', 'I go to the park.', 'Je vais au parc.', 'the-glue', 3],
      ['FROM', 'De / Depuis', 'A letter from my father.', 'Une lettre de mon père.', 'the-glue', 3],

      // THE GLUE - Determiners (subfamily 4)
      ['A / AN', 'Un / Une', 'I eat an apple.', 'Je mange une pomme.', 'the-glue', 4],
      ['THE', 'Le / La / Les', 'The sun is hot.', 'Le soleil est chaud.', 'the-glue', 4],
      ['THIS', 'Ce / Ceci', 'This is my brother.', 'C\'est mon frère.', 'the-glue', 4],
      ['THAT', 'Ce / Cela (éloigné)', 'That is a big bird.', 'C\'est un gros oiseau.', 'the-glue', 4],
      ['SOME', 'Du / Quelques', 'I want some milk.', 'Je veux du lait.', 'the-glue', 4],
      ['ALL', 'Tout / Tous', 'All the children are here.', 'Tous les enfants sont ici.', 'the-glue', 4],
      ['EVERY', 'Chaque', 'I run every morning.', 'Je cours chaque matin.', 'the-glue', 4],

      // THE GLUE - Space & Position (subfamily 5)
      ['IN', 'Dans', 'The milk is in the bottle.', 'Le lait est dans la bouteille.', 'the-glue', 5],
      ['ON', 'Sur', 'The pen is on the desk.', 'Le stylo est sur le bureau.', 'the-glue', 5],
      ['AT', 'À / Chez', 'I am at school.', 'Je suis à l\'école.', 'the-glue', 5],
      ['UNDER', 'Sous', 'The ball is under the chair.', 'La balle est sous la chaise.', 'the-glue', 5],
      ['HERE', 'Ici', 'Put the bag here.', 'Pose le sac ici.', 'the-glue', 5],
      ['THERE', 'Là-bas', 'The hospital is there.', 'L\'hôpital est là-bas.', 'the-glue', 5],

      // THE GLUE - Negation (subfamily 6)
      ['YES', 'Oui', 'Yes, I can.', 'Oui, je peux.', 'the-glue', 6],
      ['NO', 'Non', 'No, I am not tired.', 'Non, je ne suis pas fatigué.', 'the-glue', 6],
      ['NOT', 'Ne... pas', 'I am not a doctor.', 'Je ne suis pas médecin.', 'the-glue', 6],

      // ACTION CENTER - Super Verbs (subfamily 1)
      ['BE', 'Être', 'I want to be happy.', 'Je veux être heureux.', 'action-center', 1],
      ['HAVE', 'Avoir', 'I have a cat.', 'J\'ai un chien.', 'action-center', 1],
      ['DO', 'Faire', 'I do my work.', 'Je fais mon travail.', 'action-center', 1],
      ['GO', 'Aller', 'I go to school.', 'Je vais à l\'école.', 'action-center', 1],
      ['COME', 'Venir', 'Come here, please.', 'Viens ici, s\'il te plaît.', 'action-center', 1],
      ['GET', 'Obtenir / Devenir', 'I get a present.', 'Je reçois un cadeau.', 'action-center', 1],
      ['MAKE', 'Fabriquer / Faire', 'I make a cake.', 'Je fais un gâteau.', 'action-center', 1],
      ['TAKE', 'Prendre', 'Take my hand.', 'Prends ma main.', 'action-center', 1],
      ['PUT', 'Mettre / Poser', 'Put the book on the table.', 'Pose le livre sur la table.', 'action-center', 1],
      ['USE', 'Utiliser', 'I use a pen.', 'J\'utilise un stylo.', 'action-center', 1],

      // ACTION CENTER - Desires & Modal (subfamily 2)
      ['WANT', 'Vouloir', 'I want water.', 'Je veux de l\'eau.', 'action-center', 2],
      ['LIKE', 'Aimer / Apprécier', 'I like music.', 'J\'aime la musique.', 'action-center', 2],
      ['CAN', 'Pouvoir', 'I can swim.', 'Je peux nager.', 'action-center', 2],

      // ACTION CENTER - Senses & Brain (subfamily 3)
      ['KNOW', 'Savoir / Connaître', 'I know your brother.', 'Je connais ton frère.', 'action-center', 3],
      ['THINK', 'Penser', 'I think you are right.', 'Je pense que tu as raison.', 'action-center', 3],
      ['LOOK', 'Regarder', 'Look at the sky.', 'Regarde le ciel.', 'action-center', 3],
      ['SEE', 'Voir', 'I see a bird.', 'Je vois un oiseau.', 'action-center', 3],
      ['LISTEN', 'Écouter', 'Listen to the teacher.', 'Écoute le professeur.', 'action-center', 3],
      ['HEAR', 'Entendre', 'I hear the wind.', 'J\'entends le vent.', 'action-center', 3],

      // ACTION CENTER - Daily Actions (subfamily 4)
      ['EAT', 'Manger', 'I eat an orange.', 'Je mange une orange.', 'action-center', 4],
      ['DRINK', 'Boire', 'I drink orange juice.', 'Je bois du jus d\'orange.', 'action-center', 4],
      ['SLEEP', 'Dormir', 'I sleep in my bed.', 'Je dors dans mon lit.', 'action-center', 4],
      ['SAY', 'Dire', 'Say hello to your mother.', 'Dis bonjour à ta mère.', 'action-center', 4],
      ['TELL', 'Raconter / Dire à', 'Tell me a story.', 'Raconte-moi une histoire.', 'action-center', 4],
      ['WORK', 'Travail / Travailler', 'I work in the city.', 'Je travaille en ville.', 'action-center', 4],

      // HUMAN WORLD - People (subfamily 1)
      ['MAN', 'Homme', 'This man is my father.', 'Cet homme est mon père.', 'human-world', 1],
      ['WOMAN', 'Femme', 'The woman is in the shop.', 'La femme est dans le magasin.', 'human-world', 1],
      ['CHILD', 'Enfant', 'The child is in the garden.', 'L\'enfant est dans le jardin.', 'human-world', 1],
      ['FRIEND', 'Ami', 'You are my best friend.', 'Tu es mon meilleur ami.', 'human-world', 1],

      // HUMAN WORLD - Feelings & States (subfamily 2)
      ['HAPPY', 'Heureux', 'I am very happy today.', 'Je suis très heureux aujourd\'hui.', 'human-world', 2],
      ['SAD', 'Triste', 'Why is the baby sad?', 'Pourquoi le bébé est-il triste ?', 'human-world', 2],
      ['HOT', 'Chaud', 'The water is hot.', 'L\'eau est chaude.', 'human-world', 2],
      ['COLD', 'Froid', 'It is cold in winter.', 'Il fait froid en hiver.', 'human-world', 2],
      ['HUNGRY', 'Avoir faim', 'I am hungry, I want bread.', 'J\'ai faim, je veux du pain.', 'human-world', 2],
      ['THIRSTY', 'Avoir soif', 'The dog is thirsty.', 'Le chien a soif.', 'human-world', 2],

      // HUMAN WORLD - Identity (subfamily 3)
      ['NAME', 'Nom', 'My name is Tom.', 'Mon nom est Tom.', 'human-world', 3],

      // THE KINGDOM - Environment (subfamily 1)
      ['SCHOOL', 'École', 'I like my school.', 'J\'aime mon école.', 'the-kingdom', 1],
      ['HOUSE', 'Maison', 'My house is white.', 'Ma maison est blanche.', 'the-kingdom', 1],
      ['WATER', 'Eau', 'Can I have some water?', 'Puis-je avoir de l\'eau ?', 'the-kingdom', 1],
      ['FOOD', 'Nourriture', 'The food is on the table.', 'La nourriture est sur la table.', 'the-kingdom', 1],

      // QUALITY & TIME - Opposites (subfamily 1)
      ['BIG', 'Grand', 'This is a big house.', 'C\'est une grande maison.', 'quality-time', 1],
      ['SMALL', 'Petit', 'I have a small bike.', 'J\'ai un petit vélo.', 'quality-time', 1],
      ['GOOD', 'Bon / Bien', 'This cake is very good.', 'Ce gâteau est très bon.', 'quality-time', 1],
      ['BAD', 'Mauvais', 'It is a bad idea.', 'C\'est une mauvaise idée.', 'quality-time', 1],

      // QUALITY & TIME - Time Markers (subfamily 2)
      ['TIME', 'Temps / Heure', 'What time is it?', 'Quelle heure est-il ?', 'quality-time', 2],
      ['NOW', 'Maintenant', 'I want to eat now.', 'Je veux manger maintenant.', 'quality-time', 2],
      ['TODAY', 'Aujourd\'hui', 'Today is a good day.', 'Aujourd\'hui est un bon jour.', 'quality-time', 2],
      ['TOMORROW', 'Demain', 'See you tomorrow.', 'À demain.', 'quality-time', 2],
      ['YESTERDAY', 'Hier', 'Yesterday, I was tired.', 'Hier, j\'étais fatigué.', 'quality-time', 2],
      ['ALWAYS', 'Toujours', 'I always drink water.', 'Je bois toujours de l\'eau.', 'quality-time', 2],
      ['NEVER', 'Jamais', 'I never eat meat.', 'Je ne mange jamais de viande.', 'quality-time', 2],
      ['SOMETIMES', 'Parfois', 'Sometimes I go to the cinema.', 'Parfois je vais au cinéma.', 'quality-time', 2],

      // SOCIAL - Greetings (subfamily 1)
      ['HELLO', 'Bonjour', 'Hello, how are you?', 'Bonjour, comment vas-tu ?', 'social', 1],
      ['THANKS', 'Merci', 'Thanks for the help.', 'Merci pour l\'aide.', 'social', 1],
      ['PLEASE', 'S\'il vous plaît', 'Milk, please.', 'Du lait, s\'il vous plaît.', 'social', 1],
    ];

    // Insérer les 100 mots
    for (const [word, translation, example, exampleTranslation, familySlug, subfamilyId] of core100Words) {
      const familyId = familyIds[familySlug];
      if (!familyId) {
        console.error(`[Migration 030] Famille introuvable: ${familySlug}`);
        continue;
      }

      const data = JSON.stringify({
        word,
        translation,
        example,
        exampleTranslation,
      });

      await db.runAsync(
        `INSERT INTO content (family_id, level, subfamily_id, content_type, data, difficulty, tags, target_audience)
         VALUES (?, 1, ?, 'word', ?, 'easy', 'core100', 'all')`,
        [familyId, subfamilyId, data]
      );
    }

    console.log('✅ Migration 030: Structure complète créée');
    console.log('   - 6 familles créées');
    console.log('   - Subfamilies créées pour chaque famille');
    console.log('   - 100 mots insérés et organisés');
  },

  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    // Supprimer les 6 familles et tout leur contenu
    const slugs = ['the-glue', 'action-center', 'human-world', 'the-kingdom', 'quality-time', 'social'];

    for (const slug of slugs) {
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

    console.log('✅ Migration 030 rollback: Familles Core Vocabulary supprimées');
  }
);
