import * as React from 'react';

interface AddressCorrectedEmailProps {
  userName: string;
  recipientName: string;
  originalAddress: {
    street: string;
    apartment?: string | null;
    city: string;
    state: string;
    zip: string;
  };
  correctedAddress: {
    street: string;
    apartment?: string | null;
    city: string;
    state: string;
    zip: string;
  };
}

export const AddressCorrectedEmail: React.FC<Readonly<AddressCorrectedEmailProps>> = ({
  userName,
  recipientName,
  originalAddress,
  correctedAddress,
}) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#16a34a' }}>✅ Address Updated for {recipientName}</h1>
    
    <p>Hi {userName},</p>
    
    <p>
      Good news! We verified the address for <strong>{recipientName}</strong> and made a small correction 
      to match USPS's standardized format.
    </p>
    
    <div style={{
      background: '#f3f4f6',
      borderRadius: '8px',
      padding: '16px',
      margin: '24px 0'
    }}>
      <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#6b7280' }}>
        Original:
      </p>
      <p style={{ margin: '0 0 20px 0', fontFamily: 'monospace', fontSize: '14px' }}>
        {originalAddress.street}
        {originalAddress.apartment && <>, {originalAddress.apartment}</>}
        <br />
        {originalAddress.city}, {originalAddress.state} {originalAddress.zip}
      </p>
      
      <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#16a34a' }}>
        Updated to:
      </p>
      <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
        {correctedAddress.street}
        {correctedAddress.apartment && <>, {correctedAddress.apartment}</>}
        <br />
        {correctedAddress.city}, {correctedAddress.state} {correctedAddress.zip}
      </p>
    </div>
    
    <p>
      Your card will ship on time — <strong>no action needed!</strong>
    </p>
    
    <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '32px' }}>
      This standardization helps ensure successful delivery by the postal service.
    </p>
    
    <p>Thanks!</p>
    <p style={{ fontWeight: 'bold' }}>The Avoid the Rain Team</p>
  </div>
);

export default AddressCorrectedEmail;

