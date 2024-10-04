module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    publishDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {});

  Post.associate = function (models) {
    Post.belongsTo(models.User, { as: 'author', foreignKey: 'authorId' });
    Post.belongsToMany(models.Category, { through: 'PostCategories', foreignKey: 'postId' });
    Post.hasMany(models.Comment, { foreignKey: 'postId' });
    Post.hasMany(models.Like, { foreignKey: 'postId' });
  };

  return Post;
};
