/**
 * Bridge Generator - Version simplifiée pour tests
 */

console.log('🔍 Bridge Generator Simple JavaScript loaded');

// Variables globales
let parsedPairs = [];
let mitchellData = [];
let currentSectionCount = 1;

// Fonction de test simple
function testJS() {
    alert('JavaScript fonctionne !');
    console.log('✓ JavaScript test successful');
}

// Fonction de chargement des données de test 35 paires
function loadTestData() {
    const testData = `MARTIN Pierre
1000
DUPONT Marie
1200

BERNARD Jean
1100
ROUSSEAU Claire
900

PETIT Sophie
950
GRAND Thomas
1050

BLANC Anna
1150
NOIR Paul
850

LEFEVRE Antoine
1230
MICHEL Brigitte
980

THOMAS Julie
1320
DUBOIS André
1180

CLEMENT François
1040
CHEVALIER Odile
1260

GIRAUD Philippe
1150
HENRY Sylvie
890

LUCAS Stéphane
1080
DUFOUR Martine
1220

LAMBERT Denis
1170
FONTAINE Sophie
950

BERTRAND Louis
1300
ROUX Michel
820

ROBIN Fabrice
1190
COLIN Jocelyne
1010

GAILLARD Henri
1280
BRUN Marie
930

BARRE Emmanuel
1060
CHARLES Rose
1240

ROBERT Patrick
1350
PETIT Caroline
870

MERCIER Rémy
1120
BLANC Isabelle
1200

GUERIN Marc
1210
BOYER Yves
990

REY Jean-Claude
1380
PEREZ Dominique
840

MOULIN Bernard
1090
HUBERT Delphine
1310

FOURNIER Hervé
1160
GIRARD Nicole
1140

DUPONT Alain
1250
BONNET Jacques
920

LECLERC Michel
1180
BARBIER Simone
1020

ARNAUD Robert
1270
MARTINEZ Claudine
960

AUBRY Christian
1100
PICARD Thierry
1230

GUYOT René
1340
MEUNIER Lucienne
880`;

    const textarea = document.getElementById('tournamentData');
    if (textarea) {
        textarea.value = testData;
        showStatus('Données de test chargées (35 paires)', 'success');
        console.log('✓ Test data 35 pairs loaded');
    }
}

// Fonction de chargement des données de test 80 paires
function loadTestData80() {
    showStatus('Test 80 paires en cours de développement...', 'info');
    console.log('⚠️ Test 80 pairs not implemented yet');
}

// Fonction debug
function debugDisplay() {
    console.log('🐛 Debug mode');
    console.log('Parsed pairs:', parsedPairs.length);
    console.log('Mitchell data:', mitchellData.length);
    showStatus(`Debug: ${parsedPairs.length} paires, ${mitchellData.length} sections`, 'info');
}

// Fonction pour afficher un message de statut
function showStatus(message, type = 'info') {
    console.log(`📢 Status: ${message} (${type})`);
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';
    }
}

// Fonction pour cacher le statut
function hideStatus() {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.style.display = 'none';
    }
}

// Fonction de génération basique
function generateSections() {
    console.log('🔄 Début génération des sections...');

    const data = document.getElementById('tournamentData')?.value || '';
    const sectionCount = parseInt(document.getElementById('sectionCount')?.value) || 1;

    if (!data.trim()) {
        showStatus('❌ Veuillez saisir des données de tournoi', 'error');
        return;
    }

    try {
        // Parse les données au format: NOM Prénom + IV sur lignes séparées
        const lines = data.split('\n').filter(line => line.trim());
        parsedPairs = [];
        let pairNumber = 1;

        console.log('📋 Lignes trouvées:', lines.length);

        for (let i = 0; i < lines.length; i += 4) {
            if (i + 3 < lines.length) {
                const player1Name = lines[i].trim();
                const player1IV = parseInt(lines[i + 1]) || 0;
                const player2Name = lines[i + 2].trim();
                const player2IV = parseInt(lines[i + 3]) || 0;

                const pair = {
                    number: pairNumber++,
                    player1: { name: player1Name, iv: player1IV },
                    player2: { name: player2Name, iv: player2IV }
                };

                pair.combinedIV = pair.player1.iv + pair.player2.iv;
                parsedPairs.push(pair);

                console.log(`✓ Paire ${pair.number}: ${player1Name} (${player1IV}) + ${player2Name} (${player2IV}) = ${pair.combinedIV}`);
            }
        }

        if (parsedPairs.length === 0) {
            showStatus('❌ Aucune paire valide trouvée dans les données', 'error');
            return;
        }

        showStatus(`✅ ${parsedPairs.length} paire(s) trouvée(s) pour ${sectionCount} section(s)`, 'success');

        // Création des sections basiques
        createBasicSections(sectionCount);

        // Affichage des résultats
        displayResults();

    } catch (error) {
        console.error('❌ Erreur parsing:', error);
        showStatus('❌ Erreur lors de l\'analyse des données', 'error');
    }
}

