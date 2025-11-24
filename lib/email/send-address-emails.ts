import { Resend } from 'resend';
import { render } from '@react-email/render';
import AddressUrgentIssueEmail from './templates/address-urgent-issue';
import AddressCorrectedEmail from './templates/address-corrected';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendUrgentAddressIssueEmail(params: {
  userEmail: string;
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
}) {
  try {
    const dashboardLink = `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard/friendsandfamily`;
    
    const html = render(
      AddressUrgentIssueEmail({
        userName: params.userName,
        recipientName: params.recipientName,
        occasionType: params.occasionType,
        occasionDate: params.occasionDate,
        daysUntil: params.daysUntil,
        address: params.address,
        dashboardLink,
      })
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Avoid the Rain <noreply@avoidtherain.com>',
      to: params.userEmail,
      subject: `⚠️ Action Required: Verify Address for Upcoming Card`,
      html,
    });

    console.log(`[EMAIL] Sent urgent address issue email to ${params.userEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send urgent address issue email:', error);
    throw error;
  }
}

export async function sendAddressCorrectedEmail(params: {
  userEmail: string;
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
}) {
  try {
    const html = render(
      AddressCorrectedEmail({
        userName: params.userName,
        recipientName: params.recipientName,
        originalAddress: params.originalAddress,
        correctedAddress: params.correctedAddress,
      })
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Avoid the Rain <noreply@avoidtherain.com>',
      to: params.userEmail,
      subject: `✅ Address Updated for ${params.recipientName}`,
      html,
    });

    console.log(`[EMAIL] Sent address corrected email to ${params.userEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send address corrected email:', error);
    // Don't throw - this is non-critical
  }
}

