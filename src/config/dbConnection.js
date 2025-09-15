const mongoose = require("mongoose");

require("dotenv").config();

const dbConnection = async () => {
  try {
    // Use DATABASE_URL for both environments
    // In development: points to local MongoDB
    // In production: points to MongoDB Cloud
    const connectionString = process.env.DATABASE_URL || process.env.MONGODB_URL_LOCAL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or MONGODB_URL_LOCAL must be defined');
    }

    const options = {
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    };

    await mongoose.connect(connectionString, options);
    
    const environment = process.env.NODE_ENV || 'development';
    const dbName = mongoose.connection.db.databaseName;
    
    console.log(`✅ MongoDB connected successfully`);
    console.log(`📊 Environment: ${environment}`);
    console.log(`🗄️  Database: ${dbName}`);
    console.log(`🔗 Connection: ${connectionString.replace(/\/\/.*:.*@/, '//***:***@')}`);
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("🔍 Make sure DATABASE_URL is properly configured");
    process.exit(1);
  }
};

module.exports = dbConnection;
