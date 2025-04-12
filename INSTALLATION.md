# Installation Guide

This guide will help you install and set up the YouTube Video Summarizer + Read Aloud Sidebar Extension.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Gemini API key (get one from [Google AI Studio](https://ai.google.dev/))

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/chirag127/TubeSummarizer-AI-Browser-Extension.git
cd TubeSummarizer-AI-Browser-Extension
```

### 2. Set Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Gemini API key:
   ```
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The server should now be running on http://localhost:3000

### 3. Install the Extension

#### Chrome/Edge

1. Open Chrome or Edge and go to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `extension` folder from the repository
4. The extension should now be installed and visible in your browser toolbar

#### Firefox

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the repository and select the `manifest.json` file in the `extension` folder
4. The extension should now be installed and visible in your browser toolbar

## Usage

1. Visit any YouTube video page
2. The extension will automatically detect the video and inject a sidebar
3. Click the extension icon in the toolbar to toggle the sidebar
4. The summary will be displayed in the sidebar
5. Click the "Read Aloud" button to have the summary read aloud with word-by-word highlighting
6. Use the TTS controls to pause, stop, or adjust the playback
7. Click the settings icon to customize the TTS settings

## Troubleshooting

- **Extension not working**: Make sure the backend server is running
- **No summary generated**: Check that your Gemini API key is valid and properly set in the `.env` file
- **TTS not working**: Some browsers may have limitations with the Web Speech API. Try using Chrome for the best experience

## Building for Production

To build the extension for production:

```bash
npm run build
```

This will create a zip file in the `dist` directory that can be uploaded to the Chrome Web Store or Firefox Add-ons.
