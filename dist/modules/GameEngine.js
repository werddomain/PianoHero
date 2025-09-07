var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HitQuality, TIMING_WINDOWS, SCORE_VALUES, COMBO_MULTIPLIERS } from './Note';
import { SongLoader } from './SongLoader';
export class GameEngine {
    constructor() {
        // Game state
        this.isPlaying = false;
        this.score = 0;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.currentTime = -5; // Start at -5 seconds for countdown
        this.song = null;
        this.activeNotes = [];
        this.pendingNotes = [];
        this.statistics = {
            perfect: 0,
            good: 0,
            poor: 0,
            miss: 0,
            maxCombo: 0
        };
        // Timing
        this.lastTick = 0;
        this.updateInterval = 1000 / 60; // 60fps for game logic
        this.gameLoopInterval = null;
        // Event callbacks
        this.onScoreUpdateCallback = null;
        this.onComboUpdateCallback = null;
        this.onNoteStateChangeCallback = null;
        this.onGameEndCallback = null;
    }
    // Event registration methods
    onScoreUpdate(callback) {
        this.onScoreUpdateCallback = callback;
    }
    onComboUpdate(callback) {
        this.onComboUpdateCallback = callback;
    }
    onNoteStateChange(callback) {
        this.onNoteStateChangeCallback = callback;
    }
    onGameEnd(callback) {
        this.onGameEndCallback = callback;
    }
    // Load a song
    loadSong(songFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const songLoader = new SongLoader();
                this.song = yield songLoader.loadSong(songFile);
                this.resetGameState();
            }
            catch (error) {
                console.error('Error loading song:', error);
                throw error;
            }
        });
    }
    // Reset game state
    resetGameState() {
        this.score = 0;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.currentTime = -5;
        this.activeNotes = [];
        if (this.song) {
            // Deep clone the notes to avoid modifying the original
            const songNotes = JSON.parse(JSON.stringify(this.song.notes));
            // Process notes - expand chord arrays into individual notes
            const processedNotes = [];
            songNotes.forEach((noteItem, index) => {
                if (Array.isArray(noteItem.note)) {
                    // Handle chord (multiple notes in an array)
                    noteItem.note.forEach((singleNote, noteIndex) => {
                        processedNotes.push({
                            note: singleNote,
                            time: noteItem.time,
                            duration: noteItem.duration,
                            isHit: false,
                            isChord: true,
                            chordId: `chord-${noteItem.time}-${index}`
                        });
                    });
                }
                else {
                    // Handle single note
                    processedNotes.push(noteItem);
                }
            });
            this.pendingNotes = processedNotes.sort((a, b) => a.time - b.time);
        }
        else {
            this.pendingNotes = [];
        }
        this.statistics = {
            perfect: 0,
            good: 0,
            poor: 0,
            miss: 0,
            maxCombo: 0
        };
    }
    // Start the game
    startGame() {
        if (!this.song) {
            console.error('No song loaded');
            return;
        }
        this.isPlaying = true;
        this.lastTick = Date.now();
        // Clear any existing interval
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        // Start game loop
        this.gameLoopInterval = window.setInterval(() => this.update(), this.updateInterval);
    }
    // Pause the game
    pauseGame() {
        this.isPlaying = false;
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
    }
    // Resume the game
    resumeGame() {
        if (!this.song)
            return;
        this.isPlaying = true;
        this.lastTick = Date.now();
        this.gameLoopInterval = window.setInterval(() => this.update(), this.updateInterval);
    }
    // Main update loop
    update() {
        if (!this.isPlaying)
            return;
        const now = Date.now();
        const deltaTime = (now - this.lastTick) / 1000;
        this.lastTick = now;
        // Update current time
        this.currentTime += deltaTime;
        // Move notes from pending to active as needed
        this.updateNoteQueues();
        // Check for missed notes
        this.checkMissedNotes();
        // Check if game is over
        this.checkGameEnd();
    }
    // Update note queues
    updateNoteQueues() {
        // Check for notes that should become active
        // Notes become active 5 seconds before they should be hit
        const notesToActivate = [];
        while (this.pendingNotes.length > 0 &&
            this.pendingNotes[0].time <= this.currentTime + 5) {
            notesToActivate.push(this.pendingNotes.shift());
        }
        if (notesToActivate.length > 0) {
            this.activeNotes = [...this.activeNotes, ...notesToActivate];
            // Notify about new active notes
            notesToActivate.forEach(note => {
                if (this.onNoteStateChangeCallback) {
                    this.onNoteStateChangeCallback(note);
                }
            });
        }
    }
    // Check for missed notes
    checkMissedNotes() {
        const missedNotes = [];
        const stillActiveNotes = [];
        this.activeNotes.forEach(note => {
            // Note is considered missed if it's 80ms past its hit time
            if (!note.isHit && note.time + TIMING_WINDOWS.POOR / 1000 < this.currentTime) {
                note.isHit = true;
                note.hitQuality = HitQuality.MISS;
                missedNotes.push(note);
                // Reset combo on miss
                this.combo = 0;
                this.updateComboMultiplier();
                this.statistics.miss++;
            }
            else {
                stillActiveNotes.push(note);
            }
        });
        this.activeNotes = stillActiveNotes;
        // Notify about missed notes
        missedNotes.forEach(note => {
            if (this.onNoteStateChangeCallback) {
                this.onNoteStateChangeCallback(note);
            }
        });
        // Update combo display
        if (missedNotes.length > 0 && this.onComboUpdateCallback) {
            this.onComboUpdateCallback(this.combo);
        }
    }
    // Check if game is over
    checkGameEnd() {
        if (!this.song)
            return;
        // Game ends when all notes have been hit or missed
        if (this.pendingNotes.length === 0 && this.activeNotes.length === 0) {
            this.isPlaying = false;
            if (this.gameLoopInterval) {
                clearInterval(this.gameLoopInterval);
                this.gameLoopInterval = null;
            }
            if (this.onGameEndCallback) {
                this.onGameEndCallback();
            }
        }
    }
    // Handle note press
    handleNotePress(noteName) {
        if (!this.isPlaying)
            return;
        const matchingNotes = this.activeNotes.filter(note => {
            // Each note is now a string since we expanded the chord arrays in resetGameState
            return note.note === noteName &&
                !note.isHit &&
                Math.abs(note.time - this.currentTime) <= TIMING_WINDOWS.POOR / 1000;
        });
        if (matchingNotes.length === 0)
            return;
        // Get the closest note to the current time
        const closestNote = matchingNotes.reduce((closest, note) => {
            return Math.abs(note.time - this.currentTime) < Math.abs(closest.time - this.currentTime)
                ? note
                : closest;
        });
        const timeDifference = Math.abs(closestNote.time - this.currentTime) * 1000; // Convert to ms
        let hitQuality;
        let points;
        if (timeDifference <= TIMING_WINDOWS.PERFECT) {
            hitQuality = HitQuality.PERFECT;
            points = SCORE_VALUES.PERFECT;
            this.statistics.perfect++;
        }
        else if (timeDifference <= TIMING_WINDOWS.GOOD) {
            hitQuality = HitQuality.GOOD;
            points = SCORE_VALUES.GOOD;
            this.statistics.good++;
        }
        else {
            hitQuality = HitQuality.POOR;
            points = SCORE_VALUES.POOR;
            this.statistics.poor++;
        }
        // Mark the note as hit
        closestNote.isHit = true;
        closestNote.hitQuality = hitQuality;
        // Update combo
        this.combo++;
        if (this.combo > this.statistics.maxCombo) {
            this.statistics.maxCombo = this.combo;
        }
        this.updateComboMultiplier();
        // Calculate score with multiplier
        const scoreToAdd = points * this.comboMultiplier;
        this.score += scoreToAdd;
        // Notify listeners
        if (this.onNoteStateChangeCallback) {
            this.onNoteStateChangeCallback(closestNote);
        }
        if (this.onScoreUpdateCallback) {
            this.onScoreUpdateCallback(this.score);
        }
        if (this.onComboUpdateCallback) {
            this.onComboUpdateCallback(this.combo);
        }
    }
    // Handle note release
    handleNoteRelease(noteName) {
        // For future implementation of sustained notes
    }
    // Update combo multiplier based on combo count
    updateComboMultiplier() {
        // Find the highest applicable multiplier
        for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
            if (this.combo >= COMBO_MULTIPLIERS[i].threshold) {
                this.comboMultiplier = COMBO_MULTIPLIERS[i].multiplier;
                break;
            }
        }
    }
    // Get current game state for external use
    getGameState() {
        return {
            isPlaying: this.isPlaying,
            score: this.score,
            combo: this.combo,
            comboMultiplier: this.comboMultiplier,
            currentTime: this.currentTime,
            statistics: this.statistics
        };
    }
    // Get notes' current positions for rendering
    getVisibleNotes() {
        // Return active notes with their calculated positions
        return this.activeNotes.map(note => {
            // Calculate vertical position based on time difference
            const timeToHit = note.time - this.currentTime;
            return Object.assign(Object.assign({}, note), { timeToHit });
        });
    }
}
//# sourceMappingURL=GameEngine.js.map