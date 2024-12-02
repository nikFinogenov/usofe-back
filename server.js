const express = require("express");
const initializeSequelize = require("./migrations/init");
const adminRouter = require("./services/adminService");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3306;
const HOST = process.env.HOST || "http://localhost";
const FRONT_URL = process.env.FRONT || 'http://localhost:3000'

const requiredEnvVars = ["JWT_SECRET", "EMAIL_USER", "EMAIL_PASS"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`ERROR: Missing environment variable: ${envVar}`);
    process.exit(1);
  }
});

app.use(express.json());

initializeSequelize()
  .then(() => {
    console.log("Database setup complete.");
  })
  .catch((err) => {
    console.error("Error during database setup:", err);
  });

app.use("/admin", adminRouter);

const allowedOrigins = [
  'http://localhost:3000',
  // `http://${IP}:3000`,
];

const corsOptions = {
  origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/favourites", require("./routes/favouriteRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/date", require("./routes/dateRoutes"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "index.html"));
});

app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'assets')));

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
