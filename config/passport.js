const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const User = require("../models/User");


const backend_url = process.env.BACKEND_URL + '/auth/'
/**
 *  Auth Strategy
 *  - Two params - pass
 *  - - 1) strategy
 *  - - 2) verify : function
 */

// Local Strategy
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {

            const user = await User.findOne({ email });

            if (!user || !(await user.comparePassword(password))) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            return done(null, user);
        } catch (err) {
            return done(null, false, { message: 'Try Again' });
        }
    })
);


// https://auth-backend-hxu1.onrender.com/auth/google/callback
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: backend_url + 'google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            // Handle Google authentication logic
            try {
                // Check if the user is already registered with another network
                let user = await User.findOne({ $or: [{ email: profile.emails[0].value }, { googleId: profile.id }] });

                if (user) {
                    if (user.googleId === profile.id) {
                        // User is already registered
                        return done(null, user);
                    } else {
                        // User is registered with another network
                        return done(null, false, { message: 'User_already_registered_with_another_network.' });
                    }
                }

                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    photo: {
                        secure_url: profile.photos ? profile.photos[0].value : null
                    }
                });

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);


// Facebook Strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: backend_url + 'facebook/callback',
            profileFields: ['id', 'displayName', 'email', 'picture.type(large)'],
            scope: ['email']
        },
        // Handle Facebook authentication logic
        async (accessToken, refreshToken, profile, done) => {

            // Handle Facebook authentication logic
            try {
                // Check if the user is already registered with another network
                let user = await User.findOne({ $or: [{ email: profile.emails[0].value }, { facebookId: profile.id }] });

                if (user) {
                    if (user.facebookId === profile.id) {
                        // User is already registered
                        return done(null, user);
                    } else {
                        // User is registered with another network
                        return done(null, false, { message: 'User_already_registered_with_another_network.' });
                    }
                }

                // If the user is not found, create a new user with the Google profile information
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    facebookId: profile.id,
                    photo: {
                        secure_url: profile.photos ? profile.photos[0].value : null
                    }
                });

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);


passport.use(
    new TwitterStrategy(
        {
            consumerKey: process.env.TWITTER_CLIENT_ID,
            consumerSecret: process.env.TWITTER_CLIENT_SECRET,
            callbackURL: backend_url + 'twitter/callback',
        },
        async (accessToken, refreshToken, profile, done) => {

            // Handle Twitter authentication logic
            try {
                // Check if the user is already registered with Twitter ID
                let user = await User.findOne({ $or: [{ email: profile.emails[0].value }, { twitterId: profile.id }] });

                if (user) {
                    if (user.twitterId === profile.id) {
                        // User is already registered
                        return done(null, user);
                    } else {
                        // User is registered with another network
                        return done(null, false, { message: 'User_already_registered_with_another_network.' });
                    }
                }

                // If the user is not found in any of the networking mediums, create a new user with the Twitter profile information
                user = await User.create({
                    name: profile.displayName,
                    twitterId: profile.id,
                    photo: {
                        secure_url: profile.photos ? profile.photos[0].value : null
                    }
                });

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);


// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: backend_url + 'github/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user is already registered with another network
                const existingUser = await User.findOne({ $or: [{ email: profile.emails[0].value }, { githubId: profile.id }] });

                if (existingUser) {
                    if (existingUser.githubId === profile.id)
                        return done(null, existingUser);
                    else
                        return done(null, false, { message: 'User_already_registered_with_another_network.' });
                }


                // If the user does not exist, create a new entry in the database ??
                const newUser = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    githubId: profile.id,
                });

                newUser.photo.secure_url = profile.photos ? profile.photos[0].value : null
                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);


// Serialize and deserialize the user for session management
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
});

