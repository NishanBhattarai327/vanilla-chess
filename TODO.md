# Vanilla Chess TODO List

## Feature Updates

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
            wetGain.connect this.audioContext.destination);
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