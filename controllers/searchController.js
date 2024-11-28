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
                where: { tag: q.slice(1) },
                attributes: { exclude: ['password'] }  // Exclude sensitive data like password
            });
        }
        // User search by name (u:)
        else if (q.startsWith('u:')) {
            results.users = await db.User.findAll({
                where: { name: { [db.Sequelize.Op.like]: `%${q.slice(2)}%` } },
                attributes: { exclude: ['password'] }
            });
        }
        // Category search (c:)
        else if (q.startsWith('c:')) {
            results.categories = await db.Category.findAll({
                where: { name: { [db.Sequelize.Op.like]: `%${q.slice(2)}%` } }
            });
        }
        // Post search (p:)
        else if (q.startsWith('p:')) {
            results.posts = await db.Post.findAll({
                where: { title: { [db.Sequelize.Op.like]: `%${q.slice(2)}%` } }
            });
        }
        // General content search (no prefix)
        else {
            results.general = await db.Post.findAll({
                where: {
                    [db.Sequelize.Op.or]: [
                        { title: { [db.Sequelize.Op.like]: `%${q}%` } },
                        { content: { [db.Sequelize.Op.like]: `%${q}%` } }
                    ]
                }
            });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to process search' });
    }
};
