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
        this.gameRef = null;
        
        // New properties for drag and drop
        this.isDragging = false;
        this.draggedPiece = null;
        this.dragStartPosition = null;
        
        // Add new properties for distinguishing clicks from drags
        this.mouseDownPosition = null;
        this.isPotentialDrag = false;
        this.dragThreshold = 5; // Minimum pixels to move before starting drag

        // Add properties to track the last move
        this.lastMove = {
            from: null,
            to: null
        };
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
        
        // Add drag and drop event listeners
        this.setupDragAndDrop();

        // Reset last move tracking when initializing a new board
        this.lastMove = {
            from: null,
            to: null
        };
        
        // Debug logging to verify flip state
        console.log(`Board initialized with flipped: ${this.flipped}`);
    }
    
    // New method to set up drag and drop
    setupDragAndDrop() {
        const squaresContainer = this.container.querySelector('.squares-container');
        
        // Mouse events for desktop
        squaresContainer.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        
        // Touch events for mobile devices
        squaresContainer.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
        
        // Prevent default drag behavior of images
        squaresContainer.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    // Handle the start of a drag operation
    handleDragStart(event) {
        // Don't start another drag if already dragging
        if (this.isDragging) return;
        
        // Get the mouse/touch position
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        
        // Find the piece that was clicked
        const element = document.elementFromPoint(clientX, clientY);
        const pieceElement = element.closest('.piece');
        const square = element.closest('.square');
        
        if (!pieceElement || !square) return;
        
        // Check if this piece belongs to the current player
        const row = parseInt(square.getAttribute('data-row'));
        const col = parseInt(square.getAttribute('data-col'));
        const actualRow = this.flipped ? 7 - row : row;
        const actualCol = this.flipped ? 7 - col : col;
        const piece = this.gameRef.getPiece({ row: actualRow, col: actualCol });
        
        if (!piece || piece.color !== this.gameRef.getCurrentPlayer()) return;
        
        // Prevent default behavior to avoid text selection, etc.
        event.preventDefault();
        
        // Instead of immediately starting drag, mark as potential drag
        this.isPotentialDrag = true;
        this.mouseDownPosition = { x: clientX, y: clientY };
        
        // Store piece and position information for later use
        this.draggedPiece = pieceElement;
        this.dragStartPosition = { row: actualRow, col: actualCol };
        
        // For touch devices, select the square immediately to show valid moves
        // This gives better feedback on mobile without waiting for movement
        if (event.touches) {
            this.selectSquare(square, this.gameRef);
        }
    }
    
    // Create a visual element for the dragged piece
    createDragVisual(pieceElement, clientX, clientY) {
        // Remove any existing drag visual
        const existingVisual = document.getElementById('drag-piece-visual');
        if (existingVisual) existingVisual.remove();
        
        // Get the actual dimensions of the original piece for consistency
        const originalRect = pieceElement.getBoundingClientRect();
        const pieceWidth = originalRect.width;
        const pieceHeight = originalRect.height;
        
        // Create a clone of the piece element
        const dragVisual = document.createElement('div');
        dragVisual.id = 'drag-piece-visual';
        dragVisual.className = 'piece dragging';
        dragVisual.style.backgroundImage = pieceElement.style.backgroundImage;
        dragVisual.style.position = 'fixed';
        dragVisual.style.zIndex = '1000';
        dragVisual.style.pointerEvents = 'none'; // Prevent the clone from interfering with events
        
        // Ensure background styling is consistent
        dragVisual.style.backgroundSize = 'contain';
        dragVisual.style.backgroundPosition = 'center center';
        dragVisual.style.backgroundRepeat = 'no-repeat';
        
        // Set size based on original piece dimensions
        dragVisual.style.width = `${pieceWidth}px`;
        dragVisual.style.height = `${pieceHeight}px`;
        dragVisual.style.transform = 'translate(-50%, -50%)'; // Center at cursor
        
        // Position the visual at the cursor
        dragVisual.style.left = `${clientX}px`;
        dragVisual.style.top = `${clientY}px`;
        
        // Add it to the document body
        document.body.appendChild(dragVisual);
    }
    
    // Handle the dragging movement
    handleDragMove(event) {
        // Skip if not a potential or active drag
        if (!this.isPotentialDrag && !this.isDragging) return;
        
        // Get the mouse/touch position
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        
        // If we're in potential drag state, check if movement exceeds threshold
        if (this.isPotentialDrag && !this.isDragging) {
            const deltaX = Math.abs(clientX - this.mouseDownPosition.x);
            const deltaY = Math.abs(clientY - this.mouseDownPosition.y);
            
            // If movement is significant, start actual dragging
            if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
                this.startDragging(clientX, clientY);
            } else {
                // Not enough movement yet, just return
                return;
            }
        }
        
        // Prevent default to avoid scrolling on mobile
        event.preventDefault();
        
        // Update the position of the drag visual
        const dragVisual = document.getElementById('drag-piece-visual');
        if (dragVisual) {
            dragVisual.style.left = `${clientX}px`;
            dragVisual.style.top = `${clientY}px`;
        }
    }
    
    // New method to actually start dragging
    startDragging(clientX, clientY) {
        // Find the square of the dragged piece
        const pieceSquare = this.draggedPiece.closest('.square');
        
        // Change state from potential to active drag
        this.isDragging = true;
        this.isPotentialDrag = false;
        
        // Select the square to show valid moves (if not already selected)
        this.selectSquare(pieceSquare, this.gameRef);
        
        // Create a visual representation of the dragged piece
        this.createDragVisual(this.draggedPiece, clientX, clientY);
        
        // Hide the original piece while dragging (reduce opacity instead of full hide)
        this.draggedPiece.style.opacity = '0.3';
    }
    
    // Handle the end of a drag operation
    handleDragEnd(event) {
        // If we're in potential drag state but not actual dragging,
        // this is a click not a drag - ignore and let click handler take care of it
        if (this.isPotentialDrag && !this.isDragging) {
            this.resetDragState();
            return;
        }
        
        // If not dragging, just exit
        if (!this.isDragging) return;
        
        // Get the mouse/touch position
        const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
        const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
        
        // Restore the original piece's opacity
        if (this.draggedPiece) {
            this.draggedPiece.style.opacity = '1';
        }
        
        // Remove the drag visual
        const dragVisual = document.getElementById('drag-piece-visual');
        if (dragVisual) {
            dragVisual.remove();
        }
        
        // Find the target square
        const targetElement = document.elementFromPoint(clientX, clientY);
        const targetSquare = targetElement ? targetElement.closest('.square') : null;
        
        if (targetSquare) {
            const targetRow = parseInt(targetSquare.getAttribute('data-row'));
            const targetCol = parseInt(targetSquare.getAttribute('data-col'));
            const actualTargetRow = this.flipped ? 7 - targetRow : targetRow;
            const actualTargetCol = this.flipped ? 7 - targetCol : targetCol;
            
            // Check if the drop target is a valid move
            const isValidMove = this.validMoves.some(move => 
                move.to.row === actualTargetRow && move.to.col === actualTargetCol);
            
            if (isValidMove) {
                const from = this.dragStartPosition;
                const to = { row: actualTargetRow, col: actualTargetCol };
                
                // Update last move for highlighting
                this.lastMove = {
                    from: { row: from.row, col: from.col },
                    to: { row: to.row, col: to.col }
                };
                
                // Check for pawn promotion
                if (this.gameRef.isPromotion && this.gameRef.isPromotion(from, to)) {
                    this.showPromotionDialog(from, to, this.gameRef.getCurrentPlayer());
                } else {
                    // Execute the move
                    if (this.callbacks.onMove) {
                        this.callbacks.onMove({ from, to });
                    }
                }
            }
        }
        
        // Reset drag state and clear highlights
        this.resetDragState();
        this.clearHighlights();
    }
    
    // New method to reset drag-related state
    resetDragState() {
        if (this.draggedPiece) {
            this.draggedPiece.style.opacity = '1';
        }
        this.isDragging = false;
        this.isPotentialDrag = false;
        this.draggedPiece = null;
        this.dragStartPosition = null;
        this.mouseDownPosition = null;
    }

    // Create squares for the chess board
    createSquares(squaresContainer) {
        const fragment = document.createDocumentFragment();
        
        // Always create the grid in the same visual order (0-7 for rows and cols)
        for (let visualRow = 0; visualRow < 8; visualRow++) {
            for (let visualCol = 0; visualCol < 8; visualCol++) {
                // Convert visual coordinates to logical coordinates based on flip state
                const actualRow = this.flipped ? 7 - visualRow : visualRow;
                const actualCol = this.flipped ? 7 - visualCol : visualCol;
                
                // Determine square color based on logical coordinates
                const squareColor = (actualRow + actualCol) % 2 === 0 ? 'white' : 'black';
                const square = document.createElement('div');
                
                // Add rank number to the first column
                if (visualCol === 0) {
                    const rankIndicator = document.createElement('span');
                    rankIndicator.classList.add('rank-indicator');
                    // Always show ranks in ascending order from bottom to top (8 to 1)
                    rankIndicator.textContent = this.flipped ? (visualRow + 1).toString() : (8 - visualRow).toString();
                    square.appendChild(rankIndicator);
                }
                
                // Add file letter to the last row
                if (visualRow === 7) {
                    const fileIndicator = document.createElement('span');
                    fileIndicator.classList.add('file-indicator');
                    // Always show files in ascending order from left to right (a to h)
                    fileIndicator.textContent = this.flipped ? 
                        String.fromCharCode(104 - visualCol) : // 'h' to 'a' when flipped
                        String.fromCharCode(97 + visualCol);   // 'a' to 'h' when not flipped
                    square.appendChild(fileIndicator);
                }

                square.classList.add('square', squareColor);
                // Store visual coordinates in data attributes for easier access
                square.setAttribute('data-row', visualRow);
                square.setAttribute('data-col', visualCol);
                
                fragment.appendChild(square);
            }
        }
        squaresContainer.appendChild(fragment);
        
        // Use event delegation for click handling
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
        
        // Highlight king in check after all pieces are placed
        this.highlightKingInCheck(game);

        // Update last move information from game if available (to capture bot moves)
        this.updateLastMoveFromGame(game);

        // After updating all pieces, apply the last move highlight
        this.highlightLastMove();
    }

    // New method to update lastMove from game's move history
    updateLastMoveFromGame(game) {
        // Check if game has moveHistory and at least one move
        if (game && game.moveHistory && game.moveHistory.length > 0) {
            // Get the last move from game history
            const lastGameMove = game.moveHistory[game.moveHistory.length - 1];
            
            if (lastGameMove) {
                // Convert chess.js move format to our board format
                if (lastGameMove.from && lastGameMove.to) {
                    // Extract row and column from algebraic notation
                    const fromObj = this.objectPosition(lastGameMove.from);
                    const toObj = this.objectPosition(lastGameMove.to);
                    
                    // Update the last move
                    this.lastMove = {
                        from: { row: fromObj.row, col: fromObj.col },
                        to: { row: toObj.row, col: toObj.col }
                    };
                }
            }
        }
    }
    
    // Helper function to convert algebraic notation to row/col object
    objectPosition(algebraic) {
        if (!algebraic || algebraic.length !== 2) return null;
        
        const col = algebraic.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, etc.
        const row = 8 - parseInt(algebraic[1]);  // '1' -> 7, '2' -> 6, etc.
        return { row, col };
    }

    // Helper function to convert board position to algebraic notation
    algebraicPosition(position) {
        const file = String.fromCharCode(97 + position.col);
        const rank = 8 - position.row;
        return file + rank;
    }

    // Place a piece on the board
    placePiece(piece, logicalRow, logicalCol) {
        // Convert logical board coordinates to visual coordinates based on flip state
        const visualRow = this.flipped ? 7 - logicalRow : logicalRow;
        const visualCol = this.flipped ? 7 - logicalCol : logicalCol;
        
        const square = this.container.querySelector(`.square[data-row="${visualRow}"][data-col="${visualCol}"]`);
        
        if (square) {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            
            // Set the piece image
            const pieceType = (piece.color === 'white' ? 'w' : 'b') + piece.type.charAt(0).toUpperCase();
            pieceElement.style.backgroundImage = `url('${this.pieceImages[pieceType]}')`;
            
            // Add data attributes for easier identification
            pieceElement.setAttribute('data-piece-type', piece.type);
            pieceElement.setAttribute('data-piece-color', piece.color);
            
            square.appendChild(pieceElement);
        }
    }

    // Fixed method to highlight king in check
    highlightKingInCheck(game) {
        // Return early only if no game object is provided
        if (!game) return;
        
        // First, clear any existing check highlights
        const checkSquares = this.container.querySelectorAll('.square.check');
        checkSquares.forEach(square => square.classList.remove('check'));
        
        let isInCheck = false;
        let kingColor = null;
        
        // Determine if there's a check and which king is in check
        if (game.chess) {
            isInCheck = game.chess.in_check();
            kingColor = game.chess.turn() === 'w' ? 'white' : 'black';
        } else if (typeof game.isCheck === 'function') {
            isInCheck = game.isCheck();
            kingColor = game.getCurrentPlayer();
        } else {
            // If we can't determine check status, exit
            return;
        }
        
        if (isInCheck && kingColor) {
            // Find the king that's in check using the correct selector
            const kingElements = this.container.querySelectorAll(
                `.piece[data-piece-type="k"][data-piece-color="${kingColor}"]`
            );
            
            if (kingElements.length === 0) {
                console.warn(`No king found with color: ${kingColor}`);
                return;
            }
            
            kingElements.forEach(kingElement => {
                // Add the check class to the square containing the king
                const square = kingElement.closest('.square');
                if (square) {
                    square.classList.add('check');
                } else {
                    console.warn("King element found but no parent square");
                }
            });
        }
    }

    // Handle click events on squares
    handleSquareClick(event, game) {
        // Only process clicks when we're not dragging
        // This prevents click events from firing after a drag
        if (this.isDragging || this.isPotentialDrag) return;
        
        const square = event.target.closest('.square');
        if (!square) return;
        
        // Get visual coordinates from the square
        const visualRow = parseInt(square.getAttribute('data-row'));
        const visualCol = parseInt(square.getAttribute('data-col'));
        
        // Convert to logical coordinates based on flip state
        const logicalRow = this.flipped ? 7 - visualRow : visualRow;
        const logicalCol = this.flipped ? 7 - visualCol : visualCol;
        
        // If a piece is already selected
        if (this.selectedSquare) {
            // Get visual coordinates from the selected square
            const visualFromRow = parseInt(this.selectedSquare.getAttribute('data-row'));
            const visualFromCol = parseInt(this.selectedSquare.getAttribute('data-col'));
            
            // Convert to logical coordinates based on flip state
            const logicalFromRow = this.flipped ? 7 - visualFromRow : visualFromRow;
            const logicalFromCol = this.flipped ? 7 - visualFromCol : visualFromCol;

             // Check if the user clicked the same square that was already selected
             if (visualRow === visualFromRow && visualCol === visualFromCol) {
                this.clearHighlights();
                this.selectedSquare = null;
                return; // Exit the function to prevent further processing
            }
            
            // Check if the selected square is a valid move
            const isValidMove = this.validMoves.some(move => 
                move.to.row === logicalRow && move.to.col === logicalCol);
            
            if (isValidMove) {
                const from = { row: logicalFromRow, col: logicalFromCol };
                const to = { row: logicalRow, col: logicalCol };

                // Update last move for highlighting
                this.lastMove = {
                    from: { row: from.row, col: from.col },
                    to: { row: to.row, col: to.col }
                };

                // Check if this is a pawn promotion
                if (game.isPromotion && game.isPromotion(from, to)) {
                    this.showPromotionDialog(from, to, game.getCurrentPlayer());
                } else {
                    // Make the move
                    if (this.callbacks.onMove) {
                        this.callbacks.onMove({ from, to });
                    }
                }
                
                this.clearHighlights();
                this.selectedSquare = null;
                
                // Re-highlight the king if in check
                this.highlightKingInCheck(game);
            } else {
                // Select a new piece if it's of the current player's color
                const piece = game.getPiece({ row: logicalRow, col: logicalCol });
                if (piece && piece.color === game.getCurrentPlayer()) {
                    this.selectSquare(square, game);
                } else {
                    this.clearHighlights();
                    this.selectedSquare = null;
                }
            }
        } else {
            // Select a piece if it's the current player's
            const piece = game.getPiece({ row: logicalRow, col: logicalCol });
            if (piece && piece.color === game.getCurrentPlayer()) {
                this.selectSquare(square, game);
            }
        }
    }

    // New method to show promotion dialog
    showPromotionDialog(from, to, playerColor) {
        // Create and show promotion dialog
        const dialog = document.createElement('div');
        dialog.className = 'promotion-dialog';
        
        const pieces = ['q', 'r', 'n', 'b'];  // Queen, Rook, Knight, Bishop
        
        pieces.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'promotion-piece';
            const pieceType = (playerColor === 'white' ? 'w' : 'b') + piece.toUpperCase();
            pieceElement.style.backgroundImage = `url('${this.pieceImages[pieceType]}')`;
            
            pieceElement.addEventListener('click', () => {
                if (this.callbacks.onPromotion) {
                    this.callbacks.onPromotion({ from, to, promotion: piece });
                } else if (this.callbacks.onMove) {
                    // Use onMove with promotion piece if onPromotion isn't available
                    this.callbacks.onMove({ from, to, promotion: piece });
                }
                dialog.remove();
            });
            
            dialog.appendChild(pieceElement);
        });
        
        this.container.appendChild(dialog);
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
                // Check if this is a capture move
                const hasPiece = targetSquare.querySelector('.piece');
                if (hasPiece) {
                    targetSquare.classList.add('valid-capture');
                }
            }
        });
    }

    // Clear all highlights from the board
    clearHighlights() {
        // Store squares that have the check class
        const checkedSquares = Array.from(this.container.querySelectorAll('.square.check'))
            .map(square => square.getAttribute('data-row') + '-' + square.getAttribute('data-col'));
        
        // Store squares that have the last-move class
        const lastMoveSquares = Array.from(this.container.querySelectorAll('.square.last-move'))
            .map(square => square.getAttribute('data-row') + '-' + square.getAttribute('data-col'));
        
        // Clear selection highlights
        const squares = this.container.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture');
            
            // Only remove check class if we're not restoring it
            const squareId = square.getAttribute('data-row') + '-' + square.getAttribute('data-col');
            if (!checkedSquares.includes(squareId)) {
                square.classList.remove('check');
            }
            
            // Only remove last-move class if we're not restoring it
            if (!lastMoveSquares.includes(squareId)) {
                square.classList.remove('last-move');
            }
        });
    }

    // Add a new method to highlight the last move
    highlightLastMove() {
        // Clear previous last move highlights
        const lastMoveSquares = this.container.querySelectorAll('.square.last-move');
        lastMoveSquares.forEach(square => square.classList.remove('last-move'));
        
        // If there's no last move, exit
        if (!this.lastMove.from || !this.lastMove.to) return;
        
        // Convert logical positions to visual positions based on flip state
        const visualFromRow = this.flipped ? 7 - this.lastMove.from.row : this.lastMove.from.row;
        const visualFromCol = this.flipped ? 7 - this.lastMove.from.col : this.lastMove.from.col;
        const visualToRow = this.flipped ? 7 - this.lastMove.to.row : this.lastMove.to.row;
        const visualToCol = this.flipped ? 7 - this.lastMove.to.col : this.lastMove.to.col;
        
        // Find and highlight the source square
        const fromSquare = this.container.querySelector(
            `.square[data-row="${visualFromRow}"][data-col="${visualFromCol}"]`
        );
        if (fromSquare) fromSquare.classList.add('last-move');
        
        // Find and highlight the destination square
        const toSquare = this.container.querySelector(
            `.square[data-row="${visualToRow}"][data-col="${visualToCol}"]`
        );
        if (toSquare) toSquare.classList.add('last-move');
    }

    // Flip the board perspective
    flipBoard(game) {
        // Store the current last move before flipping
        const currentLastMove = this.lastMove;
        
        this.flipped = !this.flipped;
        this.init(game, this.flipped);
        
        // Restore the last move after flipping
        this.lastMove = currentLastMove;
        this.highlightLastMove();
    }

    // Register callbacks for board events
    on(event, callback) {
        this.callbacks[event] = callback;
    }
}

// Add CommonJS module exports for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChessBoard };
}
