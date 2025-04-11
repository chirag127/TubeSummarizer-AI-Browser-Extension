/**
 * TubeSummarizer AI - Backend Server
 *
 * Handles API requests for summarization and transcript fetching.
 */

const express = require('express');
const cors = require('cors'); // Import cors package
const summarizeRoutes = require('./routes/summarize');
const transcriptRoutes = require('./routes/transcript');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default port

// --- Middleware ---
app.use(express.json()); // Parse JSON request bodies

// Enable CORS for all origins (adjust for production if needed)
app.use(cors());

// --- Routes ---
// Basic health check / info route
app.get('/', (req, res) => {
 res.send('TubeSummarizer AI Backend is running!');
});

// Mount the routes
app.use('/summarize', summarizeRoutes);
app.use('/transcript', transcriptRoutes);


// --- Error Handling (Basic) ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`TubeSummarizer AI Backend listening on port ${PORT}`);
});