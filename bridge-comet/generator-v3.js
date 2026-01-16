let parsedPairs = [];
let mitchellData = [];
let currentSectionCount = 1;
let currentAlgorithm = '1-4-7';
let currentMovementType = 'Mitchell';
let byeTeamIndex = -1;

// Setup configuration
let setupConfig = {
    movementType: 'auto',
    sectionCount: 'auto',
    algorithmType: '1-4-7',
    autoFullscreen: true,
    autoPagination: true,
    darkMode: false
};

// Pagination state
let currentPage = 1;
let totalPages = 1;
let sectionsPerPage = 3;
let autoPlayTimer = null;
let autoPlayInterval = 5000; // 5 seconds

// Check for data from chrome.storage, clipboard, URL parameters, or localStorage on page load
window.addEventListener('load', async () => {
    console.log('🔍 DEBUG: Page loaded, checking for data...');

    // Check chrome.storage first (most reliable)
    if (chrome && chrome.storage) {
        try {
            const result = await chrome.storage.local.get(['ffbPlayersData']);
            if (result.ffbPlayersData) {
                console.log('🏪 Found data in chrome.storage');
                clearTimeout(sampleDataTimeout);
                chrome.storage.local.remove(['ffbPlayersData']); // Clean up
                processFFBData(result.ffbPlayersData);
                return;
            }
        } catch (e) {
            console.log('🏪 Chrome storage not available or error:', e);
        }
    }

    // Try clipboard
    try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.startsWith('[') && clipboardText.includes('"name"')) {
            console.log('📋 Found player data in clipboard');
            clearTimeout(sampleDataTimeout);
            const players = JSON.parse(clipboardText);
            console.log('🔍 DEBUG: Parsed players from clipboard:', players.length, 'players');
            processFFBData(players);
            return;
        }
    } catch (e) {
        console.log('📋 No clipboard access or no valid data in clipboard');
    }

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        console.log('📥 Found data in URL parameters');
        clearTimeout(sampleDataTimeout);
        try {
            const players = JSON.parse(decodeURIComponent(dataParam));
            console.log('🔍 DEBUG: Parsed players from URL:', players.length, 'players');
            processFFBData(players);
            return;
        } catch (e) {
            console.error('❌ Failed to parse URL data:', e);
        }
    }

    // Try localStorage as backup
    let storedData = localStorage.getItem('ffbData');
    if (storedData) {
        console.log('📥 Found stored FFB data in localStorage');
        clearTimeout(sampleDataTimeout);
        const players = JSON.parse(storedData);
        console.log('🔍 DEBUG: Parsed players:', players.length, 'players');
        localStorage.removeItem('ffbData'); // Clean up
        processFFBData(players);
        return;
    }

    console.log('⚠️ No data found, will wait for timeout...');
});

// Track timeout for debugging
let sampleDataTimeout;

function processFFBData(players) {
    console.log('🔍 DEBUG: processFFBData called with:', players);

    // Convert FFB player data to pairs format
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

    console.log('🎯 Created', parsedPairs.length, 'pairs from', players.length, 'players');
    showSetupScreen();
}

// Setup Screen Functions
function showSetupScreen() {
    console.log('📋 Showing setup screen');

    document.getElementById('tournamentDisplay').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'flex';

    document.getElementById('playerCount').textContent = `Données extraites : ${parsedPairs.length * 2} joueurs (${parsedPairs.length} paires)`;

    setupEventListeners();
    updateSetupPreview();
}

function setupEventListeners() {
    // Remove existing listeners to avoid duplicates
    const elements = ['movementType', 'sectionCount', 'algorithmType', 'autoFullscreen', 'autoPagination', 'darkMode'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.removeEventListener('change', updateSetupPreview);
            element.addEventListener('change', updateSetupPreview);
        }
    });

    // Action buttons
    document.getElementById('generateTournament').onclick = generateFromSetup;
    document.getElementById('backToExtraction').onclick = backToExtraction;

    // Page navigation
    document.getElementById('prevPage').onclick = () => changePage(-1);
    document.getElementById('nextPage').onclick = () => changePage(1);
    document.getElementById('autoPlayIndicator').onclick = toggleAutoPlay;
}

