# 🛡️ Security Guidelines

Comprehensive security documentation for the Kibbitz' Corner project, ensuring safe deployment and usage.

## 🔒 Overview

This project implements multiple layers of security to protect user data, prevent unauthorized access, and maintain system integrity. All sensitive operations are performed locally with encrypted storage.

## 🚨 Security Principles

### 1. **Local-First Architecture**
- All FFBClubNet automation runs locally on user's Windows machine
- No sensitive tournament data transmitted to external servers
- Bridge extension processes data in browser sandbox
- Zero external dependencies for core functionality

### 2. **Encryption at Rest**
- API keys encrypted using AES-256-CBC
- Master key stored separately from encrypted data
- Tournament data protected with local encryption
- User settings encrypted before storage

### 3. **Network Security**
- CORS protection restricts access to extension origins only
- WebSocket connections limited to localhost
- No external API calls from sensitive components
- Firewall-friendly local-only operation

## 🔐 Credential Management

### Environment Variables
**Never commit these to repository:**

```bash
# FFB Service (.env)
FFB_EXECUTABLE_PATH="C:\\Program Files\\FFBClubNet\\FFBClubNet.exe"
FFB_API_KEY="your-api-key-here"
MASTER_ENCRYPTION_KEY="32-byte-hex-key"
SERVICE_PASSWORD="secure-service-password"

# Database connections
DB_CONNECTION_STRING="postgresql://user:pass@localhost:5432/db"
SUPABASE_SECRET_KEY="your-supabase-secret"
```

### Encrypted Storage
The service uses the `SecurityManager` class for secure storage:

```javascript
import { SecurityManager } from './config/security.js';

const security = new SecurityManager(logger);

// Store encrypted secrets
await security.saveSecrets({
  ffbApiKey: "sensitive-api-key",
  databasePassword: "db-password"
});

// Retrieve decrypted secrets
const secrets = await security.loadSecrets();
```

## 🔧 Configuration Security

### Production Configuration
Create secure production config:

```bash
# Copy example and customize
cp bridge-extension/ffb-service/.env.example .env

# Set restrictive permissions
chmod 600 .env

# Never commit .env files
echo ".env" >> .gitignore
```

### Service Installation
When installing as Windows service:

```bash
# Install with restricted permissions
npm run install-service

# Verify service runs under restricted account
sc qc "FFBClubNet Bridge Service"

# Check service permissions
sc sdshow "FFBClubNet Bridge Service"
```

## 🌐 Network Security

### CORS Configuration
Strict origin control in service:

```javascript
// server.js
app.use(cors({
  origin: [
    'chrome-extension://*',
    'moz-extension://*',
    'http://localhost:*'  // Development only
  ],
  credentials: true
}));
```

### Port Security
- **3001**: REST API (localhost only)
- **3002**: WebSocket (localhost only)
- No external exposure
- Firewall rules recommended

### Certificate Validation
For production HTTPS:

```bash
# Generate self-signed certificate for localhost
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## 🗃️ Data Protection

### Sensitive Data Types
Protected data includes:
- Tournament participant lists (GDPR compliance)
- FFBClubNet database files (.mdb)
- User credentials and API keys
- Bridge club member information
- Payment and subscription data

### Data Classification
| Level | Examples | Protection |
|-------|----------|------------|
| **Public** | Tournament schedules | None required |
| **Internal** | Club rosters | Local encryption |
| **Confidential** | Personal data | AES-256 + access control |
| **Secret** | API keys, passwords | Encrypted storage + HSM |

### Data Retention
- Tournament data: Retained locally only
- Logs: 30 days maximum retention
- User settings: Until user deletion
- Temporary files: Cleaned on service restart

## 🚪 Access Control

### Service Permissions
Windows service runs with minimal permissions:

```xml
<!-- Service configuration -->
<service>
  <name>FFBClubNet Bridge Service</name>
  <account>LocalService</account>
  <privileges>SeServiceLogonRight</privileges>
  <restrictions>
    <deny>SeNetworkLogonRight</deny>
    <deny>SeInteractiveLogonRight</deny>
  </restrictions>
