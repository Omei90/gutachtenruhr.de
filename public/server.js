// Analytics Backend Server
// Lade .env Datei (wichtig für ADMIN_PHONE_NUMBER)
require('dotenv').config();

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
    // Versuche zuerst im Hauptverzeichnis, dann im aktuellen Verzeichnis
    try {
        whatsappService = require('../whatsapp-service');
    } catch (e) {
        try {
            whatsappService = require('./whatsapp-service');
        } catch (e2) {
            throw e;
        }
    }
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
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Deaktiviert für HTTP (wird bei HTTPS automatisch aktiviert)
  originAgentCluster: false // Deaktiviert um Warnungen zu vermeiden
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
    
    // Alle Zeitslots sind immer verfügbar (keine Prüfung auf Belegung)
    const allSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00'
    ];
    
    // Alle Slots sind verfügbar
    res.json({ available: allSlots, booked: [] });
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
    
    // Lade Termine (für Speicherung, aber keine Prüfung auf Belegung)
    const appointments = loadAppointments();
    
    // Erstelle neuen Termin (Termine sind immer verfügbar)
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

// API: Besucher-Tracking
app.post('/api/track-visitor', async (req, res) => {
    try {
        const db = require('./api/db');
        const useragent = require('useragent');
        const geoip = require('geoip-lite');
        
        const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const userAgent = req.headers['user-agent'] || '';
        const referrer = req.headers['referer'] || req.headers['referrer'] || '';
        const sessionId = req.body.sessionId || req.headers['x-session-id'] || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Browser-Info parsen
        const agent = useragent.parse(userAgent);
        const deviceType = /mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 
                          /tablet|ipad/i.test(userAgent) ? 'tablet' : 'desktop';
        
        // GeoIP
        const geo = geoip.lookup(ip);
        
        // Referrer-Typ bestimmen
        let referrerType = 'direct';
        if (referrer) {
            if (/google|bing|yahoo|duckduckgo/i.test(referrer)) referrerType = 'search';
            else if (/facebook|twitter|instagram|linkedin/i.test(referrer)) referrerType = 'social';
            else if (/utm_source|utm_medium|utm_campaign/.test(referrer)) referrerType = 'ad';
            else referrerType = 'referral';
        }
        
        // Prüfe ob Session bereits existiert
        db.get('SELECT id, session_id FROM visits WHERE session_id = ? ORDER BY first_visit_at DESC LIMIT 1', 
            [sessionId], async (err, existingVisit) => {
                if (err) {
                    console.error('Error checking existing visit:', err);
                    return res.json({ success: false, error: 'Database error' });
                }
                
                if (existingVisit) {
                    // Update last activity
                    db.run('UPDATE visits SET last_activity_at = datetime("now") WHERE id = ?', [existingVisit.id], (err) => {
                        if (err) console.error('Error updating visit:', err);
                    });
                    
                    // Page View hinzufügen
                    db.run(`INSERT INTO page_views (visit_id, session_id, page_url, page_title, page_path, viewed_at) 
                            VALUES (?, ?, ?, ?, ?, datetime("now"))`, 
                        [existingVisit.id, sessionId, req.body.pageUrl || '/', req.body.pageTitle || '', req.body.pagePath || '/'],
                        (err) => {
                            if (err) console.error('Error inserting page view:', err);
                        });
                    
                    console.log('✅ Bestehender Besuch aktualisiert:', existingVisit.id);
                    return res.json({ 
                        success: true, 
                        isReturning: true,
                        visitCount: 1,
                        sessionId: sessionId
                    });
                } else {
                    // Neue Session erstellen
                    db.run(`INSERT INTO visits 
                            (session_id, ip_address, user_agent, referrer, referrer_type, device_type, browser, browser_version, os, os_version, country, region, city, first_visit_at, last_activity_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))`,
                        [sessionId, ip, userAgent, referrer, referrerType, deviceType, agent.family, agent.toVersion(), agent.os.family, agent.os.toVersion(), 
                         geo?.country || null, geo?.region || null, geo?.city || null],
                        function(err) {
                            if (err) {
                                console.error('Error creating visit:', err);
                                return res.json({ success: false, error: 'Database error' });
                            }
                            
                            const visitId = this.lastID;
                            
                            // Page View hinzufügen
                            db.run(`INSERT INTO page_views (visit_id, session_id, page_url, page_title, page_path, viewed_at) 
                                    VALUES (?, ?, ?, ?, ?, datetime("now"))`, 
                                [visitId, sessionId, req.body.pageUrl || '/', req.body.pageTitle || '', req.body.pagePath || '/']);
                            
                            // Demografie-Daten speichern
                            db.run(`INSERT INTO user_demographics 
                                    (visit_id, session_id, country, region, city, device_type, browser, browser_version, os, os_version, recorded_at)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`,
                                [visitId, sessionId, geo?.country || null, geo?.region || null, geo?.city || null, 
                                 deviceType, agent.family, agent.toVersion(), agent.os.family, agent.os.toVersion()],
                                (err) => {
                                    if (err) console.error('Error inserting demographics:', err);
                                });
                            
                            console.log('✅ Neuer Besuch erstellt:', visitId);
                            res.json({ 
                                success: true, 
                                isReturning: false,
                                visitCount: 1,
                                sessionId: sessionId
                            });
                        });
                }
            });
    } catch (error) {
        console.error('Error tracking visitor:', error);
        res.json({ success: false, error: error.message });
    }
});

