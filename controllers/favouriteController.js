const db = require('../models');

exports.addFavorite = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const post = await db.Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const favorite = await db.Favorite.create({ userId, postId: post_id });
        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;

        const favorite = await db.Favorite.findOne({ where: { userId, postId: post_id } });
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        await favorite.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await db.Favorite.findAll({
            where: { userId },
            include: [{ model: db.Post, as: 'post' }]
        });

        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
