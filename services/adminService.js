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
		const { id } = req.record.params;
		let uniqueCategories = new Set();

		for (const key in req.record.params) {
			if (key.startsWith('categories.')) {
				const CategoryId = req.record.params[key];
				uniqueCategories.add(CategoryId);
			}
		}

		try {
			const categories = await db.Category.findAll({
				where: { id: Array.from(uniqueCategories) },
			});

			const post = await db.Post.findByPk(id);
			if (post) {
				await post.setCategories(categories);
			}
		} catch (err) {
			console.error('Ошибка при установке категорий:', err);
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
		db.User,
		db.Post,
		db.Category,
		db.Comment,
		db.Like,
		db.Favourite
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
