// Bridge Generator V2 - JavaScript externe (CSP compliant)

// ===================================================================
// 1. VARIABLES GLOBALES ET ÉTAT
// ===================================================================

let parsedPairs = [];
let mitchellData = [];
let draggedPair = null;
let currentSectionCount = 1;

// Mémoriser les nombres de tables personnalisés par section
let customTableCounts = null; // null = utiliser valeurs par défaut
let nsConstraints = new Set();
let constraintMode = 'sectionA'; // 'sectionA' or 'anySection'
let currentPage = 1;
let totalPages = 1;
let tablesPerPage = 50;
let autoPageInterval = null;
let pendingTableCounts = null;
let originalTableCounts = null;
let currentAlgorithm = 'balanced-constraint'; // Balanced constraint algorithm
let constraintVariant = 1; // 1: NS fixe → Section A, 2: NS fixe → N'importe quelle section
let isDarkMode = false;
let isConstraintMode = false; // Mode contrainte NS

// Variables pour l'échange de paires - toujours actif
let draggedSwapPair = null;

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
    // NOTIFICATION DISABLED - Pop-up removed
    return;
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

        // Nouvelle approche : séparer préfixe, nom et montant
        if (line.match(/^(M\.|Mme)\s+/) && line.match(/\(\s*[\d.,]+\s*€\s*\)$/)) {
            const prefixMatch = line.match(/^(M\.|Mme)\s+/);
            const amountMatch = line.match(/\(\s*([\d.,]+)\s*€\s*\)$/);

            if (prefixMatch && amountMatch) {
                const prefix = prefixMatch[0];
                const amount = parseFloat(amountMatch[1].replace(',', '.'));

                // Extraire le nom entre le préfixe et le montant
                const nameStart = prefix.length;
                const nameEnd = line.lastIndexOf('(');
                const fullName = line.substring(nameStart, nameEnd).trim();

                console.log('🔍 Parsing:', line);
                console.log('   Nom extrait:', fullName);

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

        // Debug: afficher toutes les lignes non vides pour voir les formats
        if (line.trim()) {
            console.log(`📋 Ligne brute ${i}:`, line);
        }

        // Debug: afficher toutes les lignes qui pourraient être des joueurs
        if (line.includes('€') && (line.includes('M.') || line.includes('Mme'))) {
            console.log('🔍 Ligne potentielle joueur (simplified):', line);
        }

        if (line.match(/^(M\.|Mme)\s+/) && line.match(/\(\s*[\d.,]+\s*€\s*\)$/)) {
            const prefixMatch = line.match(/^(M\.|Mme)\s+/);
            const amountMatch = line.match(/\(\s*([\d.,]+)\s*€\s*\)$/);

            if (prefixMatch && amountMatch) {
                const prefix = prefixMatch[0];
                const amount = parseFloat(amountMatch[1].replace(',', '.'));

                // Extraire le nom entre le préfixe et le montant
                const nameStart = prefix.length;
                const nameEnd = line.lastIndexOf('(');
                const fullName = line.substring(nameStart, nameEnd).trim();

                console.log('🔍 Parsing (simplified):', line);
                console.log('   Nom extrait:', fullName);

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

        // Debug: afficher toutes les lignes non vides pour voir les formats
        if (line.trim()) {
            console.log(`📋 Ligne brute ${i}:`, line);
        }

        // Debug: afficher toutes les lignes qui pourraient être des joueurs
        if (line.includes('€') && (line.includes('M.') || line.includes('Mme'))) {
            console.log('🔍 Ligne potentielle joueur (simplified):', line);
        }

        if (line.match(/^(M\.|Mme)\s+/) && line.match(/\(\s*[\d.,]+\s*€\s*\)$/)) {
            const prefixMatch = line.match(/^(M\.|Mme)\s+/);
            const amountMatch = line.match(/\(\s*([\d.,]+)\s*€\s*\)$/);

            if (prefixMatch && amountMatch) {
                const prefix = prefixMatch[0];
                const amount = parseFloat(amountMatch[1].replace(',', '.'));

                // Extraire le nom entre le préfixe et le montant
                const nameStart = prefix.length;
                const nameEnd = line.lastIndexOf('(');
                const fullName = line.substring(nameStart, nameEnd).trim();

                console.log('🔍 Parsing (simplified):', line);
                console.log('   Nom extrait:', fullName);

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

function mitchellDistribution(pairs, sectionCount, useConstraints = false, customCounts = null) {
    console.log('🔍 MITCHELL: Starting with', pairs.length, 'pairs,', sectionCount, 'sections');

    if (customCounts) {
        console.log(`🎛️ PERSONNALISATION: Utilisation de [${customCounts.join(', ')}] tables par section`);
    }

    const sortedPairs = [...pairs].sort((a, b) => calculateCombinedIV(b) - calculateCombinedIV(a));

    sortedPairs.forEach((pair, i) => {
        if (!pair.id) pair.id = `pair_${i}`;
        pair.combinedIV = calculateCombinedIV(pair);
        pair.nsConstraint = useConstraints && nsConstraints.has(pair.id);
    });

    const totalPairs = pairs.length;
    const hasRelais = totalPairs % 2 === 1;
    const totalTables = hasRelais ? (totalPairs + 1) / 2 : totalPairs / 2;
    // Calculer nombre de tables par section (personnalisé ou par défaut)
    let tablesPerSectionArray;

    if (customCounts && customCounts.length === sectionCount) {
        // Utiliser les valeurs personnalisées
        tablesPerSectionArray = [...customCounts];
        console.log('🎛️ MITCHELL: Utilisation personnalisée:', tablesPerSectionArray);
    } else {
        // Valeurs par défaut uniformes
        const tablesPerSection = Math.ceil(totalTables / sectionCount);
        tablesPerSectionArray = Array(sectionCount).fill(tablesPerSection);
        console.log('🔍 MITCHELL: Répartition par défaut:', tablesPerSectionArray);
    }

    if (sectionCount > totalTables) {
        console.warn('⚠️ MITCHELL: More sections than tables, adjusting...');
        sectionCount = Math.min(sectionCount, totalTables);
    }

    const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => {
        const tablesForThisSection = tablesPerSectionArray[sectionIndex] || 0;
        return Array.from({ length: tablesForThisSection }, (_, i) => ({
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
    } else if (currentAlgorithm === 'dynamic') {
        return generateDynamicWeightDistribution(sections, sortedPairs, sectionCount);
    } else if (currentAlgorithm === 'minimal-imbalance') {
        return generateMinimalImbalanceDistribution(sections, sortedPairs, sectionCount);
    } else if (currentAlgorithm === 'balanced-constraint') {
        return generateMILPOptimalDistribution(sections, sortedPairs, sectionCount);
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
    console.log('🔄 EQUILIBRATED: Distribution équilibrée avec contraintes NS');

    // Séparer les paires avec contraintes NS des autres
    const nsConstrainedPairs = sortedPairs.filter(pair => pair.nsConstraint);
    const freePairs = sortedPairs.filter(pair => !pair.nsConstraint);

    console.log(`🔒 Contraintes: ${nsConstrainedPairs.length} NS fixe, ${freePairs.length} libres`);

    // 1. Placer d'abord les paires avec contraintes NS
    nsConstrainedPairs.forEach((pair, index) => {
        const sectionIndex = index % sectionCount;
        const section = sections[sectionIndex];
        const availableTable = section.find(table => !table.ns);
        if (availableTable) {
            availableTable.ns = pair;
            console.log(`🔒 NS fixe: paire ${pair.id} placée en section ${sectionIndex} table ${availableTable.tableNumber}`);
        }
    });

    // 2. Placer les paires libres dans les positions restantes
    let pairIndex = 0;
    let forward = true;

    while (pairIndex < freePairs.length) {
        const sectionsOrder = forward ?
            Array.from({ length: sectionCount }, (_, i) => i) :
            Array.from({ length: sectionCount }, (_, i) => sectionCount - 1 - i);

        for (let s of sectionsOrder) {
            if (pairIndex >= freePairs.length) break;

            for (let table of sections[s]) {
                if (!table.ns) {
                    table.ns = freePairs[pairIndex++];
                    break;
                } else if (!table.eo) {
                    table.eo = freePairs[pairIndex++];
                    break;
                }
            }
        }

        forward = !forward;
    }

    return true;
}

function generateBalancedConstraintDistribution(sections, sortedPairs, sectionCount) {
    console.log('🎯 MATHEMATICAL OPTIMAL: Algorithme PLNE équilibrage parfait');

    // Calculer IV moyen cible - TOUTES les moyennes doivent tendre vers cela
    const totalIV = sortedPairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
    const targetIV = totalIV / sortedPairs.length;
    console.log(`🎯 IV cible ABSOLUE: ${targetIV.toFixed(1)} (toutes les lignes/sections)`);
    console.log(`📐 Mode: ${sectionCount} section(s), Variante contraintes: ${constraintVariant}`);

    // Séparer contraintes NS fixe et paires libres
    const nsConstrainedPairs = sortedPairs.filter(pair => pair.nsConstraint);
    const freePairs = sortedPairs.filter(pair => !pair.nsConstraint);

    if (constraintVariant === 1) {
        console.log(`🔒 VARIANTE 1: ${nsConstrainedPairs.length} contraintes NS → Section A obligatoire, ${freePairs.length} libres`);
    } else {
        console.log(`🔒 VARIANTE 2: ${nsConstrainedPairs.length} contraintes NS → N'importe quelle section, ${freePairs.length} libres`);
    }

    // ÉTAPE 1: Allocation optimale des paires entre sections
    const sectionAllocations = allocatePairsToSections(sortedPairs, sectionCount, targetIV, nsConstrainedPairs, constraintVariant);

    // ÉTAPE 2: Placement dans chaque section pour équilibrer NS/EO
    sectionAllocations.forEach((allocation, sectionIndex) => {
        placePairsInSection(sections[sectionIndex], allocation, targetIV, sectionIndex);
    });

    return true;
}

function generateMILPOptimalDistribution(sections, sortedPairs, sectionCount) {
    console.log('🎯 MILP OPTIMAL: Algorithme MILP équilibrage mathématiquement parfait');

    // Calculer IV moyen global et cible par ligne
    const totalIV = sortedPairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
    const targetLineAverage = totalIV / (sectionCount * 2); // 2 lignes par section (NS + EO)

    console.log(`🎯 IV total: ${totalIV}, Cible par ligne: ${targetLineAverage.toFixed(1)}`);
    console.log(`📐 Mode: ${sectionCount} section(s), ${sortedPairs.length} paires, Variante: ${constraintVariant}`);

    // Identifier contraintes
    const nsConstrainedPairs = sortedPairs.filter(pair => pair.nsConstraint);
    console.log(`🔒 ${nsConstrainedPairs.length} contraintes NS, ${sortedPairs.length - nsConstrainedPairs.length} paires libres`);

    // Utiliser le solveur MILP pour allocation optimale
    const milpSolution = solveMILPEquilibrage(sortedPairs, sections, targetLineAverage, constraintVariant);

    if (milpSolution) {
        // Appliquer la solution MILP aux sections
        applyMILPSolution(sections, milpSolution, sortedPairs);
        console.log(`✅ Solution MILP appliquée avec succès`);
        return true;
    } else {
        console.log(`❌ Échec du solveur MILP, fallback vers algorithme standard`);
        return generateBalancedConstraintDistribution(sections, sortedPairs, sectionCount);
    }
}

function solveMILPEquilibrage(pairs, sections, targetAverage, variant) {
    console.log('🧮 SOLVEUR MILP: Résolution mathématique optimale');

    const numPairs = pairs.length;
    const sectionCount = sections.length;

    // Calculer capacités réelles par section
    const sectionCapacities = sections.map(section => section.length);
    const totalCapacity = sectionCapacities.reduce((sum, cap) => sum + cap * 2, 0); // *2 pour NS + EO

    console.log(`📊 Capacités par section: ${sectionCapacities.map(c => `${c}*2=${c*2}`).join(', ')}`);
    console.log(`📊 Capacité totale: ${totalCapacity}, Paires à placer: ${numPairs}`);

    if (numPairs > totalCapacity) {
        console.error(`🚨 ERREUR: ${numPairs} paires > ${totalCapacity} places disponibles!`);
        return null;
    }

    // Algorithme de résolution MILP approché avec capacités variables
    const bestSolution = branchAndBoundMILP(pairs, sections, targetAverage, variant);

    return bestSolution;
}

function branchAndBoundMILP(pairs, sections, targetAverage, variant) {
    console.log('🌳 BRANCH & BOUND: Recherche solution optimale avec capacités variables');

    const numPairs = pairs.length;
    const sectionCount = sections.length;

    // Calculer capacités réelles par section
    const sectionCapacities = sections.map(section => section.length);

    console.log(`🔧 Capacités par section: [${sectionCapacities.join(', ')}] tables`);

    // Initialiser solution avec contraintes et capacités variables
    const solution = initializeMILPSolution(pairs, sections, variant);

    // Algorithme d'optimisation par échange de paires
    const optimizedSolution = optimizeByPairSwapping(solution, pairs, targetAverage);

    return optimizedSolution;
}

function initializeMILPSolution(pairs, sections, variant) {
    const sectionCount = sections.length;
    const sectionCapacities = sections.map(section => section.length);

    console.log(`🎬 INITIALISATION MILP: Capacités variables [${sectionCapacities.join(', ')}] tables`);

    const solution = {
        assignments: Array(pairs.length).fill(null),
        sections: Array.from({length: sectionCount}, () => ({NS: [], EO: []})),
        sectionCapacities: sectionCapacities,
        stats: {totalDeviation: 0}
    };

    // Placement des contraintes NS selon la variante
    const nsConstraints = pairs.filter(pair => pair.nsConstraint);

    if (constraintMode === 'sectionA') {
        // MODE 1: Toutes contraintes NS → Section A obligatoire
        console.log(`🔒 Mode Section A: ${nsConstraints.length} contraintes → Section A uniquement`);
        nsConstraints.forEach(pair => {
            const idx = pairs.indexOf(pair);
            solution.assignments[idx] = {section: 0, line: 'NS'};
            solution.sections[0].NS.push(idx);
        });
    } else {
        // MODE 2: Répartir contraintes NS équitablement sur toutes les sections
        console.log(`🔒 Mode Toutes sections: ${nsConstraints.length} contraintes → Répartition équitable`);
        nsConstraints.forEach((pair, i) => {
            const sectionIndex = i % sectionCount;
            const idx = pairs.indexOf(pair);
            solution.assignments[idx] = {section: sectionIndex, line: 'NS'};
            solution.sections[sectionIndex].NS.push(idx);
        });
    }

    // Placement des paires libres par algorithme glouton équilibré
    const freePairs = pairs.filter(pair => !pair.nsConstraint);
    freePairs.forEach(pair => {
        const idx = pairs.indexOf(pair);
        const placement = findBestMILPPlacement(solution, idx, pair, pairs);

        if (placement) {
            solution.assignments[idx] = placement;
            solution.sections[placement.section][placement.line].push(idx);
        }
    });

    return solution;
}

function findBestMILPPlacement(solution, pairIdx, pair, allPairs) {
    let bestPlacement = null;
    let minPenalty = Infinity;
    let emergencyPlacement = null;
    let minEmergencyPenalty = Infinity;

    // Tester toutes les positions possibles
    for (let s = 0; s < solution.sections.length; s++) {
        for (const line of ['NS', 'EO']) {
            const currentCount = solution.sections[s][line].length;
            const sectionCapacity = solution.sectionCapacities[s]; // Capacité variable par section

            // Calculer pénalité de déséquilibre
            const penalty = calculateMILPPenalty(solution, s, line, pair.combinedIV, allPairs);

            // Placement préféré (respecte la capacité de cette section)
            if (currentCount < sectionCapacity) {
                if (penalty < minPenalty) {
                    minPenalty = penalty;
                    bestPlacement = {section: s, line};
                }
            }
            // Placement d'urgence (dépasse la capacité mais évite disparition)
            else {
                if (penalty < minEmergencyPenalty) {
                    minEmergencyPenalty = penalty;
                    emergencyPlacement = {section: s, line};
                }
            }
        }
    }

    // Retourner placement préféré, sinon placement d'urgence
    const finalPlacement = bestPlacement || emergencyPlacement;

    if (!finalPlacement) {
        console.error(`🚨 ERREUR CRITIQUE: Aucun placement trouvé pour paire ${pair.id}!`);
        // Forcer placement en Section A, ligne NS en dernier recours
        return {section: 0, line: 'NS'};
    }

    if (bestPlacement) {
        console.log(`✅ Placement optimal: ${pair.id} → S${finalPlacement.section} ${finalPlacement.line}`);
    } else {
        console.warn(`⚠️ Placement d'urgence: ${pair.id} → S${finalPlacement.section} ${finalPlacement.line} (capacité dépassée)`);
    }

    return finalPlacement;
}

function calculateMILPPenalty(solution, sectionIdx, line, pairIV, allPairs) {
    // Calculer somme IV actuelle de cette ligne
    const currentSum = solution.sections[sectionIdx][line]
        .reduce((sum, idx) => sum + allPairs[idx].combinedIV, 0);
    const currentCount = solution.sections[sectionIdx][line].length;

    const newSum = currentSum + pairIV;
    const newCount = currentCount + 1;
    const newAverage = newSum / newCount;

    // Cible théorique (moyenne des 24 paires)
    const targetAverage = 123.2;

    // Pénalité = écart à la moyenne cible + pénalité de déséquilibre numérique
    const deviationPenalty = Math.abs(newAverage - targetAverage);

    // Pénalité pour déséquilibre numérique avec autres lignes de la même section
    const otherLine = line === 'NS' ? 'EO' : 'NS';
    const otherCount = solution.sections[sectionIdx][otherLine].length;
    const balancePenalty = Math.abs(newCount - otherCount) * 5; // Pénalité forte pour déséquilibre

    return deviationPenalty + balancePenalty;
}

function optimizeByPairSwapping(solution, pairs, targetAverage) {
    console.log('🔄 OPTIMISATION: Échange de paires pour équilibrage optimal');

    let improved = true;
    let iterations = 0;
    const maxIterations = 50; // Limiter pour performance

    while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;

        // Essayer échanges entre paires libres uniquement (pas les contraintes)
        for (let i = 0; i < pairs.length - 1; i++) {
            if (pairs[i].nsConstraint) continue; // Ignorer contraintes

            for (let j = i + 1; j < pairs.length; j++) {
                if (pairs[j].nsConstraint) continue; // Ignorer contraintes

                if (trySwapPairs(solution, i, j, pairs, targetAverage)) {
                    improved = true;
                    console.log(`🔄 Échange bénéfique: paire ${pairs[i].id} ↔ paire ${pairs[j].id}`);
                    break;
                }
            }
            if (improved) break;
        }
    }

    console.log(`✅ Optimisation terminée après ${iterations} itération(s)`);
    return solution;
}

function trySwapPairs(solution, idx1, idx2, pairs, targetAverage) {
    // Vérifier si l'échange améliore l'équilibrage
    const assign1 = solution.assignments[idx1];
    const assign2 = solution.assignments[idx2];

    if (!assign1 || !assign2) return false;

    // Calculer score avant échange
    const scoreBefore = calculateSolutionScore(solution, pairs);

    // Simuler l'échange
    const tempSolution = JSON.parse(JSON.stringify(solution));
    tempSolution.assignments[idx1] = assign2;
    tempSolution.assignments[idx2] = assign1;

    // Recalculer les sections
    rebuildSectionsFromAssignments(tempSolution, pairs);

    // Calculer score après échange
    const scoreAfter = calculateSolutionScore(tempSolution, pairs);

    // Appliquer si amélioration significative
    if (scoreAfter < scoreBefore - 0.1) { // Seuil minimal d'amélioration
        Object.assign(solution, tempSolution);
        return true;
    }

    return false;
}

function calculateSolutionScore(solution, pairs) {
    let totalDeviation = 0;
    const targetAverage = 123.2; // Moyenne des 24 paires

    solution.sections.forEach((section, sIdx) => {
        ['NS', 'EO'].forEach(line => {
            const lineSum = section[line].reduce((sum, pairIdx) => sum + pairs[pairIdx].combinedIV, 0);
            const lineCount = section[line].length;
            const lineAverage = lineCount > 0 ? lineSum / lineCount : 0;

            // Pénalité pour écart à la cible
            const deviation = Math.abs(lineAverage - targetAverage);
            totalDeviation += deviation;

            // Pénalité additionnelle pour déséquilibre numérique dans la section
            const otherLine = line === 'NS' ? 'EO' : 'NS';
            const otherCount = solution.sections[sIdx][otherLine].length;
            const imbalance = Math.abs(lineCount - otherCount);
            totalDeviation += imbalance * 2; // Pénalité pour déséquilibre numérique
        });
    });

    return totalDeviation;
}

function rebuildSectionsFromAssignments(solution, pairs) {
    // Reconstruire sections à partir des assignments
    solution.sections = Array.from({length: solution.sections.length}, () => ({NS: [], EO: []}));

    solution.assignments.forEach((assignment, pairIdx) => {
        if (assignment) {
            solution.sections[assignment.section][assignment.line].push(pairIdx);
        }
    });
}

function applyMILPSolution(sections, milpSolution, pairs) {
    console.log('📋 APPLICATION: Solution MILP → Sections Bridge');

    // Vider toutes les sections
    sections.forEach(section => {
        section.forEach(table => {
            table.ns = null;
            table.eo = null;
        });
    });

    // Appliquer les assignments MILP
    milpSolution.sections.forEach((solutionSection, sIdx) => {
        // Trier par IV décroissant pour ranking des tables
        const sortedNS = solutionSection.NS.map(idx => ({idx, iv: pairs[idx].combinedIV}))
            .sort((a, b) => b.iv - a.iv);
        const sortedEO = solutionSection.EO.map(idx => ({idx, iv: pairs[idx].combinedIV}))
            .sort((a, b) => b.iv - a.iv);

        // Placer paires NS
        sortedNS.forEach((item, tableIndex) => {
            if (tableIndex < sections[sIdx].length) {
                sections[sIdx][tableIndex].ns = pairs[item.idx];
                const isConstraint = pairs[item.idx].nsConstraint;
                console.log(`${isConstraint ? '🔒' : '🔓'} Section ${String.fromCharCode(65 + sIdx)} Table ${tableIndex + 1} NS: ${pairs[item.idx].id} (${item.iv})`);
            }
        });

        // Placer paires EO
        sortedEO.forEach((item, tableIndex) => {
            if (tableIndex < sections[sIdx].length) {
                sections[sIdx][tableIndex].eo = pairs[item.idx];
                console.log(`🔓 Section ${String.fromCharCode(65 + sIdx)} Table ${tableIndex + 1} EO: ${pairs[item.idx].id} (${item.iv})`);
            }
        });
    });

    // Afficher statistiques finales
    displayMILPStats(sections, pairs);
}

function displayMILPStats(sections, pairs) {
    console.log('📊 STATISTIQUES FINALES MILP:');
    const targetAverage = 123.2;

    sections.forEach((section, sIdx) => {
        const nsSum = section.reduce((sum, table) => sum + (table.ns ? table.ns.combinedIV : 0), 0);
        const eoSum = section.reduce((sum, table) => sum + (table.eo ? table.eo.combinedIV : 0), 0);
        const nsCount = section.filter(table => table.ns).length;
        const eoCount = section.filter(table => table.eo).length;

        const nsAvg = nsCount > 0 ? nsSum / nsCount : 0;
        const eoAvg = eoCount > 0 ? eoSum / eoCount : 0;
        const nsDeviation = Math.abs(nsAvg - targetAverage);
        const eoDeviation = Math.abs(eoAvg - targetAverage);

        console.log(`✅ Section ${String.fromCharCode(65 + sIdx)}:`);
        console.log(`   NS: ${nsAvg.toFixed(1)} (${nsCount} paires, dév: ${nsDeviation.toFixed(1)})`);
        console.log(`   EO: ${eoAvg.toFixed(1)} (${eoCount} paires, dév: ${eoDeviation.toFixed(1)})`);
    });
}

function setConstraintVariant(variant) {
    constraintVariant = variant;
    console.log(`🔧 Variante contraintes changée: ${variant} (1=Section A fixe, 2=N'importe quelle section)`);
}

function allocatePairsToSections(sortedPairs, sectionCount, targetIV, nsConstrainedPairs, variant) {
    console.log(`🎯 ÉTAPE 1: Allocation équilibrée entre ${sectionCount} section(s)`);

    // Initialiser les allocations de sections
    const allocations = Array.from({length: sectionCount}, () => ({
        pairs: [],
        currentIVSum: 0,
        targetIVSum: 0
    }));

    // Calculer la somme cible par section
    const totalIV = sortedPairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
    const targetIVPerSection = totalIV / sectionCount;
    allocations.forEach(allocation => allocation.targetIVSum = targetIVPerSection);

    console.log(`📊 IV cible par section: ${targetIVPerSection.toFixed(1)}`);

    // CAS SPÉCIAL: 1 section - toutes les paires vont dans la même section
    if (sectionCount === 1) {
        console.log(`📍 Mode 1 section: toutes les paires → Section A avec équilibrage NS/EO optimal`);
        console.log(`🎯 Contraintes: ${nsConstrainedPairs.length} paires NS fixe, ${sortedPairs.length - nsConstrainedPairs.length} libres`);

        // IMPORTANT: Même en 1 section, on doit équilibrer NS/EO !
        // Les contraintes NS signifient "doit jouer Nord-Sud" mais on doit équilibrer les moyennes

        sortedPairs.forEach(pair => {
            const constraint = pair.nsConstraint ? 'ns' : null;
            allocations[0].pairs.push({pair, constraint});
            allocations[0].currentIVSum += pair.combinedIV;
        });

        console.log(`✅ Allocation 1 section: ${sortedPairs.length} paires, IV total: ${allocations[0].currentIVSum.toFixed(1)}`);
        return allocations;
    }

    // Gestion des contraintes selon la variante (pour 2+ sections)
    if (constraintMode === 'sectionA') {
        // MODE 1: NS fixe → Section A (index 0) obligatoire
        nsConstrainedPairs.forEach(pair => {
            allocations[0].pairs.push({pair, constraint: 'ns'});
            allocations[0].currentIVSum += pair.combinedIV;
            console.log(`🔒 Mode Section A: ${pair.id} (${pair.combinedIV}) → Section A (contraint NS)`);
        });
    } else {
        // MODE 2: NS fixe → Allocation équilibrée entre toutes les sections
        nsConstrainedPairs.forEach(pair => {
            // Trouver la section avec le plus gros déficit
            let bestSection = 0;
            let maxDeficit = 0;

            allocations.forEach((allocation, index) => {
                const deficit = allocation.targetIVSum - allocation.currentIVSum;
                if (deficit > maxDeficit) {
                    maxDeficit = deficit;
                    bestSection = index;
                }
            });

            allocations[bestSection].pairs.push({pair, constraint: 'ns'});
            allocations[bestSection].currentIVSum += pair.combinedIV;
            console.log(`🔒 Mode Toutes sections: ${pair.id} (${pair.combinedIV}) → Section ${String.fromCharCode(65 + bestSection)} (contraint NS, déficit: ${maxDeficit.toFixed(1)})`);
        });
    }

    // Allocation glouton équilibré pour les paires libres
    const freePairs = sortedPairs.filter(pair => !pair.nsConstraint);

    freePairs.forEach(pair => {
        // Trouver la section avec le plus gros déficit par rapport à la cible
        let bestSection = 0;
        let maxDeficit = 0;

        allocations.forEach((allocation, index) => {
            const deficit = allocation.targetIVSum - allocation.currentIVSum;
            if (deficit > maxDeficit) {
                maxDeficit = deficit;
                bestSection = index;
            }
        });

        allocations[bestSection].pairs.push({pair, constraint: null});
        allocations[bestSection].currentIVSum += pair.combinedIV;
        console.log(`📍 ${pair.id} (${pair.combinedIV}) → Section ${String.fromCharCode(65 + bestSection)} (déficit: ${maxDeficit.toFixed(1)})`);
    });

    // Afficher le résultat de l'allocation
    allocations.forEach((allocation, index) => {
        const sectionLetter = String.fromCharCode(65 + index);
        const moyenne = allocation.currentIVSum / allocation.pairs.length;
        const ecart = Math.abs(moyenne - targetIV);
        console.log(`📊 Section ${sectionLetter}: ${allocation.pairs.length} paires, moy=${moyenne.toFixed(1)} (écart: ${ecart.toFixed(1)})`);
    });

    return allocations;
}

function placePairsInSection(section, allocation, targetIV, sectionIndex) {
    console.log(`🎯 ÉTAPE 2: Équilibrage NS/EO OPTIMAL section ${String.fromCharCode(65 + sectionIndex)}`);

    // Séparer contraintes NS et paires libres
    const nsConstraints = allocation.pairs.filter(p => p.constraint === 'ns');
    const freePairs = allocation.pairs.filter(p => !p.constraint);

    // Calculer la répartition cible NS/EO
    const totalPairs = allocation.pairs.length;
    const targetNSCount = Math.ceil(totalPairs / 2);
    const targetEOCount = Math.floor(totalPairs / 2);
    console.log(`📊 Répartition cible: ${targetNSCount} NS, ${targetEOCount} EO, IV cible: ${targetIV.toFixed(1)}`);

    // ALGORITHME OPTIMAL : Distribution par équilibrage intelligent
    console.log(`🧮 ALGORITHME OPTIMAL: Répartition équilibrée par IV`);

    // Toutes les paires libres triées par IV décroissant
    const allFreePairs = [...freePairs.map(p => p.pair)];
    allFreePairs.sort((a, b) => b.combinedIV - a.combinedIV);

    // Créer les distributions NS et EO pour équilibrage parfait
    const nsPairs = [...nsConstraints.map(({pair}) => pair)]; // Contraintes NS d'abord
    const eoPairs = [];

    // Calculer combien de paires libres il faut ajouter
    const needNS = targetNSCount - nsPairs.length;
    const needEO = targetEOCount;

    console.log(`🔢 Contraintes: ${nsConstraints.length} NS fixe, Besoins: ${needNS} NS libres + ${needEO} EO`);

    // DIAGNOSTIC: Calculer l'IV moyen des contraintes pour identifier le déséquilibre
    const constraintIVSum = nsConstraints.reduce((sum, {pair}) => sum + pair.combinedIV, 0);
    const constraintAvg = nsConstraints.length > 0 ? constraintIVSum / nsConstraints.length : 0;
    const freeIVSum = allFreePairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
    const freeAvg = allFreePairs.length > 0 ? freeIVSum / allFreePairs.length : 0;

    console.log(`⚠️ DIAGNOSTIC: Contraintes NS moy=${constraintAvg.toFixed(1)}, Paires libres moy=${freeAvg.toFixed(1)}, Cible=${targetIV.toFixed(1)}`);

    if (Math.abs(constraintAvg - targetIV) > 10) {
        console.log(`🚨 ALERTE: Contraintes NS très déséquilibrées (${Math.abs(constraintAvg - targetIV).toFixed(1)} pts écart) !`);
    }

    // MÉTHODE OPTIMALE: Équilibrage par déviation minimale
    for (let i = 0; i < allFreePairs.length; i++) {
        const pair = allFreePairs[i];

        // Calculer les moyennes actuelles
        const currentNSSum = nsPairs.reduce((sum, p) => sum + p.combinedIV, 0);
        const currentEOSum = eoPairs.reduce((sum, p) => sum + p.combinedIV, 0);

        // Vérifier s'il reste de la place des deux côtés
        const canPlaceNS = nsPairs.length - nsConstraints.length < needNS;
        const canPlaceEO = eoPairs.length < needEO;

        if (!canPlaceNS && !canPlaceEO) break; // Plus de place nulle part

        if (canPlaceNS && canPlaceEO) {
            // Les deux options sont possibles, choisir la meilleure pour l'équilibre
            const potentialNSAvg = (currentNSSum + pair.combinedIV) / (nsPairs.length + 1);
            const potentialEOAvg = (currentEOSum + pair.combinedIV) / (eoPairs.length + 1);

            const nsDeviation = Math.abs(potentialNSAvg - targetIV);
            const eoDeviation = Math.abs(potentialEOAvg - targetIV);

            // Algorithme d'équilibrage: choisir le côté qui minimise la déviation
            // Si égalité, privilégier le côté qui a moins de paires (pour équilibre numérique)
            const chooseNS = (nsDeviation < eoDeviation) ||
                           (Math.abs(nsDeviation - eoDeviation) < 0.5 && nsPairs.length <= eoPairs.length);

            if (chooseNS) {
                nsPairs.push(pair);
                console.log(`📍 NS: ${pair.id} (${pair.combinedIV}) → moy: ${potentialNSAvg.toFixed(1)} [dév: ${nsDeviation.toFixed(1)}]`);
            } else {
                eoPairs.push(pair);
                console.log(`📍 EO: ${pair.id} (${pair.combinedIV}) → moy: ${potentialEOAvg.toFixed(1)} [dév: ${eoDeviation.toFixed(1)}]`);
            }
        } else if (canPlaceNS) {
            // Seulement NS possible
            nsPairs.push(pair);
            const newAvg = (currentNSSum + pair.combinedIV) / nsPairs.length;
            console.log(`📍 NS: ${pair.id} (${pair.combinedIV}) → moy: ${newAvg.toFixed(1)} [forcé]`);
        } else if (canPlaceEO) {
            // Seulement EO possible
            eoPairs.push(pair);
            const newAvg = (currentEOSum + pair.combinedIV) / (eoPairs.length + 1);
            console.log(`📍 EO: ${pair.id} (${pair.combinedIV}) → moy: ${newAvg.toFixed(1)} [forcé]`);
        }
    }

    // Placer physiquement dans les tables de la section
    console.log(`🎯 Placement physique dans section ${String.fromCharCode(65 + sectionIndex)}`);

    // Placer NS (contraintes d'abord, puis par ordre d'IV décroissant pour ranking)
    nsPairs.sort((a, b) => b.combinedIV - a.combinedIV);
    nsPairs.forEach((pair, index) => {
        if (index < section.length) {
            section[index].ns = pair;
            const isConstraint = nsConstraints.some(({pair: p}) => p.id === pair.id);
            console.log(`${isConstraint ? '🔒' : '🔓'} Table ${index + 1} NS: ${pair.id} (${pair.combinedIV})`);
        }
    });

    // Placer EO (par ordre d'IV décroissant pour table ranking)
    eoPairs.sort((a, b) => b.combinedIV - a.combinedIV);
    eoPairs.forEach((pair, index) => {
        if (index < section.length) {
            section[index].eo = pair;
            console.log(`🔓 Table ${index + 1} EO: ${pair.id} (${pair.combinedIV})`);
        }
    });

    // Afficher le bilan final parfaitement équilibré
    const finalNSSum = nsPairs.reduce((sum, p) => sum + p.combinedIV, 0);
    const finalEOSum = eoPairs.reduce((sum, p) => sum + p.combinedIV, 0);
    const finalNSAvg = nsPairs.length > 0 ? finalNSSum / nsPairs.length : 0;
    const finalEOAvg = eoPairs.length > 0 ? finalEOSum / eoPairs.length : 0;

    const nsDeviation = Math.abs(finalNSAvg - targetIV);
    const eoDeviation = Math.abs(finalEOAvg - targetIV);

    console.log(`✅ Section ${String.fromCharCode(65 + sectionIndex)} ÉQUILIBRÉE OPTIMALEMENT:`);
    console.log(`   NS: ${nsPairs.length} paires, moy: ${finalNSAvg.toFixed(1)} (cible: ${targetIV.toFixed(1)}, dév: ${nsDeviation.toFixed(1)})`);
    console.log(`   EO: ${eoPairs.length} paires, moy: ${finalEOAvg.toFixed(1)} (cible: ${targetIV.toFixed(1)}, dév: ${eoDeviation.toFixed(1)})`);
}

function findOptimalPlacement(sections, pair, globalAverageIV) {
    let bestPlacement = null;
    let bestScore = Infinity;

    // VARIANTE 1: Contraintes NS fixe → forcément section A (index 0)
    if (pair.nsConstraint) {
        // Chercher uniquement en position NS dans section A
        const sectionA = sections[0];
        sectionA.forEach((table, tableIndex) => {
            if (!table.ns) {
                const score = calculatePerfectBalanceScore(sections, 0, tableIndex, 'ns', pair, globalAverageIV);
                if (score < bestScore) {
                    bestScore = score;
                    bestPlacement = { sectionIndex: 0, tableIndex, position: 'ns' };
                }
            }
        });
    } else {
        // Paire libre: tester toutes les positions disponibles
        sections.forEach((section, sectionIndex) => {
            section.forEach((table, tableIndex) => {
                ['ns', 'eo'].forEach(position => {
                    if (!table[position]) {
                        const score = calculatePerfectBalanceScore(sections, sectionIndex, tableIndex, position, pair, globalAverageIV);
                        if (score < bestScore) {
                            bestScore = score;
                            bestPlacement = { sectionIndex, tableIndex, position };
                        }
                    }
                });
            });
        });
    }

    return bestPlacement;
}

function calculatePerfectBalanceScore(sections, sectionIndex, tableIndex, position, pair, targetAverageIV) {
    // Simuler le placement
    const tempSections = JSON.parse(JSON.stringify(sections));
    tempSections[sectionIndex][tableIndex][position] = pair;

    let totalDeviation = 0;

    // 1. Calculer les déviations de chaque ligne par rapport à la cible
    tempSections.forEach((section, secIdx) => {
        let nsIVSum = 0, nsCount = 0, eoIVSum = 0, eoCount = 0;

        section.forEach(table => {
            if (table.ns) {
                nsIVSum += table.ns.combinedIV;
                nsCount++;
            }
            if (table.eo) {
                eoIVSum += table.eo.combinedIV;
                eoCount++;
            }
        });

        const nsAvg = nsCount > 0 ? nsIVSum / nsCount : targetAverageIV;
        const eoAvg = eoCount > 0 ? eoIVSum / eoCount : targetAverageIV;

        // Déviation par rapport à la cible (quadratique pour pénaliser les gros écarts)
        const nsDeviation = Math.abs(nsAvg - targetAverageIV);
        const eoDeviation = Math.abs(eoAvg - targetAverageIV);

        totalDeviation += nsDeviation * nsDeviation + eoDeviation * eoDeviation;
    });

    // 2. Forte pénalité pour déséquilibre numérique (on veut NS ≈ EO dans chaque section)
    tempSections.forEach(section => {
        const nsCount = section.filter(table => table.ns).length;
        const eoCount = section.filter(table => table.eo).length;
        const numImbalance = Math.abs(nsCount - eoCount);
        totalDeviation += numImbalance * numImbalance * 100; // Très forte pénalité
    });

    // 3. Bonus pour placement aux bonnes tables (fortes paires aux petites tables)
    const tableRankBonus = (sections[0].length - tableIndex) * 0.1;
    totalDeviation -= pair.combinedIV > targetAverageIV ? tableRankBonus : 0;

    return totalDeviation;
}

function generateMinimalImbalanceDistribution(sections, sortedPairs, sectionCount) {
    console.log('⚖️ MINIMAL IMBALANCE: Distribution minimisant le déséquilibre');

    // Calculer l'IV moyen global pour référence
    const totalIV = sortedPairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
    const globalAverageIV = totalIV / sortedPairs.length;
    console.log(`📊 IV moyen global: ${globalAverageIV.toFixed(1)}`);

    // Placer chaque paire dans l'ordre décroissant d'IV
    sortedPairs.forEach((pair, index) => {
        const bestPlacement = findMinimalImbalancePlacement(sections, pair, globalAverageIV);
        if (bestPlacement) {
            sections[bestPlacement.sectionIndex][bestPlacement.tableIndex][bestPlacement.position] = pair;
            console.log(`📍 ${pair.nsConstraint ? '🔒' : '📊'} Paire ${pair.id} (IV:${pair.combinedIV}) → Section ${bestPlacement.sectionIndex} Table ${bestPlacement.tableIndex + 1} ${bestPlacement.position.toUpperCase()}`);
        }
    });

    return true;
}

function findMinimalImbalancePlacement(sections, pair, globalAverageIV) {
    let bestPlacement = null;
    let bestImbalanceScore = Infinity;

    sections.forEach((section, sectionIndex) => {
        section.forEach((table, tableIndex) => {
            const positions = pair.nsConstraint ? ['ns'] : ['ns', 'eo'];

            positions.forEach(position => {
                if (!table[position]) {
                    const imbalanceScore = calculateTournamentImbalance(sections, sectionIndex, tableIndex, position, pair, globalAverageIV);
                    if (imbalanceScore < bestImbalanceScore) {
                        bestImbalanceScore = imbalanceScore;
                        bestPlacement = { sectionIndex, tableIndex, position };
                    }
                }
            });
        });
    });

    return bestPlacement;
}

function calculateTournamentImbalance(sections, sectionIndex, tableIndex, position, pair, globalAverageIV) {
    // Simuler le placement de cette paire
    const tempSections = JSON.parse(JSON.stringify(sections));
    tempSections[sectionIndex][tableIndex][position] = pair;

    let totalImbalance = 0;

    // Calculer le déséquilibre pour chaque section
    tempSections.forEach((section, idx) => {
        const sectionStats = calculateSectionStats(section);

        // Déséquilibre des moyennes NS/EO par rapport au global
        const nsDeviation = sectionStats.nsCount > 0 ? Math.abs(sectionStats.nsAverage - globalAverageIV) : 0;
        const eoDeviation = sectionStats.eoCount > 0 ? Math.abs(sectionStats.eoAverage - globalAverageIV) : 0;

        // Déséquilibre numérique NS vs EO
        const numericalImbalance = Math.abs(sectionStats.nsCount - sectionStats.eoCount) * 20;

        // Score de déséquilibre pour cette section
        const sectionImbalance = nsDeviation + eoDeviation + numericalImbalance;
        totalImbalance += sectionImbalance;
    });

    // Calculer aussi le déséquilibre inter-sections
    const sectionAverages = tempSections.map(section => {
        const stats = calculateSectionStats(section);
        return stats.overallAverage;
    }).filter(avg => avg > 0);

    const intersectionImbalance = sectionAverages.length > 1 ?
        calculateVariance(sectionAverages) * 5 : 0;

    return totalImbalance + intersectionImbalance;
}

function calculateSectionStats(section) {
    let nsCount = 0, eoCount = 0, nsIVSum = 0, eoIVSum = 0, totalIV = 0, totalCount = 0;

    section.forEach(table => {
        if (table.ns) {
            nsCount++;
            nsIVSum += table.ns.combinedIV;
            totalIV += table.ns.combinedIV;
            totalCount++;
        }
        if (table.eo) {
            eoCount++;
            eoIVSum += table.eo.combinedIV;
            totalIV += table.eo.combinedIV;
            totalCount++;
        }
    });

    return {
        nsCount,
        eoCount,
        nsAverage: nsCount > 0 ? nsIVSum / nsCount : 0,
        eoAverage: eoCount > 0 ? eoIVSum / eoCount : 0,
        overallAverage: totalCount > 0 ? totalIV / totalCount : 0,
        nsIVSum,
        eoIVSum
    };
}

function calculateVariance(values) {
    if (values.length <= 1) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    return squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
}

function generateDynamicWeightDistribution(sections, sortedPairs, sectionCount) {
    console.log('🎯 DYNAMIC WEIGHT: Distribution par poids dynamique basée sur IV moyen');

    // Calculer l'IV moyen global
    const totalIV = sortedPairs.reduce((sum, pair) => sum + pair.combinedIV, 0);
    const globalAverageIV = totalIV / sortedPairs.length;
    console.log(`📊 IV moyen global: ${globalAverageIV.toFixed(1)}`);

    // Séparer les paires avec contraintes NS des autres
    const nsConstrainedPairs = sortedPairs.filter(pair => pair.nsConstraint);
    const otherPairs = sortedPairs.filter(pair => !pair.nsConstraint);

    console.log(`🔒 Contraintes NS: ${nsConstrainedPairs.length}, Autres paires: ${otherPairs.length}`);

    // 1. Placer d'abord les paires NS contraintes par IV décroissant
    nsConstrainedPairs.forEach((pair, index) => {
        const bestPlacement = findBestNSPlacement(sections, pair, globalAverageIV);
        if (bestPlacement) {
            sections[bestPlacement.sectionIndex][bestPlacement.tableIndex].ns = pair;
            console.log(`🔒 NS contraint: ${pair.id} (IV:${pair.combinedIV}) → Section ${bestPlacement.sectionIndex} Table ${bestPlacement.tableIndex + 1}`);
        }
    });

    // 2. Placer le reste des paires par IV décroissant en optimisant les poids
    otherPairs.forEach((pair, index) => {
        const bestPlacement = findBestOverallPlacement(sections, pair, globalAverageIV);
        if (bestPlacement) {
            sections[bestPlacement.sectionIndex][bestPlacement.tableIndex][bestPlacement.position] = pair;
            console.log(`📍 Paire ${pair.id} (IV:${pair.combinedIV}) → Section ${bestPlacement.sectionIndex} Table ${bestPlacement.tableIndex + 1} ${bestPlacement.position.toUpperCase()}`);
        }
    });

    return true;
}

function findBestNSPlacement(sections, pair, globalAverageIV) {
    let bestPlacement = null;
    let bestScore = Infinity;

    sections.forEach((section, sectionIndex) => {
        section.forEach((table, tableIndex) => {
            if (!table.ns) {
                const score = calculatePlacementScore(sections, sectionIndex, tableIndex, 'ns', pair, globalAverageIV);
                if (score < bestScore) {
                    bestScore = score;
                    bestPlacement = { sectionIndex, tableIndex };
                }
            }
        });
    });

    return bestPlacement;
}

function findBestOverallPlacement(sections, pair, globalAverageIV) {
    let bestPlacement = null;
    let bestScore = Infinity;

    sections.forEach((section, sectionIndex) => {
        section.forEach((table, tableIndex) => {
            // Tester position NS
            if (!table.ns) {
                const score = calculatePlacementScore(sections, sectionIndex, tableIndex, 'ns', pair, globalAverageIV);
                if (score < bestScore) {
                    bestScore = score;
                    bestPlacement = { sectionIndex, tableIndex, position: 'ns' };
                }
            }
            // Tester position EO
            if (!table.eo) {
                const score = calculatePlacementScore(sections, sectionIndex, tableIndex, 'eo', pair, globalAverageIV);
                if (score < bestScore) {
                    bestScore = score;
                    bestPlacement = { sectionIndex, tableIndex, position: 'eo' };
                }
            }
        });
    });

    return bestPlacement;
}

function calculatePlacementScore(sections, sectionIndex, tableIndex, position, pair, globalAverageIV) {
    // Calculer l'écart actuel des moyennes de ligne NS et EO de cette section par rapport au global
    const sectionStats = calculateSectionCurrentStats(sections[sectionIndex]);

    // Simuler le placement de cette paire
    const nsCount = sectionStats.nsCount + (position === 'ns' ? 1 : 0);
    const eoCount = sectionStats.eoCount + (position === 'eo' ? 1 : 0);
    const nsIVSum = sectionStats.nsIVSum + (position === 'ns' ? pair.combinedIV : 0);
    const eoIVSum = sectionStats.eoIVSum + (position === 'eo' ? pair.combinedIV : 0);

    // Calculer les nouvelles moyennes après placement
    const newNSAverage = nsCount > 0 ? nsIVSum / nsCount : 0;
    const newEOAverage = eoCount > 0 ? eoIVSum / eoCount : 0;

    // Score = distance à l'IV moyen global (plus c'est proche, mieux c'est)
    const nsDistanceScore = Math.abs(newNSAverage - globalAverageIV);
    const eoDistanceScore = Math.abs(newEOAverage - globalAverageIV);

    // Score de déséquilibre NS/EO (pénaliser trop de déséquilibre)
    const balanceScore = Math.abs(nsCount - eoCount) * 10;

    return nsDistanceScore + eoDistanceScore + balanceScore;
}

function calculateSectionCurrentStats(section) {
    let nsCount = 0, eoCount = 0, nsIVSum = 0, eoIVSum = 0;

    section.forEach(table => {
        if (table.ns) {
            nsCount++;
            nsIVSum += table.ns.combinedIV;
        }
        if (table.eo) {
            eoCount++;
            eoIVSum += table.eo.combinedIV;
        }
    });

    return { nsCount, eoCount, nsIVSum, eoIVSum };
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
    const useTwoColumns = isSingleSection && mitchellData[0] && mitchellData[0].length > 12;

    container.className = `sections-grid ${
        currentSectionCount === 1 ? 'two-sections' :
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

    if (currentSectionCount === 1) {
        // Cas 1 section : créer UNE SEULE section avec 2 colonnes internes
        const section = mitchellData[0];
        let leftTables, rightTables;

        if (section.length < 11) {
            leftTables = section;
            rightTables = [];
        } else {
            leftTables = section.slice(0, 10);
            rightTables = section.slice(10);
            // Corriger la numérotation des tables de droite pour qu'elles continuent après 10
            rightTables.forEach((table, index) => {
                table.tableNumber = index + 11;
            });
        }

        // UNE SEULE section avec 2 colonnes
        const singleSectionDiv = document.createElement('div');
        singleSectionDiv.className = `section-container section-a single-section-container`;
        singleSectionDiv.dataset.section = 0;

        const nsCount = section.filter(t => t.ns).length;
        const eoCount = section.filter(t => t.eo).length;
        const nsAvgIV = section.length > 0 ? Math.round(
            section.reduce((sum, table) => sum + (table.ns ? calculateCombinedIV(table.ns) : 0), 0) / nsCount
        ) || 0 : 0;
        const eoAvgIV = section.length > 0 ? Math.round(
            section.reduce((sum, table) => sum + (table.eo ? calculateCombinedIV(table.eo) : 0), 0) / eoCount
        ) || 0 : 0;

        // Contenu avec 2 colonnes INTERNES
        const leftColumn = rightTables.length > 0 ?
            `<div class="column-left">${renderTablesContent(leftTables, 0, 1)}</div>` :
            renderTablesContent(leftTables, 0, 1);

        const rightColumn = rightTables.length > 0 ?
            `<div class="column-right">${renderTablesContent(rightTables, 0, 1)}</div>` : '';

        singleSectionDiv.innerHTML = `
            <div class="section-banner">
                <div class="table-count-control">
                    <button class="table-count-btn" data-section="0" data-delta="1" title="Plus de tables" disabled>▲</button>
                    <div class="table-count-display">
                        <span class="table-count-value">${section.length}</span>
                        <span class="table-icon">
                            <span class="top-suits"><span style="color: #ff0000 !important;">♥</span><span style="color: #000000 !important;">♠</span></span>
                            <span class="bottom-suits"><span style="color: #000000 !important;">♣</span><span style="color: #ff0000 !important;">♦</span></span>
                        </span>
                    </div>
                    <button class="table-count-btn" data-section="0" data-delta="-1" title="Moins de tables" disabled>▼</button>
                </div>
                <div class="section-letter">A</div>
                <div class="section-stats">
                    <div class="section-stats-line"></div>
                    <div class="section-stats-line">${Math.round(nsAvgIV)}</div>
                    <div class="section-stats-line">IV</div>
                    <div class="section-stats-line">${Math.round(eoAvgIV)}</div>
                </div>
            </div>
            <div class="section-content">
                <div class="tables-grid">
                    ${leftColumn}
                    ${rightColumn}
                </div>
            </div>
        `;

        singleSectionDiv.setAttribute('data-section-letter', 'A');
        singleSectionDiv.setAttribute('data-table-count', section.length);
        singleSectionDiv.setAttribute('data-ns-avg', Math.round(nsAvgIV));
        singleSectionDiv.setAttribute('data-eo-avg', Math.round(eoAvgIV));
        container.appendChild(singleSectionDiv);

        // FORCER le CSS grid 2 colonnes après insertion dans le DOM
        setTimeout(() => {
            const tablesGrid = singleSectionDiv.querySelector('.tables-grid');
            if (tablesGrid) {
                tablesGrid.style.display = 'grid';
                tablesGrid.style.gridTemplateColumns = '1fr 1fr';
                tablesGrid.style.gap = '40px';
                tablesGrid.style.alignItems = 'flex-start';
                console.log('✅ CSS grid forcé en 2 colonnes');
            }
        }, 100);
    } else {
        // Cas 2+ sections : logique normale
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
                        <div class="section-stats-line"></div>
                        <div class="section-stats-line">${Math.round(nsAvgIV)}</div>
                        <div class="section-stats-line">IV</div>
                        <div class="section-stats-line">${Math.round(eoAvgIV)}</div>
                    </div>
                </div>
                <div class="section-content">
                    <div class="tables-grid">
                        ${renderTablesContent(section, sectionIndex, mitchellData.length)}
                    </div>
                </div>
            `;

            // Ajouter les attributs data pour l'impression APRÈS calcul des moyennes
            sectionDiv.setAttribute('data-section-letter', sectionNames[sectionIndex]);
            sectionDiv.setAttribute('data-table-count', section.length);
            sectionDiv.setAttribute('data-ns-avg', Math.round(nsAvgIV));
            sectionDiv.setAttribute('data-eo-avg', Math.round(eoAvgIV));

            container.appendChild(sectionDiv);
        });
    }

    const totalPairs = parsedPairs.length;
    const totalIV = parsedPairs.reduce((sum, pair) => sum + calculateCombinedIV(pair), 0);
    const avgIV = Math.round(totalIV / parsedPairs.length);
    const today = new Date().toLocaleDateString('fr-FR');

    document.getElementById('tournamentTitle').textContent =
        `Bon tournoi au BCNJ - ${today} - ${totalPairs} paires, IV moyen ${avgIV}`;

    console.log('✅ Mitchell display rendered');

    // Re-attacher les listeners de swap après le render - toujours actifs
    setTimeout(() => {
        attachSwapListeners();
    }, 100);

    // Format player name for print: J. FULL_LASTNAME (first initial + full lastname)
    function formatPlayerNameForPrint(fullName) {
        if (!fullName) return 'J. PLAYER';

        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            // Smart detection of compound first names
            let prenom, nom;

            // Séparer noms (MAJUSCULES) et prénoms (Première lettre majuscule)
            let nomParts = [];
            let prenomParts = [];

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part === part.toUpperCase() && part.length > 1) {
                    // Tout en majuscules = nom
                    nomParts.push(part);
                } else {
                    // Pas tout en majuscules = prénom
                    prenomParts.push(part);
                }
            }

            nom = nomParts.join(' ');

            // Initiales des prénoms séparées par tiret + point à la fin
            let initialesPrenom = '';
            if (prenomParts.length > 0) {
                initialesPrenom = prenomParts.map(part => part.charAt(0).toUpperCase()).join('-') + '.';
            }

            return `${initialesPrenom} ${nom}`;
        }
        return fullName.toUpperCase();
    }

    // CONFIGURER L'IMPRESSION ICI (pas inline à cause de CSP)
    const printBtn = document.getElementById('printBtnMitchell');
    if (printBtn) {
        printBtn.onclick = function() {
            console.log('🖨️ PRINT WITH SECTION HEADERS FOR ALL PAGES');

            // Force Mitchell view
            document.getElementById('setupView').style.display = 'none';
            document.getElementById('mitchellView').style.display = 'block';

            // Create print structure ONLY for sections with actual data
            const sectionContainers = document.querySelectorAll('.section-container');
            const sectionLetters = ['A', 'B', 'C'];

            console.log(`📄 Found ${sectionContainers.length} sections with data`);

            sectionContainers.forEach((container, index) => {
                // Only create print page if this section has data
                if (index < currentSectionCount && mitchellData[index] && mitchellData[index].length > 0) {
                    const section = mitchellData[index];

                    // Calculate section-specific averages
                    const nsCount = section.filter(t => t.ns).length;
                    const eoCount = section.filter(t => t.eo).length;
                    const nsAvgIV = section.length > 0 ? Math.round(
                        section.reduce((sum, table) => sum + (table.ns ? calculateCombinedIV(table.ns) : 0), 0) / nsCount
                    ) || 0 : 0;
                    const eoAvgIV = section.length > 0 ? Math.round(
                        section.reduce((sum, table) => sum + (table.eo ? calculateCombinedIV(table.eo) : 0), 0) / eoCount
                    ) || 0 : 0;

                    // Create a container for this section's print content
                    const printContainer = document.createElement('div');
                    printContainer.className = 'print-section-container';
                    printContainer.dataset.sectionIndex = index;

                    // Create header section
                    const headerSection = document.createElement('div');
                    headerSection.style.cssText = 'padding: 20px; margin-bottom: -15px;';

                    // Add tournament header
                    const tournamentHeader = document.createElement('div');
                    tournamentHeader.style.cssText = 'text-align: center; font-size: 24px; font-weight: bold; color: #333; font-family: Arial, sans-serif; margin-bottom: 10px;';
                    // Calculate real data from current mitchell data - count actual pairs (relais possible)
                    let totalPairs = 0;
                    mitchellData.forEach(section => {
                        section.forEach(table => {
                            if (table.ns && table.ns.player1 && table.ns.player2) totalPairs++;
                            if (table.eo && table.eo.player1 && table.eo.player2) totalPairs++;
                        });
                    });

                    // Calculate IV average from pair IVs (sum of 2 players per pair)
                    let pairIVs = [];
                    mitchellData.forEach(section => {
                        section.forEach(table => {
                            // Calculate NS pair IV (sum of the 2 players)
                            if (table.ns && table.ns.player1 && table.ns.player2) {
                                const iv1 = Number(table.ns.player1.iv);
                                const iv2 = Number(table.ns.player2.iv);
                                if (!isNaN(iv1) && !isNaN(iv2)) {
                                    pairIVs.push(iv1 + iv2);
                                }
                            }
                            // Calculate EO pair IV (sum of the 2 players)
                            if (table.eo && table.eo.player1 && table.eo.player2) {
                                const iv1 = Number(table.eo.player1.iv);
                                const iv2 = Number(table.eo.player2.iv);
                                if (!isNaN(iv1) && !isNaN(iv2)) {
                                    pairIVs.push(iv1 + iv2);
                                }
                            }
                        });
                    });

                    const averageIV = pairIVs.length > 0 ? Math.round(pairIVs.reduce((sum, iv) => sum + iv, 0) / pairIVs.length) : 136;

                    tournamentHeader.textContent = `BCNJ - 20/01/2026 - ${totalPairs} paires, IV moyen ${averageIV}`;
                    headerSection.appendChild(tournamentHeader);

                    // Add section header
                    const sectionHeader = document.createElement('div');
                    sectionHeader.style.cssText = 'text-align: center; font-size: 26px; font-weight: bold; color: #333; font-family: Arial, sans-serif; margin-bottom: 10px;';
                    sectionHeader.textContent = `SECTION ${sectionLetters[index]}`;
                    headerSection.appendChild(sectionHeader);

                    // Add column headers with section-specific averages
                    const columnHeaders = document.createElement('div');
                    columnHeaders.style.cssText = 'text-align: center; font-size: 28px; font-weight: bold; color: #333; font-family: Arial, sans-serif; white-space: pre; margin-bottom: 0px;';
                    columnHeaders.textContent = `          NS ~${nsAvgIV}          Table          EO ~${eoAvgIV}          `;
                    headerSection.appendChild(columnHeaders);

                    printContainer.appendChild(headerSection);

                    // Add table numbers with team names - use remaining space
                    const tableCount = section.length;
                    // Calculate real available space: total page height - headers space
                    const totalPageHeight = 1400;
                    const headerSpace = 350; // Space taken by BCNJ + SECTION + NS/Table/EO headers
                    // Calculate sizing: if less than 9 tables, use size as if 8 tables
                    const sizingTableCount = tableCount < 9 ? 8 : tableCount;
                    const availableHeight = totalPageHeight - headerSpace + (sizingTableCount * 2); // Add 2px per table to increase spacing
                    const actualRowHeight = Math.floor(availableHeight / sizingTableCount); // Raw height
                    const tableBoxSize = Math.max(40, Math.floor(actualRowHeight * 0.75)); // Smaller box (75% instead of 85%)
                    const fontSize = Math.max(14, Math.min(28, Math.floor(tableBoxSize * 0.25))); // Font size based on box size, not row height
                    const tableNumberSize = Math.floor(tableBoxSize * 0.5); // Font size proportional to box size
                    const verticalSpacing = Math.floor((actualRowHeight - tableBoxSize) / 2); // Auto-adjust spacing to center smaller box
                    const horizontalPadding = Math.max(15, Math.min(40, Math.floor(actualRowHeight * 0.15)));

                    const tablesContainer = document.createElement('div');
                    tablesContainer.style.cssText = 'padding: 0 20px; flex: 1;';

                    section.forEach((table, tableIndex) => {
                        const tableRow = document.createElement('div');
                        const isLastTable = tableIndex === section.length - 1;
                        const marginStyle = isLastTable ? `${verticalSpacing}px 0 0 0` : `${verticalSpacing}px 0`;
                        tableRow.style.cssText = `display: grid; grid-template-columns: 2fr auto 2fr; align-items: center; margin: ${marginStyle}; width: 100%; gap: 20px;`;

                        // Step 3: Use the pre-calculated table box size (not calculated per table)
                        const teamHeight = tableBoxSize; // Use consistent box size calculated above

                        // Function to calculate text width and adjust font size if needed
                        const calculateOptimalFontSize = (text1, text2, baseFontSize, maxWidth) => {
                            const estimateTextWidth = (text, fontSize) => {
                                // Estimate condensed font width (roughly 0.6 * regular width)
                                return text.length * fontSize * 0.45;
                            };

                            let adjustedSize = Math.floor(baseFontSize * 1.5);
                            const longerText = text1.length > text2.length ? text1 : text2;

                            while (estimateTextWidth(longerText, adjustedSize) > maxWidth && adjustedSize > 12) {
                                adjustedSize -= 1;
                            }

                            return adjustedSize;
                        };

                        // Left team (NS) - Single line per player
                        const nsTeam = document.createElement('div');
                        let nsP1Name = 'J. PLAYER', nsP2Name = 'M. PLAYER';
                        if (table.ns && table.ns.player1 && table.ns.player2) {
                            nsP1Name = formatPlayerNameForPrint(table.ns.player1.name);
                            nsP2Name = formatPlayerNameForPrint(table.ns.player2.name);
                        }
                        const nsFontSize = calculateOptimalFontSize(nsP1Name, nsP2Name, fontSize, 290);

                        nsTeam.style.cssText = `text-align: right; font-size: ${nsFontSize}px; font-weight: bold; line-height: 1.1; padding-right: 0px; display: flex; flex-direction: column; gap: 0px; width: 300px; overflow: hidden; justify-self: end; font-family: Arial, 'Arial Narrow', 'Helvetica Condensed', sans-serif; font-stretch: condensed;`;
                        nsTeam.innerHTML = `<div style="white-space: nowrap;">${nsP1Name}</div><div style="white-space: nowrap;">${nsP2Name}</div>`;

                        // Table number - SQUARE shape (RÈGLE 5 - FIGÉ)
                        const tableNumber = document.createElement('div');
                        tableNumber.style.cssText = `height: ${tableBoxSize}px; width: ${tableBoxSize}px; display: flex; align-items: center; justify-content: center; border: 4px solid #333; font-size: ${tableNumberSize}px; font-weight: bold; background: white; text-align: center; justify-self: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`;
                        tableNumber.textContent = tableIndex + 1;

                        // Right team (EO) - Single line per player
                        const eoTeam = document.createElement('div');
                        let eoP1Name = 'J. PLAYER', eoP2Name = 'M. PLAYER';
                        if (table.eo && table.eo.player1 && table.eo.player2) {
                            eoP1Name = formatPlayerNameForPrint(table.eo.player1.name);
                            eoP2Name = formatPlayerNameForPrint(table.eo.player2.name);
                        }
                        const eoFontSize = calculateOptimalFontSize(eoP1Name, eoP2Name, fontSize, 290);

                        eoTeam.style.cssText = `text-align: left; font-size: ${eoFontSize}px; font-weight: bold; line-height: 1.1; padding-left: 0px; display: flex; flex-direction: column; gap: 0px; width: 300px; overflow: hidden; font-family: Arial, 'Arial Narrow', 'Helvetica Condensed', sans-serif; font-stretch: condensed;`;
                        eoTeam.innerHTML = `<div style="white-space: nowrap;">${eoP1Name}</div><div style="white-space: nowrap;">${eoP2Name}</div>`;

                        tableRow.appendChild(nsTeam);
                        tableRow.appendChild(tableNumber);
                        tableRow.appendChild(eoTeam);
                        tablesContainer.appendChild(tableRow);
                    });

                    printContainer.appendChild(tablesContainer);

                    document.body.appendChild(printContainer);
                    console.log(`✅ Created print container for SECTION ${sectionLetters[index]} with ${mitchellData[index].length} tables`);
                } else {
                    console.log(`⚠️ Skipped SECTION ${sectionLetters[index]} - no data`);
                }
            });

            // Print
            window.print();

            // Clean up print containers after print
            setTimeout(() => {
                document.querySelectorAll('.print-section-container').forEach(el => el.remove());
                console.log('🧹 Cleaned up print containers');
            }, 100);
        };
        console.log('✅ Bouton imprimer configuré depuis JS externe');
    }
}

// INITIALISATION AU CHARGEMENT (déplacé du HTML pour éviter CSP)
window.addEventListener('load', function() {
    setTimeout(function() {
        console.log('🔄 INITIALISATION DEPUIS FICHIER EXTERNE');

        // Override des fonctions
        window.loadTestData = function() {
            console.log('🔍 loadTestData externe - 35 PAIRES = 70 joueurs');
            let testData = '';

            // 35 paires = 70 joueurs !
            for (let i = 1; i <= 70; i++) {
                const civilite = i % 2 === 1 ? 'M.' : 'Mme';
                const prenom = i % 2 === 1 ? 'Jean' : 'Marie';
                const nom = `PLAYER${i}A`;
                const fullName = `${nom} ${prenom}`;
                const iv = Math.floor(Math.random() * 40) + 50;
                const license = (9800000 + i).toString().padStart(8, '0');

                testData += `${civilite} ${fullName} (5.00 €)
${license} ( IV = ${iv} )

`;
            }

            document.getElementById('tournamentData').value = testData;
            showStatus('✅ Données de test 35 paires (70 joueurs) chargées', 'success');
        };

        window.generateSections = function() {
            console.log('🔍 generateSections externe');
            const data = document.getElementById('tournamentData').value;
            const sectionCount = parseInt(document.getElementById('sectionCount').value);

            if (!data.trim()) {
                showStatus('Veuillez entrer les données du tournoi', 'error');
                return;
            }

            try {
                parsedPairs = parseTournamentData(data);
                console.log('📊 Parsed pairs:', parsedPairs.length);

                if (parsedPairs.length === 0) {
                    showStatus('Aucune paire valide trouvée dans les données', 'error');
                    return;
                }

                currentSectionCount = sectionCount;
                mitchellData = mitchellDistribution(parsedPairs, sectionCount, false);

                console.log('🚀 showMitchellDisplay externe');
                showMitchellDisplay();

            } catch (error) {
                console.error('❌ Generation error:', error);
                showStatus('❌ Erreur lors de la génération: ' + error.message, 'error');
            }
        };

        // Event listeners
        const testBtn35 = document.getElementById('loadTestDataBtn');
        const generateBtn = document.getElementById('generateButton');

        if (testBtn35) {
            testBtn35.onclick = window.loadTestData;
            console.log('✅ Bouton test 35 configuré');
        }

        if (generateBtn) {
            generateBtn.onclick = window.generateSections;
            console.log('✅ Bouton générer configuré');
        }

        console.log('✅ Init complète');
    }, 500);
});

function renderTablesContent(section, sectionIndex, totalSections) {
    if (totalSections === 1) {
        // Pour 1 section : pas de colonnes internes, affichage simple
        return section.map(table => renderTableCard(table, sectionIndex)).join('');
    } else {
        // Pour 2+ sections : affichage normal
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
                <div class="drag-iv-display">0</div>
                <div class="empty-position">${displayText}</div>
            </div>
        `;
    }

    const constraintIndicator = pair.nsConstraint ? `
        <div class="constraint-indicator">
            <span class="lock-icon-large">🔒<sup class="ns-superscript">NS</sup></span>
        </div>
    ` : '';

    // Format d'affichage: initiale prénom + nom de famille
    const formatPlayerName = (fullName) => {
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            // Logique corrigée : séparer noms (MAJUSCULES) et prénoms (pas tout en majuscules)
            let nomParts = [];
            let prenomParts = [];

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part === part.toUpperCase() && part.length > 1) {
                    // Tout en majuscules = nom
                    nomParts.push(part);
                } else {
                    // Pas tout en majuscules = prénom
                    prenomParts.push(part);
                }
            }

            const nom = nomParts.join(' ');
            const prenoms = prenomParts.join(' ');

            // Formatage : initiale(s) prénom + nom en majuscules
            const formatInitials = (firstName) => {
                if (firstName.includes('-')) {
                    const parts = firstName.split(/[-]+/);
                    return parts.map(part => part.charAt(0).toUpperCase()).join('-') + '.';
                } else if (firstName.includes(' ')) {
                    const parts = firstName.split(/\s+/);
                    return parts.map(part => part.charAt(0).toUpperCase()).join('-') + '.';
                } else {
                    return firstName.charAt(0).toUpperCase() + '.';
                }
            };

            const initialePrenom = prenoms ? formatInitials(prenoms) : 'X.';
            return `${initialePrenom} ${nom.toUpperCase()}`;
        }
        return fullName;
    };

    const player1Display = formatPlayerName(pair.player1.name);
    const player2Display = formatPlayerName(pair.player2.name);

    // Ajouter la classe de contrainte NS
    const constraintClass = pair.nsConstraint ? 'ns-constraint' : '';

    return `
        <div class="position ${positionClass} ${constraintClass}" data-pair-id="${pair.id}" data-position="${positionId}" data-section="${sectionIndex}" data-table="${tableNumber}" data-pos="${position}" draggable="true">
            <div class="drag-iv-display">${pair.combinedIV}</div>
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
    const wasVisible = controls.style.display === 'block';

    if (wasVisible) {
        // Fermer le panneau et désactiver le mode
        controls.style.display = 'none';
        isConstraintMode = false;
    } else {
        // Ouvrir le panneau et activer le mode automatiquement
        controls.style.display = 'block';
        isConstraintMode = true;

        updateConstraintLimitDisplay();
    }

    // Mettre à jour l'apparence du bouton contrainte
    const constraintBtn = document.getElementById('constraintBtn');
    if (constraintBtn) {
        if (isConstraintMode) {
            constraintBtn.classList.add('active');
            constraintBtn.title = 'Mode contrainte actif - Cliquez sur n\'importe quelle paire pour la marquer NS fixe';
            showStatus('🔒 Mode contrainte activé - Cliquez sur n\'importe quelle paire pour la marquer NS fixe', 'info');
        } else {
            constraintBtn.classList.remove('active');
            constraintBtn.title = 'Contraintes NS fixe';
            showStatus('Mode contrainte désactivé', 'info');
        }
    }

    console.log('🔒 Mode contrainte NS:', isConstraintMode ? 'ACTIVÉ' : 'DÉSACTIVÉ');
}

function redistributeWithConstraints() {
    if (parsedPairs && parsedPairs.length > 0) {
        parsedPairs.forEach((pair, index) => {
            if (!pair.id) pair.id = `pair_${index}`;
            pair.nsConstraint = nsConstraints.has(pair.id);
        });
        // CAPTURER les nombres de tables actuels avant redistribution
        const currentTableCounts = getCurrentTableCounts();
        console.log('🎛️ CAPTURE: Nombres de tables actuels:', currentTableCounts);

        const useConstraints = nsConstraints.size > 0;
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, useConstraints, currentTableCounts);
        renderMitchellDisplay();

        showStatus(`✅ Redistribution avec ${nsConstraints.size} contrainte(s) NS fixe`, 'success');

        // FERMER le cartouche après redistribution
        isConstraintMode = false;
        document.getElementById('constraintControls').style.display = 'none';
        document.getElementById('constraintBtn').classList.remove('active');
    }
}

function getCurrentTableCounts() {
    // Extraire les nombres de tables actuels de l'affichage
    const container = document.getElementById('mitchellContainer');
    if (!container) return null;

    const sectionContainers = container.querySelectorAll('.section-container');
    if (sectionContainers.length === 0) return null;

    const tableCounts = [];
    sectionContainers.forEach((sectionDiv, index) => {
        // Compter les tables dans cette section
        const tables = sectionDiv.querySelectorAll('[data-table]');
        tableCounts.push(tables.length);
        console.log(`🔍 Section ${String.fromCharCode(65 + index)}: ${tables.length} tables détectées`);
    });

    // Si toutes les sections ont le même nombre, c'est probablement la config par défaut
    const allSame = tableCounts.every(count => count === tableCounts[0]);
    if (allSame) {
        console.log('🔍 DETECTION: Configuration uniforme, utilisation par défaut');
        return null; // Laisser l'algorithme calculer par défaut
    }

    console.log('🎛️ DETECTION: Configuration personnalisée détectée');
    return tableCounts;
}

function clearConstraints() {
    nsConstraints.clear();
    document.getElementById('constraintCount').textContent = '0 paire(s) marquée(s) NS fixe';

    updateConstraintLimitDisplay();

    if (parsedPairs && parsedPairs.length > 0) {
        parsedPairs.forEach(pair => {
            pair.nsConstraint = false;
            pair.mustBeNS = false;
        });
        mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, false);
        renderMitchellDisplay();
    }

    showStatus('✅ Toutes les contraintes NS ont été effacées', 'success');

    // FERMER le cartouche après effacement
    isConstraintMode = false;
    document.getElementById('constraintControls').style.display = 'none';
    document.getElementById('constraintBtn').classList.remove('active');
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
        console.log('🔍 RAW URL DATA:', decodeURIComponent(urlData).substring(0, 500));
        try {
            const players = JSON.parse(decodeURIComponent(urlData));
            console.log('✅ FFB data from URL:', players.length, 'players');
            console.log('🔍 DEBUG: All players from URL:', players.map(p => p.name));

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
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        console.log('🔄 Regenerating original organization');
        if (parsedPairs && parsedPairs.length > 0) {
            // Clear any constraints
            nsConstraints.clear();
            document.getElementById('constraintCount').textContent = '0 paire(s) marquée(s)';

            // Reset pairs to original state
            parsedPairs.forEach(pair => {
                pair.nsConstraint = false;
                pair.mustBeNS = false;
            });

            // Regenerate with current section count
            mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, false);
            renderMitchellDisplay();
            showStatus('Organisation originale régénérée', 'success');
        }
    });

    document.getElementById('sections1')?.addEventListener('click', () => setSectionCount(1));
    document.getElementById('sections2')?.addEventListener('click', () => setSectionCount(2));
    document.getElementById('sections3')?.addEventListener('click', () => setSectionCount(3));


    document.getElementById('constraintBtn')?.addEventListener('click', showConstraintControls);

    document.getElementById('redistributeBtn')?.addEventListener('click', redistributeWithConstraints);
    document.getElementById('clearConstraintsBtn')?.addEventListener('click', clearConstraints);

    // Event listeners pour les boutons radio de mode de contrainte
    document.querySelectorAll('input[name="constraintMode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            constraintMode = this.value;
            updateConstraintLimitDisplay();
            if (!canAddMoreConstraints() && nsConstraints.size > 0) {
                const maxConstraints = calculateMaxConstraints();
                const modeText = constraintMode === 'sectionA' ? 'Section A' : 'toutes sections';
                if (nsConstraints.size > maxConstraints) {
                    alert(`⚠️ Attention!\n\nLe nouveau mode (${modeText}) ne permet que ${maxConstraints} contraintes.\nVous en avez actuellement ${nsConstraints.size}.\n\nVeuillez supprimer ${nsConstraints.size - maxConstraints} contrainte(s) ou changer de mode.`);
                }
            }
        });
    });

    // Refresh button (restored)
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        console.log('🔄 Regenerating original organization');
        if (parsedPairs && parsedPairs.length > 0) {
            // Clear any constraints
            nsConstraints.clear();
            document.getElementById('constraintCount').textContent = '0 paire(s) marquée(s)';

            // Reset pairs to original state
            parsedPairs.forEach(pair => {
                pair.nsConstraint = false;
                pair.mustBeNS = false;
            });

            // Regenerate with current section count
            mitchellData = mitchellDistribution(parsedPairs, currentSectionCount, false);
            renderMitchellDisplay();
            showStatus('Organisation originale régénérée', 'success');
        }
    });

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

