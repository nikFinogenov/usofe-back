const db = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sendConfirmationEmail, sendResetEmail } = require('../services/emailService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.user_id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { login, email, fullName, password, role } = req.body;


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
      role: role || 'user',
      emailConfirmed: true
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', newUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const avatar = req.file.path;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.profilePicture = avatar;
    await user.save();

    res.status(200).json({ message: 'Avatar updated successfully', avatar });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { login, email, fullName, password, role } = req.body;

    const user = await db.User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
      if (user.id !== user_id) {
        res.status(403).json({ error: 'Unauthorized to update this user' });
      }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (login) user.login = login;
    if (password) user.password = password;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user data' });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await db.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};