// ============================================
// Script Loading Debug
// ============================================
console.log('script.js geladen');
console.log('DOM Ready State:', document.readyState);
console.log('DOM vollständig geladen:', document.body !== null);

// ============================================
// Hero Image Loading Optimization
// ============================================
function optimizeHeroImage() {
    const heroImage = document.querySelector('.hero-bg-image');
    if (!heroImage) return;
    
    // Prüfe ob Bild bereits geladen ist
    if (heroImage.complete && heroImage.naturalHeight !== 0) {
        heroImage.classList.add('loaded');
        console.log('Hero-Bild bereits geladen');
    } else {
        // Zeige Bild sofort, sobald es teilweise geladen ist (für bessere UX)
        // Das Bild wird sofort sichtbar, auch wenn es noch lädt
        heroImage.classList.add('loaded');
        
        // Warte auf vollständiges Laden für bessere Qualität
        heroImage.addEventListener('load', () => {
            console.log('Hero-Bild vollständig geladen');
        }, { once: true });
        
        // Fehlerbehandlung
        heroImage.addEventListener('error', () => {
            console.error('Fehler beim Laden des Hero-Bildes');
            // Bild bleibt sichtbar (Fallback-Hintergrund wird angezeigt)
        }, { once: true });
    }
}

// ============================================
// Smooth Scrolling
// ============================================
document.documentElement.style.scrollBehavior = 'smooth';


// ============================================
// FAQ Accordion
// ============================================
function initFAQAccordion() {
    console.log('initFAQAccordion aufgerufen');
    const faqQuestions = document.querySelectorAll('.faq-question');
    console.log('FAQ Fragen gefunden:', faqQuestions.length);
    
    if (faqQuestions.length === 0) {
        console.warn('Keine FAQ-Elemente gefunden!');
        return;
    }
    
    // Handler-Funktion für FAQ Toggle (ohne cloneNode - direkte Event-Listener)
    function handleFAQToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const question = e.currentTarget;
        const faqItem = question.closest('.faq-item');
        if (!faqItem) {
            console.warn('FAQ Item nicht gefunden');
            return;
        }
        
        const answer = faqItem.querySelector('.faq-answer');
        if (!answer) {
            console.warn('FAQ Answer nicht gefunden');
            return;
        }
        
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        // Suche sowohl nach <i> Tags als auch nach SVG-Icons
        const icon = question.querySelector('i') || question.querySelector('.icon-svg');
        
        // Close all other FAQ items
        faqQuestions.forEach(otherQuestion => {
            if (otherQuestion !== question) {
                const otherItem = otherQuestion.closest('.faq-item');
                if (!otherItem) return;
                const otherAnswer = otherItem.querySelector('.faq-answer');
                // Suche sowohl nach <i> Tags als auch nach SVG-Icons
                const otherIcon = otherQuestion.querySelector('i') || otherQuestion.querySelector('.icon-svg');
                
                otherQuestion.setAttribute('aria-expanded', 'false');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
                otherItem.classList.remove('active');
                if (otherIcon) {
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            }
        });
        
        // Toggle current FAQ item
        if (isExpanded) {
            question.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = null;
            faqItem.classList.remove('active');
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        } else {
            question.setAttribute('aria-expanded', 'true');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            faqItem.classList.add('active');
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
        }
    }
    
    // Füge Event-Listener direkt hinzu (ohne cloneNode)
    faqQuestions.forEach(question => {
        // Prüfe ob bereits initialisiert
        if (question.hasAttribute('data-faq-initialized')) {
            return; // Bereits initialisiert
        }
        
        question.setAttribute('data-faq-initialized', 'true');
        
        // Stelle sicher dass aria-expanded initial gesetzt ist
        if (!question.hasAttribute('aria-expanded')) {
            question.setAttribute('aria-expanded', 'false');
        }
        
        // Füge Click-Event-Listener hinzu (funktioniert für Desktop und Mobile)
        question.addEventListener('click', handleFAQToggle, { passive: false });
        
        // Füge Touch-Event-Listener für Mobile hinzu (Chrome-spezifisch)
        question.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleFAQToggle(e);
        }, { passive: false });
        
        // Stelle sicher dass pointer-events aktiviert sind
        question.style.pointerEvents = 'auto';
        question.style.cursor = 'pointer';
    });
    
    // Re-Initialisiere nach Icon-Ersetzung (MutationObserver)
    const faqObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.matches && node.matches('.faq-question')) {
                        if (!node.hasAttribute('data-faq-initialized')) {
                            node.setAttribute('data-faq-initialized', 'true');
                            if (!node.hasAttribute('aria-expanded')) {
                                node.setAttribute('aria-expanded', 'false');
                            }
                            node.addEventListener('click', handleFAQToggle, { passive: false });
                            node.addEventListener('touchend', function(e) {
                                e.preventDefault();
                                handleFAQToggle(e);
                            }, { passive: false });
                            node.style.pointerEvents = 'auto';
                            node.style.cursor = 'pointer';
                        }
                    } else if (node.querySelectorAll) {
                        const newQuestions = node.querySelectorAll('.faq-question');
                        newQuestions.forEach(q => {
                            if (!q.hasAttribute('data-faq-initialized')) {
                                q.setAttribute('data-faq-initialized', 'true');
                                if (!q.hasAttribute('aria-expanded')) {
                                    q.setAttribute('aria-expanded', 'false');
                                }
                                q.addEventListener('click', handleFAQToggle, { passive: false });
                                q.addEventListener('touchend', function(e) {
                                    e.preventDefault();
                                    handleFAQToggle(e);
                                }, { passive: false });
                                q.style.pointerEvents = 'auto';
                                q.style.cursor = 'pointer';
                            }
                        });
                    }
                }
            });
        });
    });
    
    // Beobachte FAQ-Container auf Änderungen
    const faqContainer = document.querySelector('.faq-container');
    if (faqContainer) {
        faqObserver.observe(faqContainer, {
            childList: true,
            subtree: true
        });
    } else {
        console.warn('FAQ Container nicht gefunden');
    }
}

// ============================================
// WhatsApp Notification on Page Visit with Location
// ============================================
function sendWhatsAppNotificationWithLocation() {
    // Only send once per session
    if (sessionStorage.getItem('locationNotificationSent') === 'true') {
        return;
    }
    
    // Collect visitor information
    const visitorInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || 'Direct',
        screen: {
            width: window.screen.width,
            height: window.screen.height
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
    
    // Get location if permission granted (optimized for faster response)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                visitorInfo.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                // Send notification with location (non-blocking)
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        sendLocationNotification(visitorInfo);
                    }, { timeout: 2000 });
                } else {
                    setTimeout(() => sendLocationNotification(visitorInfo), 0);
                }
                
                // Mark as sent
                sessionStorage.setItem('locationNotificationSent', 'true');
            },
            (error) => {
                // Location denied or unavailable
                console.log('Location not available:', error.message);
                visitorInfo.locationError = error.message;
                
                // Send notification without location (non-blocking)
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        sendLocationNotification(visitorInfo);
                    }, { timeout: 2000 });
                } else {
                    setTimeout(() => sendLocationNotification(visitorInfo), 0);
                }
                
                // Mark as sent
                sessionStorage.setItem('locationNotificationSent', 'true');
            },
            {
                enableHighAccuracy: false, // Schnellere Antwort
                timeout: 5000, // Reduziert von 10s auf 5s
                maximumAge: 60000 // Cache für 1 Minute
            }
        );
    } else {
        // Geolocation not supported
        visitorInfo.locationError = 'Geolocation not supported';
        
        // Send notification without location (non-blocking)
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                sendLocationNotification(visitorInfo);
            }, { timeout: 2000 });
        } else {
            setTimeout(() => sendLocationNotification(visitorInfo), 0);
        }
        
        sessionStorage.setItem('locationNotificationSent', 'true');
    }
}

function sendLocationNotification(visitorInfo) {
    // Rate limiting: Check if notification was sent in last 5 minutes
    const lastNotification = localStorage.getItem('lastWhatsAppNotification');
    const now = Date.now();
    if (lastNotification && (now - parseInt(lastNotification)) < 300000) { // 5 minutes
        console.log('WhatsApp notification rate limited');
        return;
    }
    
    // Format message for WhatsApp
    let message = '🌐 *Neuer Seitenbesuch - GutachtenRuhr.de*\n\n';
    message += `📅 ${new Date(visitorInfo.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}\n\n`;
    
    // Browser detection
    const browserInfo = getBrowserInfo(visitorInfo.userAgent);
    message += `🌐 *Browser:* ${browserInfo.name} ${browserInfo.version}\n`;
    message += `💻 *Gerät:* ${browserInfo.device}\n`;
    message += `📱 *Auflösung:* ${visitorInfo.viewport.width}x${visitorInfo.viewport.height}\n`;
    message += `🌍 *Sprache:* ${visitorInfo.language}\n`;
    
    if (visitorInfo.location) {
        const mapsUrl = `https://www.google.com/maps?q=${visitorInfo.location.latitude},${visitorInfo.location.longitude}`;
        message += `\n📍 *Standort:*\n`;
        message += `${visitorInfo.location.latitude}, ${visitorInfo.location.longitude}\n`;
        message += `🗺️ ${mapsUrl}\n`;
    }
    
    if (visitorInfo.referrer && visitorInfo.referrer !== 'Direct') {
        message += `\n🔗 *Quelle:* ${visitorInfo.referrer}\n`;
    }
    
    message += `\n🔗 ${window.location.href}`;
    
    // WhatsApp Business API number
    const whatsappNumber = '4916097089709';
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp link
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Try to send via Webhook (IFTTT, Zapier, n8n, etc.)
    // Replace YOUR_WEBHOOK_URL with your actual webhook URL
    const webhookUrl = ''; // User needs to configure this
    
    if (webhookUrl) {
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value1: message,
                value2: visitorInfo.referrer || 'Direct',
                value3: visitorInfo.location ? `${visitorInfo.location.latitude},${visitorInfo.location.longitude}` : 'N/A'
            })
        }).catch(() => {
            // Webhook failed, try direct API
            sendViaDirectAPI(message, visitorInfo);
        });
    } else {
        // Try direct backend API
        sendViaDirectAPI(message, visitorInfo, whatsappUrl);
    }
    
    // Update last notification time
    localStorage.setItem('lastWhatsAppNotification', now.toString());
    
    // Store in localStorage as backup
    const notifications = JSON.parse(localStorage.getItem('visitorNotifications') || '[]');
    notifications.push({
        ...visitorInfo,
        message: message,
        whatsappUrl: whatsappUrl,
        timestamp: Date.now()
    });
    
    // Keep only last 20 notifications
    if (notifications.length > 20) {
        notifications.shift();
    }
    
    localStorage.setItem('visitorNotifications', JSON.stringify(notifications));
}

function sendViaDirectAPI(message, visitorInfo, whatsappUrl) {
    // Try backend API first
    fetch('/api/notify-visitor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'page_visit',
            visitor: visitorInfo,
            message: message,
            whatsappUrl: whatsappUrl || ''
        })
    }).catch(() => {
        // API not available - notification stored in localStorage
        console.log('Visitor notification stored locally:', visitorInfo);
    });
}

