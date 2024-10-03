'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});

  User.associate = function(models) {
    // A user can ask many questions
    User.hasMany(models.Question, { foreignKey: 'userId' });
    // A user can give many answers
    User.hasMany(models.Answer, { foreignKey: 'userId' });
  };

  return User;
};
