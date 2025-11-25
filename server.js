const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// WhatsApp-Service (optional - nur wenn konfiguriert)
let whatsappService = null;
try {
    whatsappService = require('./whatsapp-service');
} catch (error) {
    console.log('⚠️ WhatsApp-Service nicht verfügbar. Installiere whatsapp-web.js für WhatsApp-Benachrichtigungen.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS mit expliziten Optionen für bessere Kompatibilität
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// Body Parser für JSON und URL-encoded
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Statische Dateien
app.use(express.static('public'));

// 301-Weiterleitungen für alte Unterseiten (NICHT für Stadt-Unterseiten!)
// Nur für Seiten, die nicht mehr benötigt werden
app.get('/leistungen.html', (req, res) => {
    res.redirect(301, '/#leistungen');
});

app.get('/leistungen', (req, res) => {
    res.redirect(301, '/#leistungen');
});

app.get('/galerie.html', (req, res) => {
    res.redirect(301, '/#galerie');
});

app.get('/galerie', (req, res) => {
    res.redirect(301, '/#galerie');
});

app.get('/ueber-uns.html', (req, res) => {
    res.redirect(301, '/#ueber-uns');
});

app.get('/ueber-uns', (req, res) => {
    res.redirect(301, '/#ueber-uns');
});

app.get('/kontakt.html', (req, res) => {
    res.redirect(301, '/#terminbuchung');
});

app.get('/kontakt', (req, res) => {
    res.redirect(301, '/#terminbuchung');
});

// Datenbank-Datei für Termine
const APPOINTMENTS_FILE = path.join(__dirname, 'data', 'appointments.json');
// Datei für Besucher-Tracking
const VISITORS_FILE = path.join(__dirname, 'data', 'visitors.json');

// Stelle sicher, dass data Ordner existiert
fs.ensureDirSync(path.join(__dirname, 'data'));

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

// Lade Besucher-Daten
function loadVisitors() {
    try {
        if (fs.existsSync(VISITORS_FILE)) {
            const data = fs.readFileSync(VISITORS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Besucher-Daten:', error);
    }
    return {};
}

// Speichere Besucher-Daten
function saveVisitors(visitors) {
    try {
        fs.writeFileSync(VISITORS_FILE, JSON.stringify(visitors, null, 2));
        return true;
    } catch (error) {
        console.error('Fehler beim Speichern der Besucher-Daten:', error);
        return false;
    }
}

// Email-Transporter konfigurieren
// HINWEIS: Passe diese Werte an deine Email-Konfiguration an
const transporter = nodemailer.createTransport({
    service: 'gmail', // oder dein Email-Provider (z.B. 'smtp.gmail.com')
    auth: {
        user: process.env.EMAIL_USER || 'deine-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'dein-app-passwort'
    }
});

// Alternative: SMTP-Konfiguration
// const transporter = nodemailer.createTransport({
//     host: 'smtp.example.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

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
    
    // Email an dich senden
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'deine-email@gmail.com',
            to: process.env.ADMIN_EMAIL || 'info@gutachtenruhr.de',
            subject: `Neue Terminanfrage von ${name} - ${date} um ${time} Uhr`,
            html: `
                <h2>Neue Terminanfrage</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Wunschtermin:</strong> ${formattedDate} um ${time} Uhr</p>
                <p><strong>Bevorzugte Rückrufzeit:</strong> ${callbackTime || 'flexibel'}</p>
                ${vehicleInfo ? `<p><strong>Fahrzeuginfo:</strong> ${vehicleInfo}</p>` : ''}
                ${message ? `<p><strong>Nachricht:</strong> ${message}</p>` : ''}
                <p><strong>Termin-ID:</strong> ${newAppointment.id}</p>
            `
        });
        
        // Bestätigungs-Email an Kunden
        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'deine-email@gmail.com',
            to: email,
            subject: 'Terminanfrage erhalten - GutachtenRuhr',
            html: `
                <h2>Vielen Dank für deine Terminanfrage!</h2>
                <p>Hallo ${name},</p>
                <p>wir haben deine Terminanfrage erhalten:</p>
                <ul>
                    <li><strong>Termin:</strong> ${formattedDate} um ${time} Uhr</li>
                    <li><strong>Rückrufzeit:</strong> ${callbackTime || 'flexibel'}</li>
                </ul>
                <p>Wir prüfen deine Anfrage und melden uns schnellstmöglich bei dir unter ${phone}.</p>
                <p>Falls du Fragen hast, ruf uns einfach an: <strong>0160 9708 9709</strong></p>
                <p>Beste Grüße,<br>Dein Team von GutachtenRuhr</p>
            `
        });
    } catch (emailError) {
        console.error('Email-Versand fehlgeschlagen:', emailError);
        // Termin wurde gespeichert, auch wenn Email fehlschlägt
    }
    
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

