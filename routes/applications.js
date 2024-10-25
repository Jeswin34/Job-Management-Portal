// routes/applications.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes'); // Specify the upload folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique file name
    }
});

const upload = multer({ storage: storage });

// @route   POST /api/applications
// @desc    Apply for a job (Jobseeker only)
// @access  Private
router.post('/', [auth, upload.single('resume')], async (req, res) => {
    const { jobId } = req.body;

    try {
        if (req.user.role !== 'jobseeker') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({ job: jobId, applicant: req.user.id });
        if (existingApplication) {
            return res.status(400).json({ msg: 'Already applied for this job' });
        }

        // Create a new application with the uploaded resume file path
        const application = new Application({
            job: jobId,
            applicant: req.user.id,
            resume: req.file.path // Store the file path
        });

        await application.save();
        res.json(application);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   GET /api/applications
// @desc    Get applications (Employer/Admin) for a specific job or all applications
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let applications;

        if (req.user.role === 'admin') {
            applications = await Application.find()
                .populate('job')
                .populate('applicant', 'name email');
        } else if (req.user.role === 'employer') {
            const { jobId } = req.query;
            if (jobId) {
                applications = await Application.find({ job: jobId })
                    .populate('job')
                    .populate('applicant', 'name email');
            } else {
                const jobs = await Job.find({ employer: req.user.id });
                const jobIds = jobs.map(job => job._id);
                applications = await Application.find({ job: { $in: jobIds } })
                    .populate('job')
                    .populate('applicant', 'name email');
            }
        } else if (req.user.role === 'jobseeker') {
            applications = await Application.find({ applicant: req.user.id })
                .populate('job')
                .populate('applicant', 'name email');
        } else {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Return applications along with a resume link
        res.json(applications.map(app => ({
            ...app.toObject(),
            resumeLink: `/uploads/resumes/${path.basename(app.resume)}` // Add a link to the resume
        })));

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// @route   PUT /api/applications/:id
// @desc    Update application status (Employer/Admin)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { status } = req.body;

    try {
        let application = await Application.findById(req.params.id).populate('job');
        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Only the employer of the job or admin can update
        if (application.job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        application.status = status;
        await application.save();
        res.json(application);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
