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
import { CardReminderEmailProps } from '../types';

export function CardReminderEmail({ user, order, occasionDate, daysUntilOccasion }: CardReminderEmailProps) {
  const firstName = user.firstName || 'there';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>Reminder: Card needs your message!</Heading>
            
            <Text style={paragraph}>
              Hi {firstName},
            </Text>
            
            <Text style={urgentText}>
              {order.recipientFirstName}'s {order.occasionType} is in {daysUntilOccasion} days ({occasionDate})!
            </Text>
            
            <Text style={paragraph}>
              Your card should have arrived by now. If you haven't already, now's the perfect time to:
            </Text>
            
            <Text style={listItem}>
              * Write your personal message inside
            </Text>
            <Text style={listItem}>
              * Seal it up (it's already stamped!)
            </Text>
            <Text style={listItem}>
              * Drop it in the mail 📮
            </Text>
            
            <Section style={recipientBox}>
              <Text style={recipientLabel}>Sending to:</Text>
              <Text style={recipientText}>
                {order.recipientFirstName} {order.recipientLastName}<br />
                {order.recipientStreet}
                {order.recipientApartment && `, ${order.recipientApartment}`}<br />
                {order.recipientCity}, {order.recipientState} {order.recipientZip}
              </Text>
            </Section>
            
            {order.occasionNotes && (
              <Section style={notesBox}>
                <Text style={notesLabel}>Your notes:</Text>
                <Text style={notesText}>{order.occasionNotes}</Text>
              </Section>
            )}
            
            <Button style={button} href={`${process.env.BASE_URL}/dashboard/orders`}>
              View Order Details
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

const urgentText = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: 'bold',
  lineHeight: '28px',
  textAlign: 'center' as const,
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
};

const listItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '8px',
  paddingLeft: '8px',
};

const recipientBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const recipientLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  marginBottom: '8px',
};

const recipientText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
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

// Default export for React Email preview with sample data
export default function CardReminderEmailPreview() {
  return (
    <CardReminderEmail
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
      order={{
        id: 1,
        userId: 1,
        teamId: 1,
        recipientId: 1,
        recipientFirstName: 'Mom',
        recipientLastName: 'Johnson',
        recipientCity: 'San Francisco',
        recipientState: 'CA',
        recipientStreet: '123 Main St',
        recipientApartment: null,
        recipientZip: '94102',
        returnName: 'Sarah Johnson',
        returnStreet: '456 Oak Ave',
        returnApartment: null,
        returnCity: 'Seattle',
        returnState: 'WA',
        returnZip: '98101',
        occasionId: 1,
        occasionType: 'Birthday',
        occasionDate: new Date('2025-12-15'),
        occasionNotes: 'Don\'t forget to mention the family reunion!',
        cardType: 'subscription',
        status: 'pending',
        printDate: null,
        mailDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }}
      occasionDate="December 15, 2025"
      daysUntilOccasion={7}
    />
  );
}
