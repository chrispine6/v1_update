const express = require('express');
const User = require('../models/user.model');
const Community = require('../models/community.model');
const Post = require('../models/post.model');
const Notification = require('../models/notification.model');
const ensureAuthenticated = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/create', ensureAuthenticated, (req, res) => {
    res.render('community-create');
});

router.post('/create', ensureAuthenticated, async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(400).send('User not authenticated properly');
    }    
    try {
        const { name, description } = req.body;
        const newCommunity = new Community({
            name,
            description,
            members: [req.user._id],
            owner: req.user._id
        });
        await newCommunity.save();
        res.redirect(`/community/${newCommunity._id}`);
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).send('Error creating community');
    }
});

router.get('/my_communities', ensureAuthenticated, async (req, res) => {
    try {
        const communities = await Community.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        }).populate('members', 'name');

        res.render('my-communities', { communities });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).send('Error fetching communities');
    }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
                                         .populate('owner', 'username')
                                         .populate('members', 'username');

        if (!community) {
            return res.status(404).send('Community not found');
        }

        const isMemberOrOwner = community.owner._id.equals(req.user._id) || community.members.some(member => member._id.equals(req.user._id));

        let posts = [];
        let showJoinOptions = false;

        if (isMemberOrOwner) {
            posts = await Post.find({ community: community._id })
                              .populate('author', 'username')
                              .sort({ createdAt: -1 }); // Ensure posts are sorted from newest to oldest
        } else {
            const invite = await Notification.findOne({
                toUser: req.user._id,
                community: community._id,
                type: 'community-invite',
                status: 'pending'
            });
            showJoinOptions = invite !== null;
        }

        res.render('community-view', {
            community,
            posts,
            isMemberOrOwner,
            showJoinOptions,
            currentUser: req.user // Add this line to pass the current user's data to the template
        });
    } catch (error) {
        console.error('Error fetching community or posts:', error);
        res.status(500).send('Error fetching community: ' + error.message);
    }
});




router.post('/addUser/:id', ensureAuthenticated, async (req, res) => {
    try {
        const communityId = req.params.id;
        const { username } = req.body;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).send('Community not found');
        }

        const userToAdd = await User.findOne({ username });
        if (!userToAdd) {
            return res.status(404).send('User not found');
        }

        if (community.members.includes(userToAdd._id)) {
            return res.status(400).send('User already a member of the community');
        }

        community.members.push(userToAdd._id);
        await community.save();

        res.redirect(`/community/${communityId}`);
    } catch (error) {
        console.error('Error adding user to community:', error);
        res.status(500).send('Error adding user to community: ' + error.message);
    }
});

router.post('/invite/:communityId', ensureAuthenticated, async (req, res) => {
    try {
        const { invitedUsername } = req.body;
        const communityId = req.params.communityId;
        const invitedUser = await User.findOne({ username: invitedUsername });

        if (!invitedUser) {
            return res.status(404).send('User not found');
        }

        const community = await Community.findById(communityId);
        if (community.members.includes(invitedUser._id)) {
            return res.status(400).send('User already a member of the community');
        }

        const newNotification = new Notification({
            type: 'community-invite',
            fromUser: req.user._id,
            toUser: invitedUser._id,
            community: communityId
        });

        await newNotification.save();

        res.status(200).send('Invite sent');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing community invite');
    }
});


router.post('/join/:id', ensureAuthenticated, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);

        if (!community.members.includes(req.user._id)) {
            community.members.push(req.user._id);
            await community.save();

            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { communities: community._id }
            });
        }

        await Notification.findOneAndDelete({
            toUser: req.user._id,
            community: req.params.id,
            type: 'community-invite'
        });

        res.redirect(`/community/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error joining community');
    }
});


router.post('/decline/:id', ensureAuthenticated, async (req, res) => {
    try {
        await Notification.findOneAndDelete({
            toUser: req.user._id,
            community: req.params.id,
            type: 'community-invite'
        });

        res.redirect('/some-page-after-decline');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error declining community invite');
    }
});

router.post('/leave/:id', ensureAuthenticated, async (req, res) => {
    try {
        const communityId = req.params.id;
        // Remove the user from the community's members array
        await Community.findByIdAndUpdate(communityId, { $pull: { members: req.user._id } });
        // Optionally, remove the community from the user's communities array
        await User.findByIdAndUpdate(req.user._id, { $pull: { communities: communityId } });

        res.redirect('/community/my_communities');
    } catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).send('Error leaving community');
    }
});


module.exports = router;
