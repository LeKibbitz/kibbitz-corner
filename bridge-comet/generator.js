let parsedPairs = [];
let mitchellData = [];
let currentSectionCount = 1;
let currentAlgorithm = '1-4-7'; // Default to 147
let currentMovementType = 'Mitchell';
let byeTeamIndex = -1; // For Howell movement

// Setup configuration
let setupConfig = {
    movementType: 'auto',
    sectionCount: 'auto',
    algorithmType: '1-4-7',
    autoFullscreen: true,
    darkMode: false
};

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

// Also wait for data from extension messages (backup method)
window.addEventListener('message', (event) => {
    if (event.data.type === 'FFB_DATA') {
        console.log('📥 Received FFB data via message:', event.data.players);
        clearTimeout(sampleDataTimeout); // Cancel sample data timeout
        processFFBData(event.data.players);
    }
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

    // Show setup screen instead of directly generating
    showSetupScreen();
}

function generateHowellDisplay() {
    console.log('🔄 Generating Howell display with', parsedPairs.length, 'pairs');

    try {
        // Apply Howell distribution with random positions
        mitchellData = howellDistribution(parsedPairs);

        // Update title
        document.getElementById('tournamentTitle').textContent = `FFB Tournament - Howell Movement (${parsedPairs.length} équipes)`;

        // Hide loading and show results
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('sectionsContainer').style.display = 'flex';

        // Render the display
        renderHowellDisplay();

        // Enter fullscreen
        enterFullscreen();

    } catch (error) {
        console.error('❌ Error generating Howell display:', error);
        document.getElementById('loadingMessage').textContent = '❌ Erreur lors de la génération Howell';
    }
}

function generateMitchellDisplay() {
    console.log('🔄 Generating Mitchell display with', parsedPairs.length, 'pairs');

    try {
        // Apply Mitchell distribution with 1-4-7 algorithm
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount);

        // Update title
        document.getElementById('tournamentTitle').textContent = `FFB Tournament - Mitchell Algorithm 147 (${parsedPairs.length} équipes)`;

        // Hide loading and show results
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('sectionsContainer').style.display = 'flex';

        // Render the display
        renderMitchellDisplay();

        // Enter fullscreen
        enterFullscreen();

    } catch (error) {
        console.error('❌ Error generating Mitchell display:', error);
        document.getElementById('loadingMessage').textContent = '❌ Erreur lors de la génération Mitchell';
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

function howellDistribution(pairs) {
    console.log('🎯 HOWELL: Generating random distribution for', pairs.length, 'pairs');

    const hasRelais = pairs.length % 2 === 1;
    let workingPairs = [...pairs];
    let byeTeam = null;

    // Handle bye team selection for odd number of pairs
    if (hasRelais && byeTeamIndex !== -1) {
        byeTeam = workingPairs[byeTeamIndex];
        workingPairs.splice(byeTeamIndex, 1); // Remove bye team from working list
        console.log('🎯 HOWELL: Selected bye team:', byeTeam);
    }

    // Shuffle remaining pairs randomly for Howell
    const shuffledPairs = workingPairs.sort(() => Math.random() - 0.5);

    // Calculate number of tables needed
    const numTables = hasRelais ? Math.ceil(pairs.length / 2) : pairs.length / 2;

    console.log('🎯 HOWELL: Need', numTables, 'tables, has relay:', hasRelais);

    // Create single section with tables
    const section = [];
    for (let i = 1; i <= numTables; i++) {
        section.push({
            number: i,
            ns: null,
            eo: null
        });
    }

    // Place bye team at table 1 NS if we have odd number
    if (hasRelais && byeTeam) {
        section[0].ns = byeTeam;
    }

    // Place remaining pairs randomly
    let pairIndex = 0;
    for (let tableIndex = 0; tableIndex < section.length && pairIndex < shuffledPairs.length; tableIndex++) {
        const table = section[tableIndex];

        // Place NS pair (skip table 1 if bye team is already there)
        if (!table.ns && pairIndex < shuffledPairs.length) {
            table.ns = shuffledPairs[pairIndex++];
        }

        // Place EO pair (skip table 1 for relay)
        if (pairIndex < shuffledPairs.length && !(hasRelais && tableIndex === 0)) {
            table.eo = shuffledPairs[pairIndex++];
        }
    }

    return [section]; // Return as array for consistency with Mitchell
}

function renderHowellDisplay() {
    const container = document.getElementById('sectionsContainer');
    const section = mitchellData[0]; // Single section for Howell
    let html = '';

    html += `
        <div class="section">
            <div class="section-title">Mouvement Howell - Positions Aléatoires</div>
            <div class="tables-container">
    `;

    section.forEach(table => {
        const isRelayTable = table.number === 1 && !table.eo && parsedPairs.length % 2 === 1;

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

    container.innerHTML = html;
}

function renderMitchellDisplay() {
    const container = document.getElementById('sectionsContainer');
    let html = '';

    mitchellData.forEach((section, sectionIndex) => {
        const sectionName = currentSectionCount === 1 ? 'Section A' :
            `Section ${String.fromCharCode(65 + sectionIndex)}`;

        html += `
            <div class="section">
                <div class="section-title">${sectionName}</div>
                <div class="tables-container">
        `;

        section.forEach(table => {
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
                    <div class="position eo">
                        ${table.eo ? `<div class="player-name">${table.eo.player1.name}<br>${table.eo.player2.name}</div>` :
                          (parsedPairs.length % 2 === 1 && table.number === section.length ?
                            '<div class="player-name relais">RELAIS</div>' : 'Libre')}
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

function showByeTeamSelector() {
    console.log('🎯 Showing bye team selector for', parsedPairs.length, 'teams');

    const selector = document.getElementById('byeSelector');
    const teamsList = document.getElementById('byeTeamsList');

    let html = '';
    parsedPairs.forEach((pair, index) => {
        html += `
            <div class="bye-team-option" data-index="${index}" onclick="selectByeTeam(${index})">
                <strong>${pair.player1.name}</strong><br>
                <strong>${pair.player2.name}</strong><br>
                <small>IV combiné: ${pair.combinedIV}</small>
            </div>
        `;
    });

    teamsList.innerHTML = html;

    // Hide loading and show selector
    document.getElementById('loadingMessage').style.display = 'none';
    selector.style.display = 'block';
}

function selectByeTeam(index) {
    // Remove previous selection
    document.querySelectorAll('.bye-team-option').forEach(el => {
        el.classList.remove('selected');
    });

    // Add selection to clicked team
    const selectedElement = document.querySelector(`[data-index="${index}"]`);
    selectedElement.classList.add('selected');

    // Store selection
    byeTeamIndex = index;
}

function confirmByeSelection() {
    if (byeTeamIndex === -1) {
        alert('Veuillez sélectionner une équipe pour le relais');
        return;
    }

    console.log('🎯 Selected bye team:', parsedPairs[byeTeamIndex]);

    // Hide selector
    document.getElementById('byeSelector').style.display = 'none';

    // Generate Howell display with selected bye team
    generateHowellDisplay();
}

function cancelByeSelection() {
    // Hide selector and return to loading
    document.getElementById('byeSelector').style.display = 'none';
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('loadingMessage').textContent = '❌ Génération annulée';
}

// Setup Screen Functions
function showSetupScreen() {
    console.log('📋 Showing setup screen');

    // Hide all other screens
    document.getElementById('tournamentDisplay').style.display = 'none';
    document.getElementById('loadingMessage').style.display = 'none';

    // Show setup screen
    document.getElementById('setupScreen').style.display = 'flex';

    // Update player count
    document.getElementById('playerCount').textContent = `Données extraites : ${parsedPairs.length * 2} joueurs (${parsedPairs.length} paires)`;

    // Setup event listeners
    setupEventListeners();

    // Update preview
    updateSetupPreview();
}

function setupEventListeners() {
    // Movement type change
    document.getElementById('movementType').addEventListener('change', updateSetupPreview);
    document.getElementById('sectionCount').addEventListener('change', updateSetupPreview);
    document.getElementById('algorithmType').addEventListener('change', updateSetupPreview);
    document.getElementById('autoFullscreen').addEventListener('change', updateSetupPreview);
    document.getElementById('darkMode').addEventListener('change', updateSetupPreview);

    // Action buttons
    document.getElementById('generateTournament').addEventListener('click', generateFromSetup);
    document.getElementById('backToExtraction').addEventListener('click', backToExtraction);
    document.getElementById('backToSetup').addEventListener('click', backToSetup);
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
    const totalTables = actualMovement === 'Howell' ?
        Math.ceil(teamCount / 2) :
        Math.ceil(teamCount / 2);
    const tablesPerSection = Math.ceil(totalTables / actualSections);

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
        ${teamCount % 2 === 1 ? '<strong>⚠️ Nombre impair d\'équipes → équipe relais requise</strong>' : ''}
    `;

    document.getElementById('previewContent').innerHTML = previewHTML;

    // Update setupConfig
    setupConfig = {
        movementType: actualMovement,
        sectionCount: actualSections,
        algorithmType: algorithmType,
        autoFullscreen: document.getElementById('autoFullscreen').checked,
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

    // Generate display based on movement type
    if (currentMovementType === 'Howell') {
        if (parsedPairs.length % 2 === 1) {
            showByeTeamSelector();
        } else {
            generateHowellDisplay();
        }
    } else {
        generateMitchellDisplay();
    }

    // Auto-fullscreen if enabled
    if (setupConfig.autoFullscreen) {
        setTimeout(() => enterFullscreen(), 100);
    }
}

function backToExtraction() {
    console.log('← Retour à l\'extraction');
    // For now, just reload the page
    window.location.reload();
}

function backToSetup() {
    console.log('← Retour au setup');

    // Exit fullscreen if active
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
            console.error('Error exiting fullscreen:', err);
        });
    }

    showSetupScreen();
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