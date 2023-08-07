function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    next();
}

module.exports = {
    requireAuth
}