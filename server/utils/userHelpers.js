async function checkIfUsersAreConnected(userId, otherUsername) {
    try {
        const otherUser = await User.findOne({ username: otherUsername });
        if (!otherUser) {
            return false; // Other user not found
        }
        const user = await User.findById(userId);
        return user.connections.includes(otherUser._id);
    } catch (error) {
        console.error('Error checking connections:', error);
        throw error;
    }
}
