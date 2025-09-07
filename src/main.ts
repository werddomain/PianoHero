import { GameEngine } from './modules/GameEngine';
import { Renderer } from './modules/Renderer';
import { InputHandler } from './modules/InputHandler';
import { AudioEngine } from './modules/AudioEngine';
import { UI } from './modules/UI';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Create game container
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    console.error('Game container not found');
    return;
  }

  // Initialize modules
  const gameEngine = new GameEngine();
  const audioEngine = new AudioEngine();
  const renderer = new Renderer(gameContainer, gameEngine);
  const inputHandler = new InputHandler();
  const ui = new UI(document.getElementById('ui-container') || document.body, gameEngine);

  // Load songs list
  await ui.loadSongs();

  // Start rendering
  renderer.startRendering();

  // Handle input
  inputHandler.onNotePressed(note => {
    // Play sound
    audioEngine.startSustainedNote(note);
    
    // Visual feedback
    renderer.activatePianoKey(note);
    
    // Game logic
    gameEngine.handleNotePress(note);
  });

  inputHandler.onNoteReleased(note => {
    // Stop sound
    audioEngine.stopSustainedNote(note);
    
    // Visual feedback
    renderer.deactivatePianoKey(note);
    
    // Game logic
    gameEngine.handleNoteRelease(note);
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    inputHandler.destroy();
    audioEngine.cleanup();
    renderer.stopRendering();
  });
});

// Log initialization
console.log('Piano Hero initialized');