function updateSetupPreview() {
    const teamCount = parsedPairs.length;

    // Get current selections
    const movementType = document.getElementById('movementType').value;
    const sectionCount = document.getElementById('sectionCount').value;
    const algorithmType = document.getElementById('algorithmType').value;

    // Determine actual values
    let actualMovement, actualSections;

    if (movementType === 'auto') {
        if (teamCount < 14) {
            actualMovement = 'Howell';
            actualSections = 1;
        } else if (teamCount <= 28) {
            actualMovement = 'Mitchell';
            actualSections = 1;
        } else {
            actualMovement = 'Mitchell';
            const excessTeams = teamCount - 28;
            actualSections = Math.floor(excessTeams / 14) + 2;
        }
    } else {
        actualMovement = movementType === 'mitchell' ? 'Mitchell' : 'Howell';

        if (sectionCount === 'auto') {
            if (actualMovement === 'Howell') {
                actualSections = 1;
            } else {
                if (teamCount <= 28) {
                    actualSections = 1;
                } else {
                    const excessTeams = teamCount - 28;
                    actualSections = Math.floor(excessTeams / 14) + 2;
                }
            }
        } else {
            actualSections = parseInt(sectionCount);
        }
    }

    // Calculate tables
    const totalTables = Math.ceil(teamCount / 2);
    const tablesPerSection = Math.ceil(totalTables / actualSections);

    // Calculate pages needed
    const pagesNeeded = Math.ceil(actualSections / sectionsPerPage);

    // Update help texts
    document.getElementById('movementHelp').textContent =
        movementType === 'auto' ?
        `Détection automatique → ${actualMovement}` :
        `${actualMovement} sélectionné`;

    document.getElementById('sectionHelp').textContent =
        sectionCount === 'auto' ?
        `Calcul automatique → ${actualSections} section(s)` :
        `${actualSections} section(s) sélectionnée(s)`;

    // Update preview content
    const previewHTML = `
        <strong>Type de mouvement :</strong> ${actualMovement}<br>
        <strong>Nombre d'équipes :</strong> ${teamCount}<br>
        <strong>Nombre de sections :</strong> ${actualSections}<br>
        <strong>Total de tables :</strong> ${totalTables}<br>
        <strong>Tables par section :</strong> ${tablesPerSection}<br>
        <strong>Algorithme :</strong> ${algorithmType}<br>
        <strong>Pages d'affichage :</strong> ${pagesNeeded}<br>
        ${teamCount % 2 === 1 ? '<strong>⚠️ Nombre impair d\'équipes → équipe relais requise</strong>' : ''}
    `;

    document.getElementById('previewContent').innerHTML = previewHTML;

    // Update setupConfig
    setupConfig = {
        movementType: actualMovement,
        sectionCount: actualSections,
        algorithmType: algorithmType,
        autoFullscreen: document.getElementById('autoFullscreen').checked,
        autoPagination: document.getElementById('autoPagination').checked,
        darkMode: document.getElementById('darkMode').checked
    };
}

function generateFromSetup() {
    console.log('🚀 Generating tournament with config:', setupConfig);

    // Apply configuration
    currentMovementType = setupConfig.movementType;
    currentSectionCount = setupConfig.sectionCount;
    currentAlgorithm = setupConfig.algorithmType;

    // Apply dark mode if selected
    if (setupConfig.darkMode) {
        document.body.classList.add('dark-mode');
    }

    // Hide setup and show tournament
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('tournamentDisplay').style.display = 'block';

    // Generate Mitchell display (simplified for now)
    generateMitchellDisplay();

    // Setup pagination
    setupPagination();

    // Auto-fullscreen if enabled
    if (setupConfig.autoFullscreen) {
        setTimeout(() => enterFullscreen(), 100);
    }

    // Start auto-pagination if enabled
    if (setupConfig.autoPagination) {
        startAutoPlay();
    }
}

