// Import required modules
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Get Gemini model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite',
});

// Generation configuration
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

// Summarize transcript
async function summarizeTranscript(transcript, title) {
  try {
    // Create chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    
    // Create prompt
    const prompt = `You are provided the title and transcript of a YouTube video in triple quotes.
Summarize the video transcript in 5 bullet points in English.
Title: """${title}"""
Transcript: """${transcript}"""`;
    
    // Send message to Gemini
    const result = await chatSession.sendMessage(prompt);
    
    // Get response text
    const summary = result.response.text();
    
    return summary;
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  summarizeTranscript,
};
