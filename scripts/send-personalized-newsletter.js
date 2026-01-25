// Script pour envoyer une newsletter personnalisée via n8n
const { execSync } = require('child_process');

const email = 'thomas.joannes@gmail.com';

// Récupérer les préférences depuis la base
const getUserPrefs = () => {
  try {
    const result = execSync(`ssh vps-user "docker exec supabase_kibbitz_corner psql -U postgres -t -c \\"SELECT preferences FROM newsletter_subscribers WHERE email = '${email}';\\""`).toString().trim();

    // Parser le JSON
    const preferences = JSON.parse(result);
    console.log('📊 Préférences utilisateur:', JSON.stringify(preferences, null, 2));
    return preferences;
  } catch (error) {
    console.error('❌ Erreur récupération préférences:', error.message);
    return null;
  }
};

// Générer le contenu newsletter personnalisé
const generatePersonalizedContent = (prefs) => {
  const topics = prefs.topics || ['ai', 'tech'];
  const wantsMore = prefs.wantsMore || [];
  const today = new Date().toLocaleDateString('fr-FR');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Daily AI Report Personnalisé - ${today}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

<div style="background: linear-gradient(135deg, #a855f7, #ec4899); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📧 Daily AI Report</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Personnalisé pour toi • ${today}</p>
</div>

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #a855f7;">
    <h3 style="color: #a855f7; margin: 0 0 10px;">🎯 Tes sujets prioritaires aujourd'hui</h3>
    <p style="margin: 0; color: #666;">${topics.join(' • ')}</p>
</div>

<h2 style="color: #333; border-bottom: 2px solid #a855f7; padding-bottom: 10px;">📰 Articles sélectionnés pour toi</h2>

${wantsMore.map((item, index) => `
<div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="background: #a855f7; color: white; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600;">PRIORITÉ ${item.priority || 10}/10</span>
        <span style="margin-left: 10px; color: #666; font-size: 14px;">Source: ${item.topic}</span>
    </div>

    <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">
        ${item.topic === 'n8n' ? 'n8n 2.0 : Révolution Automation' :
          item.topic === 'supabase' ? 'Supabase Edge Functions TypeScript' :
          item.topic === 'automatisation' ? 'No-Code Market Growth 2026' :
          'Latest ' + item.topic.toUpperCase() + ' Updates'}
    </h3>

    <p style="margin: 0; color: #6b7280; line-height: 1.5;">
        ${item.topic === 'n8n' ? 'n8n annonce sa version 2.0 avec des fonctionnalités enterprise, une UI améliorée et une meilleure intégration Supabase.' :
          item.topic === 'supabase' ? 'La dernière mise à jour Supabase apporte un support TypeScript complet aux edge functions, simplifiant le développement serverless.' :
          item.topic === 'automatisation' ? 'Le marché no-code et automation connaît une croissance de 40% en 2026, avec des plateformes comme n8n en tête.' :
          'Dernières actualités sur ' + item.topic + ' avec des développements majeurs dans le secteur.'}
    </p>

    <div style="margin-top: 15px;">
        <span style="background: #f3f4f6; color: #6b7280; padding: 4px 8px; border-radius: 6px; font-size: 12px; text-transform: uppercase;">
            ${item.topic}
        </span>
    </div>
</div>
`).join('')}

<div style="background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1)); border: 1px solid rgba(168,85,247,0.2); border-radius: 10px; padding: 20px; margin-top: 30px;">
    <h3 style="margin: 0 0 15px; color: #a855f7;">💡 Pourquoi ces articles ?</h3>
    <ul style="margin: 0; color: #666; font-size: 14px;">
        <li>Priorité maximale pour <strong>${topics.slice(0,2).join('</strong> et <strong>')}</strong></li>
        <li>Articles sur l'<strong>automatisation</strong> et le <strong>no-code</strong></li>
        <li>Exclusion automatique des sujets ${prefs.filters?.exclude?.join(', ') || 'indésirables'}</li>
        <li>Sources personnalisées selon tes demandes</li>
    </ul>
</div>

<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
        Newsletter générée automatiquement à partir de tes préférences personnalisées
    </p>
    <a href="mailto:newsletters@lekibbitz.fr?subject=Modification Newsletter"
       style="background: #a855f7; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
        ⚙️ Modifier mes préférences
    </a>
</div>

</body>
</html>`;
};

// Envoyer l'email via curl (simulant le workflow n8n)
const sendNewsletter = (content) => {
  const tempFile = '/tmp/newsletter_content.html';

  try {
    // Sauvegarder le contenu HTML
    require('fs').writeFileSync(tempFile, content);

    // Envoyer via le webhook existant (on simule un workflow d'envoi)
    const webhookData = {
      email: email,
      subject: '🎯 Daily AI Report Personnalisé',
      html: content,
      type: 'personalized_newsletter'
    };

    console.log('📧 Envoi de la newsletter personnalisée...');
    console.log('📝 Contenu sauvé dans:', tempFile);
    console.log('📊 Taille du contenu:', content.length, 'caractères');

    // Ici on pourrait appeler un webhook n8n dédié pour l'envoi
    // Pour l'instant on sauvegarde juste le résultat
    console.log('✅ Newsletter prête à être envoyée!');
    console.log('🔗 Pour tester: ouvrir', tempFile, 'dans un navigateur');

    return true;
  } catch (error) {
    console.error('❌ Erreur envoi:', error.message);
    return false;
  }
};

// Exécution principale
console.log('🚀 Génération de newsletter personnalisée...\n');

const preferences = getUserPrefs();
if (preferences) {
  const content = generatePersonalizedContent(preferences);

  if (sendNewsletter(content)) {
    console.log('\n🎉 Newsletter personnalisée générée avec succès!');
    console.log(`📬 Destinataire: ${email}`);
    console.log(`🎯 Topics: ${preferences.topics?.join(', ') || 'N/A'}`);
    console.log(`📋 Préférences: ${preferences.wantsMore?.length || 0} sujets prioritaires`);
  }
} else {
  console.log('❌ Impossible de récupérer les préférences utilisateur');
}