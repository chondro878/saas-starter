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
import { WelcomeEmailProps } from '../types';

export function WelcomeEmail({ user }: WelcomeEmailProps) {
  const firstName = user.firstName || 'there';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>Welcome to Avoid the Rain! 🎉</Heading>
            
            <Text style={paragraph}>
              Hi {firstName},
            </Text>
            
            <Text style={paragraph}>
              We're thrilled to have you join us! You've taken the first step toward never missing another special occasion.
            </Text>
            
            <Text style={paragraph}>
              <strong>What's next?</strong>
            </Text>
            
            <Text style={listItem}>
              📝 Add your first recipient and their special occasions
            </Text>
            <Text style={listItem}>
              Choose a subscription plan that fits your needs
            </Text>
            <Text style={listItem}>
              We'll handle the rest - beautiful cards delivered right to your door!
            </Text>
            
            <Button style={button} href={`${process.env.BASE_URL}/create-reminder`}>
              Add Your First Recipient
            </Button>
            
            <Text style={paragraph}>
              Questions? Just reply to this email - we're here to help!
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

const listItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '8px',
  paddingLeft: '8px',
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

