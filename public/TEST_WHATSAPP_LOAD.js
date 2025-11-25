// Test ob whatsapp-service geladen werden kann
console.log("Teste WhatsApp-Service Laden...");

try {
    console.log("1. Versuche require('./whatsapp-service')...");
    const ws = require('./whatsapp-service');
    console.log("✓ WhatsApp-Service erfolgreich geladen!");
    console.log("Type:", typeof ws);
    console.log("Has initialize:", typeof ws.initialize === 'function');
} catch (error) {
    console.log("❌ Fehler beim Laden:", error.message);
    console.log("Stack:", error.stack);
}

