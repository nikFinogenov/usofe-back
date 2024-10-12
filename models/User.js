const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
      User.hasMany(models.Comment, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
      User.hasMany(models.Like, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
    }

    checkPassword(loginPassword) {
      return bcrypt.compareSync(loginPassword, this.password);
    }
  }

  User.init({
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const hashedPassword = bcrypt.hashSync(value, 10);
        this.setDataValue('password', hashedPassword);
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    confirmationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      afterUpdate: async (user, options) => {
      }
    }
  });

  return User;
};
