// Parser pour la VRAIE distribution serpentin FFB Vacances Bleues (fichier Desktop)
const fs = require('fs');

// Lecture du fichier FFB original sur Desktop
const ffbFile = fs.readFileSync('/Users/thomasjoannes/Desktop/49844-Mixte2ExpertVacancesBleues-Mixte2-Comite.txt', 'utf8');

function parseVraieDistributionFFB() {
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
                    player1_lastname: parts[2],
                    player1_firstname: parts[3],
                    player2_id: parts[4],
                    player2_lastname: parts[6],
                    player2_firstname: parts[7],
                    section: parseInt(parts[8]),
                    position: parts[9], // NS ou EO
                    table: parseInt(parts[10]),
                    name: `${parts[2]}/${parts[6]}`
                });
            }
        }

        if (inInscrits && line.trim()) {
            // Format: id;player1_id;titre1;nom1;prenom1;...;player2_id;titre2;nom2;prenom2;...;iv;pe_pair;pp;club_id;club_name
            const parts = line.split(';');
            if (parts.length >= 21) {
                inscritsData.push({
                    pair_id: parts[0],
                    player1_id: parts[1],
                    player2_id: parts[9],
                    iv: parseInt(parts[17]),
                    pe_pair: parseInt(parts[18]),
                    pp: parseInt(parts[19]),
                    name: `${parts[3]}/${parts[11]}`
                });
            }
        }
    }

    // Fusionner les données
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

function afficherVraieDistribution() {
    const data = parseVraieDistributionFFB();

    console.log('🎯 VRAIE DISTRIBUTION FFB SERPENTIN VACANCES BLEUES\n');

    // Section 1
    console.log('📋 SECTION 1:');
    const section1 = data.filter(d => d.section === 1).sort((a, b) => a.table - b.table);

    console.log('### Tables Section 1');
    console.log('```');
    for (let t = 1; t <= 12; t++) {
        const ns = section1.find(p => p.table === t && p.position === 'NS');
        const eo = section1.find(p => p.table === t && p.position === 'EO');
        if (ns && eo) {
            console.log(`Table 1${t}: NS${t} ${ns.name} (${ns.iv} IV)      EO${t} ${eo.name} (${eo.iv} IV)`);
        }
    }
    console.log('```\n');

    // Section 2
    console.log('📋 SECTION 2:');
    const section2 = data.filter(d => d.section === 2).sort((a, b) => a.table - b.table);

    console.log('### Tables Section 2');
    console.log('```');
    for (let t = 1; t <= 12; t++) {
        const ns = section2.find(p => p.table === t && p.position === 'NS');
        const eo = section2.find(p => p.table === t && p.position === 'EO');
        if (ns && eo) {
            console.log(`Table 2${t}: NS${t+12} ${ns.name} (${ns.iv} IV)    EO${t+12} ${eo.name} (${eo.iv} IV)`);
        }
    }
    console.log('```\n');

    // Export pour mise à jour document
    const output = {
        vraie_distribution_ffb: {
            section1: section1,
            section2: section2
        },
        analysis_date: new Date().toISOString(),
        source: "/Users/thomasjoannes/Desktop/49844-Mixte2ExpertVacancesBleues-Mixte2-Comite.txt"
    };

    fs.writeFileSync('vraie-distribution-ffb.json', JSON.stringify(output, null, 2));
    console.log('✅ Vraie distribution sauvegardée: vraie-distribution-ffb.json');

    return output;
}

// Lancement
afficherVraieDistribution();