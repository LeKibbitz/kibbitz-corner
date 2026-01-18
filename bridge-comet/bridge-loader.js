/**
 * BRIDGE LOADER - Sans CSP inline
 * Chargement propre des scripts sans violation CSP
 */

console.log('🚀 Bridge Loader - Chargement sans CSP');

// Charger directement via script tag - Compatible CSP
function loadMainScript() {
    const mainScript = document.createElement('script');
    mainScript.src = 'bridge-generator-v2.js';
    mainScript.onload = () => {
        console.log('✅ Bridge Generator V2 JavaScript loaded successfully');

        // CORRECTION URGENTE: Charger les corrections immédiatement
        setTimeout(() => {
            const fixScript = document.createElement('script');
            fixScript.src = 'bridge-fix-urgent.js';
            fixScript.onload = () => console.log('🚨 CORRECTIONS URGENTES CHARGÉES');
            document.head.appendChild(fixScript);
        }, 1000);

        // CORRECTION D'URGENCE: Charger la correction des boutons immédiatement
        setTimeout(() => {
            const emergencyScript = document.createElement('script');
            emergencyScript.src = 'bridge-emergency-fix.js';
            emergencyScript.onload = () => console.log('🆘 CORRECTION D\'URGENCE BOUTONS CHARGÉE');
            document.head.appendChild(emergencyScript);
        }, 1500);
    };
    mainScript.onerror = () => {
        console.error('❌ Error loading main JavaScript');
        loadFallbackVersion();
    };
    document.head.appendChild(mainScript);
}

// Démarrer le chargement
loadMainScript();

// Version de fallback si le chargement échoue
function loadFallbackVersion() {
    console.log('🔄 Loading fallback JavaScript version...');

    // Charger bridge-generator-simple.js en fallback
    const script = document.createElement('script');
    script.src = 'bridge-generator-simple.js';
    script.onload = () => console.log('✅ Fallback version loaded');
    script.onerror = () => console.error('❌ Fallback version failed');
    document.head.appendChild(script);
}