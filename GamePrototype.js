import React, { useState, useEffect, useCallback, useRef } from 'react';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "Piano Hero",
    "songInputPlaceholder": "Request a song...",
    "parseSongButton": "Parse song",
    "processingButton": "Processing...",
    "startGameButton": "Start Game",
    "gameOverButton": "Game Over",
    "score": "Score",
    "perfectHit": "Perfect!",
    "goodHit": "Good!",
    "poorHit": "Poor!",
    "miss": "Miss!",
    "claudePrompt": "Parse this song request and convert it to a COMPLETE melody using only these available piano notes: C4, C#4, D4, D#4, E4, F4, F#4, G4, G#4, A4, A#4, B4, C5, C#5, D5, D#5, E5, F5, F#5, G5.\n\nSong request: \"{songText}\"\n\nPlease respond with ONLY a JSON object in this exact format:\n{\n  \"title\": \"Song Name\",\n  \"notes\": [\n    {\"note\": \"C4\", \"duration\": 0.5, \"time\": 0},\n    {\"note\": \"D4\", \"duration\": 0.5, \"time\": 0.5},\n    {\"note\": \"E4\", \"duration\": 1, \"time\": 1}\n  ]\n}\n\nIMPORTANT: Create the COMPLETE song with ALL verses and sections. For songs like \"Happy Birthday\", include all 4 lines:\n- \"Happy birthday to you\" (line 1)\n- \"Happy birthday to you\" (line 2) \n- \"Happy birthday dear [name]\" (line 3)\n- \"Happy birthday to you\" (line 4)\n\nUse 25-40 notes for popular songs to capture the full melody. Use duration in seconds (0.25, 0.5, 1, 2) and time as the start time in seconds. Make sure all notes are from the available list above.\n\nDO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.",
    "parseErrorMessage": "Sorry, I had trouble parsing that song. Please try a different request.",
    "happyBirthday": "Happy birthday",
    "twinkleTwinkle": "Twinkle twinkle little star",
    "maryHadLamb": "Mary had a little lamb",
    "jingleBells": "Jingle bells",
    "sadMelody": "Sad melody",
    "amazingGrace": "Amazing grace",
    "silentNight": "Silent night",
    "auldLangSyne": "Auld lang syne"
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const FALL_DURATION = 5000; // 5 seconds for notes to fall
const HIT_TOLERANCE = {
  PERFECT: 150, // ±150ms
  GOOD: 300,    // ±300ms
  POOR: 500     // ±500ms
};

