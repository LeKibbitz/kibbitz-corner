# 🗄️ Kibbitz Corner - Schéma Base de Données Complet

## 📊 Vue d'ensemble Architecture

```
Supabase PostgreSQL (Port 5433) - kibbitz-crm
├── 🔐 CRM & Contacts
│   ├── contacts (clients/prospects)
│   ├── leads (opportunités commerciales)
│   ├── projects (projets clients)
│   └── interactions (historique communications)
│
├── 📧 Newsletter System
│   ├── newsletter_subscribers (abonnés)
│   └── newsletters (contenus envoyés)
│
├── 📊 RSS & Content
│   ├── rss_sources (sources RSS)
│   ├── rss_items (articles agrégés)
│   ├── rss_playlists (playlists d'abonnés)
│   └── playlist_sources (liens playlists-sources)
│
├── 💡 Feature Management
│   ├── ideas_backlog (idées produit)
│   ├── feature_requests (demandes clients)
│   └── feature_votes (votes communautaires)
│
└── 📈 Monitoring
    └── api_logs (logs système)
```

## 🔐 Module CRM & Contacts

### 👥 contacts
**Gestion centralisée des clients et prospects**

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | UUID | Identifiant unique | PRIMARY KEY |
| `email` | VARCHAR(255) | Email contact | UNIQUE, NOT NULL |
| `first_name` | VARCHAR(100) | Prénom | |
| `last_name` | VARCHAR(100) | Nom | |
| `company` | VARCHAR(200) | Entreprise | |
| `phone` | VARCHAR(50) | Téléphone | |
| `source` | VARCHAR(50) | Source acquisition | DEFAULT 'manual' |
| `tags` | TEXT[] | Tags métier | DEFAULT '{}' |
| `notes` | TEXT | Notes libres | |
| `created_at` | TIMESTAMPTZ | Date création | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | Dernière MAJ | DEFAULT now(), AUTO UPDATE |

**Relations** :
- → `interactions` (1:N) - Historique communications
- → `leads` (1:N) - Opportunités liées
- → `projects` (1:N) - Projets actifs

### 💼 leads
**Pipeline commercial et opportunités**

| Colonne | Type | Description | Statuts |
|---------|------|-------------|---------|
| `contact_id` | UUID | Lien vers contact | FK contacts.id |
| `status` | VARCHAR(30) | État du lead | 'new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost' |
| `source` | VARCHAR(50) | Canal acquisition | |
| `value` | NUMERIC(12,2) | Valeur estimée (€) | |
| `probability` | INTEGER | Probabilité (%) | 0-100 |
| `expected_close` | DATE | Date clôture prévue | |

### 🚀 projects
**Gestion projets clients**

| Colonne | Type | Description | Statuts |
|---------|------|-------------|---------|
| `contact_id` | UUID | Client principal | FK contacts.id |
| `lead_id` | UUID | Lead d'origine | FK leads.id |
| `status` | VARCHAR(30) | État projet | 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled' |
| `budget` | NUMERIC(12,2) | Budget projet (€) | |
| `start_date` | DATE | Date début | |
| `end_date` | DATE | Date fin prévue | |

### 📞 interactions
**Historique communications client**

Relations : `contact_id` → contacts, `project_id` → projects (optionnel)

## 📧 Module Newsletter

### 📨 newsletter_subscribers
**Base abonnés newsletter (ACTIVE !)**

| Colonne | Type | Description | Valeurs |
|---------|------|-------------|---------|
| `id` | UUID | Identifiant unique | PRIMARY KEY |
| `email` | VARCHAR(255) | Email abonné | UNIQUE, NOT NULL |
| `source` | VARCHAR(50) | Source inscription | DEFAULT 'website' |
| `status` | VARCHAR(20) | Statut abonnement | 'pending', 'active', 'unsubscribed', 'bounced' |
| `subscribed_at` | TIMESTAMPTZ | Date inscription | DEFAULT now() |
| `unsubscribed_at` | TIMESTAMPTZ | Date désabonnement | NULL |
| `confirmation_token` | VARCHAR(64) | Token confirmation | NULL |
| `confirmed_at` | TIMESTAMPTZ | Date confirmation | NULL |
| `preferences` | JSONB | Préférences contenu | Default: {"topics": ["ia", "automation", "data", "dev"], "frequency": "daily"} |
| `metadata` | JSONB | Métadonnées custom | DEFAULT '{}' |

