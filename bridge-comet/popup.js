document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 POPUP LOADED');
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<strong>🟢 Extension chargée!</strong>';

    // Test ultra simple
    document.getElementById('simple').addEventListener('click', () => {
        alert('🎯 EXTENSION FONCTIONNE!');
        console.log('🎯 Bouton simple cliqué');
        resultDiv.innerHTML = '<strong>✅ Test simple OK!</strong>';
    });

    // Bouton d'extraction normal
    document.getElementById('extract').addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const currentTab = tabs[0];

            // Check if we're on the right site
            if (!currentTab.url.includes('ffbridge.fr')) {
                document.getElementById('result').innerHTML =
                    '<strong>❌ Veuillez aller sur une page FFB d\'abord</strong>';
                return;
            }

            // First inject the content script if needed
            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    document.getElementById('result').innerHTML =
                        `<strong>❌ Erreur injection: ${chrome.runtime.lastError.message}</strong>`;
                    return;
                }

                // Now send the message
                chrome.tabs.sendMessage(currentTab.id, {action: 'extract'}, (response) => {
                    if (chrome.runtime.lastError) {
                        document.getElementById('result').innerHTML =
                            `<strong>❌ Erreur: ${chrome.runtime.lastError.message}</strong>`;
                        return;
                    }

                    const resultDiv = document.getElementById('result');
                    if (response && response.success) {
                        console.log('✅ FFB extraction successful:', response.count, 'players');
                        resultDiv.innerHTML = `<strong>✅ ${response.count} joueurs extraits</strong><br>`;

                        // Parse the extracted data and convert to player objects
                        const players = parseExtractedData(response.data);
                        console.log('🔄 Parsed players:', players);

                        if (players.length > 0) {
                            // Open the generator automatically with the data
                            resultDiv.innerHTML = `<strong>⏳ Lancement du générateur...</strong>`;
                            generateBridgeDisplay(players);

                            // Show success message
                            setTimeout(() => {
                                resultDiv.innerHTML = `<strong>🎯 Génération automatique lancée !</strong>`;
                            }, 500);
                        } else {
                            resultDiv.innerHTML = `<strong>❌ Erreur de parsing des données</strong>`;
                        }
                    } else {
                        resultDiv.innerHTML = `<strong>❌ ${response ? response.error : 'Pas de réponse'}</strong>`;
                    }
                });
            });
        });
    });

    // Bouton de test avec données factices
    document.getElementById('test').addEventListener('click', () => {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<strong>🧪 Test avec données factices...</strong>';

        // Données factices pour test
        const fakeData = [
            { name: 'M. WEBER Christian', amount: '5.00', license: '09890171', iv: '76' },
            { name: 'Mme MARTIN Sophie', amount: '6.00', license: '12345678', iv: '84' },
            { name: 'M. DURAND Pierre', amount: '7.50', license: '87654321', iv: '92' },
            { name: 'Mme BERNARD Claire', amount: '5.50', license: '11111111', iv: '68' }
        ];

        console.log('🧪 TEST: Données factices créées:', fakeData);
        resultDiv.innerHTML = '<strong>🔄 Test: stockage des données...</strong>';

        // Vérifier chrome.storage
        if (!chrome || !chrome.storage) {
            resultDiv.innerHTML = '<strong>❌ chrome.storage non disponible!</strong>';
            console.error('❌ chrome.storage non disponible');
            return;
        }

        // Stocker et vérifier
        chrome.storage.local.set({ 'ffbPlayersData': fakeData }, () => {
            if (chrome.runtime.lastError) {
                resultDiv.innerHTML = `<strong>❌ Erreur storage: ${chrome.runtime.lastError.message}</strong>`;
                console.error('❌ Erreur storage:', chrome.runtime.lastError);
                return;
            }

            console.log('✅ Données stockées avec succès');
            resultDiv.innerHTML = '<strong>📖 Vérification du stockage...</strong>';

            // Vérifier la lecture
            chrome.storage.local.get(['ffbPlayersData'], (result) => {
                console.log('🔍 Vérification storage:', result);

                if (result.ffbPlayersData) {
                    console.log('✅ Données vérifiées:', result.ffbPlayersData.length, 'joueurs');
                    resultDiv.innerHTML = '<strong>🚀 Ouverture du générateur...</strong>';

                    // Ouvrir le générateur
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('bridge-section-generator-v2.html')
                    }, (tab) => {
                        if (chrome.runtime.lastError) {
                            resultDiv.innerHTML = `<strong>❌ Erreur ouverture: ${chrome.runtime.lastError.message}</strong>`;
                        } else {
                            console.log('✅ Générateur ouvert, tab ID:', tab.id);
                            resultDiv.innerHTML = '<strong>✅ Test lancé! Vérifiez la console du générateur</strong>';
                        }
                    });
                } else {
                    resultDiv.innerHTML = '<strong>❌ Erreur: données non retrouvées!</strong>';
                    console.error('❌ Données non retrouvées dans storage');
                }
            });
        });
    });
});

function parseExtractedData(rawData) {
    // Parse the formatted text data back to player objects
    const players = [];
    const playerBlocks = rawData.split('\n\n'); // Split by double newlines

    playerBlocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length >= 2) {
            const firstLine = lines[0]; // "M. WEBER Christian (5.00 €)"
            const secondLine = lines[1]; // "09890171 ( IV = 76 )"

            // Extract name and amount from first line
            const nameMatch = firstLine.match(/(M\.|Mme)\s+([^(]+?)\s*\(\s*([0-9.]+)\s*€\)/);
            // Extract license and IV from second line
            const detailsMatch = secondLine.match(/([0-9]{8})\s*\(\s*IV\s*=\s*([0-9]+)\s*\)/);

            if (nameMatch && detailsMatch) {
                players.push({
                    name: nameMatch[1] + ' ' + nameMatch[2].trim(),
                    amount: nameMatch[3],
                    license: detailsMatch[1],
                    iv: detailsMatch[2]
                });
            }
        }
    });

    console.log('🔄 Parsed', players.length, 'players from extracted data');
    return players;
}

function generateBridgeDisplay(players) {
    console.log('🔍 DEBUG: generateBridgeDisplay called with:', players);
    const resultDiv = document.getElementById('result');

    if (!chrome.storage) {
        console.error('❌ chrome.storage not available');
        resultDiv.innerHTML = '<strong>❌ chrome.storage non disponible</strong>';
        return;
    }

    resultDiv.innerHTML = '<strong>💾 Stockage des données...</strong>';

    // Use chrome.storage to pass data (more reliable than injection)
    chrome.storage.local.set({ 'ffbPlayersData': players }, () => {
        if (chrome.runtime.lastError) {
            console.error('❌ Storage error:', chrome.runtime.lastError);
            resultDiv.innerHTML = `<strong>❌ Erreur storage: ${chrome.runtime.lastError.message}</strong>`;
            return;
        }

        console.log('✅ Data stored in chrome.storage, opening generator...');
        resultDiv.innerHTML = '<strong>🚀 Ouverture du générateur...</strong>';

        // Open generator
        chrome.tabs.create({
            url: chrome.runtime.getURL('bridge-section-generator-v2.html')
        }, (tab) => {
            if (chrome.runtime.lastError) {
                console.error('❌ Tab creation error:', chrome.runtime.lastError);
                resultDiv.innerHTML = `<strong>❌ Erreur ouverture: ${chrome.runtime.lastError.message}</strong>`;
            } else {
                console.log('✅ Generator tab opened:', tab.id);
                resultDiv.innerHTML = '<strong>✅ Générateur ouvert !</strong>';
            }
        });
    });
}