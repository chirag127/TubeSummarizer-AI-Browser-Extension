// Handle extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      ttsSettings: {
        voice: 'default',
        speed: 1.0,
        pitch: 1.0
      }
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'summarize') {
    // Send transcript to backend for summarization
    fetch('http://localhost:3000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoId: message.videoId,
        transcript: message.transcript,
        title: message.title
      })
    })
    .then(response => response.json())
    .then(data => {
      // Send summary back to content script
      sendResponse({ success: true, summary: data.summary });
    })
    .catch(error => {
      console.error('Error summarizing video:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
});
