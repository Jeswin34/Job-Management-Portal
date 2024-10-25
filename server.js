// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcryptjs'); // Import bcrypt for hashing

// Load environment variables
dotenv.config();

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

const userRoutes = require('./routes/userRoutes');

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
    createAdminUser(); // Call the function to create admin user
})
.catch(err => console.log(err));

// Function to create an admin user if it doesn't exist
const createAdminUser = async () => {
    const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash('admin123', salt); // Hash the password

    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (!existingAdmin) {
        await User.create({
            name: "Administrator",
            email: "admin@gmail.com",
            password: "password",
            role: "admin",
            date: new Date()
        });
        console.log("Admin user created successfully.");
    } else {
        console.log("Admin user already exists.");
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);

app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
