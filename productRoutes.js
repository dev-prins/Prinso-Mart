const express = require('express');
const router = express.Router();
const Product = require('./config/models/Product');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload helper function
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sonimart-products' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// SEED route (सिर्फ एक्टिव प्रोडक्ट्स के साथ)
router.get('/seed', async (req, res) => {
  try {
    await Product.deleteMany();
    await Product.insertMany([
      { name: 'Tomato', price: 25, originalPrice: 35, unit: '1 kg', category: 'vegetables', stock: 100, discount: 28, isActive: true },
      { name: 'Potato', price: 20, originalPrice: 25, unit: '1 kg', category: 'vegetables', stock: 100, discount: 20, isActive: true },
      { name: 'Onion', price: 22, originalPrice: 30, unit: '1 kg', category: 'vegetables', stock: 100, discount: 26, isActive: true },
      { name: 'Milk', price: 25, originalPrice: 28, unit: '500 ml', category: 'dairy', stock: 50, discount: 10, isActive: true },
    ]);
    res.json({ message: 'Products seeded!', count: 4 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products (सिर्फ Active प्रोडक्ट्स दिखेंगे)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isActive: true }; // यह फ़िल्टर सिर्फ एक्टिव सामान दिखाएगा
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    let products = Product.find(query);
    if (sort === 'price_low') products = products.sort({ price: 1 });
    if (sort === 'price_high') products = products.sort({ price: -1 });
    
    const result = await products;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products for Admin (सब कुछ दिखेगा)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const product = await Product.create({ ...req.body, image: imageUrl, isActive: true });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.image = result.secure_url;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
