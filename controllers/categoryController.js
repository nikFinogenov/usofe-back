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

    const category = await db.Category.findByPk(req.params.category_id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const posts = await db.Post.findAndCountAll({
      where: {
        status,
      },
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: [
        {
          model: db.Category,
          as: "categories",
          where: { id: category.id },
          through: { attributes: [] },
        },
        "user"
      ],
      attributes: {
        include: [
          [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."postId" = "Post"."id")`), 'commentCount'],
          [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'like')`), 'likeCount'],
          [db.Sequelize.literal(`(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."postId" = "Post"."id" AND "Likes"."type" = 'dislike')`), 'dislikeCount']
        ]
      },
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    });

    res.status(200).json({
      posts: posts.rows,
      totalPosts: posts.count,
      totalPages: Math.ceil(posts.count / pageSize),
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
