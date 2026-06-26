const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category'); // Needed to validate category

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category', 'name'); // Populate category name
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, categoryId, stock } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(400);
    throw new Error('Category not found');
  }

  const product = new Product({
    name,
    description,
    price,
    image,
    category: categoryId,
    stock,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, categoryId, stock, isAvailable } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(400);
        throw new Error('Category not found');
      }
      product.category = categoryId;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;


    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id }); // Use deleteOne
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
