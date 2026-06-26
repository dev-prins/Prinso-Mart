// PrinsoMart Backend Server
// Pure Veg Grocery Delivery Platform - Umaria, MP

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is required');
}

const pool = mysql.createPool({
  uri: url,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});
// ---------- Migration ----------
async function migrate() {
  await pool.execute(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','partner','admin') NOT NULL DEFAULT 'customer',
    status ENUM('active','pending','blocked') NOT NULL DEFAULT 'active',
    address TEXT,
    city VARCHAR(80),
    pincode VARCHAR(10),
    vehicle VARCHAR(80),
    rating DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    icon VARCHAR(20) DEFAULT '',
    sort_order INT DEFAULT 0
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT,
    weight VARCHAR(60),
    mrp DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(500),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(category_id)
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    partner_id INT,
    items_json TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('placed','accepted','packed','out_for_delivery','delivered','cancelled') DEFAULT 'placed',
    payment ENUM('cod','online') DEFAULT 'cod',
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(120) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(customer_id), INDEX(partner_id), INDEX(status)
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS settings (
    skey VARCHAR(80) PRIMARY KEY,
    svalue TEXT
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS service_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(80) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    label VARCHAR(40) DEFAULT 'Home',
    full_address TEXT NOT NULL,
    pincode VARCHAR(10),
    INDEX(user_id)
  )`);

  await seed();
}

async function seed() {
  // Admin user (default: princesoni5010@gmail.com / admin@123)
  const [adminRows] = await pool.execute(`SELECT id FROM users WHERE role='admin' LIMIT 1`);
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash('admin@123', 10);
    await pool.execute(
      `INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)`,
      ['Prins Soni', 'princesoni5010@gmail.com', '9999999999', hash, 'admin']
    );
  }

  // Categories
  const [catRows] = await pool.execute(`SELECT COUNT(*) c FROM categories`);
  if (catRows[0].c === 0) {
    const cats = [
      ['Vegetables','🥬',1],['Fruits','🍎',2],['Dairy & Bread','🥛',3],
      ['Atta, Rice & Dal','🌾',4],['Oil & Masale','🫙',5],['Snacks & Biscuits','🍪',6],
      ['Cold Drinks & Juice','🥤',7],['Tea & Coffee','☕',8],
      ['Personal Care','🧴',9],['Home Care','🧹',10],['Baby Care','🍼',11],['Puja Saamagri','🪔',12]
    ];
    for (const [n,i,s] of cats) {
      await pool.execute(`INSERT INTO categories (name,icon,sort_order) VALUES (?,?,?)`,[n,i,s]);
    }
  }

  // Products
  const [pRows] = await pool.execute(`SELECT COUNT(*) c FROM products`);
  if (pRows[0].c === 0) {
    const [cats] = await pool.execute(`SELECT id, name FROM categories`);
    const cmap = {}; cats.forEach(c => cmap[c.name] = c.id);
    const prods = [
      // Vegetables
      ['Tomato (Tamatar)','Vegetables','1 kg',40,30,80,'🍅'],
      ['Onion (Pyaaz)','Vegetables','1 kg',50,40,100,'🧅'],
      ['Potato (Aloo)','Vegetables','1 kg',35,28,120,'🥔'],
      ['Cauliflower (Phool Gobhi)','Vegetables','1 pc',45,35,40,'🥦'],
      ['Cabbage (Patta Gobhi)','Vegetables','1 pc',40,30,30,'🥬'],
      ['Green Chilli','Vegetables','100 g',15,10,50,'🌶️'],
      ['Coriander (Dhaniya)','Vegetables','100 g',20,15,40,'🌿'],
      ['Ginger (Adrak)','Vegetables','250 g',40,30,30,'🫚'],
      // Fruits
      ['Banana (Kela)','Fruits','1 dozen',60,50,40,'🍌'],
      ['Apple','Fruits','1 kg',180,150,30,'🍎'],
      ['Mango (Aam)','Fruits','1 kg',120,100,25,'🥭'],
      ['Papaya','Fruits','1 pc',80,60,15,'🥭'],
      // Dairy & Bread
      ['Amul Taaza Milk','Dairy & Bread','500 ml',30,28,100,'🥛'],
      ['Amul Butter','Dairy & Bread','100 g',60,55,40,'🧈'],
      ['Amul Paneer','Dairy & Bread','200 g',95,85,25,'🧀'],
      ['Britannia Bread','Dairy & Bread','400 g',45,40,30,'🍞'],
      ['Eggs (NOT - veg only)','Dairy & Bread','-',0,0,0,'❌'],
      // Atta Rice Dal
      ['Aashirvaad Atta','Atta, Rice & Dal','5 kg',330,290,40,'🌾'],
      ['Daawat Basmati Rice','Atta, Rice & Dal','1 kg',150,135,30,'🍚'],
      ['Toor Dal','Atta, Rice & Dal','1 kg',180,160,25,'🟡'],
      ['Moong Dal','Atta, Rice & Dal','1 kg',150,130,25,'🟢'],
      ['Chana Dal','Atta, Rice & Dal','1 kg',120,105,25,'🟤'],
      // Oil Masale
      ['Fortune Sunflower Oil','Oil & Masale','1 L',180,160,50,'🫙'],
      ['Saffola Gold','Oil & Masale','1 L',230,210,30,'🫙'],
      ['Tata Salt','Oil & Masale','1 kg',28,25,80,'🧂'],
      ['Turmeric (Haldi)','Oil & Masale','100 g',40,35,40,'🟡'],
      ['Red Chilli Powder','Oil & Masale','100 g',45,40,40,'🌶️'],
      ['Garam Masala','Oil & Masale','50 g',50,45,30,'🟤'],
      // Snacks
      ['Parle-G Biscuit','Snacks & Biscuits','800 g',75,68,60,'🍪'],
      ['Lays Classic','Snacks & Biscuits','52 g',20,18,80,'🥔'],
      ['Kurkure Masala Munch','Snacks & Biscuits','85 g',20,18,80,'🌶️'],
      ['Haldiram Bhujia','Snacks & Biscuits','200 g',60,55,40,'🍿'],
      // Drinks
      ['Coca-Cola','Cold Drinks & Juice','750 ml',40,38,50,'🥤'],
      ['Sprite','Cold Drinks & Juice','750 ml',40,38,50,'🥤'],
      ['Real Mango Juice','Cold Drinks & Juice','1 L',120,110,25,'🧃'],
      // Tea Coffee
      ['Tata Tea Gold','Tea & Coffee','500 g',280,260,30,'☕'],
      ['Nescafe Classic','Tea & Coffee','50 g',155,145,25,'☕'],
      ['Sugar','Tea & Coffee','1 kg',48,45,80,'🍬'],
      // Personal
      ['Lifebuoy Soap','Personal Care','125 g',38,35,80,'🧼'],
      ['Colgate Toothpaste','Personal Care','100 g',70,65,50,'🪥'],
      ['Clinic Plus Shampoo','Personal Care','175 ml',95,88,40,'🧴'],
      // Home
      ['Surf Excel','Home Care','1 kg',155,140,40,'🧺'],
      ['Vim Bar','Home Care','300 g',30,28,60,'🧽'],
      ['Harpic Toilet Cleaner','Home Care','500 ml',95,88,30,'🚽'],
      // Baby
      ['Pampers Baby Diaper M','Baby Care','5 pcs',150,135,20,'🍼'],
      ['Cerelac Stage 1','Baby Care','300 g',280,260,15,'🥣'],
      // Puja
      ['Agarbatti','Puja Saamagri','100 sticks',40,35,40,'🪔'],
      ['Camphor (Kapur)','Puja Saamagri','20 g',50,45,30,'⚪'],
      ['Diya (Mitti)','Puja Saamagri','12 pcs',30,25,30,'🪔']
    ];
    // Remove the egg row (was placeholder)
    for (const p of prods) {
      if (p[0].includes('NOT - veg only')) continue;
      await pool.execute(
        `INSERT INTO products (name,category_id,weight,mrp,price,stock,image) VALUES (?,?,?,?,?,?,?)`,
        [p[0], cmap[p[1]], p[2], p[3], p[4], p[5], p[6]]
      );
    }
  }

  // Default settings
  const defaults = {
    'app_name': 'PrinsoMart',
    'tagline': 'Pure Veg, Pure Trust',
    'free_delivery_above': '199',
    'delivery_charge': '20',
    'min_order': '99',
    'open_time': '08:00',
    'close_time': '22:00',
    'support_phone': '+91-9999999999',
    'support_email': 'princesoni5010@gmail.com',
    'currency': '₹',
    'cod_enabled': '1',
    'online_enabled': '0'
  };
  for (const [k,v] of Object.entries(defaults)) {
    await pool.execute(
      `INSERT IGNORE INTO settings (skey,svalue) VALUES (?,?)`,[k,v]
    );
  }

  // Service areas
  const [sa] = await pool.execute(`SELECT COUNT(*) c FROM service_areas`);
  if (sa[0].c === 0) {
    const areas = [
      ['Umaria','484660'],['Umaria','484661'],
      ['Shahdol','484001'],['Katni','483501'],
      ['Jabalpur','482001'],['Anuppur','484224'],
      ['Indore','452001']
    ];
    for (const [c,p] of areas) {
      await pool.execute(`INSERT INTO service_areas (city,pincode) VALUES (?,?)`,[c,p]);
    }
  }

  // Seed one demo delivery partner
  const [dp] = await pool.execute(`SELECT id FROM users WHERE role='partner' LIMIT 1`);
  if (dp.length === 0) {
    const hash = await bcrypt.hash('partner@123', 10);
    await pool.execute(
      `INSERT INTO users (name,phone,email,password,role,status,city,vehicle) VALUES (?,?,?,?,?,?,?,?)`,
      ['Demo Partner','9000000000','partner@prinsomart.com',hash,'partner','active','Umaria','Bike - MP18 1234']
    );
  }
}

// ---------- Auth ----------
function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
}

function auth(roles) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const t = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!t) return res.status(401).json({ error: 'login required' });
    try {
      const p = jwt.verify(t, JWT_SECRET);
      if (roles && roles.length && !roles.includes(p.role)) return res.status(403).json({ error: 'forbidden' });
      req.user = p; next();
    } catch (e) { return res.status(401).json({ error: 'invalid token' }); }
  };
}

// ---------- Routes ----------
// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ error: 'missing fields' });
    const r = (role === 'partner') ? 'partner' : 'customer';
    const status = (r === 'partner') ? 'pending' : 'active';
    const hash = await bcrypt.hash(password, 10);
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (name,phone,password,role,status) VALUES (?,?,?,?,?)`,
        [name, phone, hash, r, status]
      );
      const user = { id: result.insertId, name, role: r };
      res.json({ token: sign(user), user: { ...user, status } });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Phone already registered' });
      throw e;
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, email, password, role } = req.body;
    const identifier = phone || email;
    if (!identifier || !password) return res.status(400).json({ error: 'missing fields' });
    const col = phone ? 'phone' : 'email';
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE ${col}=? AND role=? LIMIT 1`,
      [identifier, role || 'customer']
    );
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(401).json({ error: 'Wrong password' });
    if (u.status === 'blocked') return res.status(403).json({ error: 'Account blocked' });
    if (u.role === 'partner' && u.status === 'pending') return res.status(403).json({ error: 'Account pending admin approval' });
    res.json({ token: sign(u), user: { id: u.id, name: u.name, role: u.role, phone: u.phone, status: u.status } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', auth(), async (req, res) => {
  const [rows] = await pool.execute(`SELECT id,name,phone,email,role,status,address,city,pincode FROM users WHERE id=?`,[req.user.id]);
  res.json(rows[0] || null);
});

// Public: categories, products, settings, areas
app.get('/api/categories', async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM categories ORDER BY sort_order`);
  res.json(rows);
});

