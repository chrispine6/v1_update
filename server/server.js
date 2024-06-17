//server.js

const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user.model');
const Event = require('./models/event.model');
const Message = require('./models/message.model');
const authRoutes = require('./routes/auth.routes');
const homeRoutes = require('./routes/home.routes');
const messageRoutes = require('./routes/message.routes');
const profileRoutes = require('./routes/profile.routes');
const communityRoutes = require('./routes/community.routes');
const postRoutes = require('./routes/post.routes'); 
const eventRoutes = require('./routes/event.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');
const calendarRoutes = require('./routes/calendar.routes');
const premiumRoutes = require('./routes/premium.routes');
const accountType = require('./routes/accounttype.routes');
const organizationRoutes = require('./routes/organization.routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false
}));

io.on('connection', socket => {
  console.log('New client connected');
  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});

mongoose.connect('mongodb+srv://chris:c5LUJn643HvqAFx@dialogueprototype0clust.eoas6vw.mongodb.net/').then(() => console.log('MongoDB Connected'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// css
app.use('/public', express.static(__dirname + '/public'));

app.use('/', authRoutes);
app.use('/home', homeRoutes);
app.use('/conversations', (req, res, next) => {
  req.io = io;
  next();
}, messageRoutes);
app.use('/profile', profileRoutes);
app.use('/community', communityRoutes);
app.use('/post', postRoutes);
app.use('/event', eventRoutes);
app.use('/search', searchRoutes);
app.use('/notification', notificationRoutes);
app.use('/calendar', calendarRoutes);
app.use('/premium', premiumRoutes);
app.use('/account', accountType);
app.use('/organization', organizationRoutes);