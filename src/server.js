require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dbConnection = require("./config/dbConnection");
const userRoute = require("./routes/userRoute");
const candidateRoute = require("./routes/candidateRoute");

const app = express();
app.use(bodyParser.json());

// Trust proxy for proper IP handling behind load balancers
app.set("trust proxy", 1);

// Security middleware
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "Voting System");
  next();
});

const PORT = process.env.PORT || 5000;
const startTime = new Date();
let isShuttingDown = false;

// Enhanced health check endpoint
app.get("/health", async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: "SHUTTING_DOWN",
      message: "Application is shutting down",
    });
  }

  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const healthData = {
      status: "OK",
      message: "Voting app is running",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      database: {
        status: dbStatus[dbState] || "unknown",
        connected: dbState === 1,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    // Return 503 if database is not connected
    if (dbState !== 1) {
      return res.status(503).json({
        ...healthData,
        status: "UNHEALTHY",
        message: "Database connection is not healthy",
      });
    }

    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness check endpoint
app.get("/ready", async (req, res) => {
  if (isShuttingDown) {
    return res
      .status(503)
      .json({ status: "NOT_READY", message: "Application is shutting down" });
  }

  try {
    // Check if database is ready
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      res.status(200).json({
        status: "READY",
        message: "Application is ready to serve requests",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "NOT_READY",
        message: "Database connection is not ready",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Readiness check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Metrics endpoint (basic implementation)
app.get("/metrics", (req, res) => {
  const metrics = {
    uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };

  res.status(200).json(metrics);
});

// routes
app.use("/api/users", userRoute);
app.use("/api/candidates", candidateRoute);

const server = app.listen(PORT, () => {
  dbConnection();
  console.log(`✅ Voting app listening on http://localhost:${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`🎯 Ready check available at http://localhost:${PORT}/ready`);
});

// Graceful shutdown handling
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown); // Nodemon restart

function gracefulShutdown(signal) {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("🔒 HTTP server closed");

    // Close database connection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false, () => {
        console.log("📤 MongoDB connection closed");
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      });
    } else {
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after 10 seconds");
    process.exit(1);
  }, 10000);
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("🚫 Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
