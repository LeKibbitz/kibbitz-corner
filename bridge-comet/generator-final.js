let parsedPairs = [];
let mitchellData = [];
let currentSectionCount = 1;
let currentAlgorithm = '147';

// Pagination state
let currentPage = 1;
let totalPages = 1;
let sectionsPerPage = 3;
let autoPlayTimer = null;
let autoPlayInterval = 5000; // 5 seconds

// Check for data on load
window.addEventListener('load', async () => {
    console.log('🔍 Page loaded, checking for data...');

    // Check chrome.storage first (most reliable)
    if (chrome && chrome.storage) {
        try {
            const result = await chrome.storage.local.get(['ffbPlayersData']);
            if (result.ffbPlayersData) {
                console.log('🏪 Found data in chrome.storage');
                clearTimeout(sampleDataTimeout);
                chrome.storage.local.remove(['ffbPlayersData']);
                processFFBData(result.ffbPlayersData);
                return;
            }
        } catch (e) {
            console.log('🏪 Chrome storage not available or error:', e);
        }
    }

    console.log('⚠️ No data found, will wait for timeout...');
});

let sampleDataTimeout;

function processFFBData(players) {
    console.log('🔍 processFFBData called with:', players.length, 'players');

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
    showSetupScreen();
}

function showSetupScreen() {
    document.getElementById('tournamentDisplay').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'flex';

    document.getElementById('playerCount').textContent =
        `Données extraites : ${parsedPairs.length * 2} joueurs (${parsedPairs.length} paires)`;

    setupEventListeners();
    updateSetupPreview();
}

function setupEventListeners() {
    document.getElementById('sectionCount').addEventListener('change', updateSetupPreview);
    document.getElementById('algorithmType').addEventListener('change', updateSetupPreview);
    document.getElementById('generateTournament').onclick = generateFromSetup;

    // Page navigation
    document.getElementById('prevPage').onclick = () => changePage(-1);
    document.getElementById('nextPage').onclick = () => changePage(1);
    document.getElementById('autoPlayIndicator').onclick = toggleAutoPlay;
}

function updateSetupPreview() {
    const teamCount = parsedPairs.length;
    const sectionCount = document.getElementById('sectionCount').value;

    let actualSections;
    if (sectionCount === 'auto') {
        if (teamCount <= 28) {
            actualSections = 1;
        } else {
            const excessTeams = teamCount - 28;
            actualSections = Math.floor(excessTeams / 14) + 2;
        }
    } else {
        actualSections = parseInt(sectionCount);
    }

    const totalTables = Math.ceil(teamCount / 2);
    const tablesPerSection = Math.ceil(totalTables / actualSections);
    const pagesNeeded = Math.ceil(actualSections / sectionsPerPage);

    document.getElementById('sectionHelp').textContent =
        sectionCount === 'auto' ? `Auto → ${actualSections} section(s)` : `${actualSections} section(s)`;

    const previewHTML = `
        <strong>Équipes :</strong> ${teamCount}<br>
        <strong>Sections :</strong> ${actualSections}<br>
        <strong>Tables :</strong> ${totalTables}<br>
        <strong>Tables/section :</strong> ${tablesPerSection}<br>
        <strong>Pages :</strong> ${pagesNeeded}
    `;

    document.getElementById('previewContent').innerHTML = previewHTML;
}

function generateFromSetup() {
    const sectionCount = document.getElementById('sectionCount').value;

    if (sectionCount === 'auto') {
        if (parsedPairs.length <= 28) {
            currentSectionCount = 1;
        } else {
            const excessTeams = parsedPairs.length - 28;
            currentSectionCount = Math.floor(excessTeams / 14) + 2;
        }
    } else {
        currentSectionCount = parseInt(sectionCount);
    }

    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('tournamentDisplay').style.display = 'block';

    generateMitchellDisplay();
    setupPagination();
    startAutoPlay();
    setTimeout(() => enterFullscreen(), 100);
}

function generateMitchellDisplay() {
    console.log('🔄 Generating Mitchell display');

    try {
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount);

        const today = new Date().toLocaleDateString('fr-FR');
        const totalIV = parsedPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0);
        const avgIV = (totalIV / parsedPairs.length).toFixed(1);

        document.getElementById('tournamentTitle').textContent =
            `Bon tournoi au BCNJ - ${today} - ${parsedPairs.length} paires, IV moyen ${avgIV}`;

        totalPages = Math.ceil(currentSectionCount / sectionsPerPage);
        currentPage = 1;

        renderCurrentPage();

    } catch (error) {
        console.error('❌ Error generating display:', error);
    }
}

