import * as React from 'react';

interface AddressUrgentIssueEmailProps {
  userName: string;
  recipientName: string;
  occasionType: string;
  occasionDate: string;
  daysUntil: number;
  address: {
    street: string;
    apartment?: string | null;
    city: string;
    state: string;
    zip: string;
  };
  dashboardLink: string;
}

export const AddressUrgentIssueEmail: React.FC<Readonly<AddressUrgentIssueEmailProps>> = ({
  userName,
  recipientName,
  occasionType,
  occasionDate,
  daysUntil,
  address,
  dashboardLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#dc2626' }}>⚠️ Action Required: Verify Address</h1>
    
    <p>Hi {userName},</p>
    
    <p>
      You just added a reminder for <strong>{recipientName}'s {occasionType}</strong> on <strong>{occasionDate}</strong> 
      {' '}— that's only <strong>{daysUntil} day{daysUntil !== 1 ? 's' : ''} away</strong>!
    </p>
    
    <div style={{
      background: '#fef2f2',
      border: '2px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      margin: '24px 0'
    }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
        We tried to verify the shipping address but ran into an issue:
      </p>
      <p style={{ margin: '0', fontFamily: 'monospace', fontSize: '14px' }}>
        {address.street}
        {address.apartment && <>, {address.apartment}</>}
        <br />
        {address.city}, {address.state} {address.zip}
      </p>
    </div>
    
    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
      Please update the address in your dashboard ASAP so we can ship on time:
    </p>
    
    <div style={{ textAlign: 'center', margin: '32px 0' }}>
      <a 
        href={dashboardLink}
        style={{
          background: '#dc2626',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-block',
          fontWeight: 'bold'
        }}
      >
        Fix Address Now
      </a>
    </div>
    
    <p style={{ color: '#6b7280', fontSize: '14px' }}>
      If you don't update the address, we won't be able to send this card on time.
    </p>
    
    <p>Thanks!</p>
    <p style={{ fontWeight: 'bold' }}>The Avoid the Rain Team</p>
  </div>
);

export default AddressUrgentIssueEmail;

