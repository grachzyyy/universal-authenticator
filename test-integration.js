#!/usr/bin/env node

/**
 * Full Integration Test: Backend + Mobile API Client
 * Tests all critical authentication and device flows
 */

const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:4000';
const TEST_EMAIL = 'integration-test@universal-auth.app';
const TEST_SERVICE = 'github';

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

const results = [];

(async () => {
  console.log('🧪 Running Universal Authenticator Integration Tests\n');
  console.log(`📍 Backend: ${API_BASE}`);
  console.log(`👤 Test Email: ${TEST_EMAIL}\n`);
  
  try {
    // Test 1: Auth Request
    console.log('Test 1: Creating authentication challenge...');
    try {
      const authRes = await makeRequest(
        `${API_BASE}/auth/request`,
        'POST',
        { email: TEST_EMAIL, service: TEST_SERVICE }
      );
      
      if (authRes.status === 200 && authRes.data.challengeId) {
        results.push({
          name: 'Auth Request (Challenge)',
          passed: true,
          message: `✅ Challenge: ${authRes.data.challengeId}`
        });
        console.log(`✅ Challenge ID: ${authRes.data.challengeId}\n`);
      } else {
        throw new Error(`Invalid response: ${JSON.stringify(authRes)}`);
      }
    } catch (err) {
      results.push({
        name: 'Auth Request',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}\n`);
    }

    // Test 2: Device Registration
    console.log('Test 2: Registering device...');
    try {
      const deviceRes = await makeRequest(
        `${API_BASE}/devices/register`,
        'POST',
        {
          email: TEST_EMAIL,
          public_key: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKz...',
          name: 'Test Device',
          platform: 'iOS'
        }
      );
      
      if (deviceRes.status === 201 && (deviceRes.data.deviceId || deviceRes.data.id)) {
        results.push({
          name: 'Device Registration',
          passed: true,
          message: `✅ Device: ${deviceRes.data.deviceId || deviceRes.data.id}`
        });
        console.log(`✅ Device ID: ${deviceRes.data.deviceId || deviceRes.data.id}\n`);
      } else {
        throw new Error(`Invalid response: ${JSON.stringify(deviceRes)}`);
      }
    } catch (err) {
      results.push({
        name: 'Device Registration',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}\n`);
    }

    // Test 3: List Devices
    console.log('Test 3: Listing registered devices...');
    try {
      const devicesRes = await makeRequest(
        `${API_BASE}/devices?email=${encodeURIComponent(TEST_EMAIL)}`,
        'GET',
        null
      );
      
      if (devicesRes.status === 200 && Array.isArray(devicesRes.data)) {
        results.push({
          name: 'List Devices',
          passed: true,
          message: `✅ Found ${devicesRes.data.length} device(s)`
        });
        console.log(`✅ Devices found: ${devicesRes.data.length}\n`);
      } else {
        throw new Error(`Invalid response: ${JSON.stringify(devicesRes)}`);
      }
    } catch (err) {
      results.push({
        name: 'List Devices',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY\n');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
      console.log(`   ${result.message}\n`);
    });
    
    console.log('='.repeat(60));
    console.log(`\n📈 Passed: ${passed}/${total}\n`);
    
    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Backend is fully operational.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed.\n');
      process.exit(1);
    }
    
  } catch (err) {
    console.error('🔥 Fatal error:', err);
    process.exit(1);
  }
})();
