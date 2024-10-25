const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// GET all users
router.get('/', UserController.getAllUsers);

// DELETE user route
router.delete('/:id', UserController.deleteUser);

module.exports = router;
