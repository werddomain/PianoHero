import { Song } from './Note';

export class SongLoader {
  // Load available songs list
  private getBasePath(): string {
    // Get the base path from the current URL
    // This handles both GitHub Pages (/PianoHero/) and local development
    const pathname = window.location.pathname;
    const basePath = pathname.endsWith('/') ? '..' : '.';
    return basePath;
  }

  public async loadSongsList(): Promise<any> {
    try {
      const basePath = this.getBasePath();
      const response = await fetch(`${basePath}/songs/songs.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading songs list:', error);
      throw error;
    }
  }

  // Load a specific song by filename
  public async loadSong(songFile: string): Promise<Song> {
    try {
      const basePath = this.getBasePath();
      const response = await fetch(`${basePath}/songs/${songFile}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading song ${songFile}:`, error);
      throw error;
    }
  }

  // Process a user-uploaded song file
  public async processSongFile(file: File): Promise<Song> {
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
            if (!noteItem.time && noteItem.time !== 0) throw new Error('Note missing time property');
            if (!noteItem.duration) throw new Error('Note missing duration property');
            
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
          
          resolve(songData as Song);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
}
