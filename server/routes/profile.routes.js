const express = require('express');
const User = require('../models/user.model');
const router = express.Router();
const passport = require('passport');
const ensureAuthenticated = require('../middleware/authMiddleware');
const Notification = require('../models/notification.model');

// route to get my-profile
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('connections').populate('communities');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('my-profile', { user: user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving user information');
    }
});

// route to get my-connections
router.get('/my_connections', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('connections');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('my-connections', { connections: user.connections });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving connections');
    }
});

// get public profile
router.get('/users/:username', ensureAuthenticated, async (req, res) => {
    try {
        const profileUser = await User.findOne({ username: req.params.username });

        if (!profileUser) {
            return res.status(404).send('User not found');
        }

        let connectionStatus = 'not_connected'; 

        if (req.user.connections.includes(profileUser._id)) {
            connectionStatus = 'connected';
        } else {
            const connectionRequestSent = await Notification.findOne({
                fromUser: req.user._id,
                toUser: profileUser._id,
                type: 'connection-request',
                status: 'pending'
            });
            const connectionRequestReceived = await Notification.findOne({
                fromUser: profileUser._id,
                toUser: req.user._id,
                type: 'connection-request',
                status: 'pending'
            });

            if (connectionRequestSent) {
                connectionStatus = 'requested';
            } else if (connectionRequestReceived) {
                connectionStatus = 'accept_or_deny';
            }
        }

        res.render('public-profile', { profileUser, connectionStatus });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

// connect with user
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
        res.json({ message: 'Request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing connection request' });
    }
});

router.post('/accept/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const userIdToConnect = req.params.userId;

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { connections: userIdToConnect }
        });
        await User.findByIdAndUpdate(userIdToConnect, {
            $addToSet: { connections: req.user._id }
        });

        await Notification.findOneAndDelete({
            fromUser: userIdToConnect,
            toUser: req.user._id,
            type: 'connection-request'
        });

        await User.createConversationsForUser(req.user._id);
        await User.createConversationsForUser(userIdToConnect);

        res.json({ message: 'Connection accepted' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing connection acceptance');
    }
});

router.post('/deny/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const userIdToDeny = req.params.userId;

        // Delete the notification
        await Notification.findOneAndDelete({
            fromUser: userIdToDeny,
            toUser: req.user._id,
            type: 'connection-request'
        });

        res.json({ message: 'Connection denied' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing connection denial');
    }
});

router.get('/edit', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile-edit', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving user information for edit');
    }
});

router.post('/edit', ensureAuthenticated, async (req, res) => {
    const updates = req.body;
    try {
        // Avoid updating the dob and ensure password is hashed if changed
        delete updates.dob;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        await User.findByIdAndUpdate(req.user._id, updates);
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user profile');
    }
});

router.post('/disconnect/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        // Remove the other user from the current user's connections
        await User.findByIdAndUpdate(req.user._id, { $pull: { connections: otherUserId } });
        // Remove the current user from the other user's connections
        await User.findByIdAndUpdate(otherUserId, { $pull: { connections: req.user._id } });

        res.redirect('/profile/users/' + req.params.username); // Redirect back to the user's profile or another appropriate page
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing disconnection');
    }
});

module.exports = router;