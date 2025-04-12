/**
 * Simple script to create placeholder icon files
 * This is a fallback for environments where canvas cannot be installed
 */
const fs = require("fs");
const path = require("path");

// Create placeholder icons for browser extensions
// Since we can't use canvas, we'll just create empty files with the right names
// and the extension packager will handle them as needed

const iconSizes = [16, 48, 128];
const outputDir = path.join(__dirname);

// Ensure the directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create empty files for each icon size
iconSizes.forEach((size) => {
    const iconPath = path.join(outputDir, `icon${size}.png`);
    console.log(`Creating placeholder icon: ${iconPath}`);

    // We'll just touch the file to create it
    try {
        fs.writeFileSync(iconPath, "");
        console.log(`Created: ${iconPath}`);
    } catch (error) {
        console.error(`Error creating icon ${size}:`, error);
    }
});

console.log("Placeholder icons created!");
console.log("Note: For a production extension, replace these with real icons.");
