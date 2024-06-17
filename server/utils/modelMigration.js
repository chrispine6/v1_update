const mongoose = require('mongoose');
const User = require('../models/user.model');

mongoose.connect('mongodb+srv://chris:c5LUJn643HvqAFx@dialogueprototype0clust.eoas6vw.mongodb.net/', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

(async () => {
  try {
    await User.updateMany({}, { $set: { accountType: 'free' } });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
})();
