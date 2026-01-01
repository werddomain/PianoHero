// Scoreboard module for tracking high scores using localStorage

export interface ScoreEntry {
  songId: string;
  songTitle: string;
  score: number;
  accuracy: number;
  grade: string;
  maxCombo: number;
  date: string;
}

export class Scoreboard {
  private static readonly STORAGE_KEY = 'piano-hero-scores';
  private static readonly MAX_ENTRIES_PER_SONG = 5;

  // Get all scores from localStorage
  public static getAllScores(): ScoreEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading scores:', error);
      return [];
    }
  }

  // Get scores for a specific song
  public static getScoresForSong(songId: string): ScoreEntry[] {
    const allScores = this.getAllScores();
    return allScores
      .filter(entry => entry.songId === songId)
      .sort((a, b) => b.score - a.score);
  }

  // Get top scores across all songs
  public static getTopScores(limit: number = 10): ScoreEntry[] {
    const allScores = this.getAllScores();
    return allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Save a new score
  public static saveScore(entry: ScoreEntry): boolean {
    try {
      const allScores = this.getAllScores();
      
      // Add the new entry
      allScores.push(entry);
      
      // Sort and keep only top entries per song
      const scoresBySong: Record<string, ScoreEntry[]> = {};
      allScores.forEach(score => {
        if (!scoresBySong[score.songId]) {
          scoresBySong[score.songId] = [];
        }
        scoresBySong[score.songId].push(score);
      });

      // Keep only top MAX_ENTRIES_PER_SONG per song
      const filteredScores: ScoreEntry[] = [];
      Object.keys(scoresBySong).forEach(songId => {
        const songScores = scoresBySong[songId]
          .sort((a, b) => b.score - a.score)
          .slice(0, this.MAX_ENTRIES_PER_SONG);
        filteredScores.push(...songScores);
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredScores));
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  }

  // Check if score is a new high score for the song
  public static isHighScore(songId: string, score: number): boolean {
    const songScores = this.getScoresForSong(songId);
    if (songScores.length < this.MAX_ENTRIES_PER_SONG) {
      return true;
    }
    return score > songScores[songScores.length - 1].score;
  }

  // Get the rank of a score for a song (1-based)
  public static getScoreRank(songId: string, score: number): number {
    const songScores = this.getScoresForSong(songId);
    for (let i = 0; i < songScores.length; i++) {
      if (score >= songScores[i].score) {
        return i + 1;
      }
    }
    return songScores.length + 1;
  }

  // Clear all scores
  public static clearAllScores(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Calculate grade based on accuracy
  public static calculateGrade(accuracy: number): string {
    if (accuracy >= 95) return 'S';
    if (accuracy >= 90) return 'A+';
    if (accuracy >= 85) return 'A';
    if (accuracy >= 80) return 'A-';
    if (accuracy >= 75) return 'B+';
    if (accuracy >= 70) return 'B';
    if (accuracy >= 65) return 'C+';
    if (accuracy >= 60) return 'C';
    if (accuracy >= 50) return 'D';
    return 'F';
  }

  // Get grade color class
  public static getGradeColor(grade: string): string {
    switch (grade) {
      case 'S': return 'text-yellow-300';
      case 'A+':
      case 'A':
      case 'A-': return 'text-green-400';
      case 'B+':
      case 'B': return 'text-blue-400';
      case 'C+':
      case 'C': return 'text-purple-400';
      case 'D': return 'text-orange-500';
      default: return 'text-red-500';
    }
  }
}
