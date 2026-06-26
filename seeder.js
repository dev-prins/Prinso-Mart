const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ServiceArea = require('../models/ServiceArea');
const Setting = require('../models/Setting');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await ServiceArea.deleteMany();
    await Setting.deleteMany();

    console.log('Existing data cleared...');

    // 1. Default Admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'princesoni5010@gmail.com',
      password: hashedPassword, // Hashed password
      phone: '1234567890',
      role: 'admin',
      isApproved: true,
    });
    console.log(`Admin user created: ${adminUser.email}`);

    // 2. Demo Delivery Partner
    const deliveryPartnerPassword = 'delivery@123';
    const hashedDeliveryPassword = await bcrypt.hash(deliveryPartnerPassword, 10);
    const deliveryPartner = await User.create({
      name: 'Demo Delivery Partner',
      email: 'delivery@prinsomart.com',
      password: hashedDeliveryPassword,
      phone: '9876543210',
      role: 'delivery_partner',
      isApproved: true, // Auto-approve for demo
    });
    console.log(`Delivery partner created: ${deliveryPartner.email}`);


    // 3. Categories
    const categories = await Category.insertMany([
      { name: 'Fruits & Vegetables', description: 'Fresh produce', image: 'https://example.com/fruits_veg.jpg' },
      { name: 'Dairy & Bakery', description: 'Milk, cheese, bread', image: 'https://example.com/dairy_bakery.jpg' },
      { name: 'Staples', description: 'Rice, flour, pulses', image: 'https://example.com/staples.jpg' },
      { name: 'Snacks & Beverages', description: 'Chips, cookies, drinks', image: 'https://example.com/snacks_bev.jpg' },
    ]);
    console.log('Categories seeded...');

    // 4. Products
    const products = await Product.insertMany([
      { name: 'Apple', description: 'Fresh red apples', price: 150, image: 'https://example.com/apple.jpg', category: categories[0]._id, stock: 100 },
      { name: 'Milk (1L)', description: 'Fresh cow milk', price: 60, image: 'https://example.com/milk.jpg', category: categories[1]._id, stock: 50 },
      { name: 'Basmati Rice (5kg)', description: 'Premium Basmati Rice', price: 500, image: 'https://example.com/rice.jpg', category: categories[2]._id, stock: 30 },
      { name: 'Potato Chips (Salted)', description: 'Crispy salted potato chips', price: 20, image: 'https://example.com/chips.jpg', category: categories[3]._id, stock: 200 },
      { name: 'Banana', description: 'Fresh yellow bananas', price: 50, image: 'https://example.com/banana.jpg', category: categories[0]._id, stock: 80 },
    ]);
    console.log('Products seeded...');

    // 5. Service Areas
    await ServiceArea.insertMany([
      { name: 'Central City', zipCodes: ['110001', '110002'], isActive: true },
      { name: 'North District', zipCodes: ['110003', '110004'], isActive: true },
    ]);
    console.log('Service Areas seeded...');

    // 6. Default Settings
    await Setting.insertMany([
      { key: 'delivery_charge_per_km', value: 10, description: 'Delivery charge per kilometer' },
      { key: 'min_order_value_for_free_delivery', value: 500, description: 'Minimum order value for free delivery' },
      { key: 'app_name', value: 'PrinsoMart', description: 'Application name' },
      { key: 'contact_email', value: 'support@prinsomart.com', description: 'Support email address' },
    ]);
    console.log('Settings seeded...');

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await ServiceArea.deleteMany();
    await Setting.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
      }