app.get('/api/products', async (req, res) => {
  const { category, q } = req.query;
  let sql = `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.active=1`;
  const params = [];
  if (category) { sql += ` AND p.category_id=?`; params.push(category); }
  if (q) { sql += ` AND p.name LIKE ?`; params.push(`%${q}%`); }
  sql += ` ORDER BY p.id DESC LIMIT 500`;
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

app.get('/api/settings', async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM settings`);
  const obj = {}; rows.forEach(r => obj[r.skey] = r.svalue);
  res.json(obj);
});

app.get('/api/service-areas', async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM service_areas WHERE active=1 ORDER BY city`);
  res.json(rows);
});

// Customer: addresses, orders
app.get('/api/me/addresses', auth(['customer']), async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM addresses WHERE user_id=?`,[req.user.id]);
  res.json(rows);
});
app.post('/api/me/addresses', auth(['customer']), async (req, res) => {
  const { label, full_address, pincode } = req.body;
  const [r] = await pool.execute(
    `INSERT INTO addresses (user_id,label,full_address,pincode) VALUES (?,?,?,?)`,
    [req.user.id, label || 'Home', full_address, pincode]
  );
  res.json({ id: r.insertId });
});
app.delete('/api/me/addresses/:id', auth(['customer']), async (req, res) => {
  await pool.execute(`DELETE FROM addresses WHERE id=? AND user_id=?`,[req.params.id, req.user.id]);
  res.json({ ok: true });
});

app.post('/api/orders', auth(['customer']), async (req, res) => {
  try {
    const { items, address, phone, name, note, payment } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'cart empty' });
    // validate prices from DB
    const ids = items.map(i => i.id);
    const [rows] = await pool.query(`SELECT id,name,price,stock FROM products WHERE id IN (?)`, [ids]);
    const pmap = {}; rows.forEach(p => pmap[p.id] = p);
    let subtotal = 0;
    const final = items.map(i => {
      const p = pmap[i.id];
      if (!p) throw new Error('product not found');
      const qty = Math.max(1, parseInt(i.qty || 1));
      subtotal += Number(p.price) * qty;
      return { id: p.id, name: p.name, price: Number(p.price), qty };
    });
    const [sRows] = await pool.execute(`SELECT skey,svalue FROM settings WHERE skey IN ('free_delivery_above','delivery_charge','min_order')`);
    const S = {}; sRows.forEach(s => S[s.skey] = Number(s.svalue));
    if (subtotal < (S.min_order || 0)) return res.status(400).json({ error: `Minimum order ₹${S.min_order}` });
    const dc = subtotal >= (S.free_delivery_above || 0) ? 0 : (S.delivery_charge || 0);
    const total = subtotal + dc;
    const [r] = await pool.execute(
      `INSERT INTO orders (customer_id,items_json,subtotal,delivery_charge,total,address,phone,name,note,payment) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, JSON.stringify(final), subtotal, dc, total, address, phone, name, note || '', payment || 'cod']
    );
    res.json({ id: r.insertId, total, subtotal, delivery_charge: dc });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me/orders', auth(['customer']), async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM orders WHERE customer_id=? ORDER BY id DESC LIMIT 100`,[req.user.id]);
  res.json(rows);
});

