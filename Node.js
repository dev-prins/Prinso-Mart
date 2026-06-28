const express = require('express');
const cors = require('cors');
const app = express();

// CORS को इनेबल करना बहुत ज़रूरी है ताकि Vercel (फ्रंटएंड) आपके Render (बैकएंड) से बात कर सके
app.use(cors({
    origin: '*' // या अपनी Vercel वेबसाइट का URL डालें
}));

app.use(express.json());

// रूट एंडपॉइंट
app.get('/', (req, res) => {
    res.send('API is running...');
});

// ऑर्डर एंडपॉइंट जिसे checkout.html कॉल कर रहा है
app.post('/orders', async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;
        
        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        // यहाँ आपका पेमेंट गेटवे का लॉजिक आएगा (जैसे Razorpay instance)
        // अभी के लिए हम एक डमी सक्सेस रिपॉन्स भेज रहे हैं:
        res.status(200).json({
            success: true,
            id: "order_dummy_" + Date.now(),
            amount: amount,
            currency: currency
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

