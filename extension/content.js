/**
 * TubeSummarizer AI - Content Script
 *
 * Injected into YouTube video pages.
 * Responsible for creating and managing the sidebar iframe.
 */

const SIDEBAR_ID = "tubesummarizer-ai-sidebar-iframe";
const SIDEBAR_CONTAINER_ID = "tubesummarizer-ai-sidebar-container";
const TOGGLE_BUTTON_ID = "tubesummarizer-toggle";

let sidebarIframe = null;
let sidebarContainer = null;
let toggleButton = null;
let currentVideoId = null;
let injectionInterval = null; // Interval timer for injection attempts
let sidebarVisible = false;

console.log("TubeSummarizer AI: Content script initializing...");

// Get YouTube video ID from URL
function getYouTubeVideoId() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("v");
    } catch (error) {
        console.error(
            "TubeSummarizer AI: Error parsing URL parameters:",
            error
        );
        return null;
    }
}

// Find a suitable element to inject the sidebar
function findInjectionTarget() {
    // Try common YouTube layout elements where the sidebar might fit well
    const selectors = [
        "#secondary.ytd-watch-flexy", // Standard layout secondary column
        "#related.ytd-watch-flexy", // Sometimes related videos container has this ID
        "#columns.ytd-watch-flexy", // The main columns container
        "ytd-watch-flexy[flexy]", // The main flexy container itself
        "#page-manager.ytd-app", // A higher-level container in the app
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log("TubeSummarizer AI: Found injection target:", selector);
            return element;
        }
    }
    console.warn(
        "TubeSummarizer AI: Could not find a preferred injection target. Falling back to body."
    );
    return document.body; // Fallback to body if no suitable target is found
}

// Inject the sidebar into the page
function injectSidebar() {
    const videoId = getYouTubeVideoId();
    if (!videoId) {
        console.log(
            "TubeSummarizer AI: Not a video page or video ID not found."
        );
        removeSidebar();
        if (injectionInterval) {
            clearInterval(injectionInterval); // Stop trying if not a video page
            injectionInterval = null;
        }
        return;
    }

    // If sidebar exists and video ID hasn't changed, do nothing
    if (document.getElementById(SIDEBAR_ID) && currentVideoId === videoId) {
        // console.log("TubeSummarizer AI: Sidebar already exists for this video.");
        if (injectionInterval) {
            clearInterval(injectionInterval); // Stop trying once successfully injected
            injectionInterval = null;
        }
        return;
    }

    // If sidebar exists but video ID changed, remove the old one first
    if (document.getElementById(SIDEBAR_ID) && currentVideoId !== videoId) {
        console.log("TubeSummarizer AI: Video changed, removing old sidebar.");
        removeSidebar();
    }

    // If still trying to inject from a previous attempt, clear it
    if (injectionInterval) {
        clearInterval(injectionInterval);
        injectionInterval = null;
    }

    currentVideoId = videoId;
    console.log(
        "TubeSummarizer AI: Attempting to inject sidebar for video:",
        currentVideoId
    );

    const targetElement = findInjectionTarget();
    if (!targetElement) {
        console.log(
            "TubeSummarizer AI: Injection target not found yet. Retrying..."
        );
        if (!injectionInterval) {
            // Start interval only if not already running
            injectionInterval = setInterval(injectSidebar, 1000); // Retry every second
        }
        return; // Wait for the target element to appear
    }

    // Stop retrying if we found the target
    if (injectionInterval) {
        clearInterval(injectionInterval);
        injectionInterval = null;
    }

    // --- Create Container ---
    sidebarContainer = document.createElement("div");
    sidebarContainer.id = SIDEBAR_CONTAINER_ID;
    // Apply basic container styles - more specific styles in sidebar.css
    sidebarContainer.style.position = "relative";
    sidebarContainer.style.zIndex = "9998";

    // --- Create Iframe ---
    sidebarIframe = document.createElement("iframe");
    sidebarIframe.id = SIDEBAR_ID;
    sidebarIframe.src = chrome.runtime.getURL("sidebar.html");
    // Apply basic iframe styles - more specific styles in sidebar.css
    sidebarIframe.style.border = "none";
    sidebarIframe.style.width = "360px";
    sidebarIframe.style.height = "calc(100vh - 70px)";
    sidebarIframe.style.position = "fixed";
    sidebarIframe.style.top = "60px";
    sidebarIframe.style.right = "10px";
    sidebarIframe.style.zIndex = "9999";
    sidebarIframe.style.backgroundColor = "var(--yt-spec-base-background)";
    sidebarIframe.style.boxShadow = "-2px 0 5px rgba(0,0,0,0.1)";
    sidebarIframe.style.borderRadius = "12px";
    sidebarIframe.style.transition = "transform 0.3s ease";

    // Initially hide the sidebar
    sidebarIframe.style.transform = "translateX(370px)";
    sidebarVisible = false;

    // Decide where to inject based on the target found
    if (
        targetElement === document.body ||
        targetElement.id === "page-manager"
    ) {
        // If fallback to body or page-manager, append directly (fixed position works well here)
        document.body.appendChild(sidebarIframe);
    } else if (
        targetElement.id === "secondary" ||
        targetElement.id === "related"
    ) {
        // If it's the secondary column, insert *before* it
        targetElement.parentNode.insertBefore(sidebarIframe, targetElement);
    } else {
        // Default: Append to the target element
        targetElement.appendChild(sidebarIframe);
    }

    // Create toggle button if it doesn't exist
    if (!document.getElementById(TOGGLE_BUTTON_ID)) {
        createToggleButton();
    }

    console.log("TubeSummarizer AI: Sidebar injected successfully.");

    // Optional: Adjust main page layout (can be complex and break easily)
    // adjustPageLayout(true);
}

