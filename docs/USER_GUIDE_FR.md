# 🎮 Guide Utilisateur - Bridge Generator V2

Guide complet pour utiliser l'extension Bridge Generator V2 et le service d'automation FFBClubNet.

## 🚀 Démarrage Rapide

### 1. Installation de l'Extension

#### Chrome
1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez le "Mode développeur" (en haut à droite)
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier `bridge-extension/`

#### Firefox
1. Ouvrez Firefox et allez sur `about:debugging`
2. Cliquez sur "Ce Firefox"
3. Cliquez sur "Charger un module temporaire"
4. Sélectionnez le fichier `manifest-firefox.json`

### 2. Utilisation de Base

1. **Cliquez sur l'icône d'extension** 🃏 dans la barre d'outils
2. **Choisissez une action** :
   - 🎯 **Ouvrir le Générateur** - Générateur complet de tournois
   - 📥 **Injecter dans cette page** - Widget flottant sur la page courante
   - 📝 **Charger données test** - Test rapide avec un tournoi d'exemple

## 🃏 Générateur de Tournois Bridge

### Création d'un Tournoi

1. **Ouvrez le Générateur** via le popup d'extension
2. **Saisissez les détails du tournoi** :
   - Nom du tournoi
   - Nombre de participants
   - Rondes par section
   - Type de mouvement

3. **Configurez les sections** :
   - Distribution automatique selon le nombre de participants
   - Ajustement manuel disponible
   - Validation en temps réel

4. **Générez les résultats** :
   - Affectations des sections
   - Distribution des paires
   - Graphiques de mouvement

### Options d'Export

- **📋 Copier dans le Presse-papiers** - Partage rapide
- **💾 Télécharger CSV** - Pour import dans tableur
- **🔗 Lien de Partage** - Configuration partageable du tournoi
- **📊 Rapport d'Impression** - Feuilles de tournoi professionnelles

## 🏆 Intégration FFBClubNet (Windows)

### Prérequis
- Windows 10/11
- Logiciel FFBClubNet installé
- Node.js 18+ installé

### Processus d'Installation

1. **Installer le service** :
```bash
cd bridge-extension/ffb-service
npm install
npm run install-service
```

2. **Connecter via l'extension** :
   - Ouvrir le popup d'extension
   - Aller à la section "🏆 FFBClubNet"
   - Cliquer sur "🔗 Connecter au service"

### Fonctionnalités

#### 🚀 Lancer FFBClubNet
- Démarrage automatique du logiciel FFBClubNet
- Détection si déjà en cours d'exécution
- Gestion de plusieurs instances

#### 📥 Importer des Données CSV
- Upload de fichiers CSV de tournoi
- Validation automatique des données
- Statut d'import en temps réel

#### 👁️ Surveillance de Fichiers
- Surveillance des dossiers de tournoi
- Notifications de changements en temps réel
- Détection automatique des sauvegardes

## 🎯 Fonctionnalités Avancées

### Extraction de Données Angular
Extraire des données de tournoi depuis des sites Angular :

1. Naviguer vers une page de tournoi
2. Ouvrir le popup d'extension
3. Cliquer sur "🔍 Extraire données Angular"
4. Données automatiquement importées dans le générateur

### Gestion de Configuration
- **💾 Exporter Paramètres** - Sauvegarder vos préférences
- **📂 Importer Paramètres** - Restaurer ou partager les configurations
- **🌙 Mode Sombre** - Interface confortable pour les yeux
- **💾 Sauvegarde Auto** - Ne perdez jamais votre travail

## 🛠️ Dépannage

### Problèmes d'Extension

#### L'extension ne se charge pas
1. Vérifiez que le mode développeur est activé
2. Actualisez la page des extensions
3. Essayez de recharger l'extension

#### Le popup ne s'ouvre pas
1. Épinglez l'extension à la barre d'outils
2. Vérifiez les mises à jour du navigateur
3. Redémarrez le navigateur

### Problèmes du Service FFBClubNet

#### Le service ne se connecte pas
1. **Vérifiez si le service fonctionne** :
```bash
sc query "FFBClubNet Bridge Service"
```

2. **Redémarrez le service** :
```bash
sc stop "FFBClubNet Bridge Service"
sc start "FFBClubNet Bridge Service"
```

3. **Vérifiez les paramètres du pare-feu** :
   - Autorisez les ports 3001 (API REST) et 3002 (WebSocket)
   - Ajoutez une exception pour Node.js

#### L'import CSV échoue
1. **Vérifiez le format de fichier** :
   - Encodage UTF-8
   - Valeurs séparées par des virgules
   - En-têtes dans la première ligne

2. **Vérifiez les permissions de fichier** :
   - Accès en lecture au fichier source
   - Accès en écriture au dossier FFBClubNet

3. **Statut FFBClubNet** :
   - Assurez-vous que FFBClubNet fonctionne
   - Vérifiez les boîtes de dialogue nécessitant une interaction

### Format CSV Courant
```csv
Nom,Prénom,Licence,Club,Section
Dupont,Jean,12345,Club de Bridge Paris,A
Martin,Marie,67890,Bridge Lyon,B
Durand,Pierre,54321,Cartes Nice,A
```

## 🔧 Configuration

### Configuration du Service
Modifiez le fichier `.env` dans le dossier `ffb-service/` :

```env
# Ports du serveur
PORT=3001
WS_PORT=3002

# Chemins FFBClubNet
FFB_EXECUTABLE_PATH="C:\\Program Files\\FFBClubNet\\FFBClubNet.exe"
FFB_DATA_PATH="C:\\FFBClubNet\\Data"

# Sécurité
ALLOWED_ORIGINS="chrome-extension://*,moz-extension://*"
```

### Paramètres d'Extension
Accessibles via l'interface popup :
- **Mode Sombre** - Basculer le thème de l'interface
- **Sauvegarde Auto** - Sauvegarde automatique de configuration
- **Mode Debug** - Logs étendus pour le dépannage

## 📊 Formats de Données

### Formats d'Entrée
- **CSV** - Données de tournoi séparées par des virgules
- **Excel** - Conversion automatique via collage
- **Angular** - Extraction directe depuis des pages web
- **JSON** - Configuration et paramètres

### Formats de Sortie
- **CSV** - Pour import FFBClubNet
- **PDF** - Feuilles de tournoi imprimables
- **HTML** - Rapports web-friendly
- **JSON** - Format d'échange de données

## 🛡️ Sécurité et Confidentialité

### Protection des Données
- **Traitement local** - Aucune donnée envoyée à des serveurs externes
- **Stockage chiffré** - Paramètres sensibles protégés
- **Contrôle utilisateur** - Propriété complète des données

### Sécurité Réseau
- **API locale uniquement** - Service fonctionne sur localhost
- **Protection CORS** - Accès extension uniquement
- **Pas de dépendances externes** - Fonctionnement autonome

## 📞 Support

### Obtenir de l'Aide
- **📧 Email** : contact@lekibbitz.fr
- **🌐 Site Web** : [lekibbitz.fr](https://lekibbitz.fr)
- **📖 Documentation** : Consultez bridge-extension/README.md
- **🐛 Problèmes** : Signalez via les issues GitHub

### Informations de Diagnostic
Lors du signalement de problèmes, incluez :
- Version et type de navigateur
- Version d'extension
- Système d'exploitation
- Messages d'erreur
- Étapes pour reproduire

### Vérification de Santé
Testez si le service fonctionne :
```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "service": "FFB ClubNet Service",
  "version": "1.0.0"
}
```

---

🃏 **Bonne organisation de tournois de bridge !** - Rendre la gestion du bridge sans effort.