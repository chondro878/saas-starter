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
import { OrderCreatedEmailProps } from '../types';

export function OrderCreatedEmail({ user, order, occasionDate, daysUntilOccasion }: OrderCreatedEmailProps) {
  const firstName = user.firstName || 'there';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>Your card is being prepared! 💌</Heading>
            
            <Text style={paragraph}>
              Hi {firstName},
            </Text>
            
            <Text style={paragraph}>
              Great news! We're preparing a <strong>{order.occasionType}</strong> card for{' '}
              <strong>{order.recipientFirstName} {order.recipientLastName}</strong>.
            </Text>
            
            <Section style={detailsBox}>
              <Text style={detailItem}>
                <strong>Occasion:</strong> {order.occasionType}
              </Text>
              <Text style={detailItem}>
                <strong>Date:</strong> {occasionDate}
              </Text>
              <Text style={detailItem}>
                <strong>Days until occasion:</strong> {daysUntilOccasion} days
              </Text>
              <Text style={detailItem}>
                <strong>Recipient:</strong> {order.recipientFirstName} {order.recipientLastName}
              </Text>
              <Text style={detailItem}>
                <strong>Shipping to:</strong> {order.recipientCity}, {order.recipientState}
              </Text>
            </Section>
            
            <Text style={paragraph}>
              Your card will arrive at your address soon, pre-stamped and ready to write. You'll have plenty of time 
              to add your personal message before the big day!
            </Text>
            
            {order.occasionNotes && (
              <Section style={notesBox}>
                <Text style={notesLabel}>Your notes:</Text>
                <Text style={notesText}>{order.occasionNotes}</Text>
              </Section>
            )}
            
            <Button style={button} href={`${process.env.BASE_URL}/dashboard/orders`}>
              View All Orders
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

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
};

const detailItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '8px',
};

const notesBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '4px',
  padding: '16px',
  marginBottom: '24px',
};

const notesLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const notesText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '20px',
  fontStyle: 'italic',
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

