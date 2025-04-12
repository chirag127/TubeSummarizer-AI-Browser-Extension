/**
 * YouTube Video Summarizer + Read Aloud Sidebar Extension
 * Content Script
 */

// Global variables
let currentVideoId = null;
let sidebarInjected = false;
let observingUrlChanges = false;
const BACKEND_URL = "http://localhost:3000";

/**
 * Initialize the extension on YouTube pages
 */
function init() {
    // Start observing URL changes
    if (!observingUrlChanges) {
        observeUrlChanges();
    }

    // Check if we're on a YouTube video page
    const videoId = getVideoIdFromUrl();
    if (videoId) {
        currentVideoId = videoId;
        injectSidebarIfNeeded();
        processSummarization(videoId);
    }
}

/**
 * Observe URL changes to detect navigation to different videos
 */
function observeUrlChanges() {
    let lastUrl = location.href;

    // Create a new observer
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            // URL changed, check if it's a video page
            const videoId = getVideoIdFromUrl();
            if (videoId && videoId !== currentVideoId) {
                currentVideoId = videoId;
                injectSidebarIfNeeded();
                processSummarization(videoId);
            }
        }
    });

    // Start observing
    observer.observe(document, { subtree: true, childList: true });
    observingUrlChanges = true;
}

/**
 * Extract video ID from URL
 */
function getVideoIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("v");
}

/**
 * Inject the sidebar if not already present
 */
