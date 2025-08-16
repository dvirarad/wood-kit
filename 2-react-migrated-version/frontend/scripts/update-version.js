const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current git commit hash
let gitCommit = 'unknown';
try {
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (error) {
  console.warn('Could not get git commit hash:', error.message);
}

// Read current package.json to get version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get current build number from version file if it exists
const versionFilePath = path.join(__dirname, '../src/config/version.ts');
let currentBuildNumber = 1;

if (fs.existsSync(versionFilePath)) {
  try {
    const currentVersionFile = fs.readFileSync(versionFilePath, 'utf8');
    const buildNumberMatch = currentVersionFile.match(/buildNumber:\s*(\d+)/);
    if (buildNumberMatch) {
      currentBuildNumber = parseInt(buildNumberMatch[1]) + 1;
    }
  } catch (error) {
    console.warn('Could not read current build number:', error.message);
  }
}

// Create version configuration
const versionConfig = {
  version: packageJson.version || '1.0.0',
  buildNumber: currentBuildNumber,
  buildDate: new Date().toISOString(),
  gitCommit: gitCommit
};

// Generate version file content
const versionFileContent = `// Auto-generated version file
export const APP_VERSION = {
  version: '${versionConfig.version}',
  buildNumber: ${versionConfig.buildNumber},
  buildDate: '${versionConfig.buildDate}',
  gitCommit: '${versionConfig.gitCommit}'
};

export default APP_VERSION;
`;

// Write version file
fs.writeFileSync(versionFilePath, versionFileContent, 'utf8');

console.log(`Version updated: ${versionConfig.version} (Build ${versionConfig.buildNumber})`);
console.log(`Git commit: ${versionConfig.gitCommit}`);
console.log(`Build date: ${versionConfig.buildDate}`);