class ChessBot {
    constructor(level = 'medium') {
        this.level = level;
        this.thinkingTime = {
            'easy': 0,
            'medium': 0,
            'hard': 0
        };
    }

    setLevel(level) {
        this.level = level;
    }

    async getMove(game) {
        // Simulate "thinking" time
        await new Promise(resolve => setTimeout(resolve, this.thinkingTime[this.level]));
        
        const possibleMoves = this.getAllPossibleMoves(game);
        
        if (possibleMoves.length === 0) {
            return null;
        }

        // Easy: Random move
        if (this.level === 'easy') {
            return this.getRandomMove(possibleMoves);
        }
        
        // Medium: Prefer captures and checks
        if (this.level === 'medium') {
            return this.getMediumLevelMove(game, possibleMoves);
        }
        
        // Hard: Evaluate positions and choose best
        return this.getHardLevelMove(game, possibleMoves);
    }

    getAllPossibleMoves(game) {
        const moves = [];
        const chess = game.chess;
        
        const possibleMoves = chess.moves({ verbose: true });
        return possibleMoves;
    }

    getRandomMove(possibleMoves) {
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        return possibleMoves[randomIndex];
    }

    getMediumLevelMove(game, possibleMoves) {
        // Prefer captures and checks
        const captureMoves = possibleMoves.filter(move => move.flags.includes('c'));
        const checkMoves = possibleMoves.filter(move => move.flags.includes('ch'));
        
        if (checkMoves.length > 0) {
            return this.getRandomMove(checkMoves);
        }
        
        if (captureMoves.length > 0) {
            return this.getRandomMove(captureMoves);
        }
        
        return this.getRandomMove(possibleMoves);
    }

    getHardLevelMove(game, possibleMoves) {
        // Simple move evaluation - can be expanded with more sophisticated evaluation
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (const move of possibleMoves) {
            const scoreForMove = this.evaluateMove(game, move);
            
            if (scoreForMove > bestScore) {
                bestScore = scoreForMove;
                bestMove = move;
            }
        }
        
        return bestMove || this.getRandomMove(possibleMoves);
    }

    evaluateMove(game, move) {
        let score = 0;
        
        // Piece values
        const pieceValues = {
            'p': 1, 
            'n': 3, 
            'b': 3, 
            'r': 5, 
            'q': 9, 
            'k': 0
        };
        
        // Capture value
        if (move.flags.includes('c')) {
            score += pieceValues[move.captured];
        }
        
        // Check gives a bonus
        if (move.flags.includes('ch')) {
            score += 0.5;
        }
        
        // Center control for pawns and knights
        if (move.piece === 'p' || move.piece === 'n') {
            const col = move.to.charCodeAt(0) - 'a'.charCodeAt(0);
            const row = 8 - parseInt(move.to[1]);
            
            if (col >= 2 && col <= 5 && row >= 2 && row <= 5) {
                score += 0.2;
            }
        }
        
        return score;
    }
}
