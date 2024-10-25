// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const auth = require('../middleware/auth');

dotenv.config();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        // Create payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign JWT
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Create payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign JWT
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private
router.get('/users', auth, async (req, res) => {
    try {
        // Check if the requesting user is an admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        // Fetch all users
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
