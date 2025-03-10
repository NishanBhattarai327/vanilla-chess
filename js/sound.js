/**
 * ChessSoundManager - A class to manage sounds for a chess application
 * Supports both audio file playback and synthesized sounds using Web Audio API
 */
class ChessSoundManager {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.volume = options.volume || 0.5;
        this.useAudioFiles = options.useAudioFiles !== false;
        this.audioPath = options.audioPath || '';
        this.currentTheme = options.theme || 'standard';
        
        // Define paths to sound files
        this.soundFiles = {
            'move': 'move.mp3',
            'capture': 'capture.mp3',
            'check': 'check.mp3',
            'checkmate': 'checkmate.mp3',
            'stalemate': 'stalemate.mp3',
            'promotion': 'promotion.mp3',
            'castling': 'castling.mp3'
        };
        
        // Define sound themes
        this.soundThemes = {
            'standard': {
                'move': 'move.mp3',
                'capture': 'capture.mp3',
                'check': 'check.mp3',
                'checkmate': 'checkmate.mp3',
                'stalemate': 'stalemate.mp3',
                'promotion': 'promotion.mp3',
                'castling': 'castling.mp3'
            },
            'classic': {
                'move': 'classic-move.mp3',
                'capture': 'classic-capture.mp3',
                'check': 'classic-check.mp3',
                'checkmate': 'classic-checkmate.mp3',
                'stalemate': 'classic-stalemate.mp3',
                'promotion': 'classic-promotion.mp3',
                'castling': 'classic-castling.mp3'
            },
            'modern': {
                'move': 'modern-move.mp3',
                'capture': 'modern-capture.mp3',
                'check': 'modern-check.mp3',
                'checkmate': 'modern-checkmate.mp3',
                'stalemate': 'modern-stalemate.mp3',
                'promotion': 'modern-promotion.mp3',
                'castling': 'modern-castling.mp3'
            }
        };
        
        // Override default files if provided
        if (options.soundFiles) {
            this.soundFiles = { ...this.soundFiles, ...options.soundFiles };
        }
        
        // Apply initial theme
        if (this.currentTheme && this.soundThemes[this.currentTheme]) {
            this.soundFiles = { ...this.soundFiles, ...this.soundThemes[this.currentTheme] };
        }
        
        this.audioContext = null;
        this.audioBuffers = {};
        this.audioElements = {};
        
