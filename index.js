const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const dotenv = require("dotenv")
const flash = require("connect-flash")
const cloudinary = require("cloudinary").v2
const cors = require('cors')
const app = express();


// config
dotenv.config({ path: "./config/config.env" })
require("./config/db")
require('./config/passport.js');

const PORT = process.env.PORT || 5000;

// cloudinarys setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up session middleware
app.set('trust proxy', 1); // Trust proxy headers
app.use(session({
    secret: process.env.SESSION_SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.DB_URL,
        ttl: 14 * 24 * 60 * 60, // session expiration in seconds (2 weeks),
        autoRemove: 'native',
        collectionName: 'mySessions',
        mongoOptions: {
            useUnifiedTopology: true,
        },
    }),
    proxy: true,
    cookie: {
        secure: true,
        sameSite: 'none',
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
    credentials: true,
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
};


app.use((req, res, next) => {
    console.log('Headers:', req.headers);
    next();
});

// Set up custom CORS headers middleware
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers['x-forwarded-proto'] + '://' + frontendUrl);
    res.header('Access-Control-Allow-Credentials', true);
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

// Use the cors() middleware for regular requests
app.use(cors(corsOptions));

app.options('*', cors());


// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// Routes
app.use('/auth', authRouter);
app.use('/profile', profileRouter);


app.get('*', (req, res) => {
    throw new Error("Method Not Allow")
})
app.post('*', (req, res) => {
    throw new Error("Method Not Allow")
})

// Error Handling
app.use((err, req, res, next) => {
    res.status(405).json({
        success: false,
        err: err.message
    })
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running`);
});
