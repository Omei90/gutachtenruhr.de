// Analytics Backend Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Datenbank initialisieren (beim ersten Start)
const initDatabase = require('./database/init-database');
initDatabase().catch(error => {
  console.error('Fehler bei Datenbank-Initialisierung:', error.message);
});

// Routen importieren
const adminRoutes = require('./api/routes/admin');

// Stadt-Daten laden
const citiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json'), 'utf8'));

// Template-Cache
let templateCache = null;

// Gerenderte Templates cachen (pro Stadt)
const renderedCache = {};

// Template laden und cachen
function loadTemplate() {
  if (!templateCache) {
    templateCache = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  }
  return templateCache;
}

// Alle Städte für areaServed generieren
function generateAreaServed(cityName) {
  const allCities = [
    { "@type": "City", "name": "Oberhausen" },
    { "@type": "City", "name": "Mülheim an der Ruhr" },
    { "@type": "City", "name": "Essen" },
    { "@type": "City", "name": "Duisburg" },
    { "@type": "City", "name": "Bochum" },
    { "@type": "City", "name": "Gelsenkirchen" },
    { "@type": "City", "name": "Dortmund" },
    { "@type": "City", "name": "Herne" },
    { "@type": "City", "name": "Wuppertal" },
    { "@type": "City", "name": "Köln" },
    { "@type": "City", "name": "Düsseldorf" },
    { "@type": "City", "name": "Aachen" },
    { "@type": "City", "name": "Bonn" },
    { "@type": "City", "name": "Bielefeld" },
    { "@type": "City", "name": "Münster" },
    { "@type": "City", "name": "Hagen" },
    { "@type": "City", "name": "Hamm" },
    { "@type": "City", "name": "Mönchengladbach" },
    { "@type": "City", "name": "Krefeld" },
    { "@type": "City", "name": "Solingen" },
    { "@type": "City", "name": "Leverkusen" },
    { "@type": "City", "name": "Neuss" },
    { "@type": "City", "name": "Recklinghausen" },
    { "@type": "City", "name": "Bottrop" },
    { "@type": "State", "name": "Nordrhein-Westfalen" }
  ];
  
  // Spezifische Stadt an erste Stelle setzen
  const cityIndex = allCities.findIndex(c => c.name === cityName);
  if (cityIndex > 0) {
    const city = allCities.splice(cityIndex, 1)[0];
    allCities.unshift(city);
  }
  
  return JSON.stringify(allCities);
}

// Keywords generieren
function generateKeywords(cityName, citySlug) {
  const baseKeywords = [
    `kfz gutachter ${citySlug}`,
    `kfz sachverständiger ${citySlug}`,
    `schadengutachten ${citySlug}`,
    `unfallgutachten ${citySlug}`,
    `kfz gutachten ${citySlug}`,
    'kfz gutachter nrw',
    'kfz gutachter nordrhein-westfalen',
    'gutachtenruhr',
    'carsten heiken'
  ];
  return baseKeywords.join(', ');
}

// Template rendern (mit Caching)
function renderTemplate(cityData, baseUrl) {
  // Cache-Key erstellen (basierend auf Stadt-Slug)
  const cacheKey = cityData.slug;
  
  // Prüfe ob bereits gecacht
  if (renderedCache[cacheKey]) {
    return renderedCache[cacheKey];
  }
  
  const template = loadTemplate();
  const cityName = cityData.name;
  const citySlug = cityData.slug;
  const canonicalUrl = cityData ? `${baseUrl}/?stadt=${citySlug}` : baseUrl;
  
  // OG und Twitter Tags
  const ogTitle = cityData.metaTitle || `Kfz Gutachter ${cityName} | Kostenlos 24h | GutachtenRuhr`;
  const ogDescription = cityData.metaDescription || `Kostenloses Kfz-Gutachten in ${cityName} - Vor Ort Service im Außendienst.`;
  const twitterTitle = ogTitle;
  const twitterDescription = ogDescription;
  
  // Ersetzungen
  const replacements = {
    '{{META_TITLE}}': cityData.metaTitle || `Kfz Gutachter ${cityName} | Kostenlos 24h | GutachtenRuhr`,
    '{{META_DESCRIPTION}}': cityData.metaDescription || `Kostenloses Kfz-Gutachten in ${cityName} - Vor Ort Service im Außendienst.`,
    '{{META_KEYWORDS}}': generateKeywords(cityName, citySlug),
    '{{CITY_NAME}}': cityName,
    '{{OG_TITLE}}': ogTitle,
    '{{OG_DESCRIPTION}}': ogDescription,
    '{{TWITTER_TITLE}}': twitterTitle,
    '{{TWITTER_DESCRIPTION}}': twitterDescription,
    '{{CANONICAL_URL}}': canonicalUrl,
    '{{H1_TITLE}}': cityData.h1 || `Kfz Gutachter ${cityName}`,
    '{{HERO_TEXT}}': cityData.heroText || `Vor Ort Service in ${cityName} und ganz NRW`,
    '{{AREA_SERVED_JSON}}': generateAreaServed(cityName)
  };
  
  let rendered = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    rendered = rendered.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  
  // In Cache speichern
  renderedCache[cacheKey] = rendered;
  
  return rendered;
}

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Für Dashboard-Anforderungen
  crossOriginEmbedderPolicy: false
}));

// CORS konfigurieren
app.use(cors(config.cors));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging (ganz früh)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate Limiting für Admin-API
const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: 100, // 100 Requests pro Minute für Admin
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.'
});

app.use('/api/admin', adminLimiter);

// API-Routen registrieren
app.use('/api/admin', adminRoutes);

// Root Route - serviere index.html oder stadt-spezifische Version
app.get('/', (req, res) => {
  const citySlug = req.query.stadt;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  // Wenn keine Stadt angegeben, normale index.html servieren
  if (!citySlug) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  
  // Stadt-Daten prüfen
  const cityData = citiesData[citySlug];
  if (!cityData) {
    // Ungültige Stadt - normale index.html servieren
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  
  // Template rendern
  try {
    const rendered = renderTemplate(cityData, baseUrl);
    
    // HTTP-Cache-Header setzen für bessere Performance
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 Stunde Cache
    res.setHeader('ETag', `"${citySlug}-${Date.now()}"`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    res.send(rendered);
  } catch (error) {
    console.error('Fehler beim Rendern des Templates:', error);
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Static Files (für Dashboard und Website) - NACH API-Routen
// WICHTIG: express.static() kommt NACH den API-Routen
// Aber nur für nicht-API-Routen
const staticMiddleware = express.static(__dirname, {
  index: false,
  dotfiles: 'ignore'
});

app.use((req, res, next) => {
  // Wenn es eine API-Route ist, überspringe express.static()
  if (req.path.startsWith('/api/')) {
    return next();
  }
  staticMiddleware(req, res, next);
});

app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Dashboard Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Favicon ignorieren (wenn nicht vorhanden)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 404 Handler - nur für API-Routen JSON, sonst nichts (Express zeigt Standard-404)
app.use((req, res) => {
  // Wenn es eine API-Route ist, JSON zurückgeben
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Endpoint nicht gefunden' });
  } else {
    // Für andere Routen, versuche index.html zu servieren (SPA-Fallback)
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('Seite nicht gefunden');
      }
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Interner Serverfehler',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server starten
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log(`Analytics Backend Server läuft auf http://${HOST}:${PORT}`);
  console.log(`Health Check: http://${HOST}:${PORT}/health`);
});

module.exports = app;

