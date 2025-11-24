const express = require("express");
const bodyParser = require("body-parser");
const Mailin = require("mailin");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "/")));

let inbox = [];

// Start Mailin (local email receiver)
Mailin.start({
  smtpOptions: { host: "0.0.0.0", port: 2525 }, // 2525 for local testing
  disableWebhookValidation: true
});

Mailin.on("message", (connection, data, content) => {
  inbox.push({
    from: data.from.text,
    to: data.to.text,
    subject: data.subject,
    text: data.text
  });
  console.log("✅ Email received:", data.subject);
});

// Endpoint for inbox
app.get("/inbox", (req, res) => res.json(inbox));

// Endpoint to refresh/clear inbox
app.post("/refresh", (req, res) => {
  inbox = [];
  res.send("Inbox refreshed!");
});

// Optional: test email route for local testing
app.post("/send-test-email", (req, res) => {
  const { from, subject, text } = req.body;
  inbox.push({ from: from || "test@example.com", subject: subject || "Test email", text: text || "Hello!" });
  res.send("Test email added!");
});

// Serve index.html on /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => console.log("✅ MailZap running on http://localhost:3000"));