function injectSidebarIfNeeded() {
    if (!sidebarInjected) {
        // Create iframe for sidebar
        const iframe = document.createElement("iframe");
        iframe.id = "youtube-summarizer-sidebar";
        iframe.src = chrome.runtime.getURL("sidebar.html");
        iframe.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100%;
      border: none;
      z-index: 9999;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      background-color: white;
    `;

        // Add it to the page
        document.body.appendChild(iframe);
        sidebarInjected = true;

        // Add resize handle
        addResizeHandle();

        // Setup communication with sidebar
        setupSidebarCommunication();
    }
}

/**
 * Add resize handle to adjust sidebar width
 */
function addResizeHandle() {
    const handle = document.createElement("div");
    handle.id = "youtube-summarizer-resize-handle";
    handle.style.cssText = `
    position: fixed;
    top: 0;
    right: 320px;
    width: 5px;
    height: 100%;
    cursor: ew-resize;
    z-index: 10000;
  `;

    document.body.appendChild(handle);

    // Add drag functionality
    let startX, startWidth;

    handle.addEventListener("mousedown", (e) => {
        startX = e.clientX;
        const sidebar = document.getElementById("youtube-summarizer-sidebar");
        startWidth = parseInt(sidebar.style.width, 10);

        document.addEventListener("mousemove", handleDrag);
        document.addEventListener("mouseup", stopDrag);
    });

    function handleDrag(e) {
        const sidebar = document.getElementById("youtube-summarizer-sidebar");
        const handle = document.getElementById(
            "youtube-summarizer-resize-handle"
        );
        const newWidth = startWidth - (e.clientX - startX);

        // Set min and max width
        const finalWidth = Math.max(250, Math.min(600, newWidth));
        sidebar.style.width = finalWidth + "px";
        handle.style.right = finalWidth + "px";
    }

    function stopDrag() {
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    }
}

/**
 * Set up communication with the sidebar iframe
 */
function setupSidebarCommunication() {
    window.addEventListener("message", (event) => {
        if (event.data.type === "SIDEBAR_READY") {
            // Send the current video ID to the sidebar
            const videoDetails = getVideoDetails();
            const iframe = document.getElementById(
                "youtube-summarizer-sidebar"
            );

            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    {
                        type: "VIDEO_DETAILS",
                        data: videoDetails,
                    },
                    "*"
                );
            }
        } else if (event.data.type === "CLOSE_SIDEBAR") {
            // Handle close button click
            const sidebar = document.getElementById(
                "youtube-summarizer-sidebar"
            );
            const handle = document.getElementById(
                "youtube-summarizer-resize-handle"
            );

            if (sidebar) {
                sidebar.remove();
                sidebarInjected = false;
            }

            if (handle) {
                handle.remove();
            }
        }
    });
}

/**
 * Get video details (title, author, videoId)
 */
function getVideoDetails() {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");

    // Get video title - try multiple selectors to handle YouTube's DOM structure
    let title = "Unknown Title";
    const titleSelectors = [
        "h1.title",
        "h1.ytd-watch-metadata",
        "#title h1",
        "#title",
        "ytd-watch-metadata h1",
        "h1.style-scope.ytd-watch-metadata",
    ];

    for (const selector of titleSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
            title = titleElement.textContent.trim();
            break;
        }
    }

    // Get video author
    let author = "Unknown Author";
    const authorSelectors = [
        "#owner-name a",
        "#channel-name",
        "#owner #channel-name",
        "ytd-channel-name",
        "ytd-video-owner-renderer #channel-name",
    ];

    for (const selector of authorSelectors) {
        const authorElement = document.querySelector(selector);
        if (authorElement && authorElement.textContent.trim()) {
            author = authorElement.textContent.trim();
            break;
        }
    }

    return {
        videoId,
        title,
        author,
    };
}

/**
 * Get transcript data from YouTube's ytInitialPlayerResponse
 */
async function getTranscriptData() {
    // Try to get the data from the window object
    if (
        window.ytInitialPlayerResponse &&
        window.ytInitialPlayerResponse.captions &&
        window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
    ) {
        return {
            captionTracks:
                window.ytInitialPlayerResponse.captions
                    .playerCaptionsTracklistRenderer.captionTracks,
        };
    }

    // If not found in window object, try to extract from script tags
    for (const script of document.querySelectorAll("script")) {
        const text = script.textContent;
        if (text && text.includes("ytInitialPlayerResponse")) {
            try {
                const jsonStr = text
                    .split("ytInitialPlayerResponse = ")[1]
                    .split(";var")[0];
                const data = JSON.parse(jsonStr);

                if (
                    data.captions &&
                    data.captions.playerCaptionsTracklistRenderer
                ) {
                    return {
                        captionTracks:
                            data.captions.playerCaptionsTracklistRenderer
                                .captionTracks,
                    };
                }
            } catch (error) {
                console.error("Error parsing script content:", error);
            }
        }
    }

    throw new Error("Could not find transcript data");
}

/**
 * Get available transcript languages for a YouTube video
 */
async function getTranscriptLanguages() {
    try {
        // Get the transcript data from YouTube's ytInitialPlayerResponse
        const transcriptData = await getTranscriptData();

        if (!transcriptData || !transcriptData.captionTracks) {
            throw new Error("No transcript data found");
        }

        // Extract language info
        return transcriptData.captionTracks.map((track) => ({
            code: track.languageCode,
            name: track.name.simpleText,
            url: track.baseUrl,
        }));
    } catch (error) {
        console.error("Error getting transcript languages:", error);
        throw error;
    }
}

/**
 * Get transcript for a specific language
 */
async function getTranscript(url) {
    try {
        const response = await fetch(url);

        if (response.status !== 200) {
            throw new Error(
                `Bad response fetching transcript: ${response.status}`
            );
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const textElements = xml.getElementsByTagName("text");

        if (textElements.length === 0) {
            return [];
        }

        const transcript = [
            {
                timestamp: parseInt(textElements[0].getAttribute("start")),
                text: "",
            },
        ];

        let sentenceCount = 0;

        for (const element of textElements) {
            const text = element.textContent.replace(/\r?\n|\r/g, " ").trim();
            const timestamp = parseInt(element.getAttribute("start"));
            const lastSegment = transcript[transcript.length - 1];
            const textLength = lastSegment.text.length;
            const wordCount = lastSegment.text.split(" ").length;

            if (textLength >= 500 || wordCount >= 100 || sentenceCount >= 3) {
                transcript.push({
                    timestamp,
                    text,
                });
                sentenceCount = 0;
                continue;
            }

            lastSegment.text += " " + text;

            if (text[text.length - 1] === ".") {
                sentenceCount++;
            }
        }

        // Clean up HTML entities
        for (const segment of transcript) {
            segment.text =
                new DOMParser().parseFromString(segment.text, "text/html")
                    .documentElement.textContent || "";
        }

        return transcript;
    } catch (error) {
        console.error("Error getting transcript:", error);
        throw error;
    }
}

/**
 * Process summarization for the current video
 */
async function processSummarization(videoId) {
    try {
        // Get video details
        const videoDetails = getVideoDetails();

        // Get transcript languages
        const languages = await getTranscriptLanguages();

        if (!languages || languages.length === 0) {
            sendSummaryToSidebar({
                error: "No transcript available for this video",
            });
            return;
        }

        // Use the first available language (usually English if available)
        const preferredLangCodes = ["en", "en-US", "en-GB"];
        let selectedLanguage = languages[0]; // Default to first language

        // Try to find a preferred language
        for (const code of preferredLangCodes) {
            const language = languages.find((lang) =>
                lang.code.startsWith(code)
            );
            if (language) {
                selectedLanguage = language;
                break;
            }
        }

        // Get the transcript
        const transcript = await getTranscript(selectedLanguage.url);

        if (!transcript || transcript.length === 0) {
            sendSummaryToSidebar({
                error: "Failed to extract transcript",
            });
            return;
        }

        // Combine transcript segments into a single text
        const transcriptText = transcript
            .map((segment) => segment.text)
            .join(" ");

        // Send to background script for API request
        chrome.runtime.sendMessage(
            {
                type: "SUMMARIZE_VIDEO",
                data: {
                    videoId: videoId,
                    title: videoDetails.title,
                    transcript: transcriptText,
                },
            },
            (response) => {
                if (response && response.summary) {
                    sendSummaryToSidebar({
                        summary: response.summary,
                        title: videoDetails.title,
                        author: videoDetails.author,
                    });
                } else if (response && response.error) {
                    sendSummaryToSidebar({
                        error: response.error,
                    });
                }
            }
        );
    } catch (error) {
        console.error("Error in processing summarization:", error);
        sendSummaryToSidebar({
            error: "Failed to generate summary: " + error.message,
        });
    }
}

/**
 * Send summary to sidebar iframe
 */
function sendSummaryToSidebar(data) {
    const iframe = document.getElementById("youtube-summarizer-sidebar");
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
            {
                type: "SUMMARY_RESULT",
                data: data,
            },
            "*"
        );
    }
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
