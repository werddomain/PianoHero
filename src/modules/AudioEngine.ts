export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private sustainedNotes: Record<string, { oscillator: OscillatorNode, gainNode: GainNode }> = {};
  
  // Note frequencies
  private readonly NOTE_FREQUENCIES: Record<string, number> = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
    'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99
  };

  constructor() {
    this.initAudioContext();
  }

  // Initialize Web Audio API context
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Web Audio API initialized successfully');
    } catch (error) {
      console.error('Web Audio API is not supported in this browser', error);
    }
  }

  // Get or create audio context
  public getAudioContext(): AudioContext | null {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    return this.audioContext;
  }

  // Play a note with a specific duration
  public playNote(note: string, duration: number = 0.3): void {
    if (!this.audioContext) return;

    const frequency = this.NOTE_FREQUENCIES[note];
    if (!frequency) {
      console.warn(`Unknown note: ${note}`);
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Start playing a sustained note
  public startSustainedNote(note: string): void {
    if (!this.audioContext) return;

    const frequency = this.NOTE_FREQUENCIES[note];
    if (!frequency) {
      console.warn(`Unknown note: ${note}`);
      return;
    }

    // If already playing this note, stop it first
    if (this.sustainedNotes[note]) {
      this.stopSustainedNote(note);
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'triangle';

    // Start with silence, then fade in
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);

    oscillator.start(this.audioContext.currentTime);

    // Store the nodes for later stopping
    this.sustainedNotes[note] = { oscillator, gainNode };
  }

  // Stop a sustained note
  public stopSustainedNote(note: string): void {
    const noteData = this.sustainedNotes[note];
    if (!noteData || !this.audioContext) return;

    const { oscillator, gainNode } = noteData;

    // Fade out quickly to avoid clicks
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
    oscillator.stop(this.audioContext.currentTime + 0.05);

    delete this.sustainedNotes[note];
  }

  // Clean up all active notes
  public cleanup(): void {
    Object.keys(this.sustainedNotes).forEach(note => {
      this.stopSustainedNote(note);
    });
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
