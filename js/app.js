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
        // Pages
        settingsPage: document.getElementById('settings-page'),
        gamePage: document.getElementById('game-page'),
        
        // Settings page elements
        botLevelSelect: document.getElementById('bot-level'),
        playerColorSelect: document.getElementById('player-color'),
        timeFormatSelect: document.getElementById('time-format'),
        startGameBtn: document.getElementById('start-game-btn'),
        settingsMuteBtn: document.getElementById('settings-mute-btn'),
        settingsVolumeSlider: document.getElementById('settings-volume-slider'),
        settingsSoundTheme: document.getElementById('sound-theme'),
        
        // Game page elements
        backToSettingsBtn: document.getElementById('back-to-settings-btn'),
        undoBtn: document.getElementById('undo-btn'),
        flipBoardBtn: document.getElementById('flip-board-btn'),
        resignBtn: document.getElementById('resign-btn'),
        statusDisplay: document.getElementById('game-status'),
        movesList: document.getElementById('moves-list'),
        muteBtn: document.getElementById('mute-btn'),
        volumeSlider: document.getElementById('volume-slider'),
        soundThemeGame: document.getElementById('sound-theme-game'),
        
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
    };
    
    // Initialize replay functionality variables
    let replayGame = null;
    let replayMoveIndex = 0;
    let replayInterval = null;
    let replayChess = null;
    let replayBoardInstance = null;
    
    // Page navigation functions
    function showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the requested page
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.classList.add('active');
            
            // If showing game page, make sure the board is properly initialized
            if (pageId === 'game-page') {
                // Give a slight delay to ensure DOM is ready
                setTimeout(() => {
                    board.init(game, game.playerColor === 'black');
                }, 100);
            }
        }
    }
    
    // Sync settings between pages
    function syncSettings() {
        // Sync sound theme if elements exist
        if (elements.soundThemeGame && elements.settingsSoundTheme) {
            elements.soundThemeGame.value = elements.settingsSoundTheme.value;
        }
        
        // Sync volume if elements exist
        if (elements.volumeSlider && elements.settingsVolumeSlider) {
            elements.volumeSlider.value = elements.settingsVolumeSlider.value;
        }
        
        // Update mute button states based on sound manager
        const soundEnabled = !chessSound.isMuted;
        if (elements.muteBtn) {
            elements.muteBtn.innerHTML = soundEnabled ? 
                '<i class="fas fa-volume-up"></i>' : 
                '<i class="fas fa-volume-mute"></i>';
        }
        if (elements.settingsMuteBtn) {
            elements.settingsMuteBtn.innerHTML = soundEnabled ?
                '<i class="fas fa-volume-up"></i>' : 
                '<i class="fas fa-volume-mute"></i>';
        }
    }
    
    // Setup event listeners for page navigation
    if (elements.startGameBtn) {
        elements.startGameBtn.addEventListener('click', () => {
            startNewGame();
            showPage('game-page');
            syncSettings();
        });
    }
    
    if (elements.backToSettingsBtn) {
        elements.backToSettingsBtn.addEventListener('click', () => {
            showPage('settings-page');
        });
    }
    
    // Setup event listeners for game controls
    if (elements.flipBoardBtn) {
        elements.flipBoardBtn.addEventListener('click', () => {
            board.flipBoard(game);
        });
    }
    
    if (elements.undoBtn) {
        elements.undoBtn.addEventListener('click', undoMove);
    }
    
    if (elements.resignBtn) {
        elements.resignBtn.addEventListener('click', resignGame);
    }
    
    // Setup event listeners for modals
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => {
            if (elements.gameEndModal) {
                elements.gameEndModal.style.display = 'none';
            }
        });
    }
    
    if (elements.closeReplayModalBtn) {
        elements.closeReplayModalBtn.addEventListener('click', closeReplayModal);
    }
    
    if (elements.replayGameBtn) {
        elements.replayGameBtn.addEventListener('click', () => {
            if (elements.gameEndModal) {
                elements.gameEndModal.style.display = 'none';
            }
            showReplayModal();
        });
    }
    
    if (elements.newGameModalBtn) {
        elements.newGameModalBtn.addEventListener('click', () => {
            if (elements.gameEndModal) {
                elements.gameEndModal.style.display = 'none';
            }
            showPage('settings-page');
        });
    }
    
    // Setup event listeners for replay controls
    if (elements.replayPrevBtn) {
        elements.replayPrevBtn.addEventListener('click', replayPrevMove);
    }
    
    if (elements.replayPlayBtn) {
        elements.replayPlayBtn.addEventListener('click', toggleReplayPlayback);
    }
    
    if (elements.replayNextBtn) {
        elements.replayNextBtn.addEventListener('click', replayNextMove);
    }
    
    // Setup event listeners for sound controls
    if (elements.muteBtn) {
        elements.muteBtn.addEventListener('click', () => {
            const soundEnabled = chessSound.toggle();
            if (elements.muteBtn) {
                elements.muteBtn.innerHTML = soundEnabled ? 
                    '<i class="fas fa-volume-up"></i>' : 
                    '<i class="fas fa-volume-mute"></i>';
            }
            if (elements.settingsMuteBtn) {
                elements.settingsMuteBtn.innerHTML = soundEnabled ? 
                    '<i class="fas fa-volume-up"></i>' : 
                    '<i class="fas fa-volume-mute"></i>';
            }
        });
    }
    
    if (elements.settingsMuteBtn) {
        elements.settingsMuteBtn.addEventListener('click', () => {
            const soundEnabled = chessSound.toggle();
            if (elements.muteBtn) {
                elements.muteBtn.innerHTML = soundEnabled ? 
                    '<i class="fas fa-volume-up"></i>' : 
                    '<i class="fas fa-volume-mute"></i>';
            }
            if (elements.settingsMuteBtn) {
                elements.settingsMuteBtn.innerHTML = soundEnabled ? 
                    '<i class="fas fa-volume-up"></i>' : 
                    '<i class="fas fa-volume-mute"></i>';
            }
        });
    }

    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', () => {
            const volume = elements.volumeSlider.value / 100;
            chessSound.setVolume(volume);
            if (elements.settingsVolumeSlider) {
                elements.settingsVolumeSlider.value = elements.volumeSlider.value;
            }
        });
    }
    
    if (elements.settingsVolumeSlider) {
        elements.settingsVolumeSlider.addEventListener('input', () => {
            const volume = elements.settingsVolumeSlider.value / 100;
            chessSound.setVolume(volume);
            if (elements.volumeSlider) {
                elements.volumeSlider.value = elements.settingsVolumeSlider.value;
            }
        });
    }
    
    if (elements.soundThemeGame) {
        elements.soundThemeGame.addEventListener('change', () => {
            const theme = elements.soundThemeGame.value;
            chessSound.setTheme(theme);
            if (elements.settingsSoundTheme) {
                elements.settingsSoundTheme.value = theme;
            }
            // Play a sample sound to demonstrate the theme change
            setTimeout(() => chessSound.play('move'), 100);
        });
    }
    
    if (elements.settingsSoundTheme) {
        elements.settingsSoundTheme.addEventListener('change', () => {
            const theme = elements.settingsSoundTheme.value;
            chessSound.setTheme(theme);
            if (elements.soundThemeGame) {
                elements.soundThemeGame.value = theme;
            }
            // Play a sample sound to demonstrate the theme change
            setTimeout(() => chessSound.play('move'), 100);
        });
    }
    
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
    game.on('onMovesUpdate', updateMovesList);
    game.on('onSaveGame', (gameData) => storage.saveGame(gameData));
    
    // Function implementations
    function startNewGame() {
        if (elements.playerColorSelect && elements.timeFormatSelect && elements.botLevelSelect) {
            const playerColor = elements.playerColorSelect.value;
            const timeInMinutes = parseInt(elements.timeFormatSelect.value);
            const botLevel = elements.botLevelSelect.value;
            
            game.start(playerColor, timeInMinutes, botLevel);
            
            // Clear move list at start of game
            if (elements.movesList) {
                elements.movesList.innerHTML = '';
            }
        }
    }
    
    function undoMove() {
        game.undoLastMove();
        // updateMovesList is now handled by the callback
    }
    
    function resignGame() {
        game.resign();
    }
    
    function updateStatus(status) {
        if (elements.statusDisplay) {
            elements.statusDisplay.textContent = status;
        }
    }
    
    // Function to update the moves history display in the sidebar
    function updateMovesList() {
        if (!elements.movesList) return;
        
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
        if (!elements.gameEndModal || !elements.gameResultText || !elements.gameResultDetails) return;
        
        elements.gameResultText.textContent = 'Game Over';
        elements.gameResultDetails.textContent = result;
        elements.gameEndModal.style.display = 'block';
        
        // Save final game state including player color
        game.saveGameState();
    }
    
    // Function to display the game replay modal
    function showReplayModal() {
        if (!elements.replayModal) return;
        
        elements.replayModal.style.display = 'block';
        
        // Get the last played game from storage
        const lastGame = storage.getLastGame();
        if (lastGame) {
            replayGame = lastGame;
            replayMoveIndex = 0;
            
            // Normalize the moves property (might be stored as moveHistory)
            if (!replayGame.moves && replayGame.moveHistory) {
                replayGame.moves = replayGame.moveHistory;
                console.log("Using moveHistory as moves for replay");
            }
            
            // Ensure moves array exists
            if (!replayGame.moves || !Array.isArray(replayGame.moves)) {
                replayGame.moves = [];
                console.warn('Game has no moves array, creating empty one');
            }
            
            // Log replay details for debugging
            console.log("Replay game data:", {
                pgn: replayGame.pgn,
                movesCount: replayGame.moves.length,
                result: replayGame.result
            });
            
            // Initialize a new Chess instance with the saved PGN
            replayChess = new Chess();
            if (lastGame.pgn && lastGame.pgn.trim() !== '') {
                try {
                    replayChess.load_pgn(lastGame.pgn);
                    console.log("PGN loaded successfully");
                } catch (e) {
                    console.error("Error loading PGN:", e);
                    
                    // Fallback: Try to replay the moves directly if PGN loading fails
                    if (Array.isArray(replayGame.moves) && replayGame.moves.length > 0) {
                        console.log("Falling back to replaying moves directly");
                        try {
                            replayMoveIndex = 0;
                            // We'll replay the moves in updateReplayBoard
                        } catch (moveError) {
                            console.error("Error replaying move:", moveError);
                        }
                    }
                }
            } else if (Array.isArray(replayGame.moves) && replayGame.moves.length > 0) {
                console.log("No PGN found, will replay moves directly");
                // We'll replay the moves in updateReplayBoard
            }
            
            // Reset to initial position
            while (replayChess.history().length > 0) {
                replayChess.undo();
            }
            
            // Create a new board for replay visualization
            replayBoardInstance = new ChessBoard('replay-board');
            // Use the player's color preference from the saved game to determine board orientation
            const shouldFlip = lastGame.playerColor === 'black';
            replayBoardInstance.init({chess: replayChess}, shouldFlip);
            
            // Add result information to the replay status if game was resigned
            if (lastGame.result && lastGame.result.includes('resignation')) {
                const resultElement = document.createElement('div');
                resultElement.classList.add('replay-result');
                resultElement.textContent = lastGame.result;
                if (elements.replayStatus.parentNode) {
                    elements.replayStatus.parentNode.appendChild(resultElement);
                }
            }
            
            updateReplayBoard();
        }
    }
    
    function updateReplayBoard() {
        if (!replayGame || !replayChess || !replayBoardInstance || !elements.replayStatus) return;
        
        // Reset chess to initial position
        while (replayChess.history().length > 0) {
            replayChess.undo();
        }
        
        let lastMove = null;
        let appliedMoves = 0;
        
        // Ensure moves array exists before trying to iterate through it
        if (replayGame.moves && Array.isArray(replayGame.moves)) {
            // Apply all moves up to the current replay index
            for (let i = 0; i < replayMoveIndex; i++) {
                if (i < replayGame.moves.length && replayGame.moves[i]) {
                    try {
                        lastMove = replayChess.move(replayGame.moves[i]);
                        appliedMoves++;
                    } catch (e) {
                        console.error(`Error applying move at index ${i}:`, e, replayGame.moves[i]);
                    }
                }
            }
        }
        
        // Update the board visualization
        replayBoardInstance.updateBoard({chess: replayChess});
        
        // Update the replay status counter with a safe access to moves.length
        const movesLength = replayGame.moves && Array.isArray(replayGame.moves) ? replayGame.moves.length : 0;
        elements.replayStatus.textContent = `Move: ${appliedMoves}/${movesLength}`;
        
        // Show game result when at the last move
        if (replayGame.result && appliedMoves === movesLength) {
            elements.replayStatus.textContent += ` - ${replayGame.result}`;
        }
        
        // Update play/pause button icon based on current state
        if (elements.replayPlayBtn) {
            if (replayInterval) {
                elements.replayPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
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
    
    // Function to toggle auto-playback of the game replay
    function toggleReplayPlayback() {
        if (!replayGame || !elements.replayPlayBtn) return;
        
        // Ensure moves array exists
        if (!replayGame.moves || !Array.isArray(replayGame.moves)) {
            replayGame.moves = [];
            console.warn('Game has no moves array during playback');
        }
        
        if (replayInterval) {
            // If playback is active, pause it
            clearInterval(replayInterval);
            replayInterval = null;
            elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            // If playback is paused, start it
            replayInterval = setInterval(() => {
                if (replayGame.moves && replayMoveIndex < replayGame.moves.length) {
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
                    if (elements.replayPlayBtn) {
                        elements.replayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }
                }
            }, 1000);
            elements.replayPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
    
    function closeReplayModal() {
        if (!elements.replayModal) return;
        
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
        if (!replayGame || !replayChess) return;
        
        // Ensure moves array exists
        if (!replayGame.moves || !Array.isArray(replayGame.moves)) {
            replayGame.moves = [];
            console.warn('Game has no moves array during next move');
            return;
        }
        
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
        }
    }
    
    // Show settings page initially (instead of starting game directly)
    showPage('settings-page');
    
    // Still initialize sound settings on both pages
    syncSettings();
});

document.addEventListener('click', () => {
    chessSound.resumeAudioContext();
}, { once: true });
