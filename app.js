const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (you might want to restrict this in production)
app.use(express.json()); // Body parser for JSON
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logger for development
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); // For admin managing users
const addressRoutes = require('./routes/addressRoutes');
const serviceAreaRoutes = require('./routes/serviceAreaRoutes');
const settingRoutes = require('./routes/settingRoutes');


// Define API routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // Admin user management
app.use('/api/addresses', addressRoutes);
app.use('/api/serviceareas', serviceAreaRoutes);
app.use('/api/settings', settingRoutes);


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
