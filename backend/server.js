const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure API key for Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in the environment variables");
    process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
});

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(limiter);

// Create a summarization prompt
const createSummarizationPrompt = (title, transcript) => {
    return `
  Summarize the following YouTube video transcript with the title: "${title}"

  Transcript:
  ${transcript}

  Please provide a comprehensive but concise summary that:
  1. Captures the main points and key insights
  2. Is well-structured and easy to read
  3. Highlights any important conclusions
  4. Is around 200-300 words
  `;
};

// API Routes
app.post("/summarize", async (req, res) => {
    try {
        const { videoId, transcript, title } = req.body;

        if (!videoId || !transcript || !title) {
            return res.status(400).json({
                error: "Missing required parameters. Please provide videoId, transcript, and title.",
            });
        }

        const prompt = createSummarizationPrompt(title, transcript);

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        return res.json({ summary });
    } catch (error) {
        console.error("Error generating summary:", error);
        return res.status(500).json({
            error: "Failed to generate summary",
            details: error.message,
        });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