app.get('/api/orders/:id', auth(), async (req, res) => {
  const [rows] = await pool.execute(`SELECT o.*, u.name partner_name, u.phone partner_phone FROM orders o LEFT JOIN users u ON u.id=o.partner_id WHERE o.id=?`,[req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  const o = rows[0];
  if (req.user.role === 'customer' && o.customer_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
  if (req.user.role === 'partner' && o.partner_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
  res.json(o);
});

// Partner routes
app.get('/api/partner/orders/available', auth(['partner']), async (req, res) => {
  const [rows] = await pool.execute(`SELECT id,name,address,phone,total,subtotal,created_at,status FROM orders WHERE partner_id IS NULL AND status='placed' ORDER BY id DESC LIMIT 50`);
  res.json(rows);
});
app.post('/api/partner/orders/:id/accept', auth(['partner']), async (req, res) => {
  const [r] = await pool.execute(`UPDATE orders SET partner_id=?, status='accepted' WHERE id=? AND partner_id IS NULL`,[req.user.id, req.params.id]);
  if (r.affectedRows === 0) return res.status(400).json({ error: 'already taken' });
  res.json({ ok: true });
});
app.post('/api/partner/orders/:id/status', auth(['partner']), async (req, res) => {
  const { status } = req.body;
  const allowed = ['packed','out_for_delivery','delivered'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'bad status' });
  await pool.execute(`UPDATE orders SET status=? WHERE id=? AND partner_id=?`,[status, req.params.id, req.user.id]);
  res.json({ ok: true });
});
app.get('/api/partner/orders/mine', auth(['partner']), async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM orders WHERE partner_id=? ORDER BY id DESC LIMIT 100`,[req.user.id]);
  res.json(rows);
});
app.get('/api/partner/earnings', auth(['partner']), async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) total_deliveries, COALESCE(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN 1 ELSE 0 END),0) today_count FROM orders WHERE partner_id=? AND status='delivered'`,
    [req.user.id]
  );
  const per = 20;
  res.json({
    total_deliveries: rows[0].total_deliveries,
    today_count: rows[0].today_count,
    today_earnings: rows[0].today_count * per,
    total_earnings: rows[0].total_deliveries * per
  });
});

// Admin routes
app.get('/api/admin/dashboard', auth(['admin']), async (req, res) => {
  const [[a]] = await pool.query(`SELECT COUNT(*) c FROM orders WHERE DATE(created_at)=CURDATE()`);
  const [[b]] = await pool.query(`SELECT COALESCE(SUM(total),0) s FROM orders WHERE DATE(created_at)=CURDATE() AND status<>'cancelled'`);
  const [[c]] = await pool.query(`SELECT COUNT(*) c FROM users WHERE role='customer'`);
  const [[d]] = await pool.query(`SELECT COUNT(*) c FROM users WHERE role='partner' AND status='active'`);
  const [[e]] = await pool.query(`SELECT COUNT(*) c FROM users WHERE role='partner' AND status='pending'`);
  const [[f]] = await pool.query(`SELECT COUNT(*) c FROM products`);
  const [[g]] = await pool.query(`SELECT COUNT(*) c FROM orders WHERE status IN ('placed','accepted','packed','out_for_delivery')`);
  res.json({
    today_orders: a.c, today_revenue: Number(b.s),
    customers: c.c, active_partners: d.c, pending_partners: e.c,
    products: f.c, live_orders: g.c
  });
});

app.get('/api/admin/orders', auth(['admin']), async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT o.*, u.name customer_name, p.name partner_name FROM orders o LEFT JOIN users u ON u.id=o.customer_id LEFT JOIN users p ON p.id=o.partner_id`;
  const params = [];
  if (status) { sql += ` WHERE o.status=?`; params.push(status); }
  sql += ` ORDER BY o.id DESC LIMIT 200`;
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});
app.post('/api/admin/orders/:id/assign', auth(['admin']), async (req, res) => {
  const { partner_id } = req.body;
  await pool.execute(`UPDATE orders SET partner_id=?, status=IF(status='placed','accepted',status) WHERE id=?`,[partner_id, req.params.id]);
  res.json({ ok: true });
});
app.post('/api/admin/orders/:id/cancel', auth(['admin']), async (req, res) => {
  await pool.execute(`UPDATE orders SET status='cancelled' WHERE id=?`,[req.params.id]);
  res.json({ ok: true });
});

app.get('/api/admin/products', auth(['admin']), async (req, res) => {
  const [rows] = await pool.execute(`SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.id DESC`);
  res.json(rows);
});
app.post('/api/admin/products', auth(['admin']), async (req, res) => {
  const { name, category_id, weight, mrp, price, stock, image, description, active } = req.body;
  const [r] = await pool.execute(
    `INSERT INTO products (name,category_id,weight,mrp,price,stock,image,description,active) VALUES (?,?,?,?,?,?,?,?,?)`,
    [name, category_id, weight, mrp, price, stock || 0, image || '🛒', description || '', active !== false ? 1 : 0]
  );
  res.json({ id: r.insertId });
});
app.put('/api/admin/products/:id', auth(['admin']), async (req, res) => {
  const { name, category_id, weight, mrp, price, stock, image, description, active } = req.body;
  await pool.execute(
    `UPDATE products SET name=?, category_id=?, weight=?, mrp=?, price=?, stock=?, image=?, description=?, active=? WHERE id=?`,
    [name, category_id, weight, mrp, price, stock, image, description, active ? 1 : 0, req.params.id]
  );
  res.json({ ok: true });
});
app.delete('/api/admin/products/:id', auth(['admin']), async (req, res) => {
  await pool.execute(`DELETE FROM products WHERE id=?`,[req.params.id]);
  res.json({ ok: true });
});

app.post('/api/admin/categories', auth(['admin']), async (req, res) => {
  const { name, icon, sort_order } = req.body;
  const [r] = await pool.execute(`INSERT INTO categories (name,icon,sort_order) VALUES (?,?,?)`,[name, icon || '🛒', sort_order || 99]);
  res.json({ id: r.insertId });
});
app.delete('/api/admin/categories/:id', auth(['admin']), async (req, res) => {
  await pool.execute(`DELETE FROM categories WHERE id=?`,[req.params.id]);
  res.json({ ok: true });
});

app.get('/api/admin/users', auth(['admin']), async (req, res) => {
  const { role } = req.query;
  let sql = `SELECT id,name,phone,email,role,status,city,vehicle,rating,created_at FROM users`;
  const params = [];
  if (role) { sql += ` WHERE role=?`; params.push(role); }
  sql += ` ORDER BY id DESC LIMIT 500`;
  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});
app.post('/api/admin/users/:id/status', auth(['admin']), async (req, res) => {
  const { status } = req.body;
  await pool.execute(`UPDATE users SET status=? WHERE id=?`,[status, req.params.id]);
  res.json({ ok: true });
});
app.delete('/api/admin/users/:id', auth(['admin']), async (req, res) => {
  await pool.execute(`DELETE FROM users WHERE id=? AND role<>'admin'`,[req.params.id]);
  res.json({ ok: true });
});

app.put('/api/admin/settings', auth(['admin']), async (req, res) => {
  const updates = req.body || {};
  for (const [k,v] of Object.entries(updates)) {
    await pool.execute(`INSERT INTO settings (skey,svalue) VALUES (?,?) ON DUPLICATE KEY UPDATE svalue=VALUES(svalue)`,[k, String(v)]);
  }
  res.json({ ok: true });
});

app.post('/api/admin/service-areas', auth(['admin']), async (req, res) => {
  const { city, pincode } = req.body;
  const [r] = await pool.execute(`INSERT INTO service_areas (city,pincode) VALUES (?,?)`,[city, pincode]);
  res.json({ id: r.insertId });
});
app.delete('/api/admin/service-areas/:id', auth(['admin']), async (req, res) => {
  await pool.execute(`DELETE FROM service_areas WHERE id=?`,[req.params.id]);
  res.json({ ok: true });
});

// HTML routes
app.get('/partner', (req, res) => res.sendFile(path.join(__dirname,'public','partner.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname,'public','admin.html')));

// Start
(async () => {
  try {
    await migrate();
    app.listen(PORT, '0.0.0.0', () => console.log('PrinsoMart running on', PORT));
  } catch (e) {
    console.error('Startup failed:', e);
    process.exit(1);
  }
})();
