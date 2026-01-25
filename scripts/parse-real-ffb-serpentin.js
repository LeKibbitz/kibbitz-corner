// Parser pour la VRAIE distribution serpentin FFB Vacances Bleues
const fs = require('fs');

// Lecture du fichier FFB original
const ffbFile = fs.readFileSync('../data/49844-Mixte2ExpertVacancesBleues-Mixte2-Comite.txt', 'utf8');

function parseFFBSerpentin() {
    const lines = ffbFile.split('\n');
    let inSerpentin = false;
    let inInscrits = false;
    const serpentinData = [];
    const inscritsData = [];

    for (const line of lines) {
        if (line.startsWith('#SERPENTIN')) {
            inSerpentin = true;
            inInscrits = false;
            continue;
        }
        if (line.startsWith('#INSCRITS_GROUPE')) {
            inSerpentin = false;
            inInscrits = true;
            continue;
        }
        if (line.startsWith('#')) {
            inSerpentin = false;
            inInscrits = false;
            continue;
        }

        if (inSerpentin && line.trim()) {
            // Format: id1;titre1;nom1;prenom1;id2;titre2;nom2;prenom2;section;NS/EO;table;club;...
            const parts = line.split(';');
            if (parts.length >= 11) {
                serpentinData.push({
                    player1_id: parts[0],
                    player1_title: parts[1],
                    player1_lastname: parts[2],
                    player1_firstname: parts[3],
                    player2_id: parts[4],
                    player2_title: parts[5],
                    player2_lastname: parts[6],
                    player2_firstname: parts[7],
                    section: parseInt(parts[8]),
                    position: parts[9], // NS ou EO
                    table: parseInt(parts[10]),
                    club_id: parts[11],
                    name: `${parts[2]}/${parts[6]}`
                });
            }
        }

        if (inInscrits && line.trim()) {
            // Format: id;player1_id;titre1;nom1;prenom1;dept1;licence1;pe1;ON;player2_id;titre2;nom2;prenom2;dept2;licence2;pe2;ON;iv;pe_pair;pp;club_id;club_name
            const parts = line.split(';');
            if (parts.length >= 21) {
                const pairId = parts[0];
                const player1_id = parts[1];
                const player2_id = parts[9];

                inscritsData.push({
                    pair_id: pairId,
                    player1_id: player1_id,
                    player2_id: player2_id,
                    iv: parseInt(parts[17]),
                    pe_pair: parseInt(parts[18]),
                    pp: parseInt(parts[19]),
                    name: `${parts[3]}/${parts[11]}`
                });
            }
        }
    }

    return { serpentinData, inscritsData };
}

function mergeData() {
    const { serpentinData, inscritsData } = parseFFBSerpentin();

    // Fusionner les données serpentin avec les données IV/PP/PE
    const mergedData = serpentinData.map(serpentinEntry => {
        const matchingInscrit = inscritsData.find(inscrit =>
            serpentinEntry.player1_id === inscrit.player1_id &&
            serpentinEntry.player2_id === inscrit.player2_id
        );

        return {
            ...serpentinEntry,
            iv: matchingInscrit ? matchingInscrit.iv : 0,
            pp: matchingInscrit ? matchingInscrit.pp : 0,
            pe: matchingInscrit ? matchingInscrit.pe_pair : 0
        };
    });

    return mergedData;
}

function analyzeFFBDistribution() {
    const data = mergeData();

    console.log('🎯 VRAIE Distribution FFB Serpentin Vacances Bleues\n');

    // Section 1
    console.log('📋 SECTION 1:');
    const section1 = data.filter(d => d.section === 1).sort((a, b) => a.table - b.table);
    section1.forEach(entry => {
        console.log(`Table ${entry.table}: ${entry.position} ${entry.name} (${entry.iv} IV)`);
    });

    console.log('\n📋 SECTION 2:');
    const section2 = data.filter(d => d.section === 2).sort((a, b) => a.table - b.table);
    section2.forEach(entry => {
        console.log(`Table ${entry.table}: ${entry.position} ${entry.name} (${entry.iv} IV)`);
    });

    // Calcul des non-rencontrées par round (simulation 3 rounds × 11 tours)
    console.log('\n🔄 Simulation Non-Rencontrées (3 rounds × 11 tours):');

    // Pour chaque paire NS, calculer qui elle ne rencontre pas
    const nsSection1 = section1.filter(d => d.position === 'NS');
    const eoSection1 = section1.filter(d => d.position === 'EO');

    nsSection1.forEach((nsPair, index) => {
        const nonEncountered = [];

        // Round 1: tour 2 manqué (EO+1)
        const missedRound1 = eoSection1[(index + 1) % 12];
        nonEncountered.push(missedRound1);

        // Round 2: tour 7 manqué (EO+6)
        const missedRound2 = eoSection1[(index + 6) % 12];
        nonEncountered.push(missedRound2);

        // Round 3: tour 5 manqué (EO+4)
        const missedRound3 = eoSection1[(index + 4) % 12];
        nonEncountered.push(missedRound3);

        const avgIV = (nonEncountered.reduce((sum, p) => sum + p.iv, 0) / 3).toFixed(1);

        console.log(`NS${nsPair.table} ${nsPair.name}: non-rencontrées IV moyen = ${avgIV}`);
        console.log(`  Round1: ${missedRound1.name} (${missedRound1.iv}), Round2: ${missedRound2.name} (${missedRound2.iv}), Round3: ${missedRound3.name} (${missedRound3.iv})`);
    });

    return { section1, section2, nsSection1, eoSection1 };
}

// Export data pour analyse
const result = analyzeFFBDistribution();
const output = {
    real_ffb_distribution: result,
    analysis_date: new Date().toISOString(),
    source: "49844-Mixte2ExpertVacancesBleues-Mixte2-Comite.txt"
};

fs.writeFileSync('real-ffb-serpentin-analysis.json', JSON.stringify(output, null, 2));
console.log('\n✅ Analyse sauvegardée: real-ffb-serpentin-analysis.json');