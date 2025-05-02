const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create directory if it doesn't exist
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to create a simple icon
async function createSimpleIcon(size, filename) {
  // Create a simple canvas with text
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#000000"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="${size / 8}" font-family="Arial, sans-serif">Intent</text>
      <text x="50%" y="64%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="${size / 8}" font-family="Arial, sans-serif">Solver</text>
    </svg>
  `;

  // Convert SVG to PNG
  const outputPath = path.join(iconsDir, filename);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Generated ${outputPath}`);
}

// Generate icons of different sizes
async function generateIcons() {
  try {
    const sizes = [192, 512];
    for (const size of sizes) {
      await createSimpleIcon(size, `icon-${size}x${size}.png`);
    }
    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating PWA icons:', error);
  }
}

generateIcons(); 