function getBrowserInfo(userAgent) {
    let browser = 'Unknown';
    let version = '';
    let device = 'Desktop';
    
    // Detect browser
    if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
        version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        version = userAgent.match(/Version\/(\d+)/)?.[1] || '';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
        version = userAgent.match(/Edg\/(\d+)/)?.[1] || '';
    }
    
    // Detect device
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        device = /iPhone/.test(userAgent) ? 'iPhone' : /iPad/.test(userAgent) ? 'iPad' : 'Android';
    }
    
    return { name: browser, version: version, device: device };
}

// Send notification after page load (verzögert für bessere Performance)
// Verzögert von 2s auf 8s nach Page Load, um nicht den Hauptthread zu blockieren
function scheduleWhatsAppNotification() {
    // Verwende requestIdleCallback wenn verfügbar, sonst setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            setTimeout(sendWhatsAppNotificationWithLocation, 8000);
        }, { timeout: 5000 });
    } else {
        setTimeout(sendWhatsAppNotificationWithLocation, 8000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleWhatsAppNotification);
} else {
    scheduleWhatsAppNotification();
}

// ============================================
// Header Scroll Effect
// ============================================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const headerCtaGroup = document.querySelector('.header-cta-group');
    
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide header CTA buttons when scrolling down past 200px
    if (headerCtaGroup) {
        if (currentScroll > 200) {
            headerCtaGroup.classList.add('hidden');
        } else {
            headerCtaGroup.classList.remove('hidden');
        }
    }
    
    lastScroll = currentScroll;
});

// ============================================
// Mobile Menu Toggle
// ============================================
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navMobile = document.getElementById('nav-mobile');

if (mobileMenuToggle && navMobile) {
    mobileMenuToggle.addEventListener('click', () => {
        navMobile.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (navMobile.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking on a link
    navMobile.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMobile.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // Close menu when clicking on close button (pseudo-element)
    navMobile.addEventListener('click', function(event) {
        const rect = navMobile.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click was in the top-right corner (close button area)
        if (x > rect.width - 80 && y < 80) {
            navMobile.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            document.body.style.overflow = '';
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ============================================
// Bottom Navigation Active State
// ============================================
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
if (bottomNavItems.length > 0) {
    // Click-Animation für Bottom-Nav-Items
    bottomNavItems.forEach(item => {
        // Überspringe den Menü-Button, da dieser das Dropdown öffnet
        if (item.classList.contains('bottom-nav-menu-btn')) {
            return;
        }
        
        // Animation bei mousedown/touchstart für sofortiges Feedback
        item.addEventListener('mousedown', function(e) {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 600);
        });
        
        item.addEventListener('touchstart', function(e) {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 600);
        });
        
        // Auch bei click für Fallback
        item.addEventListener('click', function(e) {
            // Nur wenn nicht bereits durch mousedown/touchstart getriggert
            if (!this.classList.contains('clicked')) {
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 600);
            }
        });
    });
    
    // Bottom Nav Dropdown Menu Toggle
    const bottomNavMenuBtn = document.getElementById('bottom-nav-menu-btn');
    const bottomNavDropdown = document.getElementById('bottom-nav-dropdown');
    
    if (bottomNavMenuBtn && bottomNavDropdown) {
        // Toggle Dropdown
        bottomNavMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = bottomNavDropdown.classList.contains('active');
            
            if (isActive) {
                // Schließen
                bottomNavDropdown.classList.remove('active');
                bottomNavMenuBtn.classList.remove('active');
            } else {
                // Öffnen
                bottomNavDropdown.classList.add('active');
                bottomNavMenuBtn.classList.add('active');
            }
            
            // Click-Animation für Menü-Button
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 600);
        });
        
        // Schließe Dropdown beim Klick auf einen Link
        const dropdownItems = bottomNavDropdown.querySelectorAll('.bottom-nav-dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                bottomNavDropdown.classList.remove('active');
                bottomNavMenuBtn.classList.remove('active');
            });
        });
        
        // Schließe Dropdown beim Klick außerhalb
        document.addEventListener('click', function(e) {
            if (!bottomNavMenuBtn.contains(e.target) && !bottomNavDropdown.contains(e.target)) {
                bottomNavDropdown.classList.remove('active');
                bottomNavMenuBtn.classList.remove('active');
            }
        });
    }
    
    const updateActiveNavItem = () => {
        const scrollPosition = window.scrollY;
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                bottomNavItems.forEach((item) => {
                    const href = item.getAttribute('href');
                    if (href === `#${sectionId}`) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    };
    
    window.addEventListener('scroll', updateActiveNavItem);
    updateActiveNavItem();
}

// ============================================
// Sticky Contact Bar
// ============================================
const stickyContactBar = document.getElementById('sticky-contact-bar');

if (stickyContactBar) {
    let lastScrollTop = 0;
    let ticking = false;
    const header = document.getElementById('header');
    
    // Set banner position directly under header
    function updateBannerPosition() {
        if (header) {
            const headerHeight = header.offsetHeight;
            stickyContactBar.style.top = headerHeight + 'px';
        }
    }
    
    // Update position on load and resize
    updateBannerPosition();
    window.addEventListener('resize', updateBannerPosition);
    
    function updateStickyBar() {
        // Get scroll position - try multiple methods for better mobile compatibility
        const scrollTop = Math.max(
            window.pageYOffset || 0,
            window.scrollY || 0,
            document.documentElement.scrollTop || 0,
            document.body.scrollTop || 0
        );
        
        // Update banner position in case header height changed
        updateBannerPosition();
        
        // Show sticky bar after scrolling down 200px, hide when at top
        // Hide completely when scrolled to top (<= 10px) to prevent overlap with header
        if (scrollTop <= 10) {
            // Force remove when at top to ensure it disappears completely
            stickyContactBar.classList.remove('visible');
        } else if (scrollTop > 200) {
            // Show sticky bar after scrolling down 200px
            if (!stickyContactBar.classList.contains('visible')) {
                stickyContactBar.classList.add('visible');
            }
        } else {
            // Hide when scrolling back up but not at top yet
            stickyContactBar.classList.remove('visible');
        }
        
        // Update mobile navigation position when sticky bar visibility changes
        const navMobile = document.getElementById('nav-mobile');
        if (navMobile && window.innerWidth <= 768) {
            updateBannerPosition();
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateStickyBar);
            ticking = true;
        }
    }, { passive: true });
    
    // Initial check
    updateStickyBar();
    
    // Click-Animation für einzelne Container in der Sticky-Bar
    const stickyItems = stickyContactBar.querySelectorAll('.sticky-item');
    stickyItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Verhindere Event-Bubbling
            e.stopPropagation();
            
            // Füge 'clicked' Klasse hinzu für orange Animation
            this.classList.add('clicked');
            
            // Entferne Klasse nach Animation
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 500);
        });
    });
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#' || !targetId) return;
        
        e.preventDefault();
        const target = document.querySelector(targetId);
        
        if (target) {
            const headerHeight = header ? header.offsetHeight : 80;
            const stickyBarHeight = stickyContactBar && stickyContactBar.classList.contains('visible') ? stickyContactBar.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerHeight - stickyBarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navMobile && navMobile.classList.contains('active')) {
                navMobile.classList.remove('active');
            }
        }
    });
});

// ============================================
// Intersection Observer for Animations
// ============================================
// WICHTIG: Diese Observer werden jetzt in initScrollAnimations() initialisiert
// Alte direkte Initialisierung entfernt, um Konflikte zu vermeiden
// Die Animationen werden lazy initialisiert, wenn die erste Sektion sichtbar wird

// ============================================
// Phone Call Tracking
// ============================================
function trackPhoneCall(phoneNumber, source) {
    // Log phone call event
    console.log('Phone call initiated:', phoneNumber, 'from:', source);
    
    // Optional: Send analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_call', {
            'phone_number': phoneNumber,
            'source': source
        });
    }
    
    // Optional: Send to Google Analytics 4
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'phone_call',
            'phone_number': phoneNumber,
            'source': source
        });
    }
}

// Track all phone call links
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
        const phoneNumber = this.getAttribute('href').replace('tel:', '');
        const source = this.closest('section')?.id || 
                      this.closest('.header') ? 'header' :
                      this.closest('.sticky-contact-bar') ? 'sticky_bar' :
                      this.classList.contains('floating-phone') ? 'floating_button' : 'other';
        
        trackPhoneCall(phoneNumber, source);
    });
});

// Track WhatsApp clicks
document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(link => {
    link.addEventListener('click', function() {
        const source = this.closest('section')?.id || 
                      this.closest('.header') ? 'header' :
                      this.closest('.sticky-contact-bar') ? 'sticky_bar' :
                      this.classList.contains('floating-phone') ? 'floating_button' : 'other';
        
        console.log('WhatsApp click from:', source);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_click', {
                'source': source
            });
        }
    });
});

// ============================================
// Floating Phone Button Animation
// ============================================
const floatingPhone = document.getElementById('floating-phone');

if (floatingPhone) {
    // Add entrance animation
    setTimeout(() => {
        floatingPhone.style.opacity = '0';
        floatingPhone.style.transform = 'scale(0)';
        floatingPhone.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            floatingPhone.style.opacity = '1';
            floatingPhone.style.transform = 'scale(1)';
        }, 1000);
    }, 500);
    
    // Show/hide based on scroll position
    let lastScrollPosition = 0;
    
    window.addEventListener('scroll', () => {
        const currentScrollPosition = window.pageYOffset;
        
        // Hide when scrolling down, show when scrolling up
        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 300) {
            floatingPhone.style.transform = 'scale(0)';
            floatingPhone.style.opacity = '0';
        } else {
            floatingPhone.style.transform = 'scale(1)';
            floatingPhone.style.opacity = '1';
        }
        
        lastScrollPosition = currentScrollPosition;
    }, { passive: true });
}

// ============================================
// Appointment Calendar
// ============================================
class AppointmentCalendar {
    constructor() {
        console.log('AppointmentCalendar Constructor aufgerufen');
        try {
            this.currentDate = new Date();
            this.selectedDate = null;
            this.bookedSlots = new Set();
            this.calendarGrid = document.getElementById('calendar-grid');
            this.calendarMonth = document.getElementById('calendar-month');
            this.prevMonthBtn = document.getElementById('prev-month');
            this.nextMonthBtn = document.getElementById('next-month');
            this.appointmentDateInput = document.getElementById('appointment-date');
            this.appointmentDateDisplay = document.getElementById('appointment-date-display');
            this.appointmentTimeSelect = document.getElementById('appointment-time');
            
            // Debug: Prüfe ob alle Elemente gefunden wurden
            console.log('Kalender-Elemente gefunden:');
            console.log('  calendar-grid:', this.calendarGrid ? '✓' : '✗');
            console.log('  calendar-month:', this.calendarMonth ? '✓' : '✗');
            console.log('  prev-month:', this.prevMonthBtn ? '✓' : '✗');
            console.log('  next-month:', this.nextMonthBtn ? '✓' : '✗');
            console.log('  appointment-date:', this.appointmentDateInput ? '✓' : '✗');
            console.log('  appointment-date-display:', this.appointmentDateDisplay ? '✓' : '✗');
            console.log('  appointment-time:', this.appointmentTimeSelect ? '✓' : '✗');
            
            if (!this.calendarGrid) {
                console.warn('AppointmentCalendar: calendar-grid nicht gefunden');
            }
            if (!this.calendarMonth) {
                console.warn('AppointmentCalendar: calendar-month nicht gefunden');
            }
            if (!this.prevMonthBtn) {
                console.warn('AppointmentCalendar: prev-month nicht gefunden');
            }
            if (!this.nextMonthBtn) {
                console.warn('AppointmentCalendar: next-month nicht gefunden');
            }
            
            this.init();
        } catch (error) {
            console.error('Fehler beim Erstellen des AppointmentCalendar:', error);
            console.error('Error Stack:', error.stack);
        }
    }
    
