const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // For hashing passwords

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'authorId' });
      User.hasMany(models.Comment, { foreignKey: 'authorId' });
      User.hasMany(models.Like, { foreignKey: 'authorId' });
    }

    // Method to check password
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
        len: [2, 100] // Validate length of full name
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Check for valid email format
      }
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true, // URL to the profile picture
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0 // Calculated from the likes/dislikes
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
      // Update rating whenever a like/dislike is created or deleted
      afterUpdate: async (user, options) => {
        // Custom logic to calculate rating
      }
    }
  });

  return User;
};
