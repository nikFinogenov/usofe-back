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

		// Собираем уникальные категории из записи
		for (const key in req.record.params) {
			if (key.startsWith('categories.')) {
				const CategoryId = req.record.params[key];
				uniqueCategories.add(CategoryId);
			}
		}

		try {
			// Находим все категории по уникальным ID
			const categories = await db.Category.findAll({
				where: { id: Array.from(uniqueCategories) }, // Set -> Array
			});

			// Находим пост по ID и связываем с категориями
			const post = await db.Post.findByPk(id);
			if (post) {
				await post.setCategories(categories); // Ассоциируем пост с категориями
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
		// {
		// 	resource: db.User,
		// 	options: {
		// 		listProperties: ['id', 'login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
		// 		filterProperties: ['id', 'login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
		// 		editProperties: ['login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
		// 		showProperties: ['id', 'login', 'fullName', 'email', 'role', 'rating', 'emailConfirmed'],
		// 	},
		// },
		// {
		// 	resource: db.Post,
		// 	options: {
		// 		listProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId', 'categories'],
		// 		filterProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId', 'categories'],
		// 		editProperties: ['title', 'status', 'content', 'userId', 'categories'],
		// 		showProperties: ['id', 'title', 'status', 'content', 'createdAt', 'updatedAt', 'userId', 'categories'],
		// 		properties: {
		// 			categories: {
		// 				type: 'reference',
		// 				reference: 'Categories',
		// 				isArray: true,
		// 				isVisible: { list: false, filter: false, show: true, edit: true },
		// 			},
		// 			// comments: {
		// 			// 	type: 'reference',
		// 			// 	reference: 'db.Comment',
		// 			// 	isArray: true,
		// 			// 	isVisible: { list: false, filter: false, show: true, edit: false },
		// 			// },
		// 			// likes: {
		// 			// 	type: 'reference',
		// 			// 	reference: 'db.Like',
		// 			// 	isArray: true,
		// 			// 	isVisible: { list: false, filter: false, show: true, edit: false },
		// 			// },
		// 		},
		// 		actions: {
		// 			actions: {
		// 				edit: {
		// 				  after: async (response, request, context) => {
		// 					const { record } = context;
		// 					if (record && record.params.id) {
		// 					  const post = await db.Post.findByPk(record.params.id, {
		// 						include: [
		// 						  {
		// 							model: db.Category,
		// 							as: 'categories', // Указываем alias, который используется в модели
		// 						  },
		// 						],
		// 					  });
					  
		// 					  if (post) {
		// 						// Присваиваем категории в params
		// 						record.params.categories = post.categories.map(category => category.id);
		// 					  }
		// 					}
		// 					return response;
		// 				  },
		// 				},
		// 				show: {
		// 				  after: async (response, request, context) => {
		// 					const { record } = context;
		// 					if (record && record.params.id) {
		// 					  const post = await db.Post.findByPk(record.params.id, {
		// 						include: [
		// 						  {
		// 							model: db.Category,
		// 							as: 'categories',
		// 						  },
		// 						],
		// 					  });
					  
		// 					  if (post) {
		// 						// Присваиваем категории в params
		// 						record.params.categories = post.categories.map(category => category.id);
		// 					  }
		// 					}
		// 					return response;
		// 				  },
		// 				},
		// 				new: {
		// 				  after: async (response, request, context) => {
		// 					const { record } = context;
		// 					if (record && record.params.id) {
		// 					  const post = await db.Post.findByPk(record.params.id, {
		// 						include: [
		// 						  {
		// 							model: db.Category,
		// 							as: 'categories',
		// 						  },
		// 						],
		// 					  });
					  
		// 					  if (post) {
		// 						// Присваиваем категории в params
		// 						record.params.categories = post.categories.map(category => category.id);
		// 					  }
		// 					}
		// 					return response;
		// 				  },
		// 				},
		// 			  },
					
		// 		},
		// 	},
		// },
		db.User,
		db.Post,
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
