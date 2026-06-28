const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes'); // नया एडमिन रूट

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes); // एडमिन सिस्टम कनेक्ट हो गया

app.get('/', (req, res) => res.send('✅ Soni Mart API is running perfectly!'));

// Error handling for 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Soni Mart Server running on port ${PORT}`));
