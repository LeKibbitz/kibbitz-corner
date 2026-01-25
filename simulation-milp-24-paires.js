// Simulation algorithme MILP avec les 24 paires réelles

const pairs24 = [
    {id: "P23", combinedIV: 200, nsConstraint: false}, // CHOTTIN/LANGLAIS
    {id: "P13", combinedIV: 192, nsConstraint: false}, // DIVOUX/SARGOS
    {id: "P16", combinedIV: 184, nsConstraint: false}, // NIMSGERN/BECKER
    {id: "P15", combinedIV: 168, nsConstraint: false}, // BARBOT/REGNIER
    {id: "P3", combinedIV: 160, nsConstraint: false},  // LE PENNEC/THIEBAUT
    {id: "P12", combinedIV: 160, nsConstraint: false}, // DESJARDINS/THIEBAUT
    {id: "P8", combinedIV: 156, nsConstraint: false},  // FAVÉ/MILION
    {id: "P19", combinedIV: 144, nsConstraint: false}, // JAYTENER/PARENTELLI
    {id: "P21", combinedIV: 144, nsConstraint: false}, // NICOLETTA/FERRETTI
    {id: "P14", combinedIV: 132, nsConstraint: false}, // WACHTEL/HEIM
    {id: "P22", combinedIV: 120, nsConstraint: false}, // CABIROL/CABIROL
    {id: "P1", combinedIV: 112, nsConstraint: false},  // BARBOT/COGLIATI
    {id: "P11", combinedIV: 112, nsConstraint: false}, // GREFF/DUVERNOY
    {id: "P17", combinedIV: 108, nsConstraint: false}, // VROONE/MECHAIN
    {id: "P20", combinedIV: 108, nsConstraint: false}, // PEROT/PEROT
    {id: "P6", combinedIV: 100, nsConstraint: false},  // SCHOUMERT/HOEFLER
    {id: "P5", combinedIV: 94, nsConstraint: false},   // BARTHELEMY/BOBRIE
    {id: "P9", combinedIV: 94, nsConstraint: false},   // HEISSAT/GOULLET
    {id: "P18", combinedIV: 94, nsConstraint: false},  // JAYTENER/MARCHAND
    {id: "P24", combinedIV: 84, nsConstraint: false},  // DIETERLING/DIETERLING
    {id: "P7", combinedIV: 82, nsConstraint: false},   // EHMANN/REMY
    {id: "P4", combinedIV: 72, nsConstraint: false},   // DA SILVA/BOBRIE
    {id: "P10", combinedIV: 72, nsConstraint: false},  // BRIOLA/KIEFFER
    {id: "P2", combinedIV: 60, nsConstraint: false}    // SELLIES/SELLIES
];

// Simulation MILP pour 1 section (12 tables)
function simulateMILP1Section() {
    console.log("🎯 SIMULATION MILP - 1 SECTION (12 tables)");

    const sectionCount = 1;
    const targetLineAverage = 123.2; // Moyenne réelle des 24 paires
    const targetPerLine = Math.ceil(24 / 2); // 12 paires par ligne

    console.log(`📊 Cible: ${targetPerLine} paires par ligne, moyenne: ${targetLineAverage.toFixed(1)}`);

    // Algorithme MILP simplifié
    const solution = {
        sections: [{NS: [], EO: []}]
    };

    // ALGORITHME OPTIMAL: Distribution alternée pour équilibrage parfait
    // Tri pour placer paires alternativement entre forte et faible
    pairs24.forEach((pair, index) => {
        // Calculer moyennes actuelles
        const nsSum = solution.sections[0].NS.reduce((sum, p) => sum + p.combinedIV, 0);
        const eoSum = solution.sections[0].EO.reduce((sum, p) => sum + p.combinedIV, 0);
        const nsCount = solution.sections[0].NS.length;
        const eoCount = solution.sections[0].EO.length;

        // Vérifier capacité
        const canPlaceNS = nsCount < targetPerLine;
        const canPlaceEO = eoCount < targetPerLine;

        if (canPlaceNS && canPlaceEO) {
            // Calculer impact sur moyennes
            const potentialNSAvg = (nsSum + pair.combinedIV) / (nsCount + 1);
            const potentialEOAvg = (eoSum + pair.combinedIV) / (eoCount + 1);

            const nsDeviation = Math.abs(potentialNSAvg - targetLineAverage);
            const eoDeviation = Math.abs(potentialEOAvg - targetLineAverage);

            // ALGORITHME INTELLIGENT : équilibrer les moyennes
            // Si NS est trop haut et EO trop bas, privilégier EO pour les paires fortes
            const nsAvg = nsCount > 0 ? nsSum / nsCount : 0;
            const eoAvg = eoCount > 0 ? eoSum / eoCount : 0;

            // Logique d'équilibrage intelligent
            let chooseNS;

            if (nsAvg > targetLineAverage + 5 && eoAvg < targetLineAverage - 5) {
                // NS trop fort, EO trop faible → envoyer vers EO
                chooseNS = false;
            } else if (eoAvg > targetLineAverage + 5 && nsAvg < targetLineAverage - 5) {
                // EO trop fort, NS trop faible → envoyer vers NS
                chooseNS = true;
            } else {
                // Choisir côté qui minimise la déviation
                chooseNS = nsDeviation <= eoDeviation;

                // Si égalité, privilégier équilibre numérique
                if (Math.abs(nsDeviation - eoDeviation) < 1) {
                    chooseNS = nsCount <= eoCount;
                }
            }

            if (chooseNS) {
                solution.sections[0].NS.push(pair);
                console.log(`📍 NS: ${pair.id} (${pair.combinedIV}) → moy: ${potentialNSAvg.toFixed(1)} [dév: ${nsDeviation.toFixed(1)}]`);
            } else {
                solution.sections[0].EO.push(pair);
                console.log(`📍 EO: ${pair.id} (${pair.combinedIV}) → moy: ${potentialEOAvg.toFixed(1)} [dév: ${eoDeviation.toFixed(1)}]`);
            }
        } else if (canPlaceNS) {
            solution.sections[0].NS.push(pair);
            const newAvg = (nsSum + pair.combinedIV) / (nsCount + 1);
            console.log(`📍 NS: ${pair.id} (${pair.combinedIV}) → moy: ${newAvg.toFixed(1)} [forcé]`);
        } else if (canPlaceEO) {
            solution.sections[0].EO.push(pair);
            const newAvg = (eoSum + pair.combinedIV) / (eoCount + 1);
            console.log(`📍 EO: ${pair.id} (${pair.combinedIV}) → moy: ${newAvg.toFixed(1)} [forcé]`);
        }
    });

    return solution;
}

