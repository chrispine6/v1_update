const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const ensureAuthenticated = require('../middleware/authMiddleware');

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('account', { user });
    } catch (error) {
        res.status(500).send('Error fetching user data');
    }
});

router.get('/get-premium', ensureAuthenticated, (req, res) => {
    res.render('get-premium', { user: req.user });
});

module.exports = router;
