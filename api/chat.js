export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ reply: 'שירות הצ׳אט אינו מוגדר כרגע. פנו למארגני הטיול.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: `אתה מדריך טיולים מומחה לגאורגיה (המדינה). עונה תמיד בעברית בלבד. תשובות קצרות, ברורות ומועילות (2-4 משפטים).
אתה מסייע לזוגות ישראלים שנמצאים בגאורגיה בטיול ג׳יפים ב-יוני 2026. המסלול: טביליסי → דשבאשי → בורג׳ומי → קוטאיסי → מרטבילי → בטומי.
נושאים: מסעדות, כבישים, אטרקציות, בטיחות, כסף, תחבורה, מזג אוויר, קניות, לינה.
אם שואלים שאלה שאינה קשורה לגאורגיה, הסבר בנועם שאתה מתמקד בגאורגיה בלבד.`,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error('API error: ' + response.status);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'לא הצלחתי לקבל תשובה.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ reply: 'שגיאה זמנית. אנא נסה שוב.' });
  }
}
