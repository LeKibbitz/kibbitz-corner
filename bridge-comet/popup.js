document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('extract').addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'extract'}, (response) => {
                if (chrome.runtime.lastError) {
                    document.getElementById('result').innerHTML =
                        `<strong>❌ Erreur: ${chrome.runtime.lastError.message}</strong>`;
                    return;
                }

                document.getElementById('result').innerHTML =
                    response && response.success ?
                    `<strong>✅ ${response.count} joueurs extraits</strong><br><textarea style="width:100%;height:100px">${response.data}</textarea>` :
                    `<strong>❌ ${response ? response.error : 'Pas de réponse'}</strong>`;
            });
        });
    });
});