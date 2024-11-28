const db = require("../models");

exports.search = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const results = {};

        // User search by tag (@)
        if (q.startsWith('@')) {
            results.users = await db.User.findAll({
                where: { login: { [db.Sequelize.Op.iLike]: q.slice(1) } },  // Use iLike for case-insensitive search
                attributes: { exclude: ['password'] }
            });
        }
        // User search by name (u:)
        else if (q.startsWith('u:')) {
            results.users = await db.User.findAll({
                where: { fullName: { [db.Sequelize.Op.iLike]: `%${q.slice(2)}%` } },  // Use iLike for case-insensitive search
                attributes: { exclude: ['password'] }
            });
        }
        // Category search (c:)
        else if (q.startsWith('c:')) {
            results.categories = await db.Category.findAll({
                where: { title: { [db.Sequelize.Op.iLike]: `%${q.slice(2)}%` } }  // Use iLike for case-insensitive search
            });
        }
        // Post search (p:)
        else if (q.startsWith('p:')) {
            results.posts = await db.Post.findAll({
                where: { title: { [db.Sequelize.Op.iLike]: `%${q.slice(2)}%` } }  // Use iLike for case-insensitive search
            });
        }
        // General content search (no prefix)
        else {
            results.posts = await db.Post.findAll({
                where: {
                    [db.Sequelize.Op.or]: [
                        { title: { [db.Sequelize.Op.iLike]: `%${q}%` } },  // Use iLike for case-insensitive search
                        { content: { [db.Sequelize.Op.iLike]: `%${q}%` } }  // Use iLike for case-insensitive search
                    ]
                }
            });
        }
        // console.log(results);

        res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to process search' });
    }
};
