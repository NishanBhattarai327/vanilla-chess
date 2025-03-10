class ChessBoard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedSquare = null;
        this.flipped = false;
        this.pieceImages = {
            'wP': 'img/wP.svg', 'wR': 'img/wR.svg', 'wN': 'img/wN.svg',
            'wB': 'img/wB.svg', 'wQ': 'img/wQ.svg', 'wK': 'img/wK.svg',
            'bP': 'img/bP.svg', 'bR': 'img/bR.svg', 'bN': 'img/bN.svg',
            'bB': 'img/bB.svg', 'bQ': 'img/bQ.svg', 'bK': 'img/bK.svg'
        };
        this.callbacks = {};
        this.validMoves = [];
        this.gameRef = null; // Add this line to store a reference to the game
    }

    // Initialize the board with pieces
    init(game, flipped = false) {
        this.container.innerHTML = '';
        this.flipped = flipped;
        this.gameRef = game; // Store the game reference
        
        // Create the outer wrapper for the board and notation
        const boardWrapper = document.createElement('div');
        boardWrapper.classList.add('chessboard');
        this.container.appendChild(boardWrapper);
        
        // Create squares container
        const squaresContainer = document.createElement('div');
        squaresContainer.classList.add('squares-container');
        boardWrapper.appendChild(squaresContainer);
        
        this.createSquares(squaresContainer);
        this.updateBoard(game);
    }

    createSquares(squaresContainer) {
        const fragment = document.createDocumentFragment();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const actualRow = this.flipped ? 7 - row : row;
                const actualCol = this.flipped ? 7 - col : col;
                const squareColor = (actualRow + actualCol) % 2 === 0 ? 'white' : 'black';
                const square = document.createElement('div');
                
                // Add rank number to the first column
                if (col === 0) {
                    const rankIndicator = document.createElement('span');
                    rankIndicator.classList.add('rank-indicator');
                    rankIndicator.textContent = (8 - actualRow).toString();
                    square.appendChild(rankIndicator);
                }
                // Add file letter to the last row
                if (row === 7) {
                    const fileIndicator = document.createElement('span');
                    fileIndicator.classList.add('file-indicator');
                    fileIndicator.textContent = String.fromCharCode(97 + actualCol); // 'a' to 'h'
                    square.appendChild(fileIndicator);
                }

                square.classList.add('square', squareColor);
                square.setAttribute('data-row', actualRow);
                square.setAttribute('data-col', actualCol);
                
                // Use event delegation instead of individual listeners
                fragment.appendChild(square);
            }
        }
        squaresContainer.appendChild(fragment);
        
        // Update to pass the game reference to handleSquareClick
        squaresContainer.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (square) {
                this.handleSquareClick({ target: square }, this.gameRef);
            }
        });
    }

    // Update the board to reflect the current game state
    updateBoard(game) {
        // Clear all pieces
        const pieceElements = this.container.querySelectorAll('.piece');
        pieceElements.forEach(piece => piece.remove());
        
        // Place pieces based on the current game state
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = null;
                
                // Handle both ChessGame objects and simple objects with chess.js instance
                if (game.getPiece) {
                    // This is a normal ChessGame object
                    piece = game.getPiece({ row, col });
                } else if (game.chess) {
                    // This is a simple object with a chess.js instance (used in replay)
                    const position = this.algebraicPosition({ row, col });
                    const chessPiece = game.chess.get(position);
                    if (chessPiece) {
                        piece = {
                            type: chessPiece.type,
                            color: chessPiece.color === 'w' ? 'white' : 'black'
                        };
                    }
                }
                
                if (piece) {
                    this.placePiece(piece, row, col);
                }
            }
        }
    }

    // Helper function to convert board position to algebraic notation
    algebraicPosition(position) {
        const file = String.fromCharCode(97 + position.col);
        const rank = 8 - position.row;
        return file + rank;
    }

    // Place a piece on the board
    placePiece(piece, row, col) {
        const actualRow = this.flipped ? 7 - row : row;
        const actualCol = this.flipped ? 7 - col : col;
        const square = this.container.querySelector(`[data-row="${actualRow}"][data-col="${actualCol}"]`);
        
        if (square) {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            
            // Set the piece image
            const pieceType = (piece.color === 'white' ? 'w' : 'b') + piece.type.charAt(0).toUpperCase();
            pieceElement.style.backgroundImage = `url('${this.pieceImages[pieceType]}')`;
            
            square.appendChild(pieceElement);
        }
    }

    // Handle click events on squares
    handleSquareClick(event, game) {
        const square = event.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.getAttribute('data-row'));
        const col = parseInt(square.getAttribute('data-col'));
        const actualRow = this.flipped ? 7 - row : row;
        const actualCol = this.flipped ? 7 - col : col;
        
        // If a piece is already selected
        if (this.selectedSquare) {
            const fromRow = parseInt(this.selectedSquare.getAttribute('data-row'));
            const fromCol = parseInt(this.selectedSquare.getAttribute('data-col'));
            const actualFromRow = this.flipped ? 7 - fromRow : fromRow;
            const actualFromCol = this.flipped ? 7 - fromCol : fromCol;
            
            // Check if the selected square is a valid move
            const isValidMove = this.validMoves.some(move => 
                move.to.row === actualRow && move.to.col === actualCol);
            
            if (isValidMove) {
                // Make the move
                if (this.callbacks.onMove) {
                    this.callbacks.onMove({
                        from: { row: actualFromRow, col: actualFromCol },
                        to: { row: actualRow, col: actualCol }
                    });
                }
                
                this.clearHighlights();
                this.selectedSquare = null;
            } else {
                // Select a new piece if it's of the current player's color
                const piece = game.getPiece({ row: actualRow, col: actualCol });
                if (piece && piece.color === game.getCurrentPlayer()) {
                    this.selectSquare(square, game);
                } else {
                    this.clearHighlights();
                    this.selectedSquare = null;
                }
            }
        } else {
            // Select a piece if it's the current player's
            const piece = game.getPiece({ row: actualRow, col: actualCol });
            if (piece && piece.color === game.getCurrentPlayer()) {
                this.selectSquare(square, game);
            }
        }
    }

    // Select a square and show valid moves
    selectSquare(square, game) {
        game = game || this.gameRef; // Use the stored reference if no game is passed
        
        this.clearHighlights();
        
        square.classList.add('selected');
        this.selectedSquare = square;
        
        const row = parseInt(square.getAttribute('data-row'));
        const col = parseInt(square.getAttribute('data-col'));
        const actualRow = this.flipped ? 7 - row : row;
        const actualCol = this.flipped ? 7 - col : col;
        
        // Get valid moves for the selected piece
        this.validMoves = game.getValidMoves({ row: actualRow, col: actualCol });
        
        // Highlight valid moves
        this.validMoves.forEach(move => {
            const targetRow = this.flipped ? 7 - move.to.row : move.to.row;
            const targetCol = this.flipped ? 7 - move.to.col : move.to.col;
            const targetSquare = this.container.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
            if (targetSquare) {
                targetSquare.classList.add('valid-move');
            }
        });
    }

    // Clear all highlights from the board
    clearHighlights() {
        const squares = this.container.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
    }

    // Flip the board perspective
    flipBoard(game) {
        this.flipped = !this.flipped;
        this.init(game, this.flipped);
    }

    // Register callbacks for board events
    on(event, callback) {
        this.callbacks[event] = callback;
    }
}
