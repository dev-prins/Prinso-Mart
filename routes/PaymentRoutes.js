const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order (UPI ke liye)
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;   // amount in rupees

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100,        // Convert to paise
      currency: "INR",
      receipt: `sonimart_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment order creation failed"
    });
  }
});

module.exports = router;
