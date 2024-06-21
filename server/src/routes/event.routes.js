// routes/event.routes.js

const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');
const ensureAuthenticated = require('../middleware/authMiddleware')
const Community = require('../models/community.model'); 

router.get('/create', ensureAuthenticated, async (req, res) => {
    try {
        const communities = await Community.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] });
        res.render('event-create', { communities });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/create', ensureAuthenticated, async (req, res) => {
    const { eventDate, eventStartTime, eventEndTime, eventTitle, eventContent, eventCommunity } = req.body;

    try {
        const newEvent = new Event({
            date: new Date(eventDate),
            startTime: eventStartTime,
            endTime: eventEndTime,
            title: eventTitle,
            content: eventContent,
            community: eventCommunity,
        });

        await newEvent.save();
        res.redirect('/calendar');
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).send('Error saving event');
    }
});

module.exports = router;
