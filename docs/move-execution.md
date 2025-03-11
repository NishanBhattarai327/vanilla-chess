# Move Execution Process in Vanilla Chess

This document explains how chess moves are validated, executed, and processed within the application.

## Move Interaction Methods

The Vanilla Chess supports two primary ways for users to make moves:

1. **Click-Based Selection** - Traditional two-step process of clicking a piece and then clicking a destination
2. **Drag-and-Drop** - Direct manipulation by dragging pieces to their intended destinations

Both methods trigger the same move validation and execution pipeline once the destination is determined.

## Move Validation and Execution Flow

### 1. User Initiates a Move

#### Click-Based Method:
1. User clicks on a piece belonging to their color
2. Valid moves are highlighted
3. User clicks on a destination square
4. The move is processed

#### Drag-and-Drop Method:
1. User presses down on a piece belonging to their color
2. If movement exceeds a threshold (5px), the drag operation begins
3. A visual representation of the piece follows the cursor/finger
4. Valid moves are highlighted on the board
5. User releases the piece over a destination square
6. The move is processed

```javascript
// Code excerpt showing drag initiation logic
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
    // ...existing code...
    
    // Instead of immediately starting drag, mark as potential drag
    this.isPotentialDrag = true;
    this.mouseDownPosition = { x: clientX, y: clientY };
    
    // Store piece and position information for later use
    this.draggedPiece = pieceElement;
    this.dragStartPosition = { row: actualRow, col: actualCol };
}
```

### 2. Move Data Creation

Once a destination is determined (through click or drag):

1. **Position Identification**:
   - The origin square (`from`) and destination square (`to`) are identified
   - For drag-and-drop, these are tracked during the drag operation
   - For click-based, these come from the selected square and the clicked destination

2. **Coordinate Conversion**:
   - Board coordinates (row/column) are converted to algebraic notation (e.g., "e2" to "e4")
   - This conversion accounts for board flipping when playing as black

```javascript
// Code excerpt showing how drag-and-drop finalizes a move
handleDragEnd(event) {
    // If not dragging, just exit
    if (!this.isDragging) return;
    
    // Get the mouse/touch position
    const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
    
    // Find the target square
    const targetElement = document.elementFromPoint(clientX, clientY);
    const targetSquare = targetElement ? targetElement.closest('.square') : null;
    
    if (targetSquare) {
        // Get destination coordinates
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
            
            // Check for pawn promotion or execute move
            // ...existing code...
        }
    }
}
```

### 3. Pawn Promotion Check

Before executing the move, the system checks if this is a pawn promotion situation:

1. **Promotion Detection**:
   - A pawn promotion occurs when a pawn reaches the opponent's back rank (row 0 for white or row 7 for black)
   - The `isPromotion()` method in the ChessGame class detects this situation

2. **Promotion Dialog**:
   - If it's a promotion move, the promotion dialog is shown
   - The player selects a piece to promote to (Queen, Rook, Knight, or Bishop)
   - The selection is added to the move data

```javascript
// Code excerpt checking for pawn promotion
if (this.gameRef.isPromotion && this.gameRef.isPromotion(from, to)) {
    this.showPromotionDialog(from, to, this.gameRef.getCurrentPlayer());
} else {
    // Execute the move
    if (this.callbacks.onMove) {
        this.callbacks.onMove({ from, to });
    }
}
```

### 4. Move Validation in Game Logic

The move is passed to the `ChessGame` class where:

1. **Chess.js Validation**:
   - The move is converted to a format the chess.js library understands
   - Chess.js validates the move according to all chess rules
   - If the move is invalid, it's rejected and nothing happens on the board

2. **Move Object Creation**:
   - Chess.js returns a detailed move object containing:
     - Piece type that moved
     - Origin and destination squares
     - If a piece was captured
     - Special move flags (castling, en passant, promotion)
     - Check and checkmate status

```javascript
// Code excerpt from makeMove method
const moveObj = {
    from: this.positions.toAlgebraic(from),
    to: this.positions.toAlgebraic(to),
    promotion: promotionPiece
};

try {
    const move = this.chess.move(moveObj);
    if (move) {
        // Move is valid, proceed with execution
        // ...
    }
} catch (e) {
    console.error('Invalid move:', e);
}
```

### 5. Move Execution

If the move is valid, the following actions occur:

1. **Update Game State**:
   - The internal chess position is updated
   - The move is added to the move history
   - The application determines the appropriate sound to play

2. **Sound Selection**:
   - Different sounds are played based on the type of move:
     - Regular move: Standard piece movement sound
     - Capture: More impactful sound for taking a piece
     - Castling: Special sound for the king-rook movement
     - Promotion: Special sound for pawn promotion
     - Check: Alert sound when placing opponent in check
     - Checkmate: Victory sound when winning the game

3. **Visual Updates**:
   - The board is updated to reflect the new position
   - Any piece that was captured is removed
   - The last move is highlighted
   - If a king is in check, it's highlighted with the check indicator

4. **Timer Action**:
   - The player's timer is stopped
   - The opponent's timer is started

### 6. Post-Move Processing

After a move is executed:

1. **Game End Checks**:
   - Check for checkmate, stalemate, insufficient material, or threefold repetition
   - If the game is over, display the appropriate result

2. **Bot Response** (if applicable):
   - If the current player after the move is the bot, the bot calculates its response move
   - The bot's move is executed through the same move execution pipeline

3. **UI Updates**:
   - Move history display is updated
   - Game status message is updated
   - Visual highlights are applied (last move, check)

## Last Move Highlighting

A special feature of the Vanilla Chess is highlighting the last move played:

1. **Tracking Last Move**:
   - Each time a move is made, the `lastMove` property in the ChessBoard class is updated
   - This stores both the origin and destination squares

2. **Visual Indication**:
   - Both the origin and destination squares of the last move are highlighted with a subtle yellow background
   - This helps players keep track of what move was just played

3. **Maintaining Highlighting**:
   - The last move highlight persists through board updates
   - It's only replaced when a new move is made

```javascript
// Code excerpt for highlighting last move
highlightLastMove() {
    // Clear previous last move highlights
    const lastMoveSquares = this.container.querySelectorAll('.square.last-move');
    lastMoveSquares.forEach(square => square.classList.remove('last-move'));
    
    // If there's no last move, exit
    if (!this.lastMove.from || !this.lastMove.to) return;
    
    // Get the visual positions accounting for board flipping
    const fromRow = this.flipped ? 7 - this.lastMove.from.row : this.lastMove.from.row;
    const fromCol = this.flipped ? 7 - this.lastMove.from.col : this.lastMove.from.col;
    const toRow = this.flipped ? 7 - this.lastMove.to.row : this.lastMove.to.row;
    const toCol = this.flipped ? 7 - this.lastMove.to.col : this.lastMove.to.col;
    
    // Find and highlight the source and destination squares
    // ...existing code...
}
```

This comprehensive move execution system ensures all chess rules are followed correctly while providing appropriate visual and audio feedback to enhance the user experience across both desktop and mobile devices.
