/**
 * Angular Data Extractor for Bridge Generator V2
 * Extracts tournament data from Angular applications
 */

class AngularDataExtractor {
    constructor() {
        this.debugMode = false;
        this.extractedData = null;
    }

    log(message, data = null) {
        if (this.debugMode) {
            console.log('[Bridge Angular Extractor]', message, data);
        }
    }

    /**
     * Main extraction method - tries multiple strategies
     */
    extractTournamentData() {
        this.log('Starting Angular data extraction...');

        const strategies = [
            () => this.extractFromAngularScope(),
            () => this.extractFromDOM(),
            () => this.extractFromLocalStorage(),
            () => this.extractFromWindowVariables(),
            () => this.extractFromNetworkCalls()
        ];

        for (let i = 0; i < strategies.length; i++) {
            try {
                const result = strategies[i]();
                if (result && result.length > 0) {
                    this.log(`Extraction successful with strategy ${i + 1}`, result);
                    this.extractedData = result;
                    return this.formatForBridgeGenerator(result);
                }
            } catch (error) {
                this.log(`Strategy ${i + 1} failed:`, error);
            }
        }

        this.log('No data extraction strategy succeeded');
        return null;
    }

    /**
     * Extract from Angular scope/component data
     */
    extractFromAngularScope() {
        this.log('Trying Angular scope extraction...');

        // Try to find Angular elements
        const ngElements = document.querySelectorAll('[ng-app], [data-ng-app], .ng-scope, [ng-controller]');

        for (let element of ngElements) {
            try {
                // Angular 1.x
                if (window.angular) {
                    const scope = window.angular.element(element).scope();
                    if (scope) {
                        const data = this.searchInScope(scope);
                        if (data) return data;
                    }
                }

                // Angular 2+ (try to find component data)
                if (element.__ngContext__ || element.ngModel) {
                    const componentData = this.extractFromModernAngular(element);
                    if (componentData) return componentData;
                }
            } catch (error) {
                this.log('Error extracting from element:', error);
            }
        }

        return null;
    }

    /**
     * Search recursively in Angular scope for tournament data
     */
    searchInScope(scope, visited = new Set()) {
        if (!scope || visited.has(scope)) return null;
        visited.add(scope);

        const playerKeywords = ['player', 'participant', 'joueur', 'pair', 'team', 'equipe'];
        const tournamentKeywords = ['tournament', 'tournoi', 'competition', 'match', 'game'];

        for (let key in scope) {
            if (key.startsWith('$') || typeof scope[key] === 'function') continue;

            const value = scope[key];

            // Check if this looks like tournament/player data
            if (Array.isArray(value) && value.length > 0) {
                const firstItem = value[0];
                if (this.looksLikeTournamentData(firstItem)) {
                    this.log('Found potential tournament data in scope:', key);
                    return value;
                }
            }

            // Recursive search in objects
            if (typeof value === 'object' && value !== null) {
                const nested = this.searchInScope(value, visited);
                if (nested) return nested;
            }
        }

        // Search parent scope
        if (scope.$parent && !visited.has(scope.$parent)) {
            return this.searchInScope(scope.$parent, visited);
        }

        return null;
    }

    /**
     * Extract from modern Angular (2+) components
     */
    extractFromModernAngular(element) {
        this.log('Trying modern Angular extraction...');

        // Try to access component instance
        try {
            // Angular debugging utilities
            if (window.ng && window.ng.getComponent) {
                const component = window.ng.getComponent(element);
                if (component) {
                    return this.searchInObject(component);
                }
            }

            // Try to find Angular context
            if (element.__ngContext__) {
                return this.searchInObject(element.__ngContext__);
            }
        } catch (error) {
            this.log('Modern Angular extraction failed:', error);
        }

        return null;
    }

