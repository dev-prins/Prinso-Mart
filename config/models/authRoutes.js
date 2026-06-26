const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('AUTH ROUTE WORKING');
});

module.exports = router;
