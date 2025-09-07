export class InputHandler {
    constructor() {
        // Key mappings from keyboard key to note
        this.KEY_MAPPINGS = {
            'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
            'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
            'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
            'p': 'D#5', ';': 'E5', "'": 'F5'
        };
        // Callbacks for note events
        this.onNotePressedCallback = null;
        this.onNoteReleasedCallback = null;
        // Track currently pressed keys to prevent key repeat events
        this.pressedKeys = new Set();
        // Handle keydown event
        this.handleKeyDown = (event) => {
            // Prevent default for mapped keys to avoid browser actions
            const key = event.key.toLowerCase();
            if (this.KEY_MAPPINGS[key]) {
                event.preventDefault();
                // If key is not already pressed
                if (!this.pressedKeys.has(key)) {
                    this.pressedKeys.add(key);
                    const note = this.KEY_MAPPINGS[key];
                    if (this.onNotePressedCallback) {
                        this.onNotePressedCallback(note);
                    }
                }
            }
        };
        // Handle keyup event
        this.handleKeyUp = (event) => {
            const key = event.key.toLowerCase();
            if (this.KEY_MAPPINGS[key]) {
                event.preventDefault();
                // Remove key from pressed keys
                this.pressedKeys.delete(key);
                const note = this.KEY_MAPPINGS[key];
                if (this.onNoteReleasedCallback) {
                    this.onNoteReleasedCallback(note);
                }
            }
        };
        // Bind event listeners
        this.bindEventListeners();
    }
    // Register callbacks
    onNotePressed(callback) {
        this.onNotePressedCallback = callback;
    }
    onNoteReleased(callback) {
        this.onNoteReleasedCallback = callback;
    }
    // Set up event listeners for keyboard
    bindEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    // Clean up event listeners
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
//# sourceMappingURL=InputHandler.js.map