# Vanilla Chess

A modern web-based chess application built with vanilla JavaScript that allows users to play chess against an AI opponent with adjustable difficulty levels. This project demonstrates the power of pure JavaScript without relying on frameworks.

## Features

- **Interactive Chess Interface**: Fully responsive chessboard with intuitive drag-and-drop functionality
- **AI Opponent**: Challenge yourself against the computer with three difficulty levels:
  - **Easy**: Makes random legal moves (perfect for beginners)
  - **Medium**: Prioritizes captures and checks (intermediate challenge)
  - **Hard**: Uses advanced position evaluation and strategy (serious challenge)
- **Game Controls**: Undo moves, reset the board, and customize game settings
- **Time Controls**: Professional chess clock with multiple time formats (bullet, blitz, rapid)
- **Sound Effects**: Immersive chess piece movement and capture sounds with adjustable volume
- **Game History**: Save, review, and replay your past games
- **Mobile-Friendly**: Responsive design optimized for both desktop and mobile devices

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/vanilla-chess.git
   ```
2. Open `index.html` in your web browser
3. Start playing chess!

No build process or server setup required - this application runs entirely in the browser.

## Technology Stack

Built with modern web standards:
- **Vanilla JavaScript**: Pure JS with object-oriented programming principles
- **HTML5/CSS3**: Modern, responsive user interface
- **Chess.js**: Industry-standard library for chess move validation and rules
- **Web Audio API**: High-quality sound effects
- **Local Storage API**: Persistent game history

## Documentation

Comprehensive documentation available in the `docs/` directory:
- [Technical Documentation](docs/technical-documentation.md): Complete system architecture
- [Move Execution Process](docs/move-execution.md): Detailed move processing flow
- [Piece Selection](docs/piece-selection.md): Visual feedback implementation
- [Game Replay](docs/game-replay.md): Step-by-step playback system for reviewing completed games
- [Drag and Drop](docs/drag-and-drop.md): Implementation of intuitive drag-and-drop piece movement with cross-platform support

## Development

### Prerequisites
- Basic understanding of JavaScript, HTML, and CSS
- Modern web browser

### Development Setup
Simply edit the source files and refresh your browser to see changes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [TODO list](TODO.md) for planned features and improvements.

## Acknowledgements

- This project was developed with the assistance of [GitHub Copilot](https://github.com/features/copilot), demonstrating the potential of AI-assisted development
- [Chess.js](https://github.com/jhlywa/chess.js/) for the chess logic engine
- Special thanks to all open-source contributors who inspire projects like this

## License

This project is licensed under the ISC license. See the LICENSE file for details.
