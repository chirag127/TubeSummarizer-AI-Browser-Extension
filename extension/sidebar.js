/**
 * YouTube Video Summarizer + Read Aloud Sidebar Extension
 * Sidebar Script
 */

// Global variables
let videoDetails = {};
let summaryText = "";
let speech = null;
let currentWord = 0;
let voices = [];
let wordElements = [];
let isSpeaking = false;
let isPaused = false;

// DOM Elements
const videoTitleElement = document.getElementById("video-title");
const videoAuthorElement = document.getElementById("video-author");
const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");
const errorTextElement = document.getElementById("error-text");
const summaryContainer = document.getElementById("summary-container");
const summaryTextElement = document.getElementById("summary-text");
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const stopButton = document.getElementById("stop-button");
const settingsButton = document.getElementById("settings-button");
const settingsPanel = document.getElementById("settings-panel");
const settingsCloseButton = document.getElementById("settings-close");
const voiceSelect = document.getElementById("voice-select");
const rateSlider = document.getElementById("rate-slider");
const rateValue = document.getElementById("rate-value");
const pitchSlider = document.getElementById("pitch-slider");
const pitchValue = document.getElementById("pitch-value");
const closeButton = document.getElementById("close-sidebar");

// Initialize sidebar
document.addEventListener("DOMContentLoaded", () => {
    // Setup event listeners
    setupEventListeners();

    // Notify content script that sidebar is ready
    window.parent.postMessage({ type: "SIDEBAR_READY" }, "*");

    // Initialize TTS
    initializeTTS();
});

/**
 * Set up event listeners for buttons and controls
 */
function setupEventListeners() {
    // Play button
    playButton.addEventListener("click", startSpeaking);

    // Pause button
    pauseButton.addEventListener("click", pauseSpeaking);

    // Stop button
    stopButton.addEventListener("click", stopSpeaking);

    // Settings button
    settingsButton.addEventListener("click", () => {
        settingsPanel.classList.toggle("hidden");
    });

    // Settings close button
    settingsCloseButton.addEventListener("click", () => {
        settingsPanel.classList.add("hidden");
    });

    // Rate slider
    rateSlider.addEventListener("input", () => {
        const value = parseFloat(rateSlider.value).toFixed(1);
        rateValue.textContent = `${value}x`;

        if (speech) {
            speech.rate = parseFloat(value);
        }

        // Save to storage
        chrome.storage.sync.set({ ttsRate: parseFloat(value) });
    });

    // Pitch slider
    pitchSlider.addEventListener("input", () => {
        const value = parseFloat(pitchSlider.value).toFixed(1);
        pitchValue.textContent = value;

        if (speech) {
            speech.pitch = parseFloat(value);
        }

        // Save to storage
        chrome.storage.sync.set({ ttsPitch: parseFloat(value) });
    });

    // Voice select
    voiceSelect.addEventListener("change", () => {
        // Save to storage
        chrome.storage.sync.set({ ttsVoice: voiceSelect.value });
    });

    // Close button
    closeButton.addEventListener("click", () => {
        window.parent.postMessage({ type: "CLOSE_SIDEBAR" }, "*");
    });

    // Listen for messages from content script
    window.addEventListener("message", (event) => {
        if (event.data.type === "VIDEO_DETAILS") {
            videoDetails = event.data.data;
            updateVideoDetails();
        } else if (event.data.type === "SUMMARY_RESULT") {
            handleSummaryResult(event.data.data);
        }
    });
}

/**
 * Initialize Text-to-Speech functionality
 */
function initializeTTS() {
    if ("speechSynthesis" in window) {
        // Load available voices
        speech = new SpeechSynthesisUtterance();

        // Chrome loads voices asynchronously
        speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();

        // Load stored TTS settings
        loadTTSSettings();
    } else {
        console.error("Speech synthesis not supported");
        // Fallback: Could show an error or use backend TTS
    }
}

/**
 * Load available TTS voices
 */
function loadVoices() {
    voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
        // Clear dropdown
        voiceSelect.innerHTML = "";

        // Add voices to dropdown
        voices.forEach((voice, index) => {
            const option = document.createElement("option");
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });

        // Try to set default voice (prefer English)
        loadTTSSettings();
    }
}

/**
 * Load TTS settings from storage
 */
function loadTTSSettings() {
    chrome.storage.sync.get(["ttsRate", "ttsPitch", "ttsVoice"], (result) => {
        // Set rate
        const rate = result.ttsRate || 1.0;
        rateSlider.value = rate;
        rateValue.textContent = `${rate.toFixed(1)}x`;

        // Set pitch
        const pitch = result.ttsPitch || 1.0;
        pitchSlider.value = pitch;
        pitchValue.textContent = pitch.toFixed(1);

        // Set voice
        if (result.ttsVoice && voices.length > 0) {
            const voiceIndex = voices.findIndex(
                (voice) => voice.name === result.ttsVoice
            );
            if (voiceIndex >= 0) {
                voiceSelect.value = result.ttsVoice;
            } else {
                // Find an English voice
                const englishVoice = voices.find((voice) =>
                    /en(-|_)US/i.test(voice.lang)
                );
                if (englishVoice) {
                    voiceSelect.value = englishVoice.name;
                }
            }
        } else if (voices.length > 0) {
            // Default to an English voice
            const englishVoice = voices.find((voice) =>
                /en(-|_)US/i.test(voice.lang)
            );
            if (englishVoice) {
                voiceSelect.value = englishVoice.name;
            }
        }
    });
}

