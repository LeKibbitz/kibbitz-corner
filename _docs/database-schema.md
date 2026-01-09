# Schéma Base de Données - Kibbitz Corner

## 📊 Vue d'ensemble

```
Supabase PostgreSQL (Port 5433)
├── newsletter_db (à créer/confirmer)
│   └── newsletter_subscribers
└── postgres (base principale)
    ├── players (TSB Voice Assistant)
    ├── system_errors
    ├── system_events
    └── voice_tasks (TSB Voice Assistant)
```

## 📝 Table newsletter_subscribers

**Status**: À créer ou vérifier l'emplacement exact

### Colonnes (basées sur le workflow n8n)

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | UUID | Identifiant unique | PRIMARY KEY, AUTO |
| `email` | VARCHAR | Email du subscriber | UNIQUE, NOT NULL |
| `source` | VARCHAR | Source inscription | DEFAULT 'website' |
| `status` | VARCHAR | Statut actuel | CHECK ('active', 'pending', 'unsubscribed') |
| `subscribed_at` | TIMESTAMP | Date d'inscription | NOT NULL |
| `unsubscribed_at` | TIMESTAMP | Date désabonnement | NULL |
| `metadata` | JSONB | Données supplémentaires | DEFAULT '{}' |
| `confirmation_token` | VARCHAR | Token de confirmation | NULL |
| `confirmed_at` | TIMESTAMP | Date confirmation | NULL |
| `preferences` | JSONB | Préférences utilisateur | DEFAULT '{"topics": ["ia"], "frequency": "daily"}' |

### Contraintes et Index

```sql
-- Contrainte unique sur email
CONSTRAINT uk_newsletter_email UNIQUE (email)

-- Contrainte de vérification du statut
CONSTRAINT newsletter_subscribers_status_check
CHECK (status IN ('active', 'pending', 'unsubscribed'))

-- Index pour les recherches
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_source ON newsletter_subscribers(source);
```

## 🔄 Workflow n8n Integration

### Opération UPSERT
```sql
INSERT INTO newsletter_subscribers (email, source, status, subscribed_at)
VALUES ($1, $2, 'active', $3)
ON CONFLICT (email)
DO UPDATE SET
  status = 'active',
  unsubscribed_at = NULL,
  metadata = newsletter_subscribers.metadata || '{"resubscribed": true}'
RETURNING id, email, status, subscribed_at;
```

### Données d'entrée
- `email`: Validé par regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `source`: 'website' par défaut
- `status`: 'active' automatiquement
- `subscribed_at`: ISO timestamp automatique

## 🏗️ Tables TSB (Tennis/Squash/Badminton)

### players
```
- Gestion des utilisateurs du système de réservation
- Intégration avec Vapi Voice Assistant
```

### voice_tasks
```
- Tâches du système vocal
- Logs des interactions Vapi
```

### system_events & system_errors
```
- Monitoring général du système
- Logs d'erreurs et événements
```

## 🔧 Scripts de Création

### newsletter_subscribers (si besoin)
```sql
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) DEFAULT 'website',
    status VARCHAR(20) CHECK (status IN ('active', 'pending', 'unsubscribed')),
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
    metadata JSONB DEFAULT '{}',
    confirmation_token VARCHAR(255) NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE NULL,
    preferences JSONB DEFAULT '{"topics": ["ia"], "frequency": "daily"}'
);

-- Index pour performances
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_source ON newsletter_subscribers(source);
```

## 📈 Statistiques Attendues

### Métriques newsletter
- **Inscriptions quotidiennes**: Tracked via `subscribed_at`
- **Sources d'acquisition**: Breakdown par `source`
- **Taux de confirmation**: Ratio `confirmed_at` / `subscribed_at`
- **Préférences populaires**: Analyse du JSONB `preferences`

### Monitoring
```sql
-- Inscriptions par jour
SELECT DATE(subscribed_at) as date, COUNT(*)
FROM newsletter_subscribers
GROUP BY DATE(subscribed_at)
ORDER BY date DESC;

-- Répartition par source
SELECT source, COUNT(*),
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM newsletter_subscribers
WHERE status = 'active'
GROUP BY source;
```