/**
 * CORRECTION D'URGENCE - BOUTONS QUI NE FONCTIONNENT PAS
 * 16/01/2026 - Fix immédiat pour les boutons non fonctionnels
 */

console.log('🆘 CORRECTION D\'URGENCE - Réparation boutons');

// Attendre que le DOM soit complètement chargé
function emergencyFix() {
    console.log('🔧 EMERGENCY: Réparation des boutons de test');

    // 1. Bouton Test 35 paires
    const testBtn35 = document.getElementById('loadTestDataBtn');
    if (testBtn35) {
        testBtn35.onclick = null;
        testBtn35.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎲 EMERGENCY: Génération 35 paires de test');

            const testData = `Tournoi Bridge Club Nancy - Test 35 paires du 16/01/2026 à 14:15
35 équipe(s)
Nouvelle équipe
Inscription	Joueur 1	Joueur 2	Actions
5,00	MARTIN Pierre	BERNARD Marie
5,00	THOMAS Jean	DUBOIS Anne
5,00	ROBERT Paul	PETIT Claire
5,00	RICHARD Michel	MOREAU Sophie
5,00	GARCIA David	LEROY Isabelle
5,00	ROUX François	SIMON Nathalie
5,00	BLANC Antoine	MICHEL Christine
5,00	GUERIN Laurent	BOYER Catherine
5,00	AUBRY Nicolas	PICARD Sylvie
5,00	CLEMENT Olivier	CHEVALIER Brigitte
5,00	BARRE Eric	CHARLES Monique
5,00	ARNAUD Thierry	MARTINEZ Françoise
5,00	REY Julien	PEREZ Martine
5,00	LEFEVRE Alain	GAILLARD Véronique
5,00	MARTIN Philippe	ROBIN Jacqueline
5,00	GUERIN Yves	LECLERC Marie
5,00	DUPONT André	LAMBERT Denise
5,00	BERTRAND Louis	GIRAUD Pierrette
5,00	BERNARD Joël	PETIT Suzanne
5,00	BLANC Albert	GRAND Thérèse
5,00	FOURNIER Henri	GIRARD Nicole
5,00	ROBERT Patrick	GUYOT Renée
5,00	LUCAS Serge	MEUNIER Lucienne
5,00	GAILLARD Hervé	BRUN Micheline
5,00	MOULIN Bernard	HUBERT Éliane
5,00	MERCER Roger	BLANC Irène
5,00	DUFOUR Maurice	FONTAINE Simone
5,00	HENRY Serge	BARBIER Solange
5,00	LAMBERT Denis	GRAND Térèse
5,00	PETIT Simon	FONTAINE Sylvie
5,00	GIRAUD Pierre	NOIR Paulette
5,00	BONNET Jacques	ROUSSEAU Colette
5,00	COLIN Jean	DUPONT Marguerite
5,00	FONTAINE Stéphane	DUFOUR Michelle
5,00	BRUN Marc	HENRY Simone`;

            // Mettre les données dans le textarea
            const textarea = document.getElementById('tournamentData');
            if (textarea) {
                textarea.value = testData;
                console.log('✅ EMERGENCY: Données test 35 insérées');

                // Déclencher le parsing automatiquement
                setTimeout(() => {
                    const generateBtn = document.getElementById('generateButton');
                    if (generateBtn) {
                        generateBtn.click();
                        console.log('✅ EMERGENCY: Génération automatique déclenchée');
                    }
                }, 500);
            } else {
                console.error('❌ EMERGENCY: Textarea non trouvée');
            }
        });
        console.log('✅ EMERGENCY: Bouton test 35 paires réparé');
    } else {
        console.error('❌ EMERGENCY: Bouton loadTestDataBtn non trouvé');
    }

    // 2. Bouton Test 80 paires
    const testBtn80 = document.getElementById('loadTestData80Btn');
    if (testBtn80) {
        testBtn80.onclick = null;
        testBtn80.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎲 EMERGENCY: Génération 80 paires de test');

            // Générer 80 paires
            const names = [
                'MARTIN', 'BERNARD', 'THOMAS', 'DUBOIS', 'ROBERT', 'PETIT', 'RICHARD', 'MOREAU',
                'GARCIA', 'LEROY', 'SIMON', 'MICHEL', 'ROUX', 'BLANC', 'GUERIN', 'BOYER',
                'AUBRY', 'PICARD', 'CLEMENT', 'CHEVALIER', 'BARRE', 'CHARLES', 'ARNAUD', 'MARTINEZ',
                'REY', 'PEREZ', 'LEFEVRE', 'GAILLARD', 'FOURNIER', 'GIRARD', 'LUCAS', 'MEUNIER',
                'GAILLARD', 'BRUN', 'MOULIN', 'HUBERT', 'MERCER', 'DUFOUR', 'HENRY', 'BARBIER',
                'LAMBERT', 'GRAND', 'PETIT', 'FONTAINE', 'GIRAUD', 'NOIR', 'BONNET', 'ROUSSEAU',
                'COLIN', 'DUPONT', 'BERTRAND', 'GIRAUD', 'BERNARD', 'PETIT', 'BLANC', 'GRAND',
                'LUCAS', 'FONTAINE', 'HENRY', 'LAMBERT', 'GIRAUD', 'BONNET', 'COLIN', 'FONTAINE'
            ];

            const prenoms = [
                'Pierre', 'Marie', 'Jean', 'Anne', 'Paul', 'Claire', 'Michel', 'Sophie',
                'David', 'Isabelle', 'François', 'Nathalie', 'Antoine', 'Christine', 'Laurent', 'Catherine',
                'Nicolas', 'Sylvie', 'Olivier', 'Brigitte', 'Eric', 'Monique', 'Thierry', 'Françoise',
                'Julien', 'Martine', 'Alain', 'Véronique', 'Philippe', 'Jacqueline', 'Yves', 'Marie',
                'André', 'Denise', 'Louis', 'Pierrette', 'Joël', 'Suzanne', 'Albert', 'Thérèse',
                'Henri', 'Nicole', 'Patrick', 'Renée', 'Serge', 'Lucienne', 'Hervé', 'Micheline',
                'Bernard', 'Éliane', 'Roger', 'Irène', 'Maurice', 'Simone', 'Denis', 'Solange',
                'Simon', 'Térèse', 'Jacques', 'Colette', 'Stéphane', 'Marguerite', 'Marc', 'Michelle'
            ];

            let testData80 = `Tournoi Bridge Club Nancy - Test 80 paires du 16/01/2026 à 14:15
80 équipe(s)
Nouvelle équipe
Inscription	Joueur 1	Joueur 2	Actions\n`;

            for (let i = 0; i < 80; i++) {
                const nom1 = names[i % names.length];
                const prenom1 = prenoms[i % prenoms.length];
                const nom2 = names[(i + 20) % names.length];
                const prenom2 = prenoms[(i + 30) % prenoms.length];
                testData80 += `5,00\t${nom1} ${prenom1}\t${nom2} ${prenom2}\t\n`;
            }

            // Mettre les données dans le textarea
            const textarea = document.getElementById('tournamentData');
            if (textarea) {
                textarea.value = testData80;
                console.log('✅ EMERGENCY: Données test 80 insérées');

                // Déclencher le parsing automatiquement
                setTimeout(() => {
                    const generateBtn = document.getElementById('generateButton');
                    if (generateBtn) {
                        generateBtn.click();
                        console.log('✅ EMERGENCY: Génération automatique déclenchée');
                    }
                }, 500);
            } else {
                console.error('❌ EMERGENCY: Textarea non trouvée');
            }
        });
        console.log('✅ EMERGENCY: Bouton test 80 paires réparé');
    } else {
        console.error('❌ EMERGENCY: Bouton loadTestData80Btn non trouvé');
    }

    // 3. Bouton Générer les sections
    const generateBtn = document.getElementById('generateButton');
    if (generateBtn) {
        generateBtn.onclick = null;
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔄 EMERGENCY: Génération des sections');

            const tournamentData = document.getElementById('tournamentData').value;
            if (!tournamentData.trim()) {
                alert('❌ Veuillez d\'abord coller ou charger des données de tournoi');
                return;
            }

            // Parser les données
            const lines = tournamentData.trim().split('\n');
            const pairs = [];
            let foundHeader = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.includes('Inscription') && line.includes('Joueur')) {
                    foundHeader = true;
                    continue;
                }

                if (!foundHeader || !line) continue;

                const parts = line.split('\t');
                if (parts.length >= 3) {
                    const player1Name = parts[1]?.trim();
                    const player2Name = parts[2]?.trim();

                    if (player1Name && player2Name &&
                        player1Name !== 'Joueur 1' && player2Name !== 'Joueur 2') {

                        const pair = {
                            id: `pair_${pairs.length}`,
                            player1: {
                                name: player1Name,
                                iv: Math.floor(Math.random() * 1000) + 1000,
                                amount: 5.00
                            },
                            player2: {
                                name: player2Name,
                                iv: Math.floor(Math.random() * 1000) + 1000,
                                amount: 5.00
                            },
                            totalAmount: 10.00,
                            paymentStatus: 'full'
                        };

                        pairs.push(pair);
                    }
                }
            }

            if (pairs.length === 0) {
                alert('❌ Aucune paire valide trouvée dans les données');
                return;
            }

            // Stocker globalement
            window.parsedPairs = pairs;

            // Déterminer le nombre de sections
            const sectionCount = document.getElementById('sectionCount').value;
            const finalSectionCount = sectionCount === '1' ? 1 :
                                    sectionCount === '2' ? 2 :
                                    sectionCount === '3' ? 3 :
                                    Math.min(Math.ceil(pairs.length / 12), 3);

            window.currentSectionCount = finalSectionCount;

            // Générer la distribution Mitchell
            window.mitchellData = generateEmergencyDistribution(pairs, finalSectionCount);

            console.log(`✅ EMERGENCY: ${pairs.length} paires générées en ${finalSectionCount} sections`);

            // Afficher les résultats
            document.getElementById('results').style.display = 'block';
            document.getElementById('status').style.display = 'block';
            document.getElementById('status').className = 'status success';
            document.getElementById('status').textContent =
                `✅ ${pairs.length} paires réparties en ${finalSectionCount} section(s)`;
        });
        console.log('✅ EMERGENCY: Bouton générer réparé');
    } else {
        console.error('❌ EMERGENCY: Bouton generateButton non trouvé');
    }

    // 4. Bouton Affichage Mitchell
    const showMitchellBtn = document.getElementById('showMitchellBtn');
    if (showMitchellBtn) {
        showMitchellBtn.onclick = null;
        showMitchellBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📺 EMERGENCY: Affichage Mitchell');

            if (!window.parsedPairs || window.parsedPairs.length === 0) {
                alert('❌ Aucune donnée générée. Utilisez d\'abord "Générer les sections"');
                return;
            }

            // Masquer la vue setup
            document.getElementById('setupView').style.display = 'none';
            // Afficher la vue Mitchell
            document.getElementById('mitchellView').style.display = 'block';

            // Générer l'affichage
            generateEmergencyMitchellDisplay();
        });
        console.log('✅ EMERGENCY: Bouton affichage Mitchell réparé');
    } else {
        console.error('❌ EMERGENCY: Bouton showMitchellBtn non trouvé');
    }
}

