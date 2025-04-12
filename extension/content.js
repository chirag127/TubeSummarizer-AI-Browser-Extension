// Global variables
let sidebar = null;
let videoId = null;
let videoTitle = null;
let transcript = null;
let summary = null;

// Initialize when the page loads
window.addEventListener('load', init);
// Re-initialize when navigating to a new video
window.addEventListener('yt-navigate-finish', init);

// Initialize the extension
function init() {
  // Check if we're on a YouTube video page
  if (!isVideoPage()) return;
  
  // Get video ID and title
  videoId = getVideoId();
  videoTitle = getVideoTitle();
  
  // Create sidebar if it doesn't exist
  if (!sidebar) {
    createSidebar();
  }
  
  // Get video transcript
  getTranscript()
    .then(result => {
      transcript = result;
      // Show loading state in sidebar
      updateSidebarContent('Loading summary...');
      
      // Send transcript to background script for summarization
      chrome.runtime.sendMessage({
        action: 'summarize',
        videoId: videoId,
        transcript: transcript,
        title: videoTitle
      }, response => {
        if (response && response.success) {
          summary = response.summary;
          // Update sidebar with summary
          updateSidebarContent(summary);
        } else {
          // Show error in sidebar
          updateSidebarContent('Error generating summary. Please try again.');
        }
      });
    })
    .catch(error => {
      console.error('Error getting transcript:', error);
      updateSidebarContent('Error getting transcript. Please try again.');
    });
}

// Check if we're on a YouTube video page
function isVideoPage() {
  return window.location.pathname === '/watch';
}

// Get video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Get video title
function getVideoTitle() {
  return document.querySelector('.title.style-scope.ytd-video-primary-info-renderer')?.textContent || '';
}

// Get video transcript
async function getTranscript() {
  try {
    // First, find the transcript URL
    const videoId = getVideoId();
    
    // Get the available caption tracks
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract the captionTracks from the response
    const captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionTracksMatch) {
      throw new Error('No caption tracks found');
    }
    
    const captionTracks = JSON.parse(captionTracksMatch[1].replace(/\\"/g, '"'));
    
    // Find the English caption track, or use the first one if English is not available
    const englishTrack = captionTracks.find(track => track.languageCode === 'en') || captionTracks[0];
    if (!englishTrack) {
      throw new Error('No caption track found');
    }
    
    // Get the transcript from the caption track URL
    const transcriptResponse = await fetch(englishTrack.baseUrl);
    const transcriptXml = await transcriptResponse.text();
    
    // Parse the XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(transcriptXml, 'text/xml');
    const textElements = xmlDoc.getElementsByTagName('text');
    
    // Extract the transcript text with timestamps
    let transcriptText = '';
    for (let i = 0; i < textElements.length; i++) {
      const text = textElements[i].textContent;
      transcriptText += text + ' ';
    }
    
    return transcriptText.trim();
  } catch (error) {
    console.error('Error getting transcript:', error);
    throw error;
  }
}

// Create sidebar
function createSidebar() {
  // Create sidebar element
  sidebar = document.createElement('div');
  sidebar.id = 'yt-summarizer-sidebar';
  sidebar.className = 'yt-summarizer-sidebar';
  
  // Create sidebar header
  const header = document.createElement('div');
  header.className = 'yt-summarizer-header';
  
  // Create logo
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('icons/logo.png');
  logo.alt = 'Logo';
  logo.className = 'yt-summarizer-logo';
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'Video Summary';
  title.className = 'yt-summarizer-title';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'yt-summarizer-close';
  closeButton.addEventListener('click', toggleSidebar);
  
  // Add elements to header
  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'yt-summarizer-content';
  content.textContent = 'Loading...';
  
  // Create TTS controls
  const ttsControls = document.createElement('div');
  ttsControls.className = 'yt-summarizer-tts-controls';
  
  // Create play button
  const playButton = document.createElement('button');
  playButton.textContent = '▶️ Read Aloud';
  playButton.className = 'yt-summarizer-play';
  playButton.addEventListener('click', () => {
    // Load TTS script if not already loaded
    if (!window.YTSummarizer) {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('tts.js');
      document.body.appendChild(script);
      script.onload = () => {
        window.YTSummarizer.startTTS(summary);
      };
    } else {
      window.YTSummarizer.startTTS(summary);
    }
  });
  
  // Create pause button
  const pauseButton = document.createElement('button');
  pauseButton.textContent = '⏸️ Pause';
  pauseButton.className = 'yt-summarizer-pause';
  pauseButton.addEventListener('click', () => {
    if (window.YTSummarizer) {
      window.YTSummarizer.pauseTTS();
    }
  });
  
  // Create stop button
  const stopButton = document.createElement('button');
  stopButton.textContent = '⏹️ Stop';
  stopButton.className = 'yt-summarizer-stop';
  stopButton.addEventListener('click', () => {
    if (window.YTSummarizer) {
      window.YTSummarizer.stopTTS();
    }
  });
  
  // Create settings button
  const settingsButton = document.createElement('button');
  settingsButton.textContent = '⚙️';
  settingsButton.className = 'yt-summarizer-settings';
  settingsButton.addEventListener('click', openSettings);
  
  // Add buttons to TTS controls
  ttsControls.appendChild(playButton);
  ttsControls.appendChild(pauseButton);
  ttsControls.appendChild(stopButton);
  ttsControls.appendChild(settingsButton);
  
  // Add elements to sidebar
  sidebar.appendChild(header);
  sidebar.appendChild(content);
  sidebar.appendChild(ttsControls);
  
  // Add sidebar to page
  document.body.appendChild(sidebar);
  
  // Make sidebar resizable and draggable
  makeResizable(sidebar);
  makeDraggable(sidebar, header);
}

// Update sidebar content
function updateSidebarContent(text) {
  const content = sidebar.querySelector('.yt-summarizer-content');
  content.textContent = text;
}

// Toggle sidebar visibility
function toggleSidebar() {
  if (sidebar) {
    sidebar.classList.toggle('yt-summarizer-sidebar-hidden');
  }
}

// Make an element resizable
function makeResizable(element) {
  const resizer = document.createElement('div');
  resizer.className = 'yt-summarizer-resizer';
  element.appendChild(resizer);
  
  resizer.addEventListener('mousedown', initResize);
  
  function initResize(e) {
    e.preventDefault();
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  }
  
  function resize(e) {
    element.style.width = (e.clientX - element.getBoundingClientRect().left) + 'px';
  }
  
  function stopResize() {
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
  }
}

// Make an element draggable by its handle
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.addEventListener('mousedown', dragMouseDown);
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.addEventListener('mouseup', closeDragElement);
    document.addEventListener('mousemove', elementDrag);
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.left = (element.offsetLeft - pos1) + 'px';
  }
  
  function closeDragElement() {
    document.removeEventListener('mouseup', closeDragElement);
    document.removeEventListener('mousemove', elementDrag);
  }
}

// Open settings page
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleSidebar') {
    toggleSidebar();
  }
});
