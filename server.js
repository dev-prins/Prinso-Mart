const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Soni Mart API is running perfectly!");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API Working Successfully"
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/serviceareas", require("./routes/serviceAreaRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));
app.use("/api/features", require("./routes/featureToggleRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// 404 Handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
