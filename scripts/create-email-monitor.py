#!/usr/bin/env python3
"""
Script pour créer le workflow de surveillance email dans n8n
"""

import requests
import json
import time

N8N_URL = "https://n8n.lekibbitz.fr"

# Workflow de surveillance email
email_monitor_workflow = {
    "name": "Email Monitor - Newsletter Preferences",
    "active": True,
    "nodes": [
        {
            "parameters": {
                "httpMethod": "POST",
                "path": "email-preference",
                "responseMode": "lastNode",
                "options": {}
            },
            "id": "webhook-email",
            "name": "Email Preference Webhook",
            "type": "n8n-nodes-base.webhook",
            "position": [256, 208],
            "typeVersion": 2,
            "webhookId": "email-preference"
        },
        {
            "parameters": {
                "jsCode": "// Analyser le contenu de l'email pour extraire les préférences\nconst content = $input.item.json.content || $input.item.json.message || '';\nconst email = $input.item.json.from || $input.item.json.email || 'thomas.joannes@gmail.com';\n\n// Mots-clés techniques\nconst techKeywords = [\n  'n8n', 'supabase', 'automatisation', 'automation', 'no-code', 'vapi',\n  'finance', 'crypto', 'bitcoin', 'trading', 'ai', 'ia'\n];\n\nconst wantsMore = [];\nconst wantsLess = [];\n\n// Analyser le contenu\nconst lowerContent = content.toLowerCase();\n\n// Détection \"plus\" et \"moins\"\ntechKeywords.forEach(keyword => {\n  if (lowerContent.includes(keyword)) {\n    if (lowerContent.includes(`plus`) && lowerContent.indexOf(keyword) > lowerContent.indexOf('plus')) {\n      wantsMore.push({topic: keyword, priority: keyword === 'n8n' ? 10 : 9});\n    }\n    if (lowerContent.includes(`moins`) && lowerContent.indexOf(keyword) > lowerContent.indexOf('moins')) {\n      wantsLess.push({topic: keyword, priority: 8});\n    }\n  }\n});\n\nreturn {\n  email: email,\n  originalContent: content,\n  wantsMore: wantsMore,\n  wantsLess: wantsLess,\n  timestamp: new Date().toISOString()\n};"
            },
            "id": "analyze-email",
            "name": "Analyze Email Content",
            "type": "n8n-nodes-base.code",
            "position": [480, 208],
            "typeVersion": 2.1
        },
        {
            "parameters": {
                "operation": "executeQuery",
                "query": "INSERT INTO newsletter_user_preferences (email, message_type, subject, content, wants_more, wants_less, raw_content, processed_at) VALUES ($1, 'email_received', $2, $3, $4, $5, $6, $7) RETURNING id;",
                "additionalFields": {
                    "queryParameters": [
                        "={{ $json.email }}",
                        "={{ $('Email Preference Webhook').item.json.subject || 'Email Preference' }}",
                        "={{ $json.originalContent }}",
                        "={{ JSON.stringify($json.wantsMore) }}",
                        "={{ JSON.stringify($json.wantsLess) }}",
                        "={{ JSON.stringify($('Email Preference Webhook').item.json) }}",
                        "={{ $json.timestamp }}"
                    ]
                }
            },
            "id": "save-preferences",
            "name": "Save Email Preferences",
            "type": "n8n-nodes-base.postgres",
            "position": [704, 208],
            "typeVersion": 2.5,
            "credentials": {
                "postgres": {
                    "id": "o9ZHFV56HWz8w7cp",
                    "name": "Supabase Kibbitz Corner"
                }
            }
        },
        {
            "parameters": {
                "operation": "executeQuery",
                "query": "UPDATE newsletter_subscribers SET preferences = preferences || jsonb_build_object('wantsMore', $2::jsonb, 'wantsLess', $3::jsonb, 'lastUpdated', $4) WHERE email = $1 RETURNING email, preferences;",
                "additionalFields": {
                    "queryParameters": [
                        "={{ $('Analyze Email Content').item.json.email }}",
                        "={{ JSON.stringify($('Analyze Email Content').item.json.wantsMore) }}",
                        "={{ JSON.stringify($('Analyze Email Content').item.json.wantsLess) }}",
                        "={{ $('Analyze Email Content').item.json.timestamp }}"
                    ]
                }
            },
            "id": "update-user-profile",
            "name": "Update User Profile",
            "type": "n8n-nodes-base.postgres",
            "position": [928, 208],
            "typeVersion": 2.5,
            "credentials": {
                "postgres": {
                    "id": "o9ZHFV56HWz8w7cp",
                    "name": "Supabase Kibbitz Corner"
                }
            }
        },
        {
            "parameters": {
                "fromEmail": "newsletters@lekibbitz.fr",
                "toEmail": "={{ $('Analyze Email Content').item.json.email }}",
                "subject": "✅ Tes préférences newsletter ont été mises à jour !",
                "html": "={{ `<!DOCTYPE html><html><body style=\"font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;\"><div style=\"background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 15px; text-align: center;\"><h1 style=\"color: white; margin: 0;\">✅ C'est noté !</h1><p style=\"color: white;\">Tes préférences ont été mises à jour</p></div><div style=\"padding: 20px;\"><h3>📝 Récapitulatif</h3><p><strong>Ton message :</strong><br>${$('Analyze Email Content').item.json.originalContent}</p><p>⏰ <strong>Dès demain</strong>, ta newsletter sera personnalisée selon tes nouvelles préférences.</p><h4>✅ Sujets prioritaires :</h4><p>${$('Analyze Email Content').item.json.wantsMore.map(item => item.topic).join(', ')}</p><h4>❌ Sujets exclus :</h4><p>${$('Analyze Email Content').item.json.wantsLess.map(item => item.topic).join(', ')}</p></div><div style=\"text-align: center; margin-top: 20px;\"><a href=\"mailto:newsletters@lekibbitz.fr\" style=\"background: #22c55e; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none;\">Modifier à nouveau</a></div></body></html>` }}",
                "options": {
                    "replyTo": "thomas.joannes@lekibbitz.fr"
                }
            },
            "id": "send-confirmation",
            "name": "Send Confirmation Email",
            "type": "n8n-nodes-base.emailSend",
            "position": [1152, 208],
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
                "responseBody": "={{ JSON.stringify({success: true, message: 'Préférences traitées et confirmation envoyée', email: $('Analyze Email Content').item.json.email, wantsMore: $('Analyze Email Content').item.json.wantsMore.length, wantsLess: $('Analyze Email Content').item.json.wantsLess.length}) }}"
            },
            "id": "respond-success",
            "name": "Respond Success",
            "type": "n8n-nodes-base.respondToWebhook",
            "position": [1376, 208],
            "typeVersion": 1.1
        }
    ],
    "connections": {
        "Email Preference Webhook": {
            "main": [[{"node": "Analyze Email Content", "type": "main", "index": 0}]]
        },
        "Analyze Email Content": {
            "main": [[{"node": "Save Email Preferences", "type": "main", "index": 0}]]
        },
        "Save Email Preferences": {
            "main": [[{"node": "Update User Profile", "type": "main", "index": 0}]]
        },
        "Update User Profile": {
            "main": [[{"node": "Send Confirmation Email", "type": "main", "index": 0}]]
        },
        "Send Confirmation Email": {
            "main": [[{"node": "Respond Success", "type": "main", "index": 0}]]
        }
    },
    "pinData": {},
    "settings": {},
    "staticData": {}
}

