class ChessGame {
    constructor() {
        this.chess = new Chess();  // Uses the chess.js library
        this.board = null;
        this.timer = null;
        this.bot = null;
        this.storage = null;
        this.playerColor = 'white';
        this.botColor = 'black';
        this.gameActive = false;
        this.moveHistory = [];
        this.result = null;
        this.callbacks = {};
    }

    init(board, timer, bot, storage) {
        this.board = board;
        this.timer = timer;
        this.bot = bot;
        this.storage = storage;
        
        this.registerEventHandlers();
    }

    registerEventHandlers() {
        if (this.board) {
            this.board.on('onMove', (move) => this.handleMove(move));
            this.board.on('onPromotion', (move) => this.handlePromotion(move));
        }
        
        if (this.timer) {
            this.timer.on('onTimeout', (color) => this.handleTimeout(color));
        }
    }

    start(playerColor = 'white', timeInMinutes = 10, botLevel = 'medium') {
        this.chess.reset();
        this.playerColor = playerColor;
        this.botColor = playerColor === 'white' ? 'black' : 'white';
        this.gameActive = true;
        this.moveHistory = [];
        this.result = null;
        
        // Initialize components
        this.timer.init(timeInMinutes);
        this.bot.setLevel(botLevel);
        this.board.init(this, playerColor === 'black');
        
        // Notify that move history has been reset
        if (this.callbacks.onMovesUpdate) {
            this.callbacks.onMovesUpdate();
        }
        
        // Start timer if player goes first
        if (this.getCurrentPlayer() === this.playerColor) {
            this.timer.start(this.getCurrentPlayer());
        } else {
            this.makeBotMove();
        }
        
        this.updateStatus();
    }

    // Combine position conversion utilities into a single utility object
    positions = {
        toAlgebraic: (position) => {
            const file = String.fromCharCode(97 + position.col);
            const rank = 8 - position.row;
            return file + rank;
        },
        
        toObject: (algebraic) => {
            const col = algebraic.charCodeAt(0) - 97;
            const row = 8 - parseInt(algebraic[1]);
            return { row, col };
        }
    }

    getCurrentPlayer() {
        return this.chess.turn() === 'w' ? 'white' : 'black';
    }

    getPiece(position) {
        const piece = this.chess.get(this.positions.toAlgebraic(position));
        if (!piece) return null;
        
        return {
            type: piece.type,
            color: piece.color === 'w' ? 'white' : 'black'
        };
    }

    getValidMoves(position) {
        const moves = this.chess.moves({
            square: this.positions.toAlgebraic(position),
            verbose: true
        });
        
        return moves.map(move => ({
            from: this.positions.toObject(move.from),
            to: this.positions.toObject(move.to)
        }));
    }

    makeMove(from, to, promotionPiece = 'q') {
        const moveObj = {
            from: this.positions.toAlgebraic(from),
            to: this.positions.toAlgebraic(to),
            promotion: promotionPiece
        };
        
        try {
            const move = this.chess.move(moveObj);
            if (move) {
                // Record move in history
                this.moveHistory.push(move);
                
                // Notify about move history update
                if (this.callbacks.onMovesUpdate) {
                    this.callbacks.onMovesUpdate();
                }
                
                // Determine which sound to play
                if (this.callbacks.onSoundPlay) {
                    if (move.flags.includes('c')) {
                        this.callbacks.onSoundPlay('capture');
                    } else if (move.flags.includes('k') || move.flags.includes('q')) {
                        this.callbacks.onSoundPlay('castling');
                    } else if (move.flags.includes('p')) {
                        this.callbacks.onSoundPlay('promotion');
                    } else {
                        this.callbacks.onSoundPlay('move');
                    }
                    
                    // Check for check or checkmate
                    if (this.chess.in_checkmate()) {
                        this.callbacks.onSoundPlay('checkmate');
                    } else if (this.chess.in_check()) {
                        this.callbacks.onSoundPlay('check');
                    } else if (this.chess.in_stalemate()) {
                        this.callbacks.onSoundPlay('stalemate');
                    }
                }
                
                // Update board and switch timer
                this.board.updateBoard(this);
                this.timer.switchTimer();
                this.timer.start(this.getCurrentPlayer());
                
                // Check for game end
                if (this.isGameOver()) {
                    this.endGame();
                    return true;
                }
                
                // If it's bot's turn, make a bot move
                if (this.getCurrentPlayer() === this.botColor) {
                    setTimeout(() => this.makeBotMove(), 300);
                }
                
                this.updateStatus();
                return true;
            }
        } catch (e) {
            console.error('Invalid move:', e);
        }
        
        return false;
    }

