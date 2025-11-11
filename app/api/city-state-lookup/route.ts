import { NextRequest, NextResponse } from 'next/server';

// Cache for OAuth token (shared across requests)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const consumerKey = process.env.USPS_CONSUMER_KEY;
  const consumerSecret = process.env.USPS_CONSUMER_SECRET;
  const crid = process.env.USPS_CUSTOMER_REGISTRATION_ID;
  const mid = process.env.USPS_MAILER_ID;

  if (!consumerKey || !consumerSecret || !crid || !mid) {
    return null;
  }

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const requestBody = {
      client_id: consumerKey,
      client_secret: consumerSecret,
      customer_registration_id: crid,
      mailer_id: mid,
      grant_type: 'client_credentials',
    };
    
    const response = await fetch('https://apis.usps.com/oauth2/v3/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Cache token (expires in 1 hour typically)
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };

    return data.access_token;
  } catch (error) {
    console.error('Failed to get USPS OAuth token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format. Must be 5 digits.' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'USPS authentication failed' },
        { status: 503 }
      );
    }

    // Call USPS City/State lookup API
    const response = await fetch(
      `https://apis.usps.com/addresses/v3/city-state?ZIPCode=${zip}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // ZIP not found or invalid
      return NextResponse.json(
        { error: 'ZIP code not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      city: data.city,
      state: data.state,
    });
  } catch (error) {
    console.error('City/State lookup error:', error);
    return NextResponse.json(
      { error: 'Lookup failed' },
      { status: 500 }
    );
  }
}

