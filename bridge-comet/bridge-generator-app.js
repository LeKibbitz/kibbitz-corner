// Bridge Generator V2 - JavaScript externe (CSP compliant)

// ===================================================================
// 1. VARIABLES GLOBALES ET ÉTAT
// ===================================================================

let parsedPairs = [];
let mitchellData = [];
let draggedPair = null;
let currentSectionCount = 1;
let nsConstraints = new Set();
let currentPage = 1;
let totalPages = 1;
let tablesPerPage = 10;
let autoPageInterval = null;
let pendingTableCounts = null;
let originalTableCounts = null;
let currentAlgorithm = '147'; // Default
let isDarkMode = false;

// ===================================================================
// 2. UTILITAIRES ET HELPERS
// ===================================================================

function showStatus(message, type = 'info') {
    console.log(`📢 Status: ${message} (${type})`);
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';
    } else {
        console.warn('⚠️ Element status non trouvé');
    }
}

function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

function showDataLoadedNotification(playerCount) {
    const notification = document.createElement('div');
    notification.id = 'ffb-load-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    notification.innerHTML = `
        <span style="font-size: 24px;">✅</span>
        <div>
            <strong style="display: block; font-size: 14px;">Données FFB chargées</strong>
            <span style="font-size: 12px; opacity: 0.9;">${playerCount} joueurs importés depuis l'extension</span>
        </div>
    `;

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function calculateCombinedIV(pair) {
    return (pair.player1?.iv || 0) + (pair.player2?.iv || 0);
}

function testJS() {
    alert('JavaScript fonctionne !');
    console.log('✓ JavaScript test successful');
}

// ===================================================================
// 3. PARSING DES DONNÉES FFB
// ===================================================================

function parseTournamentData(data) {
    const lines = data.split('\n');
    const hasDateFormat = lines.some(line => line.trim().match(/^\d{2}\/\d{2}\/\d{4}/));

    if (hasDateFormat) {
        return parseFFBFormatWithDates(lines);
    } else {
        return parseSimplifiedFormat(lines);
    }
}

function parseFFBFormatWithDates(lines) {
    const pairs = [];
    let currentPair = null;
    let pairNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line || line.includes('Inscription') || line.includes('Nouvelle équipe')) {
            continue;
        }

        if (line.match(/^\d{2}\/\d{2}\/\d{4}/)) {
            if (currentPair && currentPair.player1 && currentPair.player2) {
                pairs.push(currentPair);
            }
            currentPair = { number: pairNumber++, player1: null, player2: null };
            continue;
        }

        const playerMatch = line.match(/^(M\.|Mme)\s+(.+?)\s+\(\s*([\d.,]+)\s*€\s*\)/);
        if (playerMatch) {
            const fullName = playerMatch[2];
            const amount = parseFloat(playerMatch[3].replace(',', '.'));

            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                const licenseMatch = nextLine.match(/(\d{8})\s*\(\s*IV\s*=\s*(\d+)\s*\)/);

                if (licenseMatch) {
                    const player = {
                        name: fullName,
                        license: licenseMatch[1],
                        iv: parseInt(licenseMatch[2]),
                        amount: amount
                    };

                    if (!currentPair.player1) {
                        currentPair.player1 = player;
                    } else if (!currentPair.player2) {
                        currentPair.player2 = player;
                    }

                    i++;
                }
            }
        }
    }

    if (currentPair && currentPair.player1 && currentPair.player2) {
        pairs.push(currentPair);
    }

    return pairs;
}

function parseSimplifiedFormat(lines) {
    const pairs = [];
    const players = [];
    let pairNumber = 1;

    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();

        if (!line) {
            i++;
            continue;
        }

        const playerMatch = line.match(/^(M\.|Mme)\s+(.+?)\s+\(\s*([\d.]+)\s*€\s*\)/);
        if (playerMatch) {
            const fullName = playerMatch[2].trim();
            const amount = parseFloat(playerMatch[3]);

            let nextLineIndex = i + 1;
            while (nextLineIndex < lines.length && !lines[nextLineIndex].trim()) {
                nextLineIndex++;
            }

            if (nextLineIndex < lines.length) {
                const nextLine = lines[nextLineIndex].trim();
                const licenseMatch = nextLine.match(/(\d{8})\s*\(\s*IV\s*=\s*(\d+)\s*\)/);

                if (licenseMatch) {
                    const player = {
                        name: fullName,
                        license: licenseMatch[1],
                        iv: parseInt(licenseMatch[2]),
                        amount: amount
                    };
                    players.push(player);
                    i = nextLineIndex + 1;
                    continue;
                }
            }
        }

        i++;
    }

    // GROUPER LES JOUEURS PAR PAIRES (J1+J2 = Paire 1, J3+J4 = Paire 2...)
    for (let j = 0; j < players.length; j += 2) {
        if (j + 1 < players.length) {
            pairs.push({
                number: pairNumber++,
                player1: players[j],
                player2: players[j + 1]
            });
        } else {
            console.warn('⚠️ Joueur impair sans partenaire:', players[j].name);
            pairs.push({
                number: pairNumber++,
                player1: players[j],
                player2: { name: 'Sans partenaire', license: '00000000', iv: 0, amount: 0 }
            });
        }
    }

    console.log(`📊 DEBUG: Parsed ${players.length} players into ${pairs.length} pairs (simplified format)`);
    console.log(`📊 DEBUG: Expected from 39 players -> 19 pairs + 1 single`);
    return pairs;
}

// ===================================================================
// 4. ALGORITHMES MITCHELL
// ===================================================================

function mitchellDistribution(pairs, sectionCount, useConstraints = false) {
    console.log('🔍 MITCHELL: Starting with', pairs.length, 'pairs,', sectionCount, 'sections');

    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(b) - calculateCombinedIV(a));

    sortedPairs.forEach((pair, i) => {
        if (!pair.id) pair.id = `pair_${i}`;
        pair.combinedIV = calculateCombinedIV(pair);
        pair.nsConstraint = useConstraints && nsConstraints.has(pair.id);
    });

    const totalPairs = pairs.length;
    const hasRelais = totalPairs % 2 === 1;
    const totalTables = hasRelais ? (totalPairs + 1) / 2 : totalPairs / 2;
    const tablesPerSection = Math.ceil(totalTables / sectionCount);

    if (sectionCount > totalTables) {
        console.warn('⚠️ MITCHELL: More sections than tables, adjusting...');
        sectionCount = Math.min(sectionCount, totalTables);
    }

    console.log('🔍 MITCHELL: Total tables:', totalTables, 'Tables per section:', tablesPerSection);

    const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => {
        return Array.from({ length: tablesPerSection }, (_, i) => ({
            tableNumber: i + 1,
            ns: null,
            eo: null
        }));
    });

    try {
        console.log('🔍 MITCHELL: Calling generateMitchellPlacement...');
        const result = generateMitchellPlacement(sections, sortedPairs, sectionCount, useConstraints);

        if (result !== true) {
            console.error('❌ MITCHELL: generateMitchellPlacement failed');
            throw new Error('Failed to generate Mitchell placement');
        }

        console.log('✅ MITCHELL: Distribution complete');
        return sections;

    } catch (error) {
        console.error('❌ MITCHELL: Distribution failed:', error);
        return generateSimpleFallback(sections, sortedPairs);
    }
}

function generateMitchellSequence(totalTables) {
    const round1 = [];
    const round2 = [];
    const round3 = [];

    for (let i = 1; i <= totalTables; i += 3) round1.push(i);
    for (let i = 2; i <= totalTables; i += 3) round2.push(i);
    for (let i = 3; i <= totalTables; i += 3) round3.push(i);

    return [...round1, ...round2, ...round3];
}

function generateMitchellPlacement(sections, sortedPairs, sectionCount, useConstraints) {
    console.log('🔍 MITCHELL: Placement algorithm starting');

    if (currentAlgorithm === '147') {
        return generateTrueMitchellDistribution(sections, sortedPairs, sectionCount);
    } else {
        return generateEquilibratedDistribution(sections, sortedPairs, sectionCount);
    }
}

function generateTrueMitchellDistribution(sections, sortedPairs, sectionCount) {
    console.log('🔄 TRUE MITCHELL: Génération selon règles Mitchell officielles');

    let pairIndex = 0;

    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
        const section = sections[sectionIdx];
        const mitchellSeq = generateMitchellSequence(section.length);

        for (let tableIdx of mitchellSeq) {
            const table = section[tableIdx - 1];
            if (table && pairIndex < sortedPairs.length) {
                table.ns = sortedPairs[pairIndex++];
            }
        }

        for (let tableIdx of mitchellSeq) {
            const table = section[tableIdx - 1];
            if (table && pairIndex < sortedPairs.length) {
                table.eo = sortedPairs[pairIndex++];
            }
        }
    }

    return true;
}

function generateEquilibratedDistribution(sections, sortedPairs, sectionCount) {
    console.log('🔄 EQUILIBRATED: Distribution équilibrée');

    let pairIndex = 0;
    let forward = true;

    while (pairIndex < sortedPairs.length) {
        const sectionsOrder = forward ?
            Array.from({ length: sectionCount }, (_, i) => i) :
            Array.from({ length: sectionCount }, (_, i) => sectionCount - 1 - i);

        for (let s of sectionsOrder) {
            if (pairIndex >= sortedPairs.length) break;

            for (let table of sections[s]) {
                if (!table.ns) {
                    table.ns = sortedPairs[pairIndex++];
                    break;
                } else if (!table.eo) {
                    table.eo = sortedPairs[pairIndex++];
                    break;
                }
            }
        }

        forward = !forward;
    }

    return true;
}

function generateSimpleFallback(sections, sortedPairs) {
    console.log('🔄 FALLBACK: Simple distribution');
    let pairIndex = 0;

    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
        const section = sections[sectionIdx];
        for (let table of section) {
            if (pairIndex < sortedPairs.length) {
                table.ns = sortedPairs[pairIndex++];
            }
            if (pairIndex < sortedPairs.length) {
                table.eo = sortedPairs[pairIndex++];
            }
        }
    }

    return sections;
}

// ===================================================================
// 5. INTERFACE UTILISATEUR
// ===================================================================

function generateSections() {
    console.log('🔍 DEBUG: generateSections() appelée');
    const data = document.getElementById('tournamentData').value;
    const sectionCount = parseInt(document.getElementById('sectionCount').value);

    if (!data.trim()) {
        showStatus('Veuillez entrer les données du tournoi', 'error');
        return;
    }

    try {
        parsedPairs = parseTournamentData(data);

        if (parsedPairs.length === 0) {
            showStatus('Aucune paire valide trouvée dans les données', 'error');
            return;
        }

        currentSectionCount = sectionCount;
        mitchellData = mitchellDistribution(parsedPairs, sectionCount, false);

        const totalIV = parsedPairs.reduce((sum, pair) => sum + calculateCombinedIV(pair), 0);
        const avgIV = Math.round(totalIV / parsedPairs.length);

        showStatus(
            `✅ ${parsedPairs.length} paires réparties en ${sectionCount} section(s) avec algorithme Mitchell`,
            'success'
        );

        // Passer directement à l'affichage Mitchell
        showMitchellDisplay();

    } catch (error) {
        console.error('❌ Generation error:', error);
        showStatus('❌ Erreur lors de la génération', 'error');
    }
}

function displayResults() {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
    }
}

function showMitchellDisplay() {
    document.getElementById('setupView').style.display = 'none';
    document.getElementById('mitchellView').style.display = 'block';
    document.body.classList.add('dark-mode');

    renderMitchellDisplay();
}

function renderMitchellDisplay() {
    if (!mitchellData || mitchellData.length === 0) {
        console.warn('⚠️ No mitchell data to render');
        return;
    }

    const container = document.getElementById('mitchellContainer');
    const sectionNames = ['A', 'B', 'C'];
    const sectionColors = ['section-a', 'section-b', 'section-c'];

    container.innerHTML = '';

    const isSingleSection = currentSectionCount === 1;
    const useTwoColumns = isSingleSection && mitchellData[0] && mitchellData[0].length > 10;

    container.className = `sections-grid ${
        currentSectionCount === 2 ? 'two-sections' :
        currentSectionCount === 3 ? 'three-sections' : ''
    }`;

    if (isSingleSection) {
        document.body.classList.add('single-section');
        if (useTwoColumns) {
            document.body.classList.add('two-columns');
        }
    } else {
        document.body.classList.remove('single-section', 'two-columns');
    }

    mitchellData.forEach((section, sectionIndex) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `section-container ${sectionColors[sectionIndex]}`;
        sectionDiv.dataset.section = sectionIndex;

        const nsCount = section.filter(t => t.ns).length;
        const eoCount = section.filter(t => t.eo).length;
        const nsAvgIV = section.length > 0 ? Math.round(
            section.reduce((sum, table) => sum + (table.ns ? calculateCombinedIV(table.ns) : 0), 0) / nsCount
        ) || 0 : 0;
        const eoAvgIV = section.length > 0 ? Math.round(
            section.reduce((sum, table) => sum + (table.eo ? calculateCombinedIV(table.eo) : 0), 0) / eoCount
        ) || 0 : 0;

        const tableCountControl = `
            <div class="table-count-control">
                <button class="table-count-btn" data-section="${sectionIndex}" data-delta="1" title="Plus de tables">▲</button>
                <div class="table-count-display">
                    <span class="table-count-value">${section.length}</span>
                    <span class="table-icon">
                        <span class="top-suits"><span style="color: #ff0000 !important;">♥</span><span style="color: #000000 !important;">♠</span></span>
                        <span class="bottom-suits"><span style="color: #000000 !important;">♣</span><span style="color: #ff0000 !important;">♦</span></span>
                    </span>
                </div>
                <button class="table-count-btn" data-section="${sectionIndex}" data-delta="-1" title="Moins de tables">▼</button>
            </div>
        `;

        sectionDiv.innerHTML = `
            <div class="section-banner">
                ${tableCountControl}
                <div class="section-letter">${sectionNames[sectionIndex]}</div>
                <div class="section-stats">
                    <div class="section-stats-line">NS</div>
                    <div class="section-stats-line">~${nsAvgIV}</div>
                    <div class="section-stats-line">~${eoAvgIV}</div>
                    <div class="section-stats-line">EO</div>
                </div>
            </div>
            <div class="section-content">
                <div class="tables-grid">
                    ${renderTablesContent(section, sectionIndex, mitchellData.length)}
                </div>
            </div>
        `;

        container.appendChild(sectionDiv);
    });

    const totalPairs = parsedPairs.length;
    const totalIV = parsedPairs.reduce((sum, pair) => sum + calculateCombinedIV(pair), 0);
    const avgIV = Math.round(totalIV / parsedPairs.length);
    const today = new Date().toLocaleDateString('fr-FR');

    document.getElementById('tournamentTitle').textContent =
        `Bon tournoi au BCNJ - ${today} - ${totalPairs} paires, IV moyen ${avgIV}`;

    console.log('✅ Mitchell display rendered');
}

function renderTablesContent(section, sectionIndex, totalSections) {
    if (totalSections === 1) {
        // Pour une section : diviser en deux colonnes
        const midPoint = Math.ceil(section.length / 2);
        const leftTables = section.slice(0, midPoint);
        const rightTables = section.slice(midPoint);

        return `
            <div class="column-left">
                ${leftTables.map(table => renderTableCard(table, sectionIndex)).join('')}
            </div>
            <div class="column-right">
                ${rightTables.map(table => renderTableCard(table, sectionIndex)).join('')}
            </div>
        `;
    } else {
        // Pour plusieurs sections : affichage normal
        return section.map(table => renderTableCard(table, sectionIndex)).join('');
    }
}

function renderTableCard(table, sectionIndex) {
    return `
        <div class="table-card">
            <div class="table-header">${table.tableNumber}</div>
            <div class="table-positions">
                ${renderPosition(table.ns, 'ns', sectionIndex, table.tableNumber)}
                ${renderPosition(table.eo, 'eo', sectionIndex, table.tableNumber)}
            </div>
        </div>
    `;
}

function renderPosition(pair, position, sectionIndex, tableNumber) {
    const positionClass = position === 'ns' ? 'ns-position' : 'eo-position';
    const positionId = `pos_${sectionIndex}_${tableNumber}_${position}`;

    if (!pair) {
        const isRelais = position === 'eo' && parsedPairs.length % 2 === 1;
        const relaisClass = isRelais ? 'relais-position' : '';
        const displayText = isRelais ? 'RELAIS' : 'Position libre';
        return `
            <div class="position ${positionClass} ${relaisClass}" data-position="${positionId}" data-section="${sectionIndex}" data-table="${tableNumber}" data-pos="${position}">
                <div class="empty-position">${displayText}</div>
            </div>
        `;
    }

    const constraintIndicator = pair.nsConstraint ? `
        <div class="constraint-indicator">
            <div class="lock-icon">🔒</div>
            <div class="ns-text">NS</div>
        </div>
    ` : '';

    // Format d'affichage: initiale prénom + nom de famille
    const formatPlayerName = (fullName) => {
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            // Détecter les préfixes de noms composés et patterns courants
            const prefixes = ['DE', 'LE', 'LA', 'DU', 'DES', 'VAN', 'VON', 'DA', 'DEL', 'VAN DER'];

            let nom, prenom;

            // Méthode 1: Chercher les patterns composés avec 2 mots de famille
            if (parts.length >= 3) {
                const firstTwo = parts[0] + ' ' + parts[1];
                const firstTwoUpper = firstTwo.toUpperCase();

                // Vérifier si les 2 premiers mots forment un nom composé connu
                if (prefixes.some(prefix => firstTwoUpper.startsWith(prefix))) {
                    nom = firstTwo;
                    prenom = parts.slice(2).join(' ');
                } else {
                    // Méthode 2: Dernier mot = prénom, le reste = nom de famille
                    prenom = parts[parts.length - 1];
                    nom = parts.slice(0, -1).join(' ');
                }
            } else {
                // Méthode 2: Dernier mot = prénom, le reste = nom de famille
                prenom = parts[parts.length - 1];
                nom = parts.slice(0, -1).join(' ');
            }

            // Format final: Initiale du prénom + nom de famille
            const initialePrenom = prenom.charAt(0).toUpperCase() + '.';
            return `${initialePrenom} ${nom.toUpperCase()}`;
        }
        return fullName;
    };

    const player1Display = formatPlayerName(pair.player1.name);
    const player2Display = formatPlayerName(pair.player2.name);

    return `
        <div class="position ${positionClass}" data-pair-id="${pair.id}" data-position="${positionId}" data-section="${sectionIndex}" data-table="${tableNumber}" data-pos="${position}" draggable="true">
            <div class="pair-info">
                ${constraintIndicator}
                <div class="player-names">
                    <div class="player-name">${player1Display}</div>
                    <div class="player-name">${player2Display}</div>
                </div>
                <div class="iv-total">${pair.combinedIV}</div>
            </div>
            <div class="position-indicator">${position.toUpperCase()}</div>
        </div>
    `;
}

// ===================================================================
// 6. DONNÉES DE TEST
// ===================================================================

function loadTestData() {
    console.log('🔍 DEBUG: loadTestData() called - Format FFB avec 35 paires (70 joueurs)');
    let testData = '';

    // NOMS COMPOSÉS RÉALISTES POUR TESTER LE PARSING - 70 NOMS POUR 35 PAIRES
    const nomsComposer = [
        'DE CARLI Michel', 'LE COQ Françoise', 'DE LA TOUR Pierre', 'VAN DER BERG Marie',
        'SAINT MARTIN Paul', 'DE COURIVON Sylvie', 'LA FONTAINE Jean', 'DU BOIS André',
        'DE SAINT PIERRE Claire', 'LE GRAND Thomas', 'DE VILLIERS Sophie', 'VAN HOUTEN Lucas',
        'SAINT GERMAIN Isabelle', 'DE MEYER Antoine', 'LA CROIX Nathalie', 'DU PONT Olivier',
        'DE MONTMORENCY Valérie', 'LE BLANC François', 'DE BOURBON Julie', 'VAN DAMME Eric',
        'SAINT LAURENT Martine', 'DE ROHAN Christophe', 'LA ROCQUE Véronique', 'DU JARDIN Alain',
        'DE POLIGNAC Monique', 'LE ROUX Patricia', 'DE GUISE Bernard', 'VAN KLEEF Dominique',
        'SAINT CLAIR Brigitte', 'DE BROGLIE Gérard', 'LA VALETTE Corinne', 'DU TERTRE Henri',
        'DE NOAILLES Catherine', 'LE GOFF Philippe', 'DE MONTPENSIER Agnès', 'LE COMTE Thierry',
        'VAN RIJN Elisabeth', 'DE MONTCLAIR François', 'LA MARQUISE Isabelle', 'DU FRESNE Antoine',
        'SAINT ANDRÉ Valérie', 'DE BEAUMONT Claude', 'LE BARON Christine', 'VAN DYCK Laurent',
        'DE SAVOIE Monique', 'LA PRINCESSE Hélène', 'DU CHÂTEAU Bernard', 'SAINT LOUIS Martine',
        'DE RICHELIEU Pierre', 'LE DUC Marie', 'VAN BEETHOVEN Jean', 'DE MOZART Claire',
        'LA COMTESSE Sophie', 'DU MANOIR Philippe', 'SAINT DENIS Alain', 'DE VERSAILLES Nicole',
        'LE VICOMTE Henri', 'VAN GOGH Sylvie', 'DE REMBRANDT Louis', 'LA DUCHESSE Françoise',
        'DU PALAIS André', 'SAINT HONORÉ Catherine', 'DE MALMAISON Georges', 'LE MARQUIS Brigitte',
        'VAN HALEN Michel', 'DE BERGERAC Cyrano', 'LA FONTAINE Esther', 'DU LOUVRE Alexandre',
        'SAINT TROPEZ Marina', 'DE MONACO Grace', 'LE PRINCE Albert', 'VAN DAMME Claude'
    ];

    // FORMAT FFB SIMPLE - 70 joueurs pour 35 paires
    for (let i = 0; i < 70; i++) {
        const civilite = i % 2 === 0 ? 'M.' : 'Mme';
        const fullName = nomsComposer[i];
        const iv = Math.floor(Math.random() * 40) + 50;
        const license = (9800000 + i + 1).toString().padStart(8, '0');

        testData += `${civilite} ${fullName} (5.00 €)
${license} ( IV = ${iv} )

`;
    }

    document.getElementById('tournamentData').value = testData;
    showStatus('✅ Données de test: 35 paires (70 joueurs) chargées', 'success');
}

function loadTestData80() {
    console.log('🔍 DEBUG: loadTestData80() called');
    let pairData = '';

    for (let i = 1; i <= 80; i++) {
        const player1Name = `PLAYER${i}A Pierre`;
        const player2Name = `PLAYER${i}B Marie`;
        const iv1 = Math.floor(Math.random() * 50) + 40;
        const iv2 = Math.floor(Math.random() * 50) + 40;

        pairData += `16/01/2026
M. ${player1Name} (5,00 €)
${9800000 + i * 2 - 1} ( IV = ${iv1} )
Mme ${player2Name} (5,00 €)
${9800000 + i * 2} ( IV = ${iv2} )
`;
    }

    const testData = `Tournoi Bridge Club Nancy - Test 80 paires du 16/01/2026 à 14:15
80 équipe(s)
Nouvelle équipe
Inscription	Joueur 1	Joueur 2	Actions
${pairData}`;

    document.getElementById('tournamentData').value = testData;
    showStatus('✅ Données de test 80 paires chargées', 'success');
}

// ===================================================================
// 7. CONTRÔLES SECTIONS ET ALGORITHMES
// ===================================================================

function setSectionCount(count) {
    console.log('🔄 Changing to', count, 'sections');

    document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`sections${count}`).classList.add('active');

    currentSectionCount = count;

    if (parsedPairs && parsedPairs.length > 0) {
        showStatus('Redistribution en cours...', 'info');
        try {
            mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, nsConstraints.size > 0);
            renderMitchellDisplay();
            showStatus(`Redistribué en ${currentSectionCount} section(s)`, 'success');
        } catch (error) {
            console.error('❌ Error redistributing:', error);
        }
    }
}

function setAlgorithm(algo) {
    console.log('🔄 Changing algorithm to:', algo);

    currentAlgorithm = algo === '1-4-7' ? '147' : 'equilibrated';

    document.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('active'));
    if (algo === '1-4-7') {
        document.getElementById('algo147').classList.add('active');
    } else {
        document.getElementById('algoNew').classList.add('active');
    }

    if (parsedPairs && parsedPairs.length > 0) {
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, nsConstraints.size > 0);
        renderMitchellDisplay();
        showStatus(`Algorithme ${algo === '1-4-7' ? 'Mitchell 147' : 'Équilibré'} appliqué`, 'success');
    } else {
        showStatus(`Algorithme changé: ${algo}`, 'info');
    }
}

function adjustTableCount(sectionIndex, delta) {
    console.log('🔄 Adjust table count for section', sectionIndex, 'by', delta);

    if (!mitchellData || !mitchellData[sectionIndex]) return;

    const currentSection = mitchellData[sectionIndex];
    const newTableCount = currentSection.length + delta;

    // Interdire de descendre sous 1 table
    if (newTableCount < 1) {
        showStatus('❌ Impossible de descendre sous 1 table', 'error');
        return;
    }

    // Calculer le total de tables actuelles
    const totalTables = mitchellData.reduce((sum, section) => sum + section.length, 0);

    // Trouver la section suivante à ajuster (celle de droite ou la première)
    let targetSectionIndex = (sectionIndex + 1) % mitchellData.length;
    let targetSection = mitchellData[targetSectionIndex];

    // Si la section cible aurait 0 tables, chercher la suivante
    while (targetSection.length - (-delta) <= 0 && targetSectionIndex !== sectionIndex) {
        targetSectionIndex = (targetSectionIndex + 1) % mitchellData.length;
        targetSection = mitchellData[targetSectionIndex];
    }

    // Vérifier si l'ajustement est possible
    if (targetSection.length - (-delta) <= 0) {
        showStatus('❌ Impossible de redistribuer: toutes les autres sections ont trop peu de tables', 'error');
        return;
    }

    // Effectuer l'ajustement de la section courante
    if (delta > 0) {
        // Ajouter des tables
        for (let i = 0; i < delta; i++) {
            currentSection.push({
                tableNumber: currentSection.length + 1,
                ns: null,
                eo: null
            });
        }
    } else {
        // Retirer des tables
        currentSection.splice(currentSection.length + delta);
    }

    // Effectuer l'ajustement inverse sur la section cible
    if (-delta > 0) {
        // Ajouter des tables à la section cible
        for (let i = 0; i < -delta; i++) {
            targetSection.push({
                tableNumber: targetSection.length + 1,
                ns: null,
                eo: null
            });
        }
    } else {
        // Retirer des tables de la section cible
        targetSection.splice(targetSection.length + (-delta));
    }

    // Redistribuer les paires avec les nouvelles configurations de tables
    if (parsedPairs && parsedPairs.length > 0) {
        const newTableCounts = mitchellData.map(section => section.length);
        mitchellData = redistributePairsWithCustomTableCounts(parsedPairs, newTableCounts, nsConstraints.size > 0);
    }

    renderMitchellDisplay();

    const sectionLetter = String.fromCharCode(65 + sectionIndex);
    const targetLetter = String.fromCharCode(65 + targetSectionIndex);
    showStatus(`✅ ${sectionLetter}: ${newTableCount} tables, ${targetLetter}: ${targetSection.length} tables (total: ${totalTables})`, 'success');
}

function redistributePairsWithCustomTableCounts(pairs, tableCounts, useConstraints = false) {
    console.log('🔄 Redistributing pairs with custom table counts:', tableCounts);

    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(b) - calculateCombinedIV(a));

    sortedPairs.forEach((pair, i) => {
        if (!pair.id) pair.id = `pair_${i}`;
        pair.combinedIV = calculateCombinedIV(pair);
        pair.nsConstraint = useConstraints && nsConstraints.has(pair.id);
    });

    const sectionCount = tableCounts.length;
    const sections = tableCounts.map((tableCount, sectionIndex) => {
        return Array.from({ length: tableCount }, (_, i) => ({
            tableNumber: i + 1,
            ns: null,
            eo: null
        }));
    });

    try {
        console.log('🔍 Calling generateMitchellPlacement with custom table counts...');
        const result = generateMitchellPlacement(sections, sortedPairs, sectionCount, useConstraints);

        if (result !== true) {
            console.error('❌ generateMitchellPlacement failed');
            throw new Error('Failed to generate Mitchell placement');
        }

        console.log('✅ Redistribution complete with custom table counts');
        return sections;

    } catch (error) {
        console.error('❌ Redistribution failed:', error);
        return generateSimpleFallback(sections, sortedPairs);
    }
}

// ===================================================================
// 8. CONTRAINTES NS
// ===================================================================

function showConstraintControls() {
    const controls = document.getElementById('constraintControls');
    controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
}

function redistributeWithConstraints() {
    if (parsedPairs && parsedPairs.length > 0) {
        parsedPairs.forEach((pair, index) => {
            if (!pair.id) pair.id = `pair_${index}`;
            pair.nsConstraint = nsConstraints.has(pair.id);
        });
        const useConstraints = nsConstraints.size > 0;
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, useConstraints);
        renderMitchellDisplay();
    }
}

function clearConstraints() {
    nsConstraints.clear();
    document.getElementById('constraintCount').textContent = '0 paire(s) marquée(s)';

    if (parsedPairs && parsedPairs.length > 0) {
        parsedPairs.forEach(pair => {
            pair.nsConstraint = false;
            pair.mustBeNS = false;
        });
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, false);
        renderMitchellDisplay();
    }
}

function closeToConfig() {
    document.getElementById('mitchellView').style.display = 'none';
    document.getElementById('setupView').style.display = 'block';
    document.body.classList.remove('dark-mode');
}

// ===================================================================
// 9. INITIALISATION
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Bridge Generator V2 - Loaded (external JS)');

    // AUTO-LOAD: Récupérer les données depuis URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlData = urlParams.get('data');

    if (urlData) {
        console.log('🔍 URL data detected, parsing...');
        try {
            const players = JSON.parse(decodeURIComponent(urlData));
            console.log('✅ FFB data from URL:', players.length, 'players');

            const formatted = players.map(p =>
                `${p.name} (${p.amount} €)\n${p.license} ( IV = ${p.iv} )`
            ).join('\n\n');

            const tournamentData = document.getElementById('tournamentData');
            if (tournamentData) {
                tournamentData.value = formatted;
                console.log('✅ Data loaded into textarea from URL');
                showDataLoadedNotification(players.length);
            }

            window.history.replaceState({}, document.title, window.location.pathname);

        } catch (e) {
            console.error('❌ Error parsing URL data:', e);
        }
    } else {
        console.log('ℹ️ No data in URL, manual input mode');
    }

    // Event listeners
    const generateBtn = document.getElementById('generateButton');
    const testBtn35 = document.getElementById('loadTestDataBtn');
    const testBtn80 = document.getElementById('loadTestData80Btn');

    console.log('🔍 DEBUG: Elements found:', {generateBtn, testBtn35, testBtn80});

    if (generateBtn) {
        generateBtn.addEventListener('click', generateSections);
        console.log('✅ generateButton listener attached');
    }
    if (testBtn35) {
        testBtn35.addEventListener('click', () => {
            console.log('🔍 DEBUG: Test 35 button clicked');
            loadTestData();
        });
        console.log('✅ loadTestDataBtn listener attached');
    }
    if (testBtn80) {
        testBtn80.addEventListener('click', () => {
            console.log('🔍 DEBUG: Test 80 button clicked');
            loadTestData80();
        });
        console.log('✅ loadTestData80Btn listener attached');
    }

    // Mitchell display controls
    document.getElementById('sections1')?.addEventListener('click', () => setSectionCount(1));
    document.getElementById('sections2')?.addEventListener('click', () => setSectionCount(2));
    document.getElementById('sections3')?.addEventListener('click', () => setSectionCount(3));

    document.getElementById('algo147')?.addEventListener('click', () => setAlgorithm('1-4-7'));
    document.getElementById('algoNew')?.addEventListener('click', () => setAlgorithm('TBD'));

    document.getElementById('constraintBtn')?.addEventListener('click', showConstraintControls);
    document.getElementById('fullscreenExit')?.addEventListener('click', closeToConfig);

    document.getElementById('redistributeBtn')?.addEventListener('click', redistributeWithConstraints);
    document.getElementById('clearConstraintsBtn')?.addEventListener('click', clearConstraints);

    // Delegate table count adjustments
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('table-count-btn')) {
            const section = parseInt(e.target.dataset.section);
            const delta = parseInt(e.target.dataset.delta);
            adjustTableCount(section, delta);
        }
    });

    console.log('✅ All event listeners attached');
});

console.log('✅ Bridge Generator V2 JavaScript loaded (external file)');
