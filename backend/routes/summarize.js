/**
 * TubeSummarizer AI - Summarize Route
 *
 * Handles requests to summarize video content.
 */
const express = require("express");
const router = express.Router();

// Import services and utilities
const geminiService = require("../services/gemini");
const youtubeUtil = require("../utils/youtube");

/**
 * POST /summarize
 * Summarizes video content from transcript, videoId, or title
 *
 * Request body:
 * - transcript: Optional. The video transcript text
 * - videoId: Optional. YouTube video ID to fetch transcript
 * - title: Optional. The title of the video for better summarization
 * - language: Optional. Language for the summary (default: English)
 */
router.post("/", async (req, res) => {
    console.log("POST /summarize received");
    const { transcript, videoId, title, language } = req.body;

    if (!transcript && !videoId) {
        return res.status(400).json({
            error: "Missing required parameters",
            message: "Either transcript or videoId must be provided",
        });
    }

    try {
        let contentToSummarize = transcript;
        let videoTitle = title || "";
        let transcriptData = null;

        // If transcript not provided but videoId is, fetch the transcript
        if (!contentToSummarize && videoId) {
            console.log(
                `Summarize: Fetching transcript for videoId: ${videoId}`
            );
            try {
                transcriptData = await youtubeUtil.getTranscript(videoId);
                contentToSummarize = transcriptData.text;

                // If title not provided, try to get it from YouTube
                if (!videoTitle) {
                    const videoDetails = await youtubeUtil.getVideoDetails(
                        videoId
                    );
                    videoTitle = videoDetails.title || "";
                }
            } catch (transcriptError) {
                console.error("Error fetching transcript:", transcriptError);
                return res.status(404).json({
                    error: "Transcript not available",
                    message: transcriptError.message,
                });
            }
        }

        if (!contentToSummarize) {
            return res.status(400).json({
                error: "No content to summarize",
                message: "Could not retrieve or process content to summarize.",
            });
        }

        console.log(
            `Summarize: Content ready (${contentToSummarize.length} chars), calling AI service...`
        );

        // Call Gemini service to generate summary
        const options = { language: language || "English" };
        const summary = await geminiService.summarize(
            contentToSummarize,
            videoTitle,
            options
        );

        // Return the summary along with any video details we have
        res.json({
            summary,
            title: videoTitle || undefined,
            videoId: videoId || undefined,
        });
    } catch (error) {
        console.error("Error in /summarize route:", error);
        res.status(500).json({
            error: "Failed to generate summary",
            message: error.message,
        });
    }
});

module.exports = router;
