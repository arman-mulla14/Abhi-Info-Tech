const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Contact / inquiry endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required.',
    });
  }

  try {
    // Configure transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Abhi Info Tech Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject: `New Inquiry from ${name}`,
      text: `
New inquiry received from the website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}

Message:
${message}
      `.trim(),
      html: `
        <h2>New Inquiry from Abhi Info Tech Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'Your inquiry has been sent successfully. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      error: 'There was a problem sending your inquiry. Please try again later.',
    });
  }
});

// Fallback to index.html for root
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Abhi Info Tech website running at http://localhost:${PORT}`);
});


