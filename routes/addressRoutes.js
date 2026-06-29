const express = require('express');
const router = express.Router();

const Address = require('../config/models/Address');

// Get all addresses
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.query.userId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create address
router.post('/', async (req, res) => {
  try {
    const address = await Address.create(req.body);
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update address
router.put('/:id', async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete address
router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set default address
router.put('/:id/default', async (req, res) => {
  try {
    await Address.updateMany(
      { user: req.body.userId },
      { isDefault: false }
    );

    const address = await Address.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