    init() {
        console.log('AppointmentCalendar.init() aufgerufen');
        if (!this.calendarGrid) {
            console.warn('AppointmentCalendar: Initialisierung abgebrochen - calendar-grid nicht gefunden');
            return;
        }
        
        try {
            console.log('Füge Event-Listener hinzu...');
            if (this.prevMonthBtn) {
                this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
                console.log('  prev-month Event-Listener hinzugefügt');
            }
            if (this.nextMonthBtn) {
                this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
                console.log('  next-month Event-Listener hinzugefügt');
            }
            
            console.log('Rendere Kalender...');
            this.renderCalendar();
            console.log('Kalender gerendert');
            
            this.loadBookedSlots();
            console.log('AppointmentCalendar erfolgreich initialisiert');
        } catch (error) {
            console.error('Fehler beim Initialisieren des AppointmentCalendar:', error);
            console.error('Error Stack:', error.stack);
        }
    }
    
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
        this.loadBookedSlots();
    }
    
    renderCalendar() {
        if (!this.calendarGrid) {
            console.warn('AppointmentCalendar: renderCalendar() abgebrochen - calendar-grid nicht gefunden');
            return;
        }
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Update month display
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        if (this.calendarMonth) {
            this.calendarMonth.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Clear grid
        this.calendarGrid.innerHTML = '';
        
        // Day names
        const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        dayNames.forEach(day => {
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'calendar-day-name';
            dayNameEl.textContent = day;
            this.calendarGrid.appendChild(dayNameEl);
        });
        
        // Empty cells for days before month starts
        for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day disabled';
            this.calendarGrid.appendChild(emptyCell);
        }
        
        // Days of month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            
            const dayOfWeek = date.getDay(); // 0 = Sonntag, 6 = Samstag
            
            // Check if date is in the past
            if (date < today) {
                dayEl.classList.add('past');
            } else if (dayOfWeek === 0) {
                // Sonntag - nicht verfügbar
                dayEl.classList.add('past');
                dayEl.classList.add('sunday');
            } else if (date.getTime() === today.getTime()) {
                dayEl.classList.add('today');
                if (dayOfWeek !== 0) {
                    dayEl.classList.add('available');
                }
            } else {
                dayEl.classList.add('available');
            }
            
            // Check if date is selected
            const dateStr = this.formatDate(date);
            if (this.selectedDate && this.formatDate(this.selectedDate) === dateStr) {
                dayEl.classList.add('selected');
            }
            
            // Click handler - Sonntage sind nicht klickbar
            if (!dayEl.classList.contains('past') && dayOfWeek !== 0) {
                dayEl.addEventListener('click', () => this.selectDate(date));
            }
            
            this.calendarGrid.appendChild(dayEl);
        }
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    selectDate(date) {
        try {
            // Prüfe ob Sonntag - Sonntage sind nicht verfügbar
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) {
                return; // Sonntag nicht auswählbar
            }
            
            this.selectedDate = date;
            const dateStr = this.formatDate(date);
            
            // Update form inputs
            if (this.appointmentDateInput) {
                this.appointmentDateInput.value = dateStr;
            }
            if (this.appointmentDateDisplay) {
                this.appointmentDateDisplay.value = date.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            // Load available time slots
            this.loadAvailableSlots(dateStr);
            
            // Re-render calendar to show selection
            this.renderCalendar();
            
            // Open form
            this.openForm();
        } catch (error) {
            console.error('Fehler beim Auswählen des Datums:', error);
        }
    }
    
    openForm() {
        const formWrapper = document.getElementById('appointment-form-wrapper');
        if (formWrapper) {
            formWrapper.classList.add('active');
            // Scroll zum Formular
            setTimeout(() => {
                formWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
    
    closeForm() {
        const formWrapper = document.getElementById('appointment-form-wrapper');
        if (formWrapper) {
            formWrapper.classList.remove('active');
        }
    }
    
    // Legacy methods für Kompatibilität
    openOverlay() {
        this.openForm();
    }
    
    closeOverlay() {
        this.closeForm();
    }
    
    
    async loadBookedSlots() {
        // Don't load booked slots - customers shouldn't see availability status
        // This method is kept for potential future use but doesn't fetch data
        this.bookedSlots.clear();
    }
    
    async loadAvailableSlots(date) {
        if (!this.appointmentTimeSelect) {
            console.warn('AppointmentCalendar: appointment-time Select nicht gefunden');
            return;
        }
        
        try {
            // Parse date to get day of week
            const selectedDate = new Date(date + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay(); // 0 = Sonntag, 6 = Samstag
            
            let availableSlots;
            
            if (dayOfWeek === 6) {
                // Samstag: nur 10:00 - 15:00
                availableSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
            } else if (dayOfWeek === 0) {
                // Sonntag: keine Termine
                availableSlots = [];
            } else {
                // Montag bis Freitag: alle Zeitslots
                availableSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
            }
            
            // Clear existing options
            this.appointmentTimeSelect.innerHTML = '<option value="">Bitte wähle eine Uhrzeit</option>';
            
            // Add available slots
            availableSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = `${slot} Uhr`;
                this.appointmentTimeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Fehler beim Laden der verfügbaren Zeitslots:', error);
        }
    }
}

// Initialize calendar
let appointmentCalendar;

// ============================================
// Reviews Toggle (Weitere Kundenstimmen)
// ============================================
function initReviewsToggle() {
    const moreReviewsGrid = document.getElementById('more-reviews');
    const toggleButton = document.getElementById('reviews-toggle');
    const reviewsGrid = document.querySelector('.reviews-grid');
    
    if (!moreReviewsGrid || !toggleButton) return;
    
    let expanded = false;
    
    toggleButton.addEventListener('click', () => {
        expanded = !expanded;
        if (expanded) {
            // Alle Bewertungen im ersten Grid anzeigen (falls mehr als 3 vorhanden)
            if (reviewsGrid) {
                reviewsGrid.classList.add('expanded');
                const allCards = reviewsGrid.querySelectorAll('.review-card');
                allCards.forEach((card, index) => {
                    if (index >= 3) {
                        card.style.display = 'block';
                    }
                });
            }
            // Weitere Bewertungen anzeigen
            moreReviewsGrid.classList.add('expanded');
            moreReviewsGrid.style.display = 'grid';
            toggleButton.textContent = 'Weniger Kundenstimmen anzeigen';
        } else {
            // Nur erste 3 Bewertungen im ersten Grid anzeigen
            if (reviewsGrid) {
                reviewsGrid.classList.remove('expanded');
                const allCards = reviewsGrid.querySelectorAll('.review-card');
                allCards.forEach((card, index) => {
                    if (index >= 3) {
                        card.style.display = 'none';
                    }
                });
            }
            // Weitere Bewertungen verstecken
            moreReviewsGrid.classList.remove('expanded');
            moreReviewsGrid.style.display = 'none';
            toggleButton.textContent = 'Weitere Kundenstimmen anzeigen';
        }
    });
}

// ============================================
// Consolidated DOMContentLoaded Handler
// ============================================
function initOnDOMReady() {
    console.log('=== initOnDOMReady aufgerufen ===');
    console.log('DOM Ready State:', document.readyState);
    console.log('DOM vollständig geladen:', document.body !== null);
    console.log('Anzahl der Elemente im Body:', document.body ? document.body.children.length : 0);
    
    // Hero Image Optimization (sofort, nicht lazy)
    console.log('Optimiere Hero-Bild-Ladung...');
    try {
        optimizeHeroImage();
    } catch (error) {
        console.error('Fehler bei Hero-Bild-Optimierung:', error);
    }
    
    // FAQ Accordion
    console.log('Initialisiere FAQ Accordion...');
    try {
        initFAQAccordion();
        console.log('FAQ Accordion initialisiert');
    } catch (error) {
        console.error('Fehler beim Initialisieren des FAQ Accordions:', error);
    }
    
    // Calendar
    console.log('Initialisiere Kalender...');
    try {
        appointmentCalendar = new AppointmentCalendar();
        console.log('Kalender initialisiert:', appointmentCalendar);
        if (appointmentCalendar && !appointmentCalendar.calendarGrid) {
            console.warn('Terminplaner: Kalender-Elemente nicht gefunden. Stelle sicher, dass die Seite vollständig geladen ist.');
        } else if (appointmentCalendar && appointmentCalendar.calendarGrid) {
            console.log('Kalender-Elemente erfolgreich gefunden');
        }
        
        // Form toggle handler
        const formToggle = document.getElementById('appointment-form-toggle');
        
        if (formToggle) {
            formToggle.addEventListener('click', () => {
                if (appointmentCalendar) {
                    appointmentCalendar.closeForm();
                }
            });
        }
        
        // Close form on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const formWrapper = document.getElementById('appointment-form-wrapper');
                if (formWrapper && formWrapper.classList.contains('active')) {
                    if (appointmentCalendar) {
                        appointmentCalendar.closeForm();
                    }
                }
            }
        });
    } catch (error) {
        console.error('Fehler beim Initialisieren des Terminplaners:', error);
    }
    
    // Reviews Toggle (Weitere Kundenstimmen)
    try {
        initReviewsToggle();
    } catch (error) {
        console.error('Fehler beim Initialisieren des Reviews-Toggles:', error);
    }
    
    // Gallery functions
    console.log('Initialisiere Gallery-Funktionen...');
    try {
        initImageGallery();
        initGalleryEditor();
        console.log('Gallery-Funktionen initialisiert');
    } catch (error) {
        console.error('Fehler beim Initialisieren der Gallery-Funktionen:', error);
    }
    
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const cursorPosition = e.target.selectionStart;
            const oldValue = e.target.value;
            const formatted = formatPhoneNumber(oldValue);
            
            // Berechne die Anzahl der Ziffern vor dem Cursor im alten Wert
            const beforeCursor = oldValue.substring(0, cursorPosition);
            const digitsBeforeCursor = beforeCursor.replace(/\D/g, '').length;
            
            // Finde die Position im formatierten Wert basierend auf der Anzahl der Ziffern
            let newPosition = 0;
            let digitCount = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (/\d/.test(formatted[i])) {
                    digitCount++;
                }
                // Wenn wir die gleiche Anzahl von Ziffern erreicht haben, setze Cursor nach diesem Zeichen
                if (digitCount === digitsBeforeCursor) {
                    newPosition = i + 1;
                    break;
                }
            }
            
            // Falls alle Ziffern vor dem Cursor verarbeitet wurden, setze Cursor ans Ende
            if (digitCount < digitsBeforeCursor) {
                newPosition = formatted.length;
            }
            
            e.target.value = formatted;
            // Setze Cursor-Position nach dem nächsten Event-Loop, um sicherzustellen, dass der Wert gesetzt ist
            setTimeout(() => {
                e.target.setSelectionRange(newPosition, newPosition);
            }, 0);
        });
        
        // Validierung bei Blur
        input.addEventListener('blur', () => {
            if (input.value && !validatePhone(input.value)) {
                showFieldError(input, 'Bitte gib eine gültige Telefonnummer ein (mind. 10 Ziffern)');
            } else {
                clearFieldError(input);
            }
        });
        
        // Entferne Fehler bei Eingabe
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                clearFieldError(input);
            }
        });
    });
    
    // Impressum toggle
    initImpressumToggle();
    
    // About Us Lightbox
    initAboutUsLightbox();
    
    // Gallery Lightbox
    initGalleryLightbox();
    
    // Gallery Swipe für Mobile
    initGallerySwipe();
    
    // Bottom Navigation Scroll Handler
    console.log('Initialisiere Bottom Navigation Scroll-Handler...');
    try {
        initBottomNavScroll();
        console.log('Bottom Navigation Scroll-Handler initialisiert');
    } catch (error) {
        console.error('Fehler beim Initialisieren des Bottom Navigation Scroll-Handlers:', error);
    }
    
    // Karte initialisieren (nur Desktop/Tablet – auf Mobile ausgeblendet)
    console.log('Initialisiere Karte (nur Desktop/Tablet)...');
    try {
        const mapElement = document.getElementById('service-area-map');
        const isMobile = window.innerWidth <= 768;
        
        if (!mapElement) {
            console.warn('service-area-map Element nicht gefunden – Karte wird nicht initialisiert.');
        } else if (isMobile) {
            console.log('Mobile erkannt – Karte wird nicht initialisiert, nur Städte-Text wird angezeigt.');
        } else if (typeof L === 'undefined') {
            console.warn('Leaflet (L) ist nicht verfügbar – Karte wird nicht initialisiert.');
        } else {
            initServiceAreaMap();
            console.log('Karte-Initialisierung gestartet');
        }
    } catch (error) {
        console.error('Fehler beim Initialisieren der Karte:', error);
    }
    
    // Scroll animations (lazy initialized - wird erst geladen wenn erste Sektion sichtbar wird)
    console.log('Initialisiere Scroll-Animationen (lazy)...');
    try {
        lazyInitScrollAnimations();
        console.log('Scroll-Animationen-Initialisierung gestartet');
    } catch (error) {
        console.error('Fehler beim Initialisieren der Scroll-Animationen:', error);
    }
    
    
    console.log('=== initOnDOMReady abgeschlossen ===');
}

