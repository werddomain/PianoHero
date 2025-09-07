import { Song } from './Note';

export class SongLoader {
  // Load available songs list
  public async loadSongsList(): Promise<any> {
    try {
      const response = await fetch('/songs/songs.json');
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
      const response = await fetch(`/songs/${songFile}`);
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
