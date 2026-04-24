
const testData = {
  caller_name: "Test Caller",
  company_name: "Test Company",
  callback_number: "+8801712345678",
  ticket_number: "",
  computer_name: "TEST-PC-01",
  incident_title: "PC Running Slow",
  incident_summary: "Caller reported that the computer is running slow.",
  vip_caller: false,
  next_action: "escalate",
  is_issue_resolved: false,
  source: "elevenlabs_voice_agent",
  conversation_id: "test-conversation-001",
  call_sid: "test-call-001"
};

async function runTest() {
  try {
    const response = await fetch('http://localhost:3000/api/helpdesk/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