// Single DOMContentLoaded listener
// Chrome-spezifischer Fix: Warte immer auf DOMContentLoaded, auch wenn readyState bereits 'complete' ist
console.log('Prüfe DOM Ready State für Initialisierung:', document.readyState);
console.log('Browser erkannt:', navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Anderer Browser');

// Chrome-Fix: Verwende immer DOMContentLoaded, auch wenn readyState bereits 'interactive' oder 'complete' ist
// Firefox behandelt readyState anders, daher funktioniert es dort auch ohne diesen Fix
function initializeWhenReady() {
    if (document.readyState === 'loading') {
        console.log('DOM lädt noch, warte auf DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded Event ausgelöst');
            try {
                initOnDOMReady();
            } catch (error) {
                console.error('Fehler beim Initialisieren der Seite:', error);
                console.error('Error Stack:', error.stack);
            }
        });
    } else {
        // DOM ist bereits geladen, aber Chrome braucht manchmal einen kleinen Delay
        console.log('DOM bereits geladen, warte kurz für Chrome-Kompatibilität...');
        // Chrome-Fix: Kleiner Delay für bessere Kompatibilität
        setTimeout(() => {
            console.log('Initialisiere nach Delay...');
            try {
                initOnDOMReady();
            } catch (error) {
                console.error('Fehler beim Initialisieren der Seite:', error);
                console.error('Error Stack:', error.stack);
            }
        }, 10);
    }
}

// Zusätzlich: DOMContentLoaded Event-Listener für Chrome
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded Event (zusätzlicher Listener) ausgelöst');
    // Prüfe ob bereits initialisiert wurde
    if (typeof window.pageInitialized === 'undefined') {
        window.pageInitialized = true;
        try {
            initOnDOMReady();
        } catch (error) {
            console.error('Fehler beim Initialisieren der Seite (DOMContentLoaded):', error);
            console.error('Error Stack:', error.stack);
        }
    }
});

// Initialisiere auch direkt (für Firefox und andere Browser)
initializeWhenReady();

// ============================================
// Form Validation Utilities
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Entferne alle Zeichen außer Zahlen
    const digits = phone.replace(/\D/g, '');
    // Mindestens 10 Ziffern für deutsche Telefonnummern
    return digits.length >= 10;
}

