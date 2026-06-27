const express = require('express');
const router = express.Router();
const Setting = require('./config/models/Setting');

// GET all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create settings
router.post('/', async (req, res) => {
  try {
    const setting = await Setting.create(req.body);
    res.status(201).json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
