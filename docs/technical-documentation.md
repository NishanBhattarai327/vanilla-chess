# Vanilla Chess Technical Documentation

## 1. Project Overview
The Vanilla Chess is a web-based chess game built using vanilla JavaScript with an object-oriented approach. It allows users to play chess against an AI bot with adjustable difficulty levels. The application features a responsive design, chess timer functionality, game history storage, sound effects, and interactive game replay.

### Main Features
- Play against an AI bot with three difficulty levels (easy, medium, hard)
- Responsive chessboard with integrated rank and file notation
- Intuitive drag-and-drop piece movement with fallback click-based moves
- Chess timer with configurable time formats
- Game history storage and interactive replay functionality
- Visual indicators for selected pieces, valid moves, and last moves
- Player color selection (white or black)
- Sound effects for moves, captures, checks, and other game events
- Volume control and mute functionality
- Customizable sound themes (standard, classic, modern)
- Pawn promotion dialog for selecting promotion pieces
- Visual check indicators when a king is in check
- Mobile-friendly responsive design

## 2. System Architecture

The application follows an object-oriented architecture with several core components that interact together:

### Core Components
1. **ChessGame** (game.js)
   - Central component that controls game state and logic
   - Manages game lifecycle (start, play, end)
   - Coordinates interactions between other components
   - Uses chess.js library for rules and validation
   - Handles position conversion between algebraic notation and row/column coordinates
   - Implements pawn promotion logic
   - Maintains game move history

2. **ChessBoard** (board.js)
   - Handles the visual representation and rendering of the chess board
   - Manages user interactions via both click and drag-and-drop interfaces
   - Shows visual indicators for selected pieces, valid moves, and last move
   - Provides integrated rank and file notation
   - Supports board flipping when playing as black
   - Displays promotion piece selection dialog when needed
   - Highlights kings that are in check
   - Implements smooth drag-and-drop functionality with mouse and touch support
   - Provides visual cues like hover effects and highlighting

3. **ChessBot** (bot.js)
   - Implements the AI opponent with three difficulty levels
   - Uses different strategies based on selected level:
     - Easy: Random moves
     - Medium: Prioritizes captures and checks
     - Hard: Uses position evaluation with piece value assessment, center control bonuses, and tactical considerations
   - Simulates "thinking" time appropriate to difficulty level

4. **ChessTimer** (timer.js)
   - Implements chess clock functionality with configurable time formats
   - Manages time for both players
   - Handles time-based game termination
   - Supports time display formatting
   - Switches active timer when turns change

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
   - Supports multiple sound themes including standard, classic, and modern
   - Allows for custom theme creation via API

7. **Application Initialization** (app.js)
   - Initializes and connects all components
   - Sets up event handlers and UI interactions
   - Manages game modals and UI updates
   - Handles game replay functionality
   - Controls sound settings and themes

### Component Interaction Diagram
```
                  ┌───────────────┐
User ─────────────► ChessBoard    ◄────────────────┐
                  └───────┬───────┘                │
                          │                        │
                          ▼                        │
                  ┌───────────────┐        ┌───────────────┐
                  │   ChessGame   ◄────────►  ChessSound   │
                  └───────┬───────┘        └───────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   ChessBot   │ │  ChessTimer  │ │ GameStorage  │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 3. File Structure

```
chess-app/
├── css/
│   └── styles.css              # Main stylesheet with responsive design
├── img/                        # Directory for chess piece images
│   ├── wP.svg, wR.svg, etc.    # White pieces (Pawn, Rook, etc.)
│   └── bP.svg, bR.svg, etc.    # Black pieces (Pawn, Rook, etc.)
├── sounds/                     # Directory for sound files (optional)
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
├── README.md                   # Project introduction
├── TODO.md                     # Planned features and improvements
├── docs/                       # Documentation directory
│   ├── technical-documentation.md  # This comprehensive documentation
│   ├── move-execution.md       # How chess moves are processed
│   ├── piece-selection.md      # Visual feedback for chess pieces
│   └── drag-and-drop.md        # Drag-and-drop implementation details
└── .vscode/                    # VSCode configuration
```

### Key Files Explained

- **index.html**: Entry point that sets up the HTML structure, includes chess.js library, and loads application scripts.
- **app.js**: Initializes components, connects them together, and handles game and replay functionality.
- **game.js**: Core game logic with position conversion utilities, move validation, and game state management.
- **board.js**: Visual representation with piece placement, move highlighting, and user interaction handling through both click and drag-and-drop interfaces.
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
1. Player can move pieces using two methods:
   - **Click-based**: Click on a piece, then click on a destination square
   - **Drag-and-drop**: Drag a piece directly to its destination square

2. For click-based moves:
   - User clicks on a piece of their color
   - Valid moves are highlighted on the board
   - User clicks on a destination square
   - ChessBoard sends move to ChessGame

3. For drag-and-drop moves:
   - User presses down on a piece of their color
   - Valid moves are highlighted on the board
   - User drags the piece (a visual representation follows the cursor/finger)
   - User releases the piece over a destination square
   - ChessBoard sends move to ChessGame

4. After move validation:
   - ChessGame validates and executes the move using chess.js
   - Appropriate sound effect is played based on move type
   - Board is updated with new position and last move highlight
   - Timer switches to opponent
   - Game checks for end conditions
   - Bot calculates and makes its move if applicable

### Bot Move Flow
1. ChessBot.getMove() is called with current game state
2. Based on difficulty level:
   - Easy: Selects a random valid move
   - Medium: Prioritizes captures and checks over random moves
   - Hard: Evaluates positions with piece values, center control, and check bonuses
3. Bot "thinks" for a delay period based on level (500ms for easy, 1000ms for medium, 2000ms for hard)
4. Move is executed and appropriate sound is played
5. Board is updated with new position and last move highlight
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
   - Volume control and mute functionality

### Responsive Design
1. **Desktop Layout**:
   - Sidebar with controls next to the chessboard
   - Full-size chessboard with clear piece rendering

2. **Mobile Layout**:
   - Stacked layout with board above controls
   - Appropriately sized touch targets for mobile interaction
   - Drag-and-drop optimized for touch events
   - Responsive modals and dialogs

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

## 5. Helpful Resources

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
- [Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) - For mobile interaction

### AI and Chess Programming
- [Chess Programming Wiki](https://www.chessprogramming.org/Main_Page) - Resources for chess programming and AI
- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax) - Algorithm used in more advanced chess engines
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning) - Optimization for the minimax algorithm
- [Evaluation Functions](https://www.chessprogramming.org/Evaluation) - How to evaluate chess positions
