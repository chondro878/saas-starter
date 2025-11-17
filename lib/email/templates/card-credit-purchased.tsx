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
import { CardCreditPurchasedEmailProps } from '../types';

export function CardCreditPurchasedEmail({ user, creditsAdded, totalCredits }: CardCreditPurchasedEmailProps) {
  const firstName = user.firstName || 'there';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>Thank you for your purchase! 🎉</Heading>
            
            <Text style={paragraph}>
              Hi {firstName},
            </Text>
            
            <Text style={paragraph}>
              Your payment was successful! We've added <strong>{creditsAdded} card credit{creditsAdded > 1 ? 's' : ''}</strong> to your account.
            </Text>
            
            <Section style={creditsBox}>
              <Text style={creditsLabel}>Your balance:</Text>
              <Text style={creditsAmount}>{totalCredits} card{totalCredits !== 1 ? 's' : ''}</Text>
            </Section>
            
            <Text style={paragraph}>
              These credits will be automatically used for any additional cards beyond your subscription limit. 
              They never expire!
            </Text>
            
            <Button style={button} href={`${process.env.BASE_URL}/create-reminder`}>
              Add New Recipient
            </Button>
            
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

const creditsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  border: '2px solid #86efac',
};

const creditsLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  marginBottom: '8px',
};

const creditsAmount = {
  color: '#16a34a',
  fontSize: '32px',
  fontWeight: 'bold',
  lineHeight: '40px',
};

const button = {
  backgroundColor: '#111827',
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

