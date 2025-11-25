// Icon Helper - Ersetzt Font Awesome durch inline SVG
// Lädt SVG-Icons direkt von Font Awesome CDN (nur benötigte Icons)

console.log('icons.js geladen');
console.log('DOM Ready State (icons.js):', document.readyState);

const ICON_CACHE = {};

async function getIconSVG(iconName, style = 'solid') {
    // Prüfe Cache
    const cacheKey = `${style}-${iconName}`;
    if (ICON_CACHE[cacheKey]) {
        return ICON_CACHE[cacheKey];
    }

    // Einfache Icon-Map für häufig verwendete Icons (inline SVG)
    const commonIcons = {
        'home': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V256H32c-17 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>',
        'exclamation-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
        'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>'
    };
    
    // Prüfe ob Icon in der Map ist
    if (commonIcons[iconName]) {
        let svgText = commonIcons[iconName];
        if (!svgText.includes('class=')) {
            svgText = svgText.replace(/<svg/, `<svg class="icon-svg icon-${iconName}" aria-hidden="true"`);
        } else {
            svgText = svgText.replace(/class="([^"]*)"/, `class="$1 icon-svg icon-${iconName}" aria-hidden="true"`);
        }
        ICON_CACHE[cacheKey] = svgText;
        return svgText;
    }
    
    // Fallback: Versuche von CDN zu laden
    const urls = [
        `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/svgs/${style}/${iconName}.svg`,
        `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.4.2/svgs/${style}/${iconName}.svg`
    ];
    
    for (const url of urls) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'default'
            });
            if (response.ok) {
                let svgText = await response.text();
                svgText = svgText.replace(/<\?xml[^>]*\?>/, '').trim();
                if (!svgText.includes('class=')) {
                    svgText = svgText.replace(/<svg/, `<svg class="icon-svg icon-${iconName}" aria-hidden="true"`);
                } else {
                    svgText = svgText.replace(/class="([^"]*)"/, `class="$1 icon-svg icon-${iconName}" aria-hidden="true"`);
                }
                ICON_CACHE[cacheKey] = svgText;
                return svgText;
            }
        } catch (error) {
            continue;
        }
    }
    
    // Letzter Fallback: Leeres SVG
    console.warn(`Icon ${iconName} konnte nicht geladen werden`);
    return '';
}

// Funktion zum Ersetzen von Font Awesome Icons durch SVG
async function replaceFontAwesomeIcons() {
    console.log('replaceFontAwesomeIcons aufgerufen');
    const icons = document.querySelectorAll('i[class*="fa-"]');
    console.log('Icons gefunden:', icons.length);
    const promises = [];
    
    icons.forEach(icon => {
        const classes = icon.className.split(' ');
        let iconName = null;
        let style = 'solid';
        
        // Finde Icon-Name und Style
        for (const cls of classes) {
            if (cls === 'fa-brands') {
                style = 'brands';
            } else if (cls === 'fa-solid') {
                style = 'solid';
            } else if (cls === 'fa-regular') {
                style = 'regular';
            } else if (cls.startsWith('fa-') && cls !== 'fa-spin' && cls !== 'fa-pulse') {
                iconName = cls.replace('fa-', '');
            }
        }
        
        if (iconName) {
            const promise = getIconSVG(iconName, style).then(svg => {
                if (svg) {
                    // Erstelle SVG-Element
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = svg.trim();
                    const svgElement = tempDiv.firstElementChild;
                    
                    // Kopiere Klassen und Attribute vom Original
                    if (icon.classList.contains('fa-spin')) {
                        svgElement.classList.add('fa-spin');
                    }
                    if (icon.classList.contains('fa-pulse')) {
                        svgElement.classList.add('fa-pulse');
                    }
                    
                    // Ersetze Icon
                    icon.parentNode.replaceChild(svgElement, icon);
                }
            });
            promises.push(promise);
        }
    });
    
    await Promise.all(promises);
    console.log('Alle Icons ersetzt:', promises.length);
}

// Initialisiere beim DOMContentLoaded
console.log('Icons: Prüfe DOM Ready State:', document.readyState);
if (document.readyState === 'loading') {
    console.log('Icons: Warte auf DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Icons: DOMContentLoaded Event ausgelöst');
        try {
            replaceFontAwesomeIcons().catch(error => {
                console.error('Fehler beim Laden der Icons:', error);
            });
        } catch (error) {
            console.error('Fehler beim Initialisieren der Icons:', error);
        }
    });
} else {
    console.log('Icons: DOM bereits geladen, starte sofort...');
    try {
        replaceFontAwesomeIcons().catch(error => {
            console.error('Fehler beim Laden der Icons:', error);
        });
    } catch (error) {
        console.error('Fehler beim Initialisieren der Icons:', error);
    }
}

// MutationObserver für dynamisch hinzugefügte Icons
const iconObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
                if (node.matches && node.matches('i[class*="fa-"]')) {
                    // Neues Icon gefunden, ersetze es
                    const classes = node.className.split(' ');
                    let iconName = null;
                    let style = 'solid';
                    
                    for (const cls of classes) {
                        if (cls === 'fa-brands') {
                            style = 'brands';
                        } else if (cls === 'fa-solid') {
                            style = 'solid';
                        } else if (cls === 'fa-regular') {
                            style = 'regular';
                        } else if (cls.startsWith('fa-') && cls !== 'fa-spin' && cls !== 'fa-pulse') {
                            iconName = cls.replace('fa-', '');
                        }
                    }
                    
                    if (iconName) {
                        getIconSVG(iconName, style).then(svg => {
                            if (svg && node.parentNode) { // Prüfe ob Node noch im DOM ist
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = svg.trim();
                                const svgElement = tempDiv.firstElementChild;
                                
                                if (svgElement && node.parentNode) {
                                    if (node.classList.contains('fa-spin')) {
                                        svgElement.classList.add('fa-spin');
                                    }
                                    if (node.classList.contains('fa-pulse')) {
                                        svgElement.classList.add('fa-pulse');
                                    }
                                    
                                    node.parentNode.replaceChild(svgElement, node);
                                }
                            }
                        }).catch(error => {
                            console.warn(`Fehler beim Laden des Icons ${iconName}:`, error);
                        });
                    }
                } else if (node.querySelectorAll) {
                    // Prüfe auf Icons in hinzugefügten Elementen
                    const icons = node.querySelectorAll('i[class*="fa-"]');
                    if (icons.length > 0) {
                        replaceFontAwesomeIcons();
                    }
                }
            }
        });
    });
});

// Starte Observer nach DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        iconObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
} else {
    iconObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}
