module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
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

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Comment.belongsTo(models.Post, { foreignKey: 'postId' });
    Comment.hasMany(models.Like, { foreignKey: 'commentId', onDelete: 'CASCADE', hooks: true });
  };

  return Comment;
};