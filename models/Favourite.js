module.exports = (sequelize, DataTypes) => {
    const Favourite = sequelize.define('Favourite', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    Favourite.associate = (models) => {
        Favourite.belongsTo(models.User, { foreignKey: 'userId' });
        Favourite.belongsTo(models.Post, { foreignKey: 'postId' });
    };

    return Favourite;
};
