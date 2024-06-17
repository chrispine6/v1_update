// routes/auth.routes.js

const express = require('express');
const User = require('../models/user.model');
const passport = require('passport');
const router = express.Router();
const checkFirstTimeLogin = require('../middleware/hasLoggedInBefore');

// initial route
router.get('/', (req, res) => {
  res.render('index');
});

// Render registration form
router.get('/register', (req, res) => {
  res.render('registration');
});

// post register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, dob, username, password } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).send('User already registered with this email.');
    }

    user = new User({
      name,
      email,
      phone,
      dob,
      username,
      password
    });

    await user.save();

    res.redirect('/login')
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during registration');
  }
});

// Render login form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login route
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: false
}), checkFirstTimeLogin, (req, res) => {
  if (req.session.redirectToNotifications) {
    delete req.session.redirectToNotifications;
    res.redirect('/notifications');
  } else {
    res.redirect('/home');
  }
});


// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
      if (err) {
          return next(err);
      }
      res.redirect('/');
  });
});

module.exports = router;
