# 📊 Google Ads & Analytics Setup für Dynamische Suchanzeigen

## ✅ Vorhandene Komponenten (Prüfung abgeschlossen)

### ✅ SEO-Grundlagen:
- ✅ Schema.org Structured Data (ProfessionalService + FAQ)
- ✅ Meta-Tags (Title, Description, Keywords)
- ✅ Open Graph Tags
- ✅ Twitter Cards
- ✅ Canonical URL
- ✅ Sitemap.xml
- ✅ robots.txt
- ✅ Event-Tracking im JavaScript (gtag() Events)

### ❌ Fehlende Komponenten:
- ❌ Google Ads Conversion Tag
- ❌ Google Analytics Tag
- ❌ Google Tag Manager (optional)

---

## 🔧 Einrichtung

### Schritt 1: Google Ads Account erstellen
1. Gehe zu: https://ads.google.com
2. Erstelle Account (falls noch nicht vorhanden)
3. Notiere deine Conversion ID (AW-XXXXXXXXXX)

### Schritt 2: Google Analytics Account erstellen
1. Gehe zu: https://analytics.google.com
2. Erstelle Property für `www.gutachtenruhr.de`
3. Notiere deine Measurement ID (G-XXXXXXXXXX)

### Schritt 3: Tags in HTML einfügen

**Platzierung:** Im `<head>` Bereich, direkt vor `</head>`

**Google Analytics Tag:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Google Ads Conversion Tag:**
```html
<!-- Google Ads Conversion Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXXX');
</script>
```

**ODER: Google Tag Manager (empfohlen):**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
```

---

## 📝 Conversion-Aktionen einrichten

### In Google Ads:
1. Tools & Einstellungen > Conversions
2. Neue Conversion-Aktion erstellen
3. Website-Aktion wählen
4. Conversion-Namen:
   - "Terminbuchung"
   - "Kontaktformular"
   - "Anruf"
   - "WhatsApp-Klick"

### Conversion-Tracking im Code:
Die Events sind bereits vorhanden:
- `appointment_booking` - Terminbuchung
- `form_submit` - Kontaktformular
- `phone_call` - Anruf
- `whatsapp_click` - WhatsApp-Klick

---

## 🔍 Google Search Console

1. Gehe zu: https://search.google.com/search-console
2. Property hinzufügen: `https://www.gutachtenruhr.de`
3. Verifizierung (HTML-Tag oder DNS)
4. Sitemap einreichen: `https://www.gutachtenruhr.de/sitemap.xml`

---

## ✅ Checkliste nach Einrichtung

- [ ] Google Ads Account erstellt
- [ ] Google Analytics Account erstellt
- [ ] Tags in HTML eingefügt
- [ ] Conversion-Aktionen in Google Ads erstellt
- [ ] Google Search Console verifiziert
- [ ] Sitemap eingereicht
- [ ] Tags getestet (Google Tag Assistant)

---

## 🎯 Dynamische Suchanzeigen einrichten

1. In Google Ads: Neue Kampagne erstellen
2. Kampagnentyp: **Suche**
3. Unterkampagne: **Dynamische Suchanzeigen**
4. Zielgruppe: Deutschland (oder NRW)
5. Budget festlegen
6. Anzeigengruppen erstellen

---

## 📊 Wichtige Hinweise

- **Domain muss verbunden sein** (DNS + SSL)
- **Sitemap muss erreichbar sein** (`/sitemap.xml`)
- **Schema.org muss korrekt sein** (bereits vorhanden ✅)
- **Conversion-Tracking muss funktionieren** (Events vorhanden ✅)

