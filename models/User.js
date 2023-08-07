// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    googleId: String,
    githubId: String,
    twitterId: String,
    facebookId: String,
    bio: String,
    phone: String,
    photo: {
        public_id: String,
        secure_url: String
    },
});

// Hash and salt the user password before saving to the database
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (err) {
        return next(err);
    }
});

// Compare the provided password with the stored hashed password
userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
