/**
 * YouTube Video Summarizer + Read Aloud Sidebar Extension
 * Background Service Worker
 */

// Configuration
const BACKEND_URL = "http://localhost:3000";

// Store API key in local storage
chrome.storage.local.get("backendUrl", (result) => {
    if (!result.backendUrl) {
        chrome.storage.local.set({ backendUrl: BACKEND_URL });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SUMMARIZE_VIDEO") {
        summarizeVideo(message.data)
            .then((response) => {
                sendResponse(response);
            })
            .catch((error) => {
                console.error("Error in summarizeVideo:", error);
                sendResponse({
                    error: error.message || "Failed to summarize video",
                });
            });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }

    // Return false if we didn't handle the message
    return false;
});

/**
 * Make API request to backend to summarize video
 */
async function summarizeVideo(data) {
    try {
        // Get backend URL from storage, fallback to default
        const storage = await chrome.storage.local.get("backendUrl");
        const backendUrl = storage.backendUrl || BACKEND_URL;

        // Make API request
        const response = await fetch(`${backendUrl}/summarize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                videoId: data.videoId,
                title: data.title,
                transcript: data.transcript,
            }),
        });

        // Parse response
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to summarize video");
        }

        return result;
    } catch (error) {
        console.error("Error in summarizeVideo API call:", error);
        throw error;
    }
}
