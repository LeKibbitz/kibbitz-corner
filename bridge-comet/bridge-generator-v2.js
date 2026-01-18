/**
 * Bridge Section Generator - JavaScript Module
 *
 * Générateur de sections pour tournois de bridge avec algorithmes Mitchell authentiques
 * Extraction du fichier bridge-section-generator-v2.html
 *
 * Fonctionnalités:
 * - Parsing des données FFB
 * - Algorithmes Mitchell 147 et équilibré
 * - Gestion des contraintes NS
 * - Interface interactive avec drag & drop
 * - Mode sombre, pagination, automation
 */

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

/**
 * Affiche un message de statut
 */
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

/**
 * Cache le message de statut
 */
function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

/**
 * Calcule l'IV combiné d'une paire
 */
function calculateCombinedIV(pair) {
    return (pair.player1?.iv || 0) + (pair.player2?.iv || 0);
}

/**
 * Test de fonctionnement JavaScript
 */
function testJS() {
    alert('JavaScript fonctionne !');
    console.log('✓ JavaScript test successful');
}

// ===================================================================
// 3. PARSING DES DONNÉES FFB
// ===================================================================

/**
 * Parse les données du tournoi au format FFB
 * @param {string} data - Données brutes du tournoi
 * @returns {Array} Tableau des paires parsées
 */
function parseTournamentData(data) {
    const pairs = [];
    const lines = data.split('\n');
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

        const playerMatch = line.match(/^(M\.|Mme)\s+(.+?)\s+\(\s*([\d.]+)\s*€\s*\)/);
        if (playerMatch) {
            const fullName = playerMatch[2];
            const amount = parseFloat(playerMatch[3]);

            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                const licenseMatch = nextLine.match(/(\d{8})\s*\(\s*IV\s*=\s*(\d+)\s*\)/);

                if (licenseMatch) {
                    const license = licenseMatch[1];
                    const iv = parseInt(licenseMatch[2]);

                    const player = {
                        name: fullName,
                        license: license,
                        iv: iv,
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

// ===================================================================
// 4. ALGORITHMES MITCHELL
// ===================================================================

/**
 * Distribution principale selon l'algorithme Mitchell
 * @param {Array} pairs - Paires à distribuer
 * @param {number} sectionCount - Nombre de sections
 * @param {boolean} useConstraints - Utiliser les contraintes NS
 * @returns {Array} Sections avec tables et positions
 */
function mitchellDistribution(pairs, sectionCount, useConstraints = false) {
    console.log('🔍 MITCHELL: Starting with', pairs.length, 'pairs,', sectionCount, 'sections');

    // Sort pairs by IV (têtes de série)
    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(b) - calculateCombinedIV(a));

    // Add pair IDs and constraint flags
    sortedPairs.forEach((pair, i) => {
        if (!pair.id) pair.id = `pair_${i}`;
        pair.combinedIV = calculateCombinedIV(pair);
        pair.nsConstraint = useConstraints && nsConstraints.has(pair.id);
    });

    // Calculate tables per section using Mitchell algorithm
    const totalPairs = pairs.length;
    const hasRelais = totalPairs % 2 === 1;
    const totalTables = hasRelais ? (totalPairs + 1) / 2 : totalPairs / 2;

    // Mitchell: distribute tables as evenly as possible
    const tablesPerSection = Math.ceil(totalTables / sectionCount);

    // Ensure we don't have more sections than tables
    if (sectionCount > totalTables) {
        console.warn('⚠️ MITCHELL: More sections than tables, adjusting...');
        sectionCount = Math.min(sectionCount, totalTables);
    }

    console.log('🔍 MITCHELL: Total tables:', totalTables, 'Tables per section:', tablesPerSection);

    // Initialize sections with table numbers 1 to N in EACH section
    const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => {
        return Array.from({ length: tablesPerSection }, (_, i) => ({
            tableNumber: i + 1,  // Chaque section: 1, 2, 3, 4, 5...
            ns: null,
            eo: null
        }));
    });

    // Mitchell Algorithm Implementation
    try {
        console.log('🔍 MITCHELL: Calling generateMitchellPlacement...');
        const result = generateMitchellPlacement(sections, sortedPairs, sectionCount, useConstraints);

        if (result !== true) {
            console.error('❌ MITCHELL: generateMitchellPlacement failed');
            throw new Error('Failed to generate Mitchell placement');
        }

        console.log('🔍 DEBUG: Returning sections:', sections);
        return sections;

    } catch (error) {
        console.error('❌ MITCHELL: Error in mitchellDistribution:', error);
        // Fallback to simple distribution
        return generateSimpleFallback(sections, sortedPairs);
    }
}

/**
 * Génère la séquence Mitchell (saut de 3)
 * @param {number} totalTables - Nombre total de tables
 * @returns {Array} Séquence des tables selon l'algorithme Mitchell
 */
function generateMitchellSequence(totalTables) {
    // Générer la séquence Mitchell : 1,4,7,10... puis 2,5,8,11... puis 3,6,9,12...
    const sequence = [];

    for (let series = 1; series <= 3; series++) {
        for (let table = series; table <= totalTables; table += 3) {
            sequence.push(table);
        }
    }

    return sequence;
}

/**
 * Implémentation de l'algorithme Mitchell authentique
 * @param {Array} sections - Sections avec tables
 * @param {Array} sortedPairs - Paires triées par force
 * @param {number} sectionCount - Nombre de sections
 * @param {boolean} useConstraints - Utiliser les contraintes
 * @returns {boolean} Succès de la génération
 */
function generateMitchellPlacement(sections, sortedPairs, sectionCount, useConstraints) {
    console.log('🔍 MITCHELL: Placing', sortedPairs.length, 'pairs with true Mitchell algorithm');

    // Si contraintes activées, utiliser la gestion des contraintes
    if (useConstraints) {
        return applyMitchellConstraints(sections, sortedPairs, sectionCount);
    }

    // Génération initiale : Vraie logique Mitchell selon les règles décrites
    return generateTrueMitchellDistribution(sections, sortedPairs, sectionCount);
}

/**
 * Distribution Mitchell authentique selon les règles officielles
 * @param {Array} sections - Sections avec tables
 * @param {Array} sortedPairs - Paires triées par IV
 * @param {number} sectionCount - Nombre de sections
 * @returns {boolean} Succès de la génération
 */
function generateTrueMitchellDistribution(sections, sortedPairs, sectionCount) {
    console.log('🔄 TRUE MITCHELL: Génération selon règles Mitchell officielles');
    console.log('🔍 Sections:', sectionCount, 'Paires:', sortedPairs.length);

    // Debug: Afficher les 10 premières paires triées
    console.log('🔍 DEBUG: Top 10 paires triées:');
    for (let i = 0; i < Math.min(10, sortedPairs.length); i++) {
        const pair = sortedPairs[i];
        console.log(`  ${i+1}. ${pair.player1?.name}/${pair.player2?.name} (IV: ${pair.combinedIV})`);
    }

    // Calculer le nombre total de tables
    const hasRelais = sortedPairs.length % 2 === 1;
    const totalTables = Math.ceil(sortedPairs.length / 2);

    console.log('🔍 Total tables:', totalTables, 'Relais:', hasRelais);

    // Initialiser toutes les positions à null
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < sections[sectionIndex].length; tableIndex++) {
            sections[sectionIndex][tableIndex].ns = null;
            sections[sectionIndex][tableIndex].eo = null;
        }
    }

    let pairIndex = 0;

    // Générer la séquence complète des tables Mitchell (saut de 3)
    const mitchellSequence = generateMitchellSequence(totalTables);
    console.log('🔍 Mitchell sequence:', mitchellSequence.join(','));

    // Parcourir toutes les tables dans l'ordre Mitchell
    for (let i = 0; i < mitchellSequence.length && pairIndex < sortedPairs.length; i++) {
        const currentTable = mitchellSequence[i];

        // Trouver la section et table correspondante au numéro de table actuel
        const {sectionIndex, tableIndex} = findTablePosition(sections, currentTable);

        if (sectionIndex !== -1 && tableIndex !== -1) {
            const table = sections[sectionIndex][tableIndex];

            if (sectionCount === 1) {
                // 1 section: NS puis EO alternés sur même table
                if (!table.ns && pairIndex < sortedPairs.length) {
                    table.ns = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable} NS: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
                if (!table.eo && pairIndex < sortedPairs.length) {
                    table.eo = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable} EO: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
            } else if (sectionCount === 2) {
                // 2 sections: NS A, NS B, EO B, EO A (serpentin sur toutes les sections)
                const allTablesForThisNumber = findAllTablesWithNumber(sections, currentTable);

                // Assurer l'ordre A, B pour les sections
                allTablesForThisNumber.sort((a, b) => a.sectionIndex - b.sectionIndex);

                // Placer NS A
                if (allTablesForThisNumber[0] && !allTablesForThisNumber[0].table.ns && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[0].table.ns = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}A NS: Paire ${pairIndex+1} ${sortedPairs[pairIndex].player1?.name}/${sortedPairs[pairIndex].player2?.name} (IV: ${sortedPairs[pairIndex].combinedIV})`);
                    pairIndex++;
                }
                // Placer NS B
                if (allTablesForThisNumber[1] && !allTablesForThisNumber[1].table.ns && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[1].table.ns = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}B NS: Paire ${pairIndex+1} ${sortedPairs[pairIndex].player1?.name}/${sortedPairs[pairIndex].player2?.name} (IV: ${sortedPairs[pairIndex].combinedIV})`);
                    pairIndex++;
                }
                // Placer EO B
                if (allTablesForThisNumber[1] && !allTablesForThisNumber[1].table.eo && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[1].table.eo = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}B EO: Paire ${pairIndex+1} ${sortedPairs[pairIndex].player1?.name}/${sortedPairs[pairIndex].player2?.name} (IV: ${sortedPairs[pairIndex].combinedIV})`);
                    pairIndex++;
                }
                // Placer EO A
                if (allTablesForThisNumber[0] && !allTablesForThisNumber[0].table.eo && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[0].table.eo = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}A EO: Paire ${pairIndex+1} ${sortedPairs[pairIndex].player1?.name}/${sortedPairs[pairIndex].player2?.name} (IV: ${sortedPairs[pairIndex].combinedIV})`);
                    pairIndex++;
                }
            } else if (sectionCount === 3) {
                // 3 sections: NS A, NS B, NS C, EO C, EO B, EO A (serpentin sur toutes les sections)
                const allTablesForThisNumber = findAllTablesWithNumber(sections, currentTable);

                // Assurer l'ordre A, B, C pour les sections
                allTablesForThisNumber.sort((a, b) => a.sectionIndex - b.sectionIndex);

                // Placer NS A, B, C puis EO C, B, A
                if (allTablesForThisNumber[0] && !allTablesForThisNumber[0].table.ns && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[0].table.ns = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}A NS: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
                if (allTablesForThisNumber[1] && !allTablesForThisNumber[1].table.ns && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[1].table.ns = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}B NS: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
                if (allTablesForThisNumber[2] && !allTablesForThisNumber[2].table.ns && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[2].table.ns = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}C NS: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
                // EO en ordre inverse
                if (allTablesForThisNumber[2] && !allTablesForThisNumber[2].table.eo && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[2].table.eo = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}C EO: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
                if (allTablesForThisNumber[1] && !allTablesForThisNumber[1].table.eo && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[1].table.eo = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}B EO: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
                if (allTablesForThisNumber[0] && !allTablesForThisNumber[0].table.eo && pairIndex < sortedPairs.length) {
                    allTablesForThisNumber[0].table.eo = sortedPairs[pairIndex];
                    console.log(`🔍 T${currentTable}A EO: ${sortedPairs[pairIndex].player1?.name}`);
                    pairIndex++;
                }
            }
        }
    }

    console.log('✅ TRUE MITCHELL: Distribution terminée');
    return true;
}

