# 🚀 Kibbitz' Corner

**AI Automation & Bridge Software Solutions** - Nancy, Grand-Est, France 🇫🇷

[![Website](https://img.shields.io/badge/Website-lekibbitz.fr-a855f7?style=flat-square)](https://lekibbitz.fr)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![n8n](https://img.shields.io/badge/n8n-Workflows-ff6d5a?style=flat-square&logo=n8n)](https://n8n.io)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)

## 🎯 What I Build

- **⚡ Workflow Automation** - n8n workflows connecting your tools
- **🎙️ Voice AI Assistants** - Vapi + Claude for 24/7 personalized phone assistants
- **📧 AI Newsletters** - Automated content generation with Claude
- **🃏 Bridge Tournament Tools** - Advanced algorithms (MILP vs FFB), section generators & FFBClubNet automation
- **🎮 Discord Bots** - Custom integrations for communities
- **🗄️ Data Infrastructure** - Supabase, PostgreSQL, APIs, Docker, Cloud

## 📂 Repository Structure

```
├── bridge-comet/             # 🃏 Bridge Generator Suite - Advanced tournament tools
│   ├── bridge-section-generator-v2.html # Main tournament generator
│   ├── bridge-generator-app.js          # Core application logic
│   └── archive/              # Previous versions and extensions
├── examples/                 # Algorithm analysis and comparisons
│   ├── milp-vs-ffb-iv-pp-pe-ranking.md  # MILP vs FFB comparison
│   └── vacances-bleues-milp-proof.md    # Mathematical proof with real data
├── workflows/                # n8n workflow exports (JSON)
├── scripts/                  # Utility scripts (parsing, automation)
├── _archive/                 # Archived projects and documentation
└── _bmad/                    # Business Meta-Analysis & Design framework
```

## 🃏 Bridge Comet - Featured Project

Advanced bridge tournament generator suite with MILP optimization and FFB integration.

### Features
- **🎯 Smart Section Distribution** - Optimized player distribution with MILP vs FFB algorithm comparison
- **📊 Real-time Visualization** - Interactive charts and tables
- **🧮 Advanced Algorithm Analysis** - IV gap optimization, tournament equity calculations
- **🔧 FFBClubNet Integration** - Automated CSV import/export via Windows service
- **🌐 Cross-browser Extension** - Chrome & Firefox support
- **📱 Responsive Design** - Works on all devices

### Quick Start
```bash
# Clone repository
git clone https://github.com/LeKibbitz/kibbitz-corner.git

# Access Bridge Generator
open bridge-comet/bridge-section-generator-v2.html

# Run MILP algorithm analysis
node scripts/parse-vacances-bleues.js
```

[📊 MILP vs FFB Analysis](examples/milp-vs-ffb-iv-pp-pe-ranking.md) | [🏆 Vacances Bleues Proof](examples/vacances-bleues-milp-proof.md)

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **AI/LLM** | Claude, OpenAI, Deepgram, ElevenLabs |
| **Automation** | n8n, Webhooks, MCP Servers |
| **Database** | Supabase, PostgreSQL |
| **Voice** | Vapi, Twilio |
| **Frontend** | JavaScript, HTML5, CSS3 |
| **Backend** | Node.js, Express, WebSocket |
| **Hosting** | Docker, Traefik, Hostinger VPS |

## 🚀 Other Featured Projects

### Daily AI Report
Automated newsletter aggregating AI news from 15+ RSS sources, generated with Claude Haiku.
- Runs daily at midnight
- French summary with key insights
- Logs API usage to Supabase

### TSB Voice Assistant
AI phone assistant for sports facility reservations (Tennis, Squash, Badminton).
- 24/7 availability
- Real-time booking via Supabase
- Multi-language support

## 📖 Documentation

- [🃏 Bridge Comet Documentation](bridge-comet/README.md)
- [📊 MILP Algorithm Analysis](examples/milp-vs-ffb-iv-pp-pe-ranking.md)
- [🏆 Real Tournament Proof](examples/vacances-bleues-milp-proof.md)
- [📱 Project Setup Guide](CLAUDE.md)

### 🧮 Algorithm Analysis
- [📊 MILP vs FFB Ranking Analysis](examples/milp-vs-ffb-iv-pp-pe-ranking.md) - Comprehensive comparison of MILP optimization vs FFB Swiss system for bridge tournaments
- [🏆 Vacances Bleues MILP Proof](examples/vacances-bleues-milp-proof.md) - Mathematical proof of MILP superiority in rotation-based tournaments

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛡️ Security

- **No credentials** stored in repository
- **Environment variables** for sensitive data
- **Encrypted storage** for API keys
- **Local-only** FFBClubNet automation
- **CORS protection** for web services

See [SECURITY.md](docs/SECURITY.md) for details.

## 📬 Contact

- **Email**: contact@lekibbitz.fr
- **Website**: [lekibbitz.fr](https://lekibbitz.fr)
- **YouTube**: [@LeKibbitz](https://youtube.com/@LeKibbitz)
- **LinkedIn**: [Thomas Joannès](https://linkedin.com/in/thomas-joannès-music/)

## 📄 License

MIT License - Feel free to use and adapt!

```
Copyright (c) 2026 Thomas Joannès (Le Kibbitz)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

🃏 **Bridge meets AI** - Making tournament management smarter and more efficient.