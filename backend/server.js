// 1. Load environment variables
// 2. Connect to MongoDB
// 3. Set up Express + middleware
// 4. Register all routes
// 5. Attach Socket.io for real-time features
// 6. Start listening

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load env vars FIRST
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ✅ FIXED CORS FOR LOCAL + LIVE FRONTEND
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://foodrush-self.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================= API ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'FoodRush API is running 🚀',
    timestamp: new Date(),
  });
});

// ================= ERROR HANDLING =================
app.use(notFound);
app.use(errorHandler);

// ================= HTTP + SOCKET SERVER =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://foodrush-self.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available globally
app.set('io', io);

// ================= SOCKET EVENTS =================
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join order room
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`📦 Joined room: order_${orderId}`);
  });

  // Admin room
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('👨‍💼 Admin joined');
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🍔 FoodRush server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}/api/health\n`);
});