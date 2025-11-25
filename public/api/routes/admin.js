// Admin API Routes (SQLite)
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Simple Token-based Auth
const tokens = new Map();

// POST /api/admin/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
    }

    db.get('SELECT id, username, password_hash FROM admin_users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Interner Serverfehler' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      }

      const isValid = bcrypt.compareSync(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      }

      // Token generieren
      const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      tokens.set(token, { userId: user.id, username: user.username, expires: Date.now() + 24 * 60 * 60 * 1000 });

      // Last login aktualisieren
      db.run('UPDATE admin_users SET last_login_at = datetime("now") WHERE id = ?', [user.id]);

      res.json({ success: true, token });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Middleware: Auth prüfen
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  const tokenData = tokens.get(token);
  if (Date.now() > tokenData.expires) {
    tokens.delete(token);
    return res.status(401).json({ error: 'Token abgelaufen' });
  }

  req.user = tokenData;
  next();
}

// GET /api/admin/stats - Overview Statistiken
router.get('/stats', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    db.get('SELECT COUNT(*) as total FROM visits WHERE first_visit_at BETWEEN ? AND ?', [start, end], (err, visits) => {
      if (err) {
        console.error('Error fetching stats:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
      }

      db.get('SELECT COUNT(*) as total, AVG(time_on_page) as avg_time FROM page_views WHERE viewed_at BETWEEN ? AND ?', [start, end], (err, pageViews) => {
        if (err) {
          console.error('Error fetching stats:', err);
          return res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
        }

        db.get('SELECT COUNT(*) as total FROM conversions WHERE converted_at BETWEEN ? AND ?', [start, end], (err, conversions) => {
          if (err) {
            console.error('Error fetching stats:', err);
            return res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
          }

          res.json({
            totalVisits: visits?.total || 0,
            totalPageViews: pageViews?.total || 0,
            avgTimeOnPage: pageViews?.avg_time || 0,
            totalConversions: conversions?.total || 0
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});

// GET /api/admin/traffic-sources - Traffic-Quellen
router.get('/traffic-sources', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    db.all(`
      SELECT referrer_type, COUNT(*) as count 
      FROM visits 
      WHERE first_visit_at BETWEEN ? AND ?
      GROUP BY referrer_type
      ORDER BY count DESC
    `, [start, end], (err, sources) => {
      if (err) {
        console.error('Error fetching traffic sources:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Traffic-Quellen' });
      }

      const typeLabels = {
        'direct': 'Direkt',
        'search': 'Suchmaschine',
        'social': 'Social Media',
        'referral': 'Verweis',
        'ad': 'Werbung',
        'email': 'E-Mail',
        'other': 'Sonstige'
      };

      res.json({
        labels: sources.map(s => typeLabels[s.referrer_type] || s.referrer_type),
        values: sources.map(s => s.count)
      });
    });
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Traffic-Quellen' });
  }
});

// GET /api/admin/page-views - Seitenaufrufe
router.get('/page-views', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    db.all(`
      SELECT page_path, COUNT(*) as count 
      FROM page_views 
      WHERE viewed_at BETWEEN ? AND ?
      GROUP BY page_path
      ORDER BY count DESC
      LIMIT 10
    `, [start, end], (err, pages) => {
      if (err) {
        console.error('Error fetching page views:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Seitenaufrufe' });
      }

      res.json({
        labels: pages.map(p => p.page_path || '/'),
        values: pages.map(p => p.count)
      });
    });
  } catch (error) {
    console.error('Error fetching page views:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Seitenaufrufe' });
  }
});

// GET /api/admin/conversions - Conversions
router.get('/conversions', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    db.all(`
      SELECT conversion_type, COUNT(*) as count 
      FROM conversions 
      WHERE converted_at BETWEEN ? AND ?
      GROUP BY conversion_type
      ORDER BY count DESC
    `, [start, end], (err, convs) => {
      if (err) {
        console.error('Error fetching conversions:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Conversions' });
      }

      const typeLabels = {
        'phone_call': 'Telefon',
        'whatsapp': 'WhatsApp',
        'form_submit': 'Formular',
        'appointment': 'Termin',
        'email': 'E-Mail',
        'other': 'Sonstige'
      };

      res.json({
        labels: convs.map(c => typeLabels[c.conversion_type] || c.conversion_type),
        values: convs.map(c => c.count)
      });
    });
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Conversions' });
  }
});

// GET /api/admin/demographics - Demografie
router.get('/demographics', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    // Device Types
    db.all(`
      SELECT device_type, COUNT(*) as count 
      FROM user_demographics 
      WHERE recorded_at BETWEEN ? AND ?
      GROUP BY device_type
      ORDER BY count DESC
    `, [start, end], (err, devices) => {
      if (err) {
        console.error('Error fetching demographics:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Demografie' });
      }

      const deviceLabels = {
        'desktop': 'Desktop',
        'mobile': 'Mobil',
        'tablet': 'Tablet',
        'other': 'Sonstige'
      };

      // Countries
      db.all(`
        SELECT country, COUNT(*) as count 
        FROM user_demographics 
        WHERE recorded_at BETWEEN ? AND ? AND country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      `, [start, end], (err, countries) => {
        if (err) {
          console.error('Error fetching demographics:', err);
          return res.status(500).json({ error: 'Fehler beim Laden der Demografie' });
        }

        res.json({
          deviceTypes: {
            labels: devices.map(d => deviceLabels[d.device_type] || d.device_type),
            values: devices.map(d => d.count)
          },
          countries: {
            labels: countries.map(c => c.country || 'Unknown'),
            values: countries.map(c => c.count)
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Demografie' });
  }
});

// GET /api/admin/keywords - Top Keywords
router.get('/keywords', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    db.all(`
      SELECT keyword, COUNT(*) as count 
      FROM search_keywords 
      WHERE found_at BETWEEN ? AND ?
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT 20
    `, [start, end], (err, keywords) => {
      if (err) {
        console.error('Error fetching keywords:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Keywords' });
      }

      res.json(keywords.map(k => ({
        keyword: k.keyword,
        count: k.count
      })));
    });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Keywords' });
  }
});

// GET /api/admin/trust-signals - Trust Signals
router.get('/trust-signals', requireAuth, (req, res) => {
  try {
    const { start, end } = req.query;

    db.all(`
      SELECT signal_type, COUNT(*) as count 
      FROM trust_signals 
      WHERE interacted_at BETWEEN ? AND ?
      GROUP BY signal_type
      ORDER BY count DESC
    `, [start, end], (err, signals) => {
      if (err) {
        console.error('Error fetching trust signals:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Trust Signals' });
      }

      const signalLabels = {
        'review': 'Bewertungen',
        'certificate': 'Zertifikate',
        'badge': 'Badges',
        'testimonial': 'Testimonials',
        'award': 'Auszeichnungen',
        'other': 'Sonstige'
      };

      res.json({
        labels: signals.map(s => signalLabels[s.signal_type] || s.signal_type),
        values: signals.map(s => s.count)
      });
    });
  } catch (error) {
    console.error('Error fetching trust signals:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Trust Signals' });
  }
});

module.exports = router;
