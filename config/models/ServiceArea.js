const express = require('express');
const router = express.Router();
const ServiceArea = require('./config/models/ServiceArea');

router.get('/', async (req, res) => {
  try {
    const areas = await ServiceArea.find({ isActive: true });
    res.json(areas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const area = await ServiceArea.create(req.body);
    res.status(201).json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const area = await ServiceArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ServiceArea.findByIdAndDelete(req.params.id);
    res.json({ message: 'Area deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