function mitchellDistribution(pairs, sectionCount) {
    const sortedPairs = [...pairs].sort((a, b) => a.combinedIV - b.combinedIV);
    const totalPairs = pairs.length;
    const totalTables = Math.ceil(totalPairs / 2);
    const tablesPerSection = Math.ceil(totalTables / sectionCount);

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
    let pairIndex = 0;
    const totalTables = sections.reduce((sum, section) => sum + section.length, 0);

    // Generate Mitchell sequence: 1,4,7,10... then 2,5,8,11... then 3,6,9,12...
    const mitchellSequence = [];
    for (let series = 1; series <= 3; series++) {
        for (let table = series; table <= totalTables; table += 3) {
            mitchellSequence.push(table);
        }
    }

    for (let i = 0; i < mitchellSequence.length && pairIndex < sortedPairs.length; i++) {
        const currentTable = mitchellSequence[i];
        const { sectionIndex, tableIndex } = findTablePosition(sections, currentTable);

        if (sectionIndex !== -1 && tableIndex !== -1) {
            const table = sections[sectionIndex][tableIndex];

            if (!table.ns && pairIndex < sortedPairs.length) {
                table.ns = sortedPairs[pairIndex++];
            }
            if (!table.eo && pairIndex < sortedPairs.length) {
                table.eo = sortedPairs[pairIndex++];
            }
        }
    }
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

        if (autoPlayTimer) {
            stopAutoPlay();
            startAutoPlay();
        }
    }
}

function renderCurrentPage() {
    const container = document.getElementById('sectionsContainer');

    const startSection = (currentPage - 1) * sectionsPerPage;
    const endSection = Math.min(startSection + sectionsPerPage, currentSectionCount);
    const sectionsToShow = mitchellData.slice(startSection, endSection);

    const sectionsOnPage = sectionsToShow.length;
    container.className = `sections-grid ${sectionsOnPage === 1 ? 'single-section' :
                         sectionsOnPage === 2 ? 'two-sections' : 'three-sections'}`;

    let html = '';

    sectionsToShow.forEach((section, index) => {
        const sectionIndex = startSection + index;
        const sectionLetter = String.fromCharCode(65 + sectionIndex); // A, B, C...
        const sectionClass = `section-${sectionLetter.toLowerCase()}`;

        // Calculate section stats
        const totalNS = section.filter(table => table.ns).length;
        const totalEO = section.filter(table => table.eo).length;
        const avgNS = totalNS > 0 ? (section.filter(table => table.ns).reduce((sum, table) => sum + (table.ns?.combinedIV || 0), 0) / totalNS).toFixed(0) : '0';
        const avgEO = totalEO > 0 ? (section.filter(table => table.eo).reduce((sum, table) => sum + (table.eo?.combinedIV || 0), 0) / totalEO).toFixed(0) : '0';

        html += `
            <div class="section-container ${sectionClass}">
                <div class="section-banner">
                    <div class="section-letter">${sectionLetter}</div>
                    <div class="section-stats">
                        <div class="section-stats-line">NS ~${avgNS}</div>
                        <div class="section-stats-line">EO ~${avgEO}</div>
                    </div>
                </div>
                <div class="tables-grid">
        `;

        section.forEach(table => {
            const isRelayTable = parsedPairs.length % 2 === 1 && !table.eo;

            html += `
                <div class="table-card">
                    <div class="table-number">${table.number}</div>
                    <div class="pair-positions">
                        <div class="position ns">
                            <div class="position-indicator ns-text">Nord-Sud</div>
                            <div class="player-name">
                                ${table.ns ? `${table.ns.player1.name}<br>${table.ns.player2.name}` : '<span class="empty-position">Libre</span>'}
                            </div>
                        </div>
                        <div class="position eo ${isRelayTable ? 'relais-position' : ''}">
                            <div class="position-indicator eo-text">Est-Ouest</div>
                            <div class="player-name">
                                ${table.eo ? `${table.eo.player1.name}<br>${table.eo.player2.name}` :
                                  (isRelayTable ? '<span class="empty-position">RELAIS</span>' : '<span class="empty-position">Libre</span>')}
                            </div>
                        </div>
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
function backToSetup() {
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

// Load test data after timeout
sampleDataTimeout = setTimeout(() => {
    if (parsedPairs.length === 0) {
        console.log('⏰ Loading test data');
        const testPlayers = getTestData100Teams();
        setTimeout(() => processFFBData(testPlayers), 500);
    }
}, 3000);