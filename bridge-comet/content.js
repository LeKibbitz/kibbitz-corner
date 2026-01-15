// FFB ClubNet & Tournament Manager - Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract') {
        try {
            const result = extractFFBData();
            sendResponse({
                success: true,
                data: result.data,
                count: result.count
            });
        } catch (error) {
            sendResponse({
                success: false,
                error: error.message
            });
        }
    }
});

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

        // Player 1 (cell 1)
        const player1 = parsePlayer(cells[1].textContent);
        if (player1) players.push(player1);

        // Player 2 (cell 2)
        const player2 = parsePlayer(cells[2].textContent);
        if (player2) players.push(player2);
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
    // Extract name with title
    const nameMatch = text.match(/(M\.|Mme)\s+([A-ZÁÉÈÊËÏÎÔÖÙÛÜŸÇ\s-]+?)\s+([A-Za-záéèêëïîôöùûüÿç\s-]+)/);
    if (!nameMatch) return null;

    // Extract amount
    const amountMatch = text.match(/\(\s*([0-9.]+)\s*€/);
    if (!amountMatch) return null;

    // Extract license (8 digits)
    const licenseMatch = text.match(/([0-9]{8})/);

    // Extract IV
    const ivMatch = text.match(/IV\s*=\s*([0-9]+)/);

    return {
        name: `${nameMatch[1]} ${nameMatch[2].trim()} ${nameMatch[3].trim()}`,
        amount: amountMatch[1],
        license: licenseMatch ? licenseMatch[1] : '00000000',
        iv: ivMatch ? ivMatch[1] : '0'
    };
}