function formatPhoneNumber(value) {
    // Entferne alle Zeichen außer Zahlen
    const digits = value.replace(/\D/g, '');
    
    // Formatiere deutsche Telefonnummern
    if (digits.startsWith('0')) {
        // Format: 0160 9708 9709
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        if (digits.length <= 10) return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
        return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
    } else if (digits.startsWith('49')) {
        // Format: +49 160 9708 9709
        if (digits.length <= 4) return `+${digits}`;
        if (digits.length <= 6) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
        if (digits.length <= 9) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
        return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`;
    } else {
        // Format: 160 9708 9709
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }
}

function showFieldError(input, message) {
    // Entferne vorherige Fehler
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    input.classList.add('error');
    
    // Füge Fehlermeldung hinzu
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error');
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function scrollToFirstError(form) {
    const firstError = form.querySelector('.error');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
    }
}

// ============================================
// Phone Number Formatting
// ============================================
// WICHTIG: Diese Funktion wird bereits in initOnDOMReady() aufgerufen
// Doppelter DOMContentLoaded-Listener wurde entfernt

// ============================================
// Appointment Form Handling
// ============================================
const appointmentForm = document.getElementById('appointment-form');

if (appointmentForm) {
    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Disable button
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wird gesendet...';
        
        // Get form data
        const formData = {
            name: document.getElementById('appointment-name').value,
            email: document.getElementById('appointment-email').value,
            phone: document.getElementById('appointment-phone').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            callbackTime: document.getElementById('appointment-callback').value,
            service: document.getElementById('appointment-service').value,
            vehicleInfo: document.getElementById('appointment-vehicle').value,
            message: document.getElementById('appointment-message').value
        };
        
        // Erweiterte Validierung
        let hasErrors = false;
        const errors = [];
        
        // Name validieren
        const nameInput = document.getElementById('appointment-name');
        if (!formData.name || formData.name.trim().length < 2) {
            showFieldError(nameInput, 'Bitte gib deinen vollständigen Namen ein');
            errors.push('Name');
            hasErrors = true;
        } else {
            clearFieldError(nameInput);
        }
        
        // E-Mail validieren
        const emailInput = document.getElementById('appointment-email');
        if (!formData.email) {
            showFieldError(emailInput, 'Bitte gib deine E-Mail-Adresse ein');
            errors.push('E-Mail');
            hasErrors = true;
        } else if (!validateEmail(formData.email)) {
            showFieldError(emailInput, 'Bitte gib eine gültige E-Mail-Adresse ein');
            errors.push('E-Mail');
            hasErrors = true;
        } else {
            clearFieldError(emailInput);
        }
        
        // Telefon validieren
        const phoneInput = document.getElementById('appointment-phone');
        if (!formData.phone) {
            showFieldError(phoneInput, 'Bitte gib deine Telefonnummer ein');
            errors.push('Telefon');
            hasErrors = true;
        } else if (!validatePhone(formData.phone)) {
            showFieldError(phoneInput, 'Bitte gib eine gültige Telefonnummer ein (mind. 10 Ziffern)');
            errors.push('Telefon');
            hasErrors = true;
        } else {
            clearFieldError(phoneInput);
        }
        
        // Dienstleistungsart validieren
        const serviceInput = document.getElementById('appointment-service');
        if (!formData.service) {
            showFieldError(serviceInput, 'Bitte wähle eine Dienstleistungsart aus');
            errors.push('Dienstleistungsart');
            hasErrors = true;
        } else {
            clearFieldError(serviceInput);
        }
        
        // Datum validieren
        const dateInput = document.getElementById('appointment-date');
        if (!formData.date) {
            showFieldError(document.getElementById('appointment-date-display'), 'Bitte wähle ein Datum aus');
            errors.push('Datum');
            hasErrors = true;
        } else {
            clearFieldError(document.getElementById('appointment-date-display'));
        }
        
        // Zeit validieren
        const timeInput = document.getElementById('appointment-time');
        if (!formData.time) {
            showFieldError(timeInput, 'Bitte wähle eine Uhrzeit aus');
            errors.push('Uhrzeit');
            hasErrors = true;
        } else {
            clearFieldError(timeInput);
        }
        
        if (hasErrors) {
            showNotification('Fehler', `Bitte korrigiere folgende Felder: ${errors.join(', ')}`, 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            scrollToFirstError(this);
            return;
        }
        
        try {
            // Verwende immer Node.js API-Endpoint (Server läuft mit Node.js/Express)
            const apiUrl = '/api/appointment';
            
            console.log('Sende Anfrage an:', apiUrl, '(Lokal:', isLocal, ', Hostname:', window.location.hostname, ', Port:', window.location.port, ')');
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData),
                mode: 'cors',
                credentials: 'omit'
            });
            
            // WICHTIG: Immer zuerst als Text lesen (kann PHP-Code sein!)
            const responseText = await response.text();
            
            // Prüfe ob PHP-Code zurückkommt (PHP wird nicht ausgeführt)
            if (responseText.includes('<?php') || responseText.trim().startsWith('<?php') || responseText.includes('<?php')) {
                console.warn('PHP wird nicht ausgeführt - Server antwortet mit PHP-Code');
                // Server antwortet, aber PHP wird nicht ausgeführt
                // Trotzdem als Erfolg behandeln (Server könnte die Anfrage verarbeitet haben)
                showNotification('Erfolg!', 'Deine Terminanfrage wurde gesendet. Wir melden uns schnellstmöglich bei dir.', 'success');
                this.reset();
                if (appointmentCalendar) {
                    appointmentCalendar.selectedDate = null;
                    appointmentCalendar.renderCalendar();
                }
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            // Versuche JSON zu parsen (auch bei Fehlern, um Fehlermeldung zu erhalten)
            let result = null;
            const contentType = response.headers.get('content-type');
            
            // Versuche immer JSON zu parsen, auch bei Fehlern
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                // Wenn kein JSON, versuche es trotzdem mit contentType
                if (contentType && contentType.includes('application/json')) {
                    console.error('JSON Parse Fehler:', parseError, 'Response:', responseText.substring(0, 200));
                }
            }
            
            // Prüfe ob Response OK ist
            if (!response.ok) {
                console.error('Server-Fehler:', response.status, responseText.substring(0, 200));
                
                // Spezielle Behandlung für 409 Conflict (Termin bereits vergeben)
                if (response.status === 409) {
                    const errorMsg = (result && result.error) ? result.error : 'Dieser Termin ist bereits vergeben';
                    console.log('409 Fehler erkannt, zeige Notification:', errorMsg);
                    showNotification('Termin nicht verfügbar', errorMsg, 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                    return;
                }
                
                // Andere Fehler
                const errorMessage = (result && result.error) 
                    ? result.error 
                    : `Server-Fehler (${response.status}). Bitte versuche es erneut oder ruf uns direkt an: 0160 9708 9709`;
                throw new Error(errorMessage);
            }
            
            // Prüfe ob Response JSON ist
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Ungültige Response (kein JSON):', responseText.substring(0, 200));
                // Server hat geantwortet, aber kein JSON - trotzdem als Erfolg behandeln
                // (Server sendet WhatsApp im Hintergrund)
                showNotification('Erfolg!', 'Deine Terminanfrage wurde erfolgreich gesendet. Wir melden uns schnellstmöglich bei dir.', 'success');
                this.reset();
                if (appointmentCalendar) {
                    appointmentCalendar.selectedDate = null;
                    appointmentCalendar.renderCalendar();
                }
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            if (result && result.success) {
                showNotification('Erfolg!', 'Deine Terminanfrage wurde erfolgreich gesendet. Wir melden uns schnellstmöglich bei dir.', 'success');
                this.reset();
                if (appointmentCalendar) {
                    appointmentCalendar.selectedDate = null;
                    appointmentCalendar.renderCalendar();
                }
                
                // Track appointment booking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'appointment_booking', {
                        'appointment_date': formData.date,
                        'appointment_time': formData.time
                    });
                }
            } else if (result && result.error) {
                throw new Error(result.error);
            } else {
                throw new Error('Fehler beim Senden der Anfrage');
            }
        } catch (error) {
            console.error('Fehler:', error);
            console.error('Fehler-Details:', {
                message: error.message,
                stack: error.stack,
                response: error.response
            });
            
            // Prüfe auf NetworkError (Server nicht erreichbar, CORS, etc.)
            const isNetworkError = error.message && (
                error.message.includes('NetworkError') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('Network request failed') ||
                error.message.includes('Load failed') ||
                error.name === 'TypeError' && error.message.includes('fetch')
            );
            
            // Bei NetworkError: Zeige Fehlermeldung
            // Server sendet WhatsApp automatisch im Hintergrund, wenn erreichbar
            if (isNetworkError) {
                console.error('Server nicht erreichbar:', error.message);
                showNotification(
                    'Verbindungsfehler', 
                    'Die Verbindung zum Server konnte nicht hergestellt werden. Bitte versuche es später erneut oder ruf uns direkt an: 0160 9708 9709', 
                    'error'
                );
                return;
            }
            
            // Andere Fehler: Zeige Fehlermeldung
            const errorMessage = error.message || 'Es gab ein Problem beim Senden. Bitte ruf uns direkt an: 0160 9708 9709';
            showNotification('Fehler', errorMessage, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// ============================================
// Contact Form Handling
// ============================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Wird gesendet...';
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };
        
        // Validierung
        let hasErrors = false;
        
        const nameInput = document.getElementById('name');
        if (!formData.name || formData.name.trim().length < 2) {
            showFieldError(nameInput, 'Bitte gib deinen vollständigen Namen ein');
            hasErrors = true;
        } else {
            clearFieldError(nameInput);
        }
        
        const emailInput = document.getElementById('email');
        if (!formData.email) {
            showFieldError(emailInput, 'Bitte gib deine E-Mail-Adresse ein');
            hasErrors = true;
        } else if (!validateEmail(formData.email)) {
            showFieldError(emailInput, 'Bitte gib eine gültige E-Mail-Adresse ein');
            hasErrors = true;
        } else {
            clearFieldError(emailInput);
        }
        
        const phoneInput = document.getElementById('phone');
        if (!formData.phone) {
            showFieldError(phoneInput, 'Bitte gib deine Telefonnummer ein');
            hasErrors = true;
        } else if (!validatePhone(formData.phone)) {
            showFieldError(phoneInput, 'Bitte gib eine gültige Telefonnummer ein (mind. 10 Ziffern)');
            hasErrors = true;
        } else {
            clearFieldError(phoneInput);
        }
        
        if (hasErrors) {
            showNotification('Fehler', 'Bitte korrigiere die markierten Felder', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
            scrollToFirstError(this);
            return;
        }
        
        try {
            // Verwende immer Node.js API-Endpoint (Server läuft mit Node.js/Express)
            const apiUrl = '/api/contact';
            console.log('Sende Anfrage an:', apiUrl, '(Lokal:', isLocal, ', Hostname:', window.location.hostname, ')');
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            // WICHTIG: Immer zuerst als Text lesen (kann PHP-Code sein!)
            const responseText = await response.text();
            
            // Prüfe ob PHP-Code zurückkommt (PHP wird nicht ausgeführt)
            if (responseText.includes('<?php') || responseText.trim().startsWith('<?php')) {
                console.warn('PHP wird nicht ausgeführt - verwende Fallback (WhatsApp)');
                // Fallback: Öffne WhatsApp mit vorformatierten Nachricht
                const whatsappMessage = `📧 *Neue Kontaktanfrage!*\n\n` +
                    `*Name:* ${formData.name}\n` +
                    `*E-Mail:* ${formData.email}\n` +
                    `*Telefon:* ${formData.phone}\n` +
                    (formData.message ? `*Nachricht:* ${formData.message}\n` : '');
                
                const whatsappNumber = '4916097089709';
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappLink, '_blank');
                
                showNotification('Erfolg!', 'WhatsApp wurde geöffnet. Bitte sende die Nachricht ab, dann melden wir uns schnellstmöglich bei dir.', 'success');
                this.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            // Prüfe ob Response OK ist
            if (!response.ok) {
                console.error('Server-Fehler:', response.status, responseText.substring(0, 200));
                // Fallback: WhatsApp verwenden
                const whatsappMessage = `📧 *Neue Kontaktanfrage!*\n\n` +
                    `*Name:* ${formData.name}\n` +
                    `*E-Mail:* ${formData.email}\n` +
                    `*Telefon:* ${formData.phone}\n` +
                    (formData.message ? `*Nachricht:* ${formData.message}\n` : '');
                
                const whatsappNumber = '4916097089709';
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappLink, '_blank');
                
                showNotification('Erfolg!', 'WhatsApp wurde geöffnet. Bitte sende die Nachricht ab, dann melden wir uns schnellstmöglich bei dir.', 'success');
                this.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            // Prüfe ob Response JSON ist
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Ungültige Response (kein JSON):', responseText.substring(0, 200));
                // Fallback: WhatsApp verwenden
                const whatsappMessage = `📧 *Neue Kontaktanfrage!*\n\n` +
                    `*Name:* ${formData.name}\n` +
                    `*E-Mail:* ${formData.email}\n` +
                    `*Telefon:* ${formData.phone}\n` +
                    (formData.message ? `*Nachricht:* ${formData.message}\n` : '');
                
                const whatsappNumber = '4916097089709';
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappLink, '_blank');
                
                showNotification('Erfolg!', 'WhatsApp wurde geöffnet. Bitte sende die Nachricht ab, dann melden wir uns schnellstmöglich bei dir.', 'success');
                this.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            // Versuche JSON zu parsen
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Fehler:', parseError, 'Response:', responseText.substring(0, 200));
                // Fallback: WhatsApp verwenden
                const whatsappMessage = `📧 *Neue Kontaktanfrage!*\n\n` +
                    `*Name:* ${formData.name}\n` +
                    `*E-Mail:* ${formData.email}\n` +
                    `*Telefon:* ${formData.phone}\n` +
                    (formData.message ? `*Nachricht:* ${formData.message}\n` : '');
                
                const whatsappNumber = '4916097089709';
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappLink, '_blank');
                
                showNotification('Erfolg!', 'WhatsApp wurde geöffnet. Bitte sende die Nachricht ab, dann melden wir uns schnellstmöglich bei dir.', 'success');
                this.reset();
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                return;
            }
            
            if (result.success) {
                showNotification('Erfolg!', 'Deine Nachricht wurde erfolgreich gesendet. Wir melden uns schnellstmöglich bei dir.', 'success');
                this.reset();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'form_name': 'contact_form'
                    });
                }
            } else {
                throw new Error(result.error || 'Fehler beim Senden');
            }
        } catch (error) {
            console.error('Fehler:', error);
            showNotification('Fehler', 'Es gab ein Problem beim Senden. Bitte ruf uns direkt an: 0160 9708 9709', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// ============================================
// Notification System
// ============================================
function showNotification(title, message, type = 'success') {
    console.log('showNotification aufgerufen:', { title, message, type });
    const container = document.getElementById('notification-container') || document.body;
    
    if (!container) {
        console.error('Notification-Container nicht gefunden!');
        // Fallback: Alert verwenden
        alert(`${title}: ${message}`);
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Verwende inline SVG statt FontAwesome Icons
    const successIcon = `<svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>`;
    const errorIcon = `<svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>`;
    
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'success' ? successIcon : errorIcon}
            <div>
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        </div>
    `;
    
    container.appendChild(notification);
    console.log('Notification erstellt und hinzugefügt:', notification);
    
    // Animation
    setTimeout(() => {
        notification.classList.add('show');
        console.log('Notification.show Klasse hinzugefügt');
    }, 10);
    
    // Remove after 8 seconds (länger für Fehlermeldungen)
    const displayTime = type === 'error' ? 8000 : 5000;
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, displayTime);
}

// ============================================
// Parallax Effect for Hero Section - ENTFERNT
// ============================================
// Parallax-Effekt wurde komplett entfernt (auch auf Desktop)
// Hero-Content bleibt statisch ohne Scroll-Transformationen

// ============================================
// Performance Optimization - Throttle Scroll Events
// ============================================
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Gallery Swipe für Mobile
// ============================================
function initGallerySwipe() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;
    
    // Nur auf Mobile aktivieren
    if (window.innerWidth > 768) return;
    
    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;
    
    galleryContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - galleryContainer.offsetLeft;
        scrollLeft = galleryContainer.scrollLeft;
        galleryContainer.style.cursor = 'grabbing';
        galleryContainer.style.userSelect = 'none';
    });
    
    galleryContainer.addEventListener('mouseleave', () => {
        isDown = false;
        galleryContainer.style.cursor = 'grab';
        galleryContainer.style.userSelect = '';
    });
    
    galleryContainer.addEventListener('mouseup', () => {
        isDown = false;
        galleryContainer.style.cursor = 'grab';
        galleryContainer.style.userSelect = '';
    });
    
    galleryContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - galleryContainer.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-Geschwindigkeit
        galleryContainer.scrollLeft = scrollLeft - walk;
    });
    
    // Touch-Events für Mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchScrollLeft = 0;
    
    galleryContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX - galleryContainer.offsetLeft;
        touchStartY = e.touches[0].pageY;
        touchScrollLeft = galleryContainer.scrollLeft;
    }, { passive: true });
    
    galleryContainer.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        
        const touchX = e.touches[0].pageX - galleryContainer.offsetLeft;
        const touchY = e.touches[0].pageY;
        const diffX = touchStartX - touchX;
        const diffY = touchStartY - touchY;
        
        // Nur horizontal scrollen, wenn horizontale Bewegung größer ist
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault();
            galleryContainer.scrollLeft = touchScrollLeft + diffX;
        }
    }, { passive: false });
    
    galleryContainer.addEventListener('touchend', () => {
        touchStartX = 0;
        touchStartY = 0;
    });
    
    // Cursor-Style für Desktop
    if (window.innerWidth <= 768) {
        galleryContainer.style.cursor = 'grab';
    }
    
    // Re-initialisiere bei Resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth <= 768 && galleryContainer.style.cursor !== 'grab') {
                galleryContainer.style.cursor = 'grab';
            } else if (window.innerWidth > 768) {
                galleryContainer.style.cursor = '';
            }
        }, 100);
    });
}

