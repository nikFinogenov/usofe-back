const db = require('../models');

exports.addFavourite = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const post = await db.Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const favourite = await db.Favourite.create({ userId, postId: post_id });
        res.status(201).json(favourite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFavourite = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const favourite = await db.Favourite.findOne({ where: { userId, postId: post_id } });
        if (!favourite) {
            return res.status(404).json({ message: 'Favourite not found' });
        }

        await favourite.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFavourites = async (req, res) => {
    const {
        page = 1,
        pageSize = 12,
        sortBy = 'createdAt',
        order = 'DESC',
    } = req.query;

    try {
        const userId = req.user.id;
        const offset = (page - 1) * pageSize;

        const orderBy = [[sortBy, order.toUpperCase()]];

        const favourites = await db.Favourite.findAndCountAll({
            where: { userId },
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            include: [
                {
                    model: db.Post,
                    required: true,
                    include: [
                        { model: db.Category, as: 'categories' },
                        { model: db.User, as: 'user' }
                    ]
                }
            ],
            order: orderBy,
        });

        res.status(200).json({
            favourites: favourites.rows,
            totalFavourites: favourites.count,
            totalPages: Math.ceil(favourites.count / pageSize),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


