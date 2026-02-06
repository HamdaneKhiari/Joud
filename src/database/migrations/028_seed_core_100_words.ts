/**
 * ============================================
 * MIGRATION 028: Core 100 Words
 * Ajoute les 100 mots les plus fréquents en anglais
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  28,
  'seed_core_100_words',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer l'ID de la famille "salutations" (Basics)
    const basicsFam = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = "salutations"');
    if (!basicsFam) {
      console.error('[Migration 028] Famille "salutations" introuvable !');
      return;
    }

    const familyId = basicsFam.id;

    // Format : [word, translation, example, exampleTranslation]
    const core100Words = [
      ['I', 'Je', 'I am a student.', 'Je suis un étudiant.'],
      ['YOU', 'Tu / Vous', 'You are my friend.', 'Tu es mon ami.'],
      ['HE', 'Il', 'He is a boy.', 'C\'est un garçon.'],
      ['SHE', 'Elle', 'She is a girl.', 'C\'est une fille.'],
      ['IT', 'Il / Elle (objet/animal)', 'It is a small dog.', 'C\'est un petit chien.'],
      ['WE', 'Nous', 'We are here.', 'Nous sommes ici.'],
      ['THEY', 'Ils / Elles', 'They are happy.', 'Ils sont heureux.'],
      ['MY', 'Mon / Ma / Mes', 'This is my house.', 'C\'est ma maison.'],
      ['YOUR', 'Ton / Votre', 'Where is your book?', 'Où est ton livre ?'],
      ['HIS', 'Son / Sa (à lui)', 'His car is blue.', 'Sa voiture est bleue.'],
      ['HER', 'Son / Sa (à elle)', 'Her name is Anna.', 'Son nom est Anna.'],
      ['OUR', 'Notre / Nos', 'Our family is big.', 'Notre famille est grande.'],
      ['THEIR', 'Leur / Leurs', 'Their house is old.', 'Leur maison est vieille.'],
      ['BE', 'Être', 'I want to be happy.', 'Je veux être heureux.'],
      ['HAVE', 'Avoir', 'I have a cat.', 'J\'ai un chien.'],
      ['DO', 'Faire', 'I do my work.', 'Je fais mon travail.'],
      ['GO', 'Aller', 'I go to school.', 'Je vais à l\'école.'],
      ['COME', 'Venir', 'Come here, please.', 'Viens ici, s\'il te plaît.'],
      ['GET', 'Obtenir / Devenir', 'I get a present.', 'Je reçois un cadeau.'],
      ['MAKE', 'Fabriquer / Faire', 'I make a cake.', 'Je fais un gâteau.'],
      ['TAKE', 'Prendre', 'Take my hand.', 'Prends ma main.'],
      ['PUT', 'Mettre / Poser', 'Put the book on the table.', 'Pose le livre sur la table.'],
      ['USE', 'Utiliser', 'I use a pen.', 'J\'utilise un stylo.'],
      ['WANT', 'Vouloir', 'I want water.', 'Je veux de l\'eau.'],
      ['LIKE', 'Aimer / Apprécier', 'I like music.', 'J\'aime la musique.'],
      ['CAN', 'Pouvoir', 'I can swim.', 'Je peux nager.'],
      ['A / AN', 'Un / Une', 'I eat an apple.', 'Je mange une pomme.'],
      ['THE', 'Le / La / Les', 'The sun is hot.', 'Le soleil est chaud.'],
      ['THIS', 'Ce / Ceci', 'This is my brother.', 'C\'est mon frère.'],
      ['THAT', 'Ce / Cela (éloigné)', 'That is a big bird.', 'C\'est un gros oiseau.'],
      ['AND', 'Et', 'A cat and a dog.', 'Un chat et un chien.'],
      ['BUT', 'Mais', 'I like tea but not coffee.', 'J\'aime le thé mais pas le café.'],
      ['OR', 'Ou', 'Red or blue?', 'Rouge ou bleu ?'],
      ['BECAUSE', 'Parce que', 'I sleep because I am tired.', 'Je dors parce que je suis fatigué.'],
      ['SO', 'Donc / Alors', 'I am sick, so I stay at home.', 'Je suis malade, donc je reste à la maison.'],
      ['WITH', 'Avec', 'I play with my friend.', 'Je joue avec mon ami.'],
      ['WITHOUT', 'Sans', 'I drink tea without milk.', 'Je bois du thé sans lait.'],
      ['FOR', 'Pour', 'This is for you.', 'C\'est pour toi.'],
      ['IN', 'Dans', 'The milk is in the bottle.', 'Le lait est dans la bouteille.'],
      ['ON', 'Sur', 'The pen is on the desk.', 'Le stylo est sur le bureau.'],
      ['AT', 'À / Chez', 'I am at school.', 'Je suis à l\'école.'],
      ['UNDER', 'Sous', 'The ball is under the chair.', 'La balle est sous la chaise.'],
      ['TO', 'Vers / À', 'I go to the park.', 'Je vais au parc.'],
      ['FROM', 'De / Depuis', 'A letter from my father.', 'Une lettre de mon père.'],
      ['WHO', 'Qui', 'Who is this man?', 'Qui est cet homme ?'],
      ['WHAT', 'Quoi / Quel', 'What is your name?', 'Quel est ton nom ?'],
      ['WHERE', 'Où', 'Where is the bathroom?', 'Où est la salle de bain ?'],
      ['WHEN', 'Quand', 'When do we eat?', 'Quand mangeons-nous ?'],
      ['WHY', 'Pourquoi', 'Why are you sad?', 'Pourquoi es-tu triste ?'],
      ['HOW', 'Comment', 'How are you?', 'Comment vas-tu ?'],
      ['YES', 'Oui', 'Yes, I can.', 'Oui, je peux.'],
      ['NO', 'Non', 'No, I am not tired.', 'Non, je ne suis pas fatigué.'],
      ['NOT', 'Ne... pas', 'I am not a doctor.', 'Je ne suis pas médecin.'],
      ['ALL', 'Tout / Tous', 'All the children are here.', 'Tous les enfants sont ici.'],
      ['SOME', 'Du / Quelques', 'I want some milk.', 'Je veux du lait.'],
      ['EVERY', 'Chaque', 'I run every morning.', 'Je cours chaque matin.'],
      ['NOW', 'Maintenant', 'I want to eat now.', 'Je veux manger maintenant.'],
      ['TODAY', 'Aujourd\'hui', 'Today is a good day.', 'Aujourd\'hui est un bon jour.'],
      ['TOMORROW', 'Demain', 'See you tomorrow.', 'À demain.'],
      ['YESTERDAY', 'Hier', 'Yesterday, I was tired.', 'Hier, j\'étais fatigué.'],
      ['ALWAYS', 'Toujours', 'I always drink water.', 'Je bois toujours de l\'eau.'],
      ['NEVER', 'Jamais', 'I never eat meat.', 'Je ne mange jamais de viande.'],
      ['SOMETIMES', 'Parfois', 'Sometimes I go to the cinema.', 'Parfois je vais au cinéma.'],
      ['HERE', 'Ici', 'Put the bag here.', 'Pose le sac ici.'],
      ['THERE', 'Là-bas', 'The hospital is there.', 'L\'hôpital est là-bas.'],
      ['BIG', 'Grand', 'This is a big house.', 'C\'est une grande maison.'],
      ['SMALL', 'Petit', 'I have a small bike.', 'J\'ai un petit vélo.'],
      ['GOOD', 'Bon / Bien', 'This cake is very good.', 'Ce gâteau est très bon.'],
      ['BAD', 'Mauvais', 'It is a bad idea.', 'C\'est une mauvaise idée.'],
      ['HAPPY', 'Heureux', 'I am very happy today.', 'Je suis très heureux aujourd\'hui.'],
      ['SAD', 'Triste', 'Why is the baby sad?', 'Pourquoi le bébé est-il triste ?'],
      ['HOT', 'Chaud', 'The water is hot.', 'L\'eau est chaude.'],
      ['COLD', 'Froid', 'It is cold in winter.', 'Il fait froid en hiver.'],
      ['HUNGRY', 'Avoir faim', 'I am hungry, I want bread.', 'J\'ai faim, je veux du pain.'],
      ['THIRSTY', 'Avoir soif', 'The dog is thirsty.', 'Le chien a soif.'],
      ['EAT', 'Manger', 'I eat an orange.', 'Je mange une orange.'],
      ['DRINK', 'Boire', 'I drink orange juice.', 'Je bois du jus d\'orange.'],
      ['SLEEP', 'Dormir', 'I sleep in my bed.', 'Je dors dans mon lit.'],
      ['SAY', 'Dire', 'Say hello to your mother.', 'Dis bonjour à ta mère.'],
      ['TELL', 'Raconter / Dire à', 'Tell me a story.', 'Raconte-moi une histoire.'],
      ['KNOW', 'Savoir / Connaître', 'I know your brother.', 'Je connais ton frère.'],
      ['THINK', 'Penser', 'I think you are right.', 'Je pense que tu as raison.'],
      ['LOOK', 'Regarder', 'Look at the sky.', 'Regarde le ciel.'],
      ['SEE', 'Voir', 'I see a bird.', 'Je vois un oiseau.'],
      ['LISTEN', 'Écouter', 'Listen to the teacher.', 'Écoute le professeur.'],
      ['HEAR', 'Entendre', 'I hear the wind.', 'J\'entends le vent.'],
      ['MAN', 'Homme', 'This man is my father.', 'Cet homme est mon père.'],
      ['WOMAN', 'Femme', 'The woman is in the shop.', 'La femme est dans le magasin.'],
      ['CHILD', 'Enfant', 'The child is in the garden.', 'L\'enfant est dans le jardin.'],
      ['FRIEND', 'Ami', 'You are my best friend.', 'Tu es mon meilleur ami.'],
      ['SCHOOL', 'École', 'I like my school.', 'J\'aime mon école.'],
      ['HOUSE', 'Maison', 'My house is white.', 'Ma maison est blanche.'],
      ['WATER', 'Eau', 'Can I have some water?', 'Puis-je avoir de l\'eau ?'],
      ['FOOD', 'Nourriture', 'The food is on the table.', 'La nourriture est sur la table.'],
      ['TIME', 'Temps / Heure', 'What time is it?', 'Quelle heure est-il ?'],
      ['WORK', 'Travail / Travailler', 'I work in the city.', 'Je travaille en ville.'],
      ['NAME', 'Nom', 'My name is Tom.', 'Mon nom est Tom.'],
      ['HELLO', 'Bonjour', 'Hello, how are you?', 'Bonjour, comment vas-tu ?'],
      ['THANKS', 'Merci', 'Thanks for the help.', 'Merci pour l\'aide.'],
      ['PLEASE', 'S\'il vous plaît', 'Milk, please.', 'Du lait, s\'il vous plaît.'],
    ];

    // Supprimer les anciens mots "basics" pour éviter les doublons
    await db.runAsync('DELETE FROM content WHERE family_id = ? AND content_type = "word"', [familyId]);

    // Insérer les 100 mots
    for (const [word, translation, example, exampleTranslation] of core100Words) {
      const data = JSON.stringify({
        word,
        translation,
        example,
        exampleTranslation
      });

      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, 1, 'word', ?, 'easy', 'core100', 'all')`,
        [familyId, data]
      );
    }

    console.log('✅ Migration 028: 100 mots Core ajoutés dans la famille "salutations"');
  },

  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    const basicsFam = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = "salutations"');
    if (basicsFam) {
      await db.runAsync('DELETE FROM content WHERE family_id = ? AND tags = "core100"', [basicsFam.id]);
      console.log('✅ Migration 028 rollback: Core 100 mots supprimés');
    }
  }
);
