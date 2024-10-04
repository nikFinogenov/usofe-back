const db = require('../models');
const bcrypt = require('bcrypt');

// Register user
exports.getAllUsers = async (req, res) => {
  // try {
  //   const { username, email, password } = req.body;
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   const newUser = await db.User.create({
  //     username,
  //     email,
  //     password: hashedPassword,
  //   });

  //   res.status(201).json(newUser);
  // } catch (error) {
  //   res.status(400).json({ error: 'Failed to register user' });
  // }
};

// Login user (basic example, add JWT later)
exports.getUser = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const user = await db.User.findOne({ where: { email } });

  //   if (user && await bcrypt.compare(password, user.password)) {
  //     res.status(200).json({ message: 'Login successful' });
  //   } else {
  //     res.status(400).json({ error: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   res.status(400).json({ error: 'Failed to log in' });
  // }
};

exports.createUser = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const user = await db.User.findOne({ where: { email } });

  //   if (user && await bcrypt.compare(password, user.password)) {
  //     res.status(200).json({ message: 'Login successful' });
  //   } else {
  //     res.status(400).json({ error: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   res.status(400).json({ error: 'Failed to log in' });
  // }
};

exports.uploadAvatar = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const user = await db.User.findOne({ where: { email } });

  //   if (user && await bcrypt.compare(password, user.password)) {
  //     res.status(200).json({ message: 'Login successful' });
  //   } else {
  //     res.status(400).json({ error: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   res.status(400).json({ error: 'Failed to log in' });
  // }
};
exports.updateUser = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const user = await db.User.findOne({ where: { email } });

  //   if (user && await bcrypt.compare(password, user.password)) {
  //     res.status(200).json({ message: 'Login successful' });
  //   } else {
  //     res.status(400).json({ error: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   res.status(400).json({ error: 'Failed to log in' });
  // }
};
exports.deleteUser = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   const user = await db.User.findOne({ where: { email } });

  //   if (user && await bcrypt.compare(password, user.password)) {
  //     res.status(200).json({ message: 'Login successful' });
  //   } else {
  //     res.status(400).json({ error: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   res.status(400).json({ error: 'Failed to log in' });
  // }
};