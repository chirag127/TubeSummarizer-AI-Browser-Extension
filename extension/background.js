/**
 * TubeSummarizer AI - Background Service Worker
 *
 * Handles browser events and coordinates actions.
 * Manages communication between content script, sidebar, and backend API.
 */

// Backend API URL (would be replaced with actual API in production)
const API_BASE_URL = "http://localhost:3000";

// Listen for installation or update
chrome.runtime.onInstalled.addListener((details) => {
    console.log("TubeSummarizer AI installed or updated:", details);
    // Perform any first-time setup here if needed
});

// Listen for messages from content script or sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received:", request, "from:", sender);

    // Handle request to get summary
    if (request.action === "getSummary") {
        console.log(
            "Received request to get summary for videoId:",
            request.videoId
        );
        fetchSummary(request.videoId)
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
 * Fetch summary for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Summary object with title and text
 */
async function fetchSummary(videoId) {
    // In a real implementation, this would call your backend API
    // For now, we'll simulate a response

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate API response
    return {
        title: "How to Build a Web App in 10 Minutes",
        text: "This tutorial demonstrates how to quickly build a web application using modern frameworks. The presenter starts by setting up a new project with React and Vite, then adds styling with Tailwind CSS. They show how to create components for the header, main content, and footer. The app includes features like user authentication and data fetching from an API. Finally, they deploy the finished app to Vercel. Key takeaways include using component libraries to speed up development, implementing responsive design from the start, and leveraging modern tools for deployment.",
    };

    // Real implementation would look something like this:
    /*
  try {
    // First get transcript
    const transcriptResponse = await fetch(`${API_BASE_URL}/transcript/${videoId}`);
    if (!transcriptResponse.ok) throw new Error("Failed to fetch transcript");
    const transcript = await transcriptResponse.json();

    // Then get summary
    const summaryResponse = await fetch(`${API_BASE_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcript.text })
    });

    if (!summaryResponse.ok) throw new Error("Failed to generate summary");
    return summaryResponse.json();
  } catch (error) {
    console.error("Error in fetchSummary:", error);
    throw error;
  }
  */
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
