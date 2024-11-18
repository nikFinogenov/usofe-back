const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const db = require('../models');
const { sendConfirmationEmail, sendResetEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';
const FRONTEND_URL = 'http://localhost:3000'
const BACKEND_URL = 'http://localhost:3306'
function funrandomPic() {
    const commonPictures = [
        'avatars/face_1.png',
        'avatars/face_2.png',
        'avatars/face_3.png',
    ];

    const rarePictures = [
        'avatars/face_4.png',
        'avatars/face_5.png',
    ];

    const randomNumber = Math.floor(Math.random() * 100);
    let finalPic = `${BACKEND_URL}/`

    if (randomNumber < 5) {
        finalPic = finalPic + rarePictures[Math.floor(Math.random() * rarePictures.length)];
    } else {
        finalPic = finalPic + commonPictures[Math.floor(Math.random() * commonPictures.length)];
    }
    return finalPic;
}

exports.register = async (req, res) => {
    try {
        const { login, email, fullName, password } = req.body;

        const existingUser = await db.User.findOne({
            where: { [Op.or]: [{ login }, { email }] },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Login or email already exists' });
        }

        const newUser = await db.User.create({
            login,
            email,
            password,
            fullName,
            role: 'user',
            profilePicture: funrandomPic(),
        });

        const confirmationToken = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
        newUser.confirmationToken = confirmationToken;
        await newUser.save();

        const confirmationLink = `${FRONTEND_URL}/confirm-email/${confirmationToken}`;
        await sendConfirmationEmail(newUser.email, confirmationLink);

        res.status(201).json({ message: 'User registered successfully, please confirm your email.' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.User.findOne({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // if (!user.emailConfirmed) {
        //     return res.status(403).json({ error: 'Please confirm your email before logging in' });
        // }

        const validPassword = user.checkPassword(password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRATION,
        });
        const userData = {
            id: user.id,
            login: user.login,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            email: user.email,
            role: user.role,
            rating: user.rating,
            emailConfirmed: user.emailConfirmed
        };

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userData
        });

        // res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};
exports.me = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user by the ID from the decoded token
        const user = await db.User.findByPk(decoded.id, {
            attributes: ['id', 'login', 'fullName', 'profilePicture', 'email', 'role', 'rating', 'emailConfirmed']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send user details back in response
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve user information' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Email is not registered' });
        }

        const resetToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
        user.confirmationToken = resetToken;
        await user.save();

        const resetLink = `${FRONTEND_URL}/confirm-reset/${resetToken}`;
        await sendResetEmail(user.email, resetLink);

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send reset link' });
    }
};

exports.confirmPasswordReset = async (req, res) => {
    try {
        const { confirmToken } = req.params;
        const { newPassword } = req.body;

        const decoded = jwt.verify(confirmToken, JWT_SECRET);

        const user = await db.User.findOne({ where: { email: decoded.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.confirmationToken === confirmToken) {
            user.confirmationToken = null;
            user.password = newPassword;
            await user.save();
        }
        else {
            res.status(400).json({ error: 'Invalid or expired token' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

exports.confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.User.findOne({ where: { email: decoded.email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.confirmationToken === token) {
            user.emailConfirmed = true;
            user.confirmationToken = null;
            await user.save();
        }
        else {
            res.status(400).json({ error: 'Invalid or expired token' });
        }

        await user.save();

        res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
