let parsedPairs = [];
let mitchellData = [];
let currentSectionCount = 7; // Default for 100 pairs

// Pagination state
let currentPage = 1;
let totalPages = 3; // 7 sections = 3 pages (3+3+1)
let sectionsPerPage = 3;
let autoPlayTimer = null;
let autoPlayInterval = 5000;

// V2 Functions - EXACT COPY
function calculateCombinedIV(pair) {
    if (!pair || !pair.player1 || !pair.player2) return 0;
    return (pair.player1.iv || 0) + (pair.player2.iv || 0);
}

function renderPosition(pair, position, sectionIndex, tableNumber) {
    const isRelais = !pair && position === 'eo' && parsedPairs.length % 2 === 1;
    const positionClass = `position ${position} ${isRelais ? 'relais-position' : ''}`;

    const positionText = position === 'ns' ? 'Nord-Sud' : 'Est-Ouest';

    if (pair) {
        return `
            <div class="${positionClass}">
                <div class="position-indicator ${position}-text">${positionText}</div>
                <div class="player-name">
                    ${pair.player1.name}<br>
                    ${pair.player2.name}
                </div>
            </div>
        `;
    } else {
        const emptyText = isRelais ? 'RELAIS' : 'Libre';
        return `
            <div class="${positionClass}">
                <div class="position-indicator ${position}-text">${positionText}</div>
                <div class="player-name">
                    <span class="empty-position">${emptyText}</span>
                </div>
            </div>
        `;
    }
}

