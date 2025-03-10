// Create chessSound as a global variable
const chessSound = new ChessSoundManager({
    audioPath: 'sounds/',  // Directory where your sound files are stored
    volume: 0.5,          // Initial volume level (0.0 to 1.0)
    theme: 'standard'     // Initial theme
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components for the chess application
    const board = new ChessBoard('board-container');
    const timer = new ChessTimer('player-time', 'opponent-time', 10);
    const bot = new ChessBot('medium');
    const storage = new GameStorage();
    const game = new ChessGame();
    
    // Connect all components together through game object
    game.init(board, timer, bot, storage);
    
    // Register sound callback with the game
    game.on('onSoundPlay', (soundType) => {
        chessSound.play(soundType);
    });
    
    // Cache DOM elements
    const elements = {
        // Game control buttons
        newGameBtn: document.getElementById('new-game-btn'),
        undoBtn: document.getElementById('undo-btn'),
        resignBtn: document.getElementById('resign-btn'),
        // Game setting selectors
        botLevelSelect: document.getElementById('bot-level'),
        playerColorSelect: document.getElementById('player-color'),
        timeFormatSelect: document.getElementById('time-format'),
        // Game status and move history display
        statusDisplay: document.getElementById('game-status'),
        movesList: document.getElementById('moves-list'),
        // Game end modal elements
        gameEndModal: document.getElementById('game-end-modal'),
        gameResultText: document.getElementById('game-result'),
        gameResultDetails: document.getElementById('game-result-details'),
        replayGameBtn: document.getElementById('replay-game-btn'),
        newGameModalBtn: document.getElementById('new-game-modal-btn'),
        closeModalBtn: document.querySelector('.close-modal'),
        // Replay modal elements
        replayModal: document.getElementById('replay-modal'),
        closeReplayModalBtn: document.querySelector('.close-replay-modal'),
        replayPrevBtn: document.getElementById('replay-prev'),
        replayPlayBtn: document.getElementById('replay-play'),
        replayNextBtn: document.getElementById('replay-next'),
        replayStatus: document.getElementById('replay-status'),
        // Sound control elements
        muteBtn: document.getElementById('mute-btn'),
        volumeSlider: document.getElementById('volume-slider'),
        soundThemeSelect: document.getElementById('sound-theme')
    };
    
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');

    // Initialize replay functionality variables
    let replayGame = null;
    let replayMoveIndex = 0;
    let replayInterval = null;
    let replayChess = null;
    let replayBoardInstance = null;
    
    // Setup event listeners
    elements.newGameBtn.addEventListener('click', startNewGame);
    elements.undoBtn.addEventListener('click', undoMove);
    elements.resignBtn.addEventListener('click', resignGame);
    elements.closeModalBtn.addEventListener('click', () => elements.gameEndModal.style.display = 'none');
    elements.closeReplayModalBtn.addEventListener('click', closeReplayModal);
    elements.replayGameBtn.addEventListener('click', () => {
        elements.gameEndModal.style.display = 'none';
        showReplayModal();
    });
    elements.newGameModalBtn.addEventListener('click', () => {
        elements.gameEndModal.style.display = 'none';
        startNewGame();
    });
    elements.replayPrevBtn.addEventListener('click', replayPrevMove);
    elements.replayPlayBtn.addEventListener('click', toggleReplayPlayback);
    elements.replayNextBtn.addEventListener('click', replayNextMove);
    
    muteBtn.addEventListener('click', () => {
        const soundEnabled = chessSound.toggle();
        muteBtn.innerHTML = soundEnabled ? 
            '<i class="fas fa-volume-up"></i>' : 
            '<i class="fas fa-volume-mute"></i>';
    });

    volumeSlider.addEventListener('input', () => {
        chessSound.setVolume(volumeSlider.value / 100);
    });
    
    elements.soundThemeSelect.addEventListener('change', () => {
        const theme = elements.soundThemeSelect.value;
        chessSound.setTheme(theme);
        
        // Play a sample sound to demonstrate the theme change
        setTimeout(() => chessSound.play('move'), 100);
    });
    
    // Add a custom theme example (for demonstration)
    const customTheme = {
        'move': 'custom-move.mp3',
        'capture': 'custom-capture.mp3',
        'check': 'custom-check.mp3',
        'checkmate': 'custom-checkmate.mp3',
        'stalemate': 'custom-stalemate.mp3',
        'promotion': 'custom-promotion.mp3',
        'castling': 'custom-castling.mp3'
    };
    chessSound.addTheme('custom', customTheme);

    // Register callbacks
    game.on('onStatusUpdate', updateStatus);
    game.on('onGameEnd', showGameEndModal);
    // Register callback for move history updates
    game.on('onMovesUpdate', updateMovesList);
    
    // Function implementations
    function startNewGame() {
        const playerColor = elements.playerColorSelect.value;
        const timeInMinutes = parseInt(elements.timeFormatSelect.value);
        const botLevel = elements.botLevelSelect.value;
        
        game.start(playerColor, timeInMinutes, botLevel);
        // Clear move list at start of game
        elements.movesList.innerHTML = '';
    }
    
    function undoMove() {
        game.undoLastMove();
        // updateMovesList is now handled by the callback
    }
    
    function resignGame() {
        game.resign();
    }
    
    function updateStatus(status) {
        elements.statusDisplay.textContent = status;
    }
    
    // Function to update the moves history display in the sidebar
    function updateMovesList() {
        elements.movesList.innerHTML = '';
        
        const moves = game.moveHistory;
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const moveNumber = Math.floor(i / 2) + 1;
            const isWhiteMove = i % 2 === 0;
            
            if (isWhiteMove) {
                const moveElement = document.createElement('div');
                moveElement.classList.add('move-row');
                moveElement.innerHTML = `${moveNumber}. ${move.san}`;
                
                // Also add the black move on the same row if available
                if (i + 1 < moves.length) {
                    moveElement.innerHTML += ` ${moves[i+1].san}`;
                }
                
                elements.movesList.appendChild(moveElement);
            }
        }
        
        // Scroll to show the most recent moves
        elements.movesList.scrollTop = elements.movesList.scrollHeight;
    }
    
    // Function to display the game end modal with results
    function showGameEndModal(result) {
        elements.gameResultText.textContent = 'Game Over';
        elements.gameResultDetails.textContent = result;
        elements.gameEndModal.style.display = 'block';
    }
    
    // Function to display the game replay modal
    function showReplayModal() {
        elements.replayModal.style.display = 'block';
        
        // Get the last played game from storage
        const lastGame = storage.getLastGame();
        if (lastGame) {
            replayGame = lastGame;
            replayMoveIndex = 0;
            
            // Initialize a new Chess instance with the saved PGN
            replayChess = new Chess();
            if (lastGame.pgn) {
                replayChess.load_pgn(lastGame.pgn);
            }
            
            // Reset to initial position
            while (replayChess.history().length > 0) {
                replayChess.undo();
            }
            
            // Create a new board for replay visualization
            replayBoardInstance = new ChessBoard('replay-board');
            replayBoardInstance.init({chess: replayChess}, false);
            updateReplayBoard();
        }
    }
    
    // Utility function to determine the sound type for a chess move
    function getSoundForMove(move) {
        if (!move) return 'move';
        
        if (move.captured) {
            return 'capture';
        } else if (move.flags && (move.flags.includes('k') || move.flags.includes('q'))) {
            return 'castling';
        } else if (move.flags && move.flags.includes('p')) {
            return 'promotion';
        }
        
        return 'move';
    }
    
    // Function to update the replay board to show the current move
    function updateReplayBoard() {
        if (!replayGame) return;
        
        // Reset chess to initial position
        while (replayChess.history().length > 0) {
            replayChess.undo();
        }
        
        let lastMove = null;
        
        // Apply all moves up to the current replay index
        for (let i = 0; i < replayMoveIndex; i++) {
            if (replayGame.moves[i]) {
                lastMove = replayChess.move(replayGame.moves[i]);
            }
        }
        
        // Update the board visualization
        if (replayBoardInstance) {
            replayBoardInstance.updateBoard({chess: replayChess});
        }
        
        // Update the replay status counter
        elements.replayStatus.textContent = `Move: ${replayMoveIndex}/${replayGame.moves.length}`;
        
        // Update play/pause button icon based on current state
        if (replayInterval) {
            elements.replayPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    // Function to toggle auto-playback of the game replay
    function toggleReplayPlayback() {
        if (replayInterval) {
            // If playback is active, pause it
            clearInterval(replayInterval);
            replayInterval = null;
            elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            // If playback is paused, start it
            replayInterval = setInterval(() => {
                if (replayMoveIndex < replayGame.moves.length) {
                    const move = replayGame.moves[replayMoveIndex];
                    replayMoveIndex++;
                    updateReplayBoard();
                    
                    // Play sound effect for the move
                    if (move) {
                        chessSound.play(getSoundForMove(move));
                        
                        // If this move results in a check, play the check sound after a slight delay
                        if (replayChess.in_check()) {
                            setTimeout(() => chessSound.play('check'), 150);
                        } else if (replayChess.in_checkmate()) {
                            setTimeout(() => chessSound.play('checkmate'), 150);
                        } else if (replayChess.in_stalemate()) {
                            setTimeout(() => chessSound.play('stalemate'), 150);
                        }
                    }
                } else {
                    // Stop playback when we reach the end
                    clearInterval(replayInterval);
                    replayInterval = null;
                    elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }, 1000);
            elements.replayPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
    
    function closeReplayModal() {
        elements.replayModal.style.display = 'none';
        if (replayInterval) {
            clearInterval(replayInterval);
            replayInterval = null;
        }
    }
    
    function replayPrevMove() {
        if (replayMoveIndex > 0) {
            replayMoveIndex--;
            updateReplayBoard();
            // Optional: Play a UI sound for going back
        }
    }
    
    function replayNextMove() {
        if (replayGame && replayMoveIndex < replayGame.moves.length) {
            const move = replayGame.moves[replayMoveIndex];
            replayMoveIndex++;
            updateReplayBoard();
            
            // Play sound effect for the move
            if (move) {
                chessSound.play(getSoundForMove(move));
                
                // If this move results in a check, play the check sound after a slight delay
                if (replayChess.in_check()) {
                    setTimeout(() => chessSound.play('check'), 150);
                } else if (replayChess.in_checkmate()) {
                    setTimeout(() => chessSound.play('checkmate'), 150);
                } else if (replayChess.in_stalemate()) {
                    setTimeout(() => chessSound.play('stalemate'), 150);
                }
            }
        }
    }
    
    // Start a new game when the page loads
    startNewGame();
});

document.addEventListener('click', () => {
    chessSound.resumeAudioContext();
}, { once: true });
