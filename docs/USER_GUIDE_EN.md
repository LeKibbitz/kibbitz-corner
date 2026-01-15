# 🎮 User Guide - Bridge Generator V2

Complete guide for using the Bridge Generator V2 extension and FFBClubNet automation service.

## 🚀 Quick Start

### 1. Install the Extension

#### Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `bridge-extension/` folder

#### Firefox
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest-firefox.json` file

### 2. Basic Usage

1. **Click the extension icon** 🃏 in your browser toolbar
2. **Choose an action**:
   - 🎯 **Open Generator** - Full bridge tournament generator
   - 📥 **Inject in Page** - Add floating widget to current page
   - 📝 **Load Sample Data** - Quick test with example tournament

## 🃏 Bridge Tournament Generator

### Creating a Tournament

1. **Open the Generator** via extension popup
2. **Enter tournament details**:
   - Tournament name
   - Number of participants
   - Rounds per section
   - Movement type

3. **Configure sections**:
   - Automatic distribution based on participant count
   - Manual adjustment available
   - Real-time validation

4. **Generate results**:
   - Section assignments
   - Pair distributions
   - Movement charts

### Export Options

- **📋 Copy to Clipboard** - Quick sharing
- **💾 Download CSV** - For spreadsheet import
- **🔗 Share Link** - Shareable tournament configuration
- **📊 Print Report** - Professional tournament sheets

## 🏆 FFBClubNet Integration (Windows)

### Prerequisites
- Windows 10/11
- FFBClubNet software installed
- Node.js 18+ installed

### Setup Process

1. **Install the service**:
```bash
cd bridge-extension/ffb-service
npm install
npm run install-service
```

2. **Connect via extension**:
   - Open extension popup
   - Go to "🏆 FFBClubNet" section
   - Click "🔗 Connect to service"

### Features

#### 🚀 Launch FFBClubNet
- Automatically start FFBClubNet software
- Detect if already running
- Manage multiple instances

#### 📥 Import CSV Data
- Upload tournament CSV files
- Automatic data validation
- Real-time import status

#### 👁️ File Monitoring
- Watch tournament folders
- Real-time change notifications
- Automatic backup detection

## 🎯 Advanced Features

### Angular Data Extraction
Extract tournament data from Angular-based websites:

1. Navigate to a tournament page
2. Open extension popup
3. Click "🔍 Extract Angular Data"
4. Data automatically imported to generator

### Configuration Management
- **💾 Export Settings** - Backup your preferences
- **📂 Import Settings** - Restore or share configurations
- **🌙 Dark Mode** - Eye-friendly interface
- **💾 Auto-save** - Never lose your work

## 🛠️ Troubleshooting

### Extension Issues

#### Extension not loading
1. Check if Developer mode is enabled
2. Refresh the extensions page
3. Try reloading the extension

#### Popup not opening
1. Pin the extension to toolbar
2. Check for browser updates
3. Restart browser

### FFBClubNet Service Issues

#### Service won't connect
1. **Check if service is running**:
```bash
sc query "FFBClubNet Bridge Service"
```

2. **Restart the service**:
```bash
sc stop "FFBClubNet Bridge Service"
sc start "FFBClubNet Bridge Service"
```

3. **Check firewall settings**:
   - Allow ports 3001 (REST API) and 3002 (WebSocket)
   - Add exception for Node.js

#### CSV import fails
1. **Verify file format**:
   - UTF-8 encoding
   - Comma-separated values
   - Headers in first row

2. **Check file permissions**:
   - Read access to source file
   - Write access to FFBClubNet folder

3. **FFBClubNet status**:
   - Ensure FFBClubNet is running
   - Check for dialog boxes requiring interaction

### Common CSV Format
```csv
Name,First Name,License,Club,Section
Dupont,Jean,12345,Paris Bridge Club,A
Martin,Marie,67890,Lyon Bridge,B
Durand,Pierre,54321,Nice Cards,A
```

## 🔧 Configuration

### Service Configuration
Edit `.env` file in `ffb-service/` folder:

```env
# Server ports
PORT=3001
WS_PORT=3002

# FFBClubNet paths
FFB_EXECUTABLE_PATH="C:\\Program Files\\FFBClubNet\\FFBClubNet.exe"
FFB_DATA_PATH="C:\\FFBClubNet\\Data"

# Security
ALLOWED_ORIGINS="chrome-extension://*,moz-extension://*"
```

### Extension Settings
Accessible via popup interface:
- **Dark Mode** - Toggle interface theme
- **Auto-save** - Automatic configuration backup
- **Debug Mode** - Extended logging for troubleshooting

## 📊 Data Formats

### Input Formats
- **CSV** - Comma-separated tournament data
- **Excel** - Automatic conversion via paste
- **Angular** - Direct extraction from web pages
- **JSON** - Configuration and settings

### Output Formats
- **CSV** - For FFBClubNet import
- **PDF** - Printable tournament sheets
- **HTML** - Web-friendly reports
- **JSON** - Data exchange format

## 🛡️ Security & Privacy

### Data Protection
- **Local processing** - No data sent to external servers
- **Encrypted storage** - Sensitive settings protected
- **User control** - Full data ownership

### Network Security
- **Local-only API** - Service runs on localhost
- **CORS protection** - Extension-only access
- **No external dependencies** - Self-contained operation

## 📞 Support

### Getting Help
- **📧 Email**: contact@lekibbitz.fr
- **🌐 Website**: [lekibbitz.fr](https://lekibbitz.fr)
- **📖 Documentation**: Check bridge-extension/README.md
- **🐛 Issues**: Report via GitHub issues

### Diagnostic Information
When reporting issues, include:
- Browser version and type
- Extension version
- Operating system
- Error messages
- Steps to reproduce

### Health Check
Test if service is working:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "FFB ClubNet Service",
  "version": "1.0.0"
}
```

---

🃏 **Happy bridge tournament organizing!** - Making bridge management effortless.