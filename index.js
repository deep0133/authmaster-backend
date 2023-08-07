const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const dotenv = require("dotenv")
const flash = require("connect-flash")
const cloudinary = require("cloudinary").v2
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 5000;

// config
dotenv.config({ path: "./config/config.env" })
require("./config/db")
require('./config/passport.js');

// cloudinarys setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if your app is served over HTTPS
        maxAge: 3600000, // Set the session expiration time in milliseconds (1 hour in this case)
        httpOnly: true,
        sameSite: false
    },
}));

const frontendUrl = process.env.FRONTEND_URL
const allowedOrigins = [frontendUrl];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};


// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors(corsOptions));


// Routes
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        msg: "Server is running"
    })
})

app.get("*", (req, res) => {
    res.json({
        success: false,
        error: "Method Not allowed"
    })
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
