const jwt = require('jsonwebtoken');
const db = require('../models');

exports.isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // const user = await db.User.findByPk(decoded.id);
        // // console.log(decoded);
        // if(user.emailConfirmed) 
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
};
