import { Ticket } from '@/src/types/ticket';

/**
 * Sends ticket data to the Power Automate HTTP webhook URL.
 */
export async function sendToPowerAutomate(ticket: Ticket) {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('POWER_AUTOMATE_WEBHOOK_URL is not set. Skipping webhook call.');
    return;
  }

  try {
    const payload = {
      callerName: ticket.callerName,
      companyName: ticket.companyName,
      ticketNumber: ticket.ticketNumber,
      callbackNumber: ticket.callbackNumber,
      isIssueResolved: ticket.isIssueResolved,
      computerName: ticket.computerName,
      incidentTitle: ticket.incidentTitle,
      vipCaller: ticket.vipCaller,
      nextAction: ticket.nextAction,
      incidentSummary: ticket.incidentSummary,
      createdAt: ticket.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      status: ticket.status,
      source: ticket.source,
      conversationId: ticket.conversationId,
      callSid: ticket.callSid,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Power Automate Webhook failed: ${response.status} ${errorText}`);
    } else {
      console.log('Successfully sent ticket to Power Automate');
    }
  } catch (error) {
    console.error('Error calling Power Automate Webhook:', error);
  }
}
