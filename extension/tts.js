// Create a namespace for our TTS functionality
window.YTSummarizer = (function() {
  // Private variables
  let synth = window.speechSynthesis;
  let utterance = null;
  let currentWord = 0;
  let words = [];
  let highlightedElements = [];
  let isPlaying = false;
  
  // Get TTS settings from storage
  let ttsSettings = {
    voice: 'default',
    speed: 1.0,
    pitch: 1.0
  };
  
  chrome.storage.sync.get('ttsSettings', (data) => {
    if (data.ttsSettings) {
      ttsSettings = data.ttsSettings;
    }
  });
  
  // Start TTS
  function startTTS(text) {
    // Stop any existing TTS
    stopTTS();
    
    // Split text into words
    words = text.split(/\s+/);
    
    // Create word elements for highlighting
    createWordElements();
    
    // Create utterance
    utterance = new SpeechSynthesisUtterance(text);
    
    // Set utterance properties
    utterance.rate = ttsSettings.speed;
    utterance.pitch = ttsSettings.pitch;
    
    // Set voice if specified
    if (ttsSettings.voice !== 'default') {
      const voices = synth.getVoices();
      const selectedVoice = voices.find(voice => voice.name === ttsSettings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Add event listeners
    utterance.onboundary = handleBoundary;
    utterance.onend = handleEnd;
    
    // Start speaking
    synth.speak(utterance);
    isPlaying = true;
  }
  
  // Pause TTS
  function pauseTTS() {
    if (isPlaying) {
      synth.pause();
      isPlaying = false;
    } else {
      synth.resume();
      isPlaying = true;
    }
  }
  
  // Stop TTS
  function stopTTS() {
    synth.cancel();
    isPlaying = false;
    currentWord = 0;
    
    // Remove highlighting
    removeHighlighting();
    
    // Remove word elements
    removeWordElements();
  }
  
  // Handle boundary event (word change)
  function handleBoundary(event) {
    if (event.name === 'word') {
      // Remove previous highlighting
      removeHighlighting();
      
      // Highlight current word
      highlightWord(currentWord);
      
      // Increment word index
      currentWord++;
    }
  }
  
  // Handle end event
  function handleEnd() {
    isPlaying = false;
    currentWord = 0;
    
    // Remove highlighting
    removeHighlighting();
    
    // Remove word elements
    removeWordElements();
  }
  
  // Create word elements for highlighting
  function createWordElements() {
    // Get content element
    const content = document.querySelector('.yt-summarizer-content');
    
    // Clear content
    content.innerHTML = '';
    
    // Create word elements
    words.forEach((word, index) => {
      const wordElement = document.createElement('span');
      wordElement.className = 'yt-summarizer-word';
      wordElement.textContent = word + ' ';
      wordElement.dataset.index = index;
      content.appendChild(wordElement);
    });
  }
  
  // Remove word elements
  function removeWordElements() {
    // Get content element
    const content = document.querySelector('.yt-summarizer-content');
    
    // Restore original text
    content.textContent = words.join(' ');
  }
  
  // Highlight a word
  function highlightWord(index) {
    if (index >= 0 && index < words.length) {
      const wordElement = document.querySelector(`.yt-summarizer-word[data-index="${index}"]`);
      if (wordElement) {
        wordElement.classList.add('yt-summarizer-word-highlight');
        highlightedElements.push(wordElement);
        
        // Scroll to word if needed
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  // Remove highlighting
  function removeHighlighting() {
    highlightedElements.forEach(element => {
      element.classList.remove('yt-summarizer-word-highlight');
    });
    highlightedElements = [];
  }
  
  // Get available voices
  function getVoices() {
    return synth.getVoices();
  }
  
  // Public API
  return {
    startTTS,
    pauseTTS,
    stopTTS,
    getVoices
  };
})();
