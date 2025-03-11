# Vanilla Chess

A modern web-based chess application built with vanilla JavaScript that allows users to play chess against an AI opponent with adjustable difficulty levels.

## Features

- **Intuitive Chess Interface**: Responsive chessboard with drag-and-drop functionality
- **AI Opponent**: Play against the computer with three difficulty levels:
  - Easy: Makes random moves
  - Medium: Prioritizes captures and checks
  - Hard: Uses strategic position evaluation
- **Game Controls**: Undo moves, start new games, and adjust game settings
- **Time Controls**: Built-in chess clock with configurable time formats
- **Sound Effects**: Realistic chess piece sounds with volume control
- **Game History**: Review and replay your past games
- **Mobile-Friendly**: Responsive design works on desktop and mobile devices

## Quick Start

1. Clone this repository
2. Open `index.html` in your web browser
3. Start playing!

No build process or server setup required - this application runs entirely in the browser.

## Technology

The Chess App is built using:
- Vanilla JavaScript with object-oriented programming principles
- HTML5/CSS3 for the user interface
- [Chess.js](https://github.com/jhlywa/chess.js/) for chess move validation and rules
- Web Audio API for sound synthesis
- Local Storage API for game history

## Documentation

Detailed technical documentation is available in the `docs/` directory:
- [Technical Documentation](docs/technical-documentation.md): Complete system architecture and functionality details
- [Move Execution Process](docs/move-execution.md): How chess moves are processed
- [Piece Selection](docs/piece-selection.md): The visual feedback system for chess pieces

## Contributing

Contributions are welcome! Please see the [TODO list](TODO.md) for planned features and improvements.

## License

This project is licensed under the ISC license.
