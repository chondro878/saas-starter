#!/usr/bin/env node

/**
 * USPS API Test - Try Both Production and Test Endpoints
 */

require('dotenv').config({ path: '.env.local' });

const consumerKey = process.env.USPS_CONSUMER_KEY;
const consumerSecret = process.env.USPS_CONSUMER_SECRET;
const crid = process.env.USPS_CUSTOMER_REGISTRATION_ID;
const mid = process.env.USPS_MAILER_ID;

console.log('\n🔍 USPS API Credentials Check\n');
console.log('================================\n');

if (!consumerKey || !consumerSecret || !crid || !mid) {
  console.error('❌ ERROR: All 4 credentials required');
  process.exit(1);
}

console.log('✓ All credentials present');
console.log('');

const requestBody = {
  client_id: consumerKey,
  client_secret: consumerSecret,
  customer_registration_id: crid,
  mailer_id: mid,
  grant_type: 'client_credentials',
};

async function testEndpoint(url, name) {
  console.log(`\n🔐 Testing ${name}...\n`);
  console.log(`URL: ${url}\n`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log('Response:', text);

    if (response.ok) {
      console.log('\n✅ SUCCESS with', name);
      return true;
    }
  } catch (error) {
    console.log('\n❌ Network error:', error.message);
  }
  return false;
}

(async () => {
  // Try production
  const prodSuccess = await testEndpoint(
    'https://api.usps.com/oauth2/v3/token',
    'Production (api.usps.com)'
  );

  if (prodSuccess) {
    console.log('\n🎉 Production endpoint works!\n');
    process.exit(0);
  }

  // Try test environment
  const testSuccess = await testEndpoint(
    'https://apis-tem.usps.com/oauth2/v3/token',
    'Test Environment (apis-tem.usps.com)'
  );

  if (testSuccess) {
    console.log('\n🎉 Test endpoint works! Add this to .env.local:\n');
    console.log('USPS_TEST_MODE=true\n');
    process.exit(0);
  }

  // Try alternative endpoint path
  const altSuccess = await testEndpoint(
    'https://apis.usps.com/oauth2/v3/token',
    'Alternative (apis.usps.com - plural)'
  );

  if (altSuccess) {
    console.log('\n🎉 Alternative endpoint works!\n');
    process.exit(0);
  }

  console.log('\n\n❌ All endpoints failed.');
  console.log('\n💡 This suggests the app may not be fully approved for API access.');
  console.log('📧 Contact USPS support: webtools@usps.gov');
  console.log('📞 Or call: 1-800-344-7779\n');
})();

