/**
 * Script to generate PNG icons from SVG source
 * 
 * This script converts the source SVG icon to multiple PNG sizes
 * required for the browser extension.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '../extension/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Source SVG file
const svgPath = path.join(iconsDir, 'icon.svg');

// Target sizes for PNG icons
const sizes = [16, 48, 128];

// Function to convert SVG to PNG
async function convertToPng(size) {
  const outputPath = path.join(iconsDir, `icon${size}.png`);
  
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating ${outputPath}:`, error);
  }
}

// Process all sizes
async function generateAllIcons() {
  console.log('🔄 Generating icons from SVG...');
  
  try {
    // Check if source SVG exists
    if (!fs.existsSync(svgPath)) {
      throw new Error(`Source SVG not found at ${svgPath}`);
    }
    
    // Convert to each size in parallel
    await Promise.all(sizes.map(size => convertToPng(size)));
    
    console.log('✨ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Icon generation failed:', error);
    process.exit(1);
  }
}

// Run the icon generation
generateAllIcons();
