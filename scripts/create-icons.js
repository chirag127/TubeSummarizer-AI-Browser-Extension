/**
 * Script to convert SVG to PNG icons
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { createCanvas, Image } = require('canvas');

// Icon sizes to generate
const SIZES = [16, 48, 128];

// Paths
const SVG_PATH = path.join(__dirname, '../extension/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../extension/icons');

/**
 * Convert SVG to PNG
 */
async function convertSVGtoPNG(svgPath, outputPath, size) {
  // Read SVG file
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Create canvas with desired dimensions
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Load SVG
  const img = new Image();

  // Create a data URL from the SVG
  const svgBase64 = Buffer.from(svgContent).toString('base64');
  const dataURL = `data:image/svg+xml;base64,${svgBase64}`;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, size, size);

      // Convert canvas to PNG buffer
      const pngBuffer = canvas.toBuffer('image/png');

      // Write to file
      fs.writeFileSync(outputPath, pngBuffer);

      resolve();
    };

    img.onerror = (err) => {
      reject(new Error(`Failed to load SVG: ${err}`));
    };

    img.src = dataURL;
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Check if SVG file exists
    if (!fs.existsSync(SVG_PATH)) {
      console.error('SVG file not found:', SVG_PATH);
      process.exit(1);
    }

    // Make sure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Convert SVG to PNG for each size
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);
      console.log(`Converting SVG to ${size}x${size} PNG...`);
      await convertSVGtoPNG(SVG_PATH, outputPath, size);
      console.log(`Created: ${outputPath}`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Run the script
main();