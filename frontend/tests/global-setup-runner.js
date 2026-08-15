const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.resolve(__dirname, '../../backend');
const scriptPath = path.resolve(backendDir, 'scripts/prepare_test_db.py');

let pythonCmd = 'python';
if (fs.existsSync(path.resolve(backendDir, 'venv/Scripts/python.exe'))) {
  pythonCmd = path.resolve(backendDir, 'venv/Scripts/python.exe');
} else if (fs.existsSync(path.resolve(backendDir, 'venv/bin/python'))) {
  pythonCmd = path.resolve(backendDir, 'venv/bin/python');
}

console.log('--- Preparing Test Database ---');
try {
  execSync(`${pythonCmd} "${scriptPath}"`, {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env, PYTHONPATH: backendDir }
  });
  console.log('Test database prepared successfully.');
} catch (error) {
  console.error('Failed to prepare test database.');
  process.exit(1);
}