// Fonction pour créer des sections basiques
function createBasicSections(sectionCount) {
    console.log(`🏗️ Création de ${sectionCount} section(s)...`);

    mitchellData = [];

    if (sectionCount === 1) {
        // Une seule section : toutes les paires
        const tablesCount = Math.ceil(parsedPairs.length / 2);
        const section = [];

        for (let t = 1; t <= tablesCount; t++) {
            const nsIndex = (t - 1) * 2;
            const eoIndex = nsIndex + 1;

            section.push({
                tableNumber: t,
                ns: parsedPairs[nsIndex] || null,
                eo: parsedPairs[eoIndex] || null
            });
        }

        mitchellData.push(section);
        console.log(`✓ Section A: ${parsedPairs.length} paires, ${tablesCount} tables`);

    } else {
        // Multiples sections : répartition équilibrée
        const pairsPerSection = Math.floor(parsedPairs.length / sectionCount);
        const extraPairs = parsedPairs.length % sectionCount;

        let pairIndex = 0;

        for (let s = 0; s < sectionCount; s++) {
            const sectionPairCount = pairsPerSection + (s < extraPairs ? 1 : 0);
            const sectionPairs = parsedPairs.slice(pairIndex, pairIndex + sectionPairCount);
            const tablesCount = Math.ceil(sectionPairs.length / 2);

            const section = [];

            for (let t = 1; t <= tablesCount; t++) {
                const nsIndex = (t - 1) * 2;
                const eoIndex = nsIndex + 1;

                section.push({
                    tableNumber: t,
                    ns: sectionPairs[nsIndex] || null,
                    eo: sectionPairs[eoIndex] || null
                });
            }

            mitchellData.push(section);
            pairIndex += sectionPairCount;

            console.log(`✓ Section ${String.fromCharCode(65 + s)}: ${sectionPairs.length} paires, ${tablesCount} tables`);
        }
    }
}

// Fonction pour afficher les résultats
function displayResults() {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    resultsDiv.style.display = 'block';

    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    let html = '<div style="margin-bottom: 20px;">';
    html += `<h3>📊 Résumé du tournoi</h3>`;
    html += `<p><strong>Total paires:</strong> ${parsedPairs.length}</p>`;
    html += `<p><strong>Sections:</strong> ${mitchellData.length}</p>`;
    html += '</div>';

    // Affichage par section
    mitchellData.forEach((section, sectionIndex) => {
        const sectionLetter = String.fromCharCode(65 + sectionIndex);
        html += `<div style="margin-bottom: 20px; border: 1px solid #555; padding: 15px; border-radius: 8px;">`;
        html += `<h4>Section ${sectionLetter}</h4>`;

        section.forEach(table => {
            html += `<div style="margin: 10px 0; padding: 10px; background: #2a2a2a; border-radius: 5px;">`;
            html += `<strong>Table ${table.tableNumber}</strong><br>`;

            if (table.ns) {
                html += `NS: ${table.ns.player1.name} (${table.ns.player1.iv}) + ${table.ns.player2.name} (${table.ns.player2.iv}) = IV ${table.ns.combinedIV}<br>`;
            } else {
                html += `NS: Position libre<br>`;
            }

            if (table.eo) {
                html += `EO: ${table.eo.player1.name} (${table.eo.player1.iv}) + ${table.eo.player2.name} (${table.eo.player2.iv}) = IV ${table.eo.combinedIV}`;
            } else {
                html += `EO: Position libre`;
            }

            html += '</div>';
        });

        html += '</div>';
    });

    container.innerHTML = html;
    console.log('✅ Résultats affichés');
}

