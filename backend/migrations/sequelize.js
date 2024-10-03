const { Sequelize } = require('sequelize');
const { Client } = require('pg'); // Import pg client for raw SQL queries
const config = require('../config/config.json');
const db = require('../models/index');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

async function setupDatabase() {
  const superuserConfig = {
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || dbConfig.host,
    password: process.env.PG_SUPERUSER_PASSWORD || null,
    port: process.env.PG_PORT || 5432,
    database: 'postgres',
  };

  const client = new Client(superuserConfig);

  try {
    await client.connect();

    // Step 1: Check and create the user
    const checkUserQuery = `SELECT 1 FROM pg_roles WHERE rolname = '${dbConfig.username}'`;
    const userExists = await client.query(checkUserQuery);

    if (userExists.rows.length === 0) {
      // If user does not exist, create the user
      const createUserQuery = `CREATE USER ${dbConfig.username} WITH PASSWORD '${dbConfig.password}'`;
      await client.query(createUserQuery);
      console.log(`User ${dbConfig.username} created.`);
    } else {
      console.log(`User ${dbConfig.username} already exists.`);
    }

    // Step 2: Check and create the database
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`;
    const dbExists = await client.query(checkDbQuery);

    if (dbExists.rows.length === 0) {
      // If database does not exist, create the database and assign ownership
      const createDbQuery = `CREATE DATABASE ${dbConfig.database} OWNER ${dbConfig.username}`;
      await client.query(createDbQuery);
      console.log(`Database ${dbConfig.database} created and assigned to user ${dbConfig.username}.`);
    } else {
      console.log(`Database ${dbConfig.database} already exists.`);
    }

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

// Sequelize initialization function
async function initializeSequelize() {
  // Setup the database and user before initializing Sequelize
  await setupDatabase();

  // Now that the user and database exist, initialize Sequelize
  // const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  //   host: dbConfig.host,
  //   dialect: 'postgres'
  // });

  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully.');
    await db.sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  return db.sequelize;
}

module.exports = initializeSequelize;
