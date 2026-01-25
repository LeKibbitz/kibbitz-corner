#!/usr/bin/env python3
"""
Script pour créer un workflow de test dans n8n via l'API
"""

import requests
import json
import time

# Configuration
N8N_URL = "https://n8n.lekibbitz.fr"

# Workflow de test simple
test_workflow = {
    "name": "Newsletter Test Simple",
    "active": True,
    "nodes": [
        {
            "parameters": {
                "httpMethod": "POST",
                "path": "newsletter-test",
                "responseMode": "lastNode",
                "options": {}
            },
            "id": "webhook",
            "name": "Newsletter Test Webhook",
            "type": "n8n-nodes-base.webhook",
            "position": [256, 208],
            "typeVersion": 2,
            "webhookId": "newsletter-test"
        },
        {
            "parameters": {
                "fromEmail": "newsletters@lekibbitz.fr",
                "toEmail": "thomas.joannes@gmail.com",
                "subject": "🎯 Test Newsletter Personnalisée",
                "html": """<!DOCTYPE html>
<html><body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #a855f7, #ec4899); padding: 30px; border-radius: 15px; text-align: center;">
    <h1 style="color: white; margin: 0;">📧 Daily AI Report</h1>
    <p style="color: white;">Newsletter personnalisée de test</p>
</div>
<h2>Articles pour toi</h2>
<div style="background: white; border: 1px solid #ccc; padding: 20px; margin: 10px 0; border-radius: 10px;">
    <span style="background: #a855f7; color: white; padding: 4px 8px; border-radius: 15px; font-size: 12px;">PRIORITÉ 10/10</span>
    <h3>n8n 1.0 Released</h3>
    <p>Major automation platform update with Supabase integration.</p>
</div>
<p style="text-align: center; color: #666;">Test réussi ! ✅</p>
</body></html>""",
                "options": {
                    "replyTo": "thomas.joannes@lekibbitz.fr"
                }
            },
            "id": "send_email",
            "name": "Send Test Email",
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
                "responseBody": '{"success": true, "message": "Test envoyé !"}',
                "options": {
                    "responseCode": 200
                }
            },
            "id": "respond",
            "name": "Respond Success",
            "type": "n8n-nodes-base.respondToWebhook",
            "position": [704, 208],
            "typeVersion": 1.1
        }
    ],
    "connections": {
        "Newsletter Test Webhook": {
            "main": [[{
                "node": "Send Test Email",
                "type": "main",
                "index": 0
            }]]
        },
        "Send Test Email": {
            "main": [[{
                "node": "Respond Success",
                "type": "main",
                "index": 0
            }]]
        }
    },
    "pinData": {},
    "settings": {},
    "staticData": {},
    "meta": {}
}

def create_workflow():
    """Créer le workflow via l'API REST de n8n"""

    # Essayer sans authentification d'abord (mode développement)
    try:
        response = requests.post(
            f"{N8N_URL}/rest/workflows",
            json=test_workflow,
            timeout=30
        )

        if response.status_code == 201:
            print("✅ Workflow créé avec succès!")
            print(f"ID: {response.json().get('id')}")
            return response.json()
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def activate_workflow(workflow_id):
    """Activer le workflow"""
    try:
        response = requests.patch(
            f"{N8N_URL}/rest/workflows/{workflow_id}",
            json={"active": True},
            timeout=30
        )

        if response.status_code == 200:
            print("✅ Workflow activé!")
            return True
        else:
            print(f"❌ Erreur activation: {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur activation: {e}")
        return False

def test_webhook():
    """Tester le webhook"""
    try:
        response = requests.post(
            f"{N8N_URL}/webhook/newsletter-test",
            json={"test": True},
            timeout=30
        )

        if response.status_code == 200:
            print("✅ Test webhook réussi!")
            print(f"Response: {response.text}")
            return True
        else:
            print(f"❌ Test webhook échoué: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur test webhook: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Création du workflow de test n8n...")

    # Créer le workflow
    workflow = create_workflow()

    if workflow:
        workflow_id = workflow.get('id')

        # Attendre un peu
        print("⏳ Attente de 3 secondes...")
        time.sleep(3)

        # Activer le workflow
        if activate_workflow(workflow_id):
            # Attendre l'activation
            print("⏳ Attente de l'activation...")
            time.sleep(5)

            # Tester le webhook
            test_webhook()

    print("\n🎯 Script terminé!")