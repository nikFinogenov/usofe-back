const express = require('express');
// const db = require('./models/index');  // This automatically loads all the models
const initializeSequelize = require('./migrations/sequelize');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Sync the database and initialize tables
initializeSequelize()
    .then(() => {
        console.log("Database setup complete.");
    })
    .catch(err => {
        console.error("Error during database setup:", err);
    });

// Routes go here (e.g., userRoutes, questionRoutes, etc.)
app.use('/users', require('./routes/userRoutes'));
app.use('/questions', require('./routes/questionRoutes'));
app.use('/answers', require('./routes/answerRoutes'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
