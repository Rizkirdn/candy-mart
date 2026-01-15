import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

// Konfigurasi Path File Database
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// --- FUNGSI BANTUAN DATABASE (BACA & TULIS) ---
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // Jika file error/hilang, kembalikan struktur default
    return { users: [], products: [], orders: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- AUTHENTICATION (LOGIN & REGISTER) ---
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const db = readDB();

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email sudah terdaftar!' });
  }

  const newUser = {
    id: Date.now(), // Gunakan timestamp agar ID unik
    name,
    email,
    password,
    role: 'pelanggan',
    avatar: ''
  };

  db.users.push(newUser);
  writeDB(db); // SIMPAN PERMANEN
  res.status(201).json({ message: 'Registrasi berhasil', user: newUser });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Email atau Password salah!' });
  }

  const { password: _, ...userData } = user;
  res.json({ message: 'Login sukses', user: userData });
});

// Update User (Ganti Password / Profil)
app.patch('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { currentPassword, newPassword, ...updates } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  // Cek Password Lama jika ingin ganti pass
  if (newPassword) {
    if (db.users[userIndex].password !== currentPassword) {
      return res.status(400).json({ message: 'Password lama salah!' });
    }
    db.users[userIndex].password = newPassword;
  }

  // Update Data Lain
  db.users[userIndex] = { ...db.users[userIndex], ...updates };
  
  writeDB(db); // SIMPAN PERMANEN

  const { password: _, ...userWithoutPass } = db.users[userIndex];
  res.json({ message: 'Update berhasil', user: userWithoutPass });
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard/stats', (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders.reduce((acc, o) => acc + (o.status !== 'Batal' ? parseInt(o.total) : 0), 0);
  
  res.json({
    total_products: db.products.length,
    total_revenue: totalRevenue,
    total_asset: db.products.reduce((acc, p) => acc + (p.price * p.stock), 0),
    low_stock: db.products.filter(p => p.stock < 10).length
  });
});

app.get('/api/dashboard/chart', (req, res) => {
  // Data chart dummy (karena agak kompleks hitung realtimenya di file json sederhana)
  res.json([
    { name: 'Jan', total: 4000000 }, { name: 'Feb', total: 3000000 },
    { name: 'Mar', total: 2000000 }, { name: 'Apr', total: 2780000 },
    { name: 'Mei', total: 1890000 }, { name: 'Jun', total: 2390000 },
  ]);
});

// --- PRODUCTS CRUD ---
app.get('/api/products', (req, res) => {
  const db = readDB();
  const search = req.query.search ? req.query.search.toLowerCase() : '';
  const filtered = db.products.filter(p => p.name.toLowerCase().includes(search));
  res.json({ data: filtered });
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id == req.params.id);
  product ? res.json(product) : res.status(404).json({message: 'Not Found'});
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const newProduct = { ...req.body, id: Date.now(), sold: 0 };
  db.products.unshift(newProduct);
  writeDB(db); // SIMPAN PERMANEN
  res.json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex(p => p.id == req.params.id);
  if (idx > -1) {
    db.products[idx] = { ...db.products[idx], ...req.body };
    writeDB(db); // SIMPAN PERMANEN
    res.json(db.products[idx]);
  } else res.status(404).json({message: 'Not Found'});
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id != req.params.id);
  writeDB(db); // SIMPAN PERMANEN
  res.json({message: 'Deleted'});
});

// --- ORDERS CRUD ---
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const newOrder = {
    id: `ORD-${Date.now()}`,
    customer_name: req.body.customer_name,
    address: req.body.address || '-',
    courier: req.body.courier || '-',
    payment_method: req.body.payment_method || '-',
    date: new Date().toISOString().split('T')[0],
    total: req.body.total,
    status: 'Pending',
    items: req.body.items
  };
  
  // Kurangi Stok Produk (Opsional - Fitur Canggih)
  newOrder.items.forEach(item => {
    const pIdx = db.products.findIndex(p => p.id == item.id);
    if(pIdx > -1) {
      db.products[pIdx].stock = Math.max(0, db.products[pIdx].stock - item.quantity);
    }
  });

  db.orders.unshift(newOrder);
  writeDB(db); // SIMPAN PERMANEN
  res.status(201).json({ message: 'Order Berhasil', order: newOrder });
});

app.patch('/api/orders/:id', (req, res) => {
  const db = readDB();
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx > -1) {
    db.orders[idx].status = req.body.status;
    writeDB(db); // SIMPAN PERMANEN
    res.json(db.orders[idx]);
  } else res.status(404).json({ message: 'Order Not Found' });
});

app.delete('/api/orders/:id', (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter(o => o.id !== req.params.id);
  writeDB(db); // SIMPAN PERMANEN
  res.json({ message: 'Deleted' });
});

// START SERVER
app.listen(PORT, () => console.log(`SERVER DATABASE AKTIF DI http://localhost:${PORT}`));