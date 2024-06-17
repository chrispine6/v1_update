// home.routes.js

const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 }); // ttl=time to live
const ensureAuthenticated = require('../middleware/authMiddleware');
const User = require('../models/user.model');
const Community = require('../models/community.model');
const Post = require('../models/post.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

// Route for displaying posts
router.get('/', ensureAuthenticated, async (req, res) => {
    const key = 'homePage_' + req.user._id;
    const cachedPage = cache.get(key);

    if (cachedPage) {
        console.log('serverd home page from cache');
        res.send(cachedPage);
    } else {
        try {
            const communities = await Community.find({
                $or: [
                    { owner: req.user._id },
                    { members: req.user._id }
                ]
            }).select('_id');
            const communityIds = communities.map(c => c._id);
            const recentPosts = await Post.find({ community: { $in: communityIds } })
                                          .populate('author', 'username')
                                          .populate('community', 'name')
                                          .sort({ createdAt: -1 })
                                          .limit(10);

            // finally render page
            res.render('pages/posts', { recentPosts }, (err, html) => {
                if (err) {
                    console.error('Error rendering page:', err);
                    res.status(500).send('Error rendering page');
                } else {
                    cache.set(key, html);
                    res.send(html);
                }
            });
        } catch (error) {
            console.error('Error fetching recent posts:', error);
            res.status(500).send('Error fetching recent posts');
        }
    }
});

module.exports = router;