    // New method to check if a move would result in promotion
    isPromotion(from, to) {
        const piece = this.chess.get(this.positions.toAlgebraic(from));
        return piece && 
               piece.type === 'p' && 
               ((piece.color === 'w' && to.row === 0) || 
                (piece.color === 'b' && to.row === 7));
    }

    async makeBotMove() {
        if (!this.gameActive || this.getCurrentPlayer() !== this.botColor) {
            return;
        }
        
        const move = await this.bot.getMove(this);
        if (move) {
            const from = this.positions.toObject(move.from);
            const to = this.positions.toObject(move.to);
            this.makeMove(from, to);
        }
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) return false;
        
        // Undo both player and bot moves
        this.chess.undo();
        if (this.moveHistory.length > 0) {
            this.chess.undo();
        }
        
        // Update move history
        this.moveHistory.pop();
        if (this.moveHistory.length > 0) {
            this.moveHistory.pop();
        }
        
        // Notify about move history update
        if (this.callbacks.onMovesUpdate) {
            this.callbacks.onMovesUpdate();
        }
        
        // Update board
        this.board.updateBoard(this);
        this.timer.stop();
        this.timer.start(this.getCurrentPlayer());
        this.updateStatus();
        
        return true;
    }

    isGameOver() {
        return this.chess.game_over();
    }

    endGame() {
        this.gameActive = false;
        this.timer.stop();
        
        if (this.chess.in_checkmate()) {
            const winner = this.chess.turn() === 'w' ? 'black' : 'white';
            this.result = `${winner} wins by checkmate`;
        } else if (this.chess.in_draw()) {
            this.result = 'Game ends in draw';
            
            if (this.chess.in_stalemate()) {
                this.result += ' by stalemate';
            } else if (this.chess.insufficient_material()) {
                this.result += ' by insufficient material';
            } else if (this.chess.in_threefold_repetition()) {
                this.result += ' by threefold repetition';
            }
        }
        
        // Play game end sound if callback exists
        if (this.callbacks.onSoundPlay) {
            this.callbacks.onSoundPlay('checkmate'); // or another appropriate sound
        }
        
        // Save game to storage
        if (this.storage) {
            this.storage.saveGame(this);
        }
        
        if (this.callbacks.onGameEnd) {
            this.callbacks.onGameEnd(this.result);
        }
        
        this.updateStatus();
    }

    handleTimeout(color) {
        this.gameActive = false;
        const winner = color === 'white' ? 'black' : 'white';
        this.result = `${winner} wins on time`;
        
        if (this.callbacks.onGameEnd) {
            this.callbacks.onGameEnd(this.result);
        }
    }

    handleMove(move) {
        if (!this.gameActive) return;
        
        this.makeMove(move.from, move.to, move.promotion);
    }

    // New method to handle promotion
    handlePromotion(move) {
        if (!this.gameActive) return;
        
        this.makeMove(move.from, move.to, move.promotion);
    }

    updateStatus() {
        let status = '';
        
        if (this.result) {
            status = this.result;
        } else {
            status = `${this.getCurrentPlayer().charAt(0).toUpperCase() + this.getCurrentPlayer().slice(1)} to move`;
            
            if (this.chess.in_check()) {
                status += ' (Check)';
            }
        }
        
        if (this.callbacks.onStatusUpdate) {
            this.callbacks.onStatusUpdate(status);
        }
    }

    resign() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        this.timer.stop();
        
        const winner = this.playerColor === 'white' ? 'black' : 'white';
        this.result = `${winner} wins by resignation`;
        
        if (this.callbacks.onGameEnd) {
            this.callbacks.onGameEnd(this.result);
        }
        
        this.updateStatus();
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    // Replace the old utility methods with the new ones from positions object
    algebraicPosition(position) {
        return this.positions.toAlgebraic(position);
    }

    objectPosition(algebraic) {
        return this.positions.toObject(algebraic);
    }

    // New method to get the player's color
    getPlayerColor() {
        return this.playerColor;
    }
    
    // When saving the game, ensure we include player color
    saveGameState() {
        if (this.callbacks.onSaveGame) {
            this.callbacks.onSaveGame({
                result: this.result,
                moves: this.moveHistory,
                pgn: this.chess.pgn(),
                playerColor: this.playerColor
            });
        }
    }
}