</service>
```

### Extension Permissions
Minimal browser permissions:

```json
{
  "permissions": [
    "activeTab",      // Current tab only
    "storage",        // Local storage only
    "tabs",          // Tab management
    "downloads"       // File export only
  ],
  "host_permissions": []  // No host access required
}
```

## 🔍 Monitoring & Auditing

### Security Logging
Comprehensive audit trail:

```javascript
// Security events logged
logger.audit({
  event: 'FFB_SERVICE_ACCESS',
  user: 'extension',
  action: 'csv_import',
  resource: 'tournament_data.csv',
  result: 'success',
  timestamp: new Date().toISOString()
});
```

### File Integrity Monitoring
Track changes to sensitive files:

```javascript
// CSV watcher with integrity checks
const watcher = new CSVWatcher(logger);
watcher.on('change', (event) => {
  logger.security({
    type: 'FILE_MODIFIED',
    path: event.filePath,
    checksum: event.integrity,
    timestamp: event.timestamp
  });
});
```

### Health Monitoring
Regular security health checks:

```bash
# Check service status
curl http://localhost:3001/api/health

# Verify file permissions
npm run security-audit

# Review logs for anomalies
tail -f logs/security.log
```

## 🚨 Incident Response

### Threat Detection
Monitor for:
- Unauthorized file access
- Unusual network connections
- Failed authentication attempts
- Service tampering
- Data exfiltration attempts

### Response Procedures

#### 1. **Immediate Response**
```bash
# Stop service immediately
sc stop "FFBClubNet Bridge Service"

# Disconnect extension
# Close all browser instances

# Isolate system
# Disconnect from network if needed
```

#### 2. **Investigation**
```bash
# Review security logs
cat logs/security.log | grep ERROR

# Check file integrity
npm run integrity-check

# Verify service configuration
sc qc "FFBClubNet Bridge Service"
```

#### 3. **Recovery**
```bash
# Restore from clean backup
# Rotate all credentials
# Update security configurations
# Restart with monitoring
```

## 🔄 Updates & Patches

### Security Update Process
1. **Test in isolated environment**
2. **Backup current configuration**
3. **Apply updates with verification**
4. **Monitor for anomalies**
5. **Rollback plan ready**

### Automated Security Checks
```bash
# Package vulnerability scanning
npm audit

# Dependency security check
npx audit-ci --moderate

# Code security analysis
npx eslint-plugin-security
```

## 📋 Security Checklist

### Deployment Checklist
- [ ] All credentials removed from code
- [ ] Environment variables configured
- [ ] CORS origins properly restricted
- [ ] Service permissions minimized
- [ ] Logging and monitoring enabled
- [ ] Backup and recovery tested
- [ ] Network access restricted
- [ ] File permissions secured

### Regular Security Tasks
- [ ] Review logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate credentials quarterly
- [ ] Security audit annually
- [ ] Backup verification monthly
- [ ] Access review quarterly

## 📞 Security Contacts

### Reporting Security Issues
- **Email**: security@lekibbitz.fr
- **Response Time**: 24 hours for critical issues
- **Encryption**: PGP key available on request
- **Coordinated Disclosure**: 90-day window for fixes

### Emergency Response
- **Critical**: Immediate service shutdown
- **High**: Response within 4 hours
- **Medium**: Response within 24 hours
- **Low**: Response within 1 week

## 🔗 Additional Resources

- [OWASP Security Guidelines](https://owasp.org)
- [Node.js Security Best Practices](https://nodejs.org/en/security/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Windows Service Security](https://docs.microsoft.com/en-us/windows/security/)

---

🛡️ **Security is everyone's responsibility** - Report issues early and often.