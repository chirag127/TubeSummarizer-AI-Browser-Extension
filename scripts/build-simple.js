/**
 * Simple build script for the YouTube Video Summarizer extension
 * This is a fallback for environments where web-ext cannot be installed
 */
const fs = require("fs");
const path = require("path");

// Directories
const ROOT_DIR = path.join(__dirname, "..");
const EXTENSION_DIR = path.join(ROOT_DIR, "extension");
const DIST_DIR = path.join(ROOT_DIR, "dist");

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Generate icons
 */
function generateIcons() {
    console.log("Generating placeholder icons...");
    try {
        // Run the simple icon generator
        require(path.join(EXTENSION_DIR, "icons", "generateIcons.js"));
        console.log("Icons generated successfully!");
    } catch (error) {
        console.error("Error generating icons:", error);
        throw error;
    }
}

/**
 * Copy extension files to dist directory
 */
function copyExtensionFiles() {
    console.log("Copying extension files to dist directory...");

    // Create dist directory if it doesn't exist
    ensureDirectoryExists(DIST_DIR);

    // Create Chrome directory in dist
    const chromeDir = path.join(DIST_DIR, "chrome");
    ensureDirectoryExists(chromeDir);

    // Create Firefox directory in dist
    const firefoxDir = path.join(DIST_DIR, "firefox");
    ensureDirectoryExists(firefoxDir);

    // Copy files
    copyFiles(EXTENSION_DIR, chromeDir);

    // Copy files to Firefox directory and adjust manifest
    copyFiles(EXTENSION_DIR, firefoxDir);

    console.log("Extension files copied successfully!");
}

/**
 * Copy files recursively
 */
function copyFiles(sourceDir, targetDir) {
    // Read directory contents
    const items = fs.readdirSync(sourceDir, { withFileTypes: true });

    // Process each item
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item.name);
        const targetPath = path.join(targetDir, item.name);

        if (item.isDirectory()) {
            // Create target directory
            ensureDirectoryExists(targetPath);

            // Recursively copy directory
            copyFiles(sourcePath, targetPath);
        } else {
            // Copy file
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

/**
 * Modify manifest for Firefox
 */
function modifyFirefoxManifest() {
    console.log("Modifying Firefox manifest...");

    // Path to Firefox manifest
    const manifestPath = path.join(DIST_DIR, "firefox", "manifest.json");

    // Read manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    // Add Firefox-specific fields
    manifest.browser_specific_settings = {
        gecko: {
            id: "youtube-summarizer@chirag127.github.io",
            strict_min_version: "57.0",
        },
    };

    // Write modified manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log("Firefox manifest modified successfully!");
}

/**
 * Main build function
 */
function build() {
    try {
        console.log("Starting build process...");

        // Generate icons
        generateIcons();

        // Copy extension files to dist directory
        copyExtensionFiles();

        // Modify Firefox manifest
        modifyFirefoxManifest();

        console.log("Build completed successfully!");
        console.log("Extension files available in:");
        console.log(`  - Chrome/Edge: ${path.join(DIST_DIR, "chrome")}`);
        console.log(`  - Firefox: ${path.join(DIST_DIR, "firefox")}`);
    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

// Run build process
build();
