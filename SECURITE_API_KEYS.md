# 🔐 Sécurité des Clés API - Architecture Complète

**Date** : 5 Février 2026
**Objectif** : Stockage sécurisé des clés API avec expo-secure-store

---

## 🎯 Principe Fondamental

**L'utilisateur est LIBRE et RESPONSABLE de sa clé API.**

- ✅ Il fournit sa propre clé (OpenAI, Mistral, Claude)
- ✅ La clé est stockée de manière ultra-sécurisée sur son appareil
- ✅ Il contrôle ses limites d'usage (coûts à sa charge)
- ✅ Aucun serveur tiers n'a accès à sa clé

---

## 🏗️ Architecture Hybride Sécurisée

### Stockage en 2 Couches

```
┌─────────────────────────────────────────┐
│  DONNÉES SENSIBLES (Clé API)            │
│  ↓                                       │
│  expo-secure-store                      │
│  • Chiffrement AES-256                  │
│  • Keychain iOS / Keystore Android      │
│  • Isolation par appareil               │
│  • Jamais dans les logs                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  DONNÉES NON-SENSIBLES                   │
│  ↓                                       │
│  SQLite (ai_settings)                   │
│  • Provider (openai/mistral/claude)     │
│  • Model (gpt-3.5-turbo...)             │
│  • Limites quotidiennes                 │
│  • Compteurs d'usage                    │
└─────────────────────────────────────────┘
```

