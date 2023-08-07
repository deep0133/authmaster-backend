const User = require('../models/User');
const cloudinary = require("cloudinary").v2
const { validationResult } = require("express-validator");
const { getDataUri, imageUrlToDataURI } = require('../utils/dataUri');
const path = require("path")

// Get user profile
async function getUserProfile(req, res) {
    try {
        let user = { ...req.user.toJSON() };
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        delete user.password

        // Check if user logged in with a social network
        if (user.googleId) {

            user.loginWith = 'network';
            delete user.googleId

        } else if (user.facebookId) {

            user.loginWith = 'network';
            delete user.facebookId

        } else if (user.twitterId) {

            user.loginWith = 'network';
            delete user.twitterId

        } else if (user.githubId) {

            user.loginWith = 'network';
            delete user.githubId

        }


        res.status(200).json({ success: true, msg: "User Profile", user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get user profile.' });
    }
}

// Edit user profile
async function editUserProfile(req, res) {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty() && req.body.email && req.body.email.length > 0) {
            return res.status(422).json({ error: "Invalid email address" });
        }

        const { name, email, bio, phone, password, imageUrl } = req.body;

        if (password && password.length > 0 && password.length < 5) return res.status(422).json({ success: false, error: "Password must be at least 6 characters long." })

        let user = await User.findById(req.user.id);

        const fileData = req.file;

        let fileUri = ''

        if (fileData || imageUrl) {
            // Handle the photo : uploaded from system
            if (fileData) {
                const extname = path.extname(fileData.originalname).toString()
                fileUri = await getDataUri(fileData.buffer, extname)
            }
            else if (imageUrl) {
                fileUri = await imageUrlToDataURI(imageUrl)
            }

            // Upload the file to Cloudinary
            const result = await cloudinary.uploader.upload(fileUri.content, {
                folder: "auth/users",
            });

            // Delete the previous photo (if it exists) from Cloudinary
            if (user.photo && user.photo.public_id) {
                await cloudinary.uploader.destroy(user.photo.public_id);
            }
            user.photo.public_id = result.public_id;
            user.photo.secure_url = result.secure_url
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.phone = phone || user.phone;
        user.password = password || user.password;

        await user.save()

        user = await user.toJSON()

        // Check if user logged in with a social network
        if (user.googleId) {
            user.loginWith = 'network';
            delete user.googleId
        } else if (user.facebookId) {
            user.loginWith = 'network';
            delete user.facebookId
        } else if (user.twitterId) {
            user.loginWith = 'network';
            delete user.twitterId
        } else if (user.githubId) {
            user.loginWith = 'network';
            delete user.githubId
        }

        res.json({ success: true, msg: "Profile Updated Successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update user profile.' });
    }
}

module.exports = {
    getUserProfile,
    editUserProfile,
};
