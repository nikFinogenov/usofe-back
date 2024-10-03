'use strict';
module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define('Answer', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {});

  Answer.associate = function(models) {
    // An answer belongs to a user
    Answer.belongsTo(models.User, { foreignKey: 'userId' });
    // An answer belongs to a question
    Answer.belongsTo(models.Question, { foreignKey: 'questionId' });
  };

  return Answer;
};