    /**
     * Extract from DOM elements (tables, lists, etc.)
     */
    extractFromDOM() {
        this.log('Trying DOM extraction...');

        const players = [];

        // Look for table structures
        const tables = document.querySelectorAll('table');
        for (let table of tables) {
            const tableData = this.extractFromTable(table);
            if (tableData && tableData.length > 0) {
                return tableData;
            }
        }

        // Look for list structures
        const lists = document.querySelectorAll('ul, ol, .list, .players, .participants');
        for (let list of lists) {
            const listData = this.extractFromList(list);
            if (listData && listData.length > 0) {
                return listData;
            }
        }

        // Look for card/div structures
        const cards = document.querySelectorAll('.card, .player, .participant, .item');
        if (cards.length > 2) {
            const cardData = this.extractFromCards(cards);
            if (cardData && cardData.length > 0) {
                return cardData;
            }
        }

        return null;
    }

    /**
     * Extract from table structure
     */
    extractFromTable(table) {
        const rows = table.querySelectorAll('tr');
        if (rows.length < 2) return null; // Need at least header + 1 data row

        // Check if this is a FFB tournament table
        if (this.isFFBTournamentTable(table)) {
            return this.extractFromFFBTable(table);
        }

        const players = [];

        for (let i = 1; i < rows.length; i++) { // Skip header
            const cells = rows[i].querySelectorAll('td, th');
            if (cells.length < 2) continue;

            const player = this.extractPlayerFromCells(cells);
            if (player) {
                players.push(player);
            }
        }

        return players.length > 0 ? players : null;
    }

    /**
     * Check if table is a FFB tournament table
     */
    isFFBTournamentTable(table) {
        const headers = table.querySelectorAll('th');
        const headerText = Array.from(headers).map(h => h.textContent.toLowerCase()).join(' ');

        console.log('🔍 Extension - test table FFB:', headerText);

        const hasInscription = headerText.includes('inscription');
        const hasJoueur = headerText.includes('joueur');
        const hasCell = table.querySelector('tbody tr td');
        const hasDate = hasCell && hasCell.textContent.includes('/2026');

        console.log('🔍 Extension - inscription:', hasInscription, 'joueur:', hasJoueur, 'date:', hasDate);

        // Look for FFB specific headers
        return hasInscription && hasJoueur && hasCell && hasDate;
    }

    /**
     * Extract specifically from FFB tournament table
     */
    extractFromFFBTable(table) {
        this.log('Extracting from FFB tournament table...');

        const rows = table.querySelectorAll('tbody tr');
        const players = [];

        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) continue; // Need inscription + 2 players minimum

            // Extract player 1 (usually in cell 1)
            if (cells[1]) {
                const player1 = this.extractFFBPlayer(cells[1]);
                if (player1) players.push(player1);
            }

