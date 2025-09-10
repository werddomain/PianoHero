# Piano Hero Game
[Play Now](https://werddomain.github.io/PianoHero/)
A TypeScript-based rhythm game where players hit piano keys in time with falling notes.

## Features

- **Interactive Piano**: Play notes using your computer keyboard
- **Rhythm Gameplay**: Hit the falling notes at the perfect time for maximum score
- **Song Library**: Built-in songs like "Happy Birthday" with support for custom songs
- **Real-time Scoring**: Get feedback with Perfect, Good, Poor, or Miss ratings
- **Combo System**: Build your combo for multipliers and higher scores
- **Pause/Resume**: Full game control
- **Responsive Design**: Works on desktop devices

## How to Play

1. **Select a Song**: Choose a song from the dropdown
2. **Start Game**: Click "Start Game" when ready
3. **Hit the Notes**: As notes fall, press the corresponding keyboard keys when they reach the piano keys
4. **Scoring**: Hit notes perfectly for maximum points and build your combo
5. **Controls**: 
   - White Keys: `a` `s` `d` `f` `g` `h` `j` `k` `l` `;` `'`
   - Black Keys: `w` `e` `t` `y` `u` `o` `p`

## Keyboard Mapping

**White Keys**: `a` `s` `d` `f` `g` `h` `j` `k` `l` `;` `'`  
**Black Keys**: `w` `e` `t` `y` `u` `o` `p`

Notes span from C4 to F5 covering 1.5 octaves.

## Installation & Setup

### Development Setup

1. **Clone or Download** this repository
2. **Install Node.js** dependencies:
   ```bash
   npm install
   ```
3. **Build the project**:
   ```bash
   npm run build
   ```
4. **Start the server**:
   ```bash
   npm run serve
   ```
   This will start a Node.js http-server at `http://localhost:8000`
   
5. **Open the game** in your browser:
   ```
   http://localhost:8000/dist/index.html
   ```
#### **Debug in vscode**
- Press F5 to launch the default debug configuration
- Use the Run and Debug panel to select other configurations
- Use Ctrl+Shift+B to run the default build task (Build Piano Hero)
- Select "Watch Build" from the task menu to start watching for changes


## Project Structure

```
PianoHero/
├── dist/                # Compiled output
│   ├── bundle.js        # Compiled JavaScript
│   ├── index.html       # HTML entry point
│   └── style.css        # CSS styles
├── src/                 # TypeScript source code
│   ├── main.ts          # Main entry point
│   └── modules/         # Game modules
│       ├── GameEngine.ts    # Core game logic
│       ├── Renderer.ts      # Visual rendering
│       ├── InputHandler.ts  # Keyboard input
│       ├── AudioEngine.ts   # Sound generation
│       ├── UI.ts            # User interface
│       ├── SongLoader.ts    # Song loading
│       └── Note.ts          # Note types/interfaces
├── songs/               # Song files in JSON format
├── examples/            # Example files (reference)
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
├── webpack.config.js    # Webpack configuration
├── README.md            # This file
└── LICENSE              # License file
```

## Technology Stack

- **TypeScript**: Typed JavaScript for better code quality
- **Tailwind CSS**: Styling framework (loaded via CDN)
- **Web Audio API**: Real-time sound generation
- **Webpack**: Module bundling
- **HTML5/CSS3**: Structure and styling

## Browser Compatibility

- **Chrome**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅
- **Edge**: Full support ✅
- **Mobile browsers**: Supported with touch controls ✅

## Built-in Songs

The game includes these pre-loaded songs:
- Happy Birthday
- Twinkle Twinkle Little Star
- Mary Had a Little Lamb

## Adding Custom Songs

Songs are stored as JSON files in the `songs` directory with the following format:

```json
{
  "name": "Song Name",
  "notes": [
    {
      "note": "C4",
      "duration": 0.75,
      "time": 0
    },
    {
      "note": "D4", 
      "duration": 1,
      "time": 1
    }
    // More notes...
  ]
}
```

To add a new song:
1. Create a JSON file with your song data in the `songs` directory
2. Update the `songs/songs.json` file to include your song:

```json
{
  "songs": [
    {
      "id": "song-id",
      "title": "Song Title",
      "file": "your-song-file.json",
      "difficulty": "Easy"
    }
    // Other songs...
  ]
}
```

## Performance Notes

- The game uses `requestAnimationFrame` for smooth 60fps animation
- Web Audio API provides low-latency sound generation
- Game logic runs at a fixed 60 updates per second
- Modular architecture for better maintainability

## Troubleshooting

**No Sound**: Click anywhere on the page first to activate Web Audio API  
**Lag Issues**: Close other browser tabs, ensure 60fps browser support  
**Keyboard Not Working**: Click on the game area to focus the window

## Scoring System

- **Perfect hit**: 100 points
- **Good hit**: 50 points
- **Poor hit**: 25 points
- **Miss**: 0 points

Combos increase your score multiplier:
- 0-3 notes: x1
- 4-7 notes: x2
- 8-11 notes: x4
- 12-15 notes: x6
- 16+ notes: x8 (maximum)

## Development

To extend the game:
1. Modify TypeScript files in the `src/modules` directory
2. Build the project with `npm run build`
3. The architecture follows a clear separation of concerns:
   - `GameEngine`: Core game logic
   - `Renderer`: Visual rendering
   - `InputHandler`: Keyboard input handling
   - `AudioEngine`: Sound generation
   - `UI`: User interface components
   - `SongLoader`: Song loading and parsing

## License

BSD-2-Clause license
