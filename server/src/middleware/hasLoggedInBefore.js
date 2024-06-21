const User = require('../models/user.model'); // Ensure this is imported
const Community = require('../models/community.model');
const Notification = require('../models/notification.model');

module.exports = async function checkFirstTimeLogin(req, res, next) {
  if (req.isAuthenticated() && !req.user.hasLoggedInBefore) {
    try {
      const community = await Community.findOne({ name: "Dialogue, An Introduction" });
      if (community) {
        const newNotification = new Notification({
          type: 'community-invite',
          fromUser: community.owner,
          toUser: req.user._id,
          community: community._id,
          status: 'pending'
        });
        await newNotification.save();
        await User.findByIdAndUpdate(req.user._id, { $set: { hasLoggedInBefore: true }});
        req.session.redirectToNotifications = true;
        req.session.save(err => {
          if (err) {
            return next(err);
          }
          return res.redirect('/notification');
        });
      } else {
        next();
      }
    } catch (error) {
      console.error("Error during first-time login actions:", error);
      next(error);
    }
  } else {
    next();
  }
};