            // Extract player 2 (usually in cell 2)
            if (cells[2]) {
                const player2 = this.extractFFBPlayer(cells[2]);
                if (player2) players.push(player2);
            }
        }

        this.log('FFB extraction found players:', players);
        return players.length > 0 ? players : null;
    }

    /**
     * Extract player from FFB cell format
     */
    extractFFBPlayer(cell) {
        const rawText = cell.textContent.trim();
        // Nettoyer les données : supprimer tous les \n suivis d'espaces (comme dans bridge-comet)
        const cleanedText = rawText.replace(/\n\s+/g, ' ').replace(/\s+/g, ' ');
        console.log('🔍 Extension - cellule FFB brute:', rawText.substring(0, 100));
        console.log('🔍 Extension - cellule FFB nettoyée:', cleanedText.substring(0, 100));
        if (!cleanedText || cleanedText === '') return null;

        // FFB format pattern:
        // M./Mme NAME Firstname ( amount € )
        // license number
        // ( IV = value )

        const lines = cleanedText.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) return null;

        let name = null;
        let amount = null;
        let license = null;
        let iv = null;

        for (let line of lines) {
            console.log('🔍 Extension - ligne brute:', line);
            window.extractionLogger?.log('Ligne brute angular-extractor', line);

            // Check for name and amount - capture tout avant la dernière parenthèse avec montant
            const nameMatch = line.match(/^(M\.|Mme)\s+(.+?)\s+\(\s*(\d+(?:\.\d{2})?)\s*€\s*\)$/i);

            // Si ça ne marche pas, essayer une approche différente
            if (!nameMatch) {
                // Chercher le montant et extraire tout ce qui précède
                const amountAtEnd = line.match(/^(M\.|Mme)\s+(.+)\s+\(\s*(\d+(?:\.\d{2})?)\s*€\s*\)$/i);
                if (amountAtEnd) {
                    console.log('🔍 Extension - match alternatif réussi:', amountAtEnd);
                    const title = amountAtEnd[1];
                    const fullNameAndFirstName = amountAtEnd[2].trim();
                    amount = parseFloat(amountAtEnd[3]);
                    name = fullNameAndFirstName;
                    window.extractionLogger?.log('Nom trouvé angular-extractor (alternatif)', { title, name, amount });
                    continue;
                }
            }
            if (nameMatch) {
                const title = nameMatch[1];
                const fullNameAndFirstName = nameMatch[2].trim();
                amount = parseFloat(nameMatch[3]);
                name = fullNameAndFirstName; // Garder le nom complet sans titre
                window.extractionLogger?.log('Nom trouvé angular-extractor', { title, name, amount });
                continue;
            }

            // Check for license number (8 digits)
            const licenseMatch = line.match(/^(\d{8})$/);
            if (licenseMatch) {
                license = licenseMatch[1];
                continue;
            }

            // Check for IV value
            const ivMatch = line.match(/\(\s*IV\s*=\s*(\d+)\s*\)/);
            if (ivMatch) {
                iv = parseInt(ivMatch[1]);
                continue;
            }
        }

        if (name) {
            return { name, amount, license, iv };
        }

        return null;
    }

    /**
     * Extract player data from table cells
     */
    extractPlayerFromCells(cells) {
        const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());

        // Look for name pattern
        const namePattern = /^(M\.|Mme|Mr|Mrs)?\s*(.+?)(?:\s*\(.*\))?$/;
        let name = null;
        let amount = null;
        let license = null;
        let iv = null;

        for (let text of cellTexts) {
            // Check for name
            if (!name && namePattern.test(text) && !text.match(/^\d+$/)) {
                name = text;
            }

            // Check for amount (euros)
            const amountMatch = text.match(/(\d+(?:\.\d{2})?)\s*€/);
            if (amountMatch && !amount) {
                amount = parseFloat(amountMatch[1]);
            }

            // Check for license number
            const licenseMatch = text.match(/(\d{8})/);
            if (licenseMatch && !license) {
                license = licenseMatch[1];
            }

            // Check for IV
            const ivMatch = text.match(/IV\s*=?\s*(\d+)/);
            if (ivMatch && !iv) {
                iv = parseInt(ivMatch[1]);
            }
        }

        if (name) {
            return { name, amount, license, iv };
        }

        return null;
    }

    /**
     * Extract from list structure
     */
    extractFromList(list) {
        const items = list.querySelectorAll('li, .item, .player');
        const players = [];

        for (let item of items) {
            const player = this.extractPlayerFromElement(item);
            if (player) {
                players.push(player);
            }
        }

        return players.length > 0 ? players : null;
    }

    /**
     * Extract from card-like structures
     */
    extractFromCards(cards) {
        const players = [];

        for (let card of cards) {
            const player = this.extractPlayerFromElement(card);
            if (player) {
                players.push(player);
            }
        }

        return players.length > 0 ? players : null;
    }

    /**
     * Extract player data from any DOM element
     */
    extractPlayerFromElement(element) {
        const text = element.textContent;

        // Look for name pattern
        const nameMatch = text.match(/(M\.|Mme|Mr|Mrs)?\s*([A-Z][a-zA-Z\s]+?)(?:\s*\(|\s*\d|\s*€|$)/);
        const amountMatch = text.match(/(\d+(?:\.\d{2})?)\s*€/);
        const licenseMatch = text.match(/(\d{8})/);
        const ivMatch = text.match(/IV\s*=?\s*(\d+)/);

        if (nameMatch && nameMatch[2]) {
            return {
                name: (nameMatch[1] || '') + ' ' + nameMatch[2].trim(),
                amount: amountMatch ? parseFloat(amountMatch[1]) : null,
                license: licenseMatch ? licenseMatch[1] : null,
                iv: ivMatch ? parseInt(ivMatch[1]) : null
            };
        }

        return null;
    }

    /**
     * Extract from localStorage
     */
    extractFromLocalStorage() {
        this.log('Trying localStorage extraction...');

        const keys = Object.keys(localStorage);
        const relevantKeys = keys.filter(key =>
            key.toLowerCase().includes('tournament') ||
            key.toLowerCase().includes('player') ||
            key.toLowerCase().includes('participant') ||
            key.toLowerCase().includes('bridge') ||
            key.toLowerCase().includes('tournoi') ||
            key.toLowerCase().includes('joueur')
        );

        for (let key of relevantKeys) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data) && data.length > 0) {
                    const firstItem = data[0];
                    if (this.looksLikeTournamentData(firstItem)) {
                        this.log('Found tournament data in localStorage:', key);
                        return data;
                    }
                }
            } catch (error) {
                // Not JSON, skip
            }
        }

        return null;
    }

    /**
     * Extract from window variables
     */
    extractFromWindowVariables() {
        this.log('Trying window variables extraction...');

        const searchTerms = ['tournament', 'players', 'participants', 'bridge', 'tournoi', 'joueurs', 'data'];

        for (let term of searchTerms) {
            if (window[term] && Array.isArray(window[term])) {
                const data = window[term];
                if (data.length > 0 && this.looksLikeTournamentData(data[0])) {
                    this.log('Found tournament data in window variable:', term);
                    return data;
                }
            }
        }

        return null;
    }

    /**
     * Monitor network calls for data
     */
    extractFromNetworkCalls() {
        this.log('Setting up network monitoring...');
        // This would require intercepting XHR/fetch calls
        // Implementation would depend on specific application
        return null;
    }

    /**
     * Check if object looks like tournament/player data
     */
    looksLikeTournamentData(item) {
        if (!item || typeof item !== 'object') return false;

        const hasPlayerFields = ['name', 'nom', 'player', 'joueur'].some(field =>
            Object.keys(item).some(key => key.toLowerCase().includes(field))
        );

        const hasGameFields = ['score', 'points', 'iv', 'license', 'licence', 'amount', 'montant'].some(field =>
            Object.keys(item).some(key => key.toLowerCase().includes(field))
        );

        return hasPlayerFields || hasGameFields;
    }

    /**
     * Search recursively in any object
     */
    searchInObject(obj, visited = new Set()) {
        if (!obj || visited.has(obj) || typeof obj !== 'object') return null;
        visited.add(obj);

        for (let key in obj) {
            if (typeof obj[key] === 'function') continue;

            const value = obj[key];

            if (Array.isArray(value) && value.length > 0) {
                if (this.looksLikeTournamentData(value[0])) {
                    this.log('Found tournament data in object:', key);
                    return value;
                }
            }

            if (typeof value === 'object' && value !== null) {
                const nested = this.searchInObject(value, visited);
                if (nested) return nested;
            }
        }

        return null;
    }

    /**
     * Format extracted data for Bridge Generator
     */
    formatForBridgeGenerator(data) {
        if (!Array.isArray(data)) return '';

        let formatted = '';
        let pairNumber = 1;

        for (let i = 0; i < data.length; i += 2) {
            const player1 = data[i];
            const player2 = data[i + 1];

            if (player1) {
                formatted += this.formatPlayer(player1) + '\n';
                if (player1.license && player1.iv) {
                    formatted += `${player1.license} ( IV = ${player1.iv} )\n`;
                }
            }

            if (player2) {
                formatted += this.formatPlayer(player2) + '\n';
                if (player2.license && player2.iv) {
                    formatted += `${player2.license} ( IV = ${player2.iv} )\n`;
                }
            }

            if (i + 2 < data.length) {
                formatted += '\n'; // Separate pairs
            }
        }

        return formatted.trim();
    }

    /**
     * Format single player
     */
    formatPlayer(player) {
        let name = player.name || player.nom || player.player || player.joueur || 'Joueur Inconnu';
        let amount = player.amount || player.montant || 0;

        // Ensure name has title
        if (!name.match(/^(M\.|Mme|Mr|Mrs)/)) {
            name = 'M. ' + name;
        }

        return `${name} (${amount.toFixed(2)} €)`;
    }

    /**
     * Enable debug mode
     */
    enableDebug() {
        this.debugMode = true;
    }

    /**
     * Get extraction results
     */
    getLastExtraction() {
        return this.extractedData;
    }
}

// Make available globally
window.AngularDataExtractor = AngularDataExtractor;