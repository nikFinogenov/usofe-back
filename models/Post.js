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
    },    
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {});

  Post.associate = function (models) {
    Post.belongsTo(models.User, { as: 'user', foreignKey: 'userId'});
    Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE', hooks: true });
    Post.hasMany(models.Like, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE', hooks: true });
    Post.hasMany(models.Favourite, { foreignKey: 'postId', onDelete: 'CASCADE', hooks:true  });
    Post.belongsToMany(models.Category, { through: 'PostCategories', as: 'categories', foreignKey: 'postId', timestamps: false });
  };

  return Post;
};
