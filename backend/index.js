/**
 * TubeSummarizer AI - Backend Server
 *
 * Handles API requests for summarization and transcript fetching.
 */

// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const summarizeRoutes = require("./routes/summarize");
const transcriptRoutes = require("./routes/transcript");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json({ limit: "1mb" })); // Parse JSON request bodies with size limit

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "chrome-extension://*"];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, etc)
            if (!origin) return callback(null, true);

            // Check if origin matches any allowed pattern
            const isAllowed = allowedOrigins.some((allowedOrigin) => {
                if (allowedOrigin === "*") return true;
                if (allowedOrigin.endsWith("*")) {
                    const prefix = allowedOrigin.slice(0, -1);
                    return origin.startsWith(prefix);
                }
                return allowedOrigin === origin;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error("CORS not allowed"));
            }
        },
        credentials: true,
    })
);

// Configure rate limiting
const apiLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000, // 1 minute by default
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 30, // 30 requests per minute by default
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
});

// Apply rate limiting to API routes
app.use("/summarize", apiLimiter);
app.use("/transcript", apiLimiter);

// --- Routes ---
// Basic health check / info route
app.get("/", (req, res) => {
    res.send("TubeSummarizer AI Backend is running!");
});

// Mount the routes
app.use("/summarize", summarizeRoutes);
app.use("/transcript", transcriptRoutes);

// --- Error Handling ---
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);

    // Handle CORS errors specifically
    if (err.message === "CORS not allowed") {
        return res
            .status(403)
            .json({ error: "CORS not allowed for this origin" });
    }

    // Generic error response
    res.status(500).json({
        error: "Something went wrong!",
        message:
            process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`TubeSummarizer AI Backend listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
