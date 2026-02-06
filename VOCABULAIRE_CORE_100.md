# 📚 Vocabulaire Core 100 - Intégration Complète

**Date** : 5 Février 2026
**Statut** : ✅ Implémenté

---

## 🎯 Objectif

Intégrer les **100 mots les plus fréquents en anglais** dans l'application pour le module Vocabulaire (Basics).

---

## 📁 Structure de Données

### Table : `content`

Les mots sont stockés dans la table `content` avec :

```sql
{
  family_id: [ID de la famille "salutations"],
  level: 1,
  content_type: 'word',
  data: JSON({
    word: 'I',
    translation: 'Je',
    example: 'I am a student.',
    exampleTranslation: 'Je suis un étudiant.'
  }),
  difficulty: 'easy',
  tags: 'core100',
  target_audience: 'all'
}
```

### Famille : `salutations` (Basics)

- **Module** : Vocabulaire (`vocab`)
- **Slug** : `salutations`
- **Nom** : Basics
- **Icône** : 👋
- **Description** : Les mots essentiels pour démarrer

---

## 📝 Migration Créée

### Fichier : `028_seed_core_100_words.ts`

```typescript
src/database/migrations/028_seed_core_100_words.ts
```

**Contenu** :
- ✅ Récupère l'ID de la famille "salutations"
- ✅ Supprime les anciens mots basics pour éviter doublons
- ✅ Insère les 100 mots avec exemple + traduction
- ✅ Tag `core100` pour identification facile
- ✅ Rollback possible (suppression via tag)

**Enregistrée dans** :
- `src/database/init.ts` ligne 33 (import)
- `src/database/init.ts` ligne 98 (liste des migrations)

---

## 📋 Liste des 100 Mots Intégrés

### Pronoms (7)
1. I - Je
2. YOU - Tu / Vous
3. HE - Il
4. SHE - Elle
5. IT - Il / Elle (objet/animal)
6. WE - Nous
7. THEY - Ils / Elles

### Déterminants Possessifs (6)
8. MY - Mon / Ma / Mes
9. YOUR - Ton / Votre
10. HIS - Son / Sa (à lui)
11. HER - Son / Sa (à elle)
12. OUR - Notre / Nos
13. THEIR - Leur / Leurs

### Verbes Essentiels (14)
14. BE - Être
15. HAVE - Avoir
16. DO - Faire
17. GO - Aller
18. COME - Venir
19. GET - Obtenir / Devenir
20. MAKE - Fabriquer / Faire
21. TAKE - Prendre
22. PUT - Mettre / Poser
23. USE - Utiliser
24. WANT - Vouloir
25. LIKE - Aimer / Apprécier
26. CAN - Pouvoir
27. EAT - Manger

### Articles & Démonstratifs (4)
28. A / AN - Un / Une
29. THE - Le / La / Les
30. THIS - Ce / Ceci
31. THAT - Ce / Cela (éloigné)

### Conjonctions (5)
32. AND - Et
33. BUT - Mais
34. OR - Ou
35. BECAUSE - Parce que
36. SO - Donc / Alors

### Prépositions (8)
37. WITH - Avec
38. WITHOUT - Sans
39. FOR - Pour
40. IN - Dans
41. ON - Sur
42. AT - À / Chez
43. UNDER - Sous
44. TO - Vers / À

### Mots Interrogatifs (6)
45. FROM - De / Depuis
46. WHO - Qui
47. WHAT - Quoi / Quel
48. WHERE - Où
49. WHEN - Quand
50. WHY - Pourquoi
51. HOW - Comment

### Réponses & Négations (4)
52. YES - Oui
53. NO - Non
54. NOT - Ne... pas
55. ALL - Tout / Tous

### Quantificateurs (3)
56. SOME - Du / Quelques
57. EVERY - Chaque

### Adverbes de Temps (8)
58. NOW - Maintenant
59. TODAY - Aujourd'hui
60. TOMORROW - Demain
61. YESTERDAY - Hier
62. ALWAYS - Toujours
63. NEVER - Jamais
64. SOMETIMES - Parfois

### Adverbes de Lieu (2)
65. HERE - Ici
66. THERE - Là-bas

### Adjectifs Courants (10)
67. BIG - Grand
68. SMALL - Petit
69. GOOD - Bon / Bien
70. BAD - Mauvais
71. HAPPY - Heureux
72. SAD - Triste
73. HOT - Chaud
74. COLD - Froid
75. HUNGRY - Avoir faim
76. THIRSTY - Avoir soif

