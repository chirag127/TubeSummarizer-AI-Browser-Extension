# TubeSummarizer AI Browser Extension

A browser extension that automatically summarizes YouTube videos and displays the summary in a sidebar on the video page. Additionally, it offers a "Read Aloud" feature that speaks the summary out loud with real-time, word-by-word highlighting.

## Features

-   **Auto Summary Generation**: Automatically detects when a user is on a YouTube video page, extracts the transcript, and sends it to the backend for summarization using Gemini 2.0 Flash Lite.
-   **Sidebar UI**: Toggleable sidebar on the right of the YouTube video that displays the video title, AI-generated summary, and Read Aloud controls.
-   **Read Aloud with Word Highlighting**: Reads the summary using the Web Speech API with real-time, word-by-word highlighting.
-   **Customizable TTS Settings**: Adjust playback speed, voice selection, and pitch.
-   **Cross-Browser Compatibility**: Works on Chrome, Edge, and Firefox.

## Installation

### Extension

1. Clone this repository:

    ```
    git clone https://github.com/chirag127/TubeSummarizer-AI-Browser-Extension.git
    ```

2. Load the extension in Chrome:

    - Open Chrome and go to `chrome://extensions/`
    - Enable "Developer mode"
    - Click "Load unpacked" and select the `extension` folder from this repository

3. Load the extension in Firefox:

    - Open Firefox and go to `about:debugging#/runtime/this-firefox`
    - Click "Load Temporary Add-on..." and select the `manifest.json` file from the `extension` folder

4. Load the extension in Edge:
    - Open Edge and go to `edge://extensions/`
    - Enable "Developer mode"
    - Click "Load unpacked" and select the `extension` folder from this repository

### Backend Server

1. Navigate to the backend folder:

    ```
    cd backend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file with your Gemini API key:

    ```
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4. Start the server:
    ```
    npm start
    ```

## Usage

1. Visit a YouTube video page.
2. The extension will automatically detect the video and inject a sidebar.
3. Click the extension icon or use the keyboard shortcut (Ctrl+Shift+S) to toggle the sidebar.
4. The summary will be displayed in the sidebar.
5. Click the "Read Aloud" button to have the summary read aloud with word-by-word highlighting.
6. Use the TTS controls to pause, stop, or adjust the playback.
7. Click the settings icon to customize the TTS settings.

## Development

### Extension

The extension is built using vanilla JavaScript, HTML, and CSS. It consists of the following components:

-   `manifest.json`: Extension configuration
-   `background.js`: Background service worker
-   `content.js`: Content script for YouTube pages
-   `tts.js`: Text-to-speech with word highlighting
-   `styles.css`: Styles for the sidebar
-   `options.html/js`: Options page for TTS settings

### Backend

The backend is built using Express.js and integrates with the Gemini 2.0 Flash Lite API for summarization. It consists of the following components:

-   `server.js`: Express.js server
-   `summarizer.js`: Gemini API integration

## License

MIT

## Acknowledgements

-   [Gemini 2.0 Flash Lite API](https://ai.google.dev/) for AI-powered summarization
-   [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for text-to-speech functionality