/**
 * Trouve la position d'une table par numéro
 * @param {Array} sections - Sections avec tables
 * @param {number} tableNumber - Numéro de table recherché
 * @returns {Object} Position de la table {sectionIndex, tableIndex}
 */
function findTablePosition(sections, tableNumber) {
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < sections[sectionIndex].length; tableIndex++) {
            if (sections[sectionIndex][tableIndex].tableNumber === tableNumber) {
                return {sectionIndex, tableIndex};
            }
        }
    }
    return {sectionIndex: -1, tableIndex: -1};
}

/**
 * Trouve toutes les tables avec le même numéro dans toutes les sections
 * @param {Array} sections - Sections avec tables
 * @param {number} tableNumber - Numéro de table recherché
 * @returns {Array} Toutes les tables correspondantes
 */
function findAllTablesWithNumber(sections, tableNumber) {
    const tables = [];
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < sections[sectionIndex].length; tableIndex++) {
            if (sections[sectionIndex][tableIndex].tableNumber === tableNumber) {
                tables.push({
                    sectionIndex,
                    tableIndex,
                    table: sections[sectionIndex][tableIndex]
                });
            }
        }
    }
    return tables;
}

/**
 * Distribution de fallback simple
 * @param {Array} sections - Sections avec tables
 * @param {Array} sortedPairs - Paires triées
 * @returns {Array} Sections avec distribution simple
 */
function generateSimpleFallback(sections, sortedPairs) {
    console.log('🔄 SIMPLE FALLBACK: Using basic distribution');
    let pairIndex = 0;

    // Simple distribution: place pairs sequentially
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex];

        for (let tableIndex = 0; tableIndex < section.length; tableIndex++) {
            const table = section[tableIndex];

            // Place NS pair
            if (pairIndex < sortedPairs.length) {
                table.ns = sortedPairs[pairIndex];
                pairIndex++;
            }

            // Place EW pair
            if (pairIndex < sortedPairs.length) {
                table.eo = sortedPairs[pairIndex];
                pairIndex++;
            }
        }
    }

    console.log('✅ SIMPLE FALLBACK: Distribution completed');
    return sections;
}

// ===================================================================
// 5. GESTION DES CONTRAINTES NS
// ===================================================================

/**
 * Applique les contraintes NS avec algorithme Mitchell
 * @param {Array} sections - Sections avec tables
 * @param {Array} sortedPairs - Paires triées
 * @param {number} sectionCount - Nombre de sections
 * @returns {boolean} Succès de l'application des contraintes
 */
function applyMitchellConstraints(sections, sortedPairs, sectionCount) {
    console.log('🔒 CONTRAINTES MITCHELL: Application des contraintes NS avec mémorisation EO');

    // Calculer le nombre total de tables
    const hasRelais = sortedPairs.length % 2 === 1;
    const totalTables = Math.ceil(sortedPairs.length / 2);

    // Initialiser toutes les positions à null
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < sections[sectionIndex].length; tableIndex++) {
            sections[sectionIndex][tableIndex].ns = null;
            sections[sectionIndex][tableIndex].eo = null;
        }
    }

    let pairIndex = 0;
    let memorizedEOPair = null; // Mémoire pour paire EO déplacée

    // Générer la séquence Mitchell
    const mitchellSequence = generateMitchellSequence(totalTables);
    console.log('🔍 Mitchell sequence with constraints:', mitchellSequence.join(','));

    // Parcourir toutes les tables dans l'ordre Mitchell
    for (let i = 0; i < mitchellSequence.length && pairIndex < sortedPairs.length; i++) {
        const currentTable = mitchellSequence[i];
        const {sectionIndex, tableIndex} = findTablePosition(sections, currentTable);

        if (sectionIndex !== -1 && tableIndex !== -1) {
            const table = sections[sectionIndex][tableIndex];

            if (sectionCount === 1) {
                // 1 section avec contraintes
                // Placer NS (avec gestion contraintes)
                if (!table.ns && pairIndex < sortedPairs.length) {
                    const currentPair = sortedPairs[pairIndex];

                    // Si paire mémorisée en attente et position NS disponible
                    if (memorizedEOPair) {
                        table.ns = memorizedEOPair;
                        memorizedEOPair = null;
                        console.log(`🔍 T${currentTable} NS: ${table.ns.player1?.name} (récupérée de mémoire)`);
                    } else {
                        table.ns = currentPair;
                        pairIndex++;
                        console.log(`🔍 T${currentTable} NS: ${currentPair.player1?.name} ${currentPair.nsConstraint ? '(NS FIXE)' : ''}`);
                    }
                }

                // Placer EO (avec gestion contraintes)
                if (!table.eo && pairIndex < sortedPairs.length) {
                    const currentPair = sortedPairs[pairIndex];

                    // Si la paire suivante a une contrainte NS fixe
                    if (currentPair.nsConstraint) {
                        // Mémoriser la paire actuelle pour plus tard et passer à la suivante
                        if (memorizedEOPair) {
                            // S'il y a déjà une paire mémorisée, la placer
                            table.eo = memorizedEOPair;
                            memorizedEOPair = currentPair;
                            console.log(`🔍 T${currentTable} EO: ${table.eo.player1?.name} (mémorisée précédemment)`);
                        } else {
                            memorizedEOPair = currentPair;
                            console.log(`🔒 Paire ${currentPair.player1?.name} mémorisée (NS fixe)`);
                        }
                        pairIndex++;

                        // Essayer la paire suivante pour EO
                        if (pairIndex < sortedPairs.length && !sortedPairs[pairIndex].nsConstraint) {
                            table.eo = sortedPairs[pairIndex];
                            pairIndex++;
                            console.log(`🔍 T${currentTable} EO: ${table.eo.player1?.name}`);
                        }
                    } else {
                        table.eo = currentPair;
                        pairIndex++;
                        console.log(`🔍 T${currentTable} EO: ${currentPair.player1?.name}`);
                    }
                }
            }
            // TODO: Implémenter pour 2 et 3 sections si besoin
        }
    }

    console.log('✅ CONTRAINTES MITCHELL: Distribution avec contraintes terminée');
    return true;
}

/**
 * Force la redistribution avec les contraintes actuelles
 */
function redistributeWithConstraints() {
    // Force regeneration with current constraints
    if (parsedPairs && parsedPairs.length > 0) {
        // Update constraint status for all pairs
        parsedPairs.forEach((pair, index) => {
            if (!pair.id) pair.id = `pair_${index}`;
            pair.nsConstraint = nsConstraints.has(pair.id);
        });

        // Regenerate the distribution
        const useConstraints = nsConstraints.size > 0;
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, useConstraints);
        renderMitchellDisplay();
    }

    hideConstraintControls();
}

// ===================================================================
// 6. ALGORITHME ÉQUILIBRÉ ALTERNATIF
// ===================================================================

/**
 * Distribution équilibrée alternative
 * @param {Array} pairs - Paires à distribuer
 * @param {Array} tableCounts - Nombre de tables par section
 * @param {boolean} useConstraints - Utiliser les contraintes
 * @returns {Array} Sections avec distribution équilibrée
 */
function balancedDistribution(pairs, tableCounts, useConstraints) {
    console.log('🎯 ALGO ÉQUILIBRÉ: Démarrage avec', pairs.length, 'paires');
    console.log('📊 Table counts:', tableCounts);

    const numSections = tableCounts.length;

    // Sort pairs by IV DESC
    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(b) - calculateCombinedIV(a));
    sortedPairs.forEach((pair, i) => {
        if (!pair.id) pair.id = `pair_${i}`;
        pair.combinedIV = calculateCombinedIV(pair);
        pair.nsConstraint = nsConstraints.has(pair.id);
    });

    // Separate constrained from free pairs
    const nsConstrainedPairs = sortedPairs.filter(p => p.nsConstraint);
    const freePairs = sortedPairs.filter(p => !p.nsConstraint);

    // Create sections with specified table counts
    const sections = tableCounts.map(count => {
        const sectionTables = [];
        for (let i = 0; i < count; i++) {
            sectionTables.push({
                tableNumber: i + 1,
                ns: null,
                eo: null
            });
        }
        return sectionTables;
    });

    // Calculate total positions per section (NS + EO)
    const positionsPerSection = tableCounts.map(count => count * 2);
    const totalPositions = positionsPerSection.reduce((a, b) => a + b, 0);

    console.log('📊 Positions par section:', positionsPerSection);

    // Step 1: Place NS-constrained pairs in NS positions (distribute across sections)
    if (nsConstrainedPairs.length > 0) {
        let constraintIdx = 0;
        // Distribute evenly across sections using serpentin
        const sectionOrder = generateSerpentinOrder(numSections, nsConstrainedPairs.length);

        for (let i = 0; i < sectionOrder.length && constraintIdx < nsConstrainedPairs.length; i++) {
            const sectionIdx = sectionOrder[i];
            const section = sections[sectionIdx];

            // Find first empty NS position in this section
            for (let tableIdx = 0; tableIdx < section.length; tableIdx++) {
                if (!section[tableIdx].ns) {
                    section[tableIdx].ns = nsConstrainedPairs[constraintIdx++];
                    break;
                }
            }
        }
    }

    // Step 2: Distribute free pairs using "serpentin équilibré"
    // Build list of all empty positions: {section, table, position (ns/eo)}
    const balancedPositions = createBalancedPositionOrder(sections, numSections);

    // Place free pairs in balanced order
    let freeIdx = 0;
    for (const pos of balancedPositions) {
        if (freeIdx >= freePairs.length) break;

        const table = sections[pos.s][pos.t];
        if (pos.pos === 'ns' && !table.ns) {
            table.ns = freePairs[freeIdx++];
        } else if (pos.pos === 'eo' && !table.eo) {
            table.eo = freePairs[freeIdx++];
        }
    }

    // Log statistics
    logDistributionStats(sections);

    return sections;
}

/**
 * Génère un ordre serpentin pour distribuer entre sections
 * @param {number} numSections - Nombre de sections
 * @param {number} count - Nombre d'éléments à distribuer
 * @returns {Array} Ordre de distribution
 */
function generateSerpentinOrder(numSections, count) {
    const order = [];
    let forward = true;

    while (order.length < count) {
        if (forward) {
            for (let s = 0; s < numSections && order.length < count; s++) {
                order.push(s);
            }
        } else {
            for (let s = numSections - 1; s >= 0 && order.length < count; s--) {
                order.push(s);
            }
        }
        forward = !forward;
    }

    return order;
}

/**
 * Crée un ordre de positions équilibré pour optimiser la distribution IV
 * @param {Array} sections - Sections avec tables
 * @param {number} numSections - Nombre de sections
 * @returns {Array} Ordre des positions
 */
function createBalancedPositionOrder(sections, numSections) {
    const positions = [];

    // Count max tables across sections
    const maxTables = Math.max(...sections.map(s => s.length));

    // Serpentin: distribute by table index across sections, alternating direction
    // This ensures top IV pairs are spread across sections and NS/EO

    // First pass: All NS positions in serpentin
    for (let t = 0; t < maxTables; t++) {
        const forward = t % 2 === 0;
        if (forward) {
            for (let s = 0; s < numSections; s++) {
                if (t < sections[s].length && !sections[s][t].ns) {
                    positions.push({ s, t, pos: 'ns' });
                }
            }
        } else {
            for (let s = numSections - 1; s >= 0; s--) {
                if (t < sections[s].length && !sections[s][t].ns) {
                    positions.push({ s, t, pos: 'ns' });
                }
            }
        }
    }

    // Second pass: All EO positions in serpentin (reversed direction)
    for (let t = 0; t < maxTables; t++) {
        const forward = t % 2 === 1; // Inverted from NS
        if (forward) {
            for (let s = 0; s < numSections; s++) {
                if (t < sections[s].length && !sections[s][t].eo) {
                    positions.push({ s, t, pos: 'eo' });
                }
            }
        } else {
            for (let s = numSections - 1; s >= 0; s--) {
                if (t < sections[s].length && !sections[s][t].eo) {
                    positions.push({ s, t, pos: 'eo' });
                }
            }
        }
    }

    return positions;
}