function generateMitchellDisplay() {
    console.log('🔄 Generating Mitchell display with', parsedPairs.length, 'pairs');

    try {
        // Apply Mitchell distribution with current algorithm
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount);

        // Update title
        const today = new Date().toLocaleDateString('fr-FR');
        const totalIV = parsedPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0);
        const avgIV = (totalIV / parsedPairs.length).toFixed(1);

        document.getElementById('tournamentTitle').textContent =
            `Bon tournoi au BCNJ - ${today} - ${parsedPairs.length} paires, IV moyen ${avgIV}`;

        // Calculate pagination
        totalPages = Math.ceil(currentSectionCount / sectionsPerPage);
        currentPage = 1;

        // Render first page
        renderCurrentPage();

    } catch (error) {
        console.error('❌ Error generating Mitchell display:', error);
    }
}

function mitchellDistribution(pairs, sectionCount) {
    console.log('🔍 MITCHELL: Starting with', pairs.length, 'pairs,', sectionCount, 'sections');

    // Sort pairs by IV (têtes de série)
    const sortedPairs = [...pairs].sort((a, b) => a.combinedIV - b.combinedIV);

    // Calculate tables per section using Mitchell algorithm
    const totalPairs = pairs.length;
    const hasRelais = totalPairs % 2 === 1;
    const totalTables = hasRelais ? (totalPairs + 1) / 2 : totalPairs / 2;
    const tablesPerSection = Math.ceil(totalTables / sectionCount);

    console.log('🔍 MITCHELL: Total tables:', totalTables, 'Tables per section:', tablesPerSection);

    // Initialize sections
    const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => {
        const startTable = sectionIndex * tablesPerSection + 1;
        const endTable = Math.min((sectionIndex + 1) * tablesPerSection, totalTables);
        const sectionTables = [];

        for (let tableNum = startTable; tableNum <= endTable; tableNum++) {
            sectionTables.push({
                number: tableNum,
                ns: null,
                eo: null
            });
        }

        return sectionTables;
    });

    // Apply 1-4-7 Mitchell algorithm
    generateMitchellPlacement147(sections, sortedPairs);

    return sections;
}

function generateMitchellPlacement147(sections, sortedPairs) {
    console.log('🔄 Applying Mitchell 1-4-7 algorithm');

    let pairIndex = 0;
    const totalTables = sections.reduce((sum, section) => sum + section.length, 0);

    // Generate Mitchell sequence: 1,4,7,10... then 2,5,8,11... then 3,6,9,12...
    const mitchellSequence = [];
    for (let series = 1; series <= 3; series++) {
        for (let table = series; table <= totalTables; table += 3) {
            mitchellSequence.push(table);
        }
    }

    console.log('🔍 Mitchell 1-4-7 sequence:', mitchellSequence.join(','));

    // Place pairs according to 1-4-7 sequence
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

    console.log('✅ Mitchell 1-4-7 placement complete');
}

function findTablePosition(sections, targetTableNumber) {
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < sections[sectionIndex].length; tableIndex++) {
            if (sections[sectionIndex][tableIndex].number === targetTableNumber) {
                return { sectionIndex, tableIndex };
            }
        }
    }
    return { sectionIndex: -1, tableIndex: -1 };
}

// Pagination Functions
function setupPagination() {
    const pageNav = document.getElementById('pageNavigation');

    if (totalPages > 1) {
        pageNav.style.display = 'flex';
        updatePageInfo();
    } else {
        pageNav.style.display = 'none';
    }
}

function updatePageInfo() {
    document.getElementById('pageInfo').textContent = `Page ${currentPage} / ${totalPages}`;
    document.getElementById('prevPage').style.opacity = currentPage > 1 ? '1' : '0.5';
    document.getElementById('nextPage').style.opacity = currentPage < totalPages ? '1' : '0.5';
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderCurrentPage();
        updatePageInfo();

        // Reset auto-play timer
        if (autoPlayTimer) {
            stopAutoPlay();
            startAutoPlay();
        }
    }
}

