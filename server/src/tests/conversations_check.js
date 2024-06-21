const mongoose = require('mongoose');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');

const checkConnectionsAndCreateConversations = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect('mongodb+srv://chris:c5LUJn643HvqAFx@dialogueprototype0clust.eoas6vw.mongodb.net/', {
          useNewUrlParser: true, 
          useUnifiedTopology: true
        })
      }

    const batchSize = 100;
    let skip = 0;

    while (true) {
      const users = await User.find().skip(skip).limit(batchSize).maxTimeMS(20000).exec();

      if (users.length === 0) {
        break;
      }

      for (const user of users) {
        console.log(`Checking connections for user: ${user.username}`);

        // Ensure that 'connections' is defined and is an array
        if (user.connections && Array.isArray(user.connections)) {
          for (const connection of user.connections) {
            try {
              await user.findOrCreateConversationWith(connection);
              console.log(`Conversation created between ${user.username} and ${connection.username}`);
            } catch (error) {
              console.error(`Error creating conversation: ${error.message}`);
            }
          }
        } else {
          console.error(`User ${user.username} has invalid or undefined 'connections' property.`);
        }
      }

      skip += batchSize;
    }

    console.log('Connections and conversations checked successfully.');
  } catch (error) {
    console.error(`Error retrieving users: ${error.message}`);
  } finally {
    // Disconnect only if the script connected to MongoDB
    if (mongoose.connection.readyState === 1) {
      mongoose.disconnect();
    }
  }
};

checkConnectionsAndCreateConversations();



