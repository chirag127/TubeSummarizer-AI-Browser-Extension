/**
 * TubeSummarizer AI - Transcript Route
 *
 * Handles requests to fetch video transcripts.
 */
const express = require('express');
const router = express.Router();

// Placeholder for YouTube utils
// const youtubeUtil = require('../utils/youtube');

router.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  console.log(`GET /transcript/${videoId} received`);

  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId parameter' });
  }

  try {
    // --- TODO: Implement transcript fetching logic (youtube.js) ---
    // 1. Check YouTube Transcript API
    // 2. Fallback to audio extraction/transcription if needed
    // const transcriptData = await youtubeUtil.getTranscript(videoId);
    // Placeholder:
    let transcriptData = null;
    if (videoId === 'test') {
        transcriptData = [
            { timestamp: 0, text: "Hello and welcome." },
            { timestamp: 5, text: "This is a test transcript." },
            { timestamp: 10, text: "End of simulation." }
        ];
    }
    // --- End TODO ---

    if (transcriptData) {
      res.json({ transcript: transcriptData });
    } else {
      res.status(404).json({ error: 'Transcript not found for this video.' });
    }

  } catch (error) {
    console.error(`Error in /transcript/${videoId} route:`, error);
    res.status(500).json({ error: 'Failed to fetch transcript.', details: error.message });
  }
});

module.exports = router;