const mongoose = require('mongoose');
const User = require('../models/user.model');

const checkAndFixConnections = async () => {
  try {
    await mongoose.connect('mongodb+srv://chris:c5LUJn643HvqAFx@dialogueprototype0clust.eoas6vw.mongodb.net/', {
        useNewUrlParser: true, 
        useUnifiedTopology: true
      })

    // Fetch all users
    const users = await User.find();

    // Check connections for each user
    for (const user of users) {
      const connectionsToRemove = [];

      // Check each connection
      for (const connectionId of user.connections) {
        const connection = await User.findById(connectionId);

        // If the connection is not found or does not have a reciprocal connection, mark it for removal
        if (!connection || !connection.connections.includes(user._id)) {
          connectionsToRemove.push(connectionId);
        }
      }

      // Remove inconsistent connections
      if (connectionsToRemove.length > 0) {
        user.connections = user.connections.filter(connectionId => !connectionsToRemove.includes(connectionId));
        await user.save();

        // Update the reciprocal connections
        for (const connectionIdToRemove of connectionsToRemove) {
          const connectionToRemove = await User.findById(connectionIdToRemove);
          if (connectionToRemove) {
            connectionToRemove.connections = connectionToRemove.connections.filter(id => id !== user._id);
            await connectionToRemove.save();
          }
        }

        console.log(`Removed inconsistent connections for user: ${user.username}`);
      }
    }

    console.log('Connection check and fix completed successfully.');
  } catch (error) {
    console.error(`Error checking and fixing connections: ${error.message}`);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

checkAndFixConnections();