        // Initialize audio
        this.init();
    }
    
    /**
     * Initialize audio systems
     */
    init() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }
    
    /**
     * Play a chess sound
     * @param {string} soundType - Type of sound to play ('move', 'capture', etc.)
     */
    play(soundType) {
        if (!this.enabled) return;
        
        if (!Object.keys(this.soundFiles).includes(soundType)) {
            console.warn(`Unknown sound type: ${soundType}`);
            return;
        }
        
        // Try to play audio file first
        if (this.useAudioFiles && this.audioElements[soundType]) {
            try {
                // Reset audio to beginning if already playing
                const audio = this.audioElements[soundType];
                audio.currentTime = 0;
                audio.volume = this.volume;
                
                const playPromise = audio.play();
                if (playPromise) {
                    playPromise.catch(error => {
                        console.warn(`Error playing audio: ${error}`);
                        this.synthesizeSound(soundType);
                    });
                }
                return;
            } catch (e) {
                console.warn(`Error playing audio file: ${e}`);
            }
        }
        
        // Fallback to synthesized sound
        this.synthesizeSound(soundType);
    }
    
    /**
     * Synthesize a sound using Web Audio API
     * @param {string} soundType - Type of sound to synthesize
     */
    synthesizeSound(soundType) {
        if (!this.audioContext) return;
        
        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.volume;
        gainNode.connect(this.audioContext.destination);
        
        switch (soundType) {
            case 'move':
                this.synthesizeMove(gainNode);
                break;
            case 'capture':
                this.synthesizeCapture(gainNode);
                break;
            case 'check':
                this.synthesizeCheck(gainNode);
                break;
            case 'checkmate':
                this.synthesizeCheckmate(gainNode);
                break;
            case 'stalemate':
                this.synthesizeStalemate(gainNode);
                break;
            case 'promotion':
                this.synthesizePromotion(gainNode);
                break;
            case 'castling':
                this.synthesizeCastling(gainNode);
                break;
        }
    }
    
    /**
     * Creates a simple oscillator tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {AudioNode} destination - Audio node to connect to
     * @param {number} delay - Delay before playing in seconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     */
    createTone(frequency, duration, destination, delay = 0, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(destination);
        
        const startTime = this.audioContext.currentTime + delay;
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    // Synthesized sound implementations
    
    /**
     * Synthesize move sound - refined to match the clean, crisp wooden click of Lichess
     */
    synthesizeMove(destination) {
        // Create a refined noise component for realistic wood contact
        const noiseBuffer = this.createNoiseBuffer(0.03, {
            envelope: 'exponential',
            lowpassFrequency: 3000,
            resonance: 1.8
        });
        this.playNoiseBuffer(noiseBuffer, 0.12, destination);
        
        // Add wooden resonance components
        this.synthesizeComplexSound([
            {
                // Initial tap transient
                frequency: 1800,
                duration: 0.015, 
                volume: 0.25,
                type: 'sine',
                envelope: { attack: 0.0005, decay: 0.01, sustain: 0.05, release: 0.01 }
            },
            {
                // Mid-frequency wooden resonance 
                frequency: 750,
                duration: 0.035,
                volume: 0.3,
                type: 'sine',
                delay: 0.005,
                envelope: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.03 }
            },
            {
                // Lower body resonance
                frequency: 280,
                duration: 0.04,
                volume: 0.25,
                type: 'sine',
                delay: 0.008,
                envelope: { attack: 0.002, decay: 0.01, sustain: 0.1, release: 0.025 }
            }
        ], destination);
    }
    
    /**
     * Synthesize capture sound - refined to match Lichess's distinctive wooden capture sound
     */
    synthesizeCapture(destination) {
        // Create a more substantial noise component for capture
        const noiseBuffer = this.createNoiseBuffer(0.06, {
            envelope: 'exponential',
            lowpassFrequency: 2000,
            resonance: 2.2
        });
        this.playNoiseBuffer(noiseBuffer, 0.18, destination);
        
        // Add wooden impact components with more depth
        this.synthesizeComplexSound([
            {
                // Initial impact
                frequency: 200,
                duration: 0.07,
                volume: 0.45,
                type: 'triangle',
                envelope: { attack: 0.0005, decay: 0.03, sustain: 0.2, release: 0.05 }
            },
            {
                // Deep wooden body resonance
                frequency: 120,
                duration: 0.09, 
                volume: 0.35,
                type: 'sine',
                delay: 0.01,
                envelope: { attack: 0.001, decay: 0.04, sustain: 0.2, release: 0.07 }
            },
            {
                // Higher frequency component for "click"
                frequency: 1500,
                duration: 0.015,
                volume: 0.18,
                type: 'sine',
                envelope: { attack: 0.0005, decay: 0.005, sustain: 0.1, release: 0.015 }
            }
        ], destination);
        
        // Add a subtle secondary impact after a short delay (piece settling)
        setTimeout(() => {
            const settleBuffer = this.createNoiseBuffer(0.02, {
                envelope: 'exponential',
                lowpassFrequency: 2500,
                resonance: 1.5
            });
            this.playNoiseBuffer(settleBuffer, 0.05, destination);
        }, 75);
    }
    
    /**
     * Synthesize check sound - subtle alert with Lichess-like character
     */
    synthesizeCheck(destination) {
        this.synthesizeComplexSound([
            {
                frequency: 800,
                duration: 0.08,
                volume: 0.15,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.03, sustain: 0.6, release: 0.06 }
            },
            {
                frequency: 1200,
                duration: 0.10,
                volume: 0.12,
                type: 'sine',
                delay: 0.02,
                envelope: { attack: 0.01, decay: 0.02, sustain: 0.7, release: 0.08 }
            }
        ], destination);
    }
    
    /**
     * Synthesize checkmate sound - decisive but not overpowering
     * Similar to the subtle game-end sound on major chess platforms
     */
    synthesizeCheckmate(destination) {
        this.synthesizeComplexSound([
            {
                frequency: 350,
                duration: 0.1,
                volume: 0.4,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.02, sustain: 0.7, release: 0.05 }
            },
            {
                frequency: 500,
                duration: 0.12,
                volume: 0.5,
                type: 'sine',
                delay: 0.12,
                envelope: { attack: 0.01, decay: 0.02, sustain: 0.7, release: 0.05 }
            },
            {
                frequency: 650,
                duration: 0.15,
                volume: 0.6, 
                type: 'sine',
                delay: 0.25,
                envelope: { attack: 0.01, decay: 0.02, sustain: 0.7, release: 0.1 }
            }
        ], destination);
    }
    
    /**
     * Synthesize stalemate sound - a neutral ending tone
     * More subtle and less dissonant
     */
    synthesizeStalemate(destination) {
        this.synthesizeComplexSound([
            {
                frequency: 350,
                duration: 0.15,
                volume: 0.5,
                type: 'sine',
                envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.1 }
            },
            {
                frequency: 350,
                duration: 0.15,
                volume: 0.5,
                type: 'sine',
                delay: 0.2,
                envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.1 }
            }
        ], destination);
    }
    
    /**
     * Synthesize promotion sound - a celebratory but subtle tone
     * Similar to chess.com's understated promotion sound
     */
    synthesizePromotion(destination) {
        this.synthesizeCustomSound({
            frequency: 700,
            duration: 0.15,
            volume: 0.6,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1 },
            modulation: { frequency: 0, depth: 0 }
        }, destination);
        
        // Additional tone at the end
        setTimeout(() => {
            this.synthesizeCustomSound({
                frequency: 1000,
                duration: 0.1,
                volume: 0.5,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.03, sustain: 0.5, release: 0.08 }
            }, destination);
        }, 180);
    }
    
    /**
     * Synthesize castling sound - refined two-piece movement with authentic wooden character
     */
    synthesizeCastling(destination) {
        // First piece movement (king)
        const kingNoiseBuffer = this.createNoiseBuffer(0.035, {
            envelope: 'exponential',
            lowpassFrequency: 3000,
            resonance: 1.8
        });
        this.playNoiseBuffer(kingNoiseBuffer, 0.12, destination);
        
        this.synthesizeComplexSound([
            {
                frequency: 1600,
                duration: 0.02,
                volume: 0.25,
                type: 'sine',
                envelope: { attack: 0.0005, decay: 0.01, sustain: 0.1, release: 0.015 }
            },
            {
                frequency: 600,
                duration: 0.03,
                volume: 0.3,
                type: 'sine',
                delay: 0.005,
                envelope: { attack: 0.001, decay: 0.015, sustain: 0.1, release: 0.02 }
            }
        ], destination);
        
        // Second piece movement (rook) after a delay
        setTimeout(() => {
            const rookNoiseBuffer = this.createNoiseBuffer(0.035, {
                envelope: 'exponential',
                lowpassFrequency: 2800,
                resonance: 1.7
            });
            this.playNoiseBuffer(rookNoiseBuffer, 0.11, destination);
            
            this.synthesizeComplexSound([
                {
                    frequency: 1400,
                    duration: 0.02,
                    volume: 0.22,
                    type: 'sine',
                    envelope: { attack: 0.0005, decay: 0.01, sustain: 0.1, release: 0.015 }
                },
                {
                    frequency: 550,
                    duration: 0.03,
                    volume: 0.28,
                    type: 'sine',
                    delay: 0.005,
                    envelope: { attack: 0.001, decay: 0.015, sustain: 0.1, release: 0.02 }
                }
            ], destination);
        }, 170);
    }
    
    /**
     * Creates a custom synthesized sound with precise control
     * @param {Object} options - Configuration options for the sound
     * @param {number} options.frequency - Base frequency in Hz
     * @param {number} options.duration - Total duration in seconds
     * @param {number} options.volume - Volume level from 0.0 to 1.0
     * @param {string} options.type - Oscillator type: 'sine', 'square', 'sawtooth', 'triangle'
     * @param {Object} options.envelope - ADSR envelope parameters
     * @param {number} options.envelope.attack - Attack time in seconds
     * @param {number} options.envelope.decay - Decay time in seconds
     * @param {number} options.envelope.sustain - Sustain level (0.0 to 1.0)
     * @param {number} options.envelope.release - Release time in seconds
     * @param {Object} options.modulation - Frequency modulation parameters
     * @param {number} options.modulation.frequency - Modulation frequency in Hz
     * @param {number} options.modulation.depth - Modulation depth
     */
    synthesizeCustomSound(options = {}, destination) {
        if (!this.audioContext) return;
        
        // Set default parameters if not provided
        const params = {
            frequency: options.frequency || 440,
            duration: options.duration || 0.3,
            volume: options.volume || this.volume,
            type: options.type || 'sine',
            envelope: {
                attack: (options.envelope?.attack !== undefined) ? options.envelope.attack : 0.01,
                decay: (options.envelope?.decay !== undefined) ? options.envelope.decay : 0.1,
                sustain: (options.envelope?.sustain !== undefined) ? options.envelope.sustain : 0.7,
                release: (options.envelope?.release !== undefined) ? options.envelope.release : 0.2
            },
            modulation: {
                frequency: options.modulation?.frequency || 0,
                depth: options.modulation?.depth || 0
            }
        };
        
        // Create the main oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = params.type;
        oscillator.frequency.value = params.frequency;
        
        // Create a gain node for envelope and volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.0001; // Start silent for attack phase
        
        // Connect oscillator to gain node
        oscillator.connect(gainNode);
        
        // Apply frequency modulation if requested
        if (params.modulation.frequency > 0 && params.modulation.depth > 0) {
            const modulatorOsc = this.audioContext.createOscillator();
            const modulationGain = this.audioContext.createGain();
            
            modulatorOsc.frequency.value = params.modulation.frequency;
            modulationGain.gain.value = params.modulation.depth;
            
            modulatorOsc.connect(modulationGain);
            modulationGain.connect(oscillator.frequency);
            modulatorOsc.start();
            modulatorOsc.stop(this.audioContext.currentTime + params.duration + params.envelope.release);
        }
        
        // Calculate envelope timings
        const now = this.audioContext.currentTime;
        const attackEnd = now + params.envelope.attack;
        const decayEnd = attackEnd + params.envelope.decay;
        const sustainEnd = now + params.duration;
        const releaseEnd = sustainEnd + params.envelope.release;
        
        // Apply ADSR envelope
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(params.volume, attackEnd); // Attack
        gainNode.gain.exponentialRampToValueAtTime(params.volume * params.envelope.sustain, decayEnd); // Decay
        gainNode.gain.setValueAtTime(params.volume * params.envelope.sustain, sustainEnd); // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseEnd); // Release
        
        // Connect to destination or master gain node
        const outputNode = destination || this.audioContext.destination;
        gainNode.connect(outputNode);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(releaseEnd);
        
        // Return the oscillator node for further manipulation if needed
        return oscillator;
    }
    
    /**
     * Creates a sound with multiple oscillators for richer tones
     * @param {Array} tones - Array of tone configurations
     * @param {number} tones[].frequency - Frequency in Hz
     * @param {number} tones[].duration - Duration in seconds
     * @param {number} tones[].volume - Volume level (0.0 to 1.0)
     * @param {string} tones[].type - Oscillator type
     * @param {number} tones[].delay - Delay before playing in seconds
     */
    synthesizeComplexSound(tones = [], destination) {
        if (!this.audioContext) return;
        
        // Create master gain node
        const masterGain = this.audioContext.createGain();
        masterGain.gain.value = this.volume;
        masterGain.connect(destination || this.audioContext.destination);
        
        // Create each tone
        tones.forEach(tone => {
            setTimeout(() => {
                this.synthesizeCustomSound({
                    frequency: tone.frequency,
                    duration: tone.duration,
                    volume: tone.volume || 1.0,
                    type: tone.type || 'sine',
                    envelope: tone.envelope
                }, masterGain);
            }, (tone.delay || 0) * 1000); // Convert delay to milliseconds
        });
    }
    
    /**
     * Creates a buffer with filtered noise for more realistic wooden sounds
     * Enhanced to create better wooden tones similar to Lichess
     * @param {number} duration - Duration of noise in seconds
     * @param {Object} options - Advanced options for noise customization
     * @returns {AudioBuffer} - Buffer containing noise
     */
    createNoiseBuffer(duration = 0.05, options = {}) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Default options
        const opts = {
            envelope: options.envelope || 'exponential', // 'linear', 'exponential', 'custom'
            lowpassFrequency: options.lowpassFrequency || 2500,
            resonance: options.resonance || 1.0,  // Resonance factor for filter
        };
        
        // Previous value for brown noise filter
        let lastOutput = 0;
        let lastOutput2 = 0;
        
        // Fill buffer with filtered noise shaped for wooden sounds
        for (let i = 0; i < bufferSize; i++) {
            // Generate initial white noise
            let noise = Math.random() * 2 - 1;
            
            // Apply brown-ish noise filtering for wooden character
            // This is a simple IIR filter that emphasizes lower frequencies
            noise = (noise + lastOutput + lastOutput2) / 3;
            lastOutput2 = lastOutput;
            lastOutput = noise;
            
            // Apply manual lowpass filter with resonance
            const normalizedPosition = i / bufferSize;
            const filterFactor = Math.pow(0.99, (sampleRate / opts.lowpassFrequency) * normalizedPosition);
            
            // Apply resonance as a subtle boost around the cutoff
            const resonanceFactor = 1 + (opts.resonance - 1) * Math.exp(-normalizedPosition * 5);
            noise = noise * filterFactor * resonanceFactor;
            
            // Apply envelope
            let envelope;
            if (opts.envelope === 'exponential') {
                // Exponential decay, better for wooden impacts
                envelope = Math.exp(-normalizedPosition * 6); 
            } else if (opts.envelope === 'custom') {
                // Custom wooden impact envelope with initial attack and quick decay
                const attack = Math.min(normalizedPosition * 10, 1); // Fast attack
                const decay = Math.exp(-Math.max(0, normalizedPosition - 0.1) * 8); // Slower decay
                envelope = attack * decay;
            } else {
                // Linear (default)
                envelope = 1 - normalizedPosition;
            }
            
            // Apply some additional shaping for more realistic wooden sound
            const woodShape = 1 - Math.pow(normalizedPosition, 0.5) * 0.4;
            
            // Combine everything and write to buffer
            data[i] = noise * envelope * woodShape * 0.25; // Reduced volume for better blending
        }
        
        return buffer;
    }
    
    /**
     * Plays a noise buffer through an audio buffer source node with improved control
     */
    playNoiseBuffer(buffer, volume = 0.2, destination) {
        if (!buffer || !this.audioContext) return;
        
        const bufferSource = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        // Create a biquad filter for additional tone shaping
        const filter = this.audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2800;
        filter.Q.value = 0.7; // Slight resonance
        
        bufferSource.buffer = buffer;
        gainNode.gain.value = volume * this.volume;
        
        // Connect through filter for more refined sound
        bufferSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination || this.audioContext.destination);
        
        bufferSource.start();
        return bufferSource;
    }
    
    /**
     * Set the volume level
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        if (volume < 0) volume = 0;
        if (volume > 1) volume = 1;
        
        this.volume = volume;
        
        // Update volume for all audio elements
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = this.volume;
        });
        
        return this.volume;
    }
    
    /**
     * Toggle the sound on/off
     * @returns {boolean} The new enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    /**
     * Check if the Web Audio API is supported
     * @returns {boolean} Whether Web Audio API is supported
     */
    isWebAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    /**
     * Force resume the audio context (needed for some browsers)
     * Call this method in response to a user interaction
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Preload a specific sound
     * @param {string} soundType - Type of sound to preload
     */
    preloadSound(soundType) {
        if (this.useAudioFiles && this.soundFiles[soundType]) {
            const audio = this.audioElements[soundType] || new Audio();
            audio.src = this.audioPath + this.soundFiles[soundType];
            audio.load();
            this.audioElements[soundType] = audio;
        }
    }

    /**
     * Set the current sound theme
     * @param {string} theme - Theme name ('standard', 'classic', 'modern', etc.)
     */
    setTheme(theme) {
        if (!this.soundThemes[theme]) {
            console.warn(`Unknown sound theme: ${theme}`);
            return false;
        }
        
        this.currentTheme = theme;
        
        // Update sound files with the selected theme
        this.soundFiles = { ...this.soundFiles, ...this.soundThemes[theme] };
        
        // Clear existing audio elements to force reload with new sound files
        this.audioElements = {};
        
        console.log(`Sound theme set to: ${theme}`);
        return true;
    }
    
    /**
     * Add a custom sound theme
     * @param {string} themeName - Name of the theme
     * @param {Object} themeFiles - Object mapping sound types to file paths
     */
    addTheme(themeName, themeFiles) {
        if (typeof themeName !== 'string' || typeof themeFiles !== 'object') {
            console.error('Invalid theme parameters');
            return false;
        }
        
        this.soundThemes[themeName] = { ...themeFiles };
        console.log(`Added sound theme: ${themeName}`);
        return true;
    }
}

/**
 * CustomSoundProfile - Extends ChessSoundManager for custom sound themes
 */
class CustomSoundProfile extends ChessSoundManager {
    constructor(options) {
        super(options);
        
        // Override default sounds with custom ones
        this.soundFiles = {
            'move': 'custom-move.mp3',
            'capture': 'custom-capture.mp3',
            'check': 'custom-check.mp3',
            'checkmate': 'custom-checkmate.mp3',
            'stalemate': 'custom-stalemate.mp3',
            'promotion': 'custom-promotion.mp3',
            'castling': 'custom-castling.mp3'
        };
    }
    
    // Optionally override synthesized sound methods
    synthesizeMove(destination) {
        // Custom implementation for synthesized move sound
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.volume;
        gainNode.connect(destination || this.audioContext.destination);
        
        this.synthesizeComplexSound([
            {
                // Custom tone for move sound
                frequency: 1200,
                duration: 0.020, 
                volume: 0.30,
                type: 'sine',
                envelope: { attack: 0.001, decay: 0.01, sustain: 0.05, release: 0.01 }
            },
            {
                frequency: 600,
                duration: 0.040,
                volume: 0.25,
                type: 'sine',
                delay: 0.008,
                envelope: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.03 }
            }
        ], gainNode);
    }
}
