// config/db.js — MongoDB Connection
// We use Mongoose to connect. Mongoose gives us:
// - Schema validation
// - Model-based querying (ORM-like)
// - Middleware (pre/post hooks)

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options prevent deprecation warnings
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit process on DB failure — app can't run without DB
    process.exit(1);
  }
};

module.exports = connectDB;
