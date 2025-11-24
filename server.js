const express = require("express");
const bodyParser = require("body-parser");
const { simpleParser } = require("mailparser");
const shortid = require("shortid");
const fs = require("fs-extra");
const path = require("path");
const { Resend } = require("resend");

// ⚡ Hardcoded Resend API key
const resend = new Resend("re_55p1E4T6_5HfzbmeVQ5Z8HPD7p6nDsA4g");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const MAILBOX_FILE = path.join("./", "mailboxes.json");
let mailboxes = fs.existsSync(MAILBOX_FILE) ? fs.readJsonSync(MAILBOX_FILE) : {};
const saveMailboxes = () => fs.writeJsonSync(MAILBOX_FILE, mailboxes, { spaces: 2 });

// ------------------ Generate Shortcode Email ------------------
app.get("/generate", (req, res) => {
  const id = shortid.generate(); // unique shortcode
  const email = `${id}@mz.xyz`;  // replace with your domain
  mailboxes[email] = [];
  saveMailboxes();
  res.send({ email });
});

// ------------------ Simulated email receive ------------------
app.post("/receive", async (req, res) => {
  const { to, rawEmail } = req.body;
  if (!mailboxes[to]) return res.status(404).send("Mailbox not found");

  const parsed = await simpleParser(rawEmail);
  mailboxes[to].push({
    from: parsed.from.text,
    subject: parsed.subject,
    text: parsed.text,
    date: new Date(),
  });
  saveMailboxes();
  res.send("Email received!");
});

// ------------------ Real emails from Resend ------------------
app.post("/real-email", bodyParser.json(), (req, res) => {
  const email = req.body;

  const to = email.to[0].email;
  if (!mailboxes[to]) mailboxes[to] = [];

  mailboxes[to].push({
    from: email.from[0].email,
    subject: email.subject,
    text: email.text,
    date: new Date(),
  });

  saveMailboxes();
  console.log("📩 Received real email:", email.subject);
  res.send({ success: true });
});

// ------------------ View Inbox ------------------
app.get("/inbox/:email", (req, res) => {
  const email = req.params.email;
  if (!mailboxes[email]) return res.status(404).send("Mailbox not found");
  res.send(mailboxes[email]);
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MZ running on port ${PORT}`));