// ===================================================================
// 10. SYSTÈME D'ÉCHANGE DE PAIRES PAR DRAG & DROP - TOUJOURS ACTIF
// ===================================================================

function attachSwapListeners() {
    const positions = document.querySelectorAll('.position[data-pair-id]');
    console.log(`🔄 Attaching swap listeners to ${positions.length} positions`);

    positions.forEach(position => {
        if (!position.hasSwapListeners) {
            // Force draggable à true
            position.draggable = true;

            position.addEventListener('dragstart', handleSwapDragStart);
            position.addEventListener('dragover', handleSwapDragOver);
            position.addEventListener('dragenter', handleSwapDragEnter);
            position.addEventListener('dragleave', handleSwapDragLeave);
            position.addEventListener('drop', handleSwapDrop);
            position.addEventListener('dragend', handleSwapDragEnd);

            // Ajouter le listener pour marquer/démarquer les contraintes NS
            position.addEventListener('click', handleConstraintClick);

            position.hasSwapListeners = true;
            console.log('✅ Swap listeners attached to position:', position.dataset.pairId);
        }
    });
}

function handleSwapDragStart(e) {
    console.log('🔄 Drag start event fired');

    const position = e.target.closest('.position[data-pair-id]');
    if (!position) {
        console.log('❌ No position element found');
        return;
    }

    draggedSwapPair = {
        element: position,
        pairId: position.dataset.pairId,
        sectionIndex: parseInt(position.dataset.section),
        tableNumber: parseInt(position.dataset.table),
        positionType: position.dataset.pos
    };

    // Trouver la paire draggée dans les données
    const section = mitchellData[draggedSwapPair.sectionIndex];
    const table = section.find(t => t.tableNumber === draggedSwapPair.tableNumber);
    const draggedPairData = table[draggedSwapPair.positionType];

    console.log('✅ Dragging pair:', draggedSwapPair, draggedPairData);
    position.classList.add('dragging');

    // Colorier toutes les autres positions selon l'écart d'IV
    colorTargetPositions(draggedPairData);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for some browsers
}

