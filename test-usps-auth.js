#!/usr/bin/env node

/**
 * USPS API Authentication Test Script
 * Run this to verify your USPS credentials are working
 * 
 * Usage: node test-usps-auth.js
 */

require('dotenv').config({ path: '.env.local' });

const consumerKey = process.env.USPS_CONSUMER_KEY;
const consumerSecret = process.env.USPS_CONSUMER_SECRET;
const crid = process.env.USPS_CUSTOMER_REGISTRATION_ID;
const mid = process.env.USPS_MAILER_ID;

console.log('\n🔍 USPS API Credentials Check\n');
console.log('================================\n');

// Check if credentials are set
console.log('✓ Checking environment variables...');
console.log(`  USPS_CONSUMER_KEY: ${consumerKey ? `Set (${consumerKey.length} chars)` : '❌ NOT SET'}`);
console.log(`  USPS_CONSUMER_SECRET: ${consumerSecret ? `Set (${consumerSecret.length} chars)` : '❌ NOT SET'}`);
console.log(`  USPS_CUSTOMER_REGISTRATION_ID: ${crid ? `Set (${crid.length} chars)` : '❌ NOT SET'}`);
console.log(`  USPS_MAILER_ID: ${mid ? `Set (${mid.length} chars)` : '❌ NOT SET'}`);
console.log('');

if (!consumerKey || !consumerSecret || !crid || !mid) {
  console.error('❌ ERROR: All 4 credentials are required in .env.local');
  console.log('\nPlease add these to your .env.local file:');
  console.log('  USPS_CONSUMER_KEY=your_key_here');
  console.log('  USPS_CONSUMER_SECRET=your_secret_here');
  console.log('  USPS_CUSTOMER_REGISTRATION_ID=your_crid_here');
  console.log('  USPS_MAILER_ID=your_mid_here');
  console.log('\nThen restart this script.\n');
  process.exit(1);
}

// Test OAuth token request
console.log('🔐 Testing OAuth authentication...\n');
console.log('Using JSON format with all 4 credentials (per official USPS docs)...\n');

const requestBody = {
  client_id: consumerKey,
  client_secret: consumerSecret,
  customer_registration_id: crid,
  mailer_id: mid,
  grant_type: 'client_credentials',
};

fetch('https://apis.usps.com/oauth2/v3/token', {  // NOTE: apis (plural) not api!
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
})
  .then(async (response) => {
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ Authentication Failed!\n');
      console.error('Response:', errorText);
      console.log('\n📋 Troubleshooting:');
      console.log('  1. Verify your Consumer Key and Secret in USPS Developer Portal');
      console.log('  2. Make sure you copied them correctly (no extra spaces)');
      console.log('  3. Check if your app is approved in the USPS Developer Portal');
      console.log('  4. Ensure you selected the "Addresses" API product');
      console.log('\n  Portal: https://developers.usps.com/apps\n');
      process.exit(1);
    }
    
    return response.json();
  })
  .then((data) => {
    console.log('\n✅ Authentication Successful!\n');
    console.log('Access Token:', data.access_token.substring(0, 20) + '...');
    console.log('Token Type:', data.token_type);
    console.log('Expires In:', data.expires_in, 'seconds');
    console.log('\n🎉 Your USPS API credentials are working correctly!\n');
    console.log('You can now use address validation in your app.\n');
  })
  .catch((error) => {
    console.error('\n❌ Network Error:', error.message);
    console.log('\nCheck your internet connection and try again.\n');
    process.exit(1);
  });

