import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
} from '@react-email/components';
import { MissingAddressEmailProps } from '../types';

export function MissingAddressEmail({ user, recipientName, occasionType, occasionDate }: MissingAddressEmailProps) {
  const firstName = user.firstName || 'there';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>⚠️ Action Required: Missing Address</Heading>
            
            <Text style={paragraph}>
              Hi {firstName},
            </Text>
            
            <Text style={urgentText}>
              We couldn't create an order for {recipientName}'s {occasionType} on {occasionDate} because 
              you don't have a default card delivery address set up.
            </Text>
            
            <Text style={paragraph}>
              To ensure you receive cards for all your upcoming occasions, please add a default address to your account.
            </Text>
            
            <Text style={paragraph}>
              <strong>Why we need this:</strong>
            </Text>
            
            <Text style={listItem}>
              📬 Cards are delivered to your address (pre-stamped and ready to send)
            </Text>
            <Text style={listItem}>
              ✍️ You personalize them with your handwritten message
            </Text>
            <Text style={listItem}>
              💌 Then you mail them to your recipients
            </Text>
            
            <Button style={button} href={`${process.env.BASE_URL}/dashboard/security`}>
              Add Default Address
            </Button>
            
            <Text style={paragraph}>
              Once you've added your address, we'll automatically create the order for this occasion!
            </Text>
            
            <Text style={footer}>
              The Avoid the Rain Team 💌
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '16px',
};

const urgentText = {
  color: '#dc2626',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  border: '2px solid #fca5a5',
};

const listItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '8px',
  paddingLeft: '8px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '24px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

// Default export for React Email preview with sample data
export default function MissingAddressEmailPreview() {
  return (
    <MissingAddressEmail
      user={{
        id: 1,
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        passwordHash: '',
        role: 'owner',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        phone: null,
      }}
      recipientName="Mom"
      occasionType="Birthday"
      occasionDate="December 15, 2025"
    />
  );
}