/**
 * Log des statistiques de distribution pour debug
 * @param {Array} sections - Sections avec distribution
 */
function logDistributionStats(sections) {
    console.log('📊 === STATISTIQUES DE DISTRIBUTION ===');

    for (let s = 0; s < sections.length; s++) {
        const section = sections[s];
        let nsTotal = 0, eoTotal = 0, nsCount = 0, eoCount = 0;

        for (const table of section) {
            if (table.ns) { nsTotal += table.ns.combinedIV || 0; nsCount++; }
            if (table.eo) { eoTotal += table.eo.combinedIV || 0; eoCount++; }
        }

        const nsAvg = nsCount > 0 ? (nsTotal / nsCount).toFixed(1) : 0;
        const eoAvg = eoCount > 0 ? (eoTotal / eoCount).toFixed(1) : 0;
        const sectionTotal = nsTotal + eoTotal;
        const diff = Math.abs(nsTotal - eoTotal);

        console.log(`Section ${String.fromCharCode(65 + s)}: Total=${sectionTotal}, NS=${nsTotal}(~${nsAvg}), EO=${eoTotal}(~${eoAvg}), Diff=${diff}`);
    }

    // Calculate global balance
    const sectionTotals = sections.map(section => {
        let total = 0;
        for (const table of section) {
            if (table.ns) total += table.ns.combinedIV || 0;
            if (table.eo) total += table.eo.combinedIV || 0;
        }
        return total;
    });

    const maxSection = Math.max(...sectionTotals);
    const minSection = Math.min(...sectionTotals);
    console.log(`📊 Écart entre sections: ${maxSection - minSection} (Max: ${maxSection}, Min: ${minSection})`);
}

/**
 * Distribution Mitchell avec nombre de tables personnalisé par section
 * @param {Array} pairs - Paires à distribuer
 * @param {Array} tableCounts - Nombre de tables par section
 * @param {boolean} useConstraints - Utiliser les contraintes
 * @returns {Array} Sections avec distribution
 */
function mitchellDistributionWithTableCounts(pairs, tableCounts, useConstraints) {
    console.log('🔄 MITCHELL 147 avec table counts:', tableCounts, 'Contraintes NS:', nsConstraints.size);

    const numSections = tableCounts.length;

    // Sort pairs by IV and add metadata
    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(b) - calculateCombinedIV(a));
    sortedPairs.forEach((pair, i) => {
        if (!pair.id) pair.id = `pair_${i}`;
        pair.combinedIV = calculateCombinedIV(pair);
        pair.nsConstraint = nsConstraints.has(pair.id);
    });

    // Separate NS-constrained pairs from free pairs
    const nsConstrainedPairs = sortedPairs.filter(p => p.nsConstraint);
    const freePairs = sortedPairs.filter(p => !p.nsConstraint);

    console.log('🔒 NS Contraints:', nsConstrainedPairs.length, 'Libres:', freePairs.length);

    // Create sections with specified table counts
    const sections = tableCounts.map(count => {
        const sectionTables = [];
        for (let i = 0; i < count; i++) {
            sectionTables.push({
                tableNumber: i + 1,
                ns: null,
                eo: null
            });
        }
        return sectionTables;
    });

    // Step 1: Place NS-constrained pairs first (in NS positions)
    let constraintIdx = 0;
    for (let sectionIdx = 0; sectionIdx < numSections && constraintIdx < nsConstrainedPairs.length; sectionIdx++) {
        const section = sections[sectionIdx];
        const tablesInSection = section.length;

        // Distribute constrained pairs using Mitchell 147 pattern within section
        const mitchellSeq = generateMitchellSequence(tablesInSection);

        for (let i = 0; i < mitchellSeq.length && constraintIdx < nsConstrainedPairs.length; i++) {
            const tableNum = mitchellSeq[i];
            const table = section[tableNum - 1];

            if (table && !table.ns) {
                table.ns = nsConstrainedPairs[constraintIdx++];
                console.log(`🔒 NS Fixe: Section ${sectionIdx}, Table ${tableNum}`);
            }
        }
    }

    // Step 2: Fill remaining positions with free pairs using 147 pattern
    let freeIdx = 0;

    for (let sectionIdx = 0; sectionIdx < numSections; sectionIdx++) {
        const section = sections[sectionIdx];
        const tablesInSection = section.length;
        const mitchellSeq = generateMitchellSequence(tablesInSection);

        // Fill NS positions first (following Mitchell sequence)
        for (let i = 0; i < mitchellSeq.length && freeIdx < freePairs.length; i++) {
            const tableNum = mitchellSeq[i];
            const table = section[tableNum - 1];

            if (table && !table.ns) {
                table.ns = freePairs[freeIdx++];
            }
        }

        // Then fill EO positions (following Mitchell sequence)
        for (let i = 0; i < mitchellSeq.length && freeIdx < freePairs.length; i++) {
            const tableNum = mitchellSeq[i];
            const table = section[tableNum - 1];

            if (table && !table.eo) {
                table.eo = freePairs[freeIdx++];
            }
        }
    }

    console.log('✅ Distribution 147 terminée');
    return sections;
}

/**
 * Wrapper qui choisit l'algorithme selon la sélection actuelle
 * @param {Array} pairs - Paires à distribuer
 * @param {Array} tableCounts - Nombre de tables par section
 * @param {boolean} useConstraints - Utiliser les contraintes
 * @returns {Array} Sections avec distribution
 */
function smartDistribution(pairs, tableCounts, useConstraints) {
    if (currentAlgorithm === '147') {
        return mitchellDistributionWithTableCounts(pairs, tableCounts, useConstraints);
    } else {
        return balancedDistribution(pairs, tableCounts, useConstraints);
    }
}

// ===================================================================
// 7. INTERFACE UTILISATEUR ET RENDU
// ===================================================================

/**
 * Génère les sections à partir des données saisies
 */
function generateSections() {
    console.log('🔍 DEBUG: generateSections() appelée');

    // Vérifier que les éléments existent
    const tournamentDataEl = document.getElementById('tournamentData');
    const sectionCountEl = document.getElementById('sectionCount');
    const entryFeeEl = document.getElementById('entryFee');

    if (!tournamentDataEl) {
        console.error('❌ ERROR: Element tournamentData not found');
        alert('Erreur: Zone de texte des données non trouvée');
        return;
    }

    if (!sectionCountEl) {
        console.error('❌ ERROR: Element sectionCount not found');
        alert('Erreur: Sélecteur de sections non trouvé');
        return;
    }

    const data = tournamentDataEl.value.trim();
    currentSectionCount = parseInt(sectionCountEl.value);
    const entryFee = parseFloat(entryFeeEl.value) || 5.0;

    console.log('🔍 DEBUG: Data length:', data.length);
    console.log('🔍 DEBUG: Section count:', currentSectionCount);

    if (!data) {
        showStatus('Veuillez coller les données du tournoi.', 'error');
        return;
    }

    try {
        console.log('🔍 DEBUG: Parsing tournament data...');
        parsedPairs = parseTournamentData(data);
        console.log('🔍 DEBUG: Parsed pairs:', parsedPairs);

        // Validation robuste des données parsées
        if (!parsedPairs || parsedPairs.length === 0) {
            showStatus('Aucune paire valide trouvée dans les données.', 'error');
            return;
        }

        // Vérifier que chaque paire a les champs requis
        for (let i = 0; i < parsedPairs.length; i++) {
            const pair = parsedPairs[i];
            if (!pair.player1 || !pair.player2 ||
                !pair.player1.name || !pair.player2.name ||
                typeof pair.player1.iv !== 'number' || typeof pair.player2.iv !== 'number') {
                console.error('❌ ERROR: Invalid pair at index', i, pair);
                showStatus(`Erreur: Paire ${i + 1} incomplète ou mal formatée.`, 'error');
                return;
            }
        }

        showStatus(`${parsedPairs.length} paires trouvées et analysées.`, 'success');

        console.log('🔍 DEBUG: Creating mitchell distribution...');
        // Add payment status to pairs
        parsedPairs.forEach(pair => {
            const totalPaid = (pair.player1?.amount || 0) + (pair.player2?.amount || 0);
            const expectedTotal = entryFee * 2;

            if (totalPaid >= expectedTotal) {
                pair.paymentStatus = 'full';
            } else if (totalPaid > 0) {
                pair.paymentStatus = 'partial';
            } else {
                pair.paymentStatus = 'none';
            }
            pair.totalPaid = totalPaid;
            pair.expectedTotal = expectedTotal;
        });

        console.log('🔍 DEBUG: Input parsedPairs:', parsedPairs);
        console.log('🔍 DEBUG: Input currentSectionCount:', currentSectionCount);
        console.log('🔍 DEBUG: Entry fee:', entryFee);
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount);
        console.log('🔍 DEBUG: Mitchell data created:', mitchellData);
        console.log('🔍 DEBUG: Mitchell data length:', mitchellData.length);
        if (mitchellData.length > 0) {
            console.log('🔍 DEBUG: First section tables:', mitchellData[0].length);
            console.log('🔍 DEBUG: Sample table:', mitchellData[0][0]);
        }

        // Generate simple summary for setup view
        let html = '<h4>Résumé de la répartition:</h4>';
        mitchellData.forEach((section, index) => {
            const sectionName = currentSectionCount === 1 ? 'Section Unique' : `Section ${index + 1}`;
            html += `<p><strong>${sectionName}:</strong> ${section.length} tables</p>`;
        });

        document.getElementById('sectionsContainer').innerHTML = html;
        document.getElementById('results').style.display = 'block';

        const totalIV = parsedPairs.reduce((sum, pair) => sum + calculateCombinedIV(pair), 0);
        const avgIV = (totalIV / parsedPairs.length).toFixed(1);

        showStatus(
            `Sections générées avec succès! ${parsedPairs.length} paires réparties. IV moyen: ${avgIV}`,
            'success'
        );

        // Auto-show Mitchell display after generation
        setTimeout(() => {
            console.log('🔍 DEBUG: Auto-showing Mitchell display...');
            console.log('🔍 DEBUG: mitchellData before display:', mitchellData);
            showMitchellDisplay();
        }, 500);

    } catch (error) {
        console.error('❌ ERROR in generateSections:', error);
        showStatus('Erreur lors de l\'analyse des données. Vérifiez le format.', 'error');
    }
}

/**
 * Affiche la vue Mitchell avec les sections générées
 */
function showMitchellDisplay() {
    console.log('🔍 DEBUG: showMitchellDisplay called, mitchellData length:', mitchellData.length);

    if (mitchellData.length === 0) {
        console.error('❌ ERROR: No mitchell data available');
        showStatus('Veuillez d\'abord générer les sections.', 'error');
        return;
    }

    console.log('🔍 DEBUG: Switching to Mitchell view...');
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('tournamentDisplay').style.display = 'block';

    const container = document.getElementById('sectionsContainer');
    container.className = currentSectionCount === 1 ? 'sections-grid single-section' : 'sections-grid';

    console.log('🔍 DEBUG: Calling renderMitchellDisplay...');
    renderMitchellDisplay();
    initializeSectionControls();

    // Auto-enter fullscreen
    setTimeout(() => enterFullscreen(), 100);
}

