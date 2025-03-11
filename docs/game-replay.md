# Game Replay System

This document explains the game replay functionality in the Chess App, which allows users to review completed games move by move.

## Overview

The game replay system provides users with the ability to:
- Watch completed games step by step
- Navigate forward and backward through the move history
- Play the game automatically with proper timing and sound effects
- View the game state at any specific move

## User Interface Components

The replay interface consists of:

1. **Replay Modal**: A modal window that appears when a user chooses to replay a completed game
2. **Chessboard Display**: Visual representation of the board state at the current move
3. **Control Buttons**:
   - Previous Move: Steps back one move in the game history
   - Play/Pause: Toggles automatic playback of the game
   - Next Move: Advances one move forward in the game history
4. **Status Display**: Shows the current move number and total moves in the game

## Technical Implementation

### Initialization

When a user opts to replay a game (typically after game completion):

```javascript
function showReplayModal() {
    // Display the replay modal
    elements.replayModal.style.display = 'block';
    
    // Get the last played game from storage
    const lastGame = storage.getLastGame();
    
    if (lastGame) {
        replayGame = lastGame;
        replayMoveIndex = 0;
        
        // Initialize Chess.js instance with the saved PGN if available
        replayChess = new Chess();
        if (lastGame.pgn && lastGame.pgn.trim() !== '') {
            replayChess.load_pgn(lastGame.pgn);
        }
        
        // Initialize the board display
        updateReplayBoard();
    }
}
```

### Navigation Controls

Users can navigate through the game using three main controls:

1. **Previous Move**:
```javascript
function replayPrevMove() {
    if (replayMoveIndex > 0) {
        replayMoveIndex--;
        updateReplayBoard();
    }
}
```

2. **Next Move**:
```javascript
function replayNextMove() {
    if (replayMoveIndex < replayGame.moves.length) {
        const move = replayGame.moves[replayMoveIndex];
        replayMoveIndex++;
        updateReplayBoard();
        
        // Play appropriate sound for the move
        chessSound.play(getSoundForMove(move));
        
        // Play additional sounds for special game states
        if (replayChess.in_check()) {
            setTimeout(() => chessSound.play('check'), 150);
        }
    }
}
```

3. **Auto-playback Toggle**:
```javascript
function toggleReplayPlayback() {
    if (replayInterval) {
        // Pause playback
        clearInterval(replayInterval);
        replayInterval = null;
        elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        // Start playback
        replayInterval = setInterval(() => {
            if (replayMoveIndex < replayGame.moves.length) {
                replayNextMove();
            } else {
                // Stop playback when we reach the end
                clearInterval(replayInterval);
                replayInterval = null;
                elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }, 1000); // Advance one move per second
        elements.replayPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}
```

### Board Update Process

Each time a user navigates to a different move, the board is updated:

```javascript
function updateReplayBoard() {
    // Reset chess to initial position
    while (replayChess.history().length > 0) {
        replayChess.undo();
    }
    
    // Apply all moves up to the current index
    let appliedMoves = 0;
    for (let i = 0; i < replayMoveIndex; i++) {
        if (i < replayGame.moves.length) {
            try {
                replayChess.move(replayGame.moves[i]);
                appliedMoves++;
            } catch (e) {
                console.error(`Error applying move at index ${i}:`, e);
            }
        }
    }
    
    // Update visual board representation
    replayBoardInstance.updateBoard({chess: replayChess});
    
    // Update the move counter display
    elements.replayStatus.textContent = `Move: ${appliedMoves}/${replayGame.moves.length}`;
    
    // Show game result when at the last move
    if (replayGame.result && appliedMoves === replayGame.moves.length) {
        elements.replayStatus.textContent += ` - ${replayGame.result}`;
    }
}
```

## Visual Highlighting

The replay system includes visual highlighting of the last move, which helps users follow the game progress:

- Source square: Where the piece moved from
- Destination square: Where the piece moved to

This highlighting is achieved through the `highlightLastMove()` method in the ChessBoard class, which adds a visual indicator to both squares involved in the last move.

## Sound Effects

The replay system integrates with the sound management system to provide audio feedback:

- Regular moves: Standard piece movement sounds
- Captures: Distinct capture sounds
- Special events (check, checkmate, stalemate): Appropriate alert sounds

These sounds enhance the replay experience and provide important context about the significance of each move.

## Relationship to Other Components

The replay system interfaces with several other components:
- **Storage System**: To retrieve game history
- **Chess.js**: For game state management and move validation
- **Board Visualization**: To display the current board state
- **Sound System**: For audio feedback during replay

## Future Enhancements

Potential improvements to the replay system could include:
- Variable playback speed control
- Commentary or annotations for significant moves
- Position evaluation display
- Alternative move suggestions
