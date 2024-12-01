const db = require("../models");
const jwt = require('jsonwebtoken');
exports.getDatePosts = async (req, res) => {
    const { date } = req.params; // Extract date from request parameters
    const authToken = req.headers.authorization;
    let {
        page = 1,
        pageSize = 12,
        sortBy = 'createdAt',
        order = 'DESC',
        status = null
    } = req.query;
    // console.log(authToken);
    if (authToken) req.user = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET);
    // const userId = req.user ? req.user.id : null; // Проверяем, есть ли авторизация
    if (authToken) {
        try {
            req.user = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET);
            if (req.user.role !== "admin") {
                status = "active"; // Неадминистраторы могут видеть только активные посты
            }
        } catch {
            status = "active"; // По умолчанию активные посты, если токен недействителен
        }
    } else {
        status = "active"; // По умолчанию активные посты, если токен не предоставлен
    }
    // if (status) {
    //     status = status;
    // }
    // console.log(status);
    // status = 'active';
    try {
        const offset = (page - 1) * pageSize;

        const where = {
            [db.Sequelize.Op.and]: [
                db.Sequelize.where(
                    db.Sequelize.fn('DATE', db.Sequelize.col('Post.createdAt')), '=', // Specify the table alias
                    date
                ),
                status ? { status: status } : ""// Filter by status
            ]
        };

        const orderBy = [[sortBy, order.toUpperCase()]];

        const posts = await db.Post.findAndCountAll({
            where,
            include: [
                {
                    model: db.User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'login', "profilePicture"]
                },
                {
                    model: db.Category,
                    as: 'categories',
                    attributes: ['id', 'title'],
                    through: { attributes: [] }
                }
            ],
            attributes: {
                include: [
                    [db.Sequelize.literal(`
              (SELECT COUNT(*) 
               FROM "Comments" AS reply 
               WHERE "reply"."postId" = "Post"."id" 
               AND "reply"."status" = 'active' 
               AND ("reply"."replyId" IS NULL OR EXISTS (
                   SELECT 1 
                   FROM "Comments" AS parent 
                   WHERE parent."id" = reply."replyId" 
                   AND parent."status" = 'active'
               ))
              )
            `), 'commentCount'],
                    [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'like')`), 'likeCount'],
                    [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'dislike')`), 'dislikeCount']
                ]
            },
            limit: pageSize,
            offset: offset,
            order: orderBy,
        });

        if (!posts || posts.count === 0) return res.status(404).json({ error: "No posts found for the given date" });

        res.status(200).json({
            posts: posts.rows,
            totalPosts: posts.count,
            totalPages: Math.ceil(posts.count / pageSize),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve posts for the specified date" });
    }
};