### Verbes Actions (8)
77. DRINK - Boire
78. SLEEP - Dormir
79. SAY - Dire
80. TELL - Raconter / Dire à
81. KNOW - Savoir / Connaître
82. THINK - Penser
83. LOOK - Regarder
84. SEE - Voir

### Verbes Sensoriels (2)
85. LISTEN - Écouter
86. HEAR - Entendre

### Noms Communs (9)
87. MAN - Homme
88. WOMAN - Femme
89. CHILD - Enfant
90. FRIEND - Ami
91. SCHOOL - École
92. HOUSE - Maison
93. WATER - Eau
94. FOOD - Nourriture
95. TIME - Temps / Heure

### Concepts Généraux (1)
96. WORK - Travail / Travailler
97. NAME - Nom

### Formules de Politesse (3)
98. HELLO - Bonjour
99. THANKS - Merci
100. PLEASE - S'il vous plaît

---

## 🚀 Comment Utiliser

### Dans l'Application

1. **Lancer l'app**
   ```bash
   npm start
   ```

2. **La migration s'exécute automatiquement**
   - Au premier lancement après ajout
   - Les 100 mots sont insérés dans la DB

3. **Accéder au vocabulaire**
   - Module Vocabulaire → Basics (👋)
   - Les 100 mots sont disponibles pour les exercices

### Vérifier en DB

```bash
# Ouvrir la DB SQLite
sqlite3 janacore.db

# Compter les mots Core 100
SELECT COUNT(*) FROM content WHERE tags = 'core100';
# Résultat attendu : 100

# Voir les premiers mots
SELECT json_extract(data, '$.word'), json_extract(data, '$.translation')
FROM content
WHERE tags = 'core100'
LIMIT 10;
```

---

## 📦 Format JSON des Mots

Chaque mot est stocké ainsi :

```json
{
  "word": "HELLO",
  "translation": "Bonjour",
  "example": "Hello, how are you?",
  "exampleTranslation": "Bonjour, comment vas-tu ?"
}
```

**Avantages** :
- ✅ Exemples contextualisés
- ✅ Traductions des exemples
- ✅ Format extensible (image, audio, etc.)
- ✅ Facilement queryable en SQL

---

## 🔄 Maintenance

### Ajouter un Mot

```typescript
// Dans la migration 028
['NEW_WORD', 'Nouvelle Traduction', 'Example sentence.', 'Phrase exemple.']
```

### Modifier un Mot

```sql
UPDATE content
SET data = json_set(data, '$.translation', 'Nouvelle Traduction')
WHERE json_extract(data, '$.word') = 'HELLO' AND tags = 'core100';
```

### Supprimer un Mot

```sql
DELETE FROM content
WHERE json_extract(data, '$.word') = 'WORD_TO_DELETE' AND tags = 'core100';
```

---

## 📊 Statistiques

- **Nombre total** : 100 mots
- **Niveau** : 1 (Débutant)
- **Difficulté** : easy
- **Tag** : core100
- **Audience** : all (tous niveaux)
- **Module** : vocab
- **Famille** : salutations (Basics)

---

## 🎯 Prochaines Étapes

### Court Terme
- [ ] Tester l'affichage dans VocabularyExerciceScreen
- [ ] Vérifier que les 100 mots apparaissent bien
- [ ] Valider les exemples et traductions

### Moyen Terme
- [ ] Ajouter les 200 mots suivants (101-300)
- [ ] Créer des sous-familles (Pronouns, Verbs, etc.)
- [ ] Ajouter des images/emojis aux mots

### Long Terme
- [ ] Compléter jusqu'à 800 mots (Core 800)
- [ ] Système de révision espacée (SRS)
- [ ] Exercices adaptatifs basés sur les erreurs

---

## ✅ Checklist

- [x] Migration 028 créée
- [x] 100 mots parsés depuis 100mots.md
- [x] Format JSON correct (word, translation, example, exampleTranslation)
- [x] Migration enregistrée dans init.ts
- [x] Tag 'core100' pour identification
- [x] Famille 'salutations' (Basics) utilisée
- [x] Rollback possible
- [x] Documentation complète

---

## 🎓 Conclusion

Les **100 mots les plus fréquents en anglais** sont maintenant intégrés dans l'application. Ils sont :
- ✅ Stockés dans la base de données SQLite
- ✅ Accessibles via le module Vocabulaire → Basics
- ✅ Avec exemples et traductions
- ✅ Prêts pour les exercices et révisions

**Au prochain lancement de l'app, les mots seront automatiquement disponibles !** 🚀

---

**Développé avec ❤️ par l'équipe JanaArchitect**