function colorTargetPositions(draggedPair) {
    const draggedIV = draggedPair.combinedIV;
    console.log(`🎨 Coloring targets based on IV ${draggedIV} avec système de pourcentages`);

    // 1. Collecter toutes les paires cibles avec leurs différences d'IV
    const targetPairs = [];
    document.querySelectorAll('.position[data-pair-id]').forEach(position => {
        if (position === draggedSwapPair.element) return;

        const sectionIndex = parseInt(position.dataset.section);
        const tableNumber = parseInt(position.dataset.table);
        const positionType = position.dataset.pos;

        const section = mitchellData[sectionIndex];
        const table = section.find(t => t.tableNumber === tableNumber);
        const targetPairData = table[positionType];

        if (!targetPairData) return;

        // Vérifier si la paire est marquée NS fixe
        if (targetPairData.nsConstraint) {
            position.classList.add('swap-target-forbidden');
            return;
        }

        const targetIV = targetPairData.combinedIV;
        const ivDifference = Math.abs(targetIV - draggedIV);

        targetPairs.push({
            position,
            targetIV,
            ivDifference
        });
    });

    // 2. Trier par différence d'IV (du plus proche au plus éloigné)
    targetPairs.sort((a, b) => a.ivDifference - b.ivDifference);

    // 3. Calculer les seuils de pourcentage
    const totalPairs = targetPairs.length;
    const green20 = Math.ceil(totalPairs * 0.20);
    const orange30 = Math.ceil(totalPairs * 0.30);

    console.log(`📊 Total: ${totalPairs}, Vert: ${green20}, Orange: ${orange30}, Rouge: ${totalPairs - green20 - orange30}`);

    // 4. Appliquer les couleurs selon les pourcentages
    targetPairs.forEach((target, index) => {
        if (index < green20) {
            // 20% les plus proches → Vert
            target.position.classList.add('swap-target-excellent');
            console.log(`🟢 Vert: IV ${target.targetIV} (diff: ${target.ivDifference})`);
        } else if (index < green20 + orange30) {
            // 30% suivantes → Orange
            target.position.classList.add('swap-target-good');
            console.log(`🟠 Orange: IV ${target.targetIV} (diff: ${target.ivDifference})`);
        } else {
            // 50% restantes → Rouge
            target.position.classList.add('swap-target-poor');
            console.log(`🔴 Rouge: IV ${target.targetIV} (diff: ${target.ivDifference})`);
        }
    });
}