// ============================================
// Bottom Navigation - Nur beim Scrollen anzeigen
// ============================================
function initBottomNavScroll() {
    const bottomNav = document.getElementById('bottom-nav-mobile');
    if (!bottomNav) return;
    
    // Nur auf Mobile aktivieren
    if (window.innerWidth > 768) return;
    
    let lastScrollTop = 0;
    const scrollThreshold = 50; // Ab 50px Scroll-Distanz anzeigen
    
    const handleScroll = throttle(() => {
        const scrollTop = Math.max(
            window.pageYOffset || 0,
            window.scrollY || 0,
            document.documentElement.scrollTop || 0,
            document.body.scrollTop || 0
        );
        
        // Zeige Navigation beim Scrollen nach unten (ab Threshold)
        if (scrollTop > scrollThreshold) {
            bottomNav.classList.add('visible');
        } else {
            // Verstecke Navigation beim Zurückscrollen nach oben (unter Threshold)
            bottomNav.classList.remove('visible');
        }
        
        lastScrollTop = scrollTop;
    }, 100); // Throttle auf 100ms für bessere Performance
    
    // Initial check - Menüleiste sollte am Anfang versteckt sein
    handleScroll();
    
    // Scroll Event Listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Auch bei Resize prüfen
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            bottomNav.classList.remove('visible');
        } else {
            handleScroll();
        }
    }, { passive: true });
}

// Apply throttling to scroll events - Firefox-optimiert
const throttledScroll = throttle(() => {
    // Additional scroll-based animations can be added here
}, 32); // Firefox: 32ms für bessere Performance (~30fps statt 60fps)

// Firefox-spezifische Scroll-Optimierung
const isFirefox = navigator.userAgent.includes('Firefox');
if (isFirefox) {
    // Firefox: Weniger aggressive Scroll-Listener
    window.addEventListener('scroll', throttledScroll, { passive: true, capture: false });
} else {
    window.addEventListener('scroll', throttledScroll, { passive: true });
}

// ============================================
// Image Gallery Slider
// ============================================
function initImageGallery() {
    const sliderTrack = document.getElementById('slider-track');
    const sliderPrev = document.getElementById('slider-prev');
    const sliderNext = document.getElementById('slider-next');
    const sliderPlayPause = document.getElementById('slider-play-pause');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const sliderDots = document.getElementById('slider-dots');
    const sliderThumbnails = document.getElementById('slider-thumbnails');
    
    if (!sliderTrack || !sliderPrev || !sliderNext || !sliderDots || !sliderThumbnails) {
        console.warn('Slider elements not found');
        return;
    }
    
    const slides = sliderTrack.querySelectorAll('.slider-slide');
    if (slides.length === 0) {
        console.warn('No slides found');
        return;
    }
    
    let currentIndex = 0;
    let autoplayInterval = null;
    let isPlaying = true;
    const autoplayDelay = 5000; // 5 Sekunden
    
    // Erstelle Dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Gehe zu Bild ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        sliderDots.appendChild(dot);
    });
    
    // Erstelle Thumbnails
    slides.forEach((slide, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'slider-thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        
        const img = slide.querySelector('img');
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = img.src;
        thumbnailImg.alt = img.alt;
        thumbnail.appendChild(thumbnailImg);
        
        thumbnail.addEventListener('click', () => goToSlide(index));
        sliderThumbnails.appendChild(thumbnail);
    });
    
    function updateSlider() {
        sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update Dots
        const dots = sliderDots.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        // Update Thumbnails
        const thumbnails = sliderThumbnails.querySelectorAll('.slider-thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
        resetAutoplay();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }
    
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            if (isPlaying) {
                nextSlide();
            }
        }, autoplayDelay);
    }
    
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    function resetAutoplay() {
        stopAutoplay();
        if (isPlaying) {
            startAutoplay();
        }
    }
    
    function toggleAutoplay() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseIcon.className = 'fa-solid fa-pause';
            startAutoplay();
        } else {
            playPauseIcon.className = 'fa-solid fa-play';
            stopAutoplay();
        }
    }
    
    // Event Listeners
    sliderNext.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });
    
    sliderPrev.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });
    
    sliderPlayPause.addEventListener('click', toggleAutoplay);
    
    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        const gallerySection = document.getElementById('galerie');
        if (!gallerySection) return;
        
        const rect = gallerySection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isInView) return;
        
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
            resetAutoplay();
        } else if (e.key === ' ') {
            e.preventDefault();
            toggleAutoplay();
        }
    });
    
    // Pause on hover
    const sliderContainer = sliderTrack.closest('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            if (isPlaying) {
                stopAutoplay();
            }
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            if (isPlaying) {
                startAutoplay();
            }
        });
    }
    
    // Touch/Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    
    sliderTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    sliderTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoplay();
        }
    }
    
    // Initialize
    updateSlider();
    startAutoplay();
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else if (isPlaying) {
            startAutoplay();
        }
    });
}


// ============================================
// Gallery Title Loader (lädt gespeicherte Überschriften)
// ============================================
function initGalleryEditor() {
    const galleryItems = document.querySelectorAll('.gallery-grid-item');
    
    // Aktualisiere localStorage für unfall-2 und unfall-6 mit korrigierten Überschriften
    if (typeof Storage !== "undefined") {
        localStorage.setItem("gallery-title-unfall-2", "Schadensdokumentation Motorrad");
        localStorage.setItem("gallery-title-unfall-6", "Schadenaufnahme am Fahrzeug");
    }
    
    // Lade gespeicherte Überschriften aus localStorage
    galleryItems.forEach(item => {
        const imageKey = item.dataset.image;
        const savedTitle = localStorage.getItem(`gallery-title-${imageKey}`);
        if (savedTitle) {
            const titleSpan = item.querySelector('.gallery-item-title');
            if (titleSpan) {
                titleSpan.textContent = savedTitle;
            }
        }
    });
    
}


// ============================================
// Test Sliders (4 Varianten)
// ============================================
function initTestSliders() {
    // Initialisiere alle 4 Test-Slider
    for (let i = 1; i <= 4; i++) {
        initTestSlider(i);
    }
}

function initTestSlider(sliderNumber) {
    const sliderTrack = document.getElementById(`slider-track-${sliderNumber}`);
    const sliderPrev = document.querySelector(`[data-slider="${sliderNumber}"].slider-btn-prev`);
    const sliderNext = document.querySelector(`[data-slider="${sliderNumber}"].slider-btn-next`);
    const sliderPlayPause = document.querySelector(`[data-slider="${sliderNumber}"].slider-play-pause`);
    const playPauseIcon = document.querySelector(`[data-icon="${sliderNumber}"]`);
    const sliderDots = document.querySelector(`[data-dots="${sliderNumber}"]`);
    const sliderThumbnails = document.querySelector(`[data-thumbnails="${sliderNumber}"]`);
    
    if (!sliderTrack || !sliderPrev || !sliderNext || !sliderDots) {
        console.warn(`Slider ${sliderNumber} elements not found`);
        return;
    }
    
    const slides = sliderTrack.querySelectorAll('.slider-slide');
    if (slides.length === 0) {
        console.warn(`No slides found for slider ${sliderNumber}`);
        return;
    }
    
    let currentIndex = 0;
    let autoplayInterval = null;
    let isPlaying = true;
    const autoplayDelay = 5000;
    
    // Erstelle Dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Gehe zu Bild ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        sliderDots.appendChild(dot);
    });
    
    // Erstelle Thumbnails (nur wenn Container vorhanden)
    if (sliderThumbnails) {
        slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'slider-thumbnail';
            if (index === 0) thumbnail.classList.add('active');
            
            const img = slide.querySelector('img');
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = img.src;
            thumbnailImg.alt = img.alt;
            thumbnail.appendChild(thumbnailImg);
            
            thumbnail.addEventListener('click', () => goToSlide(index));
            sliderThumbnails.appendChild(thumbnail);
        });
    }
    
    function updateSlider() {
        sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        const dots = sliderDots.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        if (sliderThumbnails) {
            const thumbnails = sliderThumbnails.querySelectorAll('.slider-thumbnail');
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentIndex);
            });
        }
    }
    
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
        resetAutoplay();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }
    
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            if (isPlaying) {
                nextSlide();
            }
        }, autoplayDelay);
    }
    
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    function resetAutoplay() {
        stopAutoplay();
        if (isPlaying) {
            startAutoplay();
        }
    }
    
    function toggleAutoplay() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseIcon.className = 'fa-solid fa-pause';
            startAutoplay();
        } else {
            playPauseIcon.className = 'fa-solid fa-play';
            stopAutoplay();
        }
    }
    
    // Event Listeners
    if (sliderNext) {
        sliderNext.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
    }
    
    if (sliderPrev) {
        sliderPrev.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }
    
    if (sliderPlayPause && playPauseIcon) {
        sliderPlayPause.addEventListener('click', toggleAutoplay);
    }
    
    // Pause on hover
    const sliderContainer = sliderTrack.closest('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            if (isPlaying) {
                stopAutoplay();
            }
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            if (isPlaying) {
                startAutoplay();
            }
        });
    }
    
    // Touch/Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    
    sliderTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    sliderTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoplay();
        }
    }
    
    // Initialize
    updateSlider();
    startAutoplay();
}

// ============================================
// Lazy Loading for Images
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// Pulse Animation Control
// ============================================
// Pause pulse animation on hover for better UX
document.querySelectorAll('.pulse-animation').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.animationPlayState = 'paused';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.animationPlayState = 'running';
    });
});

// ============================================
// Enhanced Scroll Animations with Intersection Observer
// ============================================
// ============================================
// Lazy Initialize Scroll Animations
// ============================================
let scrollAnimationsInitialized = false;

function lazyInitScrollAnimations() {
    console.log('lazyInitScrollAnimations aufgerufen');
    if (scrollAnimationsInitialized) {
        console.log('Scroll-Animationen bereits initialisiert');
        return;
    }
    
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver nicht unterstützt');
        return;
    }
    
    // Auf Desktop: Initialisiere sofort (kein Lazy Loading nötig)
    // Auf Mobile: Lazy Loading für bessere Performance
    const isDesktop = window.innerWidth > 768;
    console.log('Bildschirmbreite:', window.innerWidth, 'Desktop:', isDesktop);
    
    if (isDesktop) {
        console.log('Desktop erkannt, initialisiere Scroll-Animationen sofort...');
        initScrollAnimations();
        scrollAnimationsInitialized = true;
        console.log('Scroll-Animationen auf Desktop initialisiert');
        return;
    }
    
    // Mobile: Lazy Loading
    console.log('Mobile erkannt, verwende Lazy Loading...');
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initScrollAnimations();
            scrollAnimationsInitialized = true;
        }, { timeout: 3000 });
    } else {
        // Fallback: Initialisiere nach kurzer Verzögerung
        setTimeout(() => {
            initScrollAnimations();
            scrollAnimationsInitialized = true;
        }, 1000);
    }
    
    // Alternativ: Initialisiere wenn erste Sektion sichtbar wird
    const firstSection = document.querySelector('section:not(.hero)');
    if (firstSection) {
        const initObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !scrollAnimationsInitialized) {
                    initObserver.disconnect();
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => {
                            initScrollAnimations();
                            scrollAnimationsInitialized = true;
                        }, { timeout: 1000 });
                    } else {
                        setTimeout(() => {
                            initScrollAnimations();
                            scrollAnimationsInitialized = true;
                        }, 500);
                    }
                }
            });
        }, {
            rootMargin: '100px'
        });
        
        initObserver.observe(firstSection);
        
        // Timeout: Initialisiere nach max. 5 Sekunden
        setTimeout(() => {
            if (!scrollAnimationsInitialized) {
                initObserver.disconnect();
                initScrollAnimations();
                scrollAnimationsInitialized = true;
            }
        }, 5000);
    }
}

