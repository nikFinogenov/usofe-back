module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {
        publishDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        type: {
            type: DataTypes.ENUM('like', 'dislike'),
            allowNull: false
        }
    }, {});

    Like.associate = function (models) {
        Like.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
        Like.belongsTo(models.Post, { foreignKey: 'postId' });
        Like.belongsTo(models.Comment, { foreignKey: 'commentId' });
    };

    return Like;
};
