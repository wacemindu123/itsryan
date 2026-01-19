const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./submissions.db');

// Configure nodemailer transporter
// Note: You'll need to configure this with your actual email service
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Your Calendly link
const CALENDLY_LINK = process.env.CALENDLY_LINK || 'https://calendly.com/ryansmallbussinessdoctor/15min';

// Create submissions table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    business TEXT NOT NULL,
    scaling_challenge TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API endpoint to handle form submission
app.post('/api/submit', (req, res) => {
  const { name, email, business, 'scaling-challenge': scalingChallenge } = req.body;

  if (!name || !email || !business || !scalingChallenge) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    `INSERT INTO submissions (name, email, business, scaling_challenge) VALUES (?, ?, ?, ?)`,
    [name, email, business, scalingChallenge],
    function(err) {
      if (err) {
        console.error('Error inserting submission:', err);
        return res.status(500).json({ error: 'Failed to save submission' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// API endpoint to get all submissions (for admin page)
app.get('/api/submissions', (req, res) => {
  db.all(`SELECT * FROM submissions ORDER BY submitted_at DESC`, (err, rows) => {
    if (err) {
      console.error('Error fetching submissions:', err);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
    res.json(rows);
  });
});

// API endpoint to send Calendly email
app.post('/api/send-calendly', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Schedule Your Free Tech Consultation',
    html: `
      <h2>Hi ${name},</h2>
      <p>Thank you for your interest in scaling your business with AI and technology!</p>
      <p>I'd love to discuss how I can help you overcome the challenges you're facing.</p>
      <p>Please schedule a free consultation using the link below:</p>
      <p><a href="${CALENDLY_LINK}" style="display: inline-block; padding: 12px 24px; background-color: #0071e3; color: white; text-decoration: none; border-radius: 5px;">Schedule a Meeting</a></p>
      <p>Looking forward to speaking with you!</p>
      <p>Best regards,<br>Ryan</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Serve static files
app.use(express.static('.'));

// Serve the main website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'free-tech-services-website (1).html'));
});

// Serve the admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
