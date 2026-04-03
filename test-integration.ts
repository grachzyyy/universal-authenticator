#!/usr/bin/env npx ts-node

/**
 * Full Integration Test: Backend + Mobile API Client
 * Tests all critical authentication and device flows
 */

import axios from 'axios';
import crypto from 'crypto';
import { createHash } from 'crypto';

const API_BASE = 'http://localhost:4000';
const TEST_EMAIL = 'integration-test@universal-auth.app';
const TEST_SERVICE = 'github';

// Helper: Generate Ed25519 keypair (simulating client-side)
function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  return {
    publicKey: publicKey.export({ format: 'pem', type: 'spki' }),
    privateKey: privateKey.export({ format: 'pem', type: 'pkcs8' })
  };
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

(async () => {
  console.log('🧪 Running Universal Authenticator Integration Tests\n');
  console.log(`📍 Backend: ${API_BASE}`);
  console.log(`👤 Test Email: ${TEST_EMAIL}\n`);
  
  try {
    // Test 1: Auth Request (Challenge Creation)
    console.log('Test 1: Creating authentication challenge...');
    try {
      const authRes = await axios.post(`${API_BASE}/auth/request`, {
        email: TEST_EMAIL,
        service: TEST_SERVICE
      });
      
      const { challengeId, expiresAt, service } = authRes.data;
      
      if (challengeId && expiresAt && service === TEST_SERVICE) {
        results.push({
          name: 'Auth Request (Challenge Creation)',
          passed: true,
          message: `✅ Challenge created: ${challengeId}`
        });
        console.log(`✅ Challenge ID: ${challengeId}`);
      } else {
        throw new Error('Invalid challenge response');
      }
    } catch (err: any) {
      results.push({
        name: 'Auth Request',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}`);
    }

    // Test 2: Device Registration
    console.log('\nTest 2: Registering device...');
    try {
      const { publicKey } = generateKeypair();
      
      const deviceRes = await axios.post(`${API_BASE}/devices/register`, {
        email: TEST_EMAIL,
        public_key: publicKey,
        name: 'Test Device',
        platform: 'iOS'
      });
      
      const { deviceId } = deviceRes.data;
      
      if (deviceId) {
        results.push({
          name: 'Device Registration',
          passed: true,
          message: `✅ Device registered: ${deviceId}`
        });
        console.log(`✅ Device ID: ${deviceId}`);
      }
    } catch (err: any) {
      results.push({
        name: 'Device Registration',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}`);
    }

    // Test 3: List Devices
    console.log('\nTest 3: Listing registered devices...');
    try {
      const devicesRes = await axios.get(`${API_BASE}/devices`, {
        params: { email: TEST_EMAIL }
      });
      
      const devices = devicesRes.data;
      
      if (Array.isArray(devices) && devices.length > 0) {
        results.push({
          name: 'List Devices',
          passed: true,
          message: `✅ Found ${devices.length} device(s)`
        });
        console.log(`✅ Devices: ${devices.length}`);
      }
    } catch (err: any) {
      results.push({
        name: 'List Devices',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}`);
    }

    // Test 4: Create Service
    console.log('\nTest 4: Creating a new service...');
    try {
      const serviceRes = await axios.post(`${API_BASE}/devices/services`, {
        email: TEST_EMAIL,
        name: 'Test GitHub'
      });
      
      const { serviceId } = serviceRes.data;
      
      if (serviceId) {
        results.push({
          name: 'Create Service',
          passed: true,
          message: `✅ Service created: ${serviceId}`
        });
        console.log(`✅ Service ID: ${serviceId}`);
      }
    } catch (err: any) {
      results.push({
        name: 'Create Service',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}`);
    }

    // Test 5: List Services
    console.log('\nTest 5: Listing services...');
    try {
      const servicesRes = await axios.get(`${API_BASE}/devices/services`, {
        params: { email: TEST_EMAIL }
      });
      
      const services = servicesRes.data;
      
      if (Array.isArray(services)) {
        results.push({
          name: 'List Services',
          passed: true,
          message: `✅ Found ${services.length} service(s)`
        });
        console.log(`✅ Services: ${services.length}`);
      }
    } catch (err: any) {
      results.push({
        name: 'List Services',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}`);
    }

    // Test 6: Create Rule
    console.log('\nTest 6: Creating authentication rule...');
    try {
      const servicesRes = await axios.get(`${API_BASE}/devices/services`, {
        params: { email: TEST_EMAIL }
      });
      
      const services = servicesRes.data;
      
      if (services.length > 0) {
        const serviceId = services[0].id || services[0].serviceId;
        
        const ruleRes = await axios.post(`${API_BASE}/devices/rules`, {
          serviceId,
          name: 'Approve all from iPhone',
          condition: JSON.stringify({ platform: 'iOS' }),
          action: 'auto_approve'
        });
        
        const { ruleId } = ruleRes.data;
        
        if (ruleId) {
          results.push({
            name: 'Create Rule',
            passed: true,
            message: `✅ Rule created: ${ruleId}`
          });
          console.log(`✅ Rule ID: ${ruleId}`);
        }
      }
    } catch (err: any) {
      results.push({
        name: 'Create Rule',
        passed: false,
        message: `❌ ${err.message}`
      });
      console.log(`❌ Failed: ${err.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY\n');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
      console.log(`   ${result.message}\n`);
    });
    
    console.log(`\n📈 Passed: ${passed}/${total}`);
    console.log('='.repeat(50));
    
    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Project is ready.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review.\n');
      process.exit(1);
    }
    
  } catch (err) {
    console.error('🔥 Fatal error:', err);
    process.exit(1);
  }
})();
