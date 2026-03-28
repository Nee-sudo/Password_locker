const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const vaultSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Simple userId for demo (expand with auth)
  passwords: [{
    id: String,
    encrypted: String,
    lockDate: Date,
    unlockWindow: {
      start: String,
      end: String
    }
  }],
  masterLockStart: Date,
  dailyFocus: String
}, { timestamps: true });

const Vault = mongoose.model('Vault', vaultSchema);

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/vault/:userId', async (req, res) => {
  try {
    const vault = await Vault.findOne({ userId: req.params.userId });
    res.json(vault || { passwords: [], masterLockStart: null, dailyFocus: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/vault/:userId', async (req, res) => {
  try {
    let vault = await Vault.findOne({ userId: req.params.userId });
    if (vault) {
      vault.passwords = req.body.passwords;
      vault.masterLockStart = req.body.masterLockStart;
      vault.dailyFocus = req.body.dailyFocus;
    } else {
      vault = new Vault({ userId: req.params.userId, ...req.body });
    }
    await vault.save();
    res.json(vault);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/', (req, res) => res.send('Vault server running'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
