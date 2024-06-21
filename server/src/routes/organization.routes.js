const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const ensureAuthenticated = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.render('organization')
});

router.get('/list', (req, res) => {
    res.render()
})
module.exports = router;
