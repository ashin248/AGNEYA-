// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;

const app = express();

// 1. Database Connection
const connectDB = require('./config/db');
connectDB();

// 2. CORS – allow frontend (Vercel) to call this API
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://agneya.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Serve Static Uploads (public, no auth)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Session with MongoStore
let mongoStore;
try {
  mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60, // 7 days
  });
} catch (error) {
  console.error("❌ Critical: MongoStore creation failed:", error.message);
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'agneya-super-secret-key-2026-change-this',
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// 6. API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Health check / test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Agneya Backend is alive! 🚀' });
});

// NOTE: No React/static serving here.
// Frontend is hosted separately on Vercel.
// This backend is purely an API server.

// 7. Start Server – 0.0.0.0 required for Render
const PORT = process.env.PORT || 6060;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📁 Uploads served from /uploads/`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
