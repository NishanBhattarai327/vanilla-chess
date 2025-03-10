document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components for the chess application
    const board = new ChessBoard('board-container');
    const timer = new ChessTimer('player-time', 'opponent-time', 10);
    const bot = new ChessBot('medium');
    const storage = new GameStorage();
    const game = new ChessGame();
    
    // Connect all components together through game object
    game.init(board, timer, bot, storage);
    
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
        replayStatus: document.getElementById('replay-status')
    };
    
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
    
    // Register callbacks
    game.on('onStatusUpdate', updateStatus);
    game.on('onGameEnd', showGameEndModal);
    
    // Function implementations
    function startNewGame() {
        const playerColor = elements.playerColorSelect.value;
        const timeInMinutes = parseInt(elements.timeFormatSelect.value);
        const botLevel = elements.botLevelSelect.value;
        
        game.start(playerColor, timeInMinutes, botLevel);
        updateMovesList();
    }
    
    function undoMove() {
        game.undoLastMove();
        updateMovesList();
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
    
    // Function to update the replay board to show the current move
    function updateReplayBoard() {
        if (!replayGame) return;
        
        // Reset chess to initial position
        while (replayChess.history().length > 0) {
            replayChess.undo();
        }
        
        // Apply all moves up to the current replay index
        for (let i = 0; i < replayMoveIndex; i++) {
            if (replayGame.moves[i]) {
                replayChess.move(replayGame.moves[i]);
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
                    replayMoveIndex++;
                    updateReplayBoard();
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
        }
    }
    
    function replayNextMove() {
        if (replayGame && replayMoveIndex < replayGame.moves.length) {
            replayMoveIndex++;
            updateReplayBoard();
        }
    }
    
    // Start a new game when the page loads
    startNewGame();
});
