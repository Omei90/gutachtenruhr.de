// Initialisiere SQLite Datenbank
module.exports = function() {
  const sqlite3 = require('sqlite3').verbose();
  const fs = require('fs');
  const path = require('path');
  const config = require('../config');

  return new Promise((resolve, reject) => {
    // Prüfe ob Datenbank bereits existiert
    if (fs.existsSync(config.database.path)) {
      const db = new sqlite3.Database(config.database.path);
      db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table" AND name="visits"', (err, row) => {
        if (err) {
          db.close();
          createDatabase();
        } else if (row && row.count > 0) {
          // Tabellen existieren bereits
          db.close();
          console.log('✓ Datenbank existiert bereits');
          resolve();
        } else {
          db.close();
          createDatabase();
        }
      });
    } else {
      createDatabase();
    }

    function createDatabase() {
      // Stelle sicher, dass data-Verzeichnis existiert
      const dbDir = path.dirname(config.database.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Datenbank erstellen/öffnen
      const db = new sqlite3.Database(config.database.path, (err) => {
        if (err) {
          console.error('Fehler beim Erstellen der Datenbank:', err.message);
          reject(err);
          return;
        }

        // Foreign Keys aktivieren
        db.run('PRAGMA foreign_keys = ON');

        // Schema ausführen
        const schemaPath = path.join(__dirname, 'schema-sqlite.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Erstelle Datenbank-Schema...');
        db.exec(schema, (err) => {
          if (err) {
            console.error('Fehler beim Erstellen des Schemas:', err.message);
            db.close();
            reject(err);
            return;
          }

          console.log('✓ Datenbank-Schema erstellt!');

          // Prüfe ob Admin-Benutzer existiert
          db.get('SELECT COUNT(*) as count FROM admin_users', (err, row) => {
            if (err) {
              console.error('Fehler beim Prüfen der Admin-Benutzer:', err.message);
              db.close();
              resolve();
              return;
            }

            if (row.count === 0) {
              console.log('Erstelle Standard-Admin-Benutzer...');
              const bcrypt = require('bcrypt');
              const passwordHash = bcrypt.hashSync('admin123', 10);
              db.run('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', 
                ['admin', passwordHash], 
                (err) => {
                  if (err) {
                    console.error('Fehler beim Erstellen des Admin-Benutzers:', err.message);
                  } else {
                    console.log('✓ Admin-Benutzer erstellt!');
                    console.log('  Benutzername: admin');
                    console.log('  Passwort: admin123');
                  }
                  db.close();
                  console.log('✓ Datenbank initialisiert:', config.database.path);
                  resolve();
                }
              );
            } else {
              console.log('✓ Admin-Benutzer existiert bereits');
              db.close();
              console.log('✓ Datenbank initialisiert:', config.database.path);
              resolve();
            }
          });
        });
      });
    }
  });
};
