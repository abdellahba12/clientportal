// Uses Resend API via HTTP - works on Railway
async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('No RESEND_API_KEY set, skipping email');
      return;
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ClientPortal <onboarding@resend.dev>',
        to,
        subject,
        html
      })
    });
    const data = await response.json();
    if (data.error) {
      console.error('Resend error:', data.error);
    } else {
      console.log('Email sent via Resend:', data.id);
    }
  } catch (err) {
    console.error('EMAIL ERROR:', err.message);
  }
}

module.exports = { sendEmail };