/**
 * Retourne à la vue de configuration
 */
function showSetupView() {
    document.getElementById('setupScreen').style.display = 'block';
    document.getElementById('tournamentDisplay').style.display = 'none';
    // Reset all constraints when returning to config
    nsConstraints.clear();
    currentPage = 1;
    stopAutoPage();
}

/**
 * Rendu principal de l'affichage Mitchell
 */
function renderMitchellDisplay() {
    console.log('🔍 DEBUG: renderMitchellDisplay() appelée');

    const container = document.getElementById('sectionsContainer');
    console.log('🔍 DEBUG: Container element:', container);

    let html = '';

    // Update tournament title
    const today = new Date().toLocaleDateString('fr-FR');
    const totalPairs = parsedPairs.length;
    console.log('🔍 DEBUG: Total pairs:', totalPairs);

    if (totalPairs === 0) {
        console.error('❌ ERROR: No parsed pairs available');
        return;
    }

    // Calculate global IV average for header
    const totalIV = parsedPairs.reduce((sum, pair) => sum + calculateCombinedIV(pair), 0);
    const avgIV = (totalIV / parsedPairs.length).toFixed(1);

    document.getElementById('tournamentTitle').textContent =
        `Bon tournoi au BCNJ - ${today} - ${totalPairs} paires, IV moyen ${avgIV}`;

    // Calculate pagination for single section with many tables
    const tableCount = Math.ceil(totalPairs / 2);
    const availableHeight = window.innerHeight - 140;

    // Determine display mode for single section
    const useTwoColumns = currentSectionCount === 1 && tableCount > 10;
    const needsPagination = false; // Disable pagination - use CSS height management instead

    if (needsPagination) {
        tablesPerPage = 10; // Show 10 tables per page
        totalPages = Math.ceil(tableCount / tablesPerPage);
        const pageNav = document.getElementById('pageNavigation');
        if (pageNav) pageNav.style.display = 'block';
        // Stop auto-page when in constraint mode
        const constraintControls = document.getElementById('constraintControls');
        if (!constraintControls || !constraintControls.style.display ||
            constraintControls.style.display === 'none') {
            startAutoPage();
        } else {
            stopAutoPage();
        }
    } else {
        totalPages = 1;
        currentPage = 1;
        const pageNav = document.getElementById('pageNavigation');
        if (pageNav) pageNav.style.display = 'none';
        stopAutoPage();
    }

    const maxTableHeight = needsPagination ?
        Math.floor(availableHeight / tablesPerPage) - 4 :
        Math.floor(availableHeight / Math.min(tableCount, 12)) - 4;
    const positionHeight = Math.max(32, Math.min(50, maxTableHeight - 12));

    document.documentElement.style.setProperty('--position-height', `${positionHeight}px`);

    // Update layout classes
    const sectionsGrid = container;
    const mitchellView = document.getElementById('mitchellView');

    // Reset all classes
    if (mitchellView) {
        mitchellView.classList.remove('single-section', 'two-columns');
    }
    sectionsGrid.classList.remove('two-sections', 'three-sections');

    if (currentSectionCount === 1) {
        if (mitchellView) {
            mitchellView.classList.add('single-section');
            if (useTwoColumns) {
                mitchellView.classList.add('two-columns');
            }
        }
    } else if (currentSectionCount === 2) {
        sectionsGrid.classList.add('two-sections');
    } else if (currentSectionCount === 3) {
        sectionsGrid.classList.add('three-sections');
    }

    mitchellData.forEach((section, sectionIndex) => {
        const sectionName = currentSectionCount === 1 ? 'Section A' :
            `Section ${String.fromCharCode(65 + sectionIndex)}`; // A, B, C...

        // Always use the correct section class based on index (a, b, c)
        const sectionClass = `section-${String.fromCharCode(97 + sectionIndex)}`; // section-a, section-b, section-c

        // Calculate section statistics (exclude relais/null pairs)
        const nsPairs = section.filter(table => table.ns && table.ns.combinedIV).map(table => table.ns);
        const eoPairs = section.filter(table => table.eo && table.eo.combinedIV).map(table => table.eo);

        // Calculate averages only from valid pairs
        const nsAvgIV = nsPairs.length > 0 ?
            (nsPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0) / nsPairs.length).toFixed(1) : '0';
        const eoAvgIV = eoPairs.length > 0 ?
            (eoPairs.reduce((sum, pair) => sum + (pair.combinedIV || 0), 0) / eoPairs.length).toFixed(1) : '0';

        // Format du titre avec IV moyens harmonieusement répartis - ALWAYS show section banner
        const sectionLetter = currentSectionCount === 1 ? 'A' : String.fromCharCode(65 + sectionIndex);
        const tableCount = section.filter(t => t.ns || t.eo).length;

        // Table count control only for multi-section - vertical layout
        const tableCountControl = currentSectionCount > 1 ? `
            <div class="table-count-control">
                <button class="table-count-btn" onclick="adjustTableCount(${sectionIndex}, 1)" title="Plus de tables">▲</button>
                <div class="table-count-display">
                    <span class="table-count-value">${tableCount}</span>
                    <span class="table-icon">♠♥</span>
                </div>
                <button class="table-count-btn" onclick="adjustTableCount(${sectionIndex}, -1)" title="Moins de tables">▼</button>
            </div>
        ` : '';

        const sectionBanner =
            `<div class="section-banner">
                ${tableCountControl}
                <div class="section-letter">${sectionLetter}</div>
                <div class="section-stats">
                    <div class="section-stats-line"></div>
                    <div class="section-stats-line">NS</div>
                    <div class="section-stats-line">~${Math.round(parseFloat(nsAvgIV))}</div>
                    <div class="section-stats-line">EO</div>
                    <div class="section-stats-line">~${Math.round(parseFloat(eoAvgIV))}</div>
                </div>
             </div>`;

        html += `
            <div class="section-container ${sectionClass}">
                ${sectionBanner}
                <div class="section-content">
                    <div class="tables-grid ${needsPagination ? 'paginated' : ''}">
        `;

        // Filter tables for current page if pagination is active
        let tablesToShow = section;
        if (needsPagination) {
            const startIndex = (currentPage - 1) * tablesPerPage;
            const endIndex = startIndex + tablesPerPage;
            tablesToShow = section.slice(startIndex, endIndex);
        }

        // For multiple sections, filter out empty tables
        if (currentSectionCount > 1) {
            tablesToShow = tablesToShow.filter(table => table.ns || table.eo);
        }

        // Handle two-column layout for single section
        if (currentSectionCount === 1 && useTwoColumns) {
            const halfPoint = Math.ceil(tablesToShow.length / 2);
            const leftTables = tablesToShow.slice(0, halfPoint);
            const rightTables = tablesToShow.slice(halfPoint);

            // Left column
            html += '<div class="column-left">';
            leftTables.forEach(table => {
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
            html += '</div>';

            // Right column
            html += '<div class="column-right">';
            rightTables.forEach(table => {
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
            html += '</div>';
        } else {
            // Normal single column layout
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
        }

        html += `
                    </div>
                </div>
            </div>
        `;
    });

    console.log('🔍 DEBUG: Generated HTML length:', html.length);
    console.log('🔍 DEBUG: First 500 chars of HTML:', html.substring(0, 500));

    if (container) {
        container.innerHTML = html;
        console.log('🔍 DEBUG: Container innerHTML set');
        console.log('🔍 DEBUG: Container children count:', container.children.length);
    } else {
        console.error('❌ ERROR: Container not found!');
        return;
    }

    updatePageIndicator();
    initializeDragAndDrop();
    initializeConstraintSystem();

    // Restore dark mode if it was active
    setTimeout(() => {
        if (isDarkMode) {
            console.log('🌙 Restoring dark mode after render');
            const body = document.body;
            body.style.cssText = 'background-color: #1a1a1a !important; color: #e0e0e0 !important;';
            body.className = 'dark-mode';
        }
    }, 100);
}

/**
 * Rendu d'une position (NS ou EO) avec formatage des noms FFB
 * @param {Object} pair - Paire à afficher
 * @param {string} position - Position ('ns' ou 'eo')
 * @param {number} sectionIndex - Index de la section
 * @param {number} tableNumber - Numéro de table
 * @returns {string} HTML de la position
 */
function renderPosition(pair, position, sectionIndex, tableNumber) {
    const entryFee = parseFloat(document.getElementById('entryFee')?.value) || 5.0;
    const positionClass = position === 'ns' ? 'ns-position' : 'eo-position';
    const positionId = `pos_${sectionIndex}_${tableNumber}_${position}`;

    if (!pair) {
        // Check if this should be RELAIS position
        const isRelais = position === 'eo' &&
            mitchellData[sectionIndex] &&
            tableNumber === mitchellData[sectionIndex].length &&
            parsedPairs.length % 2 === 1;

        const relaisClass = isRelais ? 'relais-position' : '';
        const displayText = isRelais ? 'RELAIS' : 'Position libre';

        return `
            <div class="position ${positionClass} ${relaisClass}" data-position="${positionId}" data-section="${sectionIndex}" data-table="${tableNumber}" data-pos="${position}">
                <div class="empty-position">${displayText}</div>
            </div>
        `;
    }

    // Convert FFB names to INITIAL. NOM format
    // FFB format: "NOM Prénom" -> output: "P. NOM"
    // Examples: MARTIN Pierre -> P. MARTIN | DUPONT Jean-Claude -> J-C. DUPONT
    function formatNameToInitial(fullName) {
        if (!fullName || fullName === 'N/A') return 'N/A';
        const parts = fullName.trim().split(' ').filter(p => p.length > 0);
        if (parts.length === 0) return 'N/A';
        if (parts.length === 1) return parts[0].toUpperCase() + '.';

        // FFB format: first part is LASTNAME, rest is firstname(s)
        const lastName = parts[0].toUpperCase();
        const firstNameParts = parts.slice(1);

        // Handle hyphenated first names or multiple first names
        let initials = '';
        for (let i = 0; i < firstNameParts.length; i++) {
            const namePart = firstNameParts[i];
            if (namePart.includes('-')) {
                // Hyphenated name like "Jean-Claude" -> "J-C"
                const hyphenatedParts = namePart.split('-');
                initials += hyphenatedParts.map(part => part.charAt(0).toUpperCase()).join('-');
            } else {
                // Regular name -> initial
                initials += namePart.charAt(0).toUpperCase();
                if (i < firstNameParts.length - 1) initials += '-';
            }
        }

        return `${initials}. ${lastName}`;
    }

    const name1 = formatNameToInitial(pair.player1?.name);
    const name2 = formatNameToInitial(pair.player2?.name);

    const amount1 = pair.player1?.amount || 0;
    const amount2 = pair.player2?.amount || 0;

    const constraintClass = nsConstraints.has(pair.id) ? 'ns-constraint' : '';
    const paymentClass = `payment-${pair.paymentStatus || 'full'}`;

    return `
        <div class="position ${positionClass} ${constraintClass} ${paymentClass} clickable"
             data-position="${positionId}"
             data-section="${sectionIndex}"
             data-table="${tableNumber}"
             data-pos="${position}"
             data-pair-id="${pair.id}"
             data-iv="IV: ${pair.combinedIV}"
             onclick="toggleCardDetails(this, event); toggleNSConstraint('${pair.id}')">
            <div class="pair-info">
                <div class="position-indicator">
                    <div class="${position}-text">${position.toUpperCase()}</div>
                </div>
                <div class="constraint-indicator">
                    <div class="lock-icon">🔒</div>
                    <div class="ns-text">NS</div>
                </div>
                <div class="player-names">
                    <div class="player-name ${name1.length > 15 ? (name1.length > 20 ? 'name-very-long' : 'name-long') : ''}">
                        <span>${name1}</span>
                        <span class="player-amount">${amount1.toFixed(2)}€</span>
                        ${amount1 < (entryFee || 5.0) ? `<span class="payment-info">⚠️ Manque ${((entryFee || 5.0) - amount1).toFixed(2)}€</span>` : ''}
                    </div>
                    <div class="player-name ${name2.length > 15 ? (name2.length > 20 ? 'name-very-long' : 'name-long') : ''}">
                        <span>${name2}</span>
                        <span class="player-amount">${amount2.toFixed(2)}€</span>
                        ${amount2 < (entryFee || 5.0) ? `<span class="payment-info">⚠️ Manque ${((entryFee || 5.0) - amount2).toFixed(2)}€</span>` : ''}
                    </div>
                </div>
                <div class="iv-total">IV: ${pair.combinedIV}</div>
            </div>
        </div>
    `;
}

// ===================================================================
// 8. INTERACTION DRAG & DROP
// ===================================================================

/**
 * Initialise le système de drag & drop
 */
function initializeDragAndDrop() {
    const positions = document.querySelectorAll('.position');

    positions.forEach(position => {
        position.draggable = true;

        position.addEventListener('dragstart', function(e) {
            const pairId = this.dataset.pairId;
            if (pairId) {
                draggedPair = findPairById(pairId);
                this.classList.add('dragging');
                highlightSimilarIVPositions(draggedPair.combinedIV);
                e.dataTransfer.setData('text/plain', pairId);
            } else {
                e.preventDefault();
            }
        });

        position.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            clearIVHighlights();
            draggedPair = null;
        });

        position.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drop-target');
        });

        position.addEventListener('dragleave', function(e) {
            this.classList.remove('drop-target');
        });

        position.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drop-target');

            const pairId = e.dataTransfer.getData('text/plain');
            if (pairId && draggedPair) {
                handlePairDrop(draggedPair, this);
            }
        });
    });
}