// EXACT V2 renderMitchellDisplay function
function renderMitchellDisplay() {
    console.log('🔍 DEBUG: renderMitchellDisplay() called');

    const container = document.getElementById('sectionsContainer');
    let html = '';

    // Update tournament title
    const today = new Date().toLocaleDateString('fr-FR');
    const totalPairs = parsedPairs.length;

    if (totalPairs === 0) {
        console.error('❌ ERROR: No parsed pairs available');
        return;
    }

    // Calculate global IV average for header
    const totalIV = parsedPairs.reduce((sum, pair) => sum + calculateCombinedIV(pair), 0);
    const avgIV = (totalIV / parsedPairs.length).toFixed(1);

    document.getElementById('tournamentTitle').textContent =
        `Bon tournoi au BCNJ - ${today} - ${totalPairs} paires, IV moyen ${avgIV}`;

    // Calculate which sections to show on current page
    const startSection = (currentPage - 1) * sectionsPerPage;
    const endSection = Math.min(startSection + sectionsPerPage, currentSectionCount);

    // Update grid class
    const sectionsToShow = endSection - startSection;
    container.className = `sections-grid ${sectionsToShow === 1 ? 'single-section' :
                         sectionsToShow === 2 ? 'two-sections' : 'three-sections'}`;

    // Render sections for current page
    for (let sectionIndex = startSection; sectionIndex < endSection; sectionIndex++) {
        const section = mitchellData[sectionIndex];
        if (!section) continue;

        const sectionName = `Section ${String.fromCharCode(65 + sectionIndex)}`;
        const sectionClass = `section-${String.fromCharCode(97 + sectionIndex)}`;

        // Calculate section statistics
        const nsPairs = section.filter(table => table.ns && table.ns.combinedIV).map(table => table.ns);
        const eoPairs = section.filter(table => table.eo && table.eo.combinedIV).map(table => table.eo);

        const nsAvgIV = nsPairs.length > 0 ?
            (nsPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0) / nsPairs.length).toFixed(1) : '0';
        const eoAvgIV = eoPairs.length > 0 ?
            (eoPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0) / eoPairs.length).toFixed(1) : '0';

        const sectionLetter = String.fromCharCode(65 + sectionIndex);

        const sectionBanner = `
            <div class="section-banner">
                <div class="section-letter">${sectionLetter}</div>
                <div class="section-stats">
                    <div class="section-stats-line"></div>
                    <div class="section-stats-line">NS</div>
                    <div class="section-stats-line">~${Math.round(parseFloat(nsAvgIV))}</div>
                    <div class="section-stats-line">EO</div>
                    <div class="section-stats-line">~${Math.round(parseFloat(eoAvgIV))}</div>
                </div>
            </div>
        `;

        html += `
            <div class="section-container ${sectionClass}">
                ${sectionBanner}
                <div class="section-content">
                    <div class="tables-grid">
        `;

        // Filter out empty tables for multiple sections
        let tablesToShow = section.filter(table => table.ns || table.eo);

        tablesToShow.forEach(table => {
            html += `
                <div class="table-card">
                    <div class="table-header">${table.tableNumber}</div>
                    <div class="table-positions">
                        ${renderPosition(table.ns, 'ns', sectionIndex, table.tableNumber)}
                        ${renderPosition(table.eo, 'eo', sectionIndex, table.tableNumber)}
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function generateMitchellDistribution(pairs, sectionCount) {
    console.log('🔄 Generating Mitchell distribution for', pairs.length, 'pairs,', sectionCount, 'sections');

    // Sort pairs by IV (têtes de série) - EXACT V2
    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(a) - calculateCombinedIV(b));

    const totalPairs = pairs.length;
    const totalTables = Math.ceil(totalPairs / 2);
    const tablesPerSection = Math.ceil(totalTables / sectionCount);

    // Initialize sections - EXACT V2 structure
    const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => {
        const startTable = sectionIndex * tablesPerSection + 1;
        const endTable = Math.min((sectionIndex + 1) * tablesPerSection, totalTables);
        const sectionTables = [];

        for (let tableNum = startTable; tableNum <= endTable; tableNum++) {
            sectionTables.push({
                tableNumber: tableNum,
                ns: null,
                eo: null
            });
        }

        return sectionTables;
    });

    // Apply Mitchell 147 algorithm - EXACT V2
    let pairIndex = 0;

    // Generate Mitchell sequence: 1,4,7,10... then 2,5,8,11... then 3,6,9,12...
    const mitchellSequence = [];
    for (let series = 1; series <= 3; series++) {
        for (let table = series; table <= totalTables; table += 3) {
            mitchellSequence.push(table);
        }
    }

    console.log('🔍 Mitchell 147 sequence:', mitchellSequence.slice(0, 20).join(','), '...');

    // Place pairs according to 147 sequence
    for (let i = 0; i < mitchellSequence.length && pairIndex < sortedPairs.length; i++) {
        const currentTable = mitchellSequence[i];
        const { sectionIndex, tableIndex } = findTablePosition(sections, currentTable);

        if (sectionIndex !== -1 && tableIndex !== -1) {
            const table = sections[sectionIndex][tableIndex];

            // Place pair as NS first, then EO
            if (!table.ns && pairIndex < sortedPairs.length) {
                table.ns = sortedPairs[pairIndex++];
            }
            if (!table.eo && pairIndex < sortedPairs.length) {
                table.eo = sortedPairs[pairIndex++];
            }
        }
    }

    console.log('✅ Mitchell 147 placement complete');
    return sections;
}

function findTablePosition(sections, targetTableNumber) {
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < sections[sectionIndex].length; tableIndex++) {
            if (sections[sectionIndex][tableIndex].tableNumber === targetTableNumber) {
                return { sectionIndex, tableIndex };
            }
        }
    }
    return { sectionIndex: -1, tableIndex: -1 };
}

// Page navigation functions
function updatePageInfo() {
    document.getElementById('pageInfo').textContent = `Page ${currentPage} / ${totalPages}`;
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderMitchellDisplay();
        updatePageInfo();

        // Reset auto-play timer
        if (autoPlayTimer) {
            stopAutoPlay();
            startAutoPlay();
        }
    }
}

function startAutoPlay() {
    if (totalPages <= 1) return;

    autoPlayTimer = setInterval(() => {
        const nextPage = currentPage < totalPages ? currentPage + 1 : 1;
        currentPage = nextPage;
        renderMitchellDisplay();
        updatePageInfo();
    }, autoPlayInterval);

    document.getElementById('autoPlayIndicator').textContent = 'Auto: ON';
    document.getElementById('autoPlayIndicator').style.color = '#10b981';
}

function stopAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
    document.getElementById('autoPlayIndicator').textContent = 'Auto: OFF';
    document.getElementById('autoPlayIndicator').style.color = '#ef4444';
}

function toggleAutoPlay() {
    if (autoPlayTimer) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

function backToSetup() {
    stopAutoPlay();
    document.getElementById('tournamentDisplay').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'flex';
}

function processFFBData(players) {
    console.log('🔍 Processing FFB data:', players.length, 'players');

    parsedPairs = [];

    for (let i = 0; i < players.length; i += 2) {
        const player1 = players[i];
        const player2 = players[i + 1];

        if (player1 && player2) {
            parsedPairs.push({
                id: `pair-${Math.floor(i / 2) + 1}`,
                player1: {
                    name: player1.name,
                    amount: parseFloat(player1.amount),
                    iv: parseInt(player1.iv) || 0
                },
                player2: {
                    name: player2.name,
                    amount: parseFloat(player2.amount),
                    iv: parseInt(player2.iv) || 0
                },
                totalAmount: parseFloat(player1.amount) + parseFloat(player2.amount),
                combinedIV: (parseInt(player1.iv) || 0) + (parseInt(player2.iv) || 0)
            });
        }
    }

    console.log('🎯 Created', parsedPairs.length, 'pairs');

    // Update player count
    document.getElementById('playerCount').textContent = `${parsedPairs.length} paires détectées`;

    // Auto-calculate sections for 100 pairs
    if (parsedPairs.length <= 28) {
        currentSectionCount = 1;
        totalPages = 1;
    } else {
        const excessTeams = parsedPairs.length - 28;
        currentSectionCount = Math.floor(excessTeams / 14) + 2;
        totalPages = Math.ceil(currentSectionCount / sectionsPerPage);
    }

    document.querySelector('#sectionCount option[value="auto"]').textContent = `Auto (${currentSectionCount} sections)`;
    document.querySelector('#sectionCount option[value="auto"] + small').textContent = `${parsedPairs.length} paires → ${currentSectionCount} sections automatiques`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generateTournament').onclick = function() {
        console.log('🚀 Generating tournament');

        // Generate Mitchell distribution
        mitchellData = generateMitchellDistribution(parsedPairs, currentSectionCount);

        // Show tournament display
        document.getElementById('setupScreen').style.display = 'none';
        document.getElementById('tournamentDisplay').style.display = 'block';

        // Reset to first page
        currentPage = 1;

        // Render display
        renderMitchellDisplay();
        updatePageInfo();

        // Start auto-play
        startAutoPlay();

        // Enter fullscreen
        setTimeout(() => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
        }, 100);
    };

    document.getElementById('prevPage').onclick = () => changePage(-1);
    document.getElementById('nextPage').onclick = () => changePage(1);
});

// Load data
window.addEventListener('load', async () => {
    console.log('🔍 Page loaded, checking for data...');

    // Check chrome.storage first
    if (chrome && chrome.storage) {
        try {
            const result = await chrome.storage.local.get(['ffbPlayersData']);
            if (result.ffbPlayersData) {
                console.log('🏪 Found data in chrome.storage');
                chrome.storage.local.remove(['ffbPlayersData']);
                processFFBData(result.ffbPlayersData);
                return;
            }
        } catch (e) {
            console.log('🏪 Chrome storage not available');
        }
    }

    // Load test data after timeout
    setTimeout(() => {
        if (parsedPairs.length === 0) {
            console.log('⏰ Loading test data');
            const testPlayers = getTestData100Teams();
            processFFBData(testPlayers);
        }
    }, 3000);
});