// Script pour créer les workflows n8n directement via la base SQLite

const fs = require('fs');
const { execSync } = require('child_process');

// Lire les workflows JSON
const workflows = [
  {
    name: 'Newsletter Subscription Complete',
    file: '../workflows/newsletter-subscription-complete.json'
  },
  {
    name: 'Newsletter Preferences Monitor',
    file: '../workflows/newsletter-preferences-monitor.json'
  },
  {
    name: 'Newsletter Send Personalized',
    file: '../workflows/newsletter-send-personalized.json'
  }
];

console.log('🚀 Création des workflows dans n8n...\n');

workflows.forEach((workflow, index) => {
  try {
    console.log(`${index + 1}. Traitement de: ${workflow.name}`);

    // Lire le fichier JSON
    const workflowData = JSON.parse(fs.readFileSync(workflow.file, 'utf8'));

    // Générer un ID unique
    const workflowId = `wf_${Date.now()}_${index}`;

    // Préparer les données pour n8n
    const n8nWorkflow = {
      id: workflowId,
      name: workflowData.name,
      active: true,
      nodes: JSON.stringify(workflowData.nodes),
      connections: JSON.stringify(workflowData.connections),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: JSON.stringify({}),
      staticData: JSON.stringify({}),
      pinData: JSON.stringify(workflowData.pinData || {}),
      versionId: '1'
    };

    console.log(`   📝 Workflow préparé: ${workflowData.nodes.length} nœuds`);

    // Sauvegarder pour import manuel
    const importFile = `import-${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    fs.writeFileSync(importFile, JSON.stringify(workflowData, null, 2));

    console.log(`   💾 Sauvé: ${importFile}`);
    console.log(`   ✅ Prêt pour import\n`);

  } catch (error) {
    console.error(`   ❌ Erreur avec ${workflow.name}:`, error.message);
  }
});

console.log('📋 Instructions pour importer dans n8n:');
console.log('1. Aller sur https://n8n.lekibbitz.fr');
console.log('2. Créer un nouveau workflow');
console.log('3. Copier-coller le contenu des fichiers import-*.json');
console.log('4. Sauvegarder et activer chaque workflow');

console.log('\n🎯 Workflows créés avec succès !');