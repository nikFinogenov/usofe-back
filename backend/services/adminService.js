const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSequelize = require('@adminjs/sequelize');
const db = require('../models/index'); // Assuming your Sequelize models are exported from here

const authenticate = async (email, password) => {
  const user = await db.User.findOne({
    where: { email, role: 'admin' },
  });

  if (!user) {
    return null;
  }
  const validPassword = user.checkPassword(password); // Assuming your User model has a `checkPassword` method
  if (!validPassword) {
    return null;
  }
  return Promise.resolve({ email, password });
};

AdminJS.registerAdapter({
  Resource: AdminJSequelize.Resource,
  Database: AdminJSequelize.Database,
});

// Helper function to handle relationships after a new Post is created
const makeRelationships = async (req) => {
  if (req.record.params) {
    const { id } = req.record.params;
    for (const key in req.record.params) {
      if (key.startsWith('categories.')) {
        const CategoryId = req.record.params[key];
        try {
          const post = await db.Post.findByPk(id);
          await post.addCategory(CategoryId); // Add the Category to the Post
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  return req;
};

// Locale customization for AdminJS interface
const locale = {
  translations: {
    labels: {
      // Customize labels here
    },
    messages: {
      loginWelcome: 'Welcome to the Muffin QA forum admin page! Please provide admin credentials to continue.',
    },
  },
};

// AdminJS instance setup
const admin = new AdminJS({
  resources: [
    {
      resource: db.User,
      options: {
        listProperties: ['id', 'login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
        filterProperties: ['id', 'login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
        editProperties: ['login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
        showProperties: ['id', 'login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
      },
    },
    {
      resource: db.Post,
      options: {
        listProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId'],
        filterProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId'],
        editProperties: ['title', 'status', 'content', 'userId'],
        showProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId'],
        properties: {
          categories: {
            type: 'reference',
            reference: 'Category', // Reference the Category model for many-to-many relationship
            isArray: true,
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
          comments: {
            type: 'reference',
            reference: 'Comment', // Reference the Comment model
            isArray: true,
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
          likes: {
            type: 'reference',
            reference: 'Like', // Reference the Like model
            isArray: true,
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
        },
        actions: {
          new: {
            after: [makeRelationships], // Ensure the categories are handled after Post creation
          },
        },
      },
    },
    db.Category, // Direct reference to the Category model
    db.Comment,  // Direct reference to the Comment model
    db.Like,     // Direct reference to the Like model
  ],
  locale,
  branding: {
    // Customize branding here if needed
    // companyName: 'Muffin',
    // logo: 'muf.png',
  },
});

// AdminJS router setup with authentication
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: 'sessionsecret',
  },
  null,
  {
    resave: true,
    saveUninitialized: true,
  }
);

module.exports = adminRouter;
