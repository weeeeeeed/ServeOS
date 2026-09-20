// Automated HTTP route tester for ServeOS
const http = require('http');

const endpoints = [
  { name: 'Landing Page', path: '/' },
  { name: 'Login Portal', path: '/login' },
  { name: 'Register Portal', path: '/register' },
  { name: 'Customer QR Menu', path: '/r/la-piazza' },
  { name: 'Plans API', path: '/api/plans' },
  { name: 'Full Logo PNG', path: '/images/serveos-logo.png' },
  { name: 'Icon PNG', path: '/images/serveos-icon.png' },
  { name: 'Horizontal Logo PNG', path: '/images/serveos-logo-horizontal.png' },
  { name: 'Favicon', path: '/favicon.ico' },
  { name: 'Manifest JSON', path: '/manifest.json' }
];

async function runTests() {
  console.log('==================================================');
  console.log('       SERVEOS AUTOMATED ENDPOINT TESTS');
  console.log('==================================================');
  let passed = 0;

  for (const ep of endpoints) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: ep.path,
        method: 'GET',
        headers: { 'User-Agent': 'ServeOS-Tester/1.0' }
      };

      const req = http.request(options, (res) => {
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        const statusIcon = isOk ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${statusIcon} [${res.statusCode}] ${ep.name.padEnd(24)} -> ${ep.path}`);
        if (isOk) passed++;
        res.resume();
        resolve();
      });

      req.on('error', (e) => {
        console.log(`  ❌ ERR  [---] ${ep.name.padEnd(24)} -> ${e.message}`);
        resolve();
      });

      req.end();
    });
  }

  console.log('--------------------------------------------------');
  console.log(`Results: ${passed}/${endpoints.length} endpoints passed successfully!`);
  console.log('==================================================');
}

runTests();
