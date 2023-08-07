const { validationResult } = require('express-validator');
const User = require('../models/User');


// User registration route
async function register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: "All fields Required" });
        }

        const { name, email, password } = req.body;

        // Check if the user with the provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'User with this email already exists' });
        }

        // Create a new user with the provided data
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ success: true, msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to register user' });
    }
}

// User Login route
async function login(req, res) {
    if (!req.user) {
        return res.status(401).json({ success: false, error: "Try Again" });
    }
    const user = { ...req.user.toJSON() }
    delete user["password"]
    res.status(200).json({ success: true, msg: "Login Successfull", user })
}

// route to handle the error and display the flash message
async function errorMessage(req, res) {
    // Retrieve the flash message, if any, from the session
    let flashMessage = await req.flash('error')[0];
    const frontendLoginUrl = 'http://localhost:3002/login'
    res.redirect(`${frontendLoginUrl}?message=${encodeURIComponent(flashMessage || "try_again_with_other_way")}`);
}

// Logout user
function logoutUser(req, res) {
    // Handle user logout
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) {
                // Handle error, if any
                return res.status(500).json({ success: false, msg: "Logout failed.", error: err });
            }
            return res.json({ success: true, msg: "Logout successful" });
        })
    }
    else {
        return res.json({
            success: false, error: "User already logout"
        })
    }
}


module.exports = {
    register,
    login,
    errorMessage,
    logoutUser,
};
