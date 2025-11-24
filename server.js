const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "/")));

let inbox = [];
let currentEmail = "";

// Helper: generate random disposable email
function generateEmail() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let local = "";
  for (let i = 0; i < 8; i++) {
    local += chars[Math.floor(Math.random() * chars.length)];
  }
  currentEmail = local + "@mailzap.test";
  return currentEmail;
}

// Endpoint: get current disposable email
app.get("/email", (req, res) => {
  if (!currentEmail) generateEmail();
  res.json({ email: currentEmail });
});

// Endpoint: get inbox messages
app.get("/inbox", (req, res) => res.json(inbox));

// Endpoint: refresh inbox
app.post("/refresh", (req, res) => {
  inbox = [];
  res.send("Inbox refreshed!");
});

// Endpoint: send test email (for testing locally or frontend)
app.post("/send-test-email", (req, res) => {
  const { from, subject, text } = req.body;
  inbox.push({
    from: from || "test@example.com",
    subject: subject || "Test email",
    text: text || "Hello!"
  });
  res.send("Test email added!");
});

// Serve index.html for frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Use dynamic port for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ MailZap running on port ${PORT}`));
