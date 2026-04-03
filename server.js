const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.json') || path === 'manifest.json' || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (path === 'manifest.json') {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
    if (path.endsWith('sw.js')) {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/graph', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Productivity', 'index.html'));
});
// --- DATABASE SCHEMA ---
const passwordEntrySchema = new mongoose.Schema({
  encrypted: { type: String, required: true },
  lockDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  window: {
    start: { type: String, default: "20:00" },
    end: { type: String, default: "21:00" }
  }
});

const vaultSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  passwords: [passwordEntrySchema],
  dailyFocus: { type: String, default: "" }
}, { timestamps: true });

const Vault = mongoose.model('Vault', vaultSchema);

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vault_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ [DATABASE]: Connection Established. Vault Protocol Online.'))
  .catch(err => console.error('❌ [DATABASE]: Critical Connection Error:', err));

// --- API ROUTES ---

// 1. Fetch Vault Data
app.get('/api/vault/:userId', async (req, res) => {
  try {
    const vault = await Vault.findOne({ userId: req.params.userId });
    // If no vault exists yet, return an empty template
    if (!vault) {
      return res.json({ passwords: [], dailyFocus: '' });
    }
    res.json(vault);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve vault data." });
  }
});

// 2. Add New Password (The "Seal" Protocol)
app.post('/api/vault/:userId/add', async (req, res) => {
  try {
    const { encrypted, days, window } = req.body;

    // Calculate expiry on the server for security
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + parseInt(days));

    console.log(`\n🔐 [LOG]: INCOMING SEAL REQUEST`);
    console.log(`👤 User: ${req.params.userId}`);
    console.log(`⏳ Locking for: ${days} days (Expires: ${expiry.toLocaleDateString()})`);
    console.log(`🕒 Window: ${window.start} - ${window.end}`);
    console.log(`-------------------------------------------`);

    const newEntry = {
      encrypted,
      endDate: expiry,
      window
    };

    const vault = await Vault.findOneAndUpdate(
      { userId: req.params.userId },
      { $push: { passwords: newEntry } },
      { upsert: true, new: true }
    );

    console.log(`✅ [DATABASE]: Password successfully stored in DB.`);
    res.json(vault);
  } catch (err) {
    console.error('❌ [ERROR]: Storage failed:', err.message);
    res.status(500).json({ error: "Protocol failed to seal data." });
  }
});

// 3. Update Daily Focus
app.patch('/api/vault/:userId/focus', async (req, res) => {
  try {
    const { dailyFocus } = req.body;
    const vault = await Vault.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { dailyFocus } },
      { upsert: true, new: true }
    );
    res.json(vault);
  } catch (err) {
    res.status(500).json({ error: "Focus update failed." });
  }
});

// 4. Server Time Endpoint (Fixes worldtimeapi errors)
app.get('/api/time', (req, res) => {
  res.json({ datetime: new Date().toISOString() });
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 ELITE VAULT PROTOCOL ACTIVE
  ------------------------------
  Port: ${PORT}
  Status: Listening for Encrypted Payloads
  ------------------------------
  `);
});