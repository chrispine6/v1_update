const mongoose = require('mongoose');

const organizationSchema = {
    name : {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    members : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Community'
    },
    main_community : {}, // should actually create a community with the name of the organization + {home}
    visibility_setting : {}, // are all communities in the organization vissible in to all users?
    admin : {}, // link to user (has access to the organizational dashboard)
}
  
module.exports = mongoose.model('Community', communitySchema);
