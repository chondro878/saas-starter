// USPS Address Validation API integration
// Uses the USPS Addresses API v3.0 (Modern REST API)
// API Version: Addresses v3.0 (current as of January 2025)
// Endpoint: https://api.usps.com/addresses/v3
// Format: JSON with OAuth 2.0 authentication

export interface AddressValidationRequest {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
}

export interface AddressValidationResponse {
  isValid: boolean;
  verdict: 'VALID' | 'CORRECTABLE' | 'UNDELIVERABLE' | 'ERROR';
  suggestedAddress?: AddressValidationRequest;
  originalAddress: AddressValidationRequest;
  message?: string;
}

// Cache for OAuth token (in-memory, 1-hour expiration)
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth 2.0 access token for USPS API
 * Tokens are cached for 1 hour to minimize API calls
 */
async function getAccessToken(): Promise<string | null> {
  const consumerKey = process.env.USPS_CONSUMER_KEY;
  const consumerSecret = process.env.USPS_CONSUMER_SECRET;
  const crid = process.env.USPS_CUSTOMER_REGISTRATION_ID;
  const mid = process.env.USPS_MAILER_ID;
  const isTestMode = process.env.USPS_TEST_MODE === 'true';

  if (!consumerKey || !consumerSecret || !crid || !mid) {
    console.warn('USPS API credentials not fully configured');
    console.warn('Required: USPS_CONSUMER_KEY, USPS_CONSUMER_SECRET, USPS_CUSTOMER_REGISTRATION_ID, USPS_MAILER_ID');
    return null;
  }

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    // Use test environment if configured
    const baseUrl = isTestMode 
      ? 'https://apis-tem.usps.com'  // Test Environment for Mailers
      : 'https://apis.usps.com';      // Production (NOTE: apis not api - plural!)
    
    console.log(`[USPS] Using ${isTestMode ? 'TEST' : 'PRODUCTION'} environment`);
    
    // Build OAuth request per official USPS docs (JSON format with all 4 credentials)
    const requestBody = {
      client_id: consumerKey,
      client_secret: consumerSecret,
      customer_registration_id: crid,
      mailer_id: mid,
      grant_type: 'client_credentials',
    };
    
    const response = await fetch(`${baseUrl}/oauth2/v3/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Get detailed error information
      const errorText = await response.text();
      console.error('USPS OAuth error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        consumerKeyLength: consumerKey?.length,
        hasConsumerKey: !!consumerKey,
        hasConsumerSecret: !!consumerSecret,
      });
      throw new Error(`OAuth token request failed: ${response.status} ${response.statusText} - ${errorText}`);
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

export async function validateAddress(
  address: AddressValidationRequest
): Promise<AddressValidationResponse> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    console.warn('USPS API authentication failed - address validation disabled');
    return {
      isValid: true,
      verdict: 'VALID',
      originalAddress: address,
      message: 'Address validation unavailable',
    };
  }

  try {
    const isTestMode = process.env.USPS_TEST_MODE === 'true';
    const baseUrl = isTestMode 
      ? 'https://apis-tem.usps.com'
      : 'https://apis.usps.com';  // NOTE: apis not api - plural!

    // Build USPS API v3 request - uses GET with query parameters (not POST!)
    const params = new URLSearchParams({
      streetAddress: address.street,
      secondaryAddress: address.apartment || '',
      city: address.city,
      state: address.state,
      ZIPCode: address.zip.replace('-', ''), // Remove dash if present
    });

    const response = await fetch(`${baseUrl}/addresses/v3/address?${params.toString()}`, {
      method: 'GET',  // GET method per USPS documentation
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Get detailed error for debugging
      const errorText = await response.text();
      
      // Try to parse as JSON error response
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = null;
      }
      
      console.error('USPS address validation error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: response.url,
      });
      
      // Handle "Address Not Found" as a validation result (not an error)
      if (response.status === 400 && errorData?.error?.message === 'Address Not Found') {
        return {
          isValid: false,
          verdict: 'UNDELIVERABLE',
          originalAddress: address,
          message: 'Address not found in USPS database. Please verify and try again.',
        };
      }
      
      // Handle 404 Not Found
      if (response.status === 404) {
        return {
          isValid: false,
          verdict: 'UNDELIVERABLE',
          originalAddress: address,
          message: 'Address not found in USPS database. Please verify and try again.',
        };
      }
      
      // For other errors, throw (will trigger fallback to accept all addresses)
      throw new Error(`USPS API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // USPS Addresses v3 response structure
    const uspsAddress = data.address;
    
    if (!uspsAddress) {
      return {
        isValid: false,
        verdict: 'UNDELIVERABLE',
        originalAddress: address,
        message: 'Address could not be validated.',
      };
    }

    // Extract standardized address from response
    const standardizedStreet = uspsAddress.streetAddress || '';
    const standardizedCity = uspsAddress.city || address.city;
    const standardizedState = uspsAddress.state || address.state;
    const standardizedZip5 = uspsAddress.ZIPCode || address.zip;
    const standardizedZip4 = uspsAddress.ZIPPlus4 || '';

    // Compare with original
    const streetMatches = standardizedStreet.toUpperCase() === address.street.toUpperCase();
    const cityMatches = standardizedCity.toUpperCase() === address.city.toUpperCase();
    const stateMatches = standardizedState.toUpperCase() === address.state.toUpperCase();
    const zipMatches = standardizedZip5 === address.zip.substring(0, 5);

    const allMatch = streetMatches && cityMatches && stateMatches && zipMatches;

    if (allMatch) {
      // Perfect match
      return {
        isValid: true,
        verdict: 'VALID',
        originalAddress: address,
      };
    } else {
      // USPS has corrections
      const suggestedAddress: AddressValidationRequest = {
        street: standardizedStreet,
        apartment: uspsAddress.secondaryAddress || address.apartment,
        city: standardizedCity,
        state: standardizedState,
        zip: standardizedZip4 ? `${standardizedZip5}-${standardizedZip4}` : standardizedZip5,
      };

      return {
        isValid: false,
        verdict: 'CORRECTABLE',
        suggestedAddress,
        originalAddress: address,
        message: 'USPS found a standardized version of your address. Please review.',
      };
    }
  } catch (error) {
    console.error('USPS address validation error:', error);
    return {
      isValid: true,
      verdict: 'ERROR',
      originalAddress: address,
      message: 'Address validation service unavailable. Proceeding without validation.',
    };
  }
}

