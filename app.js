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

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payment', paymentRoutes);

// DUMMY ROUTE (अब /api/orders के नाम से काम करेगा)
app.post('/api/orders', async (req, res) => {
    res.status(200).json({
        success: true,
        id: "order_" + Date.now(),
        amount: 500
    });
});

app.get('/', (req, res) => res.send('✅ Soni Mart API is running!'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
