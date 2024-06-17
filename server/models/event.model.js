// models/event.model.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    date: {
        type: Date, 
        required: true },
    startTime: { 
        type: String, 
        required: true },
    endTime: { 
        type: String, 
        required: true },
    title: { 
        type: String, 
        required: true },
    content: { 
        type: String, 
        required: true },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
        },
    },
{
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
