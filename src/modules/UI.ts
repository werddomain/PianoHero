import { GameEngine } from './GameEngine';

export class UI {
  private container: HTMLElement;
  private gameEngine: GameEngine;
  
  // UI Components
  private scoreElement: HTMLElement;
  private comboElement: HTMLElement;
  private songSelectElement: HTMLSelectElement;
  private startButton: HTMLElement;
  private pauseButton: HTMLElement;
  private endScreenContainer: HTMLElement;
  
  constructor(container: HTMLElement, gameEngine: GameEngine) {
    this.container = container;
    this.gameEngine = gameEngine;
    
    // Create UI elements
    this.scoreElement = this.createScoreElement();
    this.comboElement = this.createComboElement();
    this.songSelectElement = this.createSongSelectElement();
    this.startButton = this.createStartButton();
    this.pauseButton = this.createPauseButton();
    this.endScreenContainer = this.createEndScreenContainer();
    
    // Add UI elements to container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'flex justify-between items-center w-full p-4 bg-gray-800';
    
    const leftControls = document.createElement('div');
    leftControls.className = 'flex items-center gap-4';
    leftControls.appendChild(this.scoreElement);
    leftControls.appendChild(this.comboElement);
    
    const rightControls = document.createElement('div');
    rightControls.className = 'flex items-center gap-4';
    rightControls.appendChild(this.songSelectElement);
    rightControls.appendChild(this.startButton);
    rightControls.appendChild(this.pauseButton);
    
    controlsContainer.appendChild(leftControls);
    controlsContainer.appendChild(rightControls);
    
    this.container.appendChild(controlsContainer);
    this.container.appendChild(this.endScreenContainer);
    
    // Hide pause button and end screen initially
    this.pauseButton.classList.add('hidden');
    this.endScreenContainer.classList.add('hidden');
    
    // Register callbacks
    this.gameEngine.onScoreUpdate((score) => this.updateScore(score));
    this.gameEngine.onComboUpdate((combo) => this.updateCombo(combo));
    this.gameEngine.onGameEnd(() => this.showEndScreen());
  }
  
  // Create score display
  private createScoreElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'bg-gray-700 p-2 rounded-md text-white';
    
    const label = document.createElement('span');
    label.className = 'mr-2 text-gray-300';
    label.textContent = 'Score:';
    
    const value = document.createElement('span');
    value.id = 'score-value';
    value.className = 'font-bold text-xl';
    value.textContent = '0';
    
    element.appendChild(label);
    element.appendChild(value);
    
