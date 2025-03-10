class ChessTimer {
    constructor(playerTimeId, opponentTimeId, timeInMinutes = 10) {
        this.playerTimeElement = document.getElementById(playerTimeId);
        this.opponentTimeElement = document.getElementById(opponentTimeId);
        this.timeInSeconds = timeInMinutes * 60;
        this.playerTime = this.timeInSeconds;
        this.opponentTime = this.timeInSeconds;
        this.activeTimer = null;
        this.interval = null;
        this.callbacks = {};
    }

    init(timeInMinutes) {
        this.timeInSeconds = timeInMinutes * 60;
        this.playerTime = this.timeInSeconds;
        this.opponentTime = this.timeInSeconds;
        this.updateDisplay();
        this.stop();
    }

    updateDisplay() {
        this.playerTimeElement.textContent = this.formatTime(this.playerTime);
        this.opponentTimeElement.textContent = this.formatTime(this.opponentTime);
    }

    formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    start(playerColor) {
        this.stop();
        this.activeTimer = playerColor;
        
        this.interval = setInterval(() => {
            if (this.activeTimer === 'white') {
                this.playerTime--;
                if (this.playerTime <= 0) {
                    this.handleTimeout('white');
                }
            } else {
                this.opponentTime--;
                if (this.opponentTime <= 0) {
                    this.handleTimeout('black');
                }
            }
            this.updateDisplay();
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    switchTimer() {
        this.activeTimer = this.activeTimer === 'white' ? 'black' : 'white';
    }

    handleTimeout(color) {
        this.stop();
        if (this.callbacks.onTimeout) {
            this.callbacks.onTimeout(color);
        }
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }
}
