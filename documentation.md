# Chess App Documentation

## 1. Project Overview
The Chess App is a web-based chess game built using vanilla JavaScript with an object-oriented approach. It allows users to play chess against an AI bot with adjustable difficulty levels. The application features a responsive design, chess timer functionality, game history storage, sound effects, and interactive game replay.

### Main Features
- Play against an AI bot with three difficulty levels (easy, medium, hard)
- Responsive chessboard with integrated rank and file notation
- Chess timer with configurable time formats
- Game history storage and interactive replay functionality
- Visual indicators for selected pieces and valid moves
- Player color selection (white or black)
- Sound effects for moves, captures, checks, and other game events
- Volume control and mute functionality

## 2. System Architecture

The application follows an object-oriented architecture with several core components that interact together:

### Core Components
1. **ChessGame** (game.js)
   - Central component that controls game state and logic
   - Manages game lifecycle (start, play, end)
   - Coordinates interactions between other components
   - Uses chess.js library for rules and validation

2. **ChessBoard** (board.js)
   - Handles the visual representation and rendering of the chess board
   - Manages user interactions (selecting pieces, making moves)
   - Shows visual indicators for selected pieces and valid moves
   - Provides integrated rank and file notation

3. **ChessBot** (bot.js)
   - Implements the AI opponent with three difficulty levels
   - Uses different strategies based on selected level:
     - Easy: Random moves
     - Medium: Prioritizes captures and checks
     - Hard: Uses position evaluation

4. **ChessTimer** (timer.js)
   - Implements chess clock functionality
   - Manages time for both players
   - Handles time-based game termination

5. **GameStorage** (storage.js)
   - Manages persistent storage of game history
   - Uses localStorage for client-side persistence
   - Provides retrieval methods for game replay

6. **ChessSoundManager** (sound.js)
   - Handles all audio feedback in the game
   - Supports both audio file playback and synthesized sounds using Web Audio API
   - Provides distinct sounds for different chess events (moves, captures, checks, etc.)
   - Includes volume control and mute functionality

7. **Application Initialization** (app.js)
   - Initializes and connects all components
   - Sets up event handlers and UI interactions
   - Manages game modals and UI updates

### Component Interaction Diagram
```
User → ChessBoard → ChessGame → ChessBot
                  ↕           ↕
                ChessTimer → GameStorage
                  ↕
              ChessSoundManager
```

## 3. File Structure

```
chess-app/
├── css/
│   └── styles.css              # Main stylesheet for the entire application
├── img/                        # Directory for chess piece images
│   ├── wP.svg, wR.svg, etc.    # White pieces (Pawn, Rook, etc.)
│   └── bP.svg, bR.svg, etc.    # Black pieces (Pawn, Rook, etc.)
├── sounds/                     # Optional directory for sound files (if used)
│   ├── move.mp3                # Sound for regular moves
│   ├── capture.mp3             # Sound for capturing pieces
│   └── check.mp3, etc.         # Additional sounds for various game events
├── js/
│   ├── app.js                  # Main application initialization
│   ├── board.js                # Chess board UI and interaction
│   ├── bot.js                  # AI opponent logic
│   ├── game.js                 # Core game mechanics
│   ├── storage.js              # Game history storage
│   ├── timer.js                # Chess clock functionality
│   └── sound.js                # Sound effects management
├── index.html                  # Main HTML structure
├── documentation.md            # This comprehensive documentation
├── design.md                   # Design documentation and architecture
└── style.md                    # Style guide for the application
```

### Key Files Explained

- **index.html**: Main entry point that sets up the HTML structure, loads necessary scripts and styles.
- **app.js**: Initializes the application, connects components, and sets up event listeners.
- **game.js**: Core game logic using chess.js for rules enforcement.
- **board.js**: Visual representation and user interaction with the chess board.
- **bot.js**: AI opponent with three difficulty levels and move evaluation.
- **timer.js**: Chess clock implementation with various time formats.
- **storage.js**: Game history storage using localStorage.
- **sound.js**: Sound effects manager with both audio file and synthesized sound support.
- **styles.css**: Complete styling for the application with responsive design.

## 4. Functionality

