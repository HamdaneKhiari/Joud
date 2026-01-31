# 📝 NOTES DATABASE - GESTION DE LA BASE DE DONNÉES

---

## 🔄 SYSTÈME DE RESET AUTOMATIQUE (DEV)

### **Fichier concerné**
`src/database/init.ts`

### **Variable de contrôle**
```typescript
const FORCE_RESET_DB = true;  // ← Ligne 26
```

### **Comportement**

#### **FORCE_RESET_DB = true**
- ✅ La DB est **supprimée et recréée** à chaque lancement
- ✅ Toutes les migrations sont réexécutées
- ✅ **Parfait pour le développement** quand tu modifies le schéma ou ajoutes de la data
- ⚠️ **Attention** : Toutes les données sont perdues à chaque relance

#### **FORCE_RESET_DB = false**
- ✅ La DB est **conservée** entre les relances
- ✅ Seules les **nouvelles migrations** sont exécutées
- ✅ Les données sont **persistées**
- ⚠️ Si tu modifies une migration déjà exécutée, elle ne sera PAS rejouée

### **Reset automatique sur erreur**
Le système détecte automatiquement ces erreurs en DEV :
- `"no such column"`
- `"no such table"`
- `"UNIQUE constraint failed"`
- `"NOT NULL constraint failed"`

→ Si une de ces erreurs survient, la DB est **automatiquement supprimée et recréée** !

---

## 🎯 DÉMARCHE DE DÉVELOPPEMENT

### **PHASE 1 : Développement actif (ACTUELLEMENT)**
**Objectif** : Tester et modifier rapidement les données et le schéma

✅ **Configuration actuelle** :
```typescript
const FORCE_RESET_DB = true; // ← ACTIVÉ
```

**Workflow** :
1. Modifier les fichiers de migration (ex: `004_seed_content_vocab.ts`)
2. Ajouter/modifier de la data dans les tableaux `contentSeed`
3. Sauvegarder le fichier
4. Relancer l'app → **DB reset automatique**
5. Tester les nouvelles données dans l'app
6. Répéter 1-5 jusqu'à satisfaction

**Avantages** :
- ✅ Modifications instantanées
- ✅ Pas besoin de gérer les anciens états
- ✅ Toujours un état "propre" de la DB

**Inconvénients** :
- ❌ Données perdues à chaque relance
- ❌ Impossible de tester la progression utilisateur

---

### **PHASE 2 : Validation des données**
**Objectif** : Stabiliser les données et tester la persistance

🔄 **Passer en mode stable** :

#### **Étape 1 : Désactiver le reset forcé**
Fichier : `src/database/init.ts` ligne 26
```typescript
const FORCE_RESET_DB = false; // ← DÉSACTIVÉ
```

#### **Étape 2 : Relancer l'app**
```bash
npm start
```

→ La DB existante est conservée
→ Nouvelles migrations exécutées uniquement

#### **Étape 3 : Tester la persistance**
- ✅ Ferme et relance l'app plusieurs fois
- ✅ Vérifie que les données persistent
- ✅ Vérifie que la progression utilisateur est sauvegardée
- ✅ Teste les révisions espacées (SRS) sur plusieurs jours

**Si tout va bien** → Passe à la Phase 3

**Si problème détecté** :
1. Remets `FORCE_RESET_DB = true`
2. Corrige les migrations
3. Reteste
4. Reviens à cette étape

---

### **PHASE 3 : Production (à venir)**
**Objectif** : Déployer l'app avec des données finales

✅ **Configuration finale** :
```typescript
const FORCE_RESET_DB = false; // ← TOUJOURS DÉSACTIVÉ
```

**Actions à faire** :

#### **1. Nettoyer les migrations**
- ✅ Vérifier que toutes les migrations sont **finales**
- ✅ **NE PLUS MODIFIER** les migrations déjà déployées
- ✅ Pour les corrections, créer une **nouvelle migration** (017, 018, etc.)

