const { Client } = require("pg");
const { faker } = require("@faker-js/faker");
const config = require("../config/config.json");
const db = require("../models/index");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

async function setupDatabase() {
  const superuserConfig = {
    user: process.env.PG_USER || "postgres",
    host: process.env.PG_HOST || dbConfig.host,
    password: process.env.PG_PASS || null,
    port: process.env.PG_PORT || 5432,
    database: "postgres",
  };

  const client = new Client(superuserConfig);

  try {
    await client.connect();
    const checkUserQuery = `SELECT 1 FROM pg_roles WHERE rolname = '${dbConfig.username}'`;
    const userExists = await client.query(checkUserQuery);

    if (userExists.rows.length === 0) {
      const createUserQuery = `CREATE USER ${dbConfig.username} WITH PASSWORD '${dbConfig.password}'`;
      await client.query(createUserQuery);
      console.log(`User ${dbConfig.username} created.`);
    }

    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`;
    const dbExists = await client.query(checkDbQuery);

    if (dbExists.rows.length === 0) {
      const createDbQuery = `CREATE DATABASE ${dbConfig.database} OWNER ${dbConfig.username}`;
      await client.query(createDbQuery);
      console.log(
        `Database ${dbConfig.database} created and assigned to user ${dbConfig.username}.`
      );
    }
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

// const MODEL_AMOUNT = 5;
const USER_AMOUNT = 15;
const POST_AMOUNT = 500;
const CATEGORY_AMOUNT = 10;
const COMMENT_AMOUNT = 240;
const LIKE_COMMENT_AMOUNT = 100;
const LIKE_POST_AMOUNT = 55;

async function seedDatabase() {
  try {
    const userCount = await db.User.count();
    if (userCount < USER_AMOUNT) {
      const usersToCreate = USER_AMOUNT - userCount;
      for (let i = 0; i < usersToCreate; i++) {
        await db.User.create({
          login: faker.internet.userName(),
          password: faker.internet.password(),
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          profilePicture: faker.image.avatar(),
          rating: Math.floor(Math.random() * 100),
          role: Math.random() < 0.5 ? "user" : "admin",
          emailConfirmed: true,
        });
      }
      console.log(`${usersToCreate} users created.`);
    }
    const adminUser = await db.User.findOne({ where: { login: "qwerty" } });
    if (!adminUser) {
      await db.User.create({
        login: "qwerty",
        password: "qwerty",
        fullName: "Admin User",
        email: "qwerty@gmail.com",
        profilePicture: faker.image.avatar(),
        rating: 100,
        role: "admin",
        emailConfirmed: true,
      });
      console.log("Temp admin is created, go to / to see credentials");
    }

    const categoryCount = await db.Category.count();
    const categories = [];
    if (categoryCount < CATEGORY_AMOUNT) {
      const categoriesToCreate = CATEGORY_AMOUNT - categoryCount;
      for (let i = 0; i < categoriesToCreate; i++) {
        const category = await db.Category.create({
          title: faker.lorem.word(),
          description: faker.lorem.sentence(),
        });
        categories.push(category);
      }
      console.log(`${categoriesToCreate} categories created.`);
    }

    const postCount = await db.Post.count();
    if (postCount < POST_AMOUNT) {
      const postsToCreate = POST_AMOUNT - postCount;
      for (let i = 0; i < postsToCreate; i++) {
        const post = await db.Post.create({
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph(),
          userId: Math.floor(Math.random() * USER_AMOUNT) + 1,
        });
        const randomCategories = faker.helpers.arrayElements(categories, Math.floor(Math.random() * CATEGORY_AMOUNT) + 1);
        await post.addCategories(randomCategories);
      }
      console.log(`${postsToCreate} posts created.`);
    }

    const commentCount = await db.Comment.count();
    if (commentCount < COMMENT_AMOUNT) {
      const commentsToCreate = COMMENT_AMOUNT - commentCount;
      for (let i = 0; i < commentsToCreate; i++) {
        await db.Comment.create({
          content: faker.lorem.sentence(),
          userId: Math.floor(Math.random() * USER_AMOUNT) + 1,
          postId: Math.floor(Math.random() * POST_AMOUNT) + 1,
        });
      }
      console.log(`${commentsToCreate} comments created.`);
    }

    const likeCount = await db.Like.count({
      where: {
        postId: {
          [db.Sequelize.Op.ne]: null
        }
      }
    });
    if (likeCount < LIKE_POST_AMOUNT) {
      const likesToCreate = LIKE_POST_AMOUNT - likeCount;
      for (let i = 0; i < likesToCreate; i++) {
        await db.Like.create({
          type: Math.random() < 0.5 ? "like" : "dislike",
          userId: Math.floor(Math.random() * USER_AMOUNT) + 1,
          postId: Math.floor(Math.random() * POST_AMOUNT) + 1,
        });
      }
      console.log(`${likesToCreate} likes created.`);
    }
    const likeCountComments = await db.Like.count({
      where: {
        commentId: {
          [db.Sequelize.Op.ne]: null
        }
      }
    });
    if (likeCountComments < LIKE_COMMENT_AMOUNT) {
      const likesToCreate = LIKE_COMMENT_AMOUNT - likeCountComments;
      for (let i = 0; i < likesToCreate; i++) {
        await db.Like.create({
          type: Math.random() < 0.5 ? "like" : "dislike",
          userId: Math.floor(Math.random() * USER_AMOUNT) + 1,
          commentId: Math.floor(Math.random() * COMMENT_AMOUNT) + 1,
        });
      }
      console.log(`${likesToCreate} likes created.`);
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function initializeSequelize() {
  await setupDatabase();

  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully.");
    await db.sequelize.sync();
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  await seedDatabase();

  return db.sequelize;
}

module.exports = initializeSequelize;
