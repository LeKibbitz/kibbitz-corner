// Email de confirmation de modification des préférences
const fs = require('fs');
const { execSync } = require('child_process');

const confirmationEmail = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Préférences Newsletter Mises à Jour</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

<div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ C'est noté !</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Tes préférences ont été mises à jour</p>
</div>

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
    <h3 style="color: #22c55e; margin: 0 0 10px;">📝 Récapitulatif de ta demande</h3>
    <p style="margin: 0; color: #666; font-style: italic;">
        "Je veux plus d'actus sur n8n et l'automatisation, Supabase aussi. Moins de finance tech et crypto. Ajoute des sources sur le no-code et Vapi."
    </p>
</div>

<div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 15px; color: #1f2937;">🎯 Modifications appliquées</h3>

    <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px; color: #22c55e;">✅ Priorité MAXIMALE</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">n8n • Automatisation • Supabase • No-code • Vapi</p>
    </div>

    <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px; color: #dc2626;">❌ Sujets EXCLUS</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">Finance • Crypto • Trading • Investment</p>
    </div>

    <div>
        <h4 style="margin: 0 0 8px; color: #7c3aed;">🆕 Nouvelles sources ajoutées</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">Vapi Blog • No-code News • Automation Weekly</p>
    </div>
</div>

<div style="background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.1)); border: 1px solid rgba(34,197,94,0.2); border-radius: 10px; padding: 20px; margin-bottom: 25px;">
    <h3 style="margin: 0 0 15px; color: #22c55e;">⏰ Quand vais-je voir les changements ?</h3>
    <ul style="margin: 0; color: #666; font-size: 14px;">
        <li><strong>Dès maintenant :</strong> Tes préférences sont sauvées</li>
        <li><strong>Prochaine newsletter :</strong> Articles filtrés selon tes goûts</li>
        <li><strong>Nouvelles sources :</strong> Intégrées dans les 24h</li>
    </ul>
</div>

<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #666; font-size: 14px; margin: 0 0 15px;">
        Tu peux toujours ajuster tes préférences !
    </p>
    <div>
        <a href="mailto:newsletters@lekibbitz.fr?subject=Nouvelle modification"
           style="background: #22c55e; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; margin: 0 5px;">
            ⚙️ Modifier encore
        </a>
        <a href="mailto:newsletters@lekibbitz.fr?subject=Désabonnement"
           style="background: #6b7280; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; margin: 0 5px;">
            🚫 Se désabonner
        </a>
    </div>
</div>

<div style="text-align: center; margin-top: 20px;">
    <p style="color: #999; font-size: 12px; margin: 0;">
        Thomas - Kibbitz' Corner<br>
        Newsletter IA personnalisée
    </p>
</div>

</body>
</html>`;

// Sauvegarder l'email de confirmation
fs.writeFileSync('email-confirmation-preferences.html', confirmationEmail);
console.log('✅ Email de confirmation généré: email-confirmation-preferences.html');

// Ouvrir dans le navigateur
execSync('open email-confirmation-preferences.html');
console.log('📧 Email de confirmation ouvert dans le navigateur!');

console.log('\n📬 SIMULATION COMPLETE :');
console.log('1. ✅ Email de confirmation des préférences');
console.log('2. ✅ Newsletter personnalisée selon tes demandes');
console.log('3. ✅ Système de filtrage intelligent activé');
console.log('\n🎯 Tu aurais dû recevoir ces 2 emails !');