    return element;
  }
  
  // Create combo display
  private createComboElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'bg-gray-700 p-2 rounded-md text-white';
    
    const label = document.createElement('span');
    label.className = 'mr-2 text-gray-300';
    label.textContent = 'Combo:';
    
    const value = document.createElement('span');
    value.id = 'combo-value';
    value.className = 'font-bold text-xl';
    value.textContent = '0';
    
    element.appendChild(label);
    element.appendChild(value);
    
    return element;
  }
  
  // Create song selection dropdown
  private createSongSelectElement(): HTMLSelectElement {
    const element = document.createElement('select');
    element.id = 'song-select';
    element.className = 'bg-gray-700 p-2 rounded-md text-white';
    
    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a song...';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    element.appendChild(defaultOption);
    
    // Happy Birthday option
    const happyBirthday = document.createElement('option');
    happyBirthday.value = 'happy birthday.json';
    happyBirthday.textContent = 'Happy Birthday';
    element.appendChild(happyBirthday);
    
    return element;
  }
  
  // Create start button
  private createStartButton(): HTMLElement {
    const element = document.createElement('button');
    element.id = 'start-button';
    element.className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded';
    element.textContent = 'Start Game';
    
    element.addEventListener('click', async () => {
      const selectedSong = this.songSelectElement.value;
      if (!selectedSong) {
        alert('Please select a song first.');
        return;
      }
      
      try {
        await this.gameEngine.loadSong(selectedSong);
        this.gameEngine.startGame();
        
        // Hide start button, show pause button
        this.startButton.classList.add('hidden');
        this.pauseButton.classList.remove('hidden');
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to start game. Please try again.');
      }
    });
    
    return element;
  }
  
  // Create pause button
  private createPauseButton(): HTMLElement {
    const element = document.createElement('button');
    element.id = 'pause-button';
    element.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded';
    element.textContent = 'Pause';
    
    let isPaused = false;
    
    element.addEventListener('click', () => {
      if (isPaused) {
        this.gameEngine.resumeGame();
        element.textContent = 'Pause';
      } else {
        this.gameEngine.pauseGame();
        element.textContent = 'Resume';
      }
      isPaused = !isPaused;
    });
    
    return element;
  }
  
  // Create end screen container
  private createEndScreenContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'end-screen';
    container.className = 'absolute inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center z-50 p-8';
    
    const title = document.createElement('h2');
    title.className = 'text-3xl font-bold mb-6 text-white';
    title.textContent = 'Game Over';
    
    const stats = document.createElement('div');
    stats.id = 'end-stats';
    stats.className = 'flex flex-col gap-2 mb-6 w-full max-w-md bg-gray-800 p-4 rounded-md';
    
    // Stats will be filled in when the game ends
    
    const button = document.createElement('button');
    button.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded';
    button.textContent = 'Play Again';
    
    button.addEventListener('click', () => {
      this.hideEndScreen();
      this.startButton.classList.remove('hidden');
      this.pauseButton.classList.add('hidden');
    });
    
    container.appendChild(title);
    container.appendChild(stats);
    container.appendChild(button);
    
    return container;
  }
  
  // Update score display
  private updateScore(score: number): void {
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
      scoreValue.textContent = score.toString();
    }
  }
  
  // Update combo display
  private updateCombo(combo: number): void {
    const comboValue = document.getElementById('combo-value');
    if (comboValue) {
      comboValue.textContent = combo.toString();
      
      // Apply animation for combo milestones
      if (combo > 0 && combo % 8 === 0) {
        comboValue.classList.add('text-yellow-400', 'scale-125');
        setTimeout(() => {
          comboValue.classList.remove('text-yellow-400', 'scale-125');
        }, 500);
      }
    }
  }
  
  // Show end screen with stats
  private showEndScreen(): void {
    const gameState = this.gameEngine.getGameState();
    const statsContainer = document.getElementById('end-stats');
    
    if (statsContainer) {
      // Clear previous stats
      statsContainer.innerHTML = '';
      
      // Create stats entries
      const createStatRow = (label: string, value: string, color: string = 'text-white') => {
        const row = document.createElement('div');
        row.className = 'flex justify-between items-center';
        
        const labelElement = document.createElement('span');
        labelElement.className = 'text-gray-300';
        labelElement.textContent = label;
        
        const valueElement = document.createElement('span');
        valueElement.className = `font-bold ${color}`;
        valueElement.textContent = value;
        
        row.appendChild(labelElement);
        row.appendChild(valueElement);
        
        return row;
      };
      
      // Add stats rows
      statsContainer.appendChild(createStatRow('Final Score:', gameState.score.toString(), 'text-blue-400'));
      statsContainer.appendChild(createStatRow('Max Combo:', gameState.statistics.maxCombo.toString(), 'text-yellow-400'));
      statsContainer.appendChild(createStatRow('Perfect Hits:', gameState.statistics.perfect.toString(), 'text-green-400'));
      statsContainer.appendChild(createStatRow('Good Hits:', gameState.statistics.good.toString(), 'text-yellow-400'));
      statsContainer.appendChild(createStatRow('Poor Hits:', gameState.statistics.poor.toString(), 'text-orange-400'));
      statsContainer.appendChild(createStatRow('Missed Notes:', gameState.statistics.miss.toString(), 'text-red-400'));
      
      // Calculate accuracy
      const totalNotes = gameState.statistics.perfect + gameState.statistics.good + 
                        gameState.statistics.poor + gameState.statistics.miss;
      const accuracy = totalNotes > 0 
        ? Math.round((gameState.statistics.perfect + 0.6 * gameState.statistics.good + 0.2 * gameState.statistics.poor) / totalNotes * 100) 
        : 0;
      
      statsContainer.appendChild(createStatRow('Accuracy:', `${accuracy}%`, 'text-purple-400'));
      
      // Add a grade based on accuracy
      let grade = 'F';
      let gradeColor = 'text-red-500';
      
      if (accuracy >= 95) { grade = 'S'; gradeColor = 'text-yellow-300'; }
      else if (accuracy >= 90) { grade = 'A+'; gradeColor = 'text-green-400'; }
      else if (accuracy >= 85) { grade = 'A'; gradeColor = 'text-green-400'; }
      else if (accuracy >= 80) { grade = 'A-'; gradeColor = 'text-green-400'; }
      else if (accuracy >= 75) { grade = 'B+'; gradeColor = 'text-blue-400'; }
      else if (accuracy >= 70) { grade = 'B'; gradeColor = 'text-blue-400'; }
      else if (accuracy >= 65) { grade = 'C+'; gradeColor = 'text-purple-400'; }
      else if (accuracy >= 60) { grade = 'C'; gradeColor = 'text-purple-400'; }
      else if (accuracy >= 50) { grade = 'D'; gradeColor = 'text-orange-500'; }
      
      const gradeRow = document.createElement('div');
      gradeRow.className = 'mt-4 text-center';
      gradeRow.innerHTML = `<span class="text-4xl font-bold ${gradeColor}">${grade}</span>`;
      statsContainer.appendChild(gradeRow);
    }
    
    // Show end screen
    this.endScreenContainer.classList.remove('hidden');
  }
  
  // Hide end screen
  private hideEndScreen(): void {
    this.endScreenContainer.classList.add('hidden');
  }
  
  // Load available songs
  public async loadSongs(): Promise<void> {
    try {
      const response = await fetch('/songs/songs.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clear existing options except default
      while (this.songSelectElement.options.length > 1) {
        this.songSelectElement.remove(1);
      }
      
      // Add options for each song
      data.songs.forEach((song: any) => {
        const option = document.createElement('option');
        option.value = song.file;
        option.textContent = `${song.title}${song.difficulty ? ` (${song.difficulty})` : ''}`;
        this.songSelectElement.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading songs list:', error);
    }
  }
}
