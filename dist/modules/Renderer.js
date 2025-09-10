export class Renderer {
    constructor(gameContainer, gameEngine) {
        this.animationFrameId = null;
        // Piano key mapping
        this.PIANO_KEYS = [
            { note: 'C4', type: 'white', key: 'a' },
            { note: 'C#4', type: 'black', key: 'w' },
            { note: 'D4', type: 'white', key: 's' },
            { note: 'D#4', type: 'black', key: 'e' },
            { note: 'E4', type: 'white', key: 'd' },
            { note: 'F4', type: 'white', key: 'f' },
            { note: 'F#4', type: 'black', key: 't' },
            { note: 'G4', type: 'white', key: 'g' },
            { note: 'G#4', type: 'black', key: 'y' },
            { note: 'A4', type: 'white', key: 'h' },
            { note: 'A#4', type: 'black', key: 'u' },
            { note: 'B4', type: 'white', key: 'j' },
            { note: 'C5', type: 'white', key: 'k' },
            { note: 'C#5', type: 'black', key: 'o' },
            { note: 'D5', type: 'white', key: 'l' },
            { note: 'D#5', type: 'black', key: 'p' },
            { note: 'E5', type: 'white', key: ';' },
            { note: 'F5', type: 'white', key: "'" }
        ];
        this.activeNotes = {};
        this.notesElements = new Map();
        // Affiche les touches du clavier par défaut
        this.showKeyOnNotes = true;
        // Main render function
        this.render = () => {
            const visibleNotes = this.gameEngine.getVisibleNotes();
            // Update note positions
            this.updateNoteElements(visibleNotes);
            // Request next frame
            this.animationFrameId = requestAnimationFrame(this.render);
        };
        this.container = gameContainer;
        this.gameEngine = gameEngine;
        // Create containers
        this.pianoContainer = document.createElement('div');
        this.pianoContainer.id = 'piano-container';
        this.pianoContainer.className = 'relative w-full h-44 mb-2';
        // Create a wrapper for the notes container
        const notesWrapper = document.createElement('div');
        notesWrapper.className = 'relative w-full flex justify-center items-center';
        this.notesContainer = document.createElement('div');
        this.notesContainer.id = 'notes-container';
        this.notesContainer.className = 'relative h-96 overflow-hidden bg-gray-800 border-b-2 border-white';
        this.notesContainer.style.width = 'fit-content'; // Match the width of the keyboard
        // Add containers to main container
        notesWrapper.appendChild(this.notesContainer);
        this.container.appendChild(notesWrapper);
        this.container.appendChild(this.pianoContainer);
        // Create piano keyboard
        this.createPianoKeyboard();
        // Listen for note state changes
        this.gameEngine.onNoteStateChange(note => this.handleNoteStateChange(note));
    }
    // Create piano keyboard
    createPianoKeyboard() {
        // Create a container for the keyboard
        const keyboardContainer = document.createElement('div');
        keyboardContainer.className = 'relative';
        keyboardContainer.style.width = 'fit-content';
        keyboardContainer.style.margin = '0 auto';
        // Create white keys container
        const whiteKeysContainer = document.createElement('div');
        whiteKeysContainer.id = 'white-keys';
        whiteKeysContainer.className = 'flex';
        // Create black keys container
        const blackKeysContainer = document.createElement('div');
        blackKeysContainer.id = 'black-keys';
        blackKeysContainer.className = 'absolute top-0 left-0 flex';
        // Create white keys
        const whiteKeyWidth = 64; // Fixed width for each white key
        this.PIANO_KEYS.filter(key => key.type === 'white').forEach((key, index) => {
            const keyElement = document.createElement('button');
            keyElement.className = 'piano-key border border-gray-400 rounded-b-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-150 flex flex-col justify-end items-center pb-2 bg-white text-black';
            keyElement.style.width = `${whiteKeyWidth}px`;
            keyElement.style.height = '128px'; // Fixed height for white keys
            keyElement.dataset.note = key.note;
            keyElement.innerHTML = `<span class="text-xs font-bold">${key.key.toUpperCase()}</span>`;
            whiteKeysContainer.appendChild(keyElement);
        });
        // Create black keys
        this.PIANO_KEYS.filter(key => key.type === 'black').forEach(key => {
            // Find the position of this black key by counting white keys before it
            const whiteKeyIndex = this.PIANO_KEYS.filter(k => k.type === 'white' &&
                this.PIANO_KEYS.indexOf(k) < this.PIANO_KEYS.indexOf(key)).length;
            // Calculate position based on white key index
            const blackKeyWidth = 48; // Width of black keys
            const whiteKeyWidth = 64; // Width of white keys
            // Position black key between white keys with proper centering
            const leftOffset = (whiteKeyIndex * whiteKeyWidth) - (blackKeyWidth / 2);
            const keyElement = document.createElement('button');
            keyElement.className = 'piano-key absolute border border-gray-800 rounded-b-lg shadow-2xl hover:bg-gray-700 active:bg-gray-600 transition-all duration-150 flex flex-col justify-end items-center pb-2 z-10 bg-black text-white';
            keyElement.style.width = `${blackKeyWidth}px`;
            keyElement.style.height = '80px';
            keyElement.style.left = `${leftOffset}px`;
            keyElement.dataset.note = key.note;
            keyElement.innerHTML = `<span class="text-xs font-bold">${key.key.toUpperCase()}</span>`;
            blackKeysContainer.appendChild(keyElement);
        });
        // Add containers to the keyboard container
        keyboardContainer.appendChild(whiteKeysContainer);
        keyboardContainer.appendChild(blackKeysContainer);
        // Add the entire keyboard to the piano container
        this.pianoContainer.appendChild(keyboardContainer);
        // Match the notes container width to the keyboard width
        const whiteKeysCount = this.PIANO_KEYS.filter(key => key.type === 'white').length;
        const keyboardWidth = whiteKeysCount * 64; // 64px per white key
        this.notesContainer.style.width = `${keyboardWidth}px`;
    }
    // Start rendering loop
    startRendering() {
        this.render();
    }
    // Stop rendering loop
    stopRendering() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    // Update note elements
    updateNoteElements(visibleNotes) {
        // Clean up notes that are no longer visible
        this.notesElements.forEach((element, note) => {
            if (!visibleNotes.some(n => n === note)) {
                element.remove();
                this.notesElements.delete(note);
            }
        });
        // Update or create elements for visible notes
        visibleNotes.forEach(noteData => {
            const note = noteData;
            let element = this.notesElements.get(note);
            // Create new element if it doesn't exist
            if (!element && note.timeToHit !== undefined && note.timeToHit <= 5 && note.timeToHit >= -1) {
                element = this.createNoteElement(note);
                this.notesContainer.appendChild(element);
                this.notesElements.set(note, element);
            }
            // Update position if element exists
            if (element) {
                this.updateNotePosition(element, note);
                // Update appearance based on hit status
                if (note.isHit) {
                    if (note.hitQuality === 'perfect') {
                        element.classList.add('note-hit', 'bg-green-500', 'border-green-600');
                    }
                    else if (note.hitQuality === 'good') {
                        element.classList.add('note-hit', 'bg-yellow-500', 'border-yellow-600');
                    }
                    else if (note.hitQuality === 'poor') {
                        element.classList.add('note-hit', 'bg-orange-500', 'border-orange-600');
                    }
                    else if (note.hitQuality === 'miss') {
                        element.classList.add('note-hit', 'bg-red-500', 'border-red-600');
                    }
                }
            }
        });
    }
    // Permet de changer dynamiquement l'affichage (note ou touche)
    setShowKeyOnNotes(show) {
        this.showKeyOnNotes = show;
        // Forcer le rafraîchissement des notes affichées
        this.updateNoteElements(this.gameEngine.getVisibleNotes());
    }
    // Create a visual element for a note
    createNoteElement(note) {
        const element = document.createElement('div');
        element.className = 'falling-note';
        element.style.width = '48px';
        element.style.height = '32px';
        const key = this.PIANO_KEYS.find(k => k.note === note.note);
        const colorClass = (key === null || key === void 0 ? void 0 : key.type) === 'black' ? 'note-purple' : 'note-blue';
        element.classList.add(colorClass);
        // Affiche la touche du clavier ou la note selon l'option
        let label = '';
        if (this.showKeyOnNotes && key) {
            label = key.key.toUpperCase();
        }
        else {
            label = Array.isArray(note.note) ? note.note[0] : note.note;
        }
        element.textContent = label;
        const position = this.getNotePosition(Array.isArray(note.note) ? note.note[0] : note.note);
        element.style.left = `${position}px`;
        return element;
    }
    // Update note position based on time to hit
    updateNotePosition(element, note) {
        // Convert timeToHit to screen position
        // When timeToHit = 5, note should be at the top of the container
        // When timeToHit = 0, bottom of the note should touch the bottom of the container
        const containerHeight = this.notesContainer.clientHeight;
        const noteHeight = 32; // Height of the note element
        const timeToHit = note.timeToHit !== undefined ? note.timeToHit : 0;
        const normalizedPosition = (timeToHit / 5);
        // Calculate position so the BOTTOM of the note aligns with container bottom when timeToHit = 0
        // Subtract noteHeight to position based on the top of the note element
        const yPosition = (containerHeight - noteHeight) * (1 - normalizedPosition);
        element.style.top = `${yPosition}px`;
    }
    // Get horizontal position for a note
    getNotePosition(noteName) {
        const keyIndex = this.PIANO_KEYS.findIndex(key => key.note === noteName);
        if (keyIndex === -1)
            return 0;
        const key = this.PIANO_KEYS[keyIndex];
        const noteWidth = 48; // Width of the falling note
        if (key.type === 'white') {
            // For white keys, count how many white keys precede this one
            const whiteKeyIndex = this.PIANO_KEYS.filter((k, i) => k.type === 'white' && i <= keyIndex).length - 1;
            // Calculate center position of the white key
            // Each white key is 64px, center the note exactly
            return (whiteKeyIndex * 64) + (64 / 2) - (noteWidth / 2);
        }
        else {
            // For black keys, use the same calculation as in createPianoKeyboard
            const whiteKeyIndex = this.PIANO_KEYS.filter(k => k.type === 'white' &&
                this.PIANO_KEYS.indexOf(k) < this.PIANO_KEYS.indexOf(key)).length;
            // Black key is positioned at leftOffset
            const blackKeyWidth = 48; // Width of the black key
            const whiteKeyWidth = 64; // Width of white keys
            const leftOffset = (whiteKeyIndex * whiteKeyWidth) - (blackKeyWidth / 2);
            // Center the note exactly over the black key
            return leftOffset + (blackKeyWidth / 2) - (noteWidth / 2);
        }
    }
    // Handle key activation from input
    activatePianoKey(noteName) {
        const keyElement = document.querySelector(`[data-note="${noteName}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }
    // Handle key deactivation from input
    deactivatePianoKey(noteName) {
        const keyElement = document.querySelector(`[data-note="${noteName}"]`);
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }
    // Handle note state changes from game engine
    handleNoteStateChange(note) {
        if (note.isHit && note.hitQuality) {
            // Convert array to single note if it's an array
            const noteForFeedback = Array.isArray(note.note) ? note.note[0] : note.note;
            this.showHitFeedback(note.hitQuality, noteForFeedback);
        }
    }
    // Show feedback text for note hits
    showHitFeedback(quality, noteName) {
        // Position the feedback near the corresponding note
        const notePosition = this.getNotePosition(noteName);
        const containerHeight = this.notesContainer.clientHeight;
        const feedback = document.createElement('div');
        feedback.className = 'absolute z-20 text-xl font-bold';
        feedback.style.left = `${notePosition}px`;
        feedback.style.bottom = '0px'; // Position at the bottom of the notes container
        feedback.style.width = '48px'; // Match the width of notes
        feedback.style.textAlign = 'center';
        switch (quality) {
            case 'perfect':
                feedback.textContent = 'Perfect!';
                feedback.className += ' text-green-400';
                break;
            case 'good':
                feedback.textContent = 'Good!';
                feedback.className += ' text-yellow-400';
                break;
            case 'poor':
                feedback.textContent = 'Poor';
                feedback.className += ' text-orange-400';
                break;
            case 'miss':
                feedback.textContent = 'Miss';
                feedback.className += ' text-red-400';
                break;
        }
        this.notesContainer.appendChild(feedback);
        // Fade out and remove after animation - move upward from the hit position
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.bottom = '40px'; // Move upward from the bottom
            feedback.style.transition = 'all 500ms ease';
            setTimeout(() => {
                feedback.remove();
            }, 500);
        }, 100);
    }
}
//# sourceMappingURL=Renderer.js.map