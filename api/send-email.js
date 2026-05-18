export const config = { runtime: 'edge' };

const FROM = 'CNA Roma <onboarding@resend.dev>'; // account prova Resend

export default async function handler(req) {
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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY non configurata' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Body non valido' }), { status: 400 });
  }

  const { type } = body;

  // -------------------------------------------------------
  // TIPO: send_link  — invio link firma al cliente (dashboard)
  // -------------------------------------------------------
  if (type === 'send_link' || !type) {
    const { to, subject, html, text } = body;
    if (!to || !subject || !html) {
      return respond(400, { error: 'Campi obbligatori: to, subject, html' });
    }
    const result = await sendEmail({ to, subject, html, text });
    return respond(result.ok ? 200 : result.status, result.data);
  }

  // -------------------------------------------------------
  // TIPO: post_firma  — 3 email automatiche dopo firma cliente
  // Payload atteso:
  //   { type: 'post_firma', contratto: {...}, operatoreEmail: '...', pdfBase64: '...', docFronte: '...', docRetro: '...' }
  // -------------------------------------------------------
  if (type === 'post_firma') {
    const { contratto, operatoreEmail, pdfBase64, docFronte, docRetro } = body;
    if (!contratto) return respond(400, { error: 'contratto mancante' });

    const cognome = contratto.cognome || '';
    const nome = contratto.nome || '';
    const nomeCompleto = `${cognome} ${nome}`.trim();
    const emailCliente = contratto.email || '';
    const firmato_at = contratto.firmato_at
      ? new Date(contratto.firmato_at).toLocaleDateString('it-IT')
      : new Date().toLocaleDateString('it-IT');

    const results = [];

    // --- 1. Email al cliente ---
    if (emailCliente) {
      const htmlCliente = `
<div style="font-family:Arial,sans-serif;font-size:10pt;color:#000;line-height:1.6">
  <p>Gentile ${nomeCompleto},</p>
  <p>La ringraziamo per aver completato la firma del contratto di adesione a <strong>CNA Roma</strong>.</p>
  <p>La sua adesione è stata registrata con successo in data <strong>${firmato_at}</strong>.</p>
  <p>Per qualsiasi informazione può contattarci:</p>
  <ul style="font-size:9.5pt">
    <li>📞 Tel: 06/570151</li>
    <li>✉️ Email: <a href="mailto:info@cnaroma.it" style="color:#005CA9">info@cnaroma.it</a></li>
    <li>🌐 <a href="http://cnaroma.it" style="color:#005CA9">cnaroma.it</a></li>
  </ul>
  <p>Cordiali saluti,<br><strong style="color:#005CA9">CNA Roma</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
  <img src="https://festivaldellelibrerie.it/wp-content/uploads/2024/11/logo-cna-colore.svg" alt="CNA Roma" style="height:45px;width:auto;display:block;margin-bottom:6px">
  <span style="font-size:9pt;color:#888">Via Cristoforo Colombo 283A – 00147 – Roma</span>
</div>`;
      const r1 = await sendEmail({
        to: emailCliente,
        subject: 'Conferma adesione CNA Roma',
        html: htmlCliente,
        text: `Gentile ${nomeCompleto}, la ringraziamo per aver firmato il contratto CNA Roma in data ${firmato_at}. Per info: 06/570151 | info@cnaroma.it`,
      });
      results.push({ dest: 'cliente', ok: r1.ok });
    }

    // --- 2. Email all'operatore ---
    if (operatoreEmail) {
      const htmlOperatore = `
<div style="font-family:Arial,sans-serif;font-size:10pt;color:#000;line-height:1.6">
  <p>Ciao,</p>
  <p>Il cliente <strong>${nomeCompleto}</strong> ha firmato il contratto di adesione CNA Roma.</p>
  <table style="border-collapse:collapse;font-size:9.5pt;margin:12px 0">
    <tr><td style="padding:3px 12px 3px 0;color:#555">Data firma:</td><td><strong>${firmato_at}</strong></td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Email cliente:</td><td>${emailCliente || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">P.IVA:</td><td>${contratto.partita_iva || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Ragione sociale:</td><td>${contratto.ragione_sociale || '—'}</td></tr>
  </table>
  <p>Accedi alla <a href="https://cnacontratti.vercel.app" style="color:#005CA9">dashboard</a> per scaricare il PDF firmato.</p>
  <p>CNA Roma – Sistema Contratti</p>
</div>`;
      const r2 = await sendEmail({
        to: operatoreEmail,
        subject: `✅ ${nomeCompleto} ha firmato il contratto`,
        html: htmlOperatore,
        text: `${nomeCompleto} ha firmato il contratto il ${firmato_at}. Accedi alla dashboard: https://cnacontratti.vercel.app`,
      });
      results.push({ dest: 'operatore', ok: r2.ok });
    }

    // --- 3. Email a parrelli@cnaroma.it con PDF + documenti allegati ---
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `CNA_${cognome}_${nome}_firmato.pdf`,
        content: pdfBase64,
        content_type: 'application/pdf',
      });
    }
    if (docFronte) {
      attachments.push({
        filename: `${cognome}_${nome}_doc_fronte.jpg`,
        content: docFronte.replace(/^data:image\/\w+;base64,/, ''),
        content_type: 'image/jpeg',
      });
    }
    if (docRetro) {
      attachments.push({
        filename: `${cognome}_${nome}_doc_retro.jpg`,
        content: docRetro.replace(/^data:image\/\w+;base64,/, ''),
        content_type: 'image/jpeg',
      });
    }

    const htmlAdmin = `
<div style="font-family:Arial,sans-serif;font-size:10pt;color:#000;line-height:1.6">
  <p>Nuovo contratto firmato:</p>
  <table style="border-collapse:collapse;font-size:9.5pt;margin:12px 0">
    <tr><td style="padding:3px 12px 3px 0;color:#555">Cliente:</td><td><strong>${nomeCompleto}</strong></td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">CF:</td><td>${contratto.codice_fiscale || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">P.IVA:</td><td>${contratto.partita_iva || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Ragione sociale:</td><td>${contratto.ragione_sociale || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Email cliente:</td><td>${emailCliente || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Raccolto da:</td><td>${contratto.raccolta_da || '—'}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Data firma:</td><td><strong>${firmato_at}</strong></td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#555">Allegati:</td><td>${attachments.map(a=>a.filename).join(', ') || 'nessuno'}</td></tr>
  </table>
  <p style="font-size:9pt;color:#888">Email automatica – CNA Roma Sistema Contratti</p>
</div>`;

    const r3 = await sendEmail({
      to: 'parrelli@cnaroma.it',
      subject: `📄 Contratto firmato: ${nomeCompleto} – ${firmato_at}`,
      html: htmlAdmin,
      text: `Contratto firmato: ${nomeCompleto} il ${firmato_at}`,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    results.push({ dest: 'admin', ok: r3.ok, error: r3.data?.message });

    return respond(200, { success: true, results });
  }

  return respond(400, { error: 'type non riconosciuto' });

  // --- helpers ---
  async function sendEmail({ to, subject, html, text, attachments }) {
    const payload = { from: FROM, to: [to], subject, html };
    if (text) payload.text = text;
    if (attachments) payload.attachments = attachments;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }

  function respond(status, data) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
