// DOM elements
const voiceSelect = document.getElementById('voice-select');
const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');
const pitchRange = document.getElementById('pitch-range');
const pitchValue = document.getElementById('pitch-value');
const saveButton = document.getElementById('save-button');
const statusElement = document.getElementById('status');

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get('ttsSettings', (data) => {
    if (data.ttsSettings) {
      // Set voice selection
      if (data.ttsSettings.voice) {
        voiceSelect.value = data.ttsSettings.voice;
      }
      
      // Set speed
      if (data.ttsSettings.speed) {
        speedRange.value = data.ttsSettings.speed;
        speedValue.textContent = data.ttsSettings.speed;
      }
      
      // Set pitch
      if (data.ttsSettings.pitch) {
        pitchRange.value = data.ttsSettings.pitch;
        pitchValue.textContent = data.ttsSettings.pitch;
      }
    }
  });
}

// Populate voice options
function populateVoiceOptions() {
  // Get available voices
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  
  // Clear existing options (except default)
  while (voiceSelect.options.length > 1) {
    voiceSelect.options.remove(1);
  }
  
  // Add voice options
  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
  
  // Load saved settings after populating voices
  loadSettings();
}

// Initialize voice options
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = populateVoiceOptions;
} else {
  populateVoiceOptions();
}

// Update range value displays
speedRange.addEventListener('input', () => {
  speedValue.textContent = speedRange.value;
});

pitchRange.addEventListener('input', () => {
  pitchValue.textContent = pitchRange.value;
});

// Save settings
saveButton.addEventListener('click', () => {
  const settings = {
    voice: voiceSelect.value,
    speed: parseFloat(speedRange.value),
    pitch: parseFloat(pitchRange.value)
  };
  
  chrome.storage.sync.set({ ttsSettings: settings }, () => {
    // Show success message
    statusElement.textContent = 'Settings saved successfully!';
    statusElement.className = 'status success';
    statusElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  });
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
