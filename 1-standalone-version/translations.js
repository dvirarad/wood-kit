class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.rtlLanguages = ['he', 'ar'];
        this.isReady = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
            await this.loadTranslations();
            await this.setLanguage(savedLanguage);
            this.setupLanguageSelector();
            this.isReady = true;
            console.log('Translation system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize translation system:', error);
            this.isReady = true; // Still mark as ready to prevent hanging
        }
    }

    async loadTranslations() {
        const languages = ['en', 'he', 'es'];
        
        for (const lang of languages) {
            try {
                const response = await fetch(`translations/${lang}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.translations[lang] = await response.json();
                console.log(`Loaded ${lang} translations successfully`);
            } catch (error) {
                console.error(`Failed to load ${lang} translations:`, error);
                if (lang === 'en') {
                    // Provide fallback English translations
                    this.translations[lang] = this.getFallbackTranslations();
                }
            }
        }
    }

    getFallbackTranslations() {
        return {
            "site": {
                "title": "Wood Kits - DIY Wooden Construction Kits",
                "logo": "Wood Kits"
            },
            "navigation": {
                "diy_kits": "DIY Kits",
                "raw_materials": "Raw Materials",
                "by_use": "By Use",
                "about": "About",
                "planters_garden_beds": "Planters & Garden Beds",
                "shelving_units": "Shelving Units",
                "benches_seating": "Benches & Seating",
                "storage_solutions": "Storage Solutions",
                "wood_boards": "Wood Boards",
                "hardware_fasteners": "Hardware & Fasteners",
                "tools_accessories": "Tools & Accessories",
                "garden_outdoor": "Garden & Outdoor",
                "home_indoor": "Home & Indoor",
                "storage_organization": "Storage & Organization"
            },
            "hero": {
                "title": "Premium DIY Wooden Construction Kits",
                "subtitle": "Create beautiful, functional pieces for your home and garden with our easy-to-assemble wooden kits."
            },
            "products": {
                "featured_title": "Featured Products",
                "add_to_cart": "Add to Cart",
                "added": "Added!",
                "raised_garden_bed": {
                    "title": "Raised Garden Bed Kit",
                    "description": "Complete kit for building a 4x4 raised garden bed. Includes pre-cut cedar boards and hardware.",
                    "price": "$89.99"
                },
                "wall_shelf": {
                    "title": "Wall Mounted Shelf Kit",
                    "description": "Stylish floating shelf kit with hidden brackets. Perfect for displaying books and decor.",
                    "price": "$34.99"
                },
                "garden_bench": {
                    "title": "Garden Bench Kit",
                    "description": "Classic wooden bench kit for your garden or patio. Weather-resistant treated lumber.",
                    "price": "$124.99"
                },
                "storage_box": {
                    "title": "Storage Box Kit",
                    "description": "Versatile wooden storage box with hinged lid. Great for tools, toys, or outdoor cushions.",
                    "price": "$67.99"
                },
                "planter_box": {
                    "title": "Planter Box Kit",
                    "description": "Decorative planter box kit for herbs and small plants. Includes drainage system.",
                    "price": "$45.99"
                },
                "tool_rack": {
                    "title": "Tool Rack Kit",
                    "description": "Wall-mounted tool organization system. Keep your workshop tidy and tools accessible.",
                    "price": "$56.99"
                }
            },
            "footer": {
                "copyright": "© 2024 Wood Kits. All rights reserved."
            }
        };
    }

    setupLanguageSelector() {
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    async setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not available, falling back to English`);
            language = 'en';
        }

        this.currentLanguage = language;
        localStorage.setItem('selectedLanguage', language);
        
        document.documentElement.lang = language;
        
        if (this.rtlLanguages.includes(language)) {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }

        this.translatePage();
        
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = language;
        }
    }

    translatePage() {
        console.log('Translating page to:', this.currentLanguage);
        const elements = document.querySelectorAll('[data-translate]');
        console.log('Found elements to translate:', elements.length);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getNestedTranslation(key);
            
            console.log(`Translating key: ${key} -> ${translation}`);
            
            if (translation && translation !== key) {
                if (element.tagName === 'TITLE') {
                    document.title = translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`No translation found for key: ${key}`);
            }
        });

        this.updateAddToCartButtons();
    }

    getNestedTranslation(key) {
        if (!key) return key;
        
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        console.log(`Looking for translation: ${key} in language: ${this.currentLanguage}`);
        console.log('Available translations:', Object.keys(this.translations));
        console.log('Current language data:', this.translations[this.currentLanguage]);
        
        // Try current language first
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                translation = null;
                break;
            }
        }
        
        if (translation && translation !== key) {
            return translation;
        }
        
        // Fallback to English
        console.log('Falling back to English for key:', key);
        let fallbackTranslation = this.translations['en'];
        for (const fk of keys) {
            if (fallbackTranslation && typeof fallbackTranslation === 'object' && fk in fallbackTranslation) {
                fallbackTranslation = fallbackTranslation[fk];
            } else {
                console.warn('No fallback translation found for:', key);
                return key; // Return the key if no translation found
            }
        }
        
        return fallbackTranslation || key;
    }

    updateAddToCartButtons() {
        const buttons = document.querySelectorAll('.add-to-cart');
        const addedText = this.getNestedTranslation('products.added');
        
        buttons.forEach(button => {
            const isAdded = button.textContent === addedText || 
                           button.textContent === 'Added!' || 
                           button.textContent === '¡Añadido!' || 
                           button.textContent === 'נוסף!';
            
            if (isAdded) {
                setTimeout(() => {
                    const originalText = this.getNestedTranslation('products.add_to_cart');
                    button.textContent = originalText;
                }, 100);
            }
        });
    }

    getLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.rtlLanguages.includes(this.currentLanguage);
    }
}

// Initialize translation manager when DOM is ready
let translationManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        translationManager = new TranslationManager();
        window.translationManager = translationManager;
    });
} else {
    translationManager = new TranslationManager();
    window.translationManager = translationManager;
}