/**
 * Update video details in the UI
 */
function updateVideoDetails() {
    videoTitleElement.textContent = videoDetails.title || "Unknown Title";
    videoAuthorElement.textContent = videoDetails.author || "";
}

/**
 * Handle summary result from the API
 */
function handleSummaryResult(data) {
    // Hide loading indicator
    loadingIndicator.classList.add("hidden");

    if (data.error) {
        // Show error message
        errorTextElement.textContent = data.error;
        errorMessage.classList.remove("hidden");
        summaryContainer.classList.add("hidden");

        // Disable play button
        playButton.disabled = true;
    } else if (data.summary) {
        // Show summary
        summaryText = data.summary;
        displaySummary(summaryText);

        // Show summary container, hide error
        summaryContainer.classList.remove("hidden");
        errorMessage.classList.add("hidden");

        // Enable play button
        playButton.disabled = false;
    }
}

/**
 * Display the summary in the UI
 */
function displaySummary(text) {
    // Split text into words
    const words = text.split(/\s+/);

    // Create a span for each word
    summaryTextElement.innerHTML = words
        .map(
            (word, index) =>
                `<span class="word" data-index="${index}">${word}</span>`
        )
        .join(" ");

    // Store references to all word elements
    wordElements = Array.from(summaryTextElement.querySelectorAll(".word"));
}

/**
 * Start TTS reading
 */
function startSpeaking() {
    // If paused, resume
    if (isPaused && speech) {
        speechSynthesis.resume();
        isPaused = false;
        isSpeaking = true;
        updatePlaybackButtons();
        return;
    }

    // Reset any existing speech
    if (speech) {
        stopSpeaking();
    }

    // Create new speech utterance
    speech = new SpeechSynthesisUtterance(summaryText);

    // Set voice
    const selectedVoice = voices.find(
        (voice) => voice.name === voiceSelect.value
    );
    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    // Set rate and pitch
    speech.rate = parseFloat(rateSlider.value);
    speech.pitch = parseFloat(pitchSlider.value);

    // Set up word boundary event
    speech.onboundary = handleWordBoundary;

    // Set up end event
    speech.onend = () => {
        isSpeaking = false;
        isPaused = false;
        currentWord = 0;
        clearHighlights();
        updatePlaybackButtons();
    };

    // Set up error event
    speech.onerror = (e) => {
        console.error("Speech error:", e);
        isSpeaking = false;
        isPaused = false;
        updatePlaybackButtons();
    };

    // Start speaking
    speechSynthesis.speak(speech);
    isSpeaking = true;

    // Update UI
    updatePlaybackButtons();
}

/**
 * Handle word boundary event for highlighting
 */
function handleWordBoundary(event) {
    // Use character index to find current word
    const charIndex = event.charIndex;

    // Find which word this character is in
    let wordIndex = 0;
    let charCount = 0;

    const words = summaryText.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
        charCount += words[i].length + 1; // +1 for the space

        if (charCount > charIndex) {
            wordIndex = i;
            break;
        }
    }

    // Update current word
    currentWord = wordIndex;

    // Highlight current word
    highlightCurrentWord();
}

/**
 * Highlight the current word
 */
function highlightCurrentWord() {
    // Remove existing highlights
    clearHighlights();

    // Apply highlight to current word
    if (wordElements[currentWord]) {
        wordElements[currentWord].classList.add("highlight");

        // Scroll to highlighted word if needed
        wordElements[currentWord].scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }
}

/**
 * Clear all word highlights
 */
function clearHighlights() {
    wordElements.forEach((element) => {
        element.classList.remove("highlight");
    });
}

/**
 * Pause TTS reading
 */
function pauseSpeaking() {
    if (isSpeaking && !isPaused) {
        speechSynthesis.pause();
        isPaused = true;
        updatePlaybackButtons();
    }
}

/**
 * Stop TTS reading
 */
function stopSpeaking() {
    speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    currentWord = 0;
    clearHighlights();
    updatePlaybackButtons();
}

/**
 * Update playback button visibility based on current state
 */
function updatePlaybackButtons() {
    if (isSpeaking && !isPaused) {
        playButton.classList.add("hidden");
        pauseButton.classList.remove("hidden");
        stopButton.classList.remove("hidden");

        pauseButton.disabled = false;
        stopButton.disabled = false;
    } else if (isPaused) {
        playButton.classList.remove("hidden");
        pauseButton.classList.add("hidden");
        stopButton.classList.remove("hidden");

        playButton.disabled = false;
        stopButton.disabled = false;
    } else {
        playButton.classList.remove("hidden");
        pauseButton.classList.add("hidden");
        stopButton.classList.add("hidden");

        playButton.disabled = !summaryText;
    }
}