// Create toggle button for the sidebar
function createToggleButton() {
    toggleButton = document.createElement("button");
    toggleButton.id = TOGGLE_BUTTON_ID;
    toggleButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
        </svg>
    `;
    toggleButton.title = "Toggle TubeSummarizer AI";

    // Add event listener to toggle sidebar visibility
    toggleButton.addEventListener("click", toggleSidebar);

    // Append to body (fixed position)
    document.body.appendChild(toggleButton);
    console.log("TubeSummarizer AI: Toggle button created.");
}

// Toggle sidebar visibility
function toggleSidebar() {
    if (!sidebarIframe) {
        return;
    }

    if (sidebarVisible) {
        // Hide sidebar
        sidebarIframe.style.transform = "translateX(370px)";
        sidebarVisible = false;
    } else {
        // Show sidebar
        sidebarIframe.style.transform = "translateX(0)";
        sidebarVisible = true;

        // Notify sidebar iframe that it's now visible
        sidebarIframe.contentWindow.postMessage(
            { action: "sidebarVisible", videoId: currentVideoId },
            "*"
        );
    }
}

// Remove sidebar and toggle button
function removeSidebar() {
    const existingIframe = document.getElementById(SIDEBAR_ID);
    if (existingIframe) {
        existingIframe.remove();
        sidebarIframe = null;
        console.log("TubeSummarizer AI: Sidebar iframe removed.");
    }

    const existingContainer = document.getElementById(SIDEBAR_CONTAINER_ID);
    if (existingContainer) {
        existingContainer.remove();
        sidebarContainer = null;
        console.log("TubeSummarizer AI: Sidebar container removed.");
    }

    const existingToggle = document.getElementById(TOGGLE_BUTTON_ID);
    if (existingToggle) {
        existingToggle.remove();
        toggleButton = null;
        console.log("TubeSummarizer AI: Toggle button removed.");
    }

    currentVideoId = null; // Reset video ID when removing
    sidebarVisible = false;
}

// Function to adjust main page layout (optional, can be complex & brittle)
// function adjustPageLayout(isSidebarVisible) {
//   const primaryContent = document.querySelector('#primary.ytd-watch-flexy');
//   if (primaryContent) {
//     if (isSidebarVisible) {
//       primaryContent.style.setProperty('margin-right', '370px', 'important'); // Example adjustment
//     } else {
//       primaryContent.style.removeProperty('margin-right'); // Reset
//     }
//   }
// }

// --- Initialization and Event Listeners ---

// Use a flag to prevent multiple initial injections racing
let initialCheckDone = false;

function initialInjectionCheck() {
    if (initialCheckDone) {
        return;
    }
    initialCheckDone = true;
    console.log("TubeSummarizer AI: Performing initial injection check.");
    injectSidebar(); // Attempt injection immediately
}

// Run initial check slightly delayed to allow YouTube page elements to render
if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    setTimeout(initialInjectionCheck, 500);
} else {
    document.addEventListener("DOMContentLoaded", () =>
        setTimeout(initialInjectionCheck, 500)
    );
}

// Listen for YouTube navigation events (SPA behavior)
document.addEventListener("yt-navigate-finish", () => {
    console.log(
        "TubeSummarizer AI: YouTube navigation finished. Re-evaluating sidebar injection."
    );
    // Use setTimeout to allow the DOM to potentially update fully after navigation
    setTimeout(injectSidebar, 500); // Delay might need adjustment
});

// Listen for messages from background or popup (if needed later)
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log(
        "TubeSummarizer AI (Content Script): Message received",
        request
    );
    if (request.action === "toggleSidebar") {
        if (sidebarIframe) {
            toggleSidebar();
            sendResponse({
                success: true,
                isVisible: sidebarVisible,
            });
        } else {
            sendResponse({ success: false, error: "Sidebar not found" });
        }
    } else if (request.action === "getCurrentVideo") {
        sendResponse({ videoId: currentVideoId });
    }
    // Add more message handlers if communication is needed
    return true; // Indicates async response
});

console.log("TubeSummarizer AI: Content script loaded and listeners attached.");
