const express = require('express');
const router = express.Router();
const searchMiddleware = require('../middleware/searchMiddleware');
const ensureAuthenticated = require('../middleware/authMiddleware');

router.post('/', ensureAuthenticated, searchMiddleware, (req, res) => {
  res.render('search-results', { searchResults: res.locals.searchResults });
});

module.exports = router;