// Simple build script for Render deployment
console.log('Starting Render build process...');

const fs = require('fs');
const { execSync } = require('child_process');

// Ensure required files exist
if (!fs.existsSync('./package.json')) {
  console.error('package.json not found!');
  process.exit(1);
}

if (!fs.existsSync('./tsconfig.json')) {
  console.error('tsconfig.json not found!');
  process.exit(1);
}

// Make sure TypeScript is installed
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Failed to install dependencies:', error);
  process.exit(1);
}

// Build the TypeScript code
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('TypeScript compilation completed successfully');
} catch (error) {
  console.error('Failed to compile TypeScript:', error);
  process.exit(1);
}

console.log('Build process completed successfully!'); 