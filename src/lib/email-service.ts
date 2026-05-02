import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('RESEND_API_KEY environment variable is required for email notifications');
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

export async function sendTicketNotification(ticketData: any) {
  try {
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    if (!notificationEmail) {
      console.warn("NOTIFICATION_EMAIL not set, skipping email notification.");
      return;
    }

    const resend = getResend();
    
    const { 
      ticketNumber, 
      callerName, 
      companyName, 
      incidentTitle, 
      incidentSummary, 
      callbackNumber,
      status,
      nextAction,
      source
    } = ticketData;

    const data = await resend.emails.send({
      from: 'ClarioAI Helpdesk <notifications@resend.dev>', // If they verify a domain, they should change this
      to: [notificationEmail],
      subject: `[New Ticket] ${ticketNumber} - ${incidentTitle || 'No Title'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
          <h1 style="color: #4f46e5; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-top: 0;">New Ticket Notification</h1>
          
          <div style="margin-bottom: 24px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Ticket Number</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0; color: #4f46e5;">${ticketNumber}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: bold; width: 140px;">Caller Name</td>
              <td style="padding: 8px 0; font-size: 15px;">${callerName || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: bold;">Company</td>
              <td style="padding: 8px 0; font-size: 15px;">${companyName || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: bold;">Callback #</td>
              <td style="padding: 8px 0; font-size: 15px;">${callbackNumber || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: bold;">Status</td>
              <td style="padding: 8px 0; font-size: 15px;"><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${status || 'NEW'}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: bold;">Source</td>
              <td style="padding: 8px 0; font-size: 15px;">${source || 'Web'}</td>
            </tr>
          </table>

          <div style="margin-bottom: 24px; background: #fafafa; padding: 16px; border-radius: 8px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;">Incident Title</p>
            <p style="font-size: 16px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">${incidentTitle || 'N/A'}</p>
            
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;">Summary</p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0;">${incidentSummary || 'No summary provided.'}</p>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>Product of Remotized IT • ClarioAI Helpdesk</p>
          </div>
        </div>
      `,
    });

    console.log("Email notification sent:", data);
    return data;
  } catch (error) {
    console.error("Failed to send ticket email notification:", error);
  }
}
