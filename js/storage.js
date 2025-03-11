class GameStorage {
    constructor() {
        this.storageKey = 'chess_game_history';
    }

    saveGame(game) {
        const gameHistory = this.getGameHistory();
        
        // Determine the moves to save (prefer moveHistory if it exists, fall back to moves)
        const movesToSave = Array.isArray(game.moveHistory) ? game.moveHistory : 
                          (Array.isArray(game.moves) ? game.moves : []);
        
        const gameData = {
            id: Date.now(),
            date: new Date().toISOString(),
            // Handle both formats - either game.pgn (direct property) or game.chess.pgn() (method call)
            pgn: typeof game.pgn === 'string' ? game.pgn : (game.chess && typeof game.chess.pgn === 'function' ? game.chess.pgn() : ''),
            result: game.result,
            // Store moves in both properties for backwards compatibility
            moves: movesToSave,
            moveHistory: movesToSave,
            playerColor: game.playerColor  // Make sure we save the player color
        };
        
        gameHistory.push(gameData);
        
        // Keep only the last 10 games
        if (gameHistory.length > 10) {
            gameHistory.shift();
        }
        
        // Log what we're saving for debugging
        console.log("Saving game data:", {
            result: gameData.result,
            movesCount: movesToSave.length,
            playerColor: gameData.playerColor
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(gameHistory));
        return gameData.id;
    }

    getGameHistory() {
        const history = localStorage.getItem(this.storageKey);
        return history ? JSON.parse(history) : [];
    }

    getGame(id) {
        const gameHistory = this.getGameHistory();
        return gameHistory.find(game => game.id === id) || null;
    }

    getLastGame() {
        const gameHistory = this.getGameHistory();
        return gameHistory.length > 0 ? gameHistory[gameHistory.length - 1] : null;
    }

    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }
}