/**
 * Trouve une paire par son ID
 * @param {string} pairId - ID de la paire
 * @returns {Object|null} Paire trouvée ou null
 */
function findPairById(pairId) {
    for (let sectionIndex = 0; sectionIndex < mitchellData.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < mitchellData[sectionIndex].length; tableIndex++) {
            const table = mitchellData[sectionIndex][tableIndex];
            if (table.ns && table.ns.id === pairId) return table.ns;
            if (table.eo && table.eo.id === pairId) return table.eo;
        }
    }
    return null;
}

/**
 * Gère le dépôt d'une paire lors du drag & drop
 * @param {Object} pair - Paire déplacée
 * @param {HTMLElement} targetPosition - Position cible
 */
function handlePairDrop(pair, targetPosition) {
    const targetSection = parseInt(targetPosition.dataset.section);
    const targetTable = parseInt(targetPosition.dataset.table);
    const targetPos = targetPosition.dataset.pos;

    // Find and remove pair from current position
    for (let sectionIndex = 0; sectionIndex < mitchellData.length; sectionIndex++) {
        for (let tableIndex = 0; tableIndex < mitchellData[sectionIndex].length; tableIndex++) {
            const table = mitchellData[sectionIndex][tableIndex];
            if (table.ns && table.ns.id === pair.id) table.ns = null;
            if (table.eo && table.eo.id === pair.id) table.eo = null;
        }
    }

    // Move existing pair if target position is occupied
    const targetTableData = mitchellData[targetSection][targetTable - 1];
    const existingPair = targetTableData[targetPos];

    if (existingPair) {
        // Find first empty position for the displaced pair
        let placed = false;
        for (let sectionIndex = 0; sectionIndex < mitchellData.length && !placed; sectionIndex++) {
            for (let tableIndex = 0; tableIndex < mitchellData[sectionIndex].length && !placed; tableIndex++) {
                const table = mitchellData[sectionIndex][tableIndex];
                if (!table.ns) {
                    table.ns = existingPair;
                    placed = true;
                } else if (!table.eo) {
                    table.eo = existingPair;
                    placed = true;
                }
            }
        }
    }

    // Place dragged pair in target position
    targetTableData[targetPos] = pair;

    // Recalculate IV averages after movement and re-render
    renderMitchellDisplay();
}

/**
 * Surligne les positions avec IV similaire
 * @param {number} draggedIV - IV de la paire déplacée
 */
function highlightSimilarIVPositions(draggedIV) {
    const positions = document.querySelectorAll('.position[data-pair-id]');
    const otherPairs = [];

    // Collect all other pairs with their IV differences
    positions.forEach(position => {
        const pairId = position.dataset.pairId;
        const pair = findPairById(pairId);

        if (pair && pair.id !== draggedPair.id) {
            const ivDiff = Math.abs(pair.combinedIV - draggedIV);
            otherPairs.push({ position, pair, ivDiff });
        }
    });

    if (otherPairs.length === 0) return;

    // Sort by IV difference (smallest first)
    otherPairs.sort((a, b) => a.ivDiff - b.ivDiff);

    // Assign colors based on relative differences
    const totalPairs = otherPairs.length;

    otherPairs.forEach((item, index) => {
        let colorClass;

        if (totalPairs === 1) {
            colorClass = 'similarity-green';
        } else if (totalPairs === 2) {
            colorClass = index === 0 ? 'similarity-green' : 'similarity-red';
        } else {
            // For 3+ pairs: best third = green, middle third = orange, worst third = red
            const greenThreshold = Math.ceil(totalPairs / 3);
            const orangeThreshold = Math.ceil((totalPairs * 2) / 3);

            if (index < greenThreshold) {
                colorClass = 'similarity-green';
            } else if (index < orangeThreshold) {
                colorClass = 'similarity-orange';
            } else {
                colorClass = 'similarity-red';
            }
        }

        item.position.classList.add(colorClass);
    });
}

/**
 * Supprime les surlignages IV
 */
function clearIVHighlights() {
    const positions = document.querySelectorAll('.position');
    positions.forEach(position => {
        position.classList.remove('similarity-green', 'similarity-orange', 'similarity-red');
    });
}

// ===================================================================
// 9. CONTRÔLES DES SECTIONS ET ALGORITHMES
// ===================================================================

/**
 * Change le nombre de sections
 */
function changeSectionCount() {
    const newSectionCount = parseInt(document.getElementById('sectionCountSelect').value);
    console.log('🔄 Changing section count to:', newSectionCount);

    // Update global section count
    currentSectionCount = newSectionCount;

    // Regenerate distribution with new section count
    if (parsedPairs && parsedPairs.length > 0) {
        showStatus('Redistribution en cours...', 'info');

        try {
            // Create new distribution with updated section count
            mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, nsConstraints.size > 0);

            // Update display
            renderMitchellDisplay();

            showStatus(`Redistribué en ${currentSectionCount} section(s)`, 'success');
            hideStatus();
        } catch (error) {
            console.error('Error redistributing:', error);
            showStatus('Erreur lors de la redistribution', 'error');
        }
    }
}

/**
 * Définit le nombre de sections
 * @param {number} count - Nombre de sections
 */
function setSectionCount(count) {
    console.log('🔄 setSectionCount called with:', count);

    // Remove active class from all section buttons
    document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    const btn = document.getElementById('sections' + count);
    if (btn) btn.classList.add('active');

    // Update global section count directly
    currentSectionCount = count;

    // Update hidden select for compatibility
    const select = document.getElementById('sectionCountSelect');
    if (select) select.value = count;

    // Regenerate distribution if we have data
    if (parsedPairs && parsedPairs.length > 0) {
        console.log('🔄 Regenerating with', count, 'sections');
        try {
            mitchellData = mitchellDistribution(parsedPairs, count, nsConstraints.size > 0);
            renderMitchellDisplay();
            console.log('✅ Redistribution complete');
        } catch (error) {
            console.error('❌ Error redistributing:', error);
        }
    }
}

/**
 * Ajuste le nombre de tables dans une section
 * @param {number} sectionIndex - Index de la section
 * @param {number} delta - Changement (+1 ou -1)
 */
function adjustTableCount(sectionIndex, delta) {
    if (currentSectionCount <= 1) return;

    // Initialize pending counts if not set
    if (!pendingTableCounts) {
        pendingTableCounts = mitchellData.map(section =>
            section.filter(t => t.ns || t.eo).length
        );
        originalTableCounts = [...pendingTableCounts];
    }

    const minTables = 2;
    const totalPairs = parsedPairs.length;
    const maxTablesPerSection = Math.ceil(totalPairs / currentSectionCount);

    // Calculate new count
    let newCount = pendingTableCounts[sectionIndex] + delta;
    newCount = Math.max(minTables, Math.min(maxTablesPerSection, newCount));

    if (newCount === pendingTableCounts[sectionIndex]) return;

    // Adjust adjacent section cyclically
    const nextSectionIndex = (sectionIndex + 1) % currentSectionCount;
    const counterDelta = -delta;

    pendingTableCounts[sectionIndex] = newCount;
    pendingTableCounts[nextSectionIndex] = Math.max(minTables,
        pendingTableCounts[nextSectionIndex] + counterDelta);

    // Update display and check if we're back to original
    updateTableCountDisplay();
    checkPendingChangesStatus();
}

/**
 * Met à jour l'affichage du nombre de tables
 */
function updateTableCountDisplay() {
    if (!pendingTableCounts || !originalTableCounts) return;

    document.querySelectorAll('.table-count-value').forEach((el, index) => {
        if (pendingTableCounts[index] !== undefined) {
            el.textContent = pendingTableCounts[index];

            // Add/remove flash class based on modification status
            if (pendingTableCounts[index] !== originalTableCounts[index]) {
                el.classList.add('modified');
            } else {
                el.classList.remove('modified');
            }
        }
    });
}

/**
 * Vérifie le statut des changements en attente
 */
function checkPendingChangesStatus() {
    if (!pendingTableCounts || !originalTableCounts) return;

    // Check if all values are back to original
    const allOriginal = pendingTableCounts.every((count, index) =>
        count === originalTableCounts[index]
    );

    const cartouche = document.getElementById('pendingChanges');
    if (allOriginal) {
        // Hide cartouche and reset
        if (cartouche) cartouche.classList.add('hidden');
        // Remove all flash effects
        document.querySelectorAll('.table-count-value.modified').forEach(el => {
            el.classList.remove('modified');
        });
    } else {
        // Show cartouche
        if (cartouche) cartouche.classList.remove('hidden');
    }
}

/**
 * Applique les changements en attente
 */
function applyPendingChanges() {
    if (pendingTableCounts && parsedPairs.length > 0) {
        console.log('🔄 Applying pending table counts:', pendingTableCounts, 'Algo:', currentAlgorithm);
        try {
            // Use smart distribution which respects current algorithm choice
            mitchellData = smartDistribution(parsedPairs, pendingTableCounts, nsConstraints.size > 0);
            renderMitchellDisplay();
            console.log('✅ Redistribution appliquée avec algo:', currentAlgorithm);
        } catch (error) {
            console.error('❌ Erreur:', error);
            // Fallback to standard distribution
            mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, nsConstraints.size > 0);
            renderMitchellDisplay();
        }
    }
    hidePendingChanges();
}

/**
 * Annule les changements en attente
 */
function cancelPendingChanges() {
    // Restore original display
    if (originalTableCounts) {
        pendingTableCounts = [...originalTableCounts];
        updateTableCountDisplay();
    }
    hidePendingChanges();
    renderMitchellDisplay();
}

