const preferences = {
  content: "Je veux plus d'actus sur n8n et l'automatisation, Supabase aussi. Moins de finance tech et crypto. Ajoute des sources sur le no-code et Vapi."
};

// Analyse basique des préférences
const techKeywords = [
  'n8n', 'automatisation', 'supabase', 'no-code', 'vapi', 'voice',
  'finance', 'crypto', 'blockchain', 'ai', 'ia', 'claude', 'openai',
  'react', 'javascript', 'python', 'docker', 'workflow'
];

const wantsMore = [];
const wantsLess = [];

const content = preferences.content.toLowerCase();

// Détection "plus" et "moins"
if (content.includes('plus')) {
  const plusSection = content.split('plus')[1].split('.')[0];
  techKeywords.forEach(keyword => {
    if (plusSection.includes(keyword)) {
      wantsMore.push({
        topic: keyword,
        priority: keyword === 'n8n' ? 10 : keyword === 'supabase' ? 9 : 8,
        keywords: [keyword]
      });
    }
  });
}

if (content.includes('moins')) {
  const moinsSection = content.split('moins')[1].split('.')[0];
  techKeywords.forEach(keyword => {
    if (moinsSection.includes(keyword)) {
      wantsLess.push({
        topic: keyword,
        priority: 8,
        keywords: [keyword]
      });
    }
  });
}

// Nouvelles sources détectées
const newSources = [];
if (content.includes('vapi')) {
  newSources.push({
    name: 'Vapi Blog',
    url: 'https://vapi.ai/blog',
    priority: 9
  });
}

const result = {
  email: 'thomas.joannes@gmail.com',
  wantsMore: wantsMore,
  wantsLess: wantsLess,
  newSources: newSources,
  filters: {
    include: wantsMore.map(item => item.topic),
    exclude: wantsLess.map(item => item.topic)
  },
  confidence: 0.9
};

console.log(JSON.stringify(result, null, 2));