function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // Redirect to the login page or send an appropriate response
    res.send('you are not authenticated. please log in')
}

module.exports = ensureAuthenticated;
