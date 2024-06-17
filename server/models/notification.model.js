const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['connection-request', 'community-invite']
    },
    fromUser: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: function() { return this.type === 'connection-request'; }
    },
    toUser: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    community: { 
        type: Schema.Types.ObjectId, 
        ref: 'Community',
        required: function() { return this.type === 'community-invite'; }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'denied'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
