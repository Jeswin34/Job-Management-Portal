// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String
    },
    location: {
        type: String
    },
    salary: {
        type: String
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    datePosted: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);
