# 🚀 Deployment Guide - Kibbitz' Corner

Complete deployment guide for Bridge Generator V2 and FFBClubNet automation.

## 🎯 Quick Deploy Checklist

### ✅ **Pre-deployment Security Check**
- [ ] All credentials removed from codebase
- [ ] `.env.example` configured, no `.env` committed
- [ ] `.gitignore` comprehensive security rules
- [ ] Security audit completed
- [ ] Documentation complete (EN/FR)

### ✅ **Ready for GitHub**
```bash
# Push to GitHub (assumes remote already configured)
git push origin main

# Verify clean repository
git status
# Should show: "nothing to commit, working tree clean"
```

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js 18+** (for FFB service)
- **Chrome/Firefox** (for extension)
- **Windows 10/11** (for FFBClubNet automation)

### Bridge Extension Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/kibbitz-corner.git
cd kibbitz-corner

# 2. Install in Chrome
# - Open chrome://extensions/
# - Enable Developer mode
# - Click "Load unpacked"
# - Select entire kibbitz-corner/ directory

# 3. Install in Firefox
# - Open about:debugging
# - Click "This Firefox"
# - Click "Load Temporary Add-on"
# - Select manifest-firefox.json
```

### FFB Service Setup (Windows Only)
```bash
# 1. Navigate to service directory
cd ffb-service

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your FFBClubNet paths

# 4. Development mode
npm run dev

# 5. Production service install
npm run install-service
```

## 🌐 Production Deployment

### GitHub Repository Setup
```bash
# 1. Create new GitHub repository
# https://github.com/new

# 2. Add remote origin
git remote add origin https://github.com/your-username/kibbitz-corner.git

# 3. Push to GitHub
git branch -M main
git push -u origin main

# 4. Configure repository settings
# - Set as Public repository
# - Add topics: bridge, tournament, automation, ffb, chrome-extension
# - Configure branch protection (optional)
```

### Chrome Web Store Submission
```bash
# 1. Create extension package
cd kibbitz-corner/
zip -r bridge-generator-v2.zip . -x "*.git*" "ffb-service/node_modules/*" "*.md" "docs/*"

# 2. Submit to Chrome Web Store
# - Visit https://chrome.google.com/webstore/devconsole
# - Create new item
# - Upload bridge-generator-v2.zip
# - Fill store listing details
```

### Firefox Add-ons Submission
```bash
# 1. Create Firefox package
zip -r bridge-generator-firefox.zip . -x "*.git*" "manifest.json" "*.md" "docs/*"

# 2. Submit to Mozilla
# - Visit https://addons.mozilla.org/developers/
# - Submit new add-on
# - Upload bridge-generator-firefox.zip
```

## 🛡️ Security Deployment

### Environment Security
```bash
# Production .env (never commit)
NODE_ENV=production
PORT=3001
WS_PORT=3002
DEBUG=false

# FFBClubNet paths (Windows specific)
FFB_EXECUTABLE_PATH="C:\\Program Files\\FFBClubNet\\FFBClubNet.exe"
FFB_DATA_PATH="C:\\FFBClubNet\\Data"

# Security
ALLOWED_ORIGINS="chrome-extension://*,moz-extension://*"
```

### Service Security
```bash
# Run security audit
npm audit

# Check file permissions
find . -name "*.env*" -exec ls -la {} \;
find . -name "*secret*" -exec ls -la {} \;

# Verify no credentials in git
git log --all --full-history -- "*.env*"
git log --all --full-history -- "*secret*"
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Service health
curl http://localhost:3001/api/health

# Extension health (via browser console)
chrome.runtime.getManifest()
```

### Log Monitoring
```bash
# FFB Service logs
tail -f ffb-service/logs/combined.log

# Windows service logs
Get-EventLog -LogName Application -Source "FFBClubNet Bridge Service"
```

### Update Process
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Develop and test
npm test
npm run build

# 3. Merge and deploy
git checkout main
git merge feature/new-feature
git push origin main

# 4. Update extension stores
# - Chrome Web Store: Upload new ZIP
# - Firefox Add-ons: Upload new XPI
```

## 🌍 Multi-environment Setup

### Development
```bash
NODE_ENV=development
DEBUG=true
CORS_ENABLED=true
```

### Staging
```bash
NODE_ENV=staging
DEBUG=false
CORS_ENABLED=true
```

### Production
```bash
NODE_ENV=production
DEBUG=false
CORS_ENABLED=false
```

## 🚨 Troubleshooting Deployment

### Common Issues

#### Extension not loading
```bash
# Check manifest syntax
jq . manifest.json
jq . manifest-firefox.json

# Verify permissions
ls -la *.js *.html *.css
```

#### Service fails to start
```bash
# Check Node.js version
node --version  # Should be 18+

# Verify dependencies
npm ls

# Check ports availability
netstat -an | findstr :3001
netstat -an | findstr :3002
```

#### FFBClubNet automation fails
```bash
# Verify FFBClubNet installation
ls "C:\Program Files\FFBClubNet\FFBClubNet.exe"

# Check Windows service
sc query "FFBClubNet Bridge Service"

# Test automation
npm run test:ffb
```

## 📞 Support Channels

### User Support
- **Email**: contact@lekibbitz.fr
- **Documentation**: [User Guides](docs/)
- **Issues**: GitHub Issues page

### Developer Support
- **Technical Documentation**: [README.md](README.md)
- **API Documentation**: [ffb-service/README.md](ffb-service/README.md)
- **Security**: [SECURITY.md](docs/SECURITY.md)

## 📈 Metrics & Analytics

### Extension Usage
- Chrome Web Store analytics
- Firefox Add-on statistics
- GitHub repository insights

### Service Performance
```bash
# Monitor service performance
npm run monitor

# API response times
curl -w "@curl-format.txt" http://localhost:3001/api/health
```

---

🚀 **Deployment complete!** Your Bridge Generator V2 is now ready for global users.