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

// SEED route
router.get('/seed', async (req, res) => {
  try {
    await Product.deleteMany();
    await Product.insertMany([
      { name: 'Tomato', price: 25, originalPrice: 35, unit: '1 kg', category: 'vegetables', stock: 100, discount: 28 },
      { name: 'Potato', price: 20, originalPrice: 25, unit: '1 kg', category: 'vegetables', stock: 100, discount: 20 },
      { name: 'Onion', price: 22, originalPrice: 30, unit: '1 kg', category: 'vegetables', stock: 100, discount: 26 },
      { name: 'Cucumber', price: 18, originalPrice: 25, unit: '1 kg', category: 'vegetables', stock: 100, discount: 28 },
      { name: 'Capsicum', price: 30, originalPrice: 40, unit: '500 g', category: 'vegetables', stock: 100, discount: 25 },
      { name: 'Carrot', price: 20, originalPrice: 28, unit: '1 kg', category: 'vegetables', stock: 100, discount: 28 },
      { name: 'Banana', price: 30, originalPrice: 40, unit: '1 dozen', category: 'fruits', stock: 80, discount: 25 },
      { name: 'Apple', price: 80, originalPrice: 100, unit: '1 kg', category: 'fruits', stock: 80, discount: 20 },
      { name: 'Mango', price: 60, originalPrice: 80, unit: '1 kg', category: 'fruits', stock: 80, discount: 25 },
      { name: 'Milk', price: 25, originalPrice: 28, unit: '500 ml', category: 'dairy', stock: 50, discount: 10 },
      { name: 'Paneer', price: 60, originalPrice: 70, unit: '200 g', category: 'dairy', stock: 50, discount: 14 },
      { name: 'Rice', price: 45, originalPrice: 55, unit: '1 kg', category: 'grains', stock: 100, discount: 18 },
    ]);
    res.json({ message: 'Products seeded!', count: 12 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};
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

// POST - new product with image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const product = await Product.create({ ...req.body, image: imageUrl });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - update product with image
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
