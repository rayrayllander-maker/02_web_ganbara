// Load and render menu from JSON
let menuData = null;

// Hero carousel state
const heroDefaults = {
    title: { es: '', eu: '' },
    subtitle: { es: '', eu: '' }
};
let heroSlides = [];
let heroSlideElements = [];
let heroCurrentIndex = 0;
let heroCarouselTimer = null;
let heroCarouselInterval = 5000;
let heroHighlightTimeout = null;
let heroLastHighlightedItem = null;

// Preloader helpers
function showPreloader() {
    const pre = document.getElementById('preloader');
    if (pre) { pre.classList.add('active'); document.body.classList.add('no-scroll'); }
}
function hidePreloader() {
    const pre = document.getElementById('preloader');
    if (pre) { pre.classList.remove('active'); document.body.classList.remove('no-scroll'); }
}
function waitForImages(timeoutMs = 7000) {
    return new Promise(resolve => {
        const imgs = Array.from(document.images);
        if (!imgs.length) { resolve(); return; }
        let doneCount = 0;
        const done = () => { doneCount++; if (doneCount >= imgs.length) resolve(); };
        imgs.forEach(img => {
            if (img.complete) done();
            else {
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
            }
        });
        setTimeout(resolve, timeoutMs);
    });
}

async function loadMenuData() {
    try {
        showPreloader();
        const response = await fetch('menu-data.json');
        menuData = await response.json();
        renderMenu();
        
        // Initialize category buttons AFTER menu is rendered
        initializeCategoryButtons();
        
        // Apply current language after menu is loaded
        const savedLang = localStorage.getItem('language') || 'es';
        applyLanguage(savedLang);

        // Wait for images to finish loading then hide preloader
        await waitForImages(8000);
        hidePreloader();
    } catch (error) {
        console.error('Error loading menu data:', error);
        hidePreloader();
    }
}

