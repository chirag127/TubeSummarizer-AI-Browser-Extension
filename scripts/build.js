/**
 * Build script for the YouTube Video Summarizer extension
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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
 * Copy files recursively
 */
function copyFiles(sourceDir, targetDir) {
    // Create target directory if it doesn't exist
    ensureDirectoryExists(targetDir);

    // Read directory contents
    const items = fs.readdirSync(sourceDir, { withFileTypes: true });

    // Process each item
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item.name);
        const targetPath = path.join(targetDir, item.name);

        if (item.isDirectory()) {
            // Recursively copy directory
            copyFiles(sourcePath, targetPath);
        } else {
            // Copy file
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

/**
 * Generate icons using the create-icons script
 */
function generateIcons() {
    console.log("Generating icons...");
    try {
        execSync("npm run create:icons", { stdio: "inherit" });
        console.log("Icons generated successfully!");
    } catch (error) {
        console.error("Error generating icons:", error);
        throw error;
    }
}

/**
 * Package extension using web-ext
 */
function packageExtension() {
    console.log("Packaging extension...");

    try {
        // Create dist directory if it doesn't exist
        ensureDirectoryExists(DIST_DIR);

        // Build extension
        const command = `npx web-ext build --source-dir=${EXTENSION_DIR} --artifacts-dir=${DIST_DIR} --overwrite-dest`;
        execSync(command, { stdio: "inherit" });

        console.log("Extension packaged successfully!");
    } catch (error) {
        console.error("Error packaging extension:", error);
        throw error;
    }
}

/**
 * Main build function
 */
async function build() {
    try {
        console.log("Starting build process...");

        // Generate icons
        generateIcons();

        // Package extension
        packageExtension();

        console.log("Build completed successfully!");
    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

// Run build
build();
