const db = require("../models");

exports.search = async (req, res) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1; // Get the page number from the query
    const pageSize = 10; // Number of results per page
    const offset = (page - 1) * pageSize;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const results = {
            users: [],
            categories: [],
            posts: []
        };

        const queries = q.split(' ');

        let userQueryByAt = null;
        let userQueryByU = null;
        let categoryQueries = [];
        let postQuery = null;

        for (const query of queries) {
            if (query.startsWith('@')) {
                userQueryByAt = query.slice(1);
            } else if (query.startsWith('u:')) {
                userQueryByU = query.slice(2);
            } else if (query.startsWith('c:')) {
                categoryQueries.push(query.slice(2));
            } else if (query.startsWith('p:')) {
                postQuery = query.slice(2);
            } else {
                postQuery = query;
            }
        }

        if (userQueryByAt) {
            results.users = await db.User.findAll({
                where: {
                    login: { [db.Sequelize.Op.iLike]: `%${userQueryByAt}%` }
                },
                attributes: { exclude: ['password'] }
            });
            return res.status(200).json(results);
        }

        let userIds = [];
        if (userQueryByU) {
            const userResults = await db.User.findAll({
                where: {
                    [db.Sequelize.Op.or]: [
                        { login: { [db.Sequelize.Op.iLike]: `%${userQueryByU}%` } },
                        { fullName: { [db.Sequelize.Op.iLike]: `%${userQueryByU}%` } }
                    ]
                },
                attributes: { exclude: ['password'] }
            });
            results.users = userResults;
            userIds = userResults.map (user => user.id);
        }

        let categoryIds = [];
        if (categoryQueries.length > 0) {
            const categories = await db.Category.findAll({
                where: {
                    [db.Sequelize.Op.or]: categoryQueries.map(cat => ({
                        title: { [db.Sequelize.Op.iLike]: `%${cat}%` }
                    }))
                },
                attributes: {
                    include: [
                        [
                            db.Sequelize.literal(`(SELECT COUNT(*) FROM "PostCategories" WHERE "PostCategories"."categoryId" = "Category"."id")`),
                            'postCount'
                        ]
                    ]
                }
            });
            results.categories = categories;
            categoryIds = categories.map(cat => cat.id);
        }

        const postConditions = [];

        if (postQuery) {
            postConditions.push({
                [db.Sequelize.Op.or]: [
                    { title: { [db.Sequelize.Op.iLike]: `%${postQuery}%` } }
                ]
            });
        }

        if (userIds.length > 0) {
            postConditions.push({ userId: { [db.Sequelize.Op.in]: userIds } });
        }

        const posts = await db.Post.findAll({
            where: postConditions.length > 0
                ? { [db.Sequelize.Op.and]: postConditions }
                : {},
            include: [
                {
                    association: "categories",
                    where: categoryIds.length > 0
                        ? { id: { [db.Sequelize.Op.in]: categoryIds } }
                        : undefined,
                    required: categoryIds.length > 0
                }
            ],
            limit: pageSize,
            offset: offset
        });

        results.posts = posts;

        res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to process search' });
    }
};