function renderMenu() {
    if (!menuData) return;
    
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = ''; // Clear existing content
    
    // Category icon assets for separators
    const categoryIconAssets = {
        bocadillos: {
            src: 'assets/bocadillos.svg',
            alt: {
                es: 'Icono bocadillos',
                eu: 'Ogitarteko ikonoa'
            }
        },
        raciones: {
            src: 'assets/raciones.svg',
            alt: {
                es: 'Icono raciones',
                eu: 'Hasierako ikonoa'
            }
        },
        hamburguesas: {
            src: 'assets/hamburguesas.svg',
            alt: {
                es: 'Icono hamburguesas',
                eu: 'Hanburgesa ikonoa'
            }
        },
        chuleta: {
            src: 'assets/h_chuleta.svg',
            alt: {
                es: 'Icono chuleta',
                eu: 'Txuleta ikonoa'
            }
        },
        postres: {
            src: 'assets/postre.svg',
            alt: {
                es: 'Icono postres',
                eu: 'Postre ikonoa'
            }
        }
    };

    // Fallback Font Awesome classes (for categories without SVG)
    const categoryIconClasses = {
        bocadillos: 'fa-bread-slice',
        raciones: 'fa-utensils',
        hamburguesas: 'fa-hamburger',
        chuleta: 'fa-drumstick-bite',
        postres: 'fa-ice-cream'
    };
    
    // Category names for titles
    const categoryNames = {
        bocadillos: { es: 'Bocadillos', eu: 'Ogitartekoak' },
        raciones: { es: 'Raciones', eu: 'Hasierakoak' },
        hamburguesas: { es: 'Hamburguesas', eu: 'Hanburgesak' },
        chuleta: { es: 'Chuleta', eu: 'Txuleta' },
        postres: { es: 'Postres', eu: 'Postreak' }
    };
    
    // Render each category
    Object.keys(menuData).forEach(category => {
        // Add visible separator inside the grid (section marker)
        const iconAsset = categoryIconAssets[category];
        const iconClass = categoryIconClasses[category] || 'fa-utensils';
        let iconMarkup = `<i class="fas ${iconClass}"></i>`;

        if (iconAsset?.src) {
            const altEs = iconAsset.alt?.es || '';
            const altEu = iconAsset.alt?.eu || altEs;
            const altText = currentLang === 'eu' ? (altEu || altEs) : altEs;
            iconMarkup = `
                <img 
                    src="${iconAsset.src}"
                    alt="${altText}"
                    class="category-title-icon"
                    data-alt-es="${altEs}"
                    data-alt-eu="${altEu}"
                >`;
        }
        const esName = categoryNames[category]?.es || category;
        const euName = categoryNames[category]?.eu || category;
        const separator = document.createElement('div');
        separator.className = 'menu-category';
        separator.setAttribute('data-category', category);
        separator.innerHTML = `
            <h3>
                ${iconMarkup}
                <span class="category-label" data-category="${category}" data-es="${esName}" data-eu="${euName}">${esName}</span>
            </h3>`;
        menuGrid.appendChild(separator);
        
        // Render items in this category
        menuData[category].forEach(item => {
            if (!item.disponible) return; // Skip unavailable items
            
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.setAttribute('data-category', category);
            menuItem.setAttribute('data-item-id', item.id);
            
            // Price formatting
            let priceHTML = '';
            if (item.precioPorKg) {
                priceHTML = `<span class="menu-item-price">€${item.precioPorKg.toFixed(2)}/kg</span>`;
            } else if (item.precio) {
                priceHTML = `<span class="menu-item-price">€${item.precio.toFixed(2)}</span>`;
            }
            
            // Media ración note
            let mediaRacionHTML = '';
            if (item.mediaRacion) {
                mediaRacionHTML = `<span class="media-racion" data-es="Media ración: €${item.mediaRacion.toFixed(2)}" data-eu="Erdi errazio: €${item.mediaRacion.toFixed(2)}">Media ración: €${item.mediaRacion.toFixed(2)}</span>`;
            }
            
            // Special note
            let noteHTML = '';
            if (item.nota) {
                noteHTML = `<p class="menu-item-note" data-es="${item.nota.es}" data-eu="${item.nota.eu}">${item.nota.es}</p>`;
            }
            
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <img src="${item.imagen}" alt="${item.nombre.es}" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'></div>'">
                </div>
                <div class="menu-item-content">
                    <h3 class="menu-item-title" data-es="${item.nombre.es}" data-eu="${item.nombre.eu}">${item.nombre.es}</h3>
                    <p class="menu-item-description" data-es="${item.descripcion.es}" data-eu="${item.descripcion.eu}">${item.descripcion.es}</p>
                    ${mediaRacionHTML}
                    ${noteHTML}
                    ${priceHTML}
                </div>
            `;
            
            menuGrid.appendChild(menuItem);
        });
    });
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.querySelector('.theme-toggle');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const isDark = document.body.classList.contains('dark-mode');
    if (window.scrollY > 100) {
        header.style.background = isDark ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.95)';
        header.style.boxShadow = 'none';
    }
});

// Theme handling
function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        themeToggle.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    }
}

// Initialize theme based on saved preference or system preference
document.addEventListener('DOMContentLoaded', async () => {
    captureHeroDefaults();

    const heroDataPromise = loadHeroCarouselData();
    loadMenuData();
    
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ? saved : (prefersDark ? 'dark' : 'light'));

    try {
        await heroDataPromise;
    } catch (error) {
        console.error('Error waiting for hero carousel data:', error);
    }

    startHeroCarousel();
});

// Toggle theme on button click
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Language toggle functionality
const langToggle = document.querySelector('.lang-toggle');
let currentLang = 'es';

function getLocalizedValue(value, lang = currentLang) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (value[lang]) return value[lang];
        if (lang !== 'es' && value.es) return value.es;
        const first = Object.values(value).find(v => typeof v === 'string');
        return first || '';
    }
    return '';
}

function applyLanguage(lang) {
    currentLang = lang;
    
    // Update all elements with data-es and data-eu attributes
    document.querySelectorAll('[data-es][data-eu]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            // For input placeholders
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        }
    });

    document.querySelectorAll('[data-alt-es][data-alt-eu]').forEach(element => {
        const altText = element.getAttribute(`data-alt-${lang}`);
        if (altText) {
            element.setAttribute('alt', altText);
        }
    });
    
    // Update menu category labels
    document.querySelectorAll('.category-label').forEach(label => {
        const text = label.getAttribute(`data-${lang}`);
        if (text) label.textContent = text;
    });
    
    // Update translations from translations.js if available
    if (typeof translations !== 'undefined' && translations[lang]) {
        const t = translations[lang];
        
        // About section
        const aboutTitle = document.querySelector('#about .section-title');
        if (aboutTitle) aboutTitle.textContent = t.aboutTitle;
        
        const aboutTexts = document.querySelectorAll('#about .about-text p');
        if (aboutTexts[0]) aboutTexts[0].textContent = t.aboutText1;
        if (aboutTexts[1]) aboutTexts[1].textContent = t.aboutText2;
        
        const features = document.querySelectorAll('.feature span');
        if (features[0]) features[0].textContent = t.featureFresh;
        if (features[1]) features[1].textContent = t.featureQuality;
        if (features[2]) features[2].textContent = t.featureTradition;
        
        // Contact section
        const contactTitle = document.querySelector('#contact .section-title');
        if (contactTitle) contactTitle.textContent = t.contactTitle;
        
        const contactSubtitle = document.querySelector('#contact .section-subtitle');
        if (contactSubtitle) contactSubtitle.textContent = t.contactSubtitle;
        
        const contactTitles = document.querySelectorAll('.contact-item h3');
        if (contactTitles[0]) contactTitles[0].textContent = t.addressTitle;
        if (contactTitles[1]) contactTitles[1].textContent = t.phoneTitle;
        if (contactTitles[2]) contactTitles[2].textContent = t.hoursTitle;
        if (contactTitles[3]) contactTitles[3].textContent = t.emailTitle;
        
        const contactTexts = document.querySelectorAll('.contact-item p');
        if (contactTexts[0]) contactTexts[0].innerHTML = t.addressText;
        if (contactTexts[2]) contactTexts[2].textContent = t.hoursText;
        
        // Reservation form
        const reservationTitle = document.querySelector('.reservation-form h3');
        if (reservationTitle) reservationTitle.textContent = t.reservationTitle;
        
        const formInputs = document.querySelectorAll('.reservation-form input');
        if (formInputs[0]) formInputs[0].placeholder = t.placeholderName;
        if (formInputs[1]) formInputs[1].placeholder = t.placeholderEmail;
        if (formInputs[2]) formInputs[2].placeholder = t.placeholderPhone;
        
        const selectTime = document.querySelector('.reservation-form select');
        if (selectTime && selectTime.options[0]) selectTime.options[0].textContent = t.selectTime;
        
        const selectPeople = document.querySelectorAll('.reservation-form select')[1];
        if (selectPeople) {
            if (selectPeople.options[0]) selectPeople.options[0].textContent = t.selectPeople;
            if (selectPeople.options[1]) selectPeople.options[1].textContent = t.person1;
            if (selectPeople.options[2]) selectPeople.options[2].textContent = t.person2;
            if (selectPeople.options[3]) selectPeople.options[3].textContent = t.person3;
            if (selectPeople.options[4]) selectPeople.options[4].textContent = t.person4;
            if (selectPeople.options[5]) selectPeople.options[5].textContent = t.person5;
        }
        
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) submitBtn.textContent = t.submitBtn;
        
        // Footer
        const footerTexts = document.querySelectorAll('.footer-section p');
        if (footerTexts[0]) footerTexts[0].textContent = t.footerTagline;
        
        const footerTitles = document.querySelectorAll('.footer-section h4');
        if (footerTitles[0]) footerTitles[0].textContent = t.footerLinks;
        if (footerTitles[1]) footerTitles[1].textContent = t.footerHours;
        if (footerTitles[2]) footerTitles[2].textContent = t.footerContact;
        
        const copyright = document.querySelector('.footer-bottom p');
        if (copyright) copyright.innerHTML = `&copy; 2024 Ganbara. ${t.footerCopyright}`;
    }
    
    // Update button text
    if (langToggle) {
        const langText = langToggle.querySelector('.lang-text');
        langText.textContent = lang === 'es' ? 'EU' : 'ES';
        langToggle.setAttribute('aria-label', lang === 'es' ? 'Cambiar a euskera' : 'Aldatu espainolera');
        langToggle.title = lang === 'es' ? 'Cambiar a euskera' : 'Aldatu espainolera';
    }

    updateHeroText();
}

// Toggle language on button click
if (langToggle) {
    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'es' ? 'eu' : 'es';
        applyLanguage(newLang);
        localStorage.setItem('language', newLang);
    });
}

function captureHeroDefaults() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroDefaults.title.es = heroTitle.getAttribute('data-es') || heroTitle.textContent.trim();
        heroDefaults.title.eu = heroTitle.getAttribute('data-eu') || heroDefaults.title.es;
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroDefaults.subtitle.es = heroSubtitle.getAttribute('data-es') || heroSubtitle.textContent.trim();
        heroDefaults.subtitle.eu = heroSubtitle.getAttribute('data-eu') || heroDefaults.subtitle.es;
    }
}

async function loadHeroCarouselData() {
    try {
        const response = await fetch('hero-carousel.json');
        const data = await response.json();
        const slides = Array.isArray(data.slides) ? data.slides : [];
        heroSlides = slides.filter(slide => slide && slide.image);
        heroCurrentIndex = 0;
        renderHeroCarousel();
    } catch (error) {
        console.error('Error loading hero carousel data:', error);
        heroSlides = [];
        renderHeroCarousel();
    }
}

function renderHeroCarousel() {
    const container = document.querySelector('.hero-image .image-placeholder');
    if (!container) return;

    container.innerHTML = '';
    heroSlideElements = [];

    heroSlides.forEach((slide, idx) => {
        const img = document.createElement('img');
        img.src = slide.image;
        img.loading = idx === 0 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.className = 'carousel-item';
        if (idx === heroCurrentIndex) img.classList.add('is-active');

        const altEs = getLocalizedValue(slide.alt, 'es') || getLocalizedValue(slide.title, 'es') || heroDefaults.title.es;
        const altEu = getLocalizedValue(slide.alt, 'eu') || getLocalizedValue(slide.title, 'eu') || altEs;
        img.setAttribute('data-alt-es', altEs);
        img.setAttribute('data-alt-eu', altEu);
        img.alt = currentLang === 'eu' ? altEu : altEs;

        if (slide.target) {
            if (slide.target.category) {
                img.dataset.targetCategory = slide.target.category;
            }
            if (slide.target.itemId !== undefined) {
                img.dataset.targetItemId = String(slide.target.itemId);
            }
        }

        img.addEventListener('click', () => {
            const wasActive = idx === heroCurrentIndex;
            if (!wasActive) {
                setHeroSlide(idx);
            } else {
                restartHeroCarouselTimer();
            }
            focusHeroSlideTarget(idx);
        });

        container.appendChild(img);
        heroSlideElements.push(img);
    });

    setHeroSlide(heroCurrentIndex, { restartTimer: false });
}

function updateHeroText() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    const slide = heroSlides[heroCurrentIndex];

    const titleEs = slide ? (getLocalizedValue(slide.title, 'es') || heroDefaults.title.es) : heroDefaults.title.es;
    const titleEu = slide ? (getLocalizedValue(slide.title, 'eu') || titleEs) : (heroDefaults.title.eu || titleEs);
    const subtitleEs = slide ? (getLocalizedValue(slide.subtitle, 'es') || heroDefaults.subtitle.es) : heroDefaults.subtitle.es;
    const subtitleEu = slide ? (getLocalizedValue(slide.subtitle, 'eu') || subtitleEs) : (heroDefaults.subtitle.eu || subtitleEs);

    if (heroTitle) {
        heroTitle.setAttribute('data-es', titleEs);
        heroTitle.setAttribute('data-eu', titleEu);
        heroTitle.textContent = currentLang === 'eu' ? titleEu : titleEs;
    }

    if (heroSubtitle) {
        heroSubtitle.setAttribute('data-es', subtitleEs);
        heroSubtitle.setAttribute('data-eu', subtitleEu);
        heroSubtitle.textContent = currentLang === 'eu' ? subtitleEu : subtitleEs;
    }

    heroSlideElements.forEach((img, idx) => {
        const slideData = heroSlides[idx];
        const altEs = slideData ? (getLocalizedValue(slideData.alt, 'es') || getLocalizedValue(slideData.title, 'es') || heroDefaults.title.es) : heroDefaults.title.es;
        const altEu = slideData ? (getLocalizedValue(slideData.alt, 'eu') || getLocalizedValue(slideData.title, 'eu') || altEs) : (heroDefaults.title.eu || altEs);
        img.setAttribute('data-alt-es', altEs);
        img.setAttribute('data-alt-eu', altEu);
        img.alt = currentLang === 'eu' ? altEu : altEs;
    });
}

function setHeroSlide(index, options = {}) {
    if (!heroSlides.length) {
        updateHeroText();
        return;
    }

    const { restartTimer = true } = options;
    const total = heroSlides.length;
    heroCurrentIndex = ((index % total) + total) % total;

    clearHeroHighlight();

    heroSlideElements.forEach((img, idx) => {
        img.classList.toggle('is-active', idx === heroCurrentIndex);
    });

    updateHeroText();

    if (restartTimer) restartHeroCarouselTimer();
}

function restartHeroCarouselTimer() {
    stopHeroCarousel();
    if (heroSlides.length <= 1) return;

    heroCarouselTimer = setInterval(() => {
        setHeroSlide(heroCurrentIndex + 1, { restartTimer: false });
    }, heroCarouselInterval);
}

function stopHeroCarousel() {
    if (heroCarouselTimer) {
        clearInterval(heroCarouselTimer);
        heroCarouselTimer = null;
    }
}

function startHeroCarousel(intervalMs = 5000) {
    heroCarouselInterval = intervalMs;
    if (heroSlides.length) {
        setHeroSlide(heroCurrentIndex, { restartTimer: false });
    }
    restartHeroCarouselTimer();
}

function focusHeroSlideTarget(index, attempt = 0) {
    if (attempt > 8) return;
    const slide = heroSlides[index];
    if (!slide || !slide.target) return;

    const category = slide.target.category;
    const itemId = slide.target.itemId;
    if (!category) return;

    let selector = `.menu-category[data-category="${category}"]`;
    if (itemId !== undefined) {
        selector = `.menu-item[data-category="${category}"][data-item-id="${itemId}"]`;
    }

    const targetElement = document.querySelector(selector);
    if (!targetElement) {
        setTimeout(() => focusHeroSlideTarget(index, attempt + 1), 250);
        return;
    }

    const header = document.querySelector('.header');
    const categoriesBar = document.querySelector('.menu-categories');
    const headerHeight = header ? header.offsetHeight : 0;
    const barHeight = categoriesBar ? categoriesBar.offsetHeight : 0;
    const offset = headerHeight + barHeight + 24;
    const elementRect = targetElement.getBoundingClientRect();
    const targetTop = Math.max(0, window.scrollY + elementRect.top - offset);

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    setTimeout(() => highlightMenuElement(targetElement), 260);
}

function highlightMenuElement(element) {
    if (!element || !document.body.contains(element)) return;

    if (heroLastHighlightedItem && heroLastHighlightedItem !== element) {
        heroLastHighlightedItem.classList.remove('highlighted');
    }

    element.classList.add('highlighted');
    heroLastHighlightedItem = element;

    if (heroHighlightTimeout) {
        clearTimeout(heroHighlightTimeout);
    }

    heroHighlightTimeout = setTimeout(() => {
        element.classList.remove('highlighted');
        if (heroLastHighlightedItem === element) {
            heroLastHighlightedItem = null;
        }
    }, 3500);
}

function clearHeroHighlight() {
    if (heroHighlightTimeout) {
        clearTimeout(heroHighlightTimeout);
        heroHighlightTimeout = null;
    }
    if (heroLastHighlightedItem) {
        heroLastHighlightedItem.classList.remove('highlighted');
        heroLastHighlightedItem = null;
    }
}

// Menu filtering functionality
function initializeCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.getAttribute('data-category');

            // Scroll mapping: button data-category -> .menu-category[data-category]
            if (category === 'all') {
                const menuSection = document.getElementById('menu');
                if (menuSection) {
                    const bar = document.querySelector('.menu-categories');
                    const barRect = bar ? bar.getBoundingClientRect() : { height: 0, top: 0 };
                    const top = menuSection.getBoundingClientRect().top;
                    const scrollY = window.scrollY + top - barRect.height - barRect.top + 8;
                    window.scrollTo({ top: scrollY, behavior: 'smooth' });
                }
                return;
            }

            const target = document.querySelector(`.menu-category[data-category="${category}"]`);
            if (target) {
                setTimeout(() => {
                    const bar = document.querySelector('.menu-categories');
                    const barRect = bar ? bar.getBoundingClientRect() : { height: 0, top: 0 };
                    const rect = target.getBoundingClientRect();
                    const scrollY = window.scrollY + rect.top - barRect.height - barRect.top + 8;
                    window.scrollTo({ top: scrollY, behavior: 'smooth' });
                }, 60);
            }
        });
    });
}

// Form submission handling
const reservationForm = document.querySelector('.reservation-form form');
if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Simple validation
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#e74c3c';
            } else {
                field.style.borderColor = '#e9ecef';
            }
        });
        
        if (isValid) {
            // Show success message
            showNotification('¡Reserva enviada con éxito! Te contactaremos pronto.', 'success');
            this.reset();
        } else {
            showNotification('Por favor, completa todos los campos requeridos.', 'error');
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.menu-item, .about-text, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Loading animation for menu items
function animateMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Call animation on page load
document.addEventListener('DOMContentLoaded', animateMenuItems);

// Parallax effect for hero section (optional enhancement)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    const hero = document.querySelector('.hero');
    
    if (heroImage && hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        
        // Solo aplicar parallax cuando estamos dentro de la sección hero
        if (scrolled < heroBottom) {
            const parallaxValue = scrolled * 0.3;
            heroImage.style.transform = `translateY(${parallaxValue}px)`;
            // Reducir opacidad al hacer scroll para transición suave
            const opacity = Math.max(0, 1 - (scrolled / heroBottom) * 0.5);
            heroImage.style.opacity = opacity;
        }
    }
});

// Add loading states for better UX
function addLoadingState(element) {
    element.style.opacity = '0.7';
    element.style.pointerEvents = 'none';
}

function removeLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Enhanced form validation with real-time feedback
document.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('blur', function() {
        validateField(this);
    });
    
    field.addEventListener('input', function() {
        if (this.classList.contains('error')) {
            validateField(this);
        }
    });
});

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo es requerido';
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Por favor, introduce un email válido';
    }
    
    // Phone validation
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Por favor, introduce un teléfono válido';
    }
    
    // Date validation (not in the past)
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            errorMessage = 'La fecha no puede ser en el pasado';
        }
    }
    
    // Update field appearance
    if (isValid) {
        field.classList.remove('error');
        field.style.borderColor = '#27ae60';
        removeFieldError(field);
    } else {
        field.classList.add('error');
        field.style.borderColor = '#e74c3c';
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{9,}$/;
    return phoneRegex.test(phone);
}

function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 0.25rem;
        transition: opacity 0.3s ease;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Add search functionality to menu (bonus feature)
function addMenuSearch() {
    const searchContainer = document.querySelector('.menu-categories');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar platos...';
    searchInput.className = 'menu-search';
    searchInput.style.cssText = `
        padding: 12px 20px;
        border: 2px solid #e9ecef;
        border-radius: 25px;
        margin-right: 1rem;
        font-size: 1rem;
        min-width: 250px;
    `;
    
    searchContainer.insertBefore(searchInput, searchContainer.firstChild);
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const title = item.querySelector('.menu-item-title').textContent.toLowerCase();
            const description = item.querySelector('.menu-item-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Reset category filter when searching
        if (searchTerm) {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
        }
    });
}

// Initialize search functionality - DESACTIVADO (se usa navegación por scroll)
// document.addEventListener('DOMContentLoaded', addMenuSearch);