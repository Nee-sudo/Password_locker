const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

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
  res.sendFile(__dirname + '/public/graph.html');
});


// --- DATABASE SCHEMA (UPDATED) ---
const passwordEntrySchema = new mongoose.Schema({
  encrypted: { type: String, required: true },

  lockDate: { type: Date, default: Date.now },

  endDate: { type: Date, required: true },

  // 🔥 REAL TIME WINDOW (HH:MM format from frontend)
  window: {
    start: { type: String, required: true }, // e.g. "10:04"
    end: { type: String, required: true }    // e.g. "10:05"
  },

  // 🔥 NEW: discipline tracking
  attempts: [
    {
      time: { type: Date, default: Date.now },
      success: Boolean
    }
  ],

  score: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  penalty: { type: Number, default: 0 }

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
  .then(() => console.log('✅ [DATABASE]: Connected'))
  .catch(err => console.error('❌ DB Error:', err));


// IST Helper
const getISTTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

// --- API ROUTES ---

// 1. Fetch Vault Data
app.get('/api/vault/:userId', async (req, res) => {
  try {
    const vault = await Vault.findOne({ userId: req.params.userId });
    if (!vault) {
      return res.json({ passwords: [], dailyFocus: '' });
    }
    res.json(vault);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});


// 2. Add Password (UPDATED)
app.post('/api/vault/:userId/add', async (req, res) => {
  try {
    const { encrypted, days, window } = req.body;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + parseInt(days)); 

    const newEntry = {
      encrypted,
      endDate: expiry,
      window,
      attempts: [],
      score: 0,
      streak: 0,
      penalty: 0
    };

    const vault = await Vault.findOneAndUpdate(
      { userId: req.params.userId },
      { $push: { passwords: newEntry } },
      { upsert: true, new: true }
    );

    res.json(vault);
  } catch (err) {
    res.status(500).json({ error: "Add failed" });
  }
});


// 🔥 3. TRY ACCESS (NEW CORE FEATURE)
app.post('/api/vault/:userId/attempt/:index', async (req, res) => {
  try {
    const vault = await Vault.findOne({ userId: req.params.userId });
    if (!vault) return res.status(404).json({ error: "Vault not found" });

    const entry = vault.passwords[req.params.index];
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    const now = getISTTime();

    // Convert HH:MM → today IST Date
    const [sh, sm] = entry.window.start.split(':');
    const [eh, em] = entry.window.end.split(':');

    const startTime = new Date(getISTTime());
    startTime.setHours(parseInt(sh), parseInt(sm), 0);

    const endTime = new Date(getISTTime());
    endTime.setHours(parseInt(eh), parseInt(em), 0);

    let success = false;

    if (now >= startTime && now <= endTime) {
      success = true;
      entry.score += 1;
      entry.streak += 1;
    } else {
      success = false;
      entry.score -= 1;
      entry.streak = 0;
      entry.penalty += 1;

      // 🔥 shift window forward (penalty system, IST)
      startTime.setMinutes(startTime.getMinutes() + entry.penalty);
      endTime.setMinutes(endTime.getMinutes() + entry.penalty);

      entry.window.start = `${startTime.getHours().toString().padStart(2,'0')}:${startTime.getMinutes().toString().padStart(2,'0')}`;
      entry.window.end = `${endTime.getHours().toString().padStart(2,'0')}:${endTime.getMinutes().toString().padStart(2,'0')}`;
    }

    // Save attempt
    entry.attempts.push({
      time: now,
      success
    });

    await vault.save();

    res.json({
      success,
      score: entry.score,
      streak: entry.streak,
      penalty: entry.penalty,
      window: entry.window,
      encrypted: success ? entry.encrypted : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Attempt failed" });
  }
});


// 4. Update Daily Focus
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


// 5. Server Time (IST ISO)
app.get('/api/time', (req, res) => {
  res.json({ datetime: getISTTime().toISOString() });
});


// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
//testing 1