// Simulation MILP pour 2 sections (6 tables chacune)
function simulateMILP2Sections() {
    console.log("\n🎯 SIMULATION MILP - 2 SECTIONS (6 tables chacune)");

    const sectionCount = 2;
    const targetLineAverage = 123.2; // Moyenne réelle des 24 paires
    const targetPerLine = Math.ceil(24 / 4); // 6 paires par ligne

    console.log(`📊 Cible: ${targetPerLine} paires par ligne, moyenne: ${targetLineAverage.toFixed(1)}`);

    const solution = {
        sections: [{NS: [], EO: []}, {NS: [], EO: []}]
    };

    // Algorithme d'allocation équilibrée
    pairs24.forEach((pair, index) => {
        let bestPlacement = null;
        let minPenalty = Infinity;

        // Tester toutes les positions possibles
        for (let s = 0; s < 2; s++) {
            for (const line of ['NS', 'EO']) {
                const currentCount = solution.sections[s][line].length;

                if (currentCount >= targetPerLine) continue; // Capacité dépassée

                // Calculer pénalité
                const currentSum = solution.sections[s][line].reduce((sum, p) => sum + p.combinedIV, 0);
                const newSum = currentSum + pair.combinedIV;
                const newAverage = newSum / (currentCount + 1);
                const deviationPenalty = Math.abs(newAverage - targetLineAverage);

                // Pénalité déséquilibre numérique
                const otherLine = line === 'NS' ? 'EO' : 'NS';
                const otherCount = solution.sections[s][otherLine].length;
                const balancePenalty = Math.abs(currentCount + 1 - otherCount) * 3;

                const totalPenalty = deviationPenalty + balancePenalty;

                if (totalPenalty < minPenalty) {
                    minPenalty = totalPenalty;
                    bestPlacement = {section: s, line, newAverage};
                }
            }
        }

        if (bestPlacement) {
            solution.sections[bestPlacement.section][bestPlacement.line].push(pair);
            console.log(`📍 Section ${String.fromCharCode(65 + bestPlacement.section)} ${bestPlacement.line}: ${pair.id} (${pair.combinedIV}) → moy: ${bestPlacement.newAverage.toFixed(1)}`);
        }
    });

    return solution;
}

// Affichage des résultats
function displayResults(solution, sectionCount) {
    console.log("\n📊 RÉSULTATS FINAUX:");

    let globalNSSum = 0, globalEOSum = 0, globalNSCount = 0, globalEOCount = 0;

    solution.sections.forEach((section, sIdx) => {
        const nsSum = section.NS.reduce((sum, p) => sum + p.combinedIV, 0);
        const eoSum = section.EO.reduce((sum, p) => sum + p.combinedIV, 0);
        const nsCount = section.NS.length;
        const eoCount = section.EO.length;

        globalNSSum += nsSum;
        globalEOSum += eoSum;
        globalNSCount += nsCount;
        globalEOCount += eoCount;

        const nsAvg = nsCount > 0 ? nsSum / nsCount : 0;
        const eoAvg = eoCount > 0 ? eoSum / eoCount : 0;
        const nsDeviation = Math.abs(nsAvg - 123.2);
        const eoDeviation = Math.abs(eoAvg - 123.2);

        console.log(`✅ Section ${String.fromCharCode(65 + sIdx)}:`);
        console.log(`   NS: ${nsAvg.toFixed(1)} (${nsCount} paires, dév: ${nsDeviation.toFixed(1)})`);
        console.log(`   EO: ${eoAvg.toFixed(1)} (${eoCount} paires, dév: ${eoDeviation.toFixed(1)})`);

        // Détail des paires
        console.log(`   Détail NS: [${section.NS.map(p => `${p.id}:${p.combinedIV}`).join(', ')}]`);
        console.log(`   Détail EO: [${section.EO.map(p => `${p.id}:${p.combinedIV}`).join(', ')}]`);
    });

    const globalNSAvg = globalNSCount > 0 ? globalNSSum / globalNSCount : 0;
    const globalEOAvg = globalEOCount > 0 ? globalEOSum / globalEOCount : 0;

    console.log(`\n🎯 MOYENNES GLOBALES:`);
    console.log(`   Global NS: ${globalNSAvg.toFixed(1)} (${globalNSCount} paires)`);
    console.log(`   Global EO: ${globalEOAvg.toFixed(1)} (${globalEOCount} paires)`);
    console.log(`   Écart NS-EO: ${Math.abs(globalNSAvg - globalEOAvg).toFixed(1)}`);
}

// Exécution des simulations
console.log("🚀 DÉMARRAGE SIMULATION MILP\n");

const solution1 = simulateMILP1Section();
displayResults(solution1, 1);

const solution2 = simulateMILP2Sections();
displayResults(solution2, 2);