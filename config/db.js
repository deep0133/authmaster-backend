const mongoose = require('mongoose');

const db_url = process.env.DB_URL;
// Connect to MongoDB
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));