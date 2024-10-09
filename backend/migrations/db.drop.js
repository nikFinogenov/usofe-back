const { Client } = require('pg'); // Use pg client for raw SQL queries
const config = require('../config/config.json');
const db = require('../models/index'); // Import Sequelize models
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

async function dropDatabase() {
    const superuserConfig = {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || dbConfig.host,
        password: process.env.PG_SUPERUSER_PASSWORD || null, 
        port: process.env.PG_PORT || 5432,
        database: 'postgres',
    };

    const client = new Client(superuserConfig); // Initialize pg client with superuser config

    try {
        await client.connect(); // Connect to the PostgreSQL server
        console.log(`Connected to PostgreSQL as ${superuserConfig.user}`);

        // Step 1: Check if the target database exists
        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`;
        const dbExists = await client.query(checkDbQuery);

        if (dbExists.rows.length === 0) {
            console.log(`Database '${dbConfig.database}' does not exist.`);
            return;
        }

        // Step 2: Close Sequelize connection before dropping the database
        await db.sequelize.close();
        console.log('Sequelize connection closed.');

        // Step 3: Terminate all active connections to the target database
        const terminateConnectionsQuery = `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbConfig.database}'
      AND pid <> pg_backend_pid();
    `;
        await client.query(terminateConnectionsQuery);
        console.log(`Terminated all active connections to '${dbConfig.database}'.`);

        // Step 4: Drop the target database
        const dropDbQuery = `DROP DATABASE ${dbConfig.database}`;
        await client.query(dropDbQuery);
        console.log(`Database '${dbConfig.database}' has been dropped.`);

    } catch (err) {
        console.error('Error dropping database:', err);
    } finally {
        // Step 5: Close the pg client connection
        await client.end();
        console.log('Disconnected from PostgreSQL server.');
    }
}

dropDatabase();
