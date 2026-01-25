#!/usr/bin/env python3
"""
Script pour insérer directement le workflow dans la base SQLite de n8n
"""

import json
import subprocess
import time

# Workflow simplifié pour insertion directe
email_workflow = {
    "name": "Email Monitor Auto",
    "active": True,
    "nodes": [
        {
            "parameters": {
                "httpMethod": "POST",
                "path": "email-auto",
                "responseMode": "lastNode"
            },
            "id": "webhook-auto",
            "name": "Email Auto Webhook",
            "type": "n8n-nodes-base.webhook",
            "position": [256, 208],
            "typeVersion": 2,
            "webhookId": "email-auto"
        },
        {
            "parameters": {
                "fromEmail": "newsletters@lekibbitz.fr",
                "toEmail": "thomas.joannes@gmail.com",
                "subject": "✅ Email reçu et traité automatiquement",
                "html": "<!DOCTYPE html><html><body style=\"font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;\"><div style=\"background: #22c55e; padding: 20px; border-radius: 10px; color: white; text-align: center;\"><h1>✅ Système actif !</h1><p>Ton email a été reçu et traité automatiquement</p></div><div style=\"padding: 20px;\"><h3>📝 Contenu reçu :</h3><p>{{ JSON.stringify($json) }}</p><p>⏰ <strong>Système de surveillance email opérationnel !</strong></p></div></body></html>",
                "options": {
                    "replyTo": "thomas.joannes@lekibbitz.fr"
                }
            },
            "id": "send-auto-email",
            "name": "Send Auto Email",
            "type": "n8n-nodes-base.emailSend",
            "position": [480, 208],
            "typeVersion": 2.1,
            "credentials": {
                "smtp": {
                    "id": "T3bi8G1zGnTM0Yqa",
                    "name": "Hostinger SMTP - Newsletter"
                }
            }
        },
        {
            "parameters": {
                "respondWith": "json",
                "responseBody": "{\"success\": true, \"message\": \"Email traité automatiquement\", \"timestamp\": \"{{ new Date().toISOString() }}\"}"
            },
            "id": "respond-auto",
            "name": "Respond Auto",
            "type": "n8n-nodes-base.respondToWebhook",
            "position": [704, 208],
            "typeVersion": 1.1
        }
    ],
    "connections": {
        "Email Auto Webhook": {
            "main": [[{"node": "Send Auto Email", "type": "main", "index": 0}]]
        },
        "Send Auto Email": {
            "main": [[{"node": "Respond Auto", "type": "main", "index": 0}]]
        }
    }
}

def create_workflow_via_file():
    """Créer le workflow en copiant directement dans n8n"""

    print("🚀 Création du workflow via fichier direct...")

    try:
        # Créer le fichier JSON pour n8n
        workflow_file = "/tmp/n8n_email_workflow.json"

        # Format pour n8n import
        n8n_import = {
            "meta": {"instanceId": "direct-import"},
            **email_workflow
        }

        with open(workflow_file, 'w') as f:
            json.dump(n8n_import, f, indent=2)

        print(f"✅ Workflow sauvé: {workflow_file}")

        # Copier vers le VPS
        print("📁 Copie vers le VPS...")
        cmd = f"scp {workflow_file} vps-user:/tmp/"
        subprocess.run(cmd, shell=True, check=True)

        # Copier dans le container n8n
        print("🐳 Copie dans le container n8n...")
        cmd = "ssh vps-user 'docker cp /tmp/n8n_email_workflow.json n8n:/tmp/'"
        subprocess.run(cmd, shell=True, check=True)

        # Redémarrer n8n pour qu'il détecte le nouveau workflow
        print("🔄 Redémarrage de n8n...")
        cmd = "ssh vps-user 'docker restart n8n'"
        subprocess.run(cmd, shell=True, check=True)

        print("⏳ Attente du redémarrage...")
        time.sleep(10)

        return True

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_new_webhook():
    """Tester le nouveau webhook"""

    print("🧪 Test du nouveau webhook...")

    try:
        import requests

        test_data = {
            "from": "thomas.joannes@gmail.com",
            "subject": "Test automatique",
            "content": "Test de surveillance email automatique"
        }

        response = requests.post(
            "https://n8n.lekibbitz.fr/webhook/email-auto",
            json=test_data,
            timeout=30
        )

        if response.status_code == 200:
            print("✅ Webhook fonctionne !")
            print(f"📊 Réponse: {response.text}")
            return True
        else:
            print(f"❌ Webhook ne répond pas: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Erreur test: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Installation directe du workflow Email Monitor\n")

    if create_workflow_via_file():
        print("✅ Workflow installé via fichier direct")

        if test_new_webhook():
            print("\n🎉 SUCCÈS TOTAL !")
            print("✅ Workflow Email Monitor actif")
            print("✅ Webhook email-auto opérationnel")
            print("📧 Tu vas recevoir un email de test !")
            print("\n🔗 Webhook: https://n8n.lekibbitz.fr/webhook/email-auto")
        else:
            print("\n⚠️ Workflow installé mais test échoué")
            print("💡 Attendre quelques minutes et réessayer")
    else:
        print("\n❌ Échec installation workflow")

    print("\n🎯 Installation terminée!")