# Joud

App d'apprentissage de l'anglais, white-label, React Native / Expo SDK 54.

Conçue pour 4 publics distincts — Primaire, Collège, Lycée, Adulte — à partir d'une seule base
de code. Chaque public a son propre contenu pédagogique et sa propre identité visuelle, et se
publie comme une app à part entière (nom, icône, identifiant distincts).

## Fonctionnalités

- 6 modules pédagogiques : vocabulaire, phrases, lecture, dialogues, jeux de mots, connecteurs
- Progression suivie localement sur l'appareil — pas de compte, pas de serveur
- Tuteur IA optionnel (BYOK — l'utilisateur apporte sa propre clé API OpenAI/Mistral/Claude),
  réservé à collège/lycée/adulte, jamais exposé au public Primaire (enfants)
- Contenu réel disponible pour Primaire et Collège ; Lycée et Adulte en préparation

## Stack

- Expo Router (routing par fichiers)
- SQLite local (`expo-sqlite`) — contenu + progression, migrations versionnées
- AsyncStorage — cache UI (progression rapide, préférences)
- expo-secure-store — clé API IA de l'utilisateur, chiffrée (AES-256)
- expo-audio / expo-speech — lecture audio et synthèse vocale

## Développement

```bash
npm install
npx expo start
```

Avant de commit, la discipline du projet est : `tsc` + tests + lint à zéro.

```bash
npx tsc --noEmit
npx jest --silent
npx eslint src app --ext .ts,.tsx --max-warnings 0
```

## Ajouter ou modifier du contenu

Tout le contenu (mots de vocabulaire, dialogues, exercices, labels...) vit dans la table
`content` de SQLite, peuplée par des **migrations**, pas par des fichiers statiques chargés à
l'exécution. Pour ajouter ou corriger du contenu, on écrit une nouvelle migration — jamais une
modification directe des migrations déjà exécutées en production.

### Étapes

1. **Créer le fichier** `src/database/migrations/0XX_description_courte.ts` (numéro suivant le
   dernier existant — voir `ls src/database/migrations/`).
2. **Écrire la migration** avec `createMigration(version, name, up, down?)` (voir
   `src/database/migrations/runner.ts`). `up` reçoit la `SQLiteDatabase` et fait ses
   `execAsync`/`runAsync`.
   - Pour un import de contenu volumineux : voir
     `007_seed_real_content.ts` (structure des seeds : familles, labels de sous-familles,
     contenu par item).
   - Pour un backfill ciblé sur des données existantes : voir
     `010_backfill_vocab_example_translation.ts` (correction a posteriori d'un champ vide).
3. **Enregistrer la migration à deux endroits** (obligatoire, sinon elle ne tourne jamais) :
   - `src/database/init.ts` — import + ajout dans le tableau `migrations` (ordre croissant).
   - `src/__tests__/testUtils/realDb.ts` — même ajout dans `migrationModules`, pour que les
     tests d'intégration tournent contre un schéma identique à la production.
4. **Vérifier** : `npx tsc --noEmit && npx jest --silent`. Les migrations sont idempotentes
   (`schema_migrations` trace ce qui a déjà tourné) — un utilisateur qui a déjà l'app installée
   ne rejoue que les nouvelles migrations au prochain lancement.

### Où sont les données sources

Les fichiers Excel d'où vient le contenu importé sont dans `src/data/` (ex.
`validation_finale_4tranches_v2.xlsx`). Un script d'import ponctuel (Node, exécuté une fois
pour générer une migration de seed) n'est pas commité par nature — la migration générée l'est.
Si un script d'import est nécessaire, l'écrire dans le scratchpad et ne committer que son
résultat (la migration).

## Builds par public

Un build de production correspond à un seul public verrouillé à la compilation (variable
`EXPO_PUBLIC_LOCKED_AUDIENCE`) — voir [docs/HOWTOPUBLISH.md](docs/HOWTOPUBLISH.md) pour lancer
un build ciblant un public donné.

## Publication

Checklist avant une vraie publication sur les stores (comptes développeur, politique de
confidentialité, etc.) : [docs/BeforePublish.pdf](docs/BeforePublish.pdf).

## Historique

Pour le détail des décisions d'architecture et des bugs résolus au fil des sessions, voir
`task.md`.