#### **2. Supprimer les données de test**
- ❌ Supprimer les contenus "Lorem ipsum" ou "Test"
- ✅ Ne garder que les **vraies données pédagogiques**

#### **3. Vérifier l'intégrité**
Fichier : `src/database/init.ts`
```typescript
// Optionnel : Ajouter une vérification d'intégrité
const checkDatabaseIntegrity = async (db: SQLite.SQLiteDatabase) => {
  const result = await db.getFirstAsync<{ integrity_check: string }>(
    'PRAGMA integrity_check'
  );
  if (result?.integrity_check !== 'ok') {
    throw new Error('Database integrity check failed!');
  }
};
```

#### **4. Désactiver complètement le reset en prod**
```typescript
// ⚠️ NE JAMAIS ACTIVER EN PRODUCTION
const FORCE_RESET_DB = false;

// Protection supplémentaire
if (!__DEV__ && FORCE_RESET_DB) {
  throw new Error('FORCE_RESET_DB must be false in production!');
}
```

---

## 🛠️ GESTION DES MIGRATIONS EN PRODUCTION

### **Règle d'or**
> **JAMAIS modifier une migration déjà déployée !**

### **Cas d'usage : Correction d'une erreur**

**❌ MAUVAISE APPROCHE** :
```typescript
// Ne JAMAIS faire ça si la migration est déjà déployée !
// migration004_seed_content_vocab.ts
[4, 1, 'word', JSON.stringify({ word: 'Cat', translation: 'Chat' })], // Correction
```

**✅ BONNE APPROCHE** :
Créer une nouvelle migration de correction :
```typescript
// 017_fix_vocab_cat.ts
export default createMigration(
  17,
  'fix_vocab_cat',
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      `UPDATE content SET data = ?
       WHERE family_id = 4 AND level = 1 AND data LIKE '%Cat%'`,
      [JSON.stringify({ word: 'Cat', translation: 'Chat', example: 'I have a cat.', image: '🐱' })]
    );
    console.log('[Migration 017] ✓ Fixed Cat translation');
  }
);
```

Puis ajouter dans `init.ts` :
```typescript
import migration017 from './migrations/017_fix_vocab_cat';

const migrations = [
  // ... migrations existantes
  migration017, // ← Nouvelle migration
];
```

---

## 📊 MONITORING DE LA DB

### **Vérifier l'état actuel**
Ajouter temporairement dans `init.ts` après les migrations :
```typescript
// Debug: Afficher l'état de la DB
const status = await runner.getStatus(migrations);
console.log('📊 Migration Status:', status);

// Compter le contenu
const counts = await db.getAllAsync(`
  SELECT
    c.content_type,
    c.target_audience,
    COUNT(*) as count
  FROM content c
  GROUP BY c.content_type, c.target_audience
`);
console.log('📊 Content Counts:', counts);
```

### **Tester les queries avec target_audience**
```typescript
// Tester le filtrage par audience
const primaryWords = await getContentByFamilyAndLevel(db, 4, 1, 'primary');
const adultWords = await getContentByFamilyAndLevel(db, 4, 1, 'adult');

console.log('Primary words count:', primaryWords.length);
console.log('Adult words count:', adultWords.length);
```

---

## 🔥 COMMANDES UTILES

### **Reset complet forcé (mode manuel)**
1. Ouvrir `src/database/init.ts`
2. Mettre `FORCE_RESET_DB = true`
3. Sauvegarder
4. Relancer l'app
5. Remettre `FORCE_RESET_DB = false` après le reset

### **Vérifier les migrations exécutées**
Console :
```
[Migration] ✓ 001_initial_schema already executed, skipping
[Migration] ✓ 002_seed_core_modules already executed, skipping
...
[Migration] ▶ Running 010_add_target_audience_to_content...
[Migration] ✓ 010_add_target_audience_to_content completed
```

### **Supprimer manuellement la DB (alternative)**

