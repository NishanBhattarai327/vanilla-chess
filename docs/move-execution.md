# Move Execution Process in Chess App

This document explains how chess moves are validated, executed, and processed within the application.

## Move Validation and Execution Flow

### 1. User Initiates a Move

When a user clicks on a valid destination square after selecting a piece:

1. **Move Data Creation**:
   - The board component identifies the origin square (`from`) and destination square (`to`).
   - These positions are converted from board coordinates (row/column) to algebraic notation (e.g., "e2" to "e4").

2. **Pawn Promotion Check**:
   - Before executing the move, the system checks if this is a pawn promotion situation.
   - A pawn promotion occurs when a pawn reaches the opponent's back rank (row 0 for white or row 7 for black).
   - If it's a promotion move, the promotion dialog is shown instead of executing the move immediately.

```javascript
// Code excerpt checking for pawn promotion
if (game.isPromotion(from, to)) {
    this.showPromotionDialog(from, to, game.getCurrentPlayer());
} else {
    // Make the move
    if (this.callbacks.onMove) {
        this.callbacks.onMove({ from, to });
    }
}
```

### 2. Move Validation in Game Logic

The move is passed to the `ChessGame` class where:

1. **Chess.js Validation**:
   - The move is converted to a format the chess.js library understands.
   - Chess.js validates the move according to all chess rules.
   - If the move is invalid, it's rejected and nothing happens on the board.

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

### 3. Move Execution

If the move is valid, the following actions occur:

1. **Update Game State**:
   - The internal chess position is updated.
   - The move is added to the move history.
   - The application determines the appropriate sound to play.

2. **Sound Selection**:
   - Different sounds are played based on the type of move:
     - Regular move: Standard piece movement sound
     - Capture: More impactful sound for taking a piece
     - Castling: Special sound for the king-rook movement
     - Promotion: Special sound for pawn promotion
     - Check: Alert sound when placing opponent in check
     - Checkmate: Victory sound when winning the game

```javascript
// Code excerpt for sound selection
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
```

3. **Visual Updates**:
   - The board is updated to reflect the new position.
   - Any piece that was captured is removed.
   - If a king is in check, it's highlighted with the check indicator.

4. **Timer Action**:
   - The player's timer is stopped.
   - The opponent's timer is started.

### 4. Game End Checks

After each move, the game checks for end conditions:

1. **End Conditions**:
   - Checkmate: Current player has no legal moves and is in check
   - Stalemate: Current player has no legal moves but is not in check
   - Insufficient material: Not enough pieces remain to deliver checkmate
   - Threefold repetition: Same position has occurred three times
   
2. **Game End Actions**:
   - If the game is over, both timers are stopped.
   - The result is determined (win by checkmate, draw by stalemate, etc.).
   - The game end modal is displayed with the result.
   - The game is saved to storage for later replay.

```javascript
// Code excerpt for game end check
if (this.isGameOver()) {
    this.endGame();
    return true;
}
```

### 5. Bot Move (if applicable)

If the current player after the move is the bot:

1. **Bot Move Calculation**:
   - After a short delay, the bot calculates its response move.
   - The calculation algorithm depends on the selected difficulty level.

2. **Bot Move Execution**:
   - The bot's move is executed through the same makeMove method.
   - This ensures consistency in move validation and execution.
   - The same visual updates, sound effects, and game end checks are performed.

## Special Move: Pawn Promotion

Pawn promotion has a special flow:

1. **Promotion Dialog**:
   - When a pawn reaches the opponent's back rank, a promotion dialog appears.
   - The dialog shows the available pieces to promote to (Queen, Rook, Knight, Bishop).

2. **Piece Selection**:
   - The player clicks on their desired promotion piece.
   - The selection is added to the move data.

3. **Move Completion**:
   - The complete move (including promotion choice) is executed.
   - The pawn is replaced with the selected piece on the board.
   - A special promotion sound is played.

```javascript
// Code excerpt of the promotion dialog
showPromotionDialog(from, to, playerColor) {
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
            }
            dialog.remove();
        });
        
        dialog.appendChild(pieceElement);
    });
    
    this.container.appendChild(dialog);
}
```

## Move Undoing

The application also supports undoing moves:

1. **Undo Action**:
   - When the user clicks the "Undo" button, the last move is reversed.
   - In player vs. bot mode, both the bot's move and the player's move are undone.

2. **Implementation**:
   - The chess.js library's undo() method is called.
   - The board is updated to reflect the previous position.
   - The move history is updated by removing the undone moves.
   - The appropriate player's timer is restarted.

This comprehensive move execution system ensures all chess rules are followed correctly while providing appropriate visual and audio feedback to enhance the user experience.
