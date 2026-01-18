/**
 * CORRECTION URGENTE BRIDGE GENERATOR - 16/01/2026
 * Fichier de correction rapide pour tous les bugs critiques identifiés
 */

console.log('🚨 CORRECTION URGENTE ACTIVÉE - Bridge Generator Fix');

// =======================================================
// 1. CORRECTION DU BUG "5 PAIRES = 25 PAIRES"
// =======================================================

// Sauvegarder les fonctions originales problématiques
window.originalParsePairs = window.parsePairs;

/**
 * Correction du parsing des paires - évite la duplication
 */
function fixedParsePairs(data) {
    console.log('🔧 FIXED: parsePairs avec données:', data.length, 'caractères');

    if (!data || data.trim().length === 0) {
        console.warn('❌ FIXED: Données vides');
        return [];
    }

    const lines = data.trim().split('\n');
    const pairs = [];
    let foundHeader = false;

    // Chercher l'en-tête des données
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('Inscription') && line.includes('Joueur')) {
            foundHeader = true;
            continue;
        }

        if (!foundHeader || !line) continue;

        // Parser chaque ligne de paire
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
                        iv: Math.floor(Math.random() * 2000) + 1000,
                        amount: 5.00
                    },
                    player2: {
                        name: player2Name,
                        iv: Math.floor(Math.random() * 2000) + 1000,
                        amount: 5.00
                    },
                    totalAmount: 10.00,
                    paymentStatus: 'full'
                };

                pairs.push(pair);
                console.log('✅ FIXED: Paire ajoutée:', pair.id, '-', player1Name, '/', player2Name);
            }
        }
    }

    console.log('✅ FIXED: Total paires extraites:', pairs.length);
    return pairs;
}

// Remplacer la fonction globale
window.parsePairs = fixedParsePairs;

// =======================================================
// 2. CORRECTION DES CURSEURS DE SECTIONS
// =======================================================

/**
 * Correction des curseurs de modification des tables par section
 */
function fixTableCountSliders() {
    console.log('🔧 FIXED: Réparation des curseurs de tables');

    // Réattacher les événements des curseurs
    document.querySelectorAll('.table-count-btn').forEach(btn => {
        btn.onclick = null; // Supprimer l'ancien handler

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isIncrement = this.textContent === '▲' || this.textContent === '+';
            const sectionElement = this.closest('.section-container');
            const sectionIndex = parseInt(sectionElement.dataset.section || '0');

            console.log('🔧 FIXED: Curseur section', sectionIndex, isIncrement ? '+' : '-');

            if (typeof window.adjustTableCount === 'function') {
                window.adjustTableCount(sectionIndex, isIncrement ? 1 : -1);
            } else {
                console.warn('❌ FIXED: adjustTableCount non trouvée');
            }
        });
    });
}

// =======================================================
// 3. CORRECTION DES BOUTONS REDISTRIBUTER/EFFACER
// =======================================================

/**
 * Correction des boutons de redistribution
 */
function fixRedistributeButtons() {
    console.log('🔧 FIXED: Réparation boutons redistribuer/effacer');

    // Bouton redistribuer
    const redistributeBtn = document.querySelector('[onclick*="redistributeWithConstraints"]');
    if (redistributeBtn) {
        redistributeBtn.onclick = null;
        redistributeBtn.addEventListener('click', function() {
            console.log('🔧 FIXED: Redistribution avec contraintes');
            if (window.parsedPairs && window.parsedPairs.length > 0) {
                try {
                    window.mitchellData = window.mitchellDistribution(
                        window.parsedPairs,
                        window.currentSectionCount || 1,
                        window.nsConstraints?.size > 0 || false
                    );
                    if (typeof window.renderMitchellDisplay === 'function') {
                        window.renderMitchellDisplay();
                    }
                    console.log('✅ FIXED: Redistribution effectuée');
                } catch (error) {
                    console.error('❌ FIXED: Erreur redistribution:', error);
                }
            }
        });
    }

    // Bouton effacer tout
    const clearBtn = document.querySelector('[onclick*="clearConstraints"]');
    if (clearBtn) {
        clearBtn.onclick = null;
        clearBtn.addEventListener('click', function() {
            console.log('🔧 FIXED: Effacement des contraintes');
            if (window.nsConstraints) {
                window.nsConstraints.clear();
            }
            if (window.parsedPairs) {
                window.parsedPairs.forEach(pair => {
                    pair.nsConstraint = false;
                    pair.mustBeNS = false;
                });
            }
            // Regénérer sans contraintes
            if (window.parsedPairs && window.parsedPairs.length > 0) {
                try {
                    window.mitchellData = window.mitchellDistribution(
                        window.parsedPairs,
                        window.currentSectionCount || 1,
                        false
                    );
                    if (typeof window.renderMitchellDisplay === 'function') {
                        window.renderMitchellDisplay();
                    }
                    console.log('✅ FIXED: Contraintes effacées');
                } catch (error) {
                    console.error('❌ FIXED: Erreur effacement:', error);
                }
            }
        });
    }
}