// Error-Handling für POST /api/appointment
app.use('/api/appointment', (err, req, res, next) => {
    console.error('❌ Fehler in /api/appointment:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Interner Serverfehler. Bitte versuche es später erneut.' 
    });
});

// API: Alle Termine abrufen (für Admin)
app.get('/api/appointments', (req, res) => {
    const appointments = loadAppointments();
    res.json(appointments);
});

// API: Termin-Status aktualisieren
app.patch('/api/appointment/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointments = loadAppointments();
    const appointment = appointments.find(apt => apt.id === id);
    
    if (!appointment) {
        return res.status(404).json({ error: 'Termin nicht gefunden' });
    }
    
    appointment.status = status;
    appointment.updatedAt = new Date().toISOString();
    
    if (!saveAppointments(appointments)) {
        return res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
    
    res.json({ success: true, appointment });
});

// API: Kontaktformular (ohne Termin)
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }
    
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER || 'deine-email@gmail.com',
            to: process.env.ADMIN_EMAIL || 'info@gutachtenruhr.de',
            subject: `Neue Kontaktanfrage von ${name}`,
            html: `
                <h2>Neue Kontaktanfrage</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                ${message ? `<p><strong>Nachricht:</strong> ${message}</p>` : ''}
            `
        });
        
        res.json({ success: true, message: 'Nachricht erfolgreich gesendet' });
    } catch (error) {
        console.error('Email-Versand fehlgeschlagen:', error);
        res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
    }
});

// API: Besucher-Tracking (DEAKTIVIERT - später wieder aktivieren)
// Um zu aktivieren: Kommentare entfernen
/*
app.post('/api/track-visitor', async (req, res) => {
    // IP-Adresse ermitteln (berücksichtigt Proxy/Reverse Proxy)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.ip ||
               'Unknown';
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'Direct';
    const timestamp = new Date().toISOString();
    
    // Besucher-Daten laden
    const visitors = loadVisitors();
    
    // Prüfen ob IP bereits bekannt ist
    const isReturning = visitors.hasOwnProperty(ip);
    const visitCount = isReturning ? (visitors[ip].visitCount || 0) + 1 : 1;
    
    // Besucher-Daten aktualisieren
    visitors[ip] = {
        firstVisit: isReturning ? visitors[ip].firstVisit : timestamp,
        lastVisit: timestamp,
        visitCount: visitCount,
        userAgent: userAgent,
        referer: referer
    };
    
    // Speichern
    saveVisitors(visitors);
    
    // WhatsApp-Nachricht erstellen
    const visitorType = isReturning ? '🔄 Wiederkehrender Besucher' : '🆕 Neuer Besucher';
    const message = `
${visitorType}

🌐 IP-Adresse: ${ip}
📊 Besuche: ${visitCount}x
🕐 Zeit: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
🌍 Referer: ${referer}
📱 Browser: ${userAgent.substring(0, 60)}...
    `.trim();
    
    // WhatsApp-Benachrichtigung senden (wenn konfiguriert)
    if (whatsappService && process.env.ADMIN_PHONE_NUMBER) {
        try {
            const whatsappResult = await whatsappService.sendMessage(
                process.env.ADMIN_PHONE_NUMBER,
                message
            );
            
            if (whatsappResult.success) {
                console.log('✅ Besucher-Tracking WhatsApp-Nachricht gesendet');
            } else {
                console.log('⚠️ WhatsApp-Versand fehlgeschlagen:', whatsappResult.error);
            }
        } catch (error) {
            console.error('⚠️ WhatsApp-Versand fehlgeschlagen:', error);
        }
    }
    
    res.json({ 
        success: true, 
        isReturning: isReturning,
        visitCount: visitCount 
    });
});
*/

// Funktion zum Ermitteln der lokalen IP-Adresse
function getLocalIPAddress() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // IPv4 und nicht localhost
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIPAddress();
    
    console.log(`🚀 Server läuft auf:`);
    console.log(`   📍 Local:    http://localhost:${PORT}`);
    console.log(`   🌐 Network:  http://${localIP}:${PORT}`);
    console.log(`\n📅 Terminbuchungssystem aktiv`);
    console.log(`📧 Email-Konfiguration: ${process.env.EMAIL_USER || 'Bitte konfigurieren'}`);
    console.log(`\n💡 Um von anderen Geräten im WLAN zuzugreifen:`);
    console.log(`   Verwende: http://${localIP}:${PORT}`);
    
    // WhatsApp initialisieren (wenn verfügbar)
    if (whatsappService && process.env.ADMIN_PHONE_NUMBER) {
        console.log(`\n📱 WhatsApp wird initialisiert...`);
        whatsappService.initialize().catch(err => {
            console.error('❌ Fehler beim Initialisieren von WhatsApp:', err.message);
            console.log('💡 Installiere whatsapp-web.js: npm install whatsapp-web.js qrcode-terminal');
        });
    } else {
        console.log(`\n📱 WhatsApp nicht konfiguriert (ADMIN_PHONE_NUMBER fehlt)`);
    }
});

