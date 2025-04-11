/**
 * TubeSummarizer AI - TextToSpeech Class
 *
 * Handles text-to-speech synthesis, playback controls,
 * and word-by-word highlighting.
 */

class TextToSpeech {
    constructor(textElement, playButton, voiceSelect, speedSelect) {
        this.textElement = textElement;
        this.playButton = playButton;
        this.voiceSelect = voiceSelect;
        this.speedSelect = speedSelect;

        this.utterance = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.currentText = "";
        this.words = [];
        this.wordSpans = []; // Store references to the created word spans
        this.currentWordIndex = 0;
        this.isPlaying = false;
        this.isPaused = false; // Track pause state specifically

        this._boundOnBoundary = this._onBoundary.bind(this);
        this._boundOnEnd = this._onEnd.bind(this);

        this._loadVoices();
        // Ensure voices are loaded before populating the dropdown
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = this._loadVoices.bind(this);
        }
    }

    _loadVoices() {
        this.voices = this.speechSynthesis.getVoices();
        console.log("TubeSummarizer AI: Voices loaded:", this.voices);
        this.voiceSelect.innerHTML = '<option value="">Default Voice</option>'; // Clear existing options

        // Filter voices slightly (optional, e.g., by language)
        const preferredLang = navigator.language || 'en-US';
        this.voices
            // .filter(voice => voice.lang.startsWith(preferredLang.split('-')[0])) // Optional: Filter by current language
            .forEach((voice, index) => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = index; // Use index or voice.name as value
                this.voiceSelect.appendChild(option);
            });
    }

    setText(text) {
        this.stop(); // Stop any current playback
        this.currentText = text || "";
        this.words = this.currentText.match(/\S+/g) || []; // Split into words
        this._createWordSpans(); // Prepare spans for highlighting
        this.currentWordIndex = 0;
    }

    _createWordSpans() {
        this.textElement.innerHTML = ''; // Clear previous content
        this.wordSpans = []; // Reset spans array
        let currentPos = 0;
        const text = this.currentText;

        // Iterate through words and the spaces between them
        text.split(/(\s+)/).forEach(part => {
            if (part.match(/\S+/)) { // It's a word
                const span = document.createElement('span');
                span.textContent = part;
                span.dataset.wordIndex = this.wordSpans.length; // Store index for boundary event
                span.dataset.charStart = currentPos;
                span.dataset.charEnd = currentPos + part.length;
                this.textElement.appendChild(span);
                this.wordSpans.push(span);
                currentPos += part.length;
            } else { // It's whitespace
                this.textElement.appendChild(document.createTextNode(part));
                currentPos += part.length;
            }
        });
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (!this.currentText || this.words.length === 0) {
            console.log("TubeSummarizer AI: No text to play.");
            return;
        }

        if (this.speechSynthesis.speaking && this.isPaused) {
            console.log("TubeSummarizer AI: Resuming TTS.");
            this.speechSynthesis.resume();
            this.isPlaying = true;
            this.isPaused = false;
            this._updatePlayButton(true);
        } else if (!this.speechSynthesis.speaking) {
            console.log("TubeSummarizer AI: Starting TTS.");
            this.utterance = new SpeechSynthesisUtterance(this.currentText);

            // Configure utterance
            this.utterance.rate = parseFloat(this.speedSelect.value) || 1;
            const selectedVoiceIndex = parseInt(this.voiceSelect.value, 10);
            if (!isNaN(selectedVoiceIndex) && this.voices[selectedVoiceIndex]) {
                this.utterance.voice = this.voices[selectedVoiceIndex];
            }
            // else: use default voice

            // Attach event listeners
            this.utterance.onboundary = this._boundOnBoundary;
            this.utterance.onend = this._boundOnEnd;
            this.utterance.onerror = (event) => {
                console.error("TubeSummarizer AI: SpeechSynthesis Error", event);
                this._onEnd(); // Treat errors like the end of speech
            };

            // Start speaking
            this.speechSynthesis.speak(this.utterance);
            this.isPlaying = true;
            this.isPaused = false;
            this.currentWordIndex = 0; // Reset index on new play
            this._updatePlayButton(true);
        }
    }

    pause() {
        if (this.speechSynthesis.speaking && !this.isPaused) {
            console.log("TubeSummarizer AI: Pausing TTS.");
            this.speechSynthesis.pause();
            this.isPlaying = false;
            this.isPaused = true;
            this._updatePlayButton(false);
        }
    }

    stop() {
        if (this.speechSynthesis.speaking || this.isPaused) {
            console.log("TubeSummarizer AI: Stopping TTS.");
            this.speechSynthesis.cancel(); // Clears the queue and stops speaking
        }
        // Reset state regardless of whether it was speaking
        this.isPlaying = false;
        this.isPaused = false;
        this.currentWordIndex = 0;
        this._clearHighlight();
        this._updatePlayButton(false);
        if (this.utterance) {
            this.utterance.onboundary = null;
            this.utterance.onend = null;
            this.utterance.onerror = null;
            this.utterance = null;
        }
    }

    setRate(rate) {
        if (this.utterance) {
            this.utterance.rate = rate;
            // If playing, might need to stop and restart to apply rate change immediately
            if (this.isPlaying) {
                const wasPlaying = this.isPlaying;
                const currentTime = this.utterance.elapsedTime; // Approximation
                this.stop();
                // Restart (logic might need refinement to resume from exact spot)
                // For simplicity, we restart from the beginning or last known word
                this.play();
            }
        }
         console.log("TubeSummarizer AI: Set TTS rate to", rate);
    }

    setVoice(voiceIndex) {
         const index = parseInt(voiceIndex, 10);
         if (this.utterance && !isNaN(index) && this.voices[index]) {
             this.utterance.voice = this.voices[index];
             // Similar to rate, might need stop/start to apply immediately
             if (this.isPlaying || this.isPaused) {
                 const wasPlaying = this.isPlaying;
                 const wasPaused = this.isPaused;
                 this.stop();
                 // Restart playback
                 if (wasPlaying || wasPaused) {
                     this.play();
                     if (wasPaused) { // If it was paused before, pause it again immediately
                         setTimeout(() => this.pause(), 50); // Small delay might be needed
                     }
                 }
             }
         }
         console.log("TubeSummarizer AI: Set TTS voice to", this.voices[index]?.name);
    }

    _onBoundary(event) {
        if (event.name !== 'word' || !this.isPlaying) {
            return;
        }

        // Find the word span corresponding to the character index
        const charIndex = event.charIndex;
        let wordIndexToHighlight = -1;

        for (let i = 0; i < this.wordSpans.length; i++) {
            const span = this.wordSpans[i];
            const start = parseInt(span.dataset.charStart, 10);
            const end = parseInt(span.dataset.charEnd, 10);

            // Find the span that *contains* the current character index
            if (charIndex >= start && charIndex < end) {
                 wordIndexToHighlight = i;
                 break;
            }
            // If charIndex is exactly at the start of the next word (due to whitespace)
            if (i + 1 < this.wordSpans.length) {
                const nextSpan = this.wordSpans[i+1];
                const nextStart = parseInt(nextSpan.dataset.charStart, 10);
                if (charIndex >= end && charIndex < nextStart) {
                    wordIndexToHighlight = i + 1; // Highlight the *next* word
                    break;
                }
            }
        }


        if (wordIndexToHighlight !== -1 && wordIndexToHighlight !== this.currentWordIndex) {
             this.currentWordIndex = wordIndexToHighlight;
             this._highlightWord(this.currentWordIndex);
        } else if (wordIndexToHighlight === -1 && charIndex > 0) {
            // Sometimes boundary lands after the last word, try highlighting the last one
            if (this.wordSpans.length > 0) {
                const lastSpan = this.wordSpans[this.wordSpans.length - 1];
                const end = parseInt(lastSpan.dataset.charEnd, 10);
                 if (charIndex >= end && this.currentWordIndex !== this.wordSpans.length - 1) {
                    this.currentWordIndex = this.wordSpans.length - 1;
                    this._highlightWord(this.currentWordIndex);
                 }
            }
        }
    }

    _onEnd() {
        console.log("TubeSummarizer AI: TTS finished.");
        this.isPlaying = false;
        this.isPaused = false;
        this.currentWordIndex = 0;
        this._clearHighlight();
        this._updatePlayButton(false);
        this.utterance = null; // Clean up utterance
    }

    _highlightWord(wordIndex) {
        this._clearHighlight(); // Remove previous highlight
        if (wordIndex >= 0 && wordIndex < this.wordSpans.length) {
            const spanToHighlight = this.wordSpans[wordIndex];
            spanToHighlight.classList.add('highlighted-word');

            // Optional: Scroll the highlighted word into view
            spanToHighlight.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }

    _clearHighlight() {
        this.wordSpans.forEach(span => span.classList.remove('highlighted-word'));
    }

    _updatePlayButton(isPlaying) {
        if (isPlaying) {
            // Change to Pause icon
            this.playButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> <!-- Pause Icon -->
                </svg>`;
            this.playButton.title = "Pause";
        } else {
            // Change back to Play icon
            this.playButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M8 5v14l11-7z"/> <!-- Play Icon -->
                </svg>`;
            this.playButton.title = "Play";
        }
    }
}

// Make class available globally within the iframe's context
window.TextToSpeech = TextToSpeech;
