# Configuration n8n API pour Claude Code

## 🎯 Objectif
Permettre à Claude Code de modifier directement vos workflows n8n via l'API REST.

## 📋 Prérequis
- n8n instance accessible sur `https://n8n.lekibbitz.fr`
- Accès admin à votre instance n8n
- Token API n8n généré

## 🔐 Étapes de configuration

### 1. Générer un token API n8n

Dans votre interface n8n (https://n8n.lekibbitz.fr):

1. **Aller dans Settings** → **API Keys**
2. **Cliquer sur "Create API Key"**
3. **Nommer la clé**: `claude-code-access`
4. **Copier le token généré** (commencera par `n8n_api_`)

### 2. Configurer les variables d'environnement

Ajouter ces variables à votre configuration Claude Code:

```bash
# n8n API Configuration
export N8N_API_URL="https://n8n.lekibbitz.fr/api/v1"
export N8N_API_KEY="n8n_api_VOTRE_TOKEN_ICI"
```

### 3. Tester la connectivité

Après configuration, Claude Code pourra:

```bash
# Test de connectivité
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_API_URL/workflows"
```

## 🛠 Actions disponibles après configuration

Une fois configuré, Claude Code pourra:

- ✅ **Lire** tous vos workflows
- ✅ **Modifier** les workflows existants
- ✅ **Créer** de nouveaux workflows
- ✅ **Tester** les workflows
- ✅ **Gérer** les exécutions
- ✅ **Valider** automatiquement

## 🎯 Action immédiate prévue

**Workflow à corriger**: `yusdwatHeTkdsxtL` (Newsletter Subscription)

**Modification exacte**:
- Nœud: "Save to Database"
- Problème: `{{ $json.body.email }}` → `{{ $json.email }}`
- Solution: Requête SQL avec paramètres sécurisés

## 📞 Workflow de test

Après configuration, Claude Code exécutera:

1. **Connexion** à l'API n8n
2. **Récupération** du workflow Newsletter
3. **Modification** du nœud SQL avec paramètres sécurisés
4. **Test** du webhook avec curl
5. **Validation** du fonctionnement

## ⚠️ Sécurité

- Le token API donne accès COMPLET à votre instance n8n
- Utilisez un token dédié pour Claude Code
- Révocable à tout moment depuis l'interface n8n

## 🚀 Avantages

- **Modifications directes** sans interface manuelle
- **Validation automatique** des configurations
- **Tests immédiats** des modifications
- **Documentation automatique** des changements