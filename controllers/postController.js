const { Op } = require("sequelize");
const db = require("../models");
const jwt = require('jsonwebtoken');
const { tr } = require("@faker-js/faker");

exports.getAllPosts = async (req, res) => {
  const { page = 1, pageSize = 12, sortBy = 'newest', order = 'desc', filter = 'all' } = req.query;

  try {
    const authToken = req.headers.authorization;
    const where = {};

    // Проверка авторизации пользователя
    if (authToken) {
      try {
        req.user = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET);
        if (req.user.role !== "admin") {
          where.status = "active"; // Неадминистраторы могут видеть только активные посты
        }
      } catch {
        where.status = "active"; // По умолчанию активные посты, если токен недействителен
      }
    } else {
      where.status = "active"; // По умолчанию активные посты, если токен не предоставлен
    }

    // Настройка условия where в зависимости от фильтра
    if (filter === 'active') {
      where.status = 'active';
    } else if (filter === 'inactive') {
      where.status = 'inactive';
    }

    const offset = (page - 1) * pageSize;

    // Определение порядка сортировки
    let orderCriteria = [];

    switch (sortBy) {
      case 'newest':
        orderCriteria.push(['createdAt', 'DESC']);
        break;
      case 'oldest':
        orderCriteria.push(['createdAt', 'ASC']);
        break;
      case 'most':
        orderCriteria.push([db.Sequelize.literal('rating'), 'DESC']);
        break;
      case 'less':
        orderCriteria.push([db.Sequelize.literal('rating'), 'ASC']);
        break;
      case 'popular':
        orderCriteria.push(['views', 'DESC']);
        break;
      case 'unpopular':
        orderCriteria.push(['views', 'ASC']);
        break;
      default:
        orderCriteria.push(['createdAt', 'DESC']); // По умолчанию по новизне
        break;
    }

    // Получение постов с пагинацией и необходимыми ассоциациями
    const { rows: postsData, count: totalPosts } = await db.Post.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: ["categories", "user"],
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
          [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'dislike')`), 'dislikeCount'],
          'views',
          // Расчёт рейтинга для каждого поста
          [db.Sequelize.literal(`
            (SELECT COUNT(*) 
             FROM "Likes" 
             WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'like') 
            - 
            (SELECT COUNT(*) 
             FROM "Likes" 
             WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'dislike')
          `), 'rating']
        ]
      },
      order: orderCriteria,
      distinct: true
    });

    // Возврат пагинированных постов с общим количеством и количеством страниц
    res.status(200).json({
      posts: postsData,
      totalPosts,
      totalPages: Math.ceil(totalPosts / pageSize),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Не удалось получить посты" });
  }
};

exports.getPost = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    // console.log(authToken);
    if (authToken) req.user = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET);
    const userId = req.user ? req.user.id : null; // Проверяем, есть ли авторизация
    const post = await db.Post.findByPk(req.params.post_id, {
      include: [
        "categories",
        "user",
        "likes",
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Увеличиваем просмотры
    await post.increment("views", { by: 1 });

    // Добавляем информацию о фаворите, если пользователь авторизован
    if (userId) {
      const favourite = await db.Favourite.findOne({
        where: { userId, postId: post.id },
      });
      if (favourite) post.setDataValue('isFavourited', true);
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve post" });
  }
};

exports.getRandomPost = async (req, res) => {
  try {
    const count = await db.Post.count({ where: { status: 'active' } });

    if (count === 0) {
      return res.status(404).json({ message: "No active posts available" });
    }

    let randomPost;
    while (!randomPost) {
      const randomIndex = Math.floor(Math.random() * count);
      randomPost = await db.Post.findOne({
        where: { status: 'active' },
        offset: randomIndex,
      });
    }

    res.status(200).json({ id: randomPost.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPostComments = async (req, res) => {
  const { page = 1, pageSize = 10, sortBy = 'most', order = 'desc', filter = 'all' } = req.query;  // Get pagination, sorting, and filtering parameters

  try {
    const postId = req.params.post_id;
    const authToken = req.headers.authorization;
    const whereCondition = { postId };

    const post = await db.Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Determine visibility of comments based on user role
    if (authToken) {
      try {
        req.user = jwt.verify(authToken.split(' ')[1], process.env.JWT_SECRET);
        if (req.user.role !== "admin" && Number(req.user.id) !== Number(post.userId)) {
          whereCondition.status = "active";
        }
      } catch {
        whereCondition.status = "active";
      }
    } else {
      whereCondition.status = "active";
    }

    // Adjust the where condition based on the filter
    if (filter === 'active') {
      whereCondition.status = 'active';
    } else if (filter === 'inactive') {
      whereCondition.status = 'inactive';
    }
    // Fetch all comments without pagination first
    const allComments = await db.Comment.findAll({
      where: whereCondition,
      include: ["likes", "user"],
    });

    // Fetch likes and dislikes counts for each comment
    const commentIds = allComments.map(comment => comment.id);
    const likesCounts = await db.Like.findAll({
      where: {
        commentId: commentIds,
        type: 'like'
      },
      attributes: ['commentId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['commentId']
    });

    const dislikesCounts = await db.Like.findAll({
      where: {
        commentId: commentIds,
        type: 'dislike'
      },
      attributes: ['commentId', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['commentId']
    });

    // Map counts to a rating for each comment
    const ratings = {};
    likesCounts.forEach(like => {
      ratings[like.commentId] = (ratings[like.commentId] || 0) + like.get('count');
    });
    dislikesCounts.forEach(dislike => {
      ratings[dislike.commentId] = (ratings[dislike.commentId] || 0) - dislike.get('count');
    });

    // Filter out replies to inactive comments
    const activeCommentIds = allComments
      .filter(comment => comment.status === 'active')
      .map(comment => comment.id);

    const filteredComments = allComments.filter(comment => {
      // Keep top-level comments or replies where the parent comment is active
      return !comment.replyId || activeCommentIds.includes(comment.replyId);
    });

    // Sort comments based on the requested sorting criteria
    if (sortBy === 'most' || sortBy === 'less') {
      filteredComments.sort((a, b) => {
        const ratingA = ratings[a.id] || 0;
        const ratingB = ratings[b.id] || 0;

        // Сначала сортируем по рейтингу
        if (ratingA !== ratingB) {
          return (ratingB - ratingA); // Сортируем по рейтингу (больше впереди)
        }

        // Если рейтинги равны, сортируем по дате создания (от старых к новым)
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      // Если порядок 'asc', то инвертируем массив
      if (order === 'asc') {
        filteredComments.reverse();
      }
    } else if (sortBy === 'newest' || sortBy === 'oldest') {
      // Сортировка только по дате создания
      filteredComments.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt); // От старых к новым
      });

      // Если порядок 'desc', инвертируем массив
      if (order === 'desc') {
        filteredComments.reverse();
      }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Apply pagination
    const paginatedComments = filteredComments.slice(offset, offset + pageSize);

    // Return paginated comments with total count and total pages
    res.status(200).json({
      comments: paginatedComments,
      totalComments: filteredComments.length,
      totalPages: Math.ceil(filteredComments.length / pageSize),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content, replyId } = req.body;
    const newComment = await db.Comment.create({
      content,
      replyId,
      userId: req.user.id,
      postId: req.params.post_id,
    });
    const commentWithDetails = await db.Comment.findByPk(newComment.id, {
      include: ["likes", "user"], // Включаем ассоциации
    });

    res.status(201).json(commentWithDetails);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to create comment" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.post_id, {
      include: ["categories"],
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json(post.categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
};

exports.getAllLikes = async (req, res) => {
  try {
    const likes = await db.Like.findAll({
      where: { postId: req.params.post_id },
    });

    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve likes" });
  }
};
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const newPost = await db.Post.create({
      title,
      content,
      userId: req.user.id,
    });

    if (categories && categories.length) {
      const categoriesToAdd = await db.Category.findAll({
        where: { id: categories },
      });
      await newPost.setCategories(categoriesToAdd);
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to create post" });
  }
};

exports.createLike = async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.post_id);
    const { type } = req.body
    if (!type || (type !== "dislike" && type !== "like")) return res.status(404).json({ error: 'Type not found' });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const existingLike = await db.Like.findOne({
      where: {
        userId: req.user.id,
        postId: req.params.post_id
      }
    });
    if (existingLike) {
      if (existingLike.type !== type) {
        existingLike.type = type;
        await existingLike.save();
        await db.User.increment("rating", {
          by: existingLike.type == "dislike" ? -2 : 2,
          where: { id: post.userId },
        });
        return res.status(200).json({ message: 'Like type updated successfully', like: existingLike });
      } else {
        return res.status(400).json({ error: 'You have already liked this comment with the same type' });
      }
    }
    const like = await db.Like.create({
      postId: req.params.post_id,
      userId: req.user.id,
      type: type,
    });

    await db.User.increment("rating", {
      by: type == "dislike" ? -1 : 1,
      where: { id: post.userId },
    });

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: "Failed to add like" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories, status } = req.body;
    const post = await db.Post.findByPk(req.params.post_id);

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (req.user.role !== "admin") {
      if (post.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this post" });
      }
      post.title = title || post.title;
      post.content = content || post.content;
    }
    else {
      post.title = title || post.title;
      post.content = content || post.content;
      post.status = status || post.status;
    }

    await post.save();
    // console.log(post);
    if (categories) {
      const updatedCategories = await db.Category.findAll({
        where: { id: categories },
      });
      await post.setCategories(updatedCategories);
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.post_id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.userId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this post" });
    }

    await post.destroy();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};
exports.deleteLike = async (req, res) => {
  try {
    const like = await db.Like.findOne({
      where: {
        postId: req.params.post_id,
        userId: req.user.id,
      },
    });

    if (!like) return res.status(404).json({ error: "Like not found" });
    const type = like.type;
    await like.destroy();
    const post = await db.Post.findByPk(req.params.post_id);
    await db.User.increment("rating", {
      by: type === 'dislike' ? 1 : -1,
      where: { id: post.userId },
    });

    res.status(200).json({ message: "Like removed and rating updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove like" });
  }
};
