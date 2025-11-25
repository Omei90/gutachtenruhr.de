// Konfigurationsdatei für Analytics Backend
require('dotenv').config();

module.exports = {
  // Server-Konfiguration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  // Datenbank-Konfiguration (SQLite)
  database: {
    path: process.env.DB_PATH || './data/analytics.db'
  },

  // CORS-Konfiguration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 100 // Max 100 Requests pro Window
  },

  // Admin-Authentifizierung
  admin: {
    sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-key-in-production',
    sessionMaxAge: 24 * 60 * 60 * 1000 // 24 Stunden
  },

  // Tracking-Konfiguration
  tracking: {
    sessionTimeout: 30 * 60 * 1000, // 30 Minuten
    maxScrollDepth: 100, // Prozent
    enableGeolocation: true
  }
};

