/**
 * TubeSummarizer AI - Transcript Route
 *
 * Handles requests to fetch video transcripts.
 */
const express = require("express");
const router = express.Router();

// Import YouTube utilities
const youtubeUtil = require("../utils/youtube");

/**
 * GET /transcript/:videoId
 * Fetches the transcript for a YouTube video
 *
 * URL Parameters:
 * - videoId: The YouTube video ID
 *
 * Query Parameters:
 * - format: Optional. Format of the transcript ('text' or 'segments', default: 'segments')
 */
router.get("/:videoId", async (req, res) => {
    const videoId = req.params.videoId;
    const format = req.query.format || "segments";

    console.log(`GET /transcript/${videoId} received (format: ${format})`);

    if (!videoId) {
        return res.status(400).json({
            error: "Missing parameter",
            message: "videoId parameter is required",
        });
    }

    try {
        // Fetch transcript using YouTube utility
        const transcriptData = await youtubeUtil.getTranscript(videoId);

        if (!transcriptData) {
            return res.status(404).json({
                error: "Transcript not found",
                message: "No transcript available for this video",
            });
        }

        // Get video details for additional context
        let videoDetails = null;
        try {
            videoDetails = await youtubeUtil.getVideoDetails(videoId);
        } catch (detailsError) {
            console.warn(
                `Could not fetch video details for ${videoId}:`,
                detailsError.message
            );
            // Continue without video details
        }

        // Format response based on requested format
        if (format === "text") {
            res.json({
                transcript: transcriptData.text,
                videoId,
                title: videoDetails?.title,
                author: videoDetails?.author,
            });
        } else {
            // Default: return segments
            res.json({
                transcript: transcriptData.segments,
                text: transcriptData.text, // Include full text for convenience
                videoId,
                title: videoDetails?.title,
                author: videoDetails?.author,
            });
        }
    } catch (error) {
        console.error(`Error in /transcript/${videoId} route:`, error);
        res.status(500).json({
            error: "Failed to fetch transcript",
            message: error.message,
        });
    }
});

module.exports = router;