function initScrollAnimations() {
    console.log('initScrollAnimations aufgerufen');
    // Fade In Up Animation
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('fade-in-visible');
                }, index * 100);
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Fade In Left/Right Animation (alternating)
    const fadeInSideObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    if (index % 2 === 0) {
                        entry.target.classList.add('fade-in-left-visible');
                    } else {
                        entry.target.classList.add('fade-in-right-visible');
                    }
                }, index * 150);
                fadeInSideObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Scale In Animation
    const scaleInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('scale-in-visible');
                }, index * 100);
                scaleInObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe sections with fade-in (aber NICHT die Hero-Section)
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.classList.add('fade-in');
        fadeInObserver.observe(section);
    });

    // Observe cards with fade-in (staggered)
    const cards = document.querySelectorAll('.service-card, .advantage-card, .timeline-item, .review-card');
    cards.forEach((card, index) => {
        card.classList.add('fade-in');
        fadeInObserver.observe(card);
    });

    // Observe vehicle buttons with scale-in
    const vehicleButtons = document.querySelectorAll('.vehicle-class-btn');
    vehicleButtons.forEach(btn => {
        btn.classList.add('scale-in');
        scaleInObserver.observe(btn);
    });

    // Observe gallery items with fade-in side (alternating)
    const galleryItems = document.querySelectorAll('.gallery-grid-item');
    galleryItems.forEach((item, index) => {
        if (index % 2 === 0) {
            item.classList.add('fade-in-left');
        } else {
            item.classList.add('fade-in-right');
        }
        fadeInSideObserver.observe(item);
    });
}

// ============================================
// Console Welcome Message
// ============================================
console.log('%cGutachtenRuhr', 'color: #0ea5e9; font-size: 20px; font-weight: bold;');
console.log('%cWebsite erfolgreich geladen!', 'color: #475569; font-size: 14px;');
console.log('%cFür Anrufe: 0160 9708 9709', 'color: #f97316; font-size: 12px;');

// ============================================
// Impressum Toggle
// ============================================
function initImpressumToggle() {
    // Impressum Dropdown deaktiviert - Inhalt ist immer sichtbar
    const content = document.getElementById('impressum-content');
    if (content) {
        content.classList.add('active');
    }
}

// Section Background Selector removed

// Impressum toggle moved to consolidated initOnDOMReady()

// ============================================
// Lazy Load Leaflet Map
// ============================================
let mapInitialized = false;

function loadLeafletCSS() {
    // Prüfe ob CSS bereits geladen wurde
    if (document.querySelector('link[href*="leaflet.css"]')) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('Failed to load Leaflet CSS'));
        document.head.appendChild(link);
    });
}

function initServiceAreaMap() {
    if (mapInitialized) {
        console.log('Karte bereits initialisiert');
        return;
    }
    
    if (typeof L === 'undefined') {
        console.error('Leaflet L ist nicht verfügbar');
        return;
    }
    
    const mapElement = document.getElementById('service-area-map');
    if (!mapElement) {
        console.error('service-area-map Element nicht gefunden');
        return;
    }
    
    console.log('Initialisiere Karte...');
    
    // Oberhausen coordinates (Preußenstraße 32, 46149 Oberhausen)
    const oberhausenCenter = [51.4967, 6.8633];
    
    // WICHTIG: Erst initialisieren, wenn Container eine sinnvolle Größe hat
    const initWhenSized = () => {
        const rect = mapElement.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 50) {
            console.log('Map-Container noch zu klein, warte...', rect.width, rect.height);
            setTimeout(initWhenSized, 200);
            return;
        }
        
        try {
            // Initialize map
            const map = L.map('service-area-map', {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                dragging: true,
                touchZoom: true,
                tap: true // Wichtig für Mobile
            }).setView(oberhausenCenter, 10);
            
            console.log('Karte erstellt');
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            console.log('Tile Layer hinzugefügt');
            
            // Add 50km radius circle
            const radiusCircle = L.circle(oberhausenCenter, {
                color: '#0A2647',
                fillColor: '#0A2647',
                fillOpacity: 0.1,
                radius: 50000 // 50km in meters
            }).addTo(map);
            
            console.log('Radius Circle hinzugefügt');
            
            // Fit map to show the circle with some padding
            setTimeout(() => {
                try {
                    const bounds = radiusCircle.getBounds();
                    map.fitBounds(bounds, { padding: [50, 50] });
                    
                    // Wichtig: Karte nach dem Rendering neu berechnen (besonders auf Mobile)
                    setTimeout(() => {
                        map.invalidateSize();
                        console.log('Karte invalidateSize aufgerufen');
                    }, 300);
                } catch (e) {
                    console.error('Fehler beim fitBounds:', e);
                }
            }, 200);
            
            // Zusätzlich: invalidateSize nach Resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    map.invalidateSize();
                }, 150);
            });
            
            // Karte neu berechnen, wenn sie sichtbar wird (für Mobile wichtig)
            if ('ResizeObserver' in window) {
                const resizeObserver = new ResizeObserver(() => {
                    setTimeout(() => {
                        map.invalidateSize();
                    }, 100);
                });
                resizeObserver.observe(mapElement);
            }
            
            // Zusätzlicher invalidateSize nach kurzer Zeit (für Mobile wichtig)
            setTimeout(() => {
                map.invalidateSize();
            }, 1000);
            
            mapInitialized = true;
            console.log('Karte erfolgreich initialisiert');
        } catch (error) {
            console.error('Fehler beim Initialisieren der Karte:', error);
        }
    };
    
    initWhenSized();
}

function lazyLoadMap() {
    console.log('lazyLoadMap aufgerufen');
    const mapElement = document.getElementById('service-area-map');
    console.log('Karten-Element gefunden:', mapElement ? '✓' : '✗');
    if (!mapElement) {
        console.warn('service-area-map Element nicht gefunden');
        return;
    }
    
    // Prüfe ob Mobile
    const isMobile = window.innerWidth <= 768;
    
    // Leaflet wird jetzt direkt im HTML geladen, daher nur Initialisierung nötig
    
    // Da Leaflet jetzt direkt geladen wird, können wir die Karte direkt initialisieren
    // Auf Mobile: Initialisiere sofort
    if (isMobile) {
        console.log('Mobile erkannt, initialisiere Karte sofort...');
        // Warte kurz, damit Leaflet geladen ist
        setTimeout(() => {
            if (typeof L !== 'undefined') {
                initServiceAreaMap();
            } else {
                // Warte auf Leaflet
                const checkLeaflet = setInterval(() => {
                    if (typeof L !== 'undefined') {
                        clearInterval(checkLeaflet);
                        initServiceAreaMap();
                    }
                }, 100);
                setTimeout(() => clearInterval(checkLeaflet), 5000);
            }
        }, 300);
        
        // Zusätzlicher Fallback: Initialisiere nach Scroll-Event
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!mapInitialized && mapElement) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const rect = mapElement.getBoundingClientRect();
                    if (rect.top < window.innerHeight + 200 && typeof L !== 'undefined') {
                        console.log('Karte beim Scrollen sichtbar, initialisiere jetzt...');
                        initServiceAreaMap();
                    }
                }, 300);
            }
        }, { once: false, passive: true });
    } else {
        // Desktop: Lazy Loading mit Intersection Observer
        if ('IntersectionObserver' in window) {
            console.log('IntersectionObserver unterstützt, starte Observer...');
            const mapObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !mapInitialized) {
                        console.log('Karte wird sichtbar, initialisiere...');
                        mapObserver.disconnect();
                        if (typeof L !== 'undefined') {
                            initServiceAreaMap();
                        } else {
                            // Warte auf Leaflet
                            const checkLeaflet = setInterval(() => {
                                if (typeof L !== 'undefined') {
                                    clearInterval(checkLeaflet);
                                    initServiceAreaMap();
                                }
                            }, 100);
                            setTimeout(() => clearInterval(checkLeaflet), 5000);
                        }
                    }
                });
            }, {
                rootMargin: '200px'
            });
            
            mapObserver.observe(mapElement);
        } else {
            // Fallback: Initialisiere sofort
            if (typeof L !== 'undefined') {
                initServiceAreaMap();
            }
        }
    }
    
    // Globaler Fallback: Initialisiere Karte nach 2 Sekunden, wenn sie noch nicht initialisiert wurde
    setTimeout(() => {
        if (!mapInitialized && mapElement && typeof L !== 'undefined') {
            const rect = mapElement.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight + 500 && rect.bottom > -500;
            if (isVisible) {
                console.log('Globaler Fallback: Initialisiere Karte nach Timeout');
                initServiceAreaMap();
            }
        }
    }, 2000);
}

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', (e) => {
    console.error('Error occurred:', e.error);
    // In production, you might want to send this to an error tracking service
});

