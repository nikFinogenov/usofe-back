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
        // console.log(favourite);
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
        sortBy = 'createdAt',  // Например, сортировка по дате добавления
        order = 'DESC',        // Сортировка по убыванию
    } = req.query;

    try {
        const userId = req.user.id;
        const offset = (page - 1) * pageSize;

        // Определяем сортировку
        const orderBy = [[sortBy, order.toUpperCase()]];

        // Находим все избранные посты с пагинацией и сортировкой
        const favourites = await db.Favourite.findAndCountAll({
            where: { userId },
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            include: [
                {
                    model: db.Post,   // Используем правильную ассоциацию с постом
                    required: true,    // Убедитесь, что посты будут загружены
                    include: [
                        { model: db.Category, as: 'categories' },  // Добавляем категории поста
                        { model: db.User, as: 'user' }  // Добавляем пользователя, который создал пост
                    ]
                }
            ],
            order: orderBy,
        });

        // Отправляем результат
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


