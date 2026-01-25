// Simulation de génération de newsletter personnalisée pour Thomas

const userPreferences = {
  email: "thomas.joannes@gmail.com",
  topics: ["n8n", "automatisation", "supabase", "no-code", "vapi"],
  filters: {
    include: ["n8n", "automatisation", "supabase"],
    exclude: ["finance", "crypto"]
  },
  wantsMore: [
    { topic: "n8n", priority: 10 },
    { topic: "supabase", priority: 9 },
    { topic: "automatisation", priority: 8 }
  ]
};

// Articles de test avec scoring selon les préférences
const testArticles = [
  {
    title: "n8n 1.0 Released: Major Automation Platform Update",
    content: "n8n announces its 1.0 release with enterprise features, improved UI, and better Supabase integration.",
    source: "n8n Blog",
    score: 10, // Priorité max car contient "n8n" et "supabase"
    category: "automation"
  },
  {
    title: "Supabase Edge Functions Now Support TypeScript",
    content: "Latest Supabase update brings full TypeScript support to edge functions, making serverless development easier.",
    source: "Supabase Blog",
    score: 9, // Priorité élevée pour Supabase
    category: "backend"
  },
  {
    title: "No-Code Tools Market Grows 40% in 2026",
    content: "Research shows no-code and automation platforms like n8n are driving digital transformation.",
    source: "TechCrunch",
    score: 8, // Contient "no-code" et "n8n"
    category: "automation"
  },
  {
    title: "Bitcoin Reaches New All-Time High",
    content: "Cryptocurrency markets surge as Bitcoin breaks $100k for the first time.",
    source: "CoinDesk",
    score: 0, // Exclu car contient "crypto"/"finance"
    category: "finance"
  },
  {
    title: "Vapi Introduces Advanced Voice AI Features",
    content: "New voice synthesis and conversation features make Vapi even more powerful for AI applications.",
    source: "Vapi Blog",
    score: 9, // Nouvelle source demandée
    category: "ai"
  }
];

// Filtrer les articles selon les préférences
const filteredArticles = testArticles
  .filter(article => {
    // Exclure les sujets non désirés
    const hasExcludedTopic = userPreferences.filters.exclude.some(topic =>
      article.title.toLowerCase().includes(topic) ||
      article.content.toLowerCase().includes(topic) ||
      article.category === topic
    );

    return !hasExcludedTopic && article.score > 0;
  })
  .sort((a, b) => b.score - a.score) // Trier par priorité
  .slice(0, 3); // Top 3 articles

// Générer le contenu de newsletter personnalisée
const newsletterContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Daily AI Report Personnalisé - ${new Date().toLocaleDateString('fr-FR')}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

<div style="background: linear-gradient(135deg, #a855f7, #ec4899); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📧 Daily AI Report</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Personnalisé pour toi • ${new Date().toLocaleDateString('fr-FR')}</p>
</div>

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #a855f7;">
    <h3 style="color: #a855f7; margin: 0 0 10px;">🎯 Tes sujets prioritaires aujourd'hui</h3>
    <p style="margin: 0; color: #666;">n8n • Supabase • Automatisation • No-code • Vapi</p>
</div>

<h2 style="color: #333; border-bottom: 2px solid #a855f7; padding-bottom: 10px;">📰 Articles sélectionnés pour toi</h2>

${filteredArticles.map((article, index) => `
<div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="background: #a855f7; color: white; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600;">PRIORITÉ ${article.score}/10</span>
        <span style="margin-left: 10px; color: #666; font-size: 14px;">${article.source}</span>
    </div>

    <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">
        ${article.title}
    </h3>

    <p style="margin: 0; color: #6b7280; line-height: 1.5;">
        ${article.content}
    </p>

    <div style="margin-top: 15px;">
        <span style="background: #f3f4f6; color: #6b7280; padding: 4px 8px; border-radius: 6px; font-size: 12px; text-transform: uppercase;">
            ${article.category}
        </span>
    </div>
</div>
`).join('')}

<div style="background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1)); border: 1px solid rgba(168,85,247,0.2); border-radius: 10px; padding: 20px; margin-top: 30px;">
    <h3 style="margin: 0 0 15px; color: #a855f7;">💡 Pourquoi ces articles ?</h3>
    <ul style="margin: 0; color: #666; font-size: 14px;">
        <li>Priorité maximale pour <strong>n8n</strong> et <strong>Supabase</strong></li>
        <li>Articles sur l'<strong>automatisation</strong> et le <strong>no-code</strong></li>
        <li>Exclusion automatique des sujets finance/crypto</li>
        <li>Nouvelle source <strong>Vapi</strong> ajoutée selon tes demandes</li>
    </ul>
</div>

<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
        Newsletter générée à partir de tes préférences personnalisées
    </p>
    <a href="mailto:newsletters@lekibbitz.fr?subject=Modification Newsletter"
       style="background: #a855f7; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
        ⚙️ Modifier mes préférences
    </a>
</div>

</body>
</html>
`;

console.log("=== NEWSLETTER PERSONNALISÉE GÉNÉRÉE ===");
console.log(`Articles sélectionnés: ${filteredArticles.length}/5`);
console.log(`Articles exclus: ${testArticles.length - filteredArticles.length} (crypto/finance filtrés)`);
console.log("\nContenu HTML généré et prêt pour l'envoi !");
console.log(`Taille: ${newsletterContent.length} caractères`);

// Sauvegarder le contenu pour tests
require('fs').writeFileSync('newsletter-test-personalized.html', newsletterContent);
console.log("\n✅ Fichier sauvé: newsletter-test-personalized.html");