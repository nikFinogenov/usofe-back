const db = require('../models');

// Create a post
exports.getAllPosts = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query; // Default to page 1 and 10 posts per page

  try {
    const offset = (page - 1) * pageSize;
    const posts = await db.Post.findAndCountAll({
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: ['categories', 'user'],
    });

    res.status(200).json({
      posts: posts.rows,
      totalPosts: posts.count,
      totalPages: Math.ceil(posts.count / pageSize),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.post_id, {
      include: ['categories', 'user', 'comments'],
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
};

exports.getPostComments = async (req, res) => {
  try {
    const comments = await db.Comment.findAll({
      where: { postId: req.params.post_id },
      include: ['user'],
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const newComment = await db.Comment.create({
      content,
      userId: req.user.id, // Assuming user is authenticated
      postId: req.params.post_id,
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create comment' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.post_id, {
      include: ['categories'],
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.status(200).json(post.categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
};

exports.getAllLikes = async (req, res) => {
  try {
    const likes = await db.Like.findAll({
      where: { postId: req.params.post_id },
    });

    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve likes' });
  }
};
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const newPost = await db.Post.create({
      title,
      content,
      userId: req.user.id, // Assuming user is authenticated
    });

    // Associate categories if provided
    if (categories && categories.length) {
      const categoriesToAdd = await db.Category.findAll({
        where: { id: categories },
      });
      await newPost.setCategories(categoriesToAdd);
    }

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create post' });
  }
};

exports.createLike = async (req, res) => {
  try {
    const like = await db.Like.create({
      postId: req.params.post_id,
      userId: req.user.id,
      type: 'like',
    });

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add like' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const post = await db.Post.findByPk(req.params.post_id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Check if the current user is the creator of the post
    if (req.user.role !== 'admin') {
      if (post.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to update this post' });
      }
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    // Update categories
    if (categories) {
      const updatedCategories = await db.Category.findAll({
        where: { id: categories },
      });
      await post.setCategories(updatedCategories);
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.post_id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Check if the current user is the creator of the post
    if (req.user.role !== 'admin') {
      if (post.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this post' });
      }
    }

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
exports.deleteLike = async (req, res) => {
  try {
    // console.log(req.user.id);
    const like = await db.Like.findOne({
      where: {
        postId: req.params.post_id,
        userId: req.user.id,
      },
    });

    if (!like) return res.status(404).json({ error: 'Like not found' });

    // await like.destroy();
    res.status(200).json({ message: 'Like removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove like' });
  }
};