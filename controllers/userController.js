const db = require('../models');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
// const { sendConfirmationEmail, sendResetEmail } = require('../services/emailService');


const defaultAvatars = [
  'face_1.png',
  'face_2.png',
  'face_3.png',
  'face_4.png',
  'face_5.png'
];
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
    const newAvatar = 'http://localhost:3306/avatars/' + req.file.filename;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the old avatar is not one of the default avatars and delete it
    const oldAvatarFileName = user.profilePicture && path.basename(user.profilePicture);
    if (oldAvatarFileName && !defaultAvatars.includes(oldAvatarFileName)) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', oldAvatarFileName);

      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath); // Delete the old avatar
      }
    }

    // Update the user's profile picture with the new one
    user.profilePicture = newAvatar;
    await user.save();

    res.status(200).json({ message: 'Avatar updated successfully', avatar: newAvatar });
  } catch (error) {
    console.error(error);
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

    if (Number(user.id) !== Number(user_id)) {
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    // Check for unique login if it's being updated
    if (login && login !== user.login) {
      const existingLoginUser = await db.User.findOne({ where: { login } });
      if (existingLoginUser) {
        return res.status(400).json({ error: 'Login already exists' });
      }
    }

    // Check for unique email if it's being updated
    if (email && email !== user.email) {
      const existingEmailUser = await db.User.findOne({ where: { email } });
      if (existingEmailUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update fields if they are provided in the request
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (login) user.login = login;
    if (password) user.password = password;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error });
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
    console.log(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.deleteUserPosts = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await db.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPosts = await db.Post.findAll({ where: { userId: user_id } });

    // Delete each post individually to trigger cascading deletes on comments
    for (const post of userPosts) {
      await post.destroy(); 
    }
    res.status(200).json({ message: 'All posts deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete posts' });
  }
};

// Deletes all comments by a user
exports.deleteUserComments = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await db.User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // await db.Comment.destroy({ where: { userId: user_id } });
    const userComments = await db.Comment.findAll({ where: { userId: user_id } });

    // Delete each post individually to trigger cascading deletes on comments
    for (const comment of userComments) {
      await comment.destroy(); 
    }
    res.status(200).json({ message: 'All comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comments' });
  }
};

exports.getUserPosts = async (req, res) => {
  const {
    page = 1,
    pageSize = 12,
    sortBy = 'createdAt',
    order = 'DESC',
    status = null
  } = req.query;
  const { user_id } = req.params;
  const authToken = req.headers.authorization;

  try {
    const offset = (page - 1) * pageSize;
    let posts;

    const where = {};
    where.userId = user_id;
    // if(!user_id) res.status(401).json({ error: 'Invalid token' });
    // console.log(user_id);
    if (authToken) {
      try {
        req.user = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET);
        if (req.user.role !== "admin" && req.user.id !== user_id) {
          where.status = "active";
        }
      } catch {
        where.status = "active";
      }
    } else {
      where.status = "active";
    }

    if (status) {
      where.status = status;
    }
    // console.log(where);

    const orderBy = [[sortBy, order.toUpperCase()]];

    posts = await db.Post.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: ["categories", "user"],
      attributes: {
        include: [
          [db.Sequelize.literal(`
            (SELECT COUNT(*) 
             FROM "Comments" AS reply 
             WHERE "reply"."postId" = "Post"."id" 
             AND "reply"."status" = 'active' 
             AND ("reply"."replyId" IS NULL OR EXISTS (
                 SELECT 1 
                 FROM "Comments" AS parent 
                 WHERE parent."id" = reply."replyId" 
                 AND parent."status" = 'active'
             ))
            )
        `), 'commentCount'],             
          [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'like')`), 'likeCount'],
          [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'dislike')`), 'dislikeCount']
        ]
      },
      order: orderBy,
      distinct: true
    });
    

    res.status(200).json({
      posts: posts.rows,
      totalPosts: posts.count,
      totalPages: Math.ceil(posts.count / pageSize),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.user_id, {
      attributes: ['id', 'fullName', 'login', 'email', 'profilePicture', 'role', 'rating', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Получение количества постов
    const totalPosts = await db.Post.count({
      where: { userId: user.id, status: 'active' },
    });

    // Получение последнего комментария
    const lastComment = await db.Comment.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      attributes: ['content', 'createdAt'],
    });

    const accountAge = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)); // Возраст аккаунта в днях

    res.status(200).json({
      user,
      stats: {
        totalPosts,
        lastComment: lastComment || null,
        accountAge,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user stats' });
  }
};