/**
 * Cache les changements en attente
 */
function hidePendingChanges() {
    const cartouche = document.getElementById('pendingChanges');
    if (cartouche) {
        cartouche.classList.add('hidden');
    }
    // Remove all flash effects
    document.querySelectorAll('.table-count-value.modified').forEach(el => {
        el.classList.remove('modified');
    });
    pendingTableCounts = null;
    originalTableCounts = null;
}

/**
 * Définit l'algorithme de distribution
 * @param {string} algo - Algorithme ('147' ou 'balanced')
 */
function setAlgorithm(algo) {
    // Remove active class from all algo buttons
    document.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    if (algo === '147') {
        document.getElementById('algo147').classList.add('active');
        currentAlgorithm = '147';
    } else {
        document.getElementById('algoNew').classList.add('active');
        currentAlgorithm = 'balanced';
    }

    // Store algorithm preference
    localStorage.setItem('bridgeAlgorithm', algo);

    // Regenerate if we have data
    if (parsedPairs && parsedPairs.length > 0) {
        const tableCounts = mitchellData.map(section =>
            section.filter(t => t.ns || t.eo).length
        );
        mitchellData = smartDistribution(parsedPairs, tableCounts, nsConstraints.size > 0);
        renderMitchellDisplay();
        showStatus(`Algorithme ${algo === '147' ? 'Mitchell 147' : 'Équilibré'} appliqué`, 'success');
    } else {
        showStatus(`Algorithme changé: ${algo}`, 'info');
    }
}

// ===================================================================
// 10. SYSTÈME DE CONTRAINTES NS
// ===================================================================

/**
 * Initialise le système de contraintes
 */
function initializeConstraintSystem() {
    // Enable click-to-constraint functionality
    updateConstraintDisplay();
}

/**
 * Bascule la contrainte NS d'une paire
 * @param {string} pairId - ID de la paire
 */
function toggleNSConstraint(pairId) {
    // Allow toggle for any pair - NS or EO
    if (nsConstraints.has(pairId)) {
        nsConstraints.delete(pairId);
        console.log('🔒 DEBUG: Removed constraint from pair:', pairId);
    } else {
        nsConstraints.add(pairId);
        console.log('🔒 DEBUG: Added constraint to pair:', pairId);
    }

    updateConstraintDisplay();
    renderMitchellDisplay(); // Re-render to show visual changes
}

/**
 * Met à jour l'affichage des contraintes
 */
function updateConstraintDisplay() {
    const countEl = document.getElementById('constraintCount');
    if (countEl) {
        countEl.textContent = `${nsConstraints.size} paire(s) marquée(s)`;
    }
}

/**
 * Affiche les contrôles de contraintes
 */
function showConstraintControls() {
    document.getElementById('constraintControls').style.display = 'block';
    stopAutoPage(); // Stop auto-pagination when in constraint mode
}

/**
 * Cache les contrôles de contraintes
 */
function hideConstraintControls() {
    document.getElementById('constraintControls').style.display = 'none';
}

/**
 * Efface toutes les contraintes
 */
function clearConstraints() {
    nsConstraints.clear();
    // Refaire la distribution initiale comme au début
    if (parsedPairs && parsedPairs.length > 0) {
        // Reset constraint status for all pairs
        parsedPairs.forEach(pair => {
            pair.nsConstraint = false;
            pair.mustBeNS = false;
        });

        // Generate fresh distribution without any constraints
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, false);
        renderMitchellDisplay();
    }
}

/**
 * Redistribue toutes les paires (avec ou sans contraintes)
 */
function redistributeAll() {
    redistributeWithConstraints(); // The function now handles both cases automatically
}

// ===================================================================
// 11. INTERFACE ET ÉVÉNEMENTS
// ===================================================================

/**
 * Bascule l'affichage des détails d'une carte
 * @param {HTMLElement} cardElement - Élément de la carte
 * @param {Event} event - Événement de clic
 */
function toggleCardDetails(cardElement, event) {
    // Prevent the NS constraint toggle for click on details
    if (event && event.shiftKey) {
        // Shift+click for NS constraint
        return;
    }

    // Toggle show-details class
    cardElement.classList.toggle('show-details');

    // Optional: Auto-hide details after a few seconds
    if (cardElement.classList.contains('show-details')) {
        setTimeout(() => {
            cardElement.classList.remove('show-details');
        }, 5000);
    }
}

/**
 * Initialise les contrôles de sections
 */
function initializeSectionControls() {
    const selector = document.getElementById('sectionCountSelect');
    if (selector && currentSectionCount) {
        selector.value = currentSectionCount.toString();
    }
}

/**
 * Ferme vers la vue de configuration
 */
function closeToConfig() {
    // Exit fullscreen if active
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
            console.error('Error exiting fullscreen:', err);
        });
    }
    // Return to setup view
    showSetupView();
}

/**
 * Entre en mode plein écran
 */
function enterFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            console.log('Fullscreen not available:', err.message);
        });
    }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', function() {
    console.log('Fullscreen changed:', document.fullscreenElement !== null);
});

// ===================================================================
// 12. PAGINATION
// ===================================================================

/**
 * Page suivante
 */
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderMitchellDisplay();
    }
}

/**
 * Page précédente
 */
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderMitchellDisplay();
    }
}

/**
 * Met à jour l'indicateur de page
 */
function updatePageIndicator() {
    const indicator = document.getElementById('pageIndicator');
    if (indicator && totalPages > 1) {
        indicator.textContent = `Page ${currentPage}/${totalPages}`;
    }
}

/**
 * Démarre la pagination automatique
 */
function startAutoPage() {
    stopAutoPage(); // Clear any existing interval
    if (totalPages > 1) {
        autoPageInterval = setInterval(() => {
            if (currentPage >= totalPages) {
                currentPage = 1;
            } else {
                currentPage++;
            }
            renderMitchellDisplay();
        }, 3000); // Change page every 3 seconds
    }
}

/**
 * Arrête la pagination automatique
 */
function stopAutoPage() {
    if (autoPageInterval) {
        clearInterval(autoPageInterval);
        autoPageInterval = null;
    }
}

/**
 * Bascule la pagination automatique
 */
function toggleAutoPage() {
    if (autoPageInterval) {
        stopAutoPage();
    } else {
        startAutoPage();
    }
}

// ===================================================================
// 13. MODE SOMBRE
// ===================================================================

/**
 * Force le mode sombre
 */
function forceDarkMode() {
    console.log('🌙 DARK MODE CALLED, current state:', isDarkMode);

    const body = document.body;
    const btn = document.getElementById('darkModeBtn');

    isDarkMode = !isDarkMode;

    if (isDarkMode) {
        console.log('🌙 Switching to DARK');
        body.style.cssText = 'background-color: #1a1a1a !important; color: #e0e0e0 !important;';
        body.className = 'dark-mode';
        localStorage.setItem('darkMode', 'true');
        if (btn) btn.textContent = '☀️ Light';
    } else {
        console.log('🌙 Switching to LIGHT');
        body.style.cssText = 'background-color: #ffffff !important; color: #000000 !important;';
        body.className = '';
        localStorage.setItem('darkMode', 'false');
        if (btn) btn.textContent = '🌙 Dark';
    }

    console.log('🌙 New state:', isDarkMode);
    console.log('🌙 Body background:', body.style.backgroundColor);
}

/**
 * Met à jour le texte du bouton mode sombre
 * @param {string} text - Nouveau texte
 */
function updateButtonText(text) {
    const btn = document.getElementById('darkModeBtn');
    if (btn) {
        btn.textContent = text;
        console.log('🌙 Button updated to:', text);
    }
}

/**
 * Met à jour le bouton mode sombre
 * @param {boolean} isDark - État du mode sombre
 */
function updateDarkModeButton(isDark) {
    const darkBtn = document.getElementById('darkModeBtn') ||
                   document.querySelector('button[onclick="toggleDarkMode()"]');
    if (darkBtn) {
        darkBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
        console.log('🌙 DEBUG: Button text updated to:', darkBtn.textContent);
    } else {
        console.error('🌙 ERROR: Dark mode button not found');
    }
}

/**
 * Initialise le mode sombre
 */
function initializeDarkMode() {
    const shouldBeDark = localStorage.getItem('darkMode') === 'true';
    console.log('🌙 Initializing dark mode, should be dark:', shouldBeDark);

    const body = document.body;
    const btn = document.getElementById('darkModeBtn');

    isDarkMode = shouldBeDark;

    if (shouldBeDark) {
        body.style.cssText = 'background-color: #1a1a1a !important; color: #e0e0e0 !important;';
        body.className = 'dark-mode';
        if (btn) btn.textContent = '☀️ Light';
    } else {
        body.style.cssText = 'background-color: #ffffff !important; color: #000000 !important;';
        body.className = '';
        if (btn) btn.textContent = '🌙 Dark';
    }

    console.log('🌙 Dark mode initialized, state:', isDarkMode);
}

// ===================================================================
// 14. DONNÉES DE TEST
// ===================================================================

/**
 * Génère des données de test pour 35 paires
 * @returns {string} Données de test formatées
 */
function generateTestData() {
    const names = [
        'MARTIN Pierre', 'BERNARD Marie', 'THOMAS Jean', 'DUBOIS Anne',
        'ROBERT Paul', 'PETIT Claire', 'RICHARD Michel', 'MOREAU Sophie',
        'SIMON Philippe', 'LAURENT Christine', 'LEFEVRE Alain', 'MICHEL Brigitte',
        'GARCIA Carlos', 'DAVID Francine', 'BERTRAND Luc', 'ROUX Monique',
        'FOURNIER Henri', 'GIRARD Nicole', 'BONNET Andre', 'DUPONT Jacqueline',
        'LAMBERT Denis', 'FONTAINE Sylvie', 'ROUSSEAU Gerard', 'VINCENT Martine',
        'MULLER Hans', 'LEROY Danielle', 'FABRE Claude', 'ANDRE Catherine',
        'MERCIER Roger', 'BLANC Isabelle', 'GUERIN Marcel', 'BOYER Yvette',
        'CLEMENT Francis', 'CHEVALIER Odette', 'FRANCOIS Raymond', 'GAUTHIER Helene',
        'PERRIN Yves', 'MOREL Simone', 'ROBIN Fernand', 'COLIN Jeanne',
        'LECLERC Maurice', 'BARBIER Suzanne', 'ARNAUD Robert', 'MARTINEZ Carmen',
        'GAILLARD Henri', 'BRUN Marguerite', 'GARNIER Louis', 'FAURE Marie-Claire',
        'LEMAIRE Antoine', 'ROUSSEL Georgette', 'GIRAUD Pierre', 'HENRY Solange',
        'REY Jean-Claude', 'PEREZ Dolores', 'MOULIN Bernard', 'HUBERT Denise',
        'LUCAS Serge', 'DUFOUR Madeleine', 'BRUNET Charles', 'MARTIN Colette',
        'SCHMITT Fritz', 'RODRIGUEZ Maria', 'COLIN Patrick', 'LEROUX Paulette',
        'AUBRY Christian', 'PICARD Therese', 'GUYOT Rene', 'MEUNIER Lucette',
        'BARRE Emile', 'CHARLES Raymonde', 'RENAUD Albert', 'PHILIPPE Andree'
    ];

    let testData = 'Tournoi Bridge Club Nancy - Test 35 paires du 13/01/2026 à 14:15\n';
    testData += '35 équipe(s)\n';
    testData += 'Nouvelle équipe\n';
    testData += 'Inscription    Joueur 1    Joueur 2    Actions\n';

    // DONNÉES FIXES - Plus jamais de Math.random() !
    testData += '13/01/2026 14:15\nM. MARTIN Pierre ( 5.00 € )\n00000001 ( IV = 190 )\nMme BERNARD Marie ( 5.00 € )\n00000002 ( IV = 187 )\nInscription\n';
    testData += '13/01/2026 14:20\nM. THOMAS Jean ( 5.00 € )\n00000003 ( IV = 185 )\nMme DUBOIS Anne ( 5.00 € )\n00000004 ( IV = 183 )\nInscription\n';
    testData += '13/01/2026 14:25\nM. ROBERT Paul ( 5.00 € )\n00000005 ( IV = 180 )\nMme PETIT Claire ( 5.00 € )\n00000006 ( IV = 178 )\nInscription\n';
    testData += '13/01/2026 14:30\nM. RICHARD Michel ( 5.00 € )\n00000007 ( IV = 175 )\nMme MOREAU Sophie ( 5.00 € )\n00000008 ( IV = 173 )\nInscription\n';
    testData += '13/01/2026 14:35\nM. SIMON Philippe ( 5.00 € )\n00000009 ( IV = 170 )\nMme LAURENT Christine ( 5.00 € )\n00000010 ( IV = 168 )\nInscription\n';
    // ... (ajout des autres données fixes)
    testData += '13/01/2026 17:05\nM. BARRE Emile ( 2.50 € )\n00000069 ( IV = 20 )\nMme CHARLES Raymonde ( 2.50 € )\n00000070 ( IV = 18 )\nInscription\n';

    return testData;
}

