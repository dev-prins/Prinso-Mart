const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://sonimart.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');   // ← Razorpay Route

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payment', paymentRoutes);   // ← Ye important hai

// 👇 YAHAN HUMNE NAYA DUMMY ROUTE ADD KIYA HAI TAAKI FRONTEND CHAL SAKE 👇
app.post('/orders', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        // अभी के लिए डमी सक्सेस भेज रहे हैं ताकि चेकआउट हो सके
        res.status(200).json({
            success: true,
            id: "order_dummy_" + Date.now(),
            amount: amount || 500,
            currency: currency || 'INR'
        });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// 👆 DUMMY ROUTE KHATAM 👆

// Health Check
app.get('/', (req, res) => {
  res.send('✅ Soni Mart Backend is Running!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
