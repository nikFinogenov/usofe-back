const express = require('express');
// const session = require('express-session');
// const db = require('./models/index');  // This automatically loads all the models
const initializeSequelize = require('./migrations/sequelize');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// Sync the database and initialize tables
initializeSequelize()
    .then(() => {
        console.log("Database setup complete.");
    })
    .catch(err => {
        console.error("Error during database setup:", err);
    });

const adminRouter = require('./admin');

// app.use(express.static('assets'));
app.use('/admin', adminRouter);
// app.use(session({
//     secret: cookie_secret,
//     resave: true,
//     saveUninitialized: true
// }));
// Routes go here (e.g., userRoutes, postRoutes, etc.)
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
