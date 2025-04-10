console.log('Starting Render deployment process...');

// This is a helper script that runs during the Render build phase
// It ensures the proper environment is set up for the build

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the proper Node.js version is specified
console.log('Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Make sure TypeScript is in dependencies
if (!packageJson.dependencies.typescript) {
  console.log('Adding TypeScript to dependencies...');
  packageJson.dependencies.typescript = "^4.9.5";
}

// Make sure postinstall script is correct
if (packageJson.scripts.postinstall !== "tsc") {
  console.log('Updating postinstall script...');
  packageJson.scripts.postinstall = "tsc";
}

// Write the updated package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

// Make sure tsconfig.json is simple and free of errors
console.log('Checking tsconfig.json...');
const tsConfig = {
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "strict": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
};

fs.writeFileSync('./tsconfig.json', JSON.stringify(tsConfig, null, 2));

console.log('Render deployment preparation complete!'); 