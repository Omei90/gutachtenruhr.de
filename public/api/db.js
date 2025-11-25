// SQLite Datenbank-Verbindung (Promise-basiert)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { promisify } = require('util');

// Stelle sicher, dass data-Verzeichnis existiert
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Datenbank-Verbindung erstellen
const db = new sqlite3.Database(config.database.path, (err) => {
  if (err) {
    console.error('Datenbankverbindungsfehler:', err.message);
  } else {
    console.log('SQLite Datenbankverbindung erfolgreich hergestellt:', config.database.path);
    // Foreign Keys aktivieren
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Promise-basierte Wrapper
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.execAsync = promisify(db.exec.bind(db));

module.exports = db;