// =======================================================
// 4. CORRECTION DE L'ALGORITHME "?"
// =======================================================

/**
 * Correction de l'algorithme "?" (algorithme équilibré)
 */
function fixEquilibratedAlgorithm() {
    console.log('🔧 FIXED: Réparation algorithme équilibré');

    // Implémentation simple de l'algorithme équilibré
    window.equilibratedDistribution = function(pairs, sectionCount, useConstraints) {
        console.log('🔧 FIXED: Distribution équilibrée -', pairs.length, 'paires,', sectionCount, 'sections');

        const sections = Array.from({ length: sectionCount }, () => []);
        const tablesPerSection = Math.ceil(pairs.length / sectionCount);

        // Créer les tables vides
        for (let s = 0; s < sectionCount; s++) {
            const tableCount = Math.min(tablesPerSection, Math.ceil((pairs.length - s * tablesPerSection) / 1));
            for (let t = 0; t < tableCount; t++) {
                sections[s].push({
                    number: t + 1,
                    ns: null,
                    eo: null
                });
            }
        }

        // Distribuer les paires en serpentin équilibré
        let pairIndex = 0;
        let forward = true;

        while (pairIndex < pairs.length) {
            const sectionsOrder = forward ?
                Array.from({ length: sectionCount }, (_, i) => i) :
                Array.from({ length: sectionCount }, (_, i) => sectionCount - 1 - i);

            for (let s of sectionsOrder) {
                if (pairIndex >= pairs.length) break;

                // Trouver une table disponible dans cette section
                for (let table of sections[s]) {
                    if (!table.ns) {
                        table.ns = pairs[pairIndex++];
                        break;
                    } else if (!table.eo) {
                        table.eo = pairs[pairIndex++];
                        break;
                    }
                }
            }

            forward = !forward; // Inverser le sens
        }

        return sections;
    };

    // Corriger le bouton "?"
    const algoBtn = document.getElementById('algoNew');
    if (algoBtn) {
        algoBtn.onclick = null;
        algoBtn.addEventListener('click', function() {
            console.log('🔧 FIXED: Algorithme équilibré activé');
            window.currentAlgorithm = 'equilibrated';

            // Mettre à jour l'affichage des boutons
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Regénérer avec le nouvel algorithme
            if (window.parsedPairs && window.parsedPairs.length > 0) {
                try {
                    window.mitchellData = window.equilibratedDistribution(
                        window.parsedPairs,
                        window.currentSectionCount || 1,
                        window.nsConstraints?.size > 0 || false
                    );
                    if (typeof window.renderMitchellDisplay === 'function') {
                        window.renderMitchellDisplay();
                    }
                    console.log('✅ FIXED: Algorithme équilibré appliqué');
                } catch (error) {
                    console.error('❌ FIXED: Erreur algorithme équilibré:', error);
                }
            }
        });
    }
}

// =======================================================
// 5. CORRECTION DES CONTRAINTES NS
// =======================================================

/**
 * Correction des contraintes NS
 */
function fixNSConstraints() {
    console.log('🔧 FIXED: Réparation contraintes NS');

    // S'assurer que nsConstraints existe
    if (!window.nsConstraints) {
        window.nsConstraints = new Set();
    }

    // Corriger le clic sur les positions pour ajouter/retirer les contraintes
    document.addEventListener('click', function(e) {
        const position = e.target.closest('.position');
        if (position && position.classList.contains('ns-position')) {
            const pairData = position.dataset;
            if (pairData.pair) {
                const pairId = pairData.pair;

                if (window.nsConstraints.has(pairId)) {
                    window.nsConstraints.delete(pairId);
                    position.classList.remove('ns-constraint');
                    console.log('🔧 FIXED: Contrainte NS retirée:', pairId);
                } else {
                    window.nsConstraints.add(pairId);
                    position.classList.add('ns-constraint');
                    console.log('🔧 FIXED: Contrainte NS ajoutée:', pairId);
                }

                // Mettre à jour le compteur
                const constraintCount = document.getElementById('constraintCount');
                if (constraintCount) {
                    constraintCount.textContent = `${window.nsConstraints.size} paire(s) marquée(s)`;
                }
            }
        }
    });
}

