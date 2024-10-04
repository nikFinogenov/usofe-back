module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {});

  Category.associate = function (models) {
    Category.belongsToMany(models.Post, { through: 'PostCategories', foreignKey: 'categoryId' });
  };

  return Category;
};