function renderCurrentPage() {
    const container = document.getElementById('sectionsContainer');

    // Calculate which sections to show on current page
    const startSection = (currentPage - 1) * sectionsPerPage;
    const endSection = Math.min(startSection + sectionsPerPage, currentSectionCount);

    const sectionsToShow = mitchellData.slice(startSection, endSection);

    // Set grid class based on number of sections on this page
    const sectionsOnPage = sectionsToShow.length;
    container.className = `sections-grid ${sectionsOnPage === 1 ? 'single-section' :
                         sectionsOnPage === 2 ? 'two-sections' : 'three-sections'}`;

    let html = '';

    sectionsToShow.forEach((section, index) => {
        const sectionIndex = startSection + index;
        const sectionName = currentSectionCount === 1 ? 'Section A' :
            `Section ${String.fromCharCode(65 + sectionIndex)}`;

        // Calculate section stats
        const totalNS = section.filter(table => table.ns).length;
        const totalEO = section.filter(table => table.eo).length;
        const avgNS = totalNS > 0 ? (section.filter(table => table.ns).reduce((sum, table) => sum + (table.ns?.combinedIV || 0), 0) / totalNS).toFixed(1) : '0';
        const avgEO = totalEO > 0 ? (section.filter(table => table.eo).reduce((sum, table) => sum + (table.eo?.combinedIV || 0), 0) / totalEO).toFixed(1) : '0';

        html += `
            <div class="section-container">
                <div class="section-banner">
                    <div class="section-letter">${sectionName.split(' ')[1] || 'A'}</div>
                    <div class="section-stats">${sectionName}</div>
                    <div class="section-stats-line">NS ~${avgNS} | EO ~${avgEO}</div>
                </div>
                <div class="tables-grid">
        `;

        section.forEach(table => {
            const isRelayTable = parsedPairs.length % 2 === 1 && !table.eo;

            html += `
                <div class="table-card">
                    <div class="table-header">
                        <span>Table ${table.number}</span>
                    </div>
                    <div class="ns-text">Nord-Sud</div>
                    <div class="position ns">
                        ${table.ns ? `<div class="player-name">${table.ns.player1.name}<br>${table.ns.player2.name}</div>` : 'Libre'}
                    </div>
                    <div class="eo-text">Est-Ouest</div>
                    <div class="position eo ${isRelayTable ? 'relais' : ''}">
                        ${table.eo ? `<div class="player-name">${table.eo.player1.name}<br>${table.eo.player2.name}</div>` :
                          (isRelayTable ? '<div class="player-name">RELAIS</div>' : 'Libre')}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Auto-play Functions
function startAutoPlay() {
    if (totalPages <= 1) return;

    autoPlayTimer = setInterval(() => {
        const nextPage = currentPage < totalPages ? currentPage + 1 : 1;
        currentPage = nextPage;
        renderCurrentPage();
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

// Navigation Functions
function backToExtraction() {
    console.log('← Retour à l\'extraction');
    window.location.reload();
}

function backToSetup() {
    console.log('← Retour au setup');
    stopAutoPlay();

    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
            console.error('Error exiting fullscreen:', err);
        });
    }

    showSetupScreen();
}

function enterFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
            console.error('Error exiting fullscreen:', err);
        });
    }
}

// If no data received within 3 seconds, use test data for development
sampleDataTimeout = setTimeout(() => {
    if (parsedPairs.length === 0) {
        console.log('⏰ TIMEOUT: No data received within 3s, loading 100 teams test data');

        // Use the 100 teams test dataset
        const testPlayers = getTestData100Teams();
        console.log('🔍 DEBUG: Loading test data with', testPlayers.length, 'players');
        setTimeout(() => processFFBData(testPlayers), 500);
    }
}, 3000);