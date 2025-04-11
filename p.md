Here’s a full **Product Requirements Document (PRD)** for your **YouTube Video Summarizer + Read Aloud Sidebar Extension**:
created it with the following sections:
---

# 📄 Product Requirements Document
**Product Name:** TubeSummarizer AI
**Type:** Browser Extension
**Supported Browsers:** Chrome, Edge, Firefox (Manifest V3)

---

## 🧠 Overview

**TubeSummarizer AI** is a browser extension that automatically summarizes YouTube videos and displays the summary in a collapsible sidebar on the video page. It also reads the summary aloud with synchronized **word-by-word highlighting**.

---

## 🎯 Goals

- Automatically fetch the transcript or audio of a YouTube video.
- Summarize the content using AI (Gemini 2.0 Flash Lite).
- Display the summary in a styled sidebar.
- Add a “Read Aloud” feature with:
  - Word-by-word highlighting.
  - Play, Pause, Speed, Voice options.

---

## 🏗️ Architecture

### Frontend
- **Tech Stack:** HTML, CSS, JavaScript (Vanilla or React)
- **Folder:** `extension/`
- **Components:**
  - `content.js`: Injects sidebar into YouTube page
  - `sidebar.html/css/js`: UI and logic for summary and TTS
  - `background.js`: Handles browser events
  - `manifest.json`: Manifest V3 file
  - `tts.js`: Handles TTS and word highlighting

### Backend
- **Tech Stack:** Express.js
- **Folder:** `backend/`
- **Endpoints:**
  - `POST /summarize`: Receives video transcript/audio URL → returns summary
  - `GET /transcript/:videoId`: Fetches transcript from YouTube (fallback to audio processing if not available)

### ML
- **Model:** Gemini 2.0 Flash Lite
- **Use:** Summarize video transcripts or audio

---

## ✨ Features

### 🧾 Sidebar Summary
- Collapsible sidebar injected on YouTube video pages.
- Shows:
  - Title
  - Summary (paragraph style)
  - “Read Aloud” button

### 🔊 Read Aloud with Highlighting
- Text-to-speech with:
  - Play / Pause
  - Speed Control
  - Voice Selection
- Highlights each word in sync with audio using `SpeechSynthesisUtterance` + `range.getBoundingClientRect()`

### 📼 Transcript / Audio Extraction
- Use YouTube transcript API if available
- Fallback: Extract audio via `youtube-dl` backend method (server-side), transcribe via Whisper API (if needed)

---

## 🧩 User Stories

1. **As a user**, when I watch a YouTube video, I want a sidebar that gives me a quick summary so I can decide if it’s worth watching.
2. **As a user**, I want to hear the summary spoken aloud while following along with visual highlights so I can absorb the content more easily.
3. **As a user**, I want to control the speed and voice of the read-aloud feature to suit my preferences.

---

## 🔐 Permissions (in `manifest.json`)
```json
"permissions": [
  "activeTab",
  "scripting",
  "storage"
],
"host_permissions": [
  "https://www.youtube.com/*"
]
```

---

## 📁 Project Structure

```
project-root/
│
├── extension/
│   ├── content.js
│   ├── sidebar.html
│   ├── sidebar.css
│   ├── sidebar.js
│   ├── tts.js
│   ├── background.js
│   └── manifest.json
│
├── backend/
│   ├── index.js
│   ├── routes/
│   │   ├── summarize.js
│   │   └── transcript.js
│   ├── services/
│   │   └── gemini.js
│   └── utils/
│       └── youtube.js
```

---

## 📌 Milestones

| Task | Description | ETA |
|------|-------------|-----|
| UI Design | Build sidebar and read-aloud UI | Day 1 |
| Transcript Fetch | Parse transcript or audio from video | Day 2 |
| AI Summarization | Call Gemini backend API | Day 3 |
| Read Aloud Engine | TTS with word-by-word highlighting | Day 4 |
| Testing & Fixes | Cross-browser QA + UI polish | Day 5 |
| Release | Package and upload extension | Day 6 |

---

## 🔍 Other Enhancements

- Download summary as PDF or audio.
- Save summaries to cloud.
- Chat with video content via Q&A (Gemini).
