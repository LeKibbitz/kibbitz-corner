# Plan de test post-configuration API n8n

## 🔬 Tests à exécuter automatiquement

### 1. Test de connectivité API
```bash
# Vérification de l'accès n8n
health_check = await n8n_health_check()
# Attendu: {"status": "ok", "version": "1.x.x"}

# Liste des workflows
workflows = await n8n_list_workflows()
# Attendu: Array contenant le workflow newsletter
```

### 2. Test de modification workflow
```javascript
// Récupération du workflow actuel
original = await n8n_get_workflow({id: "yusdwatHeTkdsxtL"})

// Modification sécurisée
updated = await n8n_update_partial_workflow({
  id: "yusdwatHeTkdsxtL",
  changes: {
    nodes: [/* nœud corrigé */]
  }
})

// Validation
validation = await n8n_validate_workflow({id: "yusdwatHeTkdsxtL"})
```

### 3. Test fonctionnel webhook
```bash
# Test 1: Email valide
curl -X POST https://n8n.lekibbitz.fr/webhook/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "source": "website"}' \
  -w "%{http_code}\n"

# Attendu: 200, {"success": true, "message": "Inscription réussie ! Vérifiez votre email."}

# Test 2: Email sans source
curl -X POST https://n8n.lekibbitz.fr/webhook/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com"}' \
  -w "%{http_code}\n"

# Attendu: 200, source par défaut "website"

# Test 3: Email malformé
curl -X POST https://n8n.lekibbitz.fr/webhook/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}' \
  -w "%{http_code}\n"

# Attendu: Gestion d'erreur gracieuse
```

### 4. Test d'intégration site web
```javascript
// Test depuis le formulaire du site
const formTest = {
  url: "https://lekibbitz.fr",
  action: "fill_newsletter_form",
  email: "integration.test@example.com"
}

// Vérification du comportement UI
// Attendu: Message de succès, pas de redirection mailto
```

### 5. Test base de données
```sql
-- Vérification des insertions
SELECT email, source, status, created_at
FROM newsletter_subscribers
WHERE email LIKE '%test%'
ORDER BY created_at DESC
LIMIT 5;

-- Vérification des conflits (double inscription)
-- Attendu: UPDATE au lieu d'erreur
```

## 📊 Métriques de validation

### Performance
- ⏱️ **Temps de réponse webhook**: < 500ms
- 🔄 **Taux de succès**: 100%
- 💾 **Persistence BDD**: Vérifiée

### Sécurité
- 🛡️ **Injection SQL**: Impossible (paramètres)
- ✅ **Validation email**: Côté client et serveur
- 🔒 **CORS**: Configuré pour lekibbitz.fr

### UX
- 🚫 **Plus de mailto**: Confirmé
- ✅ **Messages d'erreur**: Clairs et informatifs
- 📱 **Responsive**: Fonctionnel mobile/desktop

## 🎯 Checklist final

- [ ] API n8n configurée et testée
- [ ] Workflow modifié et validé
- [ ] Tests webhook passants (3/3)
- [ ] Tests intégration site web OK
- [ ] Base de données mise à jour
- [ ] Rollback plan documenté
- [ ] Monitoring en place

## 🚨 Plan de rollback

En cas de problème:
```bash
# 1. Restaurer l'ancien workflow
await n8n_update_full_workflow({
  id: "yusdwatHeTkdsxtL",
  workflow: originalWorkflow
})

# 2. Vérifier le retour en arrière
await n8n_validate_workflow({id: "yusdwatHeTkdsxtL"})

# 3. Notification
console.log("Rollback effectué - retour à la version précédente")
```

## 🎉 Confirmation de succès

**Message attendu après configuration:**
> ✅ **n8n API configurée avec succès!**
>
> Workflow Newsletter corrigé automatiquement:
> - Erreur 500 → 200 OK ✅
> - Insertion BDD sécurisée ✅
> - Formulaire site fonctionnel ✅
>
> **Test: inscrivez-vous à la newsletter sur https://lekibbitz.fr** 🎯