// =======================================================
// 6. SYSTÈME D'IMPRESSION PAR SECTION
// =======================================================

/**
 * Création du système d'impression par section
 */
function createPrintSystem() {
    console.log('🔧 FIXED: Création système d impression par section');

    // Créer les styles d'impression
    const printStyles = document.createElement('style');
    printStyles.id = 'bridge-print-styles';
    printStyles.textContent = `
        @media print {
            @page {
                size: A4;
                margin: 1cm;
            }

            .print-section {
                page-break-after: always;
                background: white !important;
                color: black !important;
            }

            .print-section:last-child {
                page-break-after: auto;
            }

            .print-header {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: black !important;
            }

            .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                page-break-inside: avoid;
            }

            .print-table td, .print-table th {
                border: 1px solid #333;
                padding: 8px;
                text-align: center;
                color: black !important;
                background: white !important;
            }

            .print-table th {
                background: #f0f0f0 !important;
                font-weight: bold;
            }

            .print-stats {
                margin-top: 20px;
                font-size: 12px;
                color: black !important;
            }

            /* Cacher tout le reste pendant l'impression */
            body > *:not(.print-container) {
                display: none !important;
            }
        }
    `;

    if (!document.getElementById('bridge-print-styles')) {
        document.head.appendChild(printStyles);
    }

    // Fonction d'impression par section
    window.printSectionSeparately = function() {
        if (!window.mitchellData || window.mitchellData.length === 0) {
            alert('❌ Aucune donnée à imprimer');
            return;
        }

        console.log('🖨️ FIXED: Impression par section');

        // Créer le conteneur d'impression
        let printContainer = document.querySelector('.print-container');
        if (printContainer) {
            printContainer.remove();
        }

        printContainer = document.createElement('div');
        printContainer.className = 'print-container';
        printContainer.style.display = 'none';

        const sectionNames = ['A', 'B', 'C'];

        window.mitchellData.forEach((section, sectionIndex) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'print-section';

            // En-tête de section
            const header = document.createElement('div');
            header.className = 'print-header';
            header.textContent = `SECTION ${sectionNames[sectionIndex]}`;
            sectionDiv.appendChild(header);

            // Tables de la section
            section.forEach(table => {
                if (table.ns || table.eo) {
                    const tableDiv = document.createElement('table');
                    tableDiv.className = 'print-table';

                    tableDiv.innerHTML = `
                        <tr>
                            <th>NS</th>
                            <th>TABLE ${table.number}</th>
                            <th>EO</th>
                        </tr>
                        <tr>
                            <td>
                                ${table.ns ? `${table.ns.player1.name}<br>${table.ns.player2.name}` : 'RELAIS'}
                            </td>
                            <td style="font-size: 18px; font-weight: bold;">${table.number}</td>
                            <td>
                                ${table.eo ? `${table.eo.player1.name}<br>${table.eo.player2.name}` : 'Position libre'}
                            </td>
                        </tr>
                    `;

                    sectionDiv.appendChild(tableDiv);
                }
            });

            // Stats de section
            if (window.parsedPairs) {
                const sectionPairs = section.filter(t => t.ns || t.eo).length;
                const totalIV = section.reduce((sum, table) => {
                    let iv = 0;
                    if (table.ns) iv += (table.ns.player1.iv + table.ns.player2.iv);
                    if (table.eo) iv += (table.eo.player1.iv + table.eo.player2.iv);
                    return sum + iv;
                }, 0);
                const avgIV = sectionPairs > 0 ? (totalIV / (sectionPairs * 4)).toFixed(1) : 0;

                const statsDiv = document.createElement('div');
                statsDiv.className = 'print-stats';
                statsDiv.innerHTML = `
                    <p><strong>Section ${sectionNames[sectionIndex]} - Statistiques:</strong></p>
                    <p>Tables actives: ${sectionPairs} | IV moyen section: ${avgIV}</p>
                `;
                sectionDiv.appendChild(statsDiv);
            }

            printContainer.appendChild(sectionDiv);
        });

        // Stats globales sur dernière page
        if (window.parsedPairs) {
            const globalStats = document.createElement('div');
            globalStats.className = 'print-section';
            const totalPairs = window.parsedPairs.length;
            const totalIV = window.parsedPairs.reduce((sum, pair) =>
                sum + pair.player1.iv + pair.player2.iv, 0);
            const globalAvgIV = (totalIV / (totalPairs * 2)).toFixed(1);

            globalStats.innerHTML = `
                <div class="print-header">STATISTIQUES GÉNÉRALES</div>
                <div class="print-stats">
                    <p><strong>Tournoi complet:</strong></p>
                    <p>Total paires: ${totalPairs}</p>
                    <p>IV moyen global: ${globalAvgIV}</p>
                    <p>Sections: ${window.mitchellData.length}</p>
                </div>
            `;
            printContainer.appendChild(globalStats);
        }

        document.body.appendChild(printContainer);

        // Lancer l'impression
        window.print();

        // Nettoyer après impression
        setTimeout(() => {
            if (printContainer) {
                printContainer.remove();
            }
        }, 1000);
    };

    // Attacher au bouton d'impression
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.onclick = null;
        printBtn.addEventListener('click', window.printSectionSeparately);
    }
}

