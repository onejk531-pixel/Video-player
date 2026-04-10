# Advanced Video Player

A feature-rich HTML5 video player with custom controls, playlist management, and modern UI.

## Features

### Playback Controls
- Play/Pause with click or center button
- Seek bar with progress, buffered indicator, and thumbnail preview
- Skip forward/backward (10s)
- Frame-by-frame navigation (`,` and `.`)
- Variable playback speed (0.25x - 4x)
- Volume control with mute toggle
- Loop modes (none, playlist, video)

### Video Management
- Add videos via URL
- Open local files from your computer
- Playlist with search, shuffle, and drag support
- Import/Export playlist as JSON
- Auto-play next video
- Remember playback position per video

### User Interface
- Dark/Light theme toggle
- Custom accent color picker
- Keyboard shortcuts overlay
- Loading spinner and skip indicators
- Responsive design (desktop, tablet, mobile)

### Advanced Features
- Picture-in-Picture mode
- Fullscreen mode
- Closed captions (toggle)
- Double-click for fullscreen
- Previous/Next video buttons
- Resume watching prompt

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` / `→` | Rewind/Forward 5s |
| `↑` / `↓` | Volume +/- 10% |
| `M` | Mute/Unmute |
| `F` | Toggle Fullscreen |
| `P` | Picture-in-Picture |
| `C` | Captions |
| `L` | Cycle loop mode |
| `N` | Next video |
| `B` | Previous video |
| `0-9` | Seek to 0-90% |
| `,` / `.` | Frame back/forward |
| `?` | Toggle shortcuts |

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5 Video API
- CSS3 with CSS Variables
- Parcel Bundler

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT
