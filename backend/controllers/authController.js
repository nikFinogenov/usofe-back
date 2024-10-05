// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const db = require('../models'); // Import the models (User, etc.)
// const sendResetEmail = require('../utils/emailService'); // Email sending function for password reset links
const { sendConfirmationEmail, sendResetEmail } = require('../services/emailService');
// const { password } = require('pg/lib/defaults');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';

// Register a new user
exports.register = async (req, res) => {
    try {
        const { login, email, fullName, password, passwordConfirmation, } = req.body;

        // Validate password confirmation
        if (password !== passwordConfirmation) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if user or email already exists
        const existingUser = await db.User.findOne({
            where: { [Op.or]: [{ login }, { email }] },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Login or email already exists' });
        }

        // Create the new user
        const newUser = await db.User.create({
            login,
            email,
            password,
            fullName,
            role: 'user', // Default role
        });

        const confirmationToken = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        newUser.confirmationToken = confirmationToken;
        await newUser.save();
        // Send confirmation email
        const confirmationLink = `${process.env.FRONTEND_URL}/api/auth/confirm/${confirmationToken}`;
        await sendConfirmationEmail(newUser.email, confirmationLink);

        res.status(201).json({ message: 'User registered successfully, please confirm your email.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { login, email, password } = req.body;

        // Find the user by login or email
        const user = await db.User.findOne({
            where: { [Op.or]: [{ login }, { email }] },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if email is confirmed
        if (!user.emailConfirmed) {
            return res.status(403).json({ error: 'Please confirm your email before logging in' });
        }

        // Check the password
        const validPassword = user.checkPassword(password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRATION,
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Logout user (invalidate token on the client side)
exports.logout = (req, res) => {
    // Typically, you would handle logout client-side by simply deleting the token.
    res.status(200).json({ message: 'Logout successful' });
};

// Request password reset link
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User with this email does not exist' });
        }

        // Generate a reset token
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        user.confirmationToken = resetToken;
        await user.save();

        // Send password reset email
        const resetLink = `${process.env.FRONTEND_URL}/api/auth/password-reset/${resetToken}`;
        await sendResetEmail(user.email, resetLink);

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send reset link' });
    }
};

// Confirm new password with token
exports.confirmPasswordReset = async (req, res) => {
    try {
        const { confirmToken } = req.params;
        const { newPassword } = req.body;

        // Verify reset token
        const decoded = jwt.verify(confirmToken, process.env.JWT_SECRET);

        // Find the user
        const user = await db.User.findOne({ where: { email: decoded.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        // Update the password
        user.password = newPassword;
        user.confirmationToken = null;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
exports.confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by email and update their emailConfirmed field
        const user = await db.User.findOne({ where: { email: decoded.email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.emailConfirmed = true;
        user.confirmationToken = null; // Clear the token after confirmation
        await user.save();

        res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