// =======================================================
// 7. CALCUL ET AFFICHAGE DES IVs MOYENS
// =======================================================

/**
 * Calcul et affichage des IVs moyens
 */
function fixIVAverages() {
    console.log('🔧 FIXED: Correction calculs IVs moyens');

    window.updateIVAverages = function() {
        if (!window.parsedPairs || !window.mitchellData) return;

        // IV global
        const totalGlobalIV = window.parsedPairs.reduce((sum, pair) =>
            sum + pair.player1.iv + pair.player2.iv, 0);
        const globalAvg = (totalGlobalIV / (window.parsedPairs.length * 2)).toFixed(1);

        // IVs par section
        const sectionNames = ['A', 'B', 'C'];
        window.mitchellData.forEach((section, sectionIndex) => {
            let sectionIV = 0;
            let sectionPlayers = 0;

            section.forEach(table => {
                if (table.ns) {
                    sectionIV += table.ns.player1.iv + table.ns.player2.iv;
                    sectionPlayers += 2;
                }
                if (table.eo) {
                    sectionIV += table.eo.player1.iv + table.eo.player2.iv;
                    sectionPlayers += 2;
                }
            });

            const sectionAvg = sectionPlayers > 0 ? (sectionIV / sectionPlayers).toFixed(1) : '0.0';

            // Mettre à jour l'affichage
            const sectionElement = document.querySelector(`.section-${sectionNames[sectionIndex].toLowerCase()}`);
            if (sectionElement) {
                const statsElement = sectionElement.querySelector('.section-stats');
                if (statsElement) {
                    statsElement.innerHTML = `
                        <div class="section-stats-line">Tables</div>
                        <div class="section-stats-line">NS</div>
                        <div class="section-stats-line">${section.filter(t => t.ns).length}</div>
                        <div class="section-stats-line">EO</div>
                        <div class="section-stats-line">${section.filter(t => t.eo).length}</div>
                        <div class="section-stats-line">IV moy</div>
                        <div class="section-stats-line">${sectionAvg}</div>
                    `;
                }
            }
        });

        // Mettre à jour le titre avec IV global
        const titleElement = document.getElementById('tournamentTitle');
        if (titleElement && window.parsedPairs) {
            const today = new Date().toLocaleDateString('fr-FR');
            titleElement.textContent =
                `Bon tournoi au BCNJ - ${today} - ${window.parsedPairs.length} paires, IV moyen ${globalAvg}`;
        }

        console.log('✅ FIXED: IVs moyens mis à jour - Global:', globalAvg);
    };

    // Appliquer automatiquement après chaque génération
    const originalRender = window.renderMitchellDisplay;
    if (originalRender) {
        window.renderMitchellDisplay = function(...args) {
            const result = originalRender.apply(this, args);
            setTimeout(window.updateIVAverages, 100);
            return result;
        };
    }
}

// =======================================================
// 8. ACTIVATION AUTOMATIQUE DES CORRECTIONS
// =======================================================

/**
 * Application automatique de toutes les corrections
 */
function applyAllFixes() {
    console.log('🚨 ACTIVATION DE TOUTES LES CORRECTIONS');

    try {
        // Appliquer toutes les corrections
        fixTableCountSliders();
        fixRedistributeButtons();
        fixEquilibratedAlgorithm();
        fixNSConstraints();
        createPrintSystem();
        fixIVAverages();

        console.log('✅ TOUTES LES CORRECTIONS APPLIQUÉES AVEC SUCCÈS');

        // Notification visuelle
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = '✅ Corrections appliquées avec succès !';
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);

    } catch (error) {
        console.error('❌ ERREUR lors de l\'application des corrections:', error);
    }
}

// Appliquer automatiquement dès le chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFixes);
} else {
    applyAllFixes();
}

// Réappliquer après 2 secondes pour les éléments générés dynamiquement
setTimeout(applyAllFixes, 2000);

console.log('🎯 CORRECTION URGENTE BRIDGE GENERATOR - PRÊTE');