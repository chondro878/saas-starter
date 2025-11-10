// Smarty Address Validation API integration (Alternative to USPS)
// Free tier: 250 lookups/month
// Uses USPS data, but through a reliable third-party API

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

export async function validateAddress(
  address: AddressValidationRequest
): Promise<AddressValidationResponse> {
  const authId = process.env.SMARTY_AUTH_ID;
  const authToken = process.env.SMARTY_AUTH_TOKEN;

  if (!authId || !authToken) {
    console.warn('Smarty credentials not configured - address validation disabled');
    return {
      isValid: true,
      verdict: 'VALID',
      originalAddress: address,
      message: 'Address validation unavailable',
    };
  }

  try {
    // Build Smarty API request
    const params = new URLSearchParams({
      'auth-id': authId,
      'auth-token': authToken,
      street: address.street,
      street2: address.apartment || '',
      city: address.city,
      state: address.state,
      zipcode: address.zip,
    });

    const response = await fetch(
      `https://us-street.api.smarty.com/street-address?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Smarty authentication failed');
        throw new Error('Invalid Smarty credentials');
      }
      throw new Error(`Smarty API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // No results = invalid address
    if (!data || data.length === 0) {
      return {
        isValid: false,
        verdict: 'UNDELIVERABLE',
        originalAddress: address,
        message: 'Address not found. Please verify and try again.',
      };
    }

    const result = data[0];
    const components = result.components;
    const metadata = result.metadata;

    // Check if address was verified
    const dpvMatchCode = metadata.dpv_match_code;
    
    if (dpvMatchCode === 'N') {
      // Not deliverable
      return {
        isValid: false,
        verdict: 'UNDELIVERABLE',
        originalAddress: address,
        message: 'Address cannot be verified as deliverable.',
      };
    }

    // Build standardized address
    const standardizedStreet = result.delivery_line_1;
    const standardizedCity = components.city_name;
    const standardizedState = components.state_abbreviation;
    const standardizedZip = components.zipcode;
    const standardizedZip4 = components.plus4_code;

    // Check if corrections were made
    const streetMatches = standardizedStreet.toUpperCase().includes(address.street.toUpperCase());
    const cityMatches = standardizedCity.toUpperCase() === address.city.toUpperCase();
    const stateMatches = standardizedState.toUpperCase() === address.state.toUpperCase();

    const hasCorrections = !streetMatches || !cityMatches || !stateMatches;

    if (!hasCorrections) {
      // Perfect match
      return {
        isValid: true,
        verdict: 'VALID',
        originalAddress: address,
      };
    } else {
      // Has corrections
      const suggestedAddress: AddressValidationRequest = {
        street: standardizedStreet,
        apartment: address.apartment,
        city: standardizedCity,
        state: standardizedState,
        zip: standardizedZip4 ? `${standardizedZip}-${standardizedZip4}` : standardizedZip,
      };

      return {
        isValid: false,
        verdict: 'CORRECTABLE',
        suggestedAddress,
        originalAddress: address,
        message: 'We found a standardized version of your address. Please review.',
      };
    }
  } catch (error) {
    console.error('Smarty address validation error:', error);
    return {
      isValid: true,
      verdict: 'ERROR',
      originalAddress: address,
      message: 'Address validation service unavailable. Proceeding without validation.',
    };
  }
}

