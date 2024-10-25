// models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: String, // URL or path to the resume
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'under review', 'interview', 'rejected', 'accepted'],
        default: 'applied'
    },
    dateApplied: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);