**Index & Performances** :
- `idx_newsletter_email` (email) - Recherche rapide
- `idx_newsletter_status` (status) - Filtres statuts
- `idx_newsletter_token` (confirmation_token) - Validation emails

**Relations** :
- → `rss_playlists` (1:N) - Playlists personnalisées

### 📰 newsletters
**Contenus newsletter envoyés**

## 📊 Module RSS & Content

### 📡 rss_sources
**Sources RSS agrégées (15+ sources IA)**

### 📄 rss_items
**Articles collectés quotidiennement**

### 🎵 rss_playlists
**Playlists personnalisées par abonné**

Relations : `subscriber_id` → newsletter_subscribers(id) ON DELETE CASCADE

### 🔗 playlist_sources
**Mapping playlists ↔ sources RSS**

## 💡 Module Feature Management

### 🧠 ideas_backlog
**Backlog produit et idées**

### 🎯 feature_requests
**Demandes clients spécifiques**

### 👍 feature_votes
**Système de vote communautaire**

## 📈 Module Monitoring

### 📊 api_logs
**Logs API et monitoring système**

## 🔄 Workflow n8n Integration

### Newsletter Subscription (ACTIF)
```sql
-- Opération UPSERT sécurisée
INSERT INTO newsletter_subscribers (email, source, status, subscribed_at)
VALUES ($1, $2, 'active', $3)
ON CONFLICT (email)
DO UPDATE SET
  status = 'active',
  unsubscribed_at = NULL,
  metadata = newsletter_subscribers.metadata || '{"resubscribed": true}'
RETURNING id, email, status, subscribed_at;
```

**Endpoint** : `https://n8n.lekibbitz.fr/webhook/newsletter`
**Input** : `{email, source}`
**Output** : `{success: true, message: "Inscription réussie !", email, status, timestamp}`

## 🎯 Métriques Clés

### 📈 CRM Performance
```sql
-- Pipeline commercial
SELECT status, COUNT(*), AVG(value) as avg_deal_size
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status;

-- Projets par statut
SELECT status, COUNT(*), SUM(budget) as total_budget
FROM projects
GROUP BY status;
```

### 📧 Newsletter Analytics
```sql
-- Croissance abonnés (30j)
SELECT DATE(subscribed_at) as date,
       COUNT(*) as new_subs,
       SUM(COUNT(*)) OVER (ORDER BY DATE(subscribed_at)) as total_subs
FROM newsletter_subscribers
WHERE subscribed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(subscribed_at)
ORDER BY date;

-- Répartition par source
SELECT source, COUNT(*),
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM newsletter_subscribers
WHERE status = 'active'
GROUP BY source;

-- Analyse préférences
SELECT jsonb_array_elements_text(preferences->'topics') as topic,
       COUNT(*) as subscribers
FROM newsletter_subscribers
WHERE status = 'active' AND preferences ? 'topics'
GROUP BY topic
ORDER BY subscribers DESC;
```

### 📊 RSS Performance
```sql
-- Sources les plus productives
SELECT rs.url, rs.name,
       COUNT(ri.id) as articles_count,
       MAX(ri.published_at) as latest_article
FROM rss_sources rs
LEFT JOIN rss_items ri ON rs.id = ri.source_id
WHERE ri.published_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY rs.id, rs.url, rs.name
ORDER BY articles_count DESC;
```

## 🛠️ Triggers Automatiques

### Auto-Update Timestamps
```sql
-- Fonction générique mise à jour
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers actifs sur:
-- - contacts.updated_at
-- - projects.updated_at
```

## 🔐 Configuration n8n

**Credentials Supabase** : `"Supabase Kibbitz Corner"`
- Host: `localhost`
- Port: `5433`
- Database: `postgres`
- Container: `supabase_kibbitz_corner`

## 🚀 Roadmap Technique

### Optimisations BDD
- [ ] Partitioning `api_logs` par date
- [ ] Index composite `newsletter_subscribers(status, source)`
- [ ] Archivage automatique anciens `rss_items`

### Nouvelles fonctionnalités
- [ ] Module facturation (invoices, payments)
- [ ] Système notifications (email, SMS)
- [ ] Analytics avancées (cohorts, retention)
- [ ] API webhooks sortants