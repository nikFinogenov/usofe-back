const { Client } = require("pg");
const config = require("../config/config.json");
const db = require("../models/index");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

async function dropDatabase() {
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
    console.log(`Connected to PostgreSQL as ${superuserConfig.user}`);

    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`;
    const dbExists = await client.query(checkDbQuery);

    if (dbExists.rows.length === 0) {
      console.log(`Database '${dbConfig.database}' does not exist.`);
    } else {
      await db.sequelize.close();
      console.log("Sequelize connection closed.");

      const terminateConnectionsQuery = `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${dbConfig.database}'
        AND pid <> pg_backend_pid();
      `;
      await client.query(terminateConnectionsQuery);
      console.log(
        `Terminated all active connections to '${dbConfig.database}'.`
      );

      const dropDbQuery = `DROP DATABASE ${dbConfig.database}`;
      await client.query(dropDbQuery);
      console.log(`Database '${dbConfig.database}' has been dropped.`);
    }

    const checkUserQuery = `SELECT 1 FROM pg_roles WHERE rolname = '${dbConfig.username}'`;
    const userExists = await client.query(checkUserQuery);

    if (userExists.rows.length > 0) {
      const dropUserQuery = `DROP USER ${dbConfig.username}`;
      await client.query(dropUserQuery);
      console.log(`User '${dbConfig.username}' has been dropped.`);
    } else {
      console.log(`User '${dbConfig.username}' does not exist.`);
    }
  } catch (err) {
    console.error("Error dropping database or user:", err);
  } finally {
    await client.end();
    console.log("Disconnected from PostgreSQL server.");
  }
}

dropDatabase();
