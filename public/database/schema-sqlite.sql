-- SQLite Datenbank Schema für Analytics Backend
-- Diese Datei wird automatisch beim ersten Start erstellt

-- Tabelle: Besucher-Sessions
CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    referrer_type TEXT DEFAULT 'direct' CHECK(referrer_type IN ('direct', 'search', 'social', 'referral', 'ad', 'email', 'other')),
    search_engine TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    device_type TEXT DEFAULT 'other' CHECK(device_type IN ('desktop', 'mobile', 'tablet', 'other')),
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    country TEXT,
    region TEXT,
    city TEXT,
    first_visit_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_ip_address ON visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_visits_first_visit_at ON visits(first_visit_at);
CREATE INDEX IF NOT EXISTS idx_visits_referrer_type ON visits(referrer_type);

-- Tabelle: Seitenaufrufe
CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    page_path TEXT,
    time_on_page INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    exit_page INTEGER DEFAULT 0,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_page_views_visit_id ON page_views(visit_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- Tabelle: Custom Events
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_category TEXT,
    event_action TEXT,
    event_label TEXT,
    element_id TEXT,
    element_class TEXT,
    element_text TEXT,
    page_url TEXT,
    value REAL,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_visit_id ON events(visit_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);

-- Tabelle: Conversions
CREATE TABLE IF NOT EXISTS conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    session_id TEXT NOT NULL,
    conversion_type TEXT NOT NULL CHECK(conversion_type IN ('phone_call', 'whatsapp', 'form_submit', 'appointment', 'email', 'other')),
    conversion_value REAL,
    page_url TEXT,
    element_id TEXT,
    element_text TEXT,
    converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_conversions_visit_id ON conversions(visit_id);
CREATE INDEX IF NOT EXISTS idx_conversions_session_id ON conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_conversions_conversion_type ON conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversions_converted_at ON conversions(converted_at);

-- Tabelle: Demografie-Daten
CREATE TABLE IF NOT EXISTS user_demographics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    country TEXT,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    timezone TEXT,
    device_type TEXT DEFAULT 'other' CHECK(device_type IN ('desktop', 'mobile', 'tablet', 'other')),
    device_brand TEXT,
    device_model TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    language TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_demographics_visit_id ON user_demographics(visit_id);
CREATE INDEX IF NOT EXISTS idx_user_demographics_session_id ON user_demographics(session_id);
CREATE INDEX IF NOT EXISTS idx_user_demographics_country ON user_demographics(country);
CREATE INDEX IF NOT EXISTS idx_user_demographics_device_type ON user_demographics(device_type);

-- Tabelle: Suchbegriffe
CREATE TABLE IF NOT EXISTS search_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    session_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    search_engine TEXT,
    position INTEGER,
    page_url TEXT,
    found_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_search_keywords_visit_id ON search_keywords(visit_id);
CREATE INDEX IF NOT EXISTS idx_search_keywords_keyword ON search_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_search_keywords_search_engine ON search_keywords(search_engine);
CREATE INDEX IF NOT EXISTS idx_search_keywords_found_at ON search_keywords(found_at);

-- Tabelle: Vertrauenssignale-Interaktionen
CREATE TABLE IF NOT EXISTS trust_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER,
    session_id TEXT NOT NULL,
    signal_type TEXT NOT NULL CHECK(signal_type IN ('review', 'certificate', 'badge', 'testimonial', 'award', 'other')),
    signal_id TEXT,
    signal_name TEXT,
    interaction_type TEXT DEFAULT 'view' CHECK(interaction_type IN ('view', 'click', 'hover', 'expand', 'download')),
    page_url TEXT,
    duration INTEGER,
    interacted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_trust_signals_visit_id ON trust_signals(visit_id);
CREATE INDEX IF NOT EXISTS idx_trust_signals_session_id ON trust_signals(session_id);
CREATE INDEX IF NOT EXISTS idx_trust_signals_signal_type ON trust_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_trust_signals_interacted_at ON trust_signals(interacted_at);

-- Tabelle: Admin-Benutzer
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

