// routes/jobs.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @route   POST /api/jobs
// @desc    Post a new job (Employer only)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { title, description, requirements, location, salary } = req.body;

    try {
        // Only employers can post jobs
        if (req.user.role !== 'employer') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const job = new Job({
            title,
            description,
            requirements,
            location,
            salary,
            employer: req.user.id
        });

        await job.save();
        res.json(job);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().populate('employer', 'name email');
        res.json(jobs);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('employer', 'name email');
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.json(job);
    } catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job listing
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { title, description, requirements, location, salary } = req.body;

    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if the user is the employer
        if (job.employer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Update job details
        job.title = title || job.title;
        job.description = description || job.description;
        job.requirements = requirements || job.requirements;
        job.location = location || job.location;
        job.salary = salary || job.salary;

        await job.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job (Employer only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check user
        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        res.json({ msg: 'Job removed' });

    } catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/jobs/applications/:id
// @desc    Withdraw an application
// @access  Private
router.delete('/applications/:id', auth, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const deletedApplication = await Application.findByIdAndDelete(applicationId);

        if (!deletedApplication) {
            return res.status(404).send('Application not found'); // Handle case where application doesn't exist
        }
        res.send('Application withdrawn successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error'); // Handle server errors
    }
});


module.exports = router;
