const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Paths
const rootDir = path.resolve(__dirname, "..");
const extensionDir = path.join(rootDir, "extension");
const distDir = path.join(rootDir, "dist");

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Build for Chrome/Edge
function buildChrome() {
    console.log("Building for Chrome/Edge...");

    const chromeDir = path.join(distDir, "chrome");

    // Create chrome directory if it doesn't exist
    if (!fs.existsSync(chromeDir)) {
        fs.mkdirSync(chromeDir);
    }

    // Copy extension files to chrome directory
    execSync(`cp -r ${extensionDir}/* ${chromeDir}`);

    // Create zip file
    execSync(`cd ${chromeDir} && zip -r ../youtube-summarizer-chrome.zip .`);

    console.log("Chrome/Edge build completed!");
}

// Build for Firefox
function buildFirefox() {
    console.log("Building for Firefox...");

    const firefoxDir = path.join(distDir, "firefox");

    // Create firefox directory if it doesn't exist
    if (!fs.existsSync(firefoxDir)) {
        fs.mkdirSync(firefoxDir);
    }

    // Copy extension files to firefox directory
    execSync(`cp -r ${extensionDir}/* ${firefoxDir}`);

    // Modify manifest for Firefox
    const manifestPath = path.join(firefoxDir, "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    // Firefox-specific changes
    manifest.browser_specific_settings = {
        gecko: {
            id: "youtube-summarizer@chirag127.github.io",
            strict_min_version: "57.0",
        },
    };

    // Save modified manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Create zip file using web-ext
    execSync(
        `cd ${firefoxDir} && web-ext build --overwrite-dest --artifacts-dir ${distDir}`
    );

    // Rename the generated zip file
    const webExtOutput = fs
        .readdirSync(distDir)
        .find((file) => file.startsWith("web-ext-artifacts"));
    if (webExtOutput) {
        const zipFile = fs.readdirSync(path.join(distDir, webExtOutput))[0];
        fs.renameSync(
            path.join(distDir, webExtOutput, zipFile),
            path.join(distDir, "youtube-summarizer-firefox.xpi")
        );

        // Remove web-ext-artifacts directory
        execSync(`rm -rf ${path.join(distDir, webExtOutput)}`);
    }

    console.log("Firefox build completed!");
}

// Main build process
function build() {
    console.log("Starting build process...");

    // Clean dist directory
    execSync(`rm -rf ${distDir}/*`);

    // Build for different browsers
    buildChrome();
    buildFirefox();

    console.log("Build process completed successfully!");
}

// Run build
build();
