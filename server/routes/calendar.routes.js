const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const ensureAuthenticated = require('../middleware/authMiddleware');
const Event = require('../models/event.model');
const Community = require('../models/community.model');

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 900 });

router.get('/', ensureAuthenticated, async (req, res) => {
    const view = req.query.view || 'weekly';
    const cacheKey = `calendar_${req.user._id}_${view}`;

    // Try fetching the cached page
    const cachedPage = myCache.get(cacheKey);
    if (cachedPage) {
        console.log('rendered calendar from cache')
        return res.send(cachedPage); // if cached page exists serve immediately
    }

    const userCommunities = await Community.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).select('_id');
    const communityIds = userCommunities.map(community => community._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start, end;

    if (view === 'daily') {
        start = new Date(today);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
    } else if (view === 'weekly') {
        const dayOfWeek = today.getDay();
        start = new Date(today);
        start.setDate(start.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(end.getDate() + 7);
    }

    const events = await Event.find({
        community: { $in: communityIds },
        date: { $gte: start, $lt: end }
    }).populate('community').sort('date startTime');

    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    const eventsForView = view === 'daily' ? prepareDailyEvents(events) : prepareWeeklyEvents(events, start);

    // render page and cache result
    res.render('pages/calendar', {
        view,
        events: eventsForView,
        startDate: start,
        endDate: end,
        times
    }, (err, html) => {
        if (err) {
            console.error('Rendering error:', err);
            return res.status(500).send('Error rendering calendar');
        }
        myCache.set(cacheKey, html); // cache rendered html
        res.send(html);
    });
});

function prepareDailyEvents(events) {
    const eventsByTime = {};
    events.forEach(event => {
        const time = event.startTime.slice(0, 5);
        if (!eventsByTime[time]) {
            eventsByTime[time] = [];
        }
        eventsByTime[time].push(event);
    });
    return eventsByTime;
}

function prepareWeeklyEvents(events, startOfWeek) {
    const eventsByDayAndTime = Array.from({ length: 7 }, () => ({}));
    events.forEach(event => {
        const dayIndex = (new Date(event.date).getDay() - startOfWeek.getDay() + 7) % 7;
        const time = event.startTime.slice(0, 5);
        if (!eventsByDayAndTime[dayIndex][time]) {
            eventsByDayAndTime[dayIndex][time] = [];
        }
        eventsByDayAndTime[dayIndex][time].push(event);
    });
    return eventsByDayAndTime;
};

module.exports = router;
