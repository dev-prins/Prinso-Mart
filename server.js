const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Home Route
app.get("/", (req, res) => {
  res.send("✅ Soni Mart API is running perfectly!");
});

// Test Route
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Working Successfully",
  });
});

// API Routes
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

// 404 Middleware
app.use(notFound);

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
