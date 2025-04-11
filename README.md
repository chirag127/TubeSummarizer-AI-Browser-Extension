# TubeSummarizer AI Browser Extension

A browser extension that automatically summarizes YouTube videos and displays the summary in a collapsible sidebar. It also reads the summary aloud with synchronized word-by-word highlighting.

## Features

-   Automatically fetches the transcript of a YouTube video
-   Summarizes the content using AI (Gemini 2.0 Flash Lite)
-   Displays the summary in a styled sidebar
-   Reads the summary aloud with word-by-word highlighting
-   Customizable TTS voice and speed

## Installation

### Extension

1. Clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder

### Backend (Coming Soon)

The backend API for transcript fetching and AI summarization is currently under development. For now, the extension uses simulated responses for demonstration purposes.

## Usage

1. Go to any YouTube video
2. The extension will automatically detect the video and add a toggle button
3. Click the toggle button to open the sidebar
4. View the summary in the sidebar
5. Use the TTS controls to listen to the summary with word highlighting

## Development

-   Extension: The extension is built with vanilla HTML, CSS, and JavaScript
-   Backend: The backend will be built with Node.js and Express (coming soon)

## License

MIT
