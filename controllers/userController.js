const User = require('../models/User');

// Controller function to fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();  // Fetch all users from the database
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to delete a user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user from the database
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
