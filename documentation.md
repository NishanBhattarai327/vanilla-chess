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
- Customizable sound themes (standard, classic, modern)

## 2. System Architecture

The application follows an object-oriented architecture with several core components that interact together:

### Core Components
1. **ChessGame** (game.js)
   - Central component that controls game state and logic
   - Manages game lifecycle (start, play, end)
   - Coordinates interactions between other components
   - Uses chess.js library for rules and validation
   - Handles position conversion between algebraic notation and row/column coordinates

2. **ChessBoard** (board.js)
   - Handles the visual representation and rendering of the chess board
   - Manages user interactions (selecting pieces, making moves)
   - Shows visual indicators for selected pieces and valid moves
   - Provides integrated rank and file notation
   - Supports board flipping when playing as black

3. **ChessBot** (bot.js)
   - Implements the AI opponent with three difficulty levels
   - Uses different strategies based on selected level:
     - Easy: Random moves
     - Medium: Prioritizes captures and checks
     - Hard: Uses position evaluation with piece value assessment, center control bonuses, and tactical considerations

4. **ChessTimer** (timer.js)
   - Implements chess clock functionality with configurable time formats
   - Manages time for both players
   - Handles time-based game termination
   - Supports time display formatting

5. **GameStorage** (storage.js)
   - Manages persistent storage of game history using localStorage
   - Stores PGN notation, move history, and game results
   - Provides retrieval methods for game replay
   - Limits storage to the most recent 10 games

6. **ChessSoundManager** (sound.js)
   - Advanced sound system with dual implementation:
     - Audio file playback for standard sounds
     - Web Audio API for synthesized sounds when audio files are unavailable
   - Provides distinct sounds for different chess events:
     - Regular moves with wooden click effects
     - Captures with impact sounds
     - Checks, checkmates, stalemates with appropriate alerts
     - Special moves (castling, promotion) with distinctive sounds
   - Features volume control, mute functionality, and sound themes
   - Includes sophisticated audio synthesis with ADSR envelopes and filters for realistic wooden chess sounds

7. **Application Initialization** (app.js)
   - Initializes and connects all components
   - Sets up event handlers and UI interactions
   - Manages game modals and UI updates
   - Handles game replay functionality

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
│   └── styles.css              # Main stylesheet with responsive design
├── img/                        # Directory for chess piece images
│   ├── wP.svg, wR.svg, etc.    # White pieces (Pawn, Rook, etc.)
│   └── bP.svg, bR.svg, etc.    # Black pieces (Pawn, Rook, etc.)
├── sounds/                     # Directory for sound files
│   ├── move.mp3                # Sound for regular moves
│   ├── capture.mp3             # Sound for capturing pieces
│   ├── check.mp3               # Sound for checks
│   ├── checkmate.mp3           # Sound for checkmate
│   ├── stalemate.mp3           # Sound for stalemate
│   ├── promotion.mp3           # Sound for pawn promotion
│   └── castling.mp3            # Sound for castling
├── js/
│   ├── app.js                  # Main application initialization
│   ├── board.js                # Chess board UI and interaction
│   ├── bot.js                  # AI opponent logic
│   ├── game.js                 # Core game mechanics
│   ├── storage.js              # Game history storage
│   ├── timer.js                # Chess clock functionality
│   └── sound.js                # Advanced sound effects management
├── index.html                  # Main HTML structure
├── documentation.md            # This comprehensive documentation
└── .vscode/                    # VSCode configuration
```

### Key Files Explained

- **index.html**: Entry point that sets up the HTML structure, includes chess.js library, and loads application scripts.
- **app.js**: Initializes components, connects them together, and handles game and replay functionality.
- **game.js**: Core game logic with position conversion utilities, move validation, and game state management.
- **board.js**: Visual representation with piece placement, move highlighting, and user interaction handling.
- **bot.js**: AI opponent with three difficulty levels and sophisticated move evaluation for harder levels.
- **timer.js**: Chess clock implementation with time tracking, formatting, and player switching.
- **storage.js**: Game history management using localStorage with PGN and move history storage.
- **sound.js**: Comprehensive sound system with both file playback and Web Audio API synthesis.
- **styles.css**: Complete styling with responsive design for different screen sizes.

## 4. Functionality

### Game Initialization Flow
1. **DOM Content Loaded**
   - app.js initializes core components including sound manager with default volume and theme
   - Default settings are applied (medium bot level, player as white, 10-minute timer)
   - New game is started

2. **Starting a New Game**
   - User selects settings (bot level, player color, time)
   - ChessGame.start() initializes the game
   - Board is set up with pieces in starting positions
   - Timer is initialized with selected time format
   - If player is black, board is flipped and bot makes first move

### Player Move Flow
1. User clicks on a piece of their color
2. Valid moves are highlighted on the board
3. User clicks on a destination square
4. ChessBoard sends move to ChessGame
5. ChessGame validates and executes the move using chess.js
6. Appropriate sound effect is played based on move type (regular move, capture, check, etc.)
7. Board is updated with new position
8. Timer switches to opponent
9. Game checks for end conditions
10. Bot calculates and makes its move

### Bot Move Flow
1. ChessBot.getMove() is called with current game state
2. Based on difficulty level:
   - Easy: Selects a random valid move
   - Medium: Prioritizes captures and checks over random moves
   - Hard: Evaluates positions with piece values, center control, and check bonuses
3. Bot "thinks" for a delay period based on level (500ms for easy, 1000ms for medium, 2000ms for hard)
4. Move is executed and appropriate sound is played
5. Board is updated with new position
6. Timer switches back to player
7. Game checks for end conditions

### Sound System Details
1. **Dual Implementation**:
   - Tries to use pre-recorded audio files first
   - Falls back to Web Audio API synthesis if files are unavailable
   - Resumable AudioContext to comply with browser autoplay policies

2. **Sound Types and Implementation**:
   - Move: Simulates wooden piece placement with transients and resonance
   - Capture: More substantial wooden impact with deeper resonance
   - Check: Alert tone with specific frequencies
   - Checkmate: Multi-tone sequence indicating game end
   - Stalemate: Neutral ending tone
   - Castling: Two sequential wooden clicks with timing separation
   - Promotion: Celebratory tone sequence

3. **Advanced Audio Features**:
   - ADSR envelope control (Attack, Decay, Sustain, Release)
   - Low-pass filtering for realistic wooden sounds
   - Noise generation with custom shaping for authentic chess piece movement
   - Multiple oscillators for rich, complex sounds
   - Volume normalization and consistent acoustic character

4. **Themable Sound System**:
   - Standard, Classic, and Modern built-in themes
   - Support for custom theme creation
   - API for adding new themes at runtime

### Game End Conditions
1. **Checkmate**: A player's king is in check and has no legal moves
2. **Stalemate**: A player has no legal moves but is not in check
3. **Insufficient Material**: Not enough pieces remain to deliver checkmate
4. **Threefold Repetition**: Same position occurs three times
5. **Time Out**: A player's time runs out
6. **Resignation**: Player clicks the resign button

### Game Replay Flow
1. User clicks "Replay Game" button in the end game modal
2. Replay modal opens with the saved game loaded from storage
3. User can navigate through moves using:
   - Previous Move button to step backward
   - Play/Pause button for automatic playback at 1-second intervals
   - Next Move button to step forward
4. Chess positions are displayed for each move with appropriate piece placement
5. Sound effects are played during replay to match the move types
6. Replay status shows current move number and total moves

## 5. Feature Updates

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

### Adding Support for Openings Book

1. **Create a new file openings.js**:
```javascript
class OpeningsBook {
    constructor() {
        this.openings = {
            'e2e4': ['e7e5', 'c7c5', 'e7e6'],  // King's Pawn
            'e2e4 e7e5': ['g1f3', 'f1c4'],     // After 1.e4 e5
            'e2e4 c7c5': ['g1f3', 'd2d4'],     // Sicilian
            // Add more openings as needed
        };
    }
    
