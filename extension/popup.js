/**
 * YouTube Video Summarizer + Read Aloud Sidebar Extension
 * Popup Script
 */

// DOM Elements
const backendUrlInput = document.getElementById("backend-url");
const saveSettingsButton = document.getElementById("save-settings");
const statusMessage = document.getElementById("status-message");

// Default backend URL
const DEFAULT_BACKEND_URL = "http://localhost:3000";

// Load settings when popup opens
document.addEventListener("DOMContentLoaded", () => {
    // Load backend URL from storage
    chrome.storage.local.get("backendUrl", (result) => {
        backendUrlInput.value = result.backendUrl || DEFAULT_BACKEND_URL;
    });

    // Check if we're on a YouTube video page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;

        if (currentUrl && currentUrl.includes("youtube.com/watch")) {
            statusMessage.textContent =
                "Summary sidebar is available for this video.";
            statusMessage.style.backgroundColor = "#e6f4ea";
        } else {
            statusMessage.textContent =
                "Visit a YouTube video page to use the summarizer.";
            statusMessage.style.backgroundColor = "#fef7e0";
        }
    });

    // Add event listener for save button
    saveSettingsButton.addEventListener("click", saveSettings);
});

/**
 * Save settings to storage
 */
function saveSettings() {
    const backendUrl = backendUrlInput.value.trim() || DEFAULT_BACKEND_URL;

    // Validate URL format
    if (!isValidUrl(backendUrl)) {
        showMessage("Please enter a valid URL", "error");
        return;
    }

    // Save to storage
    chrome.storage.local.set({ backendUrl }, () => {
        showMessage("Settings saved successfully!", "success");

        // Ping backend to check connection
        fetch(`${backendUrl}/health`)
            .then((response) => {
                if (response.ok) {
                    showMessage(
                        "Connected to backend successfully!",
                        "success"
                    );
                } else {
                    showMessage(
                        "Backend connection failed. Please check the URL.",
                        "error"
                    );
                }
            })
            .catch((error) => {
                showMessage(
                    "Could not connect to backend. Please check the URL and ensure the server is running.",
                    "error"
                );
            });
    });
}

/**
 * Show status message
 */
function showMessage(message, type = "info") {
    statusMessage.textContent = message;

    // Set background color based on message type
    if (type === "success") {
        statusMessage.style.backgroundColor = "#e6f4ea";
    } else if (type === "error") {
        statusMessage.style.backgroundColor = "#fce8e6";
    } else {
        statusMessage.style.backgroundColor = "#f5f5f5";
    }
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
