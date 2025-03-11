class GameStorage {
    constructor() {
        this.storageKey = 'chess_game_history';
    }

    saveGame(game) {
        const gameHistory = this.getGameHistory();
        
        const gameData = {
            id: Date.now(),
            date: new Date().toISOString(),
            pgn: game.chess.pgn(),
            result: game.result,
            moves: game.moveHistory,
            playerColor: game.playerColor  // Make sure we save the player color
        };
        
        gameHistory.push(gameData);
        
        // Keep only the last 10 games
        if (gameHistory.length > 10) {
            gameHistory.shift();
        }
        
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
