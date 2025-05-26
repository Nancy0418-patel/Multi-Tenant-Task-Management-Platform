const express = require('express');
const router = express.Router();

// Placeholder route for /api/users
router.get('/', (req, res) => {
  res.json({ message: 'User route works!' });
});

module.exports = router; 