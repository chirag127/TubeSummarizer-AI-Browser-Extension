/**
 * TubeSummarizer AI - Gemini Service
 *
 * Handles integration with Google's Gemini API for summarization.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configure the Gemini model
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
});

// Default generation configuration
const defaultGenerationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

/**
 * Summarize text using Gemini API
 * @param {string} text - The text to summarize
 * @param {string} title - The title of the video (optional)
 * @param {Object} options - Additional options for summarization
 * @returns {Promise<string>} The summarized text
 */
async function summarize(text, title = "", options = {}) {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error("No text provided for summarization");
        }

        console.log(
            `Gemini Service: Requesting summary for "${title || "Untitled"}"...`
        );

        // If API key is not set, return a placeholder summary
        if (!apiKey) {
            console.warn(
                "Gemini Service: Using placeholder summary (no API key)."
            );
            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
            return `AI Summary Placeholder (Gemini API key not configured):
- Key point 1 derived from: ${text.substring(0, 40)}...
- Key point 2 about the middle part.
- Key point 3 concluding the content.
- This is a placeholder. Please configure the Gemini API key.`;
        }

        // Prepare the prompt
        const language = options.language || "English";
        const promptTemplate =
            options.promptTemplate ||
            `You are provided the title and transcript of a Youtube video in triple quotes.
      Summarize the video transcript in 5 bullet points in ${language}.
      Title: """${title}"""
      Transcript: """${text}"""`;

        // Configure generation parameters
        const generationConfig = {
            ...defaultGenerationConfig,
            ...options.generationConfig,
        };

        // Create a chat session
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        // Send the message and get the response
        const result = await chatSession.sendMessage(promptTemplate);
        const summary = result.response.text();
        console.log("Gemini Service: Summary generated successfully.");
        return summary;
    } catch (error) {
        console.error("Error in Gemini summarization:", error);
        throw new Error(`Failed to summarize text: ${error.message}`);
    }
}

module.exports = {
    summarize,
    model,
};
