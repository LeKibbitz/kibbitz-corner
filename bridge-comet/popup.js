document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 POPUP LOADED');
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<strong>🟢 Extension chargée!</strong>';

    // Bouton d'extraction principal
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

    resultDiv.innerHTML = '<strong>🚀 Ouverture du générateur...</strong>';

    // Encode players data as URL parameter (more reliable than chrome.storage)
    const encodedData = encodeURIComponent(JSON.stringify(players));
    const generatorUrl = chrome.runtime.getURL('bridge-section-generator-v2.html') + '?data=' + encodedData;

    console.log('🔗 Opening generator with URL params, data length:', encodedData.length);

    // Open generator with data in URL
    chrome.tabs.create({
        url: generatorUrl
    }, (tab) => {
        if (chrome.runtime.lastError) {
            console.error('❌ Tab creation error:', chrome.runtime.lastError);
            resultDiv.innerHTML = `<strong>❌ Erreur ouverture: ${chrome.runtime.lastError.message}</strong>`;
        } else {
            console.log('✅ Generator tab opened:', tab.id);
            resultDiv.innerHTML = '<strong>✅ Générateur ouvert !</strong>';
        }
    });
}