// routes/profile.js
const express = require('express');
const profileRouter = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/authenticate');
const singleUpload = require('../middlewares/multer');
const { check } = require('express-validator');

// Get user profile
profileRouter.get('/', requireAuth, profileController.getUserProfile);

// Edit user profile
profileRouter.patch('/', requireAuth, singleUpload, [
    check('email').isEmail().withMessage('Invalid email address.')
], profileController.editUserProfile);

module.exports = profileRouter;
