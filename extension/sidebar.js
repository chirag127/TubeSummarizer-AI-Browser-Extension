/**
 * TubeSummarizer AI - Sidebar Script
 * 
 * Handles sidebar UI interactions and communication with the background script.
 */

// DOM Elements
let loadingContainer;
let errorContainer;
let summaryContainer;
let errorMessage;
let summaryText;
let videoTitle;
let ttsControls;
let retryButton;
let closeButton;

// State
let currentVideoId = null;
let currentSummary = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  setupEventListeners();
  requestVideoData();
});

// Initialize DOM element references
function initializeElements() {
  loadingContainer = document.getElementById('loading-container');
  errorContainer = document.getElementById('error-container');
  summaryContainer = document.getElementById('summary-container');
  errorMessage = document.getElementById('error-message');
  summaryText = document.getElementById('summary-text');
  videoTitle = document.getElementById('video-title');
  ttsControls = document.querySelector('.tts-controls');
  retryButton = document.getElementById('retry-button');
  closeButton = document.getElementById('close-sidebar');
}

// Set up event listeners
function setupEventListeners() {
  // Close button
  closeButton.addEventListener('click', () => {
    // Send message to content script to hide sidebar
    chrome.runtime.sendMessage({ action: 'closeSidebar' });
  });
  
  // Retry button
  retryButton.addEventListener('click', () => {
    showLoading();
    requestVideoData();
  });
}

// Request video data from the background script
function requestVideoData() {
  // Get the current tab to get the video ID from the URL
  chrome.runtime.sendMessage({ action: 'getCurrentVideo' }, (response) => {
    if (response && response.videoId) {
      currentVideoId = response.videoId;
      fetchSummary(currentVideoId);
    } else {
      showError('Could not determine the current video.');
    }
  });
}

// Fetch summary from the background script
function fetchSummary(videoId) {
  if (!videoId) {
    showError('Invalid video ID');
    return;
  }
  
  console.log(`TubeSummarizer AI: Fetching summary for video ID: ${videoId}`);
  showLoading();
  
  chrome.runtime.sendMessage(
    { action: 'getSummary', videoId: videoId },
    (response) => {
      if (response && response.success) {
        displaySummary(response.summary);
      } else {
        showError(response.error || 'Failed to generate summary.');
      }
    }
  );
  
  // For development/testing - simulate a response after 2 seconds
  setTimeout(() => {
    const mockSummary = {
      title: "How to Build a Web App in 10 Minutes",
      text: "This tutorial demonstrates how to quickly build a web application using modern frameworks. The presenter starts by setting up a new project with React and Vite, then adds styling with Tailwind CSS. They show how to create components for the header, main content, and footer. The app includes features like user authentication and data fetching from an API. Finally, they deploy the finished app to Vercel. Key takeaways include using component libraries to speed up development, implementing responsive design from the start, and leveraging modern tools for deployment."
    };
    displaySummary(mockSummary);
  }, 2000);
}

// Display the summary in the sidebar
function displaySummary(summary) {
  currentSummary = summary;
  
  // Hide loading and error containers
  loadingContainer.style.display = 'none';
  errorContainer.style.display = 'none';
  
  // Show summary container and TTS controls
  summaryContainer.style.display = 'block';
  ttsControls.style.display = 'block';
  
  // Set video title
  videoTitle.textContent = summary.title || 'Video Summary';
  
  // Format summary text with spans around each word for highlighting
  const formattedText = summary.text.split(' ').map(word => 
    `<span class="word">${word}</span>`
  ).join(' ');
  
  // Set summary text
  summaryText.innerHTML = formattedText;
  
  // Initialize TTS with the summary text
  if (typeof initTTS === 'function') {
    initTTS(summary.text);
  }
}

// Show loading state
function showLoading() {
  loadingContainer.style.display = 'flex';
  errorContainer.style.display = 'none';
  summaryContainer.style.display = 'none';
  ttsControls.style.display = 'none';
}

// Show error state
function showError(message) {
  loadingContainer.style.display = 'none';
  errorContainer.style.display = 'flex';
  summaryContainer.style.display = 'none';
  ttsControls.style.display = 'none';
  
  errorMessage.textContent = message;
}

// Listen for messages from content script or background script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === 'updateVideoId' && message.videoId && message.videoId !== currentVideoId) {
    currentVideoId = message.videoId;
    showLoading();
    fetchSummary(currentVideoId);
  } else if (message.action === 'sidebarVisible' && message.videoId && message.videoId !== currentVideoId) {
    currentVideoId = message.videoId;
    fetchSummary(currentVideoId);
  }
});

// Listen for window messages (from content script)
window.addEventListener('message', (event) => {
  // Verify the sender is our content script
  if (event.data && event.data.action === 'sidebarVisible' && 
      event.data.videoId && event.data.videoId !== currentVideoId) {
    currentVideoId = event.data.videoId;
    fetchSummary(currentVideoId);
  }
});

console.log('TubeSummarizer AI: Sidebar script initialized');
