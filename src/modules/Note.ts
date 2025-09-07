// Define basic types and interfaces for notes
export interface Note {
  note: string;    // The note name (e.g., 'C4', 'D4')
  time: number;    // When the note should be played (seconds)
  duration: number; // How long the note lasts (seconds)
  isHit?: boolean; // Whether the note has been hit
  hitQuality?: 'perfect' | 'good' | 'poor' | 'miss'; // Quality of the hit
  element?: HTMLElement; // DOM element representing the note
  timeToHit?: number; // Time remaining until the note should be hit
}

export interface Song {
  name: string;
  notes: Note[];
}

export enum HitQuality {
  PERFECT = 'perfect',
  GOOD = 'good',
  POOR = 'poor',
  MISS = 'miss'
}

export const TIMING_WINDOWS = {
  PERFECT: 16.7,  // ms
  GOOD: 40,       // ms
  POOR: 80        // ms
};

export const SCORE_VALUES = {
  PERFECT: 100,
  GOOD: 50,
  POOR: 25,
  SUSTAINED_NOTE_TICK: 5  // Points per tick for held notes
};

export const COMBO_MULTIPLIERS = [
  { threshold: 0, multiplier: 1 },   // 0-3 notes
  { threshold: 4, multiplier: 2 },   // 4-7 notes
  { threshold: 8, multiplier: 4 },   // 8-11 notes
  { threshold: 12, multiplier: 6 },  // 12-15 notes
  { threshold: 16, multiplier: 8 }   // 16+ notes
];
