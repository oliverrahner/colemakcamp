// Stats Management Module
// Handles recording and retrieving game statistics

const StatsManager = {
    STORAGE_KEY: 'stats',
    MAX_STATS: 100, // Keep last 100 games
    
    // Save a completed game's stats
    saveGameStats: function(statsData) {
        try {
            // Get existing stats structure or initialize
            let statsStructure = this._getStatsStructure();
            
            // Add new stat entry
            statsStructure.data.unshift(statsData); // Add to beginning
            
            // Keep only last MAX_STATS entries
            if (statsStructure.data.length > this.MAX_STATS) {
                statsStructure.data = statsStructure.data.slice(0, this.MAX_STATS);
            }
            
            // Save to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(statsStructure));
            
            return true;
        } catch (e) {
            console.error('Error saving stats:', e);
            return false;
        }
    },
    
    // Internal: Get stats structure with version, migrating old format if needed
    _getStatsStructure: function() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return { version: 1, data: [] };
            }
            
            const parsed = JSON.parse(stored);
            
            // Check if it's old format (array) and migrate
            if (Array.isArray(parsed)) {
                console.log('Migrating stats from old format to new format');
                // Remove version field from individual records if it exists
                const migratedData = parsed.map(stat => {
                    const { version, ...rest } = stat;
                    return rest;
                });
                return { version: 1, data: migratedData };
            }
            
            // Already new format
            return parsed;
        } catch (e) {
            console.error('Error getting stats structure:', e);
            return { version: 1, data: [] };
        }
    },
    
    // Get all saved stats
    getAllStats: function() {
        const structure = this._getStatsStructure();
        return structure.data;
    },
    
    // Clear all stats
    clearAllStats: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Error clearing stats:', e);
            return false;
        }
    },
    
    // Get stats filtered by type (sentence/words)
    getStatsByType: function(type) {
        const allStats = this.getAllStats();
        return allStats.filter(stat => stat.gameType === type);
    },
    
    // Get stats filtered by mode (time/word)
    getStatsByMode: function(mode) {
        const allStats = this.getAllStats();
        return allStats.filter(stat => stat.gameMode === mode);
    },
    
    // Create a stats object from current game state
    createStatsObject: function(gameData) {
        return {
            timestamp: new Date().toISOString(),
            gameType: gameData.fullSentenceMode ? 'sentence' : 'words',
            gameMode: gameData.timeLimitMode ? 'time-based' : 'word-based',
            settings: {
                level: gameData.level,
                layout: gameData.layout,
                keyboard: gameData.keyboard,
                language: gameData.language,
                capitalLettersAllowed: !gameData.onlyLower,
                nonLatinLetters: gameData.nonLatin,
                punctuation: gameData.punctuation,
                backspaceCorrection: gameData.requireBackspaceCorrection,
                wordScrollingMode: gameData.wordScrollingMode,
                showCheatsheet: gameData.showCheatsheet,
                playSoundOnClick: gameData.playSoundOnClick,
                playSoundOnError: gameData.playSoundOnError,
                keyRemapping: gameData.keyRemapping
            },
            performance: {
                wpm: parseFloat(gameData.wpm),
                accuracy: parseFloat(gameData.accuracy),
                time: gameData.time, // in seconds
                words: gameData.wordsTyped,
                wordsTyped: gameData.wordsTyped,
                correctKeystrokes: gameData.correctKeystrokes,
                errors: gameData.errors
            }
        };
    }
};
