# Piece Selection and Highlighting in Vanilla Chess

This document explains the visual feedback and interaction process when a user selects chess pieces in the application.

## How Piece Selection Works

### 1. Initial Selection of a Piece

When a user clicks on a chess piece, the following happens:

1. **Event Handling**: 
   - The click event is captured by the event handler in the `ChessBoard` class.
   - The application checks if the clicked square contains a piece belonging to the current player.
   - If it's not the current player's piece, nothing happens.

2. **Visual Feedback**:
   - The selected square is highlighted with a dark overlay (`.square.selected` CSS class).
   - This creates a visual indicator that the piece is currently selected.

```javascript
// Code excerpt showing how selection is applied
square.classList.add('selected');
this.selectedSquare = square;
```

3. **Finding Valid Moves**:
   - The application requests all valid moves for the selected piece from the game logic.
   - These moves are calculated using the chess.js library which ensures all chess rules are applied.
   - The valid moves are stored in the board's `validMoves` array.

### 2. Highlighting Valid Moves

Once a piece is selected, all its valid destination squares are highlighted as follows:

1. **Regular Move Highlighting**:
   - Valid destination squares are highlighted with a small dot in the center.
   - This is done by adding the `.valid-move` CSS class.
   - The dot is created using a CSS pseudo-element (::after) with border-radius: 50%.

```css
/* CSS for highlighting valid moves */
.chessboard .square.valid-move::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 25%;
    height: 25%;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    z-index: 1;
}
```

2. **Capture Move Highlighting**:
   - Squares containing opponent pieces that can be captured are highlighted differently.
   - These squares get an additional `.valid-capture` CSS class.
   - The highlight appears as a larger circle around the entire piece.

```css
/* CSS for highlighting capture moves */
.chessboard .square.valid-move.valid-capture::after {
    width: 85%;
    height: 85%;
    border-radius: 50%;
    z-index: 1;
}
```

3. **Hover Effects**:
   - When hovering over valid move squares, an additional highlight appears.
   - This provides extra visual feedback to the user about potential destinations.

```css
/* CSS for hover effect on valid moves */
.chessboard .square.valid-move:hover::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 1;
}
```

### 3. Changing Selection or Making a Move

After a piece is selected, the user can:

1. **Click the Same Piece Again**:
   - This deselects the piece, clearing all highlights.
   - The board returns to its normal state.

2. **Click Another of Their Pieces**:
   - The previous selection is cleared.
   - The new piece becomes selected with its valid moves highlighted.

3. **Click a Valid Destination Square**:
   - The move is executed by calling the `onMove` callback.
   - All selections and highlights are cleared.
   - The board is updated to reflect the new position.

4. **Click an Invalid Square**:
   - All selections and highlights are cleared.
   - No move is made.

### 4. Check Highlighting

When a king is in check:

1. **Visual Indicator**:
   - The square containing the king in check is given a `.check` CSS class.
   - This creates a pulsating red border around the king.
   - The animation draws the player's attention to the threatened king.

```css
/* CSS for highlighting king in check */
.check {
    position: relative;
    animation: pulse-check 2s infinite;
}

.check::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 3px solid rgba(255, 0, 0, 0.7);
    z-index: 3;
    pointer-events: none;
}

@keyframes pulse-check {
    0% {
        box-shadow: inset 0 0 0 0 rgba(255, 0, 0, 0.4);
    }
    50% {
        box-shadow: inset 0 0 0 10px rgba(255, 0, 0, 0);
    }
    100% {
        box-shadow: inset 0 0 0 0 rgba(255, 0, 0, 0);
    }
}
```

2. **Check Persistence**:
   - The check highlight remains visible even when selecting pieces.
   - This ensures the player is always aware of the check situation.

## Technical Implementation

The selection and highlighting process is primarily implemented in the `ChessBoard` class with these key methods:

1. **handleSquareClick()**: Processes click events and determines what action to take
2. **selectSquare()**: Applies selection styling and calculates valid moves
3. **clearHighlights()**: Removes all selection and move highlights
4. **highlightKingInCheck()**: Adds special highlighting for kings in check

These methods work together to create an intuitive visual interface that guides the player through the process of selecting and moving chess pieces according to the rules of chess.
