const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.isReady = false;
    }

    async initialize() {
        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: './whatsapp-session'
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu'
                    ]
                }
            });

            // QR-Code anzeigen
            this.client.on('qr', (qr) => {
                console.log('\n📱 ============================================');
                console.log('📱 Scanne diesen QR-Code mit WhatsApp:');
                console.log('📱 ============================================\n');
                qrcode.generate(qr, { small: true });
                console.log('\n📱 Öffne WhatsApp auf deinem Handy');
                console.log('📱 Gehe zu Einstellungen > Verknüpfte Geräte > Gerät verknüpfen\n');
            });

            // Bereit
            this.client.on('ready', () => {
                console.log('✅ WhatsApp Client ist bereit!');
                this.isReady = true;
            });

            // Authentifiziert
            this.client.on('authenticated', () => {
                console.log('✅ WhatsApp authentifiziert!');
            });

            // Fehler
            this.client.on('auth_failure', (msg) => {
                console.error('❌ Authentifizierung fehlgeschlagen:', msg);
                this.isReady = false;
            });

            // Disconnect
            this.client.on('disconnected', (reason) => {
                console.log('⚠️ WhatsApp disconnected:', reason);
                this.isReady = false;
            });

            // Client initialisieren
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Fehler beim Initialisieren von WhatsApp:', error);
            this.isReady = false;
        }
    }

    async sendMessage(phoneNumber, message) {
        if (!this.isReady || !this.client) {
            return { 
                success: false, 
                error: 'WhatsApp Client ist nicht bereit. Bitte QR-Code scannen.' 
            };
        }

        try {
            // Formatiere Telefonnummer (muss mit Ländercode sein, z.B. 4916097089709)
            const formattedNumber = phoneNumber.replace(/\D/g, '');
            
            // Stelle sicher, dass die Nummer mit Ländercode beginnt
            const phoneWithCountryCode = formattedNumber.startsWith('49') 
                ? formattedNumber 
                : `49${formattedNumber}`;
            
            const chatId = `${phoneWithCountryCode}@c.us`;

            const result = await this.client.sendMessage(chatId, message);
            console.log('✅ WhatsApp-Nachricht gesendet an:', phoneWithCountryCode);
            return { success: true, messageId: result.id._serialized };
        } catch (error) {
            console.error('❌ Fehler beim Senden der WhatsApp-Nachricht:', error);
            return { success: false, error: error.message };
        }
    }

    async getClientInfo() {
        if (!this.client || !this.isReady) {
            return null;
        }
        try {
            return await this.client.info;
        } catch (error) {
            console.error('Fehler beim Abrufen der Client-Info:', error);
            return null;
        }
    }
}

module.exports = new WhatsAppService();






