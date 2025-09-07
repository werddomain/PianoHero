var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class SongLoader {
    // Load available songs list
    loadSongsList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/songs/songs.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Error loading songs list:', error);
                throw error;
            }
        });
    }
    // Load a specific song by filename
    loadSong(songFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`/songs/${songFile}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error(`Error loading song ${songFile}:`, error);
                throw error;
            }
        });
    }
    // Process a user-uploaded song file
    processSongFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        if (!event.target || typeof event.target.result !== 'string') {
                            throw new Error('Failed to read file');
                        }
                        const songData = JSON.parse(event.target.result);
                        // Validate song structure
                        if (!songData.name || !Array.isArray(songData.notes)) {
                            throw new Error('Invalid song format');
                        }
                        // Validate notes - each note should be either a string or an array of strings
                        for (const noteItem of songData.notes) {
                            if (!noteItem.time && noteItem.time !== 0)
                                throw new Error('Note missing time property');
                            if (!noteItem.duration)
                                throw new Error('Note missing duration property');
                            // Note can be a string or a string array (for chords)
                            if (typeof noteItem.note !== 'string' && !Array.isArray(noteItem.note)) {
                                throw new Error('Note should be a string or array of strings');
                            }
                            // If it's an array, validate each element is a string
                            if (Array.isArray(noteItem.note)) {
                                for (const noteName of noteItem.note) {
                                    if (typeof noteName !== 'string') {
                                        throw new Error('Each note in a chord must be a string');
                                    }
                                }
                            }
                        }
                        resolve(songData);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => {
                    reject(new Error('Error reading file'));
                };
                reader.readAsText(file);
            });
        });
    }
}
//# sourceMappingURL=SongLoader.js.map