module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    publishDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {});

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, { as: 'author', foreignKey: 'authorId' });
    Comment.belongsTo(models.Post, { foreignKey: 'postId' });
    Comment.hasMany(models.Like, { foreignKey: 'commentId' });
  };

  return Comment;
};
