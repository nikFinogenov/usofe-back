// authMiddleware.js
const jwt = require('jsonwebtoken');

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded token to the request object
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
};
