const User = require('../models/user.model');
const Community = require('../models/community.model');

async function searchMiddleware(req, res, next) {
  const searchQuery = req.body.searchQuery;
  const searchResults = {
    users: [],
    communities: []
  };

  try {
    searchResults.users = await User.find({ username: new RegExp(searchQuery, 'i') });
    searchResults.communities = await Community.find({ name: new RegExp(searchQuery, 'i') });
    res.locals.searchResults = searchResults;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error performing search');
  }
}

module.exports = searchMiddleware;