/**
 * Génère des données de test pour 80 paires (avec aléatoire)
 * @returns {string} Données de test formatées
 */
function generateTestData80() {
    const names = [
        'MARTIN Pierre', 'BERNARD Marie', 'THOMAS Jean', 'DUBOIS Anne',
        'ROBERT Paul', 'PETIT Claire', 'RICHARD Michel', 'MOREAU Sophie',
        'SIMON Philippe', 'LAURENT Christine', 'LEFEVRE Alain', 'MICHEL Brigitte',
        'GARCIA Carlos', 'DAVID Francine', 'BERTRAND Luc', 'ROUX Monique',
        'ROUSSEAU André', 'VINCENT Nicole', 'LEROY Daniel', 'FOURNIER Sylvie',
        'GIRARD Jacques', 'BONNET Isabelle', 'DUPONT François', 'LAMBERT Véronique',
        'FONTAINE Henri', 'ROBIN Catherine', 'LUCAS Georges', 'MULLER Martine',
        'HENRY Patrick', 'JOLY Dominique', 'GAUTIER Serge', 'FAURE Micheline',
        'ANDRE Christian', 'MERCIER Jacqueline', 'BLANCHARD Roger', 'GUERIN Colette',
        'BOYER Raymond', 'GARNIER Denise', 'CHEVALIER Marcel', 'FRANCOIS Yvette',
        'LEGRAND Albert', 'PREVOST Odette', 'COLIN Fernand', 'GUILLOT Simone',
        'CLEMENT Louis', 'CARON Suzanne', 'LOPEZ Antoine', 'BRUN Jeannine',
        'MOREL Claude', 'BAILLY Ginette', 'REY Maurice', 'MEYER Huguette',
        'PERRIN René', 'PASTOR Lucienne', 'BENOIT Emile', 'LEMOINE Andrée',
        'DURAND Gaston', 'CHARPENTIER Berthe', 'MORVAN Lucien', 'BARBIER Paulette',
        'ARNAUD Gilbert', 'DENIS Solange', 'MARTINEZ Bruno', 'PHILIPPE Madeleine',
        'PARIS Yves', 'MARY Raymonde', 'LECOMTE Gérard', 'LECLERC Georgette',
        'TESSIER Hervé', 'SALMON Renée', 'COSTA José', 'NGUYEN Thérèse',
        'BARBEAU Alain', 'ROLLAND Pierrette', 'DUPUIS Marcel', 'ROGER Claudette',
        'NOEL Bernard', 'ADAM Liliane', 'GUILLAUME Pierre', 'CHARLES Monique'
    ];

    let result = '';
    for (let i = 0; i < 160; i += 2) {
        const player1 = names[i] || `JOUEUR${i+1} Test`;
        const player2 = names[i+1] || `JOUEUR${i+2} Test`;
        const iv1 = Math.floor(Math.random() * 100) + 20; // IV entre 20-120
        const iv2 = Math.floor(Math.random() * 100) + 20;
        const license1 = String(10000000 + i*100 + Math.floor(Math.random() * 99)).padStart(8, '0');
        const license2 = String(10000000 + (i+1)*100 + Math.floor(Math.random() * 99)).padStart(8, '0');

        result += `${player1} (5.00)\n${license1} ( IV = ${iv1} )\n\n`;
        result += `${player2} (5.00)\n${license2} ( IV = ${iv2} )\n\n`;
    }

    console.log('✅ Generated 80 pairs test data');
    return result.trim();
}

/**
 * Charge les données de test
 */
function loadTestData() {
    document.getElementById('tournamentData').value = generateTestData();
    hideStatus();
    // Auto-generate sections after loading test data
    setTimeout(() => {
        generateSections();
    }, 100);
}

/**
 * Charge les données de test 80 paires
 */
function loadTestData80() {
    document.getElementById('tournamentData').value = generateTestData80();
    hideStatus();
    // Auto-generate sections after loading test data
    setTimeout(() => {
        generateSections();
    }, 100);
}

// ===================================================================
// 15. AUTOMATION FFB ET N8N
// ===================================================================

/**
 * Affiche l'extracteur FFB
 */
function showFFBExtractor() {
    const helpDiv = document.getElementById('automationHelp');
    helpDiv.style.display = 'block';
    helpDiv.innerHTML = `
        <h6>📋 Extracteur FFB - Bookmarklet</h6>
        <p>1. <strong>Créer le favori :</strong> Faites glisser ce lien vers votre barre de favoris :</p>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8em; margin: 8px 0;">
            <a href="javascript:(function(){${generateBookmarklet()}})()"
               style="color: #007bff; text-decoration: none;">
               📋 FFB Extractor
            </a>
        </div>
        <p>2. <strong>Utilisation :</strong> Sur ffbridge.fr, page tournoi, cliquez sur le favori</p>
        <p>3. <strong>Résultat :</strong> Les données sont automatiquement importées ici</p>
    `;
}

/**
 * Génère le bookmarklet pour l'extraction FFB
 * @returns {string} Code JavaScript du bookmarklet
 */
function generateBookmarklet() {
    const script = `
        javascript:(() => {
            const tables = document.querySelectorAll('table tr');
            let data = '';
            let currentDate = '';

            tables.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const dateCell = cells[0]?.textContent?.trim();
                    const player1Cell = cells[1]?.textContent?.trim();
                    const player2Cell = cells[2]?.textContent?.trim();

                    if (dateCell && dateCell.match(/\\d{2}\/\\d{2}\/\\d{4}/)) {
                        currentDate = dateCell;
                    }

                    if (player1Cell && player2Cell && currentDate) {
                        data += currentDate + '\\n';
                        data += player1Cell + '\\n';
                        data += player2Cell + '\\n';
                    }
                }
            });

            if (data) {
                const newWindow = window.open('${window.location.href}', '_blank');
                newWindow.addEventListener('load', () => {
                    newWindow.document.getElementById('tournamentData').value = data;
                    newWindow.generateSections();
                });
            } else {
                alert('Aucune donnée de tournoi trouvée sur cette page.');
            }
        })();
    `;

    return script.replace(/\s+/g, ' ').trim();
}

/**
 * Debug de l'affichage
 */
function debugDisplay() {
    console.log('🐛 DEBUG START ====================');
    console.log('Debug - Mitchell Data:', mitchellData);
    console.log('Debug - Parsed Pairs:', parsedPairs);
    console.log('Debug - Current Section Count:', currentSectionCount);
    console.log('Debug - Container:', document.getElementById('mitchellContainer'));
    console.log('Debug - Page Navigation:', document.getElementById('pageNavigation'));
    console.log('🐛 DEBUG END ======================');

    // Show alert to confirm debug ran
    alert(`Debug info logged to console:\n- Parsed pairs: ${parsedPairs.length}\n- Mitchell data: ${mitchellData.length}\n- Section count: ${currentSectionCount}`);
}

// ===================================================================
// 16. INITIALISATION ET EVENT LISTENERS
// ===================================================================

// Initialize dark mode ASAP - CONSOLIDATED INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing...');
    initializeDarkMode();
    loadFFBDataFromExtension();

    // Setup all event listeners
    setupEventListeners();

    // Test simple pour vérifier le fonctionnement
    setTimeout(() => {
        console.log('🔍 Testing status function...');
        showStatus('✅ Générateur prêt !', 'success');
        setTimeout(() => hideStatus(), 3000);
    }, 1000);
});

/**
 * Configure tous les event listeners
 */
function setupEventListeners() {
    console.log('🔍 Setting up event listeners...');

    // Bouton de génération principal
    const generateBtn = document.getElementById('generateTournament');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔍 Generate tournament button clicked');
            generateTournamentFromSetup();
        });
        console.log('✓ Generate tournament button event listener added');
    } else {
        console.warn('⚠️ Generate tournament button not found');
    }

    // Bouton de test data
    const testDataBtn = document.getElementById('loadTestData');
    if (testDataBtn) {
        testDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateTestData();
            updatePreview();
            showStatus('✅ Données de test chargées', 'success');
        });
    }

    // Bouton retour setup
    const backToSetupBtn = document.getElementById('backToSetup');
    if (backToSetupBtn) {
        backToSetupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('setupScreen').style.display = 'block';
            document.getElementById('tournamentDisplay').style.display = 'none';
        });
    }

    // Mode sombre
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) {
        console.log('🌙 Dark mode button found, adding click handler');
        darkModeBtn.onclick = forceDarkMode;
    }

    // Sélecteurs de configuration
    const movementType = document.getElementById('movementType');
    const sectionCount = document.getElementById('sectionCount');
    const algorithmType = document.getElementById('algorithmType');

    if (movementType) movementType.addEventListener('change', updatePreview);
    if (sectionCount) sectionCount.addEventListener('change', updatePreview);
    if (algorithmType) algorithmType.addEventListener('change', updatePreview);
}

/**
 * Initialise l'affichage public avec des données de test
 */
function initializePublicDisplay() {
    console.log('🔍 DEBUG: Initializing public display...');

    // Show Mitchell view and hide setup view
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('tournamentDisplay').style.display = 'block';

    // Load test data into hidden form
    document.getElementById('tournamentData').value = generateTestData();

    // Parse and generate sections
    generateSections();

    console.log('🔍 DEBUG: Public display initialized');
}

// Fix for missing display - ensure renderMitchellDisplay is called
window.addEventListener('load', function() {
    // Auto-load test data for public display (disabled for extension)
    // setTimeout(() => {
    //     initializePublicDisplay();
    // }, 500);

    // Auto-debug on page load
    setTimeout(() => {
        if (parsedPairs.length > 0 && mitchellData.length === 0) {
            console.warn('Warning: Parsed pairs exist but mitchell data is empty');
            debugDisplay();
        }
    }, 1000);
});

// Note: Event listeners are now consolidated in setupEventListeners() function called from main DOMContentLoaded

// ===================================================================
// EXTENSION CHROME - RÉCUPÉRATION DES DONNÉES FFB
// ===================================================================

/**
 * Bascule de la vue configuration vers l'affichage du tournoi
 */
