# YouTube Video Summarizer + Read Aloud Sidebar Browser Extension

A browser extension that automatically summarizes YouTube videos and provides a read-aloud feature with word-by-word highlighting.

## Features

-   **Automatic Video Summarization**: Uses Gemini 2.0 Flash Lite AI to generate concise, high-quality summaries of YouTube videos
-   **Non-intrusive Sidebar**: Displays summaries in a clean, resizable sidebar without disrupting your YouTube experience
-   **Read Aloud with Word Highlighting**: Highlights each word as it's spoken using the Web Speech API
-   **Voice Selection**: Choose from available system voices for read-aloud
-   **Playback Controls**: Adjust speed and pitch of the spoken text
-   **Multi-language Support**: Works with videos in various languages (transcript availability dependent)
-   **Multi-browser Support**: Compatible with Chrome, Edge, and Firefox

## Installation

### Prerequisites

-   Node.js (v14 or newer)
-   npm (v6 or newer)

### Backend Setup

1. Clone the repository:

    ```
    git clone https://github.com/chirag127/TubeSummarizer-AI-Browser-Extension.git
    cd TubeSummarizer-AI-Browser-Extension
    ```

2. Install dependencies:

    ```
    npm install
    npm run install:backend
    ```

3. Set up your `.env` file in the `backend` directory:

    ```
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

    > You'll need a valid API key for Gemini 2.0 Flash Lite.

4. Start the backend server:
    ```
    npm run start:backend
    ```

### Extension Setup

1. Build the extension:

    ```
    npm run build
    ```

2. Install in Chrome/Edge:

    - Open Chrome/Edge and navigate to `chrome://extensions/`
    - Enable "Developer mode"
    - Click "Load unpacked"
    - Select the `extension` folder from the repository

3. Install in Firefox:
    - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
    - Click "Load Temporary Add-on..."
    - Select the `manifest.json` file from the `extension` folder

## Usage

1. Navigate to any YouTube video page
2. The extension will automatically detect the video and extract its transcript
3. A summary will be generated and displayed in the sidebar
4. Click "Read Aloud" to have the summary read to you with word-by-word highlighting
5. Use the settings icon to customize the voice, speed, and pitch of the read-aloud feature

## Development

### Project Structure

```
project-root/
│
├── extension/               # Browser extension frontend
│   ├── manifest.json        # Extension manifest
│   ├── content.js           # Content script for YouTube pages
│   ├── background.js        # Background service worker
│   ├── sidebar.html         # Sidebar HTML
│   ├── sidebar.css          # Sidebar styles
│   ├── sidebar.js           # Sidebar script (handles TTS)
│   ├── popup.html           # Extension popup
│   ├── popup.js             # Popup script
│   └── icons/               # Extension icons
│
├── backend/                 # Backend server
│   ├── server.js            # Express.js server
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
│
├── scripts/                 # Build and utility scripts
│   ├── build.js             # Build script
│   └── create-icons.js      # Icon generation script
│
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

### Development Workflow

1. Start the backend server:

    ```
    npm run dev:backend
    ```

2. Make changes to the extension code in the `extension` directory

3. Load the extension in your browser for testing:
    - For Chrome/Edge, click the refresh button on the extension card in `chrome://extensions/`
    - For Firefox, reload the extension in `about:debugging#/runtime/this-firefox`

### Building

Run the build script to package the extension:

```
npm run build
```

This will generate extension packages in the `dist` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-   [Gemini 2.0 Flash Lite API](https://ai.google.dev/gemini-api) for AI-powered summarization
-   [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for TTS functionality
-   [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/) and [Firefox WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) for browser extension functionality

---

Created by [chirag127](https://github.com/chirag127)
