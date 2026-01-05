# Kibbitz' Corner - Project Context

## Owner
Thomas Joannès (Le Kibbitz) - Fort-de-France, Martinique

## Stack technique
- **Automation**: n8n (https://n8n.lekibbitz.fr)
- **Database**: Supabase (VPS port 5433)
- **Voice AI**: Vapi
- **LLM**: Claude (Anthropic), OpenAI
- **Hosting**: Hostinger VPS KVM2, Docker, Traefik

## Conventions
- Code et variables en anglais
- Documentation en français
- Logs via workflow "Log exec X"
- MIT License

## Projets actifs

### Daily AI Report
Newsletter automatique agrégant les news IA de 15+ sources RSS.
- Exécution quotidienne à minuit
- Résumé en français avec Claude Haiku
- Logs API vers Supabase

### TSB Voice Assistant
Assistant téléphonique IA pour réservations sportives (Tennis, Squash, Badminton).
- Base de données: `supabase_tsb_db` (port 5433)
- Tables: sites, clients, resources, bookings
- Intégration Vapi + n8n

### Website (lekibbitz.fr)
Site vitrine avec design "storyboard" scrolling naturel.
- Thème violet/rose
- Particules animées
- Responsive

## Structure du repo
```
├── docs/           # Documentation
├── sql/            # Schemas et migrations
├── html/           # Assets HTML
├── workflows/      # n8n exports (à créer)
└── scripts/        # Utilitaires (à créer)
```

## Accès VPS
```bash
ssh vps-user
```

## Commandes utiles
```bash
# Logs n8n
docker logs n8n -f

# Restart services
docker compose restart

# Supabase CLI
supabase db diff
```

## Contact
- Email: contact@lekibbitz.fr
- Website: https://lekibbitz.fr
- YouTube: @LeKibbitz