const PianoHero = () => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [songInput, setSongInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, ready, playing, paused, finished
  const [fallingNotes, setFallingNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showNotesOnFalling, setShowNotesOnFalling] = useState(true); // true = show notes, false = show keys
  const [gameCompleted, setGameCompleted] = useState(false);
  const audioContextRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const pauseTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationTimerRef = useRef(null);

  // Initialize songs cache
  useEffect(() => {
    if (!window["songs"]) {
      window["songs"] = [];
      console.log("Initialized songs cache:", window["songs"]);
    }
  }, []);

  // Note frequencies (Web Audio API)
  const noteFrequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
    'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99
  };

  // Piano key mappings - computer keyboard to notes
  const keyMappings = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 
    'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
    'p': 'D#5', ';': 'E5', "'": 'F5'
  };

  // All piano keys for display
  const pianoKeys = [
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

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log("Web Audio API initialized successfully");
      } catch (error) {
        console.error('Failed to initialize Web Audio API:', error);
      }
    };

    const handleFirstInteraction = () => {
      initAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play note using Web Audio API
  const playTone = (frequency, duration = 0.3) => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  };

  // Get note position for falling animation
  const getNotePosition = (note) => {
    const keyIndex = pianoKeys.findIndex(key => key.note === note);
    if (keyIndex === -1) return 0;
    
    const key = pianoKeys[keyIndex];
    if (key.type === 'white') {
      const whiteKeyIndex = pianoKeys.filter((k, i) => k.type === 'white' && i <= keyIndex).length - 1;
      return whiteKeyIndex * 64 + 32; // Center of white key
    } else {
      const whiteKeyIndex = pianoKeys.filter((k, i) => k.type === 'white' && i < keyIndex).length;
      return whiteKeyIndex * 64 - 24 + 24; // Center of black key
    }
  };

  // Check for note hits
  const checkNoteHit = (note, currentTime, currentFallingNotes) => {
    const hitTime = currentTime - gameStartTimeRef.current;
    
    // Find notes that should be hit around this time
    const eligibleNotes = currentFallingNotes.filter(fallingNote => {
      if (fallingNote.note !== note || fallingNote.hit) return false;
      
      const expectedHitTime = fallingNote.startTime + FALL_DURATION;
      const timeDiff = Math.abs(hitTime - expectedHitTime);
      
      return timeDiff <= HIT_TOLERANCE.POOR;
    });

    if (eligibleNotes.length === 0) return;

    // Get the closest note
    const closestNote = eligibleNotes.reduce((closest, current) => {
      const currentDiff = Math.abs(hitTime - (current.startTime + FALL_DURATION));
      const closestDiff = Math.abs(hitTime - (closest.startTime + FALL_DURATION));
      return currentDiff < closestDiff ? current : closest;
    });

    const expectedHitTime = closestNote.startTime + FALL_DURATION;
    const timeDiff = Math.abs(hitTime - expectedHitTime);

    // Mark note as hit
    setFallingNotes(prev => prev.map(n => 
      n.id === closestNote.id ? { ...n, hit: true } : n
    ));

    // Calculate score and feedback
    let points = 0;
    let feedbackText = '';

    if (timeDiff <= HIT_TOLERANCE.PERFECT) {
      points = 10;
      feedbackText = t('perfectHit');
    } else if (timeDiff <= HIT_TOLERANCE.GOOD) {
      points = 5;
      feedbackText = t('goodHit');
    } else if (timeDiff <= HIT_TOLERANCE.POOR) {
      points = 3;
      feedbackText = t('poorHit');
    }

    setScore(prev => prev + points);
    setFeedback(feedbackText);
    setTimeout(() => setFeedback(''), 1000);
  };

  // Play note and check for hits
  const playNote = useCallback((note) => {
    const frequency = noteFrequencies[note];
    if (frequency) {
      playTone(frequency, 0.3);
      
      setActiveKeys(prev => new Set([...prev, note]));
      setTimeout(() => {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }, 200);

      // Check for note hits during gameplay
      if (gameState === 'playing') {
        setFallingNotes(prev => {
          checkNoteHit(note, Date.now(), prev);
          return prev;
        });
      }
    }
  }, [gameState]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isInputFocused) return;
      
      // Spacebar to pause/resume
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
        return;
      }
      
      const note = keyMappings[e.key.toLowerCase()];
      if (note) {
        playNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playNote, isInputFocused, gameState]);

  // Parse song with Claude API
  const parseSong = async (songText) => {
    setIsProcessing(true);
    
    try {
      // Check if song exists in cache first
      const cachedSong = window["songs"].find(song => 
        song.request.toLowerCase().trim() === songText.toLowerCase().trim()
      );
      
      if (cachedSong) {
        console.log('Using cached song:', cachedSong.data.title);
        setCurrentSong(cachedSong.data);
        setGameState('ready');
        return cachedSong.data;
      }

      console.log('Song not found in cache, requesting from Claude API...');
      
      const prompt = t('claudePrompt').replace('{songText}', songText);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const responseText = data.content[0].text;
      
      // Clean response and parse JSON
      const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const songData = JSON.parse(cleanedResponse);
      
      console.log('DEBUG: Parsed song data:', songData);
      console.log(`DEBUG: Song "${songData.title}" has ${songData.notes.length} notes:`);
      songData.notes.forEach((note, index) => {
        console.log(`DEBUG: Note ${index + 1}: ${note.note} at ${note.time}s for ${note.duration}s`);
      });
      
      // Save to cache and log for code inclusion
      const cacheEntry = {
        request: songText.trim(),
        data: songData
      };
      window["songs"].push(cacheEntry);
      
      console.log('NEW SONG FOR CODE INCLUSION:');
      console.log(JSON.stringify(cacheEntry, null, 2));
      console.log('Current songs cache size:', window["songs"].length);
      
      setCurrentSong(songData);
      setGameState('ready');
      return songData;
    } catch (error) {
      console.error('Error parsing song:', error);
      alert(t('parseErrorMessage'));
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Start game
  const startGame = () => {
    if (!currentSong) return;

    setGameState('playing');
    setScore(0);
    setFeedback('');
    setGameCompleted(false);
    gameStartTimeRef.current = Date.now();

    // Create falling notes with unique IDs
    // Handle both individual notes and chord arrays
    const notes = [];
    currentSong.notes.forEach((noteItem, index) => {
      if (Array.isArray(noteItem.note)) {
        // Handle chord (multiple notes in an array)
        noteItem.note.forEach((singleNote, noteIndex) => {
          notes.push({
            id: `${singleNote}-${noteItem.time}-${index}-${noteIndex}`,
            note: singleNote,
            startTime: noteItem.time * 1000, // Convert to milliseconds
            duration: noteItem.duration * 1000,
            hit: false,
            position: getNotePosition(singleNote),
            isChord: true,
            chordId: `chord-${noteItem.time}-${index}`
          });
        });
      } else {
        // Handle single note
        notes.push({
          id: `${noteItem.note}-${noteItem.time}-${index}`,
          note: noteItem.note,
          startTime: noteItem.time * 1000, // Convert to milliseconds
          duration: noteItem.duration * 1000,
          hit: false,
          position: getNotePosition(noteItem.note)
        });
      }
    });

    setFallingNotes(notes);

    // End game when all notes have passed
    const maxTime = Math.max(...currentSong.notes.map(n => n.time)) * 1000 + FALL_DURATION + 2000;
    setTimeout(() => {
      setGameState(prevState => {
        if (prevState === 'playing') {
          setGameCompleted(true);
          setFallingNotes([]);
          return 'finished';
        }
        return prevState;
      });
    }, maxTime);
  };

  // Pause game
  const pauseGame = () => {
    setGameState('paused');
    pauseTimeRef.current = Date.now();
    
    // Clean up animation timers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
  };

  // Resume game
  const resumeGame = () => {
    if (pauseTimeRef.current && gameStartTimeRef.current) {
      const pauseDuration = Date.now() - pauseTimeRef.current;
      gameStartTimeRef.current += pauseDuration; // Adjust start time to account for pause
    }
    setGameState('playing');
  };

  // Restart game
  const restartGame = () => {
    setGameState('ready');
    setFallingNotes([]);
    setScore(0);
    setFeedback('');
    setGameCompleted(false);
  };

  // Exit game
  const exitGame = () => {
    setGameState('ready');
    setFallingNotes([]);
    setScore(0);
    setFeedback('');
    setGameCompleted(false);
  };

  // Update falling notes animation
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updateNotes = () => {
      const currentTime = Date.now() - gameStartTimeRef.current;
      
      setFallingNotes(prev => {
        const updatedNotes = prev.map(note => {
          const timeSinceStart = currentTime - note.startTime;
          const progress = Math.max(0, Math.min(1, timeSinceStart / FALL_DURATION));
          const yPosition = progress * 480; // Fall 480px to account for new keyboard height
          
          return { ...note, yPosition };
        });

        // Remove notes that have been hit or have passed the hit line
        const activeNotes = updatedNotes.filter(note => {
          if (note.hit) return false; // Remove hit notes
          if (note.yPosition > 480) { // Note passed the bottom
            return false;
          }
          return true;
        });

        return activeNotes;
      });
    };

    // Primary animation using requestAnimationFrame
    const animate = () => {
      updateNotes();
      if (gameState === 'playing') {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Backup timer to force animation at 60 FPS (16.67ms interval)
    const forceAnimation = () => {
      if (gameState === 'playing') {
        updateNotes();
      }
    };

    // Start both animation systems
    animate();
    animationTimerRef.current = setInterval(forceAnimation, 16);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [gameState]);

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    if (!songInput.trim()) return;
    
    const songData = await parseSong(songInput);
    if (songData) {
      setSongInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 mt-8">{t('appTitle')}</h1>
        
        {/* Score and Feedback */}
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="text-2xl font-bold">
            {t('score')}: {score}
          </div>
          {feedback && (
            <div className="text-xl font-bold text-yellow-400 animate-pulse">
              {feedback}
            </div>
          )}
        </div>

        {/* Song Input Section */}
        <div className="flex justify-center px-8 mb-4">
          <div className="bg-gray-800 rounded-lg shadow-sm p-4" style={{width: '736px'}}>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSongSubmit(e)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={t('songInputPlaceholder')}
                className="flex-1 px-3 py-2 border border-gray-600 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white bg-gray-700"
                disabled={isProcessing || gameState === 'playing'}
              />
              <button
                onClick={handleSongSubmit}
                disabled={isProcessing || !songInput.trim() || gameState === 'playing'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isProcessing ? t('processingButton') : t('parseSongButton')}
              </button>
            </div>

            {/* Game Controls */}
            {currentSong && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-200">
                    {currentSong.title}
                  </h3>
                  <div className="flex gap-2">
                    {gameState === 'ready' && (
                      <button
                        onClick={startGame}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        {t('startGameButton')}
                      </button>
                    )}
                    {gameState === 'playing' && (
                      <>
                        <button
                          onClick={pauseGame}
                          className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16"/>
                            <rect x="14" y="4" width="4" height="16"/>
                          </svg>
                          Pause
                        </button>
                        <button
                          onClick={restartGame}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"/>
                          </svg>
                          Restart
                        </button>
                        <button
                          onClick={exitGame}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/>
                          </svg>
                          Exit
                        </button>
                      </>
                    )}
                    {gameState === 'paused' && (
                      <>
                        <button
                          onClick={resumeGame}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Resume
                        </button>
                        <button
                          onClick={restartGame}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-7.5-7.5z"/>
                          </svg>
                          Restart
                        </button>
                        <button
                          onClick={exitGame}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1 1h-4a1 1 0 0 0-1 1v3M4 7h16"/>
                          </svg>
                          Exit
                        </button>
                      </>
                    )}
                    {gameState === 'finished' && (
                      <button
                        onClick={() => {
                          setGameState('ready');
                          setGameCompleted(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Play Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="flex justify-center px-8 mb-8">
          <div className="relative bg-gray-800 rounded-2xl p-4" style={{width: '736px', height: '580px'}}>
            
            {/* Vertical Guide Lines */}
            {pianoKeys.filter(key => key.type === 'white').map((key, index) => (
              <div
                key={`line-${key.note}`}
                className="absolute top-4 bottom-40 w-px bg-gray-600 opacity-30"
                style={{ left: `${28 + (index * 64)}px` }}
              />
            ))}
            
            {/* Note Display Toggle */}
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={() => setShowNotesOnFalling(!showNotesOnFalling)}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                {showNotesOnFalling ? 'Show Keys' : 'Show Notes'}
              </button>
            </div>
            
            {/* Falling Notes */}
            {(gameState === 'playing' || gameState === 'paused') && fallingNotes.map(note => {
              if (note.yPosition === undefined || note.yPosition < 0) return null;
              
              const keyData = pianoKeys.find(k => k.note === note.note);
              const isBlack = keyData?.type === 'black';
              
              return (
                <div
                  key={note.id}
                  className={`absolute w-12 h-8 rounded transition-all duration-75 ${
                    note.hit 
                      ? 'bg-green-400 border-green-300' 
                      : isBlack 
                        ? 'bg-purple-500 border-purple-400' 
                        : 'bg-blue-500 border-blue-400'
                  } border-2 shadow-lg ${gameState === 'paused' ? 'opacity-50' : ''}`}
                  style={{
                    left: `${note.position - 24}px`,
                    top: `${note.yPosition}px`,
                    zIndex: isBlack ? 20 : 10
                  }}
                >
                  <div className="text-xs text-center text-white font-bold leading-8">
                    {showNotesOnFalling ? note.note : keyData?.key?.toUpperCase()}
                  </div>
                </div>
              );
            })}

            {/* Paused Overlay */}
            {gameState === 'paused' && (
              <div className="absolute inset-4 bg-black bg-opacity-50 flex items-center justify-center z-40 rounded-xl">
                <div className="text-4xl font-bold text-white text-center">
                  <div className="text-6xl mb-2">⏸️</div>
                  <div>PAUSED</div>
                  <div className="text-lg mt-2 opacity-75">Press Resume or Spacebar to continue</div>
                </div>
              </div>
            )}

            {/* Game Completed Overlay */}
            {gameCompleted && (
              <div className="absolute inset-4 bg-black bg-opacity-75 flex items-center justify-center z-40 rounded-xl">
                <div className="text-4xl font-bold text-white text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-5xl mb-2">SONG COMPLETE!</div>
                  <div className="text-2xl mb-4 text-yellow-400">Final Score: {score}</div>
                  <div className="text-lg opacity-75">Great job! Ready for another song?</div>
                </div>
              </div>
            )}

            {/* Hit Line */}
            <div className="absolute bottom-36 left-4 right-4 h-1 bg-red-500 shadow-lg shadow-red-500/50"></div>

            {/* Piano Keyboard */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="relative">
                {/* White keys */}
                <div className="flex">
                  {pianoKeys.filter(key => key.type === 'white').map((key) => {
                    const isActive = activeKeys.has(key.note);
                    
                    return (
                      <button
                        key={key.note}
                        onMouseDown={() => playNote(key.note)}
                        className={`
                          w-16 h-32 border border-gray-400 rounded-b-xl
                          hover:bg-gray-100 active:bg-gray-200
                          transition-all duration-150 flex flex-col justify-end items-center pb-2
                          ${isActive ? 'bg-yellow-300 border-yellow-400' : 'bg-white text-black'}
                        `}
                      >
                        <span className="text-xs font-bold">
                          {key.key?.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Black keys */}
                <div className="absolute top-0 left-0 flex">
                  {pianoKeys.filter(key => key.type === 'black').map((key) => {
                    const whiteKeyIndex = pianoKeys.filter(k => k.type === 'white' && 
                      pianoKeys.indexOf(k) < pianoKeys.indexOf(key)).length;
                    
                    const leftOffset = (whiteKeyIndex * 64) - 24;
                    const isActive = activeKeys.has(key.note);
                    
                    return (
                      <button
                        key={key.note}
                        onMouseDown={() => playNote(key.note)}
                        style={{ left: `${leftOffset + 4}px` }}
                        className={`
                          absolute w-12 h-20 border border-gray-800 rounded-b-lg shadow-2xl
                          hover:bg-gray-700 active:bg-gray-600
                          transition-all duration-150 flex flex-col justify-end items-center pb-2 z-10
                          ${isActive ? 'bg-yellow-400 text-black' : 'bg-black text-white'}
                        `}
                      >
                        <span className="text-xs font-bold">
                          {key.key?.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Song Suggestions */}
        <div className="flex justify-center px-8">
          <div style={{width: '736px'}}>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { key: 'happyBirthday', value: 'Happy birthday' },
                { key: 'twinkleTwinkle', value: 'Twinkle twinkle little star' },
                { key: 'maryHadLamb', value: 'Mary had a little lamb' },
                { key: 'jingleBells', value: 'Jingle bells' },
                { key: 'sadMelody', value: 'Sad melody' },
                { key: 'amazingGrace', value: 'Amazing grace' },
                { key: 'silentNight', value: 'Silent night' },
                { key: 'auldLangSyne', value: 'Auld lang syne' }
              ].map((suggestion) => (
                <button
                  key={suggestion.key}
                  onClick={async () => {
                    setCurrentSong(null);
                    setGameState('idle');
                    setFallingNotes([]);
                    setGameCompleted(false);
                    setSongInput(suggestion.value);
                    await parseSong(suggestion.value);
                  }}
                  disabled={isProcessing || gameState === 'playing'}
                  className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t(suggestion.key)}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PianoHero;