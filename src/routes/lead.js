const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const router = express.Router();

async function sendLeadEmail({ name, contact, message, timestamp, sessionId }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.HOSTINGER_EMAIL,
      pass: process.env.HOSTINGER_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.HOSTINGER_EMAIL,
    to: 'support@thekuacompany.com',
    subject: `New Corporate Gifting Lead — ${name}`,
    text: `Name: ${name}\nContact: ${contact}\nTime: ${timestamp}\nMessage: ${message}\nSession: ${sessionId || 'unknown'}`,
  });
}

async function sendLeadWhatsApp({ name, contact, timestamp, sessionId }) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: process.env.TWILIO_WHATSAPP_TO,
    body: `New corporate gifting lead from TTC chatbot. Name: ${name}. Contact: ${contact}. Time: ${timestamp}. Session: ${sessionId || 'unknown'}`,
  });
}

router.post('/', async (req, res) => {
  const { name, contact, message, sessionId } = req.body;

  if (typeof name !== 'string' || name.trim() === '' || typeof contact !== 'string' || contact.trim() === '') {
    return res.status(400).json({ error: 'name and contact are required and must be non-empty strings' });
  }

  const leadDetails = {
    name: name.trim(),
    contact: contact.trim(),
    message: typeof message === 'string' && message.trim() !== '' ? message.trim() : 'Corporate gifting inquiry via chatbot',
    timestamp: new Date().toISOString(),
    sessionId: typeof sessionId === 'string' ? sessionId : undefined,
  };

  try {
    await Promise.all([sendLeadEmail(leadDetails), sendLeadWhatsApp(leadDetails)]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending lead notification:', error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
