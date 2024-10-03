'use strict';
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {});

  Question.associate = function(models) {
    // A question belongs to a user
    Question.belongsTo(models.User, { foreignKey: 'userId' });
    // A question can have many answers
    Question.hasMany(models.Answer, { foreignKey: 'questionId' });
  };

  return Question;
};
