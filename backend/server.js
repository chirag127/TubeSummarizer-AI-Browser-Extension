// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { summarizeTranscript } = require('./summarizer');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Define routes
app.get('/', (req, res) => {
  res.send('YouTube Video Summarizer API');
});

// Summarize endpoint
app.post('/summarize', async (req, res) => {
  try {
    // Get request data
    const { videoId, transcript, title } = req.body;
    
    // Validate request data
    if (!videoId || !transcript || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate summary
    const summary = await summarizeTranscript(transcript, title);
    
    // Return summary
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
