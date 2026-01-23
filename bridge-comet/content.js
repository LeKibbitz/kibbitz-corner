// FFB ClubNet & Tournament Manager - Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
        try {
            const result = extractFFBData();

            // NOUVEAUTÉ : Afficher les données directement sur la page FFB pour test
            displayExtractedDataOnPage(result);

            sendResponse({
                success: true,
                data: result.data,
                count: result.count
            });
        } catch (error) {
            console.error('❌ Erreur extraction:', error);
            displayErrorOnPage(error.message);
            sendResponse({
                success: false,
                error: error.message
            });
        }
    }
});

// TEST : Afficher les données extraites directement sur la page FFB
function displayExtractedDataOnPage(result) {
    console.log('🎯 Affichage des données sur la page FFB:', result);

    // Supprimer ancien affichage s'il existe
    const existing = document.getElementById('ffb-extracted-display');
    if (existing) existing.remove();

    // Créer div d'affichage
    const displayDiv = document.createElement('div');
    displayDiv.id = 'ffb-extracted-display';
    displayDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 300px;
        overflow-y: auto;
        background: #28a745;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
    `;

    displayDiv.innerHTML = `
        <h3>✅ EXTRACTION FFB RÉUSSIE</h3>
        <p><strong>${result.count} joueurs trouvés</strong></p>
        <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${result.data}</div>
        <button onclick="this.parentElement.remove()" style="margin-top: 8px; padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px;">Fermer</button>
    `;

    document.body.appendChild(displayDiv);

    // Auto-fermer après 10 secondes
    setTimeout(() => {
        if (displayDiv.parentElement) displayDiv.remove();
    }, 10000);
}

function displayErrorOnPage(errorMessage) {
    console.error('❌ Affichage erreur sur page FFB:', errorMessage);

    const errorDiv = document.createElement('div');
    errorDiv.id = 'ffb-extraction-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: #dc3545;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;

    errorDiv.innerHTML = `
        <h3>❌ ERREUR EXTRACTION FFB</h3>
        <p>${errorMessage}</p>
        <button onclick="this.parentElement.remove()" style="margin-top: 8px; padding: 4px 8px; background: rgba(0,0,0,0.3); color: white; border: none; border-radius: 4px;">Fermer</button>
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        if (errorDiv.parentElement) errorDiv.remove();
    }, 8000);
}

function extractFFBData() {
    // Find tournament table
    const table = document.querySelector('table.summary-table');
    if (!table) {
        throw new Error('Table de tournoi non trouvée');
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        throw new Error('Données du tournoi non trouvées');
    }

    const rows = tbody.querySelectorAll('tr');
    if (rows.length === 0) {
        throw new Error('Aucun joueur trouvé');
    }

    const players = [];

    // Extract all players
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length < 3) continue;

        // Skip first cell (inscription date), get player cells
        for (let j = 1; j < cells.length - 1; j++) { // -1 to skip actions column
            const cell = cells[j];
            const playerDiv = cell.querySelector('div');
            if (playerDiv && !playerDiv.textContent.trim().includes('Actions')) {
                const player = parsePlayer(playerDiv.textContent);
                if (player) players.push(player);
            }
        }
    }

    if (players.length === 0) {
        throw new Error('Impossible d\'extraire les données des joueurs');
    }

    // Format for Bridge Generator
    const formatted = players.map(p =>
        `${p.name} (${p.amount} €)\n${p.license} ( IV = ${p.iv} )`
    ).join('\n\n');

    return {
        data: formatted,
        count: players.length
    };
}

function parsePlayer(text) {
    console.log('🔍 Extension content.js - parsing:', text.substring(0, 100));

    // Nettoyer le texte d'abord (supprimer \n suivis d'espaces)
    const cleanText = text.replace(/\n\s+/g, ' ').trim();
    console.log('🔍 Extension content.js - nettoyé:', cleanText.substring(0, 100));

    // Nouvelle approche: extraire tout entre le titre et le montant
    const fullNameMatch = cleanText.match(/(M\.|Mme)\s+(.+?)\s+\(\s*([0-9.]+)\s*€/);
    if (!fullNameMatch) {
        console.log('❌ Extension content.js - pas de match pour:', cleanText.substring(0, 50));
        return null;
    }

    const title = fullNameMatch[1];
    const fullName = fullNameMatch[2].trim();
    const amount = fullNameMatch[3];

    // Extract license (8 digits) from original text
    const licenseMatch = cleanText.match(/([0-9]{8})/);

    // Extract IV from original text
    const ivMatch = cleanText.match(/IV\s*=\s*([0-9]+)/);

    const result = {
        name: `${title} ${fullName}`,
        amount: amount,
        license: licenseMatch ? licenseMatch[1] : '00000000',
        iv: ivMatch ? ivMatch[1] : '0'
    };

    console.log('✅ Extension content.js - joueur parsé:', result);
    return result;
}