def create_workflow():
    """Créer le workflow de surveillance email"""
    try:
        print("🚀 Création du workflow Email Monitor...")

        response = requests.post(
            f"{N8N_URL}/rest/workflows",
            json=email_monitor_workflow,
            timeout=30
        )

        if response.status_code == 201:
            workflow_data = response.json()
            print(f"✅ Workflow créé ! ID: {workflow_data.get('id')}")
            return workflow_data
        else:
            print(f"❌ Erreur création: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def activate_workflow(workflow_id):
    """Activer le workflow"""
    try:
        print(f"⚡ Activation du workflow {workflow_id}...")

        response = requests.patch(
            f"{N8N_URL}/rest/workflows/{workflow_id}",
            json={"active": True},
            timeout=30
        )

        if response.status_code == 200:
            print("✅ Workflow activé !")
            return True
        else:
            print(f"❌ Erreur activation: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Erreur activation: {e}")
        return False

def test_email_processing():
    """Tester le traitement d'email"""
    try:
        print("📧 Test du traitement d'email...")

        test_data = {
            "from": "thomas.joannes@gmail.com",
            "to": "newsletters@lekibbitz.fr",
            "subject": "Modification newsletter",
            "content": "Je veux plus d'actus sur n8n et Supabase, moins de finance et crypto",
            "message": "Je veux plus d'actus sur n8n et Supabase, moins de finance et crypto"
        }

        response = requests.post(
            f"{N8N_URL}/webhook/email-preference",
            json=test_data,
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            print("✅ Test réussi !")
            print(f"📊 Résultat: {result}")
            return True
        else:
            print(f"❌ Test échoué: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erreur test: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Création automatique du workflow de surveillance email\n")

    # Créer le workflow
    workflow = create_workflow()

    if workflow:
        workflow_id = workflow.get('id')

        # Attendre un peu
        print("⏳ Attente 3 secondes...")
        time.sleep(3)

        # Activer le workflow
        if activate_workflow(workflow_id):
            print("⏳ Attente activation...")
            time.sleep(5)

            # Tester le système
            if test_email_processing():
                print("\n🎉 SUCCÈS COMPLET !")
                print("✅ Workflow créé et actif")
                print("✅ Surveillance email opérationnelle")
                print("✅ Test de traitement réussi")
                print(f"\n🔗 Webhook: {N8N_URL}/webhook/email-preference")
            else:
                print("\n⚠️ Workflow créé mais test échoué")
        else:
            print("\n❌ Workflow créé mais pas activé")
    else:
        print("\n❌ Échec de création du workflow")

    print("\n🎯 Script terminé!")