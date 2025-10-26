// Google Address Validation API integration

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
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('Google Maps API key not configured');
    return {
      isValid: true,
      verdict: 'VALID',
      originalAddress: address,
      message: 'Address validation unavailable',
    };
  }

  try {
    const response = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            regionCode: 'US',
            locality: address.city,
            administrativeArea: address.state,
            postalCode: address.zip,
            addressLines: [
              address.apartment
                ? `${address.street}, ${address.apartment}`
                : address.street,
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Address validation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.result;

    // Parse the verdict
    const deliverability = result.verdict?.addressComplete;
    const hasInferredComponents = result.address?.addressComponents?.some(
      (c: any) => c.confirmationLevel === 'UNCONFIRMED_BUT_PLAUSIBLE'
    );
    const hasUnconfirmedComponents = result.address?.addressComponents?.some(
      (c: any) => c.confirmationLevel === 'UNCONFIRMED_AND_SUSPICIOUS'
    );

    // Determine verdict
    let verdict: AddressValidationResponse['verdict'] = 'VALID';
    let isValid = true;

    if (hasUnconfirmedComponents || !deliverability) {
      verdict = 'UNDELIVERABLE';
      isValid = false;
    } else if (hasInferredComponents) {
      verdict = 'CORRECTABLE';
      isValid = false;
    }

    // Extract suggested address if available
    let suggestedAddress: AddressValidationRequest | undefined;
    
    if (result.address && (verdict === 'CORRECTABLE' || verdict === 'VALID')) {
      const formattedAddress = result.address.formattedAddress || '';
      const components = result.address.addressComponents || [];
      
      // Extract components
      const streetNumber = components.find((c: any) =>
        c.componentType === 'street_number'
      )?.componentName?.text || '';
      
      const route = components.find((c: any) =>
        c.componentType === 'route'
      )?.componentName?.text || '';
      
      const locality = components.find((c: any) =>
        c.componentType === 'locality'
      )?.componentName?.text || address.city;
      
      const adminArea = components.find((c: any) =>
        c.componentType === 'administrative_area_level_1'
      )?.componentName?.text || address.state;
      
      const postalCode = components.find((c: any) =>
        c.componentType === 'postal_code'
      )?.componentName?.text || address.zip;
      
      const subpremise = components.find((c: any) =>
        c.componentType === 'subpremise'
      )?.componentName?.text || address.apartment || '';

      suggestedAddress = {
        street: `${streetNumber} ${route}`.trim() || address.street,
        apartment: subpremise,
        city: locality,
        state: adminArea,
        zip: postalCode,
      };
    }

    return {
      isValid,
      verdict,
      suggestedAddress,
      originalAddress: address,
      message:
        verdict === 'UNDELIVERABLE'
          ? 'This address cannot be verified. Please check and try again.'
          : verdict === 'CORRECTABLE'
          ? 'We found a similar address. Please review the suggestion.'
          : undefined,
    };
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      isValid: true,
      verdict: 'ERROR',
      originalAddress: address,
      message: 'Address validation service unavailable. Proceeding without validation.',
    };
  }
}

