const express = require('express');
const { check, validationResult } = require('express-validator');
const authRouter = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');


// User login or register with Local
authRouter.post(
    '/register',
    [
        check('email').isEmail().withMessage('Invalid email address.'),
        check('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long.'),
    ],
    authController.register
);

authRouter.post('/login',
    [
        check('email').isEmail().withMessage('Invalid Credentials.'),
        check('password')
            .isLength({ min: 6 })
            .withMessage('Invalid Credentials'),
    ],
    (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors = errors.array()
            return res.status(422).json({ error: errors[0].msg });
        }
        next()
    },
    passport.authenticate('local'), authController.login
);


// User login or register with Google
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: "http://localhost:3002/",
    failureRedirect: '/auth/error',
    failureFlash: true
}));


// User login or register with Facebook 
authRouter.get('/facebook', passport.authenticate('facebook', { failureFlash: true }));
authRouter.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: "http://localhost:3002/",
    failureRedirect: '/auth/error',
    failureFlash: true
}));


// User login or register with Twitter
authRouter.get('/twitter', passport.authenticate('twitter'));
authRouter.get('/twitter/callback', passport.authenticate('twitter', {
    successRedirect: "http://localhost:3002/",
    failureRedirect: '/auth/error',
    failureFlash: true
}));


// User login or register with Github
authRouter.get('/github', passport.authenticate('github'));
authRouter.get('/github/callback', passport.authenticate('github', {
    successRedirect: "http://localhost:3002/",
    failureRedirect: '/auth/error',
    failureFlash: true
}));


authRouter.get('/error', authController.errorMessage);

// User logout
authRouter.get('/logout', authController.logoutUser);

module.exports = authRouter;
