# Piano Hero Game

A web-based rhythm game where players hit piano keys in time with falling notes.

## Features

- **Interactive Piano**: Play notes using your computer keyboard or mouse clicks
- **Rhythm Gameplay**: Hit the falling notes at the perfect time for maximum score
- **Song Library**: Built-in popular songs like "Happy Birthday", "Twinkle Twinkle Little Star", and "Mary Had a Little Lamb"
- **AI Song Generation**: Request custom songs using Claude AI (requires API key)
- **Real-time Scoring**: Get feedback with Perfect, Good, Poor, or Miss ratings
- **Pause/Resume**: Full game control with spacebar shortcuts
- **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. **Choose a Song**: Click on one of the suggested songs or type a custom request
2. **Start Game**: Click "Start Game" when ready
3. **Hit the Notes**: As notes fall, press the corresponding keyboard keys when they reach the red hit line
4. **Scoring**: Hit notes perfectly for maximum points
5. **Controls**: 
   - Use keyboard keys `a-j` and `w,e,t,y,u,o,p` for piano notes
   - Press `Spacebar` to pause/resume during gameplay
   - Click piano keys with mouse as alternative

## Keyboard Mapping

**White Keys**: `a` `s` `d` `f` `g` `h` `j` `k` `l` `;` `'`  
**Black Keys**: `w` `e` `t` `y` `u` `o` `p`

Notes span from C4 to F5 covering 1.5 octaves.

## Installation & Setup

### Quick Start (No Installation Required)
Simply open `index.html` in any modern web browser. The game uses CDN-hosted libraries and will work immediately.

### Development Setup

1. **Clone or Download** this repository
2. **Install Node.js** (optional, for development server)
3. **Install dependencies** (optional):
   ```bash
   npm install
   ```
4. **Run development server** (optional):
   ```bash
   npm start
   ```
   This will start a live-reloading server at `http://localhost:3000`

### Alternative Servers

**Python 3**:
```bash
python -m http.server 8000
```

**Python 2**:
```bash
python -m SimpleHTTPServer 8000
```

**PHP**:
```bash
php -S localhost:8000
```

## File Structure

```
PianoHero/
├── index.html          # Main game file (standalone)
├── package.json        # Node.js dependencies (optional)
├── README.md          # This file
├── LICENSE            # License file
└── GamePrototype.js   # Original React component (for reference)
```

## Technology Stack

- **React 18**: UI framework (loaded via CDN)
- **Tailwind CSS**: Styling framework (loaded via CDN)
- **Web Audio API**: Real-time sound generation
- **Vanilla JavaScript**: Core game logic
- **HTML5**: Structure and canvas

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

## Custom Song Integration

To add more built-in songs, modify the `BUILT_IN_SONGS` array in `index.html`:

```javascript
const BUILT_IN_SONGS = [
  {
    request: "Song Name",
    data: {
      title: "Display Title",
      notes: [
        {"note": "C4", "duration": 0.5, "time": 0},
        {"note": "D4", "duration": 0.5, "time": 0.5},
        // ... more notes
      ]
    }
  }
];
```

## Performance Notes

- The game uses `requestAnimationFrame` for smooth 60fps animation
- Web Audio API provides low-latency sound generation
- React renders efficiently with proper state management
- Game works offline once loaded (except for AI song generation)

## Troubleshooting

**No Sound**: Click anywhere on the page first to activate Web Audio API  
**Lag Issues**: Close other browser tabs, ensure 60fps browser support  
**Keyboard Not Working**: Click on the game area to focus the window  
**Mobile Issues**: Use touch controls on the piano keys directly  

## License

MIT License - feel free to modify and distribute.

## Development

To modify the game:
1. Edit the React component code within the `<script type="text/babel">` section in `index.html`
2. The game logic is contained in the `PianoHero` component
3. Styling uses Tailwind CSS classes
4. Audio generation is handled by the Web Audio API

For major changes, consider converting back to a proper React development environment with separate component files.