**Android Emulator** :
- Settings → Apps → Joud → Storage → Clear Data

**iOS Simulator** :
- Device → Erase All Content and Settings

**Expo Go** :
- Désinstaller et réinstaller l'app

---

## 📝 CHECKLIST AVANT DE DÉSACTIVER FORCE_RESET_DB

- [ ] Toutes les familles sont créées dans `003_seed_families.ts`
- [ ] Toutes les migrations de contenu ont au moins 5-10 items de test
- [ ] Les 4 publics (primary, college, lycee, adult) ont du contenu
- [ ] Les niveaux sont correctement assignés (1-4 pour primary/college/lycee, 1-7 pour adult)
- [ ] Le champ `target_audience` est bien renseigné partout
- [ ] Pas d'erreurs de migration dans la console
- [ ] L'app s'affiche correctement pour les 4 publics
- [ ] Les queries filtrent correctement par `target_audience`

---

## 🎯 ÉTAT ACTUEL DU PROJET

### **Migrations existantes** : 16

| # | Nom | Statut | Contenu |
|---|-----|--------|---------|
| 001 | initial_schema | ✅ OK | Tables de base |
| 002 | seed_core_modules | ✅ OK | 9 modules |
| 003 | seed_families | ✅ OK | 7 familles (modifiées) |
| 004 | seed_content_vocab | ✅ OK | 20 mots (avec target_audience) |
| 005 | seed_content_wordgames | ✅ OK | ~50 questions |
| 006 | seed_content_assessment | ✅ OK | Questions évaluation |
| 007 | seed_whitelabel | ✅ OK | 4 identités |
| 008 | seed_feedback_messages | ✅ OK | Messages personnalisés |
| 009 | seed_dashboard_data | ✅ OK | Mots du jour, badges, SRS |
| 010 | add_target_audience_to_content | ✅ OK | Ajout colonne target_audience |
| 011 | seed_content_fastvocab | 🟡 VIDE | À remplir (adult) |
| 012 | seed_content_phrases | 🟡 VIDE | À remplir (tous) |
| 013 | seed_content_dialogues | 🟡 VIDE | À remplir (tous) |
| 014 | seed_content_grammar | 🟡 VIDE | À remplir (tous) |
| 015 | seed_content_reading | 🟡 VIDE | À remplir (tous) |
| 016 | seed_content_connector | 🟡 VIDE | À remplir (lycee) |

### **Mode actuel**
```typescript
FORCE_RESET_DB = true  // ← Phase 1 : Développement actif
```

### **Prochaine étape**
1. Remplir les migrations 011-016 avec de la vraie data
2. Tester avec les 4 publics
3. Passer à `FORCE_RESET_DB = false` (Phase 2)

---

## 🚨 ERREURS FRÉQUENTES ET SOLUTIONS

### **Erreur : "no such column: target_audience"**
**Cause** : Migration 010 pas exécutée
**Solution** :
```typescript
FORCE_RESET_DB = true  // Reset complet
```

### **Erreur : "UNIQUE constraint failed: families.slug"**
**Cause** : Tentative d'insérer une famille avec un slug déjà existant
**Solution** :
- Vérifier les doublons dans `003_seed_families.ts`
- Ou activer le reset : `FORCE_RESET_DB = true`

### **Erreur : "no such table: content"**
**Cause** : Migration 001 pas exécutée
**Solution** :
```typescript
FORCE_RESET_DB = true  // Reset complet
```

### **Données ne s'affichent pas pour un public**
**Causes possibles** :
1. `target_audience` mal renseigné (vérifier `'primary'` vs `'college'`)
2. Query ne filtre pas correctement
3. Niveau incorrect (primary a seulement 1-4, adult a 1-7)

**Solution** :
- Vérifier les logs de migration
- Utiliser le monitoring DB pour compter le contenu par audience

---

**Dernière mise à jour** : 31 janvier 2026
**Mode actuel** : Phase 1 - Développement actif (FORCE_RESET_DB = true)