**Avantages** :
- 🔒 Clé API chiffrée (impossible à lire même avec accès à l'appareil)
- ⚡ Settings rapides à charger (SQLite)
- 🧹 Pas de donnée sensible dans les logs ou backups SQLite

---

## 🔐 Niveau de Sécurité : TRÈS ÉLEVÉ

### Protections en Place

#### 1. **Chiffrement Hardware-backed**
```
iOS : Keychain Services
- Chiffrement AES-256
- Protégé par Secure Enclave (iPhone 5s+)
- Accessible uniquement quand déverrouillé
- Effacé si appareil réinitialisé

Android : Keystore System
- Chiffrement AES-256
- Protégé par TEE (Trusted Execution Environment)
- Isolation par app (signature unique)
- Peut nécessiter biométrie (optionnel)
```

#### 2. **Validation du Format**
Avant stockage, la clé est validée :
```typescript
OpenAI   : sk-...          (min 32 chars)
Claude   : sk-ant-...      (min 40 chars)
Mistral  : flexible        (min 20 chars)
```

#### 3. **Masquage dans l'UI**
```typescript
Clé réelle : "sk-abc123def456ghi789jkl"
Affichage  : "sk-abc...jkl"
```

#### 4. **Pas de Logs**
```typescript
// ❌ JAMAIS ça
console.log('API Key:', apiKey);

// ✅ TOUJOURS ça
console.log('[SecureStorage] ✅ Clé récupérée (longueur: X chars)');
```

#### 5. **Limites Quotidiennes**
- Reset automatique tous les jours (24h)
- Bloque les appels si limite atteinte
- Configurable par l'utilisateur

---

## 📦 Fichiers Créés/Modifiés

### 1. **SecureStorage.ts** - Service de Sécurité
📁 `src/services/SecureStorage.ts`

**API du service** :
```typescript
import secureStorage from '@/services/SecureStorage';

// Stocker (chiffré)
await secureStorage.saveAPIKey(apiKey);

// Récupérer (déchiffré)
const key = await secureStorage.getAPIKey();

// Supprimer
await secureStorage.deleteAPIKey();

// Vérifier l'existence
const hasKey = await secureStorage.hasAPIKey();

// Valider le format
const valid = secureStorage.validateAPIKeyFormat(key, 'openai');

// Masquer pour affichage
const masked = secureStorage.maskAPIKey(key); // "sk-abc...xyz"
```

**Sécurité renforcée** :
```typescript
const SECURE_OPTIONS = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: false, // Mettre true pour forcer Touch ID
};
```

---

### 2. **Migration 027** - Table Settings (SANS clé API)
📁 `src/database/migrations/027_create_ai_settings.ts`

**Schéma** :
```sql
CREATE TABLE ai_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),

  -- Paramètres (NON-SENSIBLES)
  provider TEXT NOT NULL,      -- 'openai' | 'mistral' | 'claude'
  model TEXT NOT NULL,
  max_tokens INTEGER,
  temperature REAL,

  -- Limites
  max_messages_per_day INTEGER,
  current_usage_count INTEGER,
  last_reset_date INTEGER,

  is_configured INTEGER,       -- 0 = non config, 1 = config

  created_at INTEGER,
  updated_at INTEGER
);
```

**⚠️ IMPORTANT** : `api_key` n'est PAS dans SQLite !

---

### 3. **useAISettings.ts** - Hook Hybride
📁 `src/hooks/useAISettings.ts`

**Flux de chargement** :
```typescript
1. Charger settings depuis SQLite (provider, model, limites)
2. Charger clé API depuis SecureStore (chiffrée)
3. Combiner les deux sources
4. isConfigured = true SSI clé API présente
```

**Flux de sauvegarde** :
```typescript
1. Valider format clé API
2. Stocker clé dans SecureStore (chiffré AES-256)
3. Stocker settings dans SQLite (non-sensibles)
4. Update is_configured = 1
```

---

### 4. **SettingsAIScreen.tsx** - UI Sécurisée
📁 `src/screens/SettingsAIScreen.tsx`

**Warnings affichés** :
```
🛡️ Chiffrement AES-256
Ta clé API est stockée dans le Keychain iOS / Keystore Android.
Elle n'est jamais partagée ni visible dans les logs.

⚠️ Tu es responsable de ta clé
Les coûts liés à l'API sont à ta charge.
Configure une limite quotidienne pour éviter les frais excessifs.
```

**Actions disponibles** :
- ✅ Configurer provider + clé API
- ✅ Choisir le modèle
- ✅ Définir la limite quotidienne
- ✅ **Supprimer la clé API** (avec confirmation)
- ✅ Validation du format avant sauvegarde

---

## 🚀 Flux Utilisateur Complet

### Configuration Initiale

1. **Obtenir une clé API**
   ```
   OpenAI     : https://platform.openai.com/api-keys
   Mistral    : https://console.mistral.ai/api-keys
   Claude     : https://console.anthropic.com/settings/keys
   ```

2. **Ouvrir Settings → Configuration IA**
3. **Choisir le provider** (OpenAI, Mistral, Claude)
4. **Coller la clé API**
   - Format validé en temps réel
   - Masquée avec `secureTextEntry`
5. **Choisir le modèle**
   - Liste adaptée au provider
6. **Configurer la limite** (ex: 50 messages/jour)
7. **Enregistrer (Chiffré)**
   - ✅ Validation format
   - ✅ Chiffrement AES-256
   - ✅ Stockage Keychain/Keystore
   - ✅ Feedback utilisateur

### Utilisation

1. **Ouvrir AI Tutor**
2. Le hook charge automatiquement :
   - Settings depuis SQLite (rapide)
   - Clé API depuis SecureStore (déchiffrée)
3. Vérification `canSendMessage()` :
   - ✅ Clé présente ?
   - ✅ Limite non atteinte ?
4. Appel API avec clé déchiffrée
5. Incrémentation du compteur

### Suppression

1. **Settings → Configuration IA**
2. **Bouton "Supprimer la clé API"**
3. **Confirmation** : "Ta clé sera effacée du Keychain"
4. **Suppression** :
   - Clé effacée de SecureStore
   - is_configured = 0 dans SQLite
   - Reset des compteurs

---

## 🔒 Comparaison : Avant vs Après

| Aspect | ❌ Avant (SQLite seul) | ✅ Après (SecureStore) |
|--------|------------------------|------------------------|
| **Chiffrement** | Aucun | AES-256 hardware-backed |
| **Protection** | Visible si DB exportée | Keychain/Keystore isolé |
| **Logs** | Risque de fuite | Jamais loggée |
| **Backup** | Incluse dans backup | Exclue des backups |
| **Accès** | Lecture facile | Nécessite déverrouillage |
| **Biométrie** | Non supportée | Optionnelle (Touch ID) |
| **Sécurité** | ⚠️ Moyenne | ✅ Très élevée |

---

## ⚠️ Limites et Recommandations

### Limitations Actuelles

1. **Appareil compromis (jailbreak/root)** :
   - Si l'appareil est compromis, la clé peut être récupérée
   - Recommandation : Ne pas jailbreak/root

2. **Debug logs** :
   - Vérifier qu'aucun `console.log(apiKey)` n'existe
   - Code review avant chaque merge

3. **Web non supporté** :
   - SecureStore ne fonctionne que sur iOS/Android natif
   - Pour web : considérer des alternatives (backend proxy)

### Recommandations Futures (V2)

1. **Biométrie obligatoire** :
   ```typescript
   requireAuthentication: true  // Force Touch ID/Face ID
   ```

2. **Rotation automatique** :
   - Générer une clé temporaire chaque jour
   - Utiliser un backend proxy sécurisé

3. **Audit trail** :
   - Logger les accès à la clé (timestamp uniquement)
   - Détection d'usage anormal

4. **Multi-devices** :
   - Synchronisation sécurisée via iCloud Keychain

---

## 📊 Statistiques de Sécurité

### Niveaux de Protection

```
┌─────────────────────────────────────┐
│  Niveau 1 : Aucun chiffrement       │ ❌
│  (Clé en clair dans SQLite)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Niveau 2 : Chiffrement software    │ ⚠️
│  (Clé chiffrée mais extractible)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Niveau 3 : Hardware-backed         │ ✅ IMPLÉMENTÉ
│  (Secure Enclave / TEE)             │
│  • AES-256                           │
│  • Keychain iOS / Keystore Android  │
│  • Isolation matérielle              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Niveau 4 : Hardware + Biométrie    │ 🔮 V2
│  (Touch ID/Face ID requis)          │
└─────────────────────────────────────┘
```

**Nous sommes au Niveau 3** : Sécurité de niveau bancaire 🏦

---

## 🧪 Tests de Sécurité

### Scénarios de Test

#### ✅ Test 1 : Export de la DB
```bash
# Extraire janacore.db de l'appareil
adb pull /data/data/com.joud/databases/janacore.db

# Ouvrir la DB
sqlite3 janacore.db "SELECT * FROM ai_settings"

# Résultat attendu :
provider | model | ... | is_configured
openai   | gpt-3.5-turbo | ... | 1

# ❌ api_key ABSENTE de la table
```

#### ✅ Test 2 : Recherche de logs
```bash
# Filtrer les logs pour "sk-"
adb logcat | grep "sk-"

# Résultat attendu : AUCUNE clé visible
# Seuls ces logs sont OK :
[SecureStorage] ✅ Clé récupérée (longueur: 51 chars)
```

#### ✅ Test 3 : Validation format
```typescript
// OpenAI valide
validateAPIKeyFormat('sk-abc123...', 'openai') // true

// OpenAI invalide (pas sk-)
validateAPIKeyFormat('abc123...', 'openai') // false

// Claude valide
validateAPIKeyFormat('sk-ant-abc123...', 'claude') // true
```

#### ✅ Test 4 : Limite quotidienne
```typescript
// Simuler 50 messages
for (let i = 0; i < 50; i++) {
  await incrementUsage();
}

// 51ème message
const canSend = canSendMessage(); // false
```

---

## 🎓 Conclusion

### Ce Qui Est Sécurisé ✅

- **Clé API** : Chiffrée AES-256, stockée dans Keychain/Keystore
- **Validation** : Format vérifié avant stockage
- **Isolation** : Pas de logs, pas de backup non chiffré
- **Contrôle utilisateur** : Limites configurables, suppression facile

### Ce Que L'Utilisateur Doit Savoir 📢

1. **Tu es responsable de ta clé** :
   - Les coûts API sont à ta charge
   - Configure une limite quotidienne

2. **Ta clé est sécurisée** :
   - Chiffrement de niveau bancaire
   - Jamais partagée avec des tiers

3. **Tu gardes le contrôle** :
   - Supprime ta clé quand tu veux
   - Change de provider à tout moment
   - Ajuste tes limites

---

**🔐 La sécurité est notre priorité. Ton IA, ta clé, ta liberté.** 🚀

---

**Développé avec ❤️ par l'équipe JanaArchitect**
