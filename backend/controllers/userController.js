const db = require('../models');
const bcrypt = require('bcrypt');

// Register user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['password'] }, // Exclude password from the response
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

// Login user (basic example, add JWT later)
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
    const { login, email, password, passwordConfirmation, role } = req.body;

    // Validate password confirmation
    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if login or email already exists
    const existingUser = await db.User.findOne({
      where: { [Op.or]: [{ login }, { email }] },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Login or email already exists' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with role (admin can assign any role)
    const newUser = await db.User.create({
      login,
      email,
      password: hashedPassword,
      role: role || 'user', // Default to 'user' if no role is specified
    });

    res.status(201).json({ message: 'User created successfully', newUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming `userId` is coming from the logged-in user's token
    const avatar = req.file.path; // Assuming you are using `multer` for file uploads

    // Find the user
    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update avatar field
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
    const { fullName, email } = req.body; // You can add more fields to update as needed

    // Find the user
    const user = await db.User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user data' });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find and delete the user
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