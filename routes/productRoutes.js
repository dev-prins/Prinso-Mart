const express = require("express");
const router = express.Router();

const Product = require("../config/models/Product");

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer
const upload = multer({
  storage: multer.memoryStorage(),
});

// Upload helper
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sonimart-products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Seed Products
router.get("/seed", async (req, res) => {
  try {
    await Product.deleteMany();

    const products = await Product.insertMany([
      {
        nameEn: "Tomato",
        nameHi: "टमाटर",
        price: 25,
        originalPrice: 35,
        unit: "1 kg",
        category: "vegetables",
        stock: 100,
        discount: 28,
        emoji: "🍅",
        isActive: true,
      },
      {
        nameEn: "Potato",
        nameHi: "आलू",
        price: 20,
        originalPrice: 25,
        unit: "1 kg",
        category: "vegetables",
        stock: 100,
        discount: 20,
        emoji: "🥔",
        isActive: true,
      },
      {
        nameEn: "Onion",
        nameHi: "प्याज",
        price: 22,
        originalPrice: 30,
        unit: "1 kg",
        category: "vegetables",
        stock: 100,
        discount: 26,
        emoji: "🧅",
        isActive: true,
      },
      {
        nameEn: "Milk",
        nameHi: "दूध",
        price: 25,
        originalPrice: 28,
        unit: "500 ml",
        category: "dairy",
        stock: 50,
        discount: 10,
        emoji: "🥛",
        isActive: true,
      },
    ]);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Active Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Products (Admin)
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let image = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      image = result.secure_url;
    }

    const product = await Product.create({
      ...req.body,
      image,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let data = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      data.image = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
