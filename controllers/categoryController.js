const db = require("../models");

exports.getAllCategories = async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    order = 'DESC',
  } = req.query;

  try {
    const offset = (page - 1) * pageSize;
    const where = {};
    const orderBy = [[sortBy, order.toUpperCase()]];

    const categories = await db.Category.findAndCountAll(
      {
        limit: parseInt(pageSize),
        offset: parseInt(offset),
        attributes: {
          include: [
            [db.Sequelize.literal(`(SELECT COUNT(*) FROM "PostCategories" WHERE "PostCategories"."categoryId" = "Category"."id")`), 'postCount'],
          ]
        },
        order: orderBy,
        distinct: true
      }
    );
    res.status(200).json({
      categories: categories.rows,
      totalCategories: categories.count,
      totalPages: Math.ceil(categories.count / pageSize),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.category_id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve category" });
  }
};

exports.getCategoryPosts = async (req, res) => {
  const {
    page = 1,
    pageSize = 12,
    sortBy = 'createdAt',
    order = 'DESC',
    status = 'active'
  } = req.query;

  try {
    const offset = (page - 1) * pageSize;
    const where = {};

    if (status) {
      where.status = status;
    }

    const orderBy = [[sortBy, order.toUpperCase()]];

    const category = await db.Category.findByPk(req.params.category_id, {
      where,
      include: [
        {
          model: db.Post,
          as: 'posts',
          through: { attributes: [] },
          order: orderBy,
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
             WHERE "reply"."postId" = "posts"."id" 
             AND "reply"."status" = 'active' 
             AND ("reply"."replyId" IS NULL OR EXISTS (
                 SELECT 1 
                 FROM "Comments" AS parent 
                 WHERE parent."id" = reply."replyId" 
                 AND parent."status" = 'active'
             ))
            )
        `), 'commentCount'],
              [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "posts"."id" AND "Likes"."type" = 'like')`), 'likeCount'],
              [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "posts"."id" AND "Likes"."type" = 'dislike')`), 'dislikeCount']
            ]
          },
        }
      ],
    });
    // console.log(category.posts.length);
    const count = category.posts.length;
    category.posts = category.posts.slice((parseInt(page) - 1) * pageSize, parseInt(page) * pageSize)
    if (!category) return res.status(404).json({ error: "Category not found" });
    // console.log(category);
    res.status(200).json({
      title: category.title,
      posts: category.posts,
      totalPosts: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve posts for category" });
  }
};


exports.createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.rating < 50) {
      return res.status(403).json({
        error: "You must have a rating of at least 50 to create a category",
      });
    }
    if (!title) return res.status(400).json({ error: "Title is required" });

    const newCategory = await db.Category.create({ title, description });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const category = await db.Category.findByPk(req.params.category_id);

    if (!category) return res.status(404).json({ error: "Category not found" });

    category.title = title || category.title;
    category.description = description || category.description;
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.category_id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};
