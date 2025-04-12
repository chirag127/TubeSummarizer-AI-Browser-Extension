/**
 * TubeSummarizer AI - Background Service Worker
 *
 * Handles browser events and coordinates actions.
 * Manages communication between content script, sidebar, and backend API.
 */

// Backend API URL (update this for production)
const API_BASE_URL = "http://localhost:3000";

// Extension settings with defaults
const DEFAULT_SETTINGS = {
    language: "English",
    autoSummarize: false,
    ttsEnabled: true,
    ttsVoice: "",
    ttsSpeed: 1.0,
};

// Listen for installation or update
chrome.runtime.onInstalled.addListener((details) => {
    console.log("TubeSummarizer AI installed or updated:", details);

    // Initialize settings if needed
    chrome.storage.sync.get("settings", (data) => {
        if (!data.settings) {
            chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
            console.log("Initialized default settings");
        }
    });
});

// Listen for messages from content script or sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
        "Message received:",
        request.action,
        "from:",
        sender.tab?.url || "extension"
    );

    // Handle request to get summary
    if (request.action === "getSummary") {
        const { videoId, transcript, title } = request;
        console.log(
            `Fetching summary for video: ${videoId || "[No ID provided]"}`
        );

        fetchSummary(videoId, transcript, title)
            .then((summary) => {
                sendResponse({ success: true, summary });
            })
            .catch((error) => {
                console.error("Error fetching summary:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Indicates that the response is sent asynchronously
    }

    // Handle request to get current video ID
    else if (request.action === "getCurrentVideo") {
        getCurrentVideoId(sender.tab?.id)
            .then((videoId) => {
                sendResponse({ videoId });
            })
            .catch((error) => {
                console.error("Error getting current video ID:", error);
                sendResponse({ error: error.message });
            });
        return true; // Indicates that the response is sent asynchronously
    }

    // Handle request to get transcript
    else if (request.action === "getTranscript") {
        const { videoId } = request;
        fetchTranscript(videoId)
            .then((transcriptData) => {
                sendResponse({ success: true, transcriptData });
            })
            .catch((error) => {
                console.error("Error fetching transcript:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Indicates that the response is sent asynchronously
    }

    // Handle request to close sidebar
    else if (request.action === "closeSidebar" && sender.tab?.id) {
        chrome.tabs
            .sendMessage(sender.tab.id, { action: "toggleSidebar" })
            .then((response) => {
                sendResponse(response);
            })
            .catch((error) => {
                console.error("Error closing sidebar:", error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Indicates that the response is sent asynchronously
    }

    // Handle request to get settings
    else if (request.action === "getSettings") {
        chrome.storage.sync.get("settings", (data) => {
            sendResponse({ settings: data.settings || DEFAULT_SETTINGS });
        });
        return true; // Indicates that the response is sent asynchronously
    }

    // Handle request to save settings
    else if (request.action === "saveSettings") {
        const { settings } = request;
        chrome.storage.sync.set({ settings }, () => {
            sendResponse({ success: true });
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

// Listen for tab updates to detect YouTube video page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === "complete" &&
        tab.url &&
        tab.url.includes("youtube.com/watch")
    ) {
        console.log("YouTube video page loaded:", tab.url);
        // Extract video ID from URL
        const videoId = new URL(tab.url).searchParams.get("v");
        if (videoId) {
            // Notify content script about the video ID
            chrome.tabs
                .sendMessage(tabId, { action: "updateVideoId", videoId })
                .catch((error) =>
                    console.error(
                        "Error sending message to content script:",
                        error
                    )
                );
        }
    }
});

/**
 * Fetch transcript for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Transcript data
 */
async function fetchTranscript(videoId) {
    if (!videoId) {
        throw new Error("No video ID provided");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/transcript/${videoId}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to fetch transcript: ${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching transcript:", error);
        throw error;
    }
}

/**
 * Fetch summary for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @param {string} transcript - Optional transcript text (if already available)
 * @param {string} title - Optional video title
 * @returns {Promise<Object>} - Summary object with title and text
 */
async function fetchSummary(videoId, transcript, title) {
    try {
        // Get user's language preference
        const { settings } = await new Promise((resolve) => {
            chrome.storage.sync.get("settings", (data) => {
                resolve(data);
            });
        });

        const language = settings?.language || DEFAULT_SETTINGS.language;

        // Prepare request body
        const requestBody = {
            language,
        };

        // Add transcript if provided
        if (transcript) {
            requestBody.transcript = transcript;
        }
        // Otherwise add videoId
        else if (videoId) {
            requestBody.videoId = videoId;
        } else {
            throw new Error("Either transcript or videoId must be provided");
        }

        // Add title if provided
        if (title) {
            requestBody.title = title;
        }

        // Call the summarize API
        const response = await fetch(`${API_BASE_URL}/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                    `Failed to generate summary: ${response.status}`
            );
        }

        const data = await response.json();

        return {
            title: data.title || title || "Video Summary",
            text: data.summary,
        };
    } catch (error) {
        console.error("Error in fetchSummary:", error);
        throw error;
    }
}

/**
 * Get the current YouTube video ID from a tab
 * @param {number} tabId - Browser tab ID
 * @returns {Promise<string|null>} - Video ID or null if not found
 */
async function getCurrentVideoId(tabId) {
    if (!tabId) {
        return null;
    }

    try {
        // Get the tab URL
        const tab = await chrome.tabs.get(tabId);
        if (!tab.url || !tab.url.includes("youtube.com/watch")) {
            return null;
        }

        // Extract video ID from URL
        return new URL(tab.url).searchParams.get("v");
    } catch (error) {
        console.error("Error in getCurrentVideoId:", error);
        return null;
    }
}

console.log("TubeSummarizer AI background script loaded.");