// Fonction pour l'affichage Mitchell
function showMitchellDisplay() {
    if (parsedPairs.length === 0 || mitchellData.length === 0) {
        showStatus('❌ Générez d\'abord les sections avant l\'affichage Mitchell', 'error');
        return;
    }

    console.log('📺 Basculement vers affichage Mitchell');

    // Cacher la vue setup, afficher la vue Mitchell
    const setupView = document.getElementById('setupView');
    const mitchellView = document.getElementById('mitchellView');

    if (setupView) {
        setupView.style.display = 'none';
    }

    if (mitchellView) {
        mitchellView.style.display = 'block';

        // Rendre le contenu Mitchell
        renderMitchellDisplay();
    }
}

// Fonction pour retourner à la configuration
function closeToConfig() {
    console.log('🔙 Retour à la configuration');

    const setupView = document.getElementById('setupView');
    const mitchellView = document.getElementById('mitchellView');

    if (setupView) {
        setupView.style.display = 'block';
    }

    if (mitchellView) {
        mitchellView.style.display = 'none';
    }
}

// Fonction pour rendre l'affichage Mitchell complet
function renderMitchellDisplay() {
    console.log('🎨 Rendu de l\'affichage Mitchell');

    const container = document.getElementById('mitchellContainer');
    if (!container) {
        console.error('❌ Container mitchellContainer non trouvé');
        return;
    }

    // Définir la classe CSS pour le nombre de sections
    const sectionsClass = `${mitchellData.length === 1 ? 'single-section' : mitchellData.length === 2 ? 'two-sections' : 'three-sections'}`;
    container.className = `sections-grid ${sectionsClass}`;

    let html = '';

    // Générer chaque section avec son design coloré
    mitchellData.forEach((section, sectionIndex) => {
        const sectionLetter = String.fromCharCode(65 + sectionIndex); // A, B, C
        const sectionClass = `section-${String.fromCharCode(97 + sectionIndex)}`; // section-a, section-b, section-c

        // Calculer les statistiques de la section
        const nsPairs = section.filter(table => table.ns).map(table => table.ns);
        const eoPairs = section.filter(table => table.eo).map(table => table.eo);

        const nsAvgIV = nsPairs.length > 0 ?
            (nsPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0) / nsPairs.length).toFixed(1) : '0';
        const eoAvgIV = eoPairs.length > 0 ?
            (eoPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0) / eoPairs.length).toFixed(1) : '0';

        const tableCount = section.length;

        html += `
            <div class="section-container ${sectionClass}">
                <div class="section-banner">
                    <div class="section-letter">${sectionLetter}</div>
                    <div class="section-stats">
                        <div class="section-stats-line">NS</div>
                        <div class="section-stats-line">~${Math.round(parseFloat(nsAvgIV))}</div>
                        <div class="section-stats-line">EO</div>
                        <div class="section-stats-line">~${Math.round(parseFloat(eoAvgIV))}</div>
                    </div>
                </div>
                <div class="section-content">
                    <div class="tables-grid">
        `;

        // Générer chaque table de la section
        section.forEach(table => {
            html += `
                <div class="table-card">
                    <div class="table-header">${table.tableNumber}</div>
                    <div class="table-positions">
                        ${renderMitchellPosition(table.ns, 'ns', sectionIndex, table.tableNumber)}
                        ${renderMitchellPosition(table.eo, 'eo', sectionIndex, table.tableNumber)}
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Mettre à jour le titre
    const tournamentTitle = document.getElementById('tournamentTitle');
    if (tournamentTitle) {
        const totalIV = parsedPairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
        const avgIV = parsedPairs.length > 0 ? (totalIV / parsedPairs.length).toFixed(1) : '0';
        tournamentTitle.textContent = `Bon tournoi au BCNJ - ${new Date().toLocaleDateString('fr-FR')} - ${parsedPairs.length} paires, IV moyen ${avgIV}`;
    }

    console.log('✅ Affichage Mitchell rendu');
}

// Fonction pour rendre une position dans le style Mitchell
function renderMitchellPosition(pair, position, sectionIndex, tableNumber) {
    const positionClass = position === 'ns' ? 'ns-position' : 'eo-position';
    const positionId = `pos_${sectionIndex}_${tableNumber}_${position}`;

    if (!pair) {
        const isRelais = position === 'eo' && tableNumber === mitchellData[sectionIndex].length && parsedPairs.length % 2 === 1;
        const relaisClass = isRelais ? 'relais-position' : '';
        const displayText = isRelais ? 'RELAIS' : '';

        return `
            <div class="position ${positionClass} ${relaisClass}" data-position="${positionId}">
                <div class="empty-position">${displayText}</div>
            </div>
        `;
    }

    // Formater les noms au style FFB : "NOM Prénom" -> "P. NOM"
    function formatNameToInitial(fullName) {
        if (!fullName || fullName === 'N/A') return 'N/A';
        const parts = fullName.trim().split(' ').filter(p => p.length > 0);
        if (parts.length === 0) return 'N/A';
        if (parts.length === 1) return parts[0].toUpperCase();

        // "MARTIN Pierre" -> "P. MARTIN"
        const lastName = parts[0].toUpperCase();
        const firstName = parts.slice(1).join(' '); // Pour les prénoms composés
        const initial = firstName.charAt(0).toUpperCase();

        return `${initial}. ${lastName}`;
    }

    const player1Display = formatNameToInitial(pair.player1.name);
    const player2Display = formatNameToInitial(pair.player2.name);

    return `
        <div class="position ${positionClass}" data-position="${positionId}" data-iv="${pair.combinedIV}">
            <div class="pair-info">
                <div class="player-names">
                    <div class="player-name">${player1Display}</div>
                    <div class="player-name">${player2Display}</div>
                </div>
            </div>
            <div class="position-indicator">${position.toUpperCase()}</div>
        </div>
    `;
}

// Fonction pour imprimer
function printResults() {
    if (parsedPairs.length === 0) {
        showStatus('❌ Aucune donnée à imprimer', 'error');
        return;
    }

    window.print();
    showStatus('🖨️ Impression lancée', 'success');
}

// Fonctions pour l'automatisation
function showFFBExtractor() {
    showStatus('🔧 Extracteur FFB en développement...', 'info');
}

function initScreenCapture() {
    showStatus('📷 Capture d\'écran en développement...', 'info');
}

function setupN8NIntegration() {
    showStatus('🌐 Intégration n8n en développement...', 'info');
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Page loaded - Bridge Generator Simple');

    // Connecter les événements aux boutons
    const buttons = [
        { id: 'testJSBtn', handler: testJS },
        { id: 'loadTestDataBtn', handler: loadTestData },
        { id: 'loadTestData80Btn', handler: loadTestData80 },
        { id: 'debugDisplay', handler: debugDisplay },
        { id: 'generateButton', handler: generateSections },
        { id: 'showMitchellBtn', handler: showMitchellDisplay },
        { id: 'printBtn', handler: printResults },
        { id: 'fullscreenExit', handler: closeToConfig }
    ];

    // Fonction pour gérer les boutons de sections (1, 2, 3)
    window.setSectionCount = function(count) {
        console.log(`🔄 Changement nombre sections: ${count}`);
        currentSectionCount = count;

        // Mettre à jour les boutons actifs
        document.querySelectorAll('.section-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`sections${count}`)?.classList.add('active');

        // Régénérer si des données existent
        if (parsedPairs.length > 0) {
            createBasicSections(count);
            renderMitchellDisplay();
        }
    };

    // Ajouter les événements pour les boutons de sections
    ['1', '2', '3'].forEach(num => {
        const btn = document.getElementById(`sections${num}`);
        if (btn) {
            btn.addEventListener('click', () => setSectionCount(parseInt(num)));
        }
    });

    buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.handler);
            console.log(`✓ Event listener added for ${btn.id}`);
        } else {
            console.warn(`⚠️ Button ${btn.id} not found`);
        }
    });

    showStatus('Bridge Generator chargé avec succès', 'success');
    console.log('✓ All event listeners configured');
});

console.log('🔍 Bridge Generator Simple module loaded successfully');