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

// WhatsApp-Service (optional - nur wenn konfiguriert)
let whatsappService = null;
try {
    whatsappService = require('../whatsapp-service');
    // Initialisiere WhatsApp-Service beim Server-Start
    if (whatsappService && process.env.ADMIN_PHONE_NUMBER) {
        whatsappService.initialize().catch(error => {
            console.error('⚠️ WhatsApp-Initialisierung fehlgeschlagen:', error.message);
        });
    } else if (whatsappService) {
        console.log('⚠️ ADMIN_PHONE_NUMBER nicht in .env gesetzt. WhatsApp-Benachrichtigungen deaktiviert.');
    }
} catch (error) {
    console.log('⚠️ WhatsApp-Service nicht verfügbar. Installiere whatsapp-web.js für WhatsApp-Benachrichtigungen.');
}

// Stadt-Daten laden
const citiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cities.json'), 'utf8'));

// Termine-Datei
const APPOINTMENTS_FILE = path.join(__dirname, 'data', 'appointments.json');

// Stelle sicher, dass data Ordner existiert
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Lade Termine aus Datei
function loadAppointments() {
    try {
        if (fs.existsSync(APPOINTMENTS_FILE)) {
            const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
    }
    return [];
}

// Speichere Termine in Datei
function saveAppointments(appointments) {
    try {
        fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
        return true;
    } catch (error) {
        console.error('Fehler beim Speichern der Termine:', error);
        return false;
    }
}

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

// API: Verfügbare Zeitslots abrufen
app.get('/api/available-slots', (req, res) => {
    const { date } = req.query;
    
    if (!date) {
        return res.status(400).json({ error: 'Datum fehlt' });
    }
    
    const appointments = loadAppointments();
    const bookedSlots = appointments
        .filter(apt => apt.date === date && apt.status !== 'cancelled')
        .map(apt => apt.time);
    
    // Verfügbare Zeitslots (Mo-Fr 8-20 Uhr)
    const allSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00'
    ];
    
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({ available: availableSlots, booked: bookedSlots });
});

// API: Terminbuchung
app.post('/api/appointment', async (req, res) => {
    console.log('📥 POST /api/appointment empfangen');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, phone, date, time, callbackTime, message, vehicleInfo } = req.body;
    
    // Validierung
    if (!name || !email || !phone || !date || !time) {
        return res.status(400).json({ 
            success: false, 
            error: 'Pflichtfelder fehlen' 
        });
    }
    
    // Prüfe ob Termin bereits gebucht ist
    const appointments = loadAppointments();
    const existingAppointment = appointments.find(
        apt => apt.date === date && apt.time === time && apt.status !== 'cancelled'
    );
    
    if (existingAppointment) {
        return res.status(409).json({ 
            success: false, 
            error: 'Dieser Termin ist bereits vergeben' 
        });
    }
    
    // Erstelle neuen Termin
    const newAppointment = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        date,
        time,
        callbackTime: callbackTime || 'flexibel',
        message: message || '',
        vehicleInfo: vehicleInfo || '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    
    if (!saveAppointments(appointments)) {
        return res.status(500).json({ 
            success: false, 
            error: 'Fehler beim Speichern des Termins' 
        });
    }
    
    // Formatierte Datumsanzeige
    const formattedDate = new Date(date).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // WhatsApp-Benachrichtigung an dich senden
    if (whatsappService && process.env.ADMIN_PHONE_NUMBER) {
        const whatsappMessage = `🚗 *Neue Terminanfrage!*\n\n` +
            `*Name:* ${name}\n` +
            `*Telefon:* ${phone}\n` +
            `*Termin:* ${formattedDate} um ${time} Uhr\n` +
            `*Rückrufzeit:* ${callbackTime || 'flexibel'}\n` +
            `${vehicleInfo ? `*Fahrzeug:* ${vehicleInfo}\n` : ''}` +
            `${message ? `*Nachricht:* ${message}\n` : ''}` +
            `\n*Termin-ID:* ${newAppointment.id}`;

        try {
            const whatsappResult = await whatsappService.sendMessage(
                process.env.ADMIN_PHONE_NUMBER,
                whatsappMessage
            );
            
            if (whatsappResult.success) {
                console.log('✅ WhatsApp-Benachrichtigung gesendet');
            } else {
                console.error('⚠️ WhatsApp-Versand fehlgeschlagen:', whatsappResult.error);
            }
        } catch (error) {
            console.error('⚠️ WhatsApp-Versand fehlgeschlagen:', error);
            // Termin wurde gespeichert, auch wenn WhatsApp fehlschlägt
        }
    }
    
    console.log('✅ Termin erfolgreich gespeichert:', newAppointment.id);
    res.json({ 
        success: true, 
        message: 'Terminanfrage erfolgreich gesendet',
        appointmentId: newAppointment.id
    });
});

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