// API: Notify Visitor (für WhatsApp-Benachrichtigungen)
app.post('/api/notify-visitor', async (req, res) => {
    // Dieser Endpoint wird für WhatsApp-Benachrichtigungen verwendet
    // Tracking erfolgt über /api/track-visitor
    res.json({ success: true, message: 'Notification received' });
});

// API: Test - Prüfe ob Tracking-Daten vorhanden sind
app.get('/api/test-tracking', (req, res) => {
    try {
        const db = require('./api/db');
        db.get('SELECT COUNT(*) as count FROM visits', (err, visits) => {
            if (err) {
                return res.json({ error: err.message });
            }
            db.get('SELECT COUNT(*) as count FROM page_views', (err, pageViews) => {
                if (err) {
                    return res.json({ error: err.message });
                }
                res.json({
                    visits: visits?.count || 0,
                    pageViews: pageViews?.count || 0,
                    message: 'Tracking-Datenbank ist erreichbar'
                });
            });
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// API: Kontaktformular
app.post('/api/contact', async (req, res) => {
    console.log('📧 POST /api/contact empfangen');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, phone, message } = req.body;
    
    // Validierung
    if (!name || !email || !phone) {
        return res.status(400).json({ 
            success: false, 
            error: 'Pflichtfelder fehlen (Name, E-Mail, Telefon)' 
        });
    }
    
    // WhatsApp-Benachrichtigung an dich senden
    if (whatsappService && process.env.ADMIN_PHONE_NUMBER) {
        const whatsappMessage = `📧 *Neue Kontaktanfrage!*\n\n` +
            `*Name:* ${name}\n` +
            `*E-Mail:* ${email}\n` +
            `*Telefon:* ${phone}\n` +
            `${message ? `*Nachricht:* ${message}\n` : ''}` +
            `\n*Zeitpunkt:* ${new Date().toLocaleString('de-DE')}`;

        try {
            const whatsappResult = await whatsappService.sendMessage(
                process.env.ADMIN_PHONE_NUMBER,
                whatsappMessage
            );
            
            if (whatsappResult.success) {
                console.log('✅ WhatsApp-Benachrichtigung gesendet (Kontaktformular)');
            } else {
                console.error('⚠️ WhatsApp-Versand fehlgeschlagen (Kontaktformular):', whatsappResult.error);
            }
        } catch (error) {
            console.error('⚠️ WhatsApp-Versand fehlgeschlagen (Kontaktformular):', error);
            // Kontaktanfrage wurde trotzdem empfangen, auch wenn WhatsApp fehlschlägt
        }
    } else {
        console.log('⚠️ WhatsApp-Service nicht verfügbar für Kontaktformular');
    }
    
    console.log('✅ Kontaktanfrage empfangen:', name);
    res.json({ 
        success: true, 
        message: 'Deine Nachricht wurde erfolgreich gesendet. Wir melden uns schnellstmöglich bei dir.'
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

