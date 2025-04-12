/**
 * TubeSummarizer AI - Sidebar Script
 *
 * Handles sidebar UI interactions and communication with the background script.
 */

// DOM Elements
let loadingIndicator;
let errorContainer;
let summaryDisplay;
let errorMessage;
let summaryText;
let videoTitle;
let ttsControls;
let retryButton;
let toggleCollapseButton;
let ttsPlayButton;
let ttsSpeedSelect;
let ttsVoiceSelect;

// TTS Instance
let ttsInstance = null;

// State
let currentVideoId = null;
let currentSummary = null;
let currentTranscript = null;
let isLoading = false;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    setupEventListeners();
    requestVideoData();
});

// Initialize DOM element references
function initializeElements() {
    loadingIndicator = document.getElementById("loading-indicator");
    errorContainer = document.getElementById("error-message");
    summaryDisplay = document.getElementById("summary-display");
    errorMessage = document.querySelector("#error-message p");
    summaryText = document.getElementById("summary-text");
    videoTitle = document.getElementById("video-title");
    ttsControls = document.getElementById("tts-controls");
    retryButton = document.getElementById("retry-button");
    toggleCollapseButton = document.getElementById("toggle-collapse");
    ttsPlayButton = document.getElementById("tts-play");
    ttsSpeedSelect = document.getElementById("tts-speed");
    ttsVoiceSelect = document.getElementById("tts-voice");
}

// Set up event listeners
function setupEventListeners() {
    // Toggle collapse button
    if (toggleCollapseButton) {
        toggleCollapseButton.addEventListener("click", () => {
            document
                .querySelector(".sidebar-container")
                .classList.toggle("collapsed");
        });
    }

    // Retry button
    if (retryButton) {
        retryButton.addEventListener("click", () => {
            showLoading();
            fetchSummary(currentVideoId, currentTranscript);
        });
    }

    // TTS controls
    if (ttsPlayButton && ttsSpeedSelect && ttsVoiceSelect) {
        // Initialize TTS instance
        ttsInstance = new TextToSpeech(
            summaryText,
            ttsPlayButton,
            ttsVoiceSelect,
            ttsSpeedSelect
        );

        // Play/pause button
        ttsPlayButton.addEventListener("click", () => {
            if (ttsInstance) {
                ttsInstance.togglePlayPause();
            }
        });

        // Speed selection
        ttsSpeedSelect.addEventListener("change", () => {
            if (ttsInstance) {
                ttsInstance.setRate(parseFloat(ttsSpeedSelect.value));
            }
        });

        // Voice selection
        ttsVoiceSelect.addEventListener("change", () => {
            if (ttsInstance) {
                ttsInstance.setVoice(ttsVoiceSelect.value);
            }
        });
    }
}

// Request video data from the background script
function requestVideoData() {
    // Get the current tab to get the video ID from the URL
    chrome.runtime.sendMessage({ action: "getCurrentVideo" }, (response) => {
        if (response && response.videoId) {
            currentVideoId = response.videoId;
            fetchTranscript(currentVideoId);
        } else {
            showError("Could not determine the current video.");
        }
    });
}

// Fetch transcript from the background script
function fetchTranscript(videoId) {
    if (!videoId) {
        showError("Invalid video ID");
        return;
    }

    console.log(
        `TubeSummarizer AI: Fetching transcript for video ID: ${videoId}`
    );
    showLoading();

    chrome.runtime.sendMessage(
        { action: "getTranscript", videoId: videoId },
        (response) => {
            if (response && response.success) {
                currentTranscript = response.transcriptData.text;
                const videoTitle = response.transcriptData.title;
                fetchSummary(videoId, currentTranscript, videoTitle);
            } else {
                // If transcript fetch fails, try direct summarization
                fetchSummary(videoId);
            }
        }
    );
}

// Fetch summary from the background script
function fetchSummary(videoId, transcript, title) {
    if (!videoId && !transcript) {
        showError("No content to summarize");
        return;
    }

    console.log(`TubeSummarizer AI: Fetching summary for video`);
    showLoading();

    chrome.runtime.sendMessage(
        {
            action: "getSummary",
            videoId: videoId,
            transcript: transcript,
            title: title,
        },
        (response) => {
            if (response && response.success) {
                displaySummary(response.summary);
            } else {
                showError(response.error || "Failed to generate summary.");
            }
        }
    );
}

// Display the summary in the sidebar
function displaySummary(summary) {
    currentSummary = summary;

    // Hide loading and error containers
    hideLoading();
    errorContainer.classList.add("hidden");

    // Show summary container
    summaryDisplay.classList.remove("hidden");

    // Set video title
    videoTitle.textContent = summary.title || "Video Summary";

    // Format summary text with spans around each word for highlighting
    const formattedText = summary.text
        .split(" ")
        .map((word) => `<span class="word">${word}</span>`)
        .join(" ");

    // Set summary text
    summaryText.innerHTML = formattedText;

    // Initialize TTS with the summary text
    if (ttsInstance) {
        ttsInstance.setText(summary.text);
    }
}

// Show loading state
function showLoading() {
    isLoading = true;
    loadingIndicator.classList.remove("hidden");
    summaryDisplay.classList.add("hidden");
    errorContainer.classList.add("hidden");
}

// Hide loading state
function hideLoading() {
    isLoading = false;
    loadingIndicator.classList.add("hidden");
}

// Show error state
function showError(message) {
    hideLoading();
    errorContainer.classList.remove("hidden");
    summaryDisplay.classList.add("hidden");

    errorMessage.textContent = message || "An error occurred";
}

// Listen for messages from content script or background script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (
        message.action === "updateVideoId" &&
        message.videoId &&
        message.videoId !== currentVideoId
    ) {
        currentVideoId = message.videoId;
        currentTranscript = null; // Reset transcript for new video
        fetchTranscript(currentVideoId);
    } else if (message.action === "sidebarVisible" && message.videoId) {
        if (message.videoId !== currentVideoId || isLoading) {
            currentVideoId = message.videoId;
            currentTranscript = null; // Reset transcript for new video
            fetchTranscript(currentVideoId);
        }
    }
});

// Listen for window messages (from content script)
window.addEventListener("message", (event) => {
    // Verify the sender is our content script
    if (
        event.data &&
        event.data.action === "sidebarVisible" &&
        event.data.videoId
    ) {
        if (event.data.videoId !== currentVideoId || isLoading) {
            currentVideoId = event.data.videoId;
            currentTranscript = null; // Reset transcript for new video
            fetchTranscript(currentVideoId);
        }
    }
});

console.log("TubeSummarizer AI: Sidebar script initialized");
