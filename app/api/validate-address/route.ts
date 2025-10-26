import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '@/lib/address-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { street, apartment, city, state, zip } = body;

    if (!street || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'Missing required address fields' },
        { status: 400 }
      );
    }

    const result = await validateAddress({
      street,
      apartment,
      city,
      state,
      zip,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Address validation API error:', error);
    return NextResponse.json(
      { error: 'Address validation failed' },
      { status: 500 }
    );
  }
}