    getMove(moveHistory) {
        const historyString = moveHistory.map(m => m.from + m.to).join(' ');
        if (this.openings[historyString]) {
            const moves = this.openings[historyString];
            return moves[Math.floor(Math.random() * moves.length)];
        }
        return null;
    }
}
```

2. **Update bot.js to use openings book**:
```javascript
async getMove(game) {
    // Simulate "thinking" time
    await new Promise(resolve => setTimeout(resolve, this.thinkingTime[this.level]));
    
    // Use openings book for the first few moves if available
    if (this.openingsBook && game.moveHistory.length < 10) {
        const bookMove = this.openingsBook.getMove(game.moveHistory);
        if (bookMove) {
            // Convert from simple notation (e2e4) to chess.js move object
            const from = bookMove.substring(0, 2);
            const to = bookMove.substring(2, 4);
            const possibleMoves = this.getAllPossibleMoves(game);
            const move = possibleMoves.find(m => m.from === from && m.to === to);
            if (move) return move;
        }
    }
    
    // Fall back to regular move selection
    const possibleMoves = this.getAllPossibleMoves(game);
    // ...existing code...
}
```

### Enhancing the Sound System with Environmental Effects

1. **Add reverb to the sound manager**:
```javascript
class ChessSoundManager {
    constructor(options = {}) {
        // ...existing code...
        this.reverbEnabled = options.reverbEnabled !== false;
        
        // Initialize reverb effect
        if (this.audioContext) {
            this.createReverb();
        }
    }
    
    // Create reverb effect
    createReverb() {
        this.reverbNode = this.audioContext.createConvolver();
        
        // Generate impulse response for small room reverb
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2.0; // 2 second impulse
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);
        
        let decay = 2.0;
        for (let i = 0; i < length; i++) {
            const n = i / length;
            leftChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
            rightChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
        }
        
        this.reverbNode.buffer = impulse;
    }
    
    // Route sound through reverb if enabled
    playWithReverb(audioNode) {
        if (this.reverbEnabled && this.reverbNode) {
            const dryGain = this.audioContext.createGain();
            const wetGain = this.audioContext.createGain();
            
            dryGain.gain.value = 0.7;
            wetGain.gain.value = 0.3;
            
            audioNode.connect(dryGain);
            audioNode.connect(this.reverbNode);
            this.reverbNode.connect(wetGain);
            
            dryGain.connect(this.audioContext.destination);
            wetGain.connect(this.audioContext.destination);
        } else {
            audioNode.connect(this.audioContext.destination);
        }
    }
}
```

2. **Add UI control for environmental effects**:
```html
<div class="setting-group">
    <label for="sound-environment">Sound Environment:</label>
    <select id="sound-environment">
        <option value="none">None</option>
        <option value="room" selected>Small Room</option>
        <option value="hall">Concert Hall</option>
    </select>
</div>
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
- [Opening Theory](https://www.chessprogramming.org/Openings) - Information about chess openings

### Development Resources
- [JavaScript OOP](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_programming) - Object-oriented programming in JavaScript
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) - For future modularization
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) - Used for the chess board layout

### AI and Chess Programming
- [Chess Programming Wiki](https://www.chessprogramming.org/Main_Page) - Resources for chess programming and AI
- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax) - Algorithm used in more advanced chess engines
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning) - Optimization for the minimax algorithm
- [Evaluation Functions](https://www.chessprogramming.org/Evaluation) - How to evaluate chess positions