### Game Initialization Flow
1. **DOM Content Loaded**
   - app.js initializes core components including sound manager
   - Default settings are applied
   - New game is started

2. **Starting a New Game**
   - User selects settings (bot level, player color, time)
   - ChessGame.start() initializes the game
   - Board is set up with pieces in starting positions
   - Timer is initialized with selected time format
   - If player is black, bot makes first move

### Player Move Flow
1. User clicks on a piece of their color
2. Valid moves are highlighted on the board
3. User clicks on a destination square
4. ChessBoard sends move to ChessGame
5. ChessGame validates and executes the move
6. Appropriate sound effect is played based on move type (regular move, capture, check, etc.)
7. Board is updated with new position
8. Timer switches to opponent
9. Game checks for end conditions
10. Bot calculates and makes its move

### Bot Move Flow
1. ChessBot.getMove() is called with current game state
2. Based on difficulty level:
   - Easy: Selects a random valid move
   - Medium: Prioritizes captures and checks
   - Hard: Evaluates positions to find best move
3. Bot "thinks" for a short delay based on level
4. Move is executed and appropriate sound is played
5. Board is updated with new position
6. Timer switches back to player
7. Game checks for end conditions

### Game End Conditions
1. **Checkmate**: A player's king is in check and has no legal moves
2. **Stalemate**: A player has no legal moves but is not in check
3. **Insufficient Material**: Not enough pieces remain to deliver checkmate
4. **Threefold Repetition**: Same position occurs three times
5. **Time Out**: A player's time runs out
6. **Resignation**: Player clicks the resign button

### Game Replay Flow
1. User clicks "Replay Game" button in the end game modal
2. Replay modal opens with the saved game
3. User can navigate through moves using:
   - Previous Move button
   - Play/Pause button for automatic playback
   - Next Move button
4. Chess positions are displayed at each move
5. Sound effects are played during replay to match the move types

### Sound System
1. **Sound Types**:
   - Move: Standard piece movement
   - Capture: When a piece is captured
   - Check: When a king is in check
   - Checkmate: When a king is checkmated
   - Stalemate: When the game ends in stalemate
   - Castling: When the king castles
   - Promotion: When a pawn is promoted

2. **Sound Controls**:
   - Mute button to toggle sounds on/off
   - Volume slider to adjust sound volume
   - Sounds automatically play during both player moves and replays

3. **Technical Implementation**:
   - Uses Web Audio API for synthesized sounds with fallback to audio files
   - Supports both audio file playback and synthesized sounds
   - Dynamically generates appropriate sounds based on move type

## 5. Feature Updates

### Adding a New Bot Difficulty Level

1. **Modify bot.js**:
```javascript
// Add new level to thinkingTime object
constructor(level = 'medium') {
    this.level = level;
    this.thinkingTime = {
        'easy': 500,
        'medium': 1000,
        'hard': 2000,
        'expert': 3000  // Add new level
    };
}

// Create a new method for the expert level
getExpertLevelMove(game, possibleMoves) {
    // More sophisticated evaluation logic
    // For example, considering piece positioning, king safety, etc.
    // ...implementation...
}

// Update getMove method to include the new level
async getMove(game) {
    // ...existing code...
    
    // Expert: More sophisticated evaluation
    if (this.level === 'expert') {
        return this.getExpertLevelMove(game, possibleMoves);
    }
    
    // Hard: Evaluate positions and choose best
    return this.getHardLevelMove(game, possibleMoves);
}
```

2. **Update index.html**:
```html
<select id="bot-level">
    <option value="easy">Easy</option>
    <option value="medium" selected>Medium</option>
    <option value="hard">Hard</option>
    <option value="expert">Expert</option>  <!-- Add new level -->
</select>
```

### Customizing Sound Effects

1. **Create custom sound profiles**:
```javascript
// In sound.js
class CustomSoundProfile extends ChessSoundManager {
    constructor(options) {
        super(options);
        
        // Override default sounds with custom ones
        this.soundFiles = {
            'move': 'custom-move.mp3',
            'capture': 'custom-capture.mp3',
            'check': 'custom-check.mp3',
            // ...other sounds
        };
    }
    
    // Optionally override synthesized sound methods
    synthesizeMove(destination) {
        // Custom implementation for synthesized move sound
        // ...implementation...
    }
}
```

