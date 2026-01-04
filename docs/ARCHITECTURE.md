# Architecture Overview

## Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                    Hostinger VPS                         │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌──────────────────────┐   │
│  │ Traefik │──│   n8n   │──│   Supabase (Postgres) │   │
│  │  :443   │  │  :5678  │  │        :5433          │   │
│  └─────────┘  └─────────┘  └──────────────────────┘   │
│       │                                                 │
│  ┌─────────┐                                           │
│  │ Website │                                           │
│  │  nginx  │                                           │
│  └─────────┘                                           │
└─────────────────────────────────────────────────────────┘

External Services:
├── Anthropic Claude API (LLM)
├── OpenAI API (TTS, embeddings)
├── Vapi (Voice AI)
├── Gmail (SMTP)
└── GitHub (Code)
```

## Data Flow: Daily AI Report

```
[Cron Midnight] 
    → n8n Workflow
    → Fetch 15 RSS sources
    → Filter last 24h articles
    → Claude Haiku summarization
    → Log API call to Supabase
    → Send email via Gmail
    → Save newsletter to Supabase
```

## Database Schema

See `sql/001_crm_schema.sql` for complete schema.

Key tables:
- `newsletter_subscribers` - Email list
- `newsletters` - Generated content
- `api_logs` - Usage tracking
- `feature_requests` - User feedback with voting