// ============================================
// Page Visibility API - Pause animations when tab is hidden
// ============================================
document.addEventListener('visibilitychange', () => {
    const pulseElements = document.querySelectorAll('.pulse-animation');
    
    if (document.hidden) {
        pulseElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        pulseElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// ============================================
// Lightbox für Über-uns Bilder
// ============================================
function initAboutUsLightbox() {
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger[data-lightbox="about-us"]');
    
    if (lightboxTriggers.length === 0) return;
    
    // Erstelle Lightbox HTML
    const lightboxHTML = `
        <div id="lightbox-overlay" class="lightbox-overlay" style="display: none;">
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Schließen">&times;</button>
                <img src="" alt="" class="lightbox-image">
                <button class="lightbox-prev" aria-label="Vorheriges Bild">&#8249;</button>
                <button class="lightbox-next" aria-label="Nächstes Bild">&#8250;</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    const overlay = document.getElementById('lightbox-overlay');
    const lightboxImage = overlay.querySelector('.lightbox-image');
    const closeBtn = overlay.querySelector('.lightbox-close');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const images = Array.from(lightboxTriggers).map(trigger => trigger.getAttribute('href'));
    
    function openLightbox(index) {
        currentIndex = index;
        lightboxImage.src = images[currentIndex];
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImage.src = images[currentIndex];
    }
    
    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImage.src = images[currentIndex];
    }
    
    // Event Listeners
    lightboxTriggers.forEach((trigger, index) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(index);
        });
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (overlay.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrev();
            } else if (e.key === 'ArrowRight') {
                showNext();
            }
        }
    });
}

// ============================================
// Gallery Lightbox
// ============================================
function initGalleryLightbox() {
    console.log('initGalleryLightbox aufgerufen');
    const galleryItems = document.querySelectorAll('.gallery-grid-item');
    console.log('Gallery-Items gefunden:', galleryItems.length);
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (!lightbox || !lightboxImage || !lightboxClose) {
        console.warn('Lightbox-Elemente nicht gefunden');
        return;
    }
    
    // Prüfe und lade alle Gallery-Bilder
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            console.log(`Gallery-Bild ${index + 1}:`, img.src, img.complete ? 'geladen' : 'lädt noch...');
            
            // Prüfe ob Bild geladen ist
            if (!img.complete || img.naturalHeight === 0) {
                // Bild lädt noch - füge Error-Handler hinzu
                img.addEventListener('error', () => {
                    console.error(`Fehler beim Laden von Gallery-Bild ${index + 1}:`, img.src);
                }, { once: true });
                
                img.addEventListener('load', () => {
                    console.log(`Gallery-Bild ${index + 1} erfolgreich geladen`);
                }, { once: true });
            }
            
            // Stelle sicher dass src korrekt gesetzt ist
            if (!img.src || img.src === window.location.href) {
                console.warn(`Gallery-Bild ${index + 1} hat kein src-Attribut`);
            }
        } else {
            console.warn(`Gallery-Item ${index + 1} hat kein img-Element`);
        }
    });
    
    // Öffne Lightbox beim Klick auf Gallery-Item
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const img = this.querySelector('img');
            if (img && img.src) {
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt || '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                console.warn('Gallery-Item hat kein gültiges Bild');
            }
        });
    });
    
    // Schließe Lightbox beim Klick auf Close-Button
    lightboxClose.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });
    
    // Schließe Lightbox beim Klick außerhalb des Bildes
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Schließe Lightbox mit ESC-Taste
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// About Us Lightbox moved to consolidated initOnDOMReady()

// ============================================
// Hero Variants Switcher
// ============================================
function initHeroVariants() {
    const heroSection = document.querySelector('.hero-variants');
    if (!heroSection) return;
    
    const variantButtons = document.querySelectorAll('.variant-btn');
    if (variantButtons.length === 0) return;
    
    // Lade gespeicherte Präferenz oder setze Standard auf 'ultra-modern'
    const savedVariant = localStorage.getItem('heroVariant') || 'ultra-modern';
    
    // Setze initiale Variante
    function setVariant(variant) {
        // Entferne alle Varianten-Klassen
        heroSection.classList.remove(
            'hero-variant-ultra-modern', 
            'hero-variant-bold-dynamic', 
            'hero-variant-minimal-clean',
            'hero-variant-classic-pro',
            'hero-variant-elegant-centered'
        );
        
        // Füge neue Varianten-Klasse hinzu
        heroSection.classList.add(`hero-variant-${variant}`);
        
        // Aktualisiere Button-States
        variantButtons.forEach(btn => {
            if (btn.dataset.variant === variant) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Speichere Präferenz
        localStorage.setItem('heroVariant', variant);
        
        // Trigger custom event für mögliche weitere Aktionen
        const event = new CustomEvent('heroVariantChanged', { 
            detail: { variant: variant } 
        });
        window.dispatchEvent(event);
    }
    
    // Event Listener für Varianten-Buttons
    variantButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const variant = btn.dataset.variant;
            if (variant) {
                setVariant(variant);
            }
        });
    });
    
    // Setze initiale Variante
    setVariant(savedVariant);
}

// Initialisiere Hero Variants wenn DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVariants);
} else {
    initHeroVariants();
}

// ============================================
// Header Variants Switcher
// ============================================
function initHeaderVariants() {
    const headerSection = document.querySelector('.header-variants');
    if (!headerSection) return;
    
    const variantButtons = document.querySelectorAll('.header-variant-btn');
    if (variantButtons.length === 0) return;
    
    // Lade gespeicherte Präferenz oder setze Standard auf 'modern'
    const savedVariant = localStorage.getItem('headerVariant') || 'modern';
    
    // Setze initiale Variante
    function setVariant(variant) {
        // Entferne alle Varianten-Klassen
        headerSection.classList.remove(
            'header-variant-modern', 
            'header-variant-bold', 
            'header-variant-minimal',
            'header-variant-classic',
            'header-variant-elegant'
        );
        
        // Füge neue Varianten-Klasse hinzu
        headerSection.classList.add(`header-variant-${variant}`);
        
        // Aktualisiere Button-States
        variantButtons.forEach(btn => {
            if (btn.dataset.variant === variant) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Speichere Präferenz
        localStorage.setItem('headerVariant', variant);
        
        // Trigger custom event für mögliche weitere Aktionen
        const event = new CustomEvent('headerVariantChanged', { 
            detail: { variant: variant } 
        });
        window.dispatchEvent(event);
    }
    
    // Event Listener für Varianten-Buttons
    variantButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const variant = btn.dataset.variant;
            if (variant) {
                setVariant(variant);
            }
        });
    });
    
    // Setze initiale Variante
    setVariant(savedVariant);
}

// ============================================
// Mobile Menu für minimalen Header
// ============================================
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const navMobile = document.getElementById('nav-mobile');
    const bottomMenuToggle = document.getElementById('bottom-menu-toggle');

    console.log('initMobileMenu called');
    console.log('navMobile:', navMobile);
    console.log('mobileMenuToggle:', mobileMenuToggle);
    console.log('bottomMenuToggle:', bottomMenuToggle);

    if (!navMobile) {
        console.error('nav-mobile element not found!');
        return;
    }

    if (!mobileMenuToggle && !bottomMenuToggle) {
        console.error('No menu toggle buttons found!');
        return;
    }

    function openMobileMenu() {
        console.log('Opening mobile menu');
        navMobile.classList.add('active');
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.add('active');
        }
        if (bottomMenuToggle) {
            bottomMenuToggle.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        console.log('Closing mobile menu');
        navMobile.classList.remove('active');
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
        }
        if (bottomMenuToggle) {
            bottomMenuToggle.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    // Toggle mobile menu
    if (mobileMenuToggle) {
        console.log('Adding event listener to mobileMenuToggle');
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('mobileMenuToggle clicked');
            const isActive = navMobile.classList.contains('active');

            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Toggle via Bottom Sticky Nav Hamburger (nur Mobile)
    if (bottomMenuToggle) {
        console.log('Adding event listener to bottomMenuToggle');
        bottomMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('bottomMenuToggle clicked');
            const isActive = navMobile.classList.contains('active');

            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close button in mobile menu
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    // Close mobile menu when clicking on a link
    const mobileLinks = navMobile.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMobile.classList.contains('active')) return;
        
        const clickedToggle = mobileMenuToggle && mobileMenuToggle.contains(e.target);
        const clickedBottomToggle = bottomMenuToggle && bottomMenuToggle.contains(e.target);
        const clickedClose = mobileNavClose && mobileNavClose.contains(e.target);
        
        if (!navMobile.contains(e.target) && !clickedToggle && !clickedBottomToggle && !clickedClose) {
            closeMobileMenu();
        }
    });
}

// ============================================
// Header Scroll Effect für minimalen Header
// ============================================
function initHeaderScroll() {
    const header = document.querySelector('.header-kfz');
    if (!header) return;

    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
    });
}

// Initialisiere Header Variants wenn DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderVariants);
} else {
    initHeaderVariants();
}

// ============================================
// Hero Tech - Animated Counter
// ============================================
function initHeroTechCounter() {
    const statNumbers = document.querySelectorAll('.hero-kfz-stats .stat-number');
    if (statNumbers.length === 0) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-target'));
                if (!statNumber.classList.contains('counted')) {
                    animateCounter(statNumber, target);
                    statNumber.classList.add('counted');
                }
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target === 100 ? '100' : target === 5 ? '5' : target === 24 ? '24' : target.toLocaleString();
            clearInterval(timer);
        } else {
            const displayValue = Math.floor(current);
            element.textContent = displayValue === 100 ? '100' : displayValue === 5 ? '5' : displayValue === 24 ? '24' : displayValue.toLocaleString();
        }
    }, 16);
}

// Initialisiere Mobile Menu und Header Scroll wenn DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initHeaderScroll();
        initHeroTechCounter();
    });
} else {
    initMobileMenu();
    initHeaderScroll();
    initHeroTechCounter();
}

// ============================================
// Besucher-Tracking
// ============================================
// Session-ID generieren und speichern
function getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

async function trackVisitor() {
    try {
        const sessionId = getSessionId();
        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const pagePath = window.location.pathname + window.location.search;
        
        const response = await fetch('/api/track-visitor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: sessionId,
                pageUrl: pageUrl,
                pageTitle: pageTitle,
                pagePath: pagePath
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✅ Besucher getrackt:', data.isReturning ? 'Wiederkehrender Besucher' : 'Neuer Besucher');
        }
    } catch (error) {
        console.error('Fehler beim Tracking:', error);
    }
}

// Beim Laden der Seite tracken
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisitor);
} else {
    trackVisitor();
}

// Track bei Seitenwechsel (für SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        trackVisitor();
    }
}).observe(document, { subtree: true, childList: true });

// Session-ID generieren und speichern
function getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

// Verbesserte trackVisitor Funktion
async function trackVisitor() {
    try {
        const sessionId = getSessionId();
        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const pagePath = window.location.pathname + window.location.search;
        
        const response = await fetch('/api/track-visitor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: sessionId,
                pageUrl: pageUrl,
                pageTitle: pageTitle,
                pagePath: pagePath
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('✅ Besucher getrackt:', data.isReturning ? 'Wiederkehrender Besucher' : 'Neuer Besucher');
        }
    } catch (error) {
        console.error('Fehler beim Tracking:', error);
    }
}

// Track bei Seitenwechsel (für SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        trackVisitor();
    }
}).observe(document, { subtree: true, childList: true });
*/

// ============================================
// Meisterbrief Lightbox
// ============================================
function openMeisterbriefModal() {
    const lightbox = document.getElementById('meisterbrief-lightbox');
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMeisterbriefModal() {
    const lightbox = document.getElementById('meisterbrief-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Event Listeners für Meisterbrief Lightbox
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const closeBtn = document.querySelector('.meisterbrief-lightbox-close');
        const lightbox = document.getElementById('meisterbrief-lightbox');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMeisterbriefModal);
        }
        
        if (lightbox) {
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeMeisterbriefModal();
                }
            });
            
            // ESC-Taste zum Schließen
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    closeMeisterbriefModal();
                }
            });
        }
    });
} else {
    const closeBtn = document.querySelector('.meisterbrief-lightbox-close');
    const lightbox = document.getElementById('meisterbrief-lightbox');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMeisterbriefModal);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeMeisterbriefModal();
            }
        });
        
        // ESC-Taste zum Schließen
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeMeisterbriefModal();
            }
        });
    }
}

// ============================================
// Portfolio Lightbox
// ============================================
function openPortfolioModal() {
    const lightbox = document.getElementById('portfolio-lightbox');
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePortfolioModal() {
    const lightbox = document.getElementById('portfolio-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Event Listeners für Portfolio Lightbox
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const closeBtn = document.querySelector('.portfolio-lightbox-close');
        const lightbox = document.getElementById('portfolio-lightbox');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closePortfolioModal);
        }
        
        if (lightbox) {
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closePortfolioModal();
                }
            });
            
            // ESC-Taste zum Schließen
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    closePortfolioModal();
                }
            });
        }
    });
} else {
    const closeBtn = document.querySelector('.portfolio-lightbox-close');
    const lightbox = document.getElementById('portfolio-lightbox');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closePortfolioModal);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closePortfolioModal();
            }
        });
        
        // ESC-Taste zum Schließen
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closePortfolioModal();
            }
        });
    }
}
