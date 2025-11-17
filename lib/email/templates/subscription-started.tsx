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
import { SubscriptionStartedEmailProps } from '../types';

export function SubscriptionStartedEmail({ user, planName, cardLimit }: SubscriptionStartedEmailProps) {
  const firstName = user.firstName || 'there';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>Welcome to {planName}! 🎉</Heading>
            
            <Text style={paragraph}>
              Hi {firstName},
            </Text>
            
            <Text style={paragraph}>
              Your subscription is now active! You're all set to never miss another special occasion.
            </Text>
            
            <Section style={detailsBox}>
              <Text style={detailItem}>
                <strong>Plan:</strong> {planName}
              </Text>
              <Text style={detailItem}>
                <strong>Cards per year:</strong> {cardLimit}
              </Text>
            </Section>
            
            <Text style={paragraph}>
              <strong>What happens next?</strong>
            </Text>
            
            <Text style={listItem}>
              📝 Add recipients and their special occasions
            </Text>
            <Text style={listItem}>
              🤖 We'll automatically create orders 15 days before each occasion
            </Text>
            <Text style={listItem}>
              📬 Cards arrive at your door, pre-stamped and ready to personalize
            </Text>
            <Text style={listItem}>
              💌 Write your message and drop them in the mail!
            </Text>
            
            <Button style={button} href={`${process.env.BASE_URL}/create-reminder`}>
              Add Your First Recipient
            </Button>
            
            <Text style={paragraph}>
              Need help? Just reply to this email and we'll be happy to assist!
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

const detailsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  border: '1px solid #86efac',
};

const detailItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '8px',
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

// Default export for React Email preview with sample data
export default function SubscriptionStartedEmailPreview() {
  return (
    <SubscriptionStartedEmail
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
      planName="Stress Free"
      cardLimit={12}
    />
  );
}
