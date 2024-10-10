const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSequelize = require('@adminjs/sequelize');
const db = require('../models/index');

const authenticate = async (email, password) => {
	const user = await db.User.findOne({
		where: { email, role: 'admin' },
	});

	if (!user) {
		return null;
	}
	const validPassword = user.checkPassword(password);
	if (!validPassword) {
		return null;
	}
	return Promise.resolve({ email, password });
};

AdminJS.registerAdapter({
	Resource: AdminJSequelize.Resource,
	Database: AdminJSequelize.Database,
});

const makeRelationships = async (req) => {
	if (req.record.params) {
	  const { id, Categories } = req.record.params;
	  console.log(req.record.params);
	  const post = await db.Post.findByPk(id);
	  if (post) {
		// Add categories to the post
		// await post.setCategories(categories);
		if (Categories && Categories.length) {
			const categoriesToAdd = await db.Category.findAll({
			  where: { id: Categories },
			});
			await post.setCategories(categoriesToAdd);
		  }
	  }
	}
	return req;
  };
  

const locale = {
	translations: {
		labels: {
		},
		messages: {
			loginWelcome: 'Welcome to the Muffin QA forum admin page! Please provide admin credentials to continue.',
		},
	},
};

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
				editProperties: ['title', 'status', 'content', 'userId', 'categories'],
				showProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId', 'categories'],
				properties: {
					categories: {
						type: 'reference',
						reference: 'Categories',
						isArray: true,
						isVisible: { list: false, filter: false, show: true, edit: true },
					},
					// comments: {
					// 	type: 'reference',
					// 	reference: 'db.Comment',
					// 	isArray: true,
					// 	isVisible: { list: false, filter: false, show: true, edit: false },
					// },
					// likes: {
					// 	type: 'reference',
					// 	reference: 'db.Like',
					// 	isArray: true,
					// 	isVisible: { list: false, filter: false, show: true, edit: false },
					// },
				},
				actions: {
                    new: {
                        after: [makeRelationships],
                    },
                    edit: {
                        after: [makeRelationships],
                    },
				},
			},
		},
		db.Category,
		db.Comment,
		db.Like,
	],
	locale,
	branding: {
	},
});

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