function showTournamentView() {
    console.log('🎯 Basculement vers l\'affichage du tournoi...');

    const setupView = document.getElementById('setupView');
    const mitchellView = document.getElementById('mitchellView');

    if (setupView) {
        setupView.style.display = 'none';
        console.log('✓ Vue configuration masquée');
    }

    if (mitchellView) {
        mitchellView.style.display = 'block';
        console.log('✓ Vue tournoi affichée');
    } else {
        console.error('❌ Element mitchellView non trouvé');
    }
}

// Code dupliqué supprimé - fonction loadFFBDataFromExtension() définie plus bas

// ===================================================================
// EXTENSION CHROME - RÉCUPÉRATION DES DONNÉES FFB
// ===================================================================

/**
 * Récupère les données FFB depuis le storage de l'extension Chrome
 */
function loadFFBDataFromExtension() {
    console.log('🚀 loadFFBDataFromExtension() APPELÉE');
    console.log('🔍 chrome disponible:', typeof chrome !== 'undefined');
    console.log('🔍 chrome.storage disponible:', typeof chrome !== 'undefined' && chrome.storage);

    if (typeof chrome !== 'undefined' && chrome.storage) {
        console.log('🔍 Extension Chrome détectée, chargement des données FFB...');

        chrome.storage.local.get(['ffbPlayersData'], (result) => {
            if (chrome.runtime.lastError) {
                console.error('❌ Erreur storage:', chrome.runtime.lastError);
                showStatus('❌ Erreur de récupération des données FFB', 'error');
                return;
            }

            const ffbData = result.ffbPlayersData;
            console.log('🔍 Raw result:', result);
            console.log('🔍 ffbData:', ffbData);
            console.log('🔍 ffbData type:', typeof ffbData);
            console.log('🔍 ffbData length:', ffbData ? ffbData.length : 'undefined');

            if (ffbData && ffbData.length > 0) {
                console.log('✅ Données FFB récupérées:', ffbData.length, 'joueurs');
                console.log('🔍 Première donnée FFB:', ffbData[0]);

                // Convertir les données FFB directement en paires
                console.log('🔄 Appel de convertFFBDataToPairs...');
                parsedPairs = convertFFBDataToPairs(ffbData);
                console.log('✅ Paires créées:', parsedPairs.length);
                if (parsedPairs.length > 0) {
                    updatePlayerCount(parsedPairs.length);
                    updatePreview();
                    showStatus(`✅ ${parsedPairs.length} équipes chargées depuis FFB`, 'success');

                    // Auto-générer les données Mitchell pour l'affichage
                    try {
                        const sectionCount = Math.min(Math.ceil(parsedPairs.length / 8), 3);
                        currentSectionCount = sectionCount;
                        mitchellData = mitchellDistribution(parsedPairs, sectionCount, false);
                        console.log('✅ Mitchell data auto-generated:', mitchellData.length, 'sections');

                        // NOUVEAU: Affichage automatique des sections
                        console.log('🎯 Affichage automatique des sections...');
                        setTimeout(() => {
                            showTournamentDisplay();
                            renderMitchellDisplay();
                            console.log('✅ Sections affichées automatiquement !');
                        }, 1000);

                    } catch (error) {
                        console.error('❌ Erreur auto-génération Mitchell:', error);
                    }
                } else {
                    showStatus('❌ Impossible de former des paires', 'error');
                }
            } else {
                console.log('⚠️ Aucune donnée FFB trouvée, chargement des données de test...');
                generateTestData();
                updatePreview();
            }
        });
    } else {
        console.log('⚠️ Extension Chrome non détectée, chargement des données de test...');
        generateTestData();
        updatePreview();
    }
}

/**
 * Convertit les données FFB en paires pour le bridge
 */
function convertFFBDataToPairs(ffbPlayers) {
    console.log('🔄 Conversion de', ffbPlayers.length, 'joueurs FFB en paires...');

    const pairs = [];

    // Créer des paires en associant les joueurs par groupes de 2
    for (let i = 0; i < ffbPlayers.length; i += 2) {
        const player1 = ffbPlayers[i];
        const player2 = ffbPlayers[i + 1];

        if (player1) {
            const pair = {
                id: `pair_${Math.floor(i/2) + 1}`,
                player1: {
                    name: player1.name, // Garder le nom original FFB
                    iv: parseInt(player1.iv) || 0,
                    license: player1.license,
                    paymentStatus: 'paid'
                },
                player2: player2 ? {
                    name: player2.name, // Garder le nom original FFB
                    iv: parseInt(player2.iv) || 0,
                    license: player2.license,
                    paymentStatus: 'paid'
                } : null
            };

            // Ajouter les propriétés nécessaires pour le système
            pair.combinedIV = calculateCombinedIV(pair);

            pairs.push(pair);
            console.log('✓ Paire créée:', pair.id, '- IV total:', pair.combinedIV);
        }
    }

    console.log('✅ Conversion terminée:', pairs.length, 'paires créées');
    return pairs;
}

/**
 * Génère des paires de test directement au bon format
 */
function generateTestPairs(pairCount = 80) {
    console.log('🎲 Génération de', pairCount, 'paires de test...');

    const names = [
        'MARTIN Pierre', 'BERNARD Marie', 'THOMAS Jean', 'DUBOIS Anne',
        'ROBERT Paul', 'PETIT Claire', 'RICHARD Michel', 'MOREAU Sophie',
        'SIMON Philippe', 'LAURENT Christine', 'LEFEVRE Alain', 'MICHEL Brigitte',
        'GARCIA Carlos', 'DAVID Francine', 'BERTRAND Luc', 'ROUX Monique',
        'ROUSSEAU André', 'VINCENT Nicole', 'LEROY Daniel', 'FOURNIER Sylvie',
        'GIRARD Jacques', 'BONNET Isabelle', 'DUPONT François', 'LAMBERT Véronique',
        'FONTAINE Henri', 'ROBIN Catherine', 'LUCAS Georges', 'MULLER Martine',
        'HENRY Patrick', 'JOLY Dominique', 'GAUTIER Serge', 'FAURE Micheline'
    ];

    const pairs = [];

    for (let i = 0; i < pairCount; i++) {
        const nameIndex1 = (i * 2) % names.length;
        const nameIndex2 = (i * 2 + 1) % names.length;

        const player1Name = names[nameIndex1] || `JOUEUR${i*2+1} Test`;
        const player2Name = names[nameIndex2] || `JOUEUR${i*2+2} Test`;

        const pair = {
            id: `pair_${i + 1}`,
            player1: {
                name: player1Name,
                iv: Math.floor(Math.random() * 80) + 20, // IV entre 20-100
                license: String(10000000 + i*100 + Math.floor(Math.random() * 99)).padStart(8, '0'),
                paymentStatus: 'paid'
            },
            player2: {
                name: player2Name,
                iv: Math.floor(Math.random() * 80) + 20,
                license: String(10000000 + (i*100+50) + Math.floor(Math.random() * 99)).padStart(8, '0'),
                paymentStatus: 'paid'
            }
        };

        // Calculer l'IV combiné
        pair.combinedIV = calculateCombinedIV(pair);
        pairs.push(pair);
    }

    console.log('✅ Génération terminée:', pairs.length, 'paires créées');
    return pairs;
}

/**
 * Formate le nom FFB (M./Mme) vers format bridge (P. NOM)
 */
function formatFFBName(ffbName) {
    if (!ffbName) return '';

    // M. WEBER Christian → C. WEBER
    // Mme MARTIN Sophie → S. MARTIN
    const match = ffbName.match(/(M\.|Mme)\s+([A-Z]+)\s+([A-Z][a-z]+)/);
    if (match) {
        const lastName = match[2];
        const firstName = match[3];
        return `${firstName.charAt(0)}. ${lastName}`;
    }

    return ffbName; // Fallback si pas de match
}

/**
 * Met à jour l'affichage du nombre de joueurs
 */
function updatePlayerCount(pairCount) {
    const playerCountEl = document.getElementById('playerCount');
    if (playerCountEl) {
        playerCountEl.textContent = `Données extraites : ${pairCount * 2} joueurs (${pairCount} paires)`;
    }
}

/**
 * Met à jour l'aperçu de la configuration
 */
function updatePreview() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const movementType = document.getElementById('movementType')?.value || 'auto';
    const sectionCount = document.getElementById('sectionCount')?.value || 'auto';
    const algorithmType = document.getElementById('algorithmType')?.value || '147';

    if (parsedPairs && parsedPairs.length > 0) {
        const pairCount = parsedPairs.length;
        const playerCount = pairCount * 2;

        let sectionEstimate = sectionCount === 'auto' ? Math.ceil(pairCount / 8) : parseInt(sectionCount);
        let movementEstimate = movementType === 'auto' ?
            (pairCount <= 16 ? 'Howell' : 'Mitchell') :
            movementType;

        previewContent.innerHTML = `
            <strong>📊 Configuration actuelle :</strong><br>
            • ${playerCount} joueurs (${pairCount} paires)<br>
            • ${sectionEstimate} section(s)<br>
            • Mouvement : ${movementEstimate}<br>
            • Algorithme : ${algorithmType}<br>
            • Tables par section : ~${Math.ceil(pairCount / sectionEstimate)}
        `;
    } else {
        previewContent.innerHTML = `
            <strong>⏳ En attente des données...</strong><br>
            Aucune donnée FFB chargée.
        `;
    }
}

/**
 * Lance la génération du tournoi depuis l'écran de setup
 */
function generateTournamentFromSetup() {
    if (!parsedPairs || parsedPairs.length === 0) {
        showStatus('❌ Aucune donnée de tournoi disponible', 'error');
        return;
    }

    const movementType = document.getElementById('movementType')?.value || 'auto';
    const sectionCount = document.getElementById('sectionCount')?.value || 'auto';
    const algorithmType = document.getElementById('algorithmType')?.value || '147';
    const autoFullscreen = document.getElementById('autoFullscreen')?.checked || false;

    // Calculer le nombre de sections
    let finalSectionCount = sectionCount === 'auto' ?
        Math.min(Math.ceil(parsedPairs.length / 8), 3) :
        parseInt(sectionCount);

    currentSectionCount = finalSectionCount;
    currentAlgorithm = algorithmType;

    try {
        // Générer la distribution Mitchell
        mitchellData = mitchellDistribution(parsedPairs, finalSectionCount, false);

        // Passer à l'affichage du tournoi
        showTournamentDisplay();

        // Plein écran si activé
        if (autoFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        }

        showStatus(`✅ Tournoi généré avec ${finalSectionCount} section(s)`, 'success');
        hideStatus();

    } catch (error) {
        console.error('❌ Erreur génération:', error);
        showStatus('❌ Erreur lors de la génération du tournoi', 'error');
    }
}

/**
 * Affiche l'écran de tournoi
 */
function showTournamentDisplay() {
    console.log('🎯 Affichage du tournoi...');
    console.log('🔍 DEBUG showTournamentDisplay - Parsed pairs:', parsedPairs.length);
    console.log('🔍 DEBUG showTournamentDisplay - Mitchell data:', mitchellData.length);

    const setupView = document.getElementById('setupView');
    const mitchellView = document.getElementById('mitchellView');

    if (setupView) {
        setupView.style.display = 'none';
        console.log('✓ Setup view hidden');
    }
    if (mitchellView) {
        mitchellView.style.display = 'block';
        console.log('✓ Mitchell view shown');
    }

    renderMitchellDisplay();
}

/**
 * Affiche l'écran de configuration
 */
function showSetupScreen() {
    const setupView = document.getElementById('setupView');
    const mitchellView = document.getElementById('mitchellView');

    if (setupView) setupView.style.display = 'block';
    if (mitchellView) mitchellView.style.display = 'none';
}

console.log('🔍 Bridge Generator JavaScript module loaded successfully');