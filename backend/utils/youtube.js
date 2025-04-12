/**
 * TubeSummarizer AI - YouTube Utility
 *
 * Handles YouTube transcript extraction and processing.
 */

const axios = require("axios");
const { YoutubeTranscript } = require("youtube-transcript-api");

/**
 * Get the transcript for a YouTube video
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<{text: string, segments: Array}>} The transcript text and segments
 */
async function getTranscript(videoId) {
    try {
        if (!videoId) {
            throw new Error("No video ID provided");
        }

        console.log(
            `YouTube Utility: Fetching transcript for video ID: ${videoId}`
        );

        // For test videos, return a simulated transcript
        if (videoId === "test" || videoId === "short") {
            console.warn(
                "YouTube Utility: Using simulated transcript for test video."
            );
            const segments = [
                { timestamp: 0, text: "Hello and welcome." },
                { timestamp: 5, text: "This is a test transcript." },
                { timestamp: 10, text: "End of simulation." },
            ];
            return {
                text: segments.map((item) => item.text).join(" "),
                segments: segments,
            };
        }

        // Fetch transcript using youtube-transcript-api
        const transcriptItems = await YoutubeTranscript.fetchTranscript(
            videoId
        );

        if (!transcriptItems || transcriptItems.length === 0) {
            throw new Error("No transcript available for this video");
        }

        // Process transcript items
        const fullText = transcriptItems.map((item) => item.text).join(" ");

        // Convert to our standard format
        const segments = transcriptItems.map((item) => ({
            timestamp: Math.floor(item.offset / 1000), // Convert ms to seconds
            text: item.text,
        }));

        return {
            text: fullText,
            segments: segments,
        };
    } catch (error) {
        console.error(
            `YouTube Utility: Error fetching transcript: ${error.message}`
        );

        // If the error is related to transcript not being available, try fallback methods
        if (
            error.message.includes("No transcript available") ||
            error.message.includes("Could not retrieve a transcript")
        ) {
            return await fallbackTranscriptMethod(videoId);
        }

        throw new Error(`Failed to get transcript: ${error.message}`);
    }
}

/**
 * Fallback method to get transcript when the primary method fails
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<{text: string, segments: Array}>} The transcript text and segments
 */
async function fallbackTranscriptMethod(videoId) {
    try {
        console.log(
            `YouTube Utility: Attempting fallback transcript method for ${videoId}`
        );

        // Attempt to get video details to extract title
        const videoDetails = await getVideoDetails(videoId);
        const title = videoDetails?.title || "Unknown Video";

        // For now, return an error message
        // In a production environment, you might implement additional fallback methods:
        // 1. Try different transcript APIs
        // 2. Use speech-to-text on the audio track
        // 3. Use OCR on captions if they're burned into the video

        throw new Error(
            "No transcript available and fallback methods not implemented"
        );
    } catch (error) {
        console.error(
            `YouTube Utility: Fallback transcript method failed: ${error.message}`
        );
        throw error;
    }
}

/**
 * Get video details from YouTube
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Object>} Video details including title
 */
async function getVideoDetails(videoId) {
    try {
        console.log(`YouTube Utility: Fetching video details for ${videoId}`);

        // Use YouTube's oEmbed API to get basic video information
        const response = await axios.get(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        if (response.status !== 200) {
            throw new Error(
                `Failed to fetch video details: HTTP ${response.status}`
            );
        }

        return {
            title: response.data.title,
            author: response.data.author_name,
            thumbnailUrl: response.data.thumbnail_url,
        };
    } catch (error) {
        console.error(
            `YouTube Utility: Error fetching video details: ${error.message}`
        );
        return { title: "Unknown Video" };
    }
}

module.exports = {
    getTranscript,
    getVideoDetails,
};
