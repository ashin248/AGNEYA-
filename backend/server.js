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

// 2. Serve Static Uploads (public, no auth)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. CORS (dynamic from env)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
  process.exit(1); // Crash if session store fails (critical)
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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend is alive!' });
});

// 7. Serve React Build (SPA mode) - AFTER all API routes
const reactBuildPath = path.join(__dirname, '../agneya/dist');
app.use(express.static(reactBuildPath));

// Catch-all for React Router (must be LAST)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});

// 8. Start Server – Render fix: 0.0.0.0 + process.env.PORT
const PORT = process.env.PORT || 6060;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log('Uploads: /uploads/');
  console.log('Frontend served from: ' + reactBuildPath);
});










// // server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const session = require('express-session');
// const MongoStore = require('connect-mongo').default;

// const app = express();

// // =========================
// // 1. Database Connection
// // =========================
// const connectDB = require('./config/db');
// connectDB();

// // =========================
// // 2. Serve Static Uploads FIRST (no auth needed for images)
// // =========================
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // =========================
// // 3. CORS Middleware (allow credentials for session)
// // =========================
// const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
// app.use(
//   cors({
//     origin: allowedOrigin,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// // =========================
// // 4. Body Parser
// // =========================
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // =========================
// // 5. Session Middleware (after static files & CORS)
// // =========================
// let mongoStore;
// try {
//   mongoStore = MongoStore.create({
//     mongoUrl: process.env.MONGO_URI,
//     collectionName: 'sessions',
//     ttl: 7 * 24 * 60 * 60, // 7 days
//   });
// } catch (error) {
//   console.error("❌ Critical: Could not create MongoStore for sessions.", error.message);
// }

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'agneya-super-secret-key-2026-change-this',
//     resave: false,
//     saveUninitialized: false,
//     store: mongoStore,
//     cookie: {
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
//       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // none for cross-site in production
//     },
//   })
// );

// // =========================
// // 6. Routes (protected by session)
// // =========================
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/payment', require('./routes/paymentRoutes'));
// app.use('/api/user', require('./routes/userRoutes'));

// // Optional test route
// app.get('/api/test', (req, res) => {
//   res.json({ success: true, message: 'Backend is alive!' });
// });

// // =========================
// // 7. Serve React Build (SPA - catch all other routes)
// // =========================
// app.use(express.static(path.join(__dirname, '../agneya/dist')));

// // Catch-all for React routing (must be last)
// app.get('/{*splat}', (req, res) => {
//   res.sendFile(path.join(__dirname, '../agneya/dist/index.html'));
// });



// // =========================
// // 8. Start Server
// // =========================
// const PORT = process.env.PORT || 6060;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log('Uploads available at: http://localhost:6060/uploads/');
// });



