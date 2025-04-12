# Contributing to YouTube Video Summarizer

Thank you for considering contributing to the YouTube Video Summarizer + Read Aloud Sidebar Extension! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser and version
- Any additional context

### Suggesting Features

If you have an idea for a new feature, please create an issue on GitHub with the following information:

- A clear, descriptive title
- A detailed description of the feature
- Why this feature would be useful
- Any implementation ideas you have
- Mockups or examples (if applicable)

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Create a new Pull Request

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```
3. Set up the backend:
   - Create a `.env` file in the `backend` directory with your Gemini API key
   - Start the backend server: `npm run start:backend`
4. Load the extension in your browser:
   - Chrome/Edge: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select the `extension` folder
   - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on...", and select the `manifest.json` file in the `extension` folder

## Project Structure

- `extension/`: Browser extension frontend
  - `manifest.json`: Extension configuration
  - `background.js`: Background service worker
  - `content.js`: Content script for YouTube pages
  - `tts.js`: Text-to-speech with word highlighting
  - `styles.css`: Styles for the sidebar
  - `options.html/js`: Options page for TTS settings
- `backend/`: Backend server
  - `server.js`: Express.js server
  - `summarizer.js`: Gemini API integration
- `scripts/`: Build and utility scripts
- `tests/`: Test files

## Testing

Run tests with:

```bash
npm test
```

Please ensure all tests pass before submitting a pull request.

## Coding Standards

- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Write comments for complex logic
- Follow the existing code style

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.