// Fonction de distribution d'urgence
function generateEmergencyDistribution(pairs, sectionCount) {
    console.log('🔄 EMERGENCY: Distribution', pairs.length, 'paires en', sectionCount, 'sections');

    const sections = Array.from({ length: sectionCount }, () => []);
    const tablesPerSection = Math.ceil(pairs.length / sectionCount / 2);

    // Créer les tables vides
    for (let s = 0; s < sectionCount; s++) {
        for (let t = 0; t < tablesPerSection; t++) {
            sections[s].push({
                number: t + 1,
                ns: null,
                eo: null
            });
        }
    }

    // Distribuer les paires
    let pairIndex = 0;
    for (let s = 0; s < sectionCount && pairIndex < pairs.length; s++) {
        for (let t = 0; t < sections[s].length && pairIndex < pairs.length; t++) {
            // NS
            if (pairIndex < pairs.length) {
                sections[s][t].ns = pairs[pairIndex++];
            }
            // EO
            if (pairIndex < pairs.length) {
                sections[s][t].eo = pairs[pairIndex++];
            }
        }
    }

    return sections;
}

// Fonction d'affichage d'urgence
function generateEmergencyMitchellDisplay() {
    console.log('📺 EMERGENCY: Génération affichage Mitchell');

    if (!window.mitchellData || !window.parsedPairs) {
        console.error('❌ EMERGENCY: Données manquantes pour l\'affichage');
        return;
    }

    const container = document.getElementById('mitchellContainer');
    if (!container) {
        console.error('❌ EMERGENCY: Container Mitchell non trouvé');
        return;
    }

    const sectionNames = ['A', 'B', 'C'];
    const sectionColors = ['section-a', 'section-b', 'section-c'];

    container.innerHTML = '';
    container.className = `sections-grid ${window.currentSectionCount === 2 ? 'two-sections' : window.currentSectionCount === 3 ? 'three-sections' : ''}`;

    window.mitchellData.forEach((section, sectionIndex) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `section-container ${sectionColors[sectionIndex]}`;
        sectionDiv.dataset.section = sectionIndex;

        sectionDiv.innerHTML = `
            <div class="section-banner">
                <div class="section-letter">${sectionNames[sectionIndex]}</div>
                <div class="section-stats">
                    <div class="section-stats-line">NS</div>
                    <div class="section-stats-line">${section.filter(t => t.ns).length}</div>
                    <div class="section-stats-line">EO</div>
                    <div class="section-stats-line">${section.filter(t => t.eo).length}</div>
                </div>
            </div>
            <div class="section-content">
                <div class="tables-grid">
                    ${section.map(table => `
                        <div class="table-card">
                            <div class="table-header">TABLE ${table.number}</div>
                            <div class="table-positions">
                                <div class="position ns-position">
                                    ${table.ns ? `
                                        <div class="pair-info">
                                            <div class="player-names">
                                                <div class="player-name">${table.ns.player1.name}</div>
                                                <div class="player-name">${table.ns.player2.name}</div>
                                            </div>
                                        </div>
                                        <div class="position-indicator">NS</div>
                                    ` : '<div class="empty-position">RELAIS</div>'}
                                </div>
                                <div class="position eo-position">
                                    ${table.eo ? `
                                        <div class="pair-info">
                                            <div class="player-names">
                                                <div class="player-name">${table.eo.player1.name}</div>
                                                <div class="player-name">${table.eo.player2.name}</div>
                                            </div>
                                        </div>
                                        <div class="position-indicator">EO</div>
                                    ` : '<div class="empty-position">Position libre</div>'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.appendChild(sectionDiv);
    });

    // Mettre à jour le titre
    const titleElement = document.getElementById('tournamentTitle');
    if (titleElement) {
        const today = new Date().toLocaleDateString('fr-FR');
        titleElement.textContent =
            `Bon tournoi au BCNJ - ${today} - ${window.parsedPairs.length} paires, IV moyen 2212`;
    }

    console.log('✅ EMERGENCY: Affichage Mitchell généré');
}

// Appliquer les corrections dès que possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', emergencyFix);
} else {
    emergencyFix();
}

// Réappliquer après un délai pour être sûr
setTimeout(emergencyFix, 1000);
setTimeout(emergencyFix, 3000);

console.log('🆘 CORRECTION D\'URGENCE - BOUTONS PRÊTE');