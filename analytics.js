/**
 * Click Analytics System
 * Tracks clicks on hamburguesa items and sends data to backend
 */

(function() {
    'use strict';

    // Configuration
    const API_URL = window.location.origin + '/api/track-click';
    const TRACK_CATEGORY = 'hamburguesas'; // Only track hamburguesas

    /**
     * Send click data to backend
     */
    async function trackClick(itemId, itemName, category) {
        try {
            const data = {
                itemId,
                itemName,
                category,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Click tracked:', result);
        } catch (error) {
            console.error('Error tracking click:', error);
            // Fail silently - don't disrupt user experience
        }
    }

    /**
     * Initialize click tracking on menu items
     */
    function initializeClickTracking() {
        // Wait for menu to be rendered
        const checkMenu = setInterval(() => {
            const menuItems = document.querySelectorAll('.menu-item');
            if (menuItems.length > 0) {
                clearInterval(checkMenu);
                setupClickListeners();
            }
        }, 500);

        // Clear interval after 10 seconds if menu doesn't load
        setTimeout(() => clearInterval(checkMenu), 10000);
    }

    /**
     * Setup click listeners on hamburguesa items
     */
    function setupClickListeners() {
        const hamburguesaItems = document.querySelectorAll(`.menu-item[data-category="${TRACK_CATEGORY}"]`);
        
        console.log(`Analytics: Tracking ${hamburguesaItems.length} hamburguesa items`);

        hamburguesaItems.forEach(item => {
            item.addEventListener('click', function(e) {
                const itemId = this.getAttribute('data-item-id');
                const category = this.getAttribute('data-category');
                const titleElement = this.querySelector('.menu-item-title');
                
                if (itemId && titleElement) {
                    const itemNameEs = titleElement.getAttribute('data-es');
                    const itemNameEu = titleElement.getAttribute('data-eu');
                    
                    const itemName = {
                        es: itemNameEs,
                        eu: itemNameEu
                    };

                    trackClick(itemId, itemName, category);
                }
            });

            // Add visual feedback (optional)
            item.style.cursor = 'pointer';
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeClickTracking);
    } else {
        initializeClickTracking();
    }
})();