2. **Add a sound theme selector to index.html**:
```html
<div class="setting-group">
    <label for="sound-theme">Sound Theme:</label>
    <select id="sound-theme">
        <option value="standard" selected>Standard</option>
        <option value="classic">Classic</option>
        <option value="modern">Modern</option>
    </select>
</div>
```

3. **Update app.js to handle theme selection**:
```javascript
elements.soundThemeSelect = document.getElementById('sound-theme');
elements.soundThemeSelect.addEventListener('change', () => {
    const theme = elements.soundThemeSelect.value;
    chessSound.setTheme(theme);
});
```

### Implementing Piece Promotion Dialog

1. **Update game.js to handle promotions**:
```javascript
makeMove(from, to, promotionPiece = 'q') {
    const moveObj = {
        from: this.positions.toAlgebraic(from),
        to: this.positions.toAlgebraic(to),
        promotion: promotionPiece
    };
    
    // ...rest of existing code...
}

// New method to check if a move would result in promotion
isPromotion(from, to) {
    const piece = this.chess.get(this.positions.toAlgebraic(from));
    return piece && 
           piece.type === 'p' && 
           ((piece.color === 'w' && to.row === 0) || 
            (piece.color === 'b' && to.row === 7));
}
```

2. **Update board.js to show promotion dialog**:
```javascript
handleSquareClick(event, game) {
    // ...existing code...
    
    if (isValidMove) {
        const fromRow = parseInt(this.selectedSquare.getAttribute('data-row'));
        const fromCol = parseInt(this.selectedSquare.getAttribute('data-col'));
        const actualFromRow = this.flipped ? 7 - fromRow : fromRow;
        const actualFromCol = this.flipped ? 7 - fromCol : fromCol;
        const from = { row: actualFromRow, col: actualFromCol };
        const to = { row: actualRow, col: actualCol };
        
        // Check if this is a pawn promotion
        if (game.isPromotion(from, to)) {
            this.showPromotionDialog(from, to, game.getCurrentPlayer());
        } else {
            // Make the move
            if (this.callbacks.onMove) {
                this.callbacks.onMove({ from, to });
            }
        }
        
        this.clearHighlights();
        this.selectedSquare = null;
    }
    
    // ...rest of existing code...
}

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
            }
            dialog.remove();
        });
        
        dialog.appendChild(pieceElement);
    });
    
    this.container.appendChild(dialog);
}
```

3. **Add CSS for the promotion dialog**:
```css
.promotion-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border: 2px solid #2c3e50;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    z-index: 10;
}

.promotion-piece {
    width: 60px;
    height: 60px;
    margin: 5px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    cursor: pointer;
}

.promotion-piece:hover {
    background-color: #f0f0f0;
}
```

### Adding Multiplayer Support

This would require significant changes, but here's a high-level approach:

1. Create a server-side component using Node.js and WebSockets
2. Modify the game.js to support remote players
3. Create a player matching system
4. Add chat functionality

This is a more complex update that would require a separate detailed documentation.

## 6. Helpful Resources

### Libraries and Documentation
- [Chess.js Documentation](https://github.com/jhlywa/chess.js/blob/master/README.md) - The JavaScript chess library used for game logic
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Documentation for the audio synthesis used in the sound manager
- [Font Awesome](https://fontawesome.com/icons) - Icons used in the user interface
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) - Documentation for localStorage used in game history

### Chess Resources
- [Chess Rules](https://www.chess.com/learn-how-to-play-chess) - Basic rules of chess
- [Chess Notation](https://en.wikipedia.org/wiki/Algebraic_notation_(chess)) - Explanation of algebraic chess notation
- [Chess Strategy](https://www.chess.com/lessons) - Resources for understanding chess strategy

### Development Resources
- [JavaScript OOP](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_programming) - Object-oriented programming in JavaScript
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) - For future modularization
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) - Used for the chess board layout

### AI and Chess Programming
- [Chess Programming Wiki](https://www.chessprogramming.org/Main_Page) - Resources for chess programming and AI
- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax) - Algorithm used in more advanced chess engines
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning) - Optimization for the minimax algorithm
