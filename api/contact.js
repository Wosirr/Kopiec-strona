export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kopiec Metal Design <onboarding@resend.dev>',
        to: ['kopiecmd@gmail.com'],
        reply_to: email,
        subject: `Nowe zapytanie od ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #B8A265;">Nowe zapytanie ze strony kopiec.eu</h2>
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Imię i nazwisko</td><td style="padding: 8px 0;"><strong>${name}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><strong>${email}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Telefon</td><td style="padding: 8px 0;"><strong>${phone || '—'}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Usługa</td><td style="padding: 8px 0;"><strong>${service || '—'}</strong></td></tr>
            </table>
            <h3 style="color: #666; margin-top: 24px;">Opis projektu</h3>
            <p style="background: #f5f5f5; padding: 16px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.message || 'Send failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