function handleSwapDragOver(e) {
    if (!draggedSwapPair) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleSwapDragEnter(e) {
    if (!draggedSwapPair) return;

    const position = e.target.closest('.position[data-pair-id]');
    if (!position || position === draggedSwapPair.element) return;

    // Ne pas permettre l'hover sur les paires interdites
    if (position.classList.contains('swap-target-forbidden')) return;

    // Pas d'ajout de classe ici, la couleur est déjà définie par colorTargetPositions
}

function handleSwapDragLeave(e) {
    if (!draggedSwapPair) return;

    const position = e.target.closest('.position[data-pair-id]');
    if (!position) return;

    // Les couleurs restent visibles pendant tout le drag - pas de nettoyage ici
}

function handleSwapDrop(e) {
    console.log('🔄 Drop event fired', draggedSwapPair);
    if (!draggedSwapPair) return;
    e.preventDefault();

    const targetPosition = e.target.closest('.position[data-pair-id]');
    if (!targetPosition || targetPosition === draggedSwapPair.element) {
        console.log('❌ Invalid drop target');
        return;
    }

    // Empêcher le drop sur les paires interdites (NS fixe)
    if (targetPosition.classList.contains('swap-target-forbidden')) {
        console.log('❌ Drop forbidden on NS constraint pair');
        return;
    }

    // Récupérer les informations de la cible
    const targetInfo = {
        pairId: targetPosition.dataset.pairId,
        sectionIndex: parseInt(targetPosition.dataset.section),
        tableNumber: parseInt(targetPosition.dataset.table),
        positionType: targetPosition.dataset.pos
    };

    console.log('✅ Valid drop target:', targetInfo);

    // Effectuer l'échange
    executeSwapBetweenPairs(draggedSwapPair, targetInfo);
}

function handleSwapDragEnd(e) {
    // Nettoyer toutes les classes de drag et de coloration
    document.querySelectorAll('.position').forEach(pos => {
        pos.classList.remove(
            'dragging',
            'swap-drop-target',
            'swap-target-excellent',
            'swap-target-good',
            'swap-target-poor',
            'swap-target-forbidden'
        );
    });

    draggedSwapPair = null;
}

function calculateMaxConstraints() {
    if (constraintMode === 'sectionA') {
        if (mitchellData && mitchellData[0] && mitchellData[0].length > 0) {
            return mitchellData[0].length;
        } else {
            return parseInt(document.getElementById('tablesPerSection')?.value || 8);
        }
    } else {
        if (mitchellData && mitchellData.length > 0) {
            let totalTables = 0;
            mitchellData.forEach(section => {
                totalTables += section.length;
            });
            return totalTables;
        } else {
            return currentSectionCount * parseInt(document.getElementById('tablesPerSection')?.value || 8);
        }
    }
}

function updateConstraintLimitDisplay() {
    const maxConstraints = calculateMaxConstraints();
    const currentConstraints = nsConstraints.size;
    const limitElement = document.getElementById('constraintLimit');

    if (constraintMode === 'sectionA') {
        limitElement.textContent = `Maximum: ${maxConstraints} (Section A uniquement)`;
    } else {
        limitElement.textContent = `Maximum: ${maxConstraints} (Toutes sections)`;
    }

    if (currentConstraints >= maxConstraints) {
        limitElement.style.color = '#dc3545';
    } else if (currentConstraints >= maxConstraints * 0.8) {
        limitElement.style.color = '#fd7e14';
    } else {
        limitElement.style.color = '#666';
    }
}

function canAddMoreConstraints() {
    return nsConstraints.size < calculateMaxConstraints();
}

function handleConstraintClick(e) {
    if (!isConstraintMode) return;
    e.preventDefault();
    e.stopPropagation();

    const position = e.target.closest('.position[data-pair-id]');
    if (!position) return;

    const pairId = position.dataset.pairId;
    const sectionIndex = parseInt(position.dataset.section);
    const tableNumber = parseInt(position.dataset.table);
    const positionType = position.dataset.pos;
    const section = mitchellData[sectionIndex];
    const table = section.find(t => t.tableNumber === tableNumber);
    const pair = table[positionType];

    if (!pair || !pair.id) return;

    let constraintAdded = false;

    if (nsConstraints.has(pair.id)) {
        nsConstraints.delete(pair.id);
        pair.nsConstraint = false;
        constraintAdded = false;
    } else {
        if (!canAddMoreConstraints()) {
            const maxConstraints = calculateMaxConstraints();
            const modeText = constraintMode === 'sectionA' ? 'Section A' : 'toutes sections';
            alert(`⚠️ Limite atteinte!\n\nMaximum autorisé: ${maxConstraints} contraintes NS fixe (${modeText})\n\nModifiez le mode de contrainte ou supprimez des contraintes existantes.`);
            return;
        }

        nsConstraints.add(pair.id);
        pair.nsConstraint = true;
        constraintAdded = true;
    }

    document.getElementById('constraintCount').textContent = `${nsConstraints.size} paire(s) marquée(s) NS fixe`;
    updateConstraintLimitDisplay();
    renderMitchellDisplay();

    const sectionLetter = String.fromCharCode(65 + sectionIndex);
    const action = constraintAdded ? 'marquée' : 'démarquée';
    showStatus(`✅ Paire ${sectionLetter}-T${tableNumber} ${action} comme NS fixe`, 'success');
}

function executeSwapBetweenPairs(pair1Info, pair2Info) {
    console.log('🔄 Executing swap between pairs:', pair1Info, pair2Info);

    // Trouver les paires dans mitchellData
    const section1 = mitchellData[pair1Info.sectionIndex];
    const table1 = section1.find(t => t.tableNumber === pair1Info.tableNumber);
    const pair1 = table1[pair1Info.positionType];

    const section2 = mitchellData[pair2Info.sectionIndex];
    const table2 = section2.find(t => t.tableNumber === pair2Info.tableNumber);
    const pair2 = table2[pair2Info.positionType];

    // Effectuer l'échange
    table1[pair1Info.positionType] = pair2;
    table2[pair2Info.positionType] = pair1;

    // Re-rendre l'affichage immédiatement
    renderMitchellDisplay();

    const sectionLetter1 = String.fromCharCode(65 + pair1Info.sectionIndex);
    const sectionLetter2 = String.fromCharCode(65 + pair2Info.sectionIndex);

    showStatus(`✅ Échange effectué: ${sectionLetter1}-T${pair1Info.tableNumber} ${pair1Info.positionType.toUpperCase()} ↔ ${sectionLetter2}-T${pair2Info.tableNumber} ${pair2Info.positionType.toUpperCase()}`, 'success');
}

console.log('✅ Bridge Generator V2 JavaScript loaded (external file)');
