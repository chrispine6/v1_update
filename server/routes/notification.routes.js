const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const ensureAuthenticated = require('../middleware/authMiddleware');

router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const notifications = await Notification.find({ toUser: req.user._id }).populate('fromUser').populate('community');
        res.render('notifications', { notifications });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching notifications');
    }
});

router.post('/connect/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const recipientId = req.params.userId;
        const senderId = req.user._id;

        const newNotification = new Notification({
            type: 'connection-request',
            fromUser: senderId,
            toUser: recipientId
        });
        await newNotification.save();

        res.redirect(`/profile/users/${recipientId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing connection request');
    }
});


module.exports = router;