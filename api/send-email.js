export const config = { runtime: 'edge' };

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY non configurata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Body non valido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { to, subject, html, text } = body;

  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ error: 'Campi obbligatori mancanti: to, subject, html' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Chiamata a Resend API
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CNA Roma <noreply@cnaroma.it>',
      to: [to],
      subject,
      html,
      text: text || '',
    }),
  });

  const resendData = await resendRes.json();

  if (!resendRes.ok) {
    console.error('Resend error:', resendData);
    return new Response(JSON.stringify({ error: resendData.message || 'Errore invio email' }), {
      status: resendRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return new Response(JSON.stringify({ success: true, id: resendData.id }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
