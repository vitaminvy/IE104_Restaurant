// ================================
// OPENSTREETMAP HANDLER
// Interactive map viewer using LeafletJS (no API key required)
// ================================

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // UIT - Đại học Công nghệ Thông tin coordinates
    location: {
      lat: 10.870014,
      lng: 106.803180,
    },
    zoom: 16,
    panPixels: 75, // Pixels to pan on each directional button click
    tileLayer: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
  };

  let map = null;
  let mapInitialized = false;
  let marker = null;

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ================================
  // INITIALIZATION
  // ================================

  function init() {
    const openMapBtn = document.getElementById('openMapBtn');
    const closeMapBtn = document.getElementById('closeMapBtn');

    if (!openMapBtn) {
      console.warn('Open map button not found');
      return;
    }

    // Attach event listeners
    openMapBtn.addEventListener('click', handleOpenMap);

    if (closeMapBtn) {
      closeMapBtn.addEventListener('click', handleCloseMap);
    }
  }

  // ================================
  // OPEN MAP HANDLER
  // ================================

  function handleOpenMap(event) {
    event.preventDefault();

    const imageContainer = document.getElementById('image-container');
    const mapContainer = document.getElementById('map-viewer-container');

    if (!imageContainer || !mapContainer) {
      console.error('Required containers not found');
      return;
    }

    // Hide image, show map
    imageContainer.style.display = 'none';
    mapContainer.style.display = 'block';

    // Initialize map on first open (lazy loading)
    if (!mapInitialized) {
      initializeMap();
      mapInitialized = true;
    } else {
      // Refresh map size if already initialized
      if (map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    }
  }

  // ================================
  // CLOSE MAP HANDLER
  // ================================

  function handleCloseMap(event) {
    if (event) event.preventDefault();

    const imageContainer = document.getElementById('image-container');
    const mapContainer = document.getElementById('map-viewer-container');

    if (!imageContainer || !mapContainer) return;

    // Show image, hide map
    mapContainer.style.display = 'none';
    imageContainer.style.display = 'flex';
  }

  // ================================
  // INITIALIZE LEAFLET MAP
  // ================================

  function initializeMap() {
    const mapElement = document.getElementById('map');

    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded');
      return;
    }

    try {
      // Create map instance
      map = L.map('map', {
        center: [CONFIG.location.lat, CONFIG.location.lng],
        zoom: CONFIG.zoom,
        zoomControl: true, // Enable default zoom controls
        scrollWheelZoom: true, // Enable scroll wheel zoom
        dragging: true, // Enable dragging
        touchZoom: true, // Enable touch zoom for mobile
      });

      // Add OpenStreetMap tile layer (no API key needed!)
      L.tileLayer(CONFIG.tileLayer.url, {
        attribution: CONFIG.tileLayer.attribution,
        maxZoom: CONFIG.tileLayer.maxZoom,
      }).addTo(map);

      // Add custom marker at UIT location
      marker = L.marker([CONFIG.location.lat, CONFIG.location.lng], {
        title: 'Đại học Công nghệ Thông tin - UIT',
      }).addTo(map);

      // Add popup to marker
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 8px;">
          <strong style="font-size: 16px; color: #222;">Đại học Công nghệ Thông tin – UIT</strong><br/>
          <span style="font-size: 14px; color: #666;">Thủ Đức, Hồ Chí Minh, Vietnam</span>
        </div>
      `);

      // Open popup immediately
      marker.openPopup();

      // Setup directional controls
      setupDirectionalControls();

      console.log('✅ OpenStreetMap initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  // ================================
  // DIRECTIONAL CONTROLS SETUP
  // ================================

  function setupDirectionalControls() {
    const controls = {
      up: document.getElementById('map-pan-up'),
      down: document.getElementById('map-pan-down'),
      left: document.getElementById('map-pan-left'),
      right: document.getElementById('map-pan-right'),
    };

    // Add click handlers for each direction
    if (controls.up) {
      controls.up.addEventListener('click', () => panMap('up'));
    }
    if (controls.down) {
      controls.down.addEventListener('click', () => panMap('down'));
    }
    if (controls.left) {
      controls.left.addEventListener('click', () => panMap('left'));
    }
    if (controls.right) {
      controls.right.addEventListener('click', () => panMap('right'));
    }
  }

  // ================================
  // PAN MAP PROGRAMMATICALLY
  // ================================

  function panMap(direction) {
    if (!map) {
      console.warn('Map not initialized');
      return;
    }

    const panDistance = CONFIG.panPixels;

    // Determine X and Y offsets based on direction
    let offsetX = 0;
    let offsetY = 0;

    switch (direction) {
      case 'up':
        offsetY = panDistance; // Pan up (positive Y)
        break;
      case 'down':
        offsetY = -panDistance; // Pan down (negative Y)
        break;
      case 'left':
        offsetX = panDistance; // Pan left (positive X)
        break;
      case 'right':
        offsetX = -panDistance; // Pan right (negative X)
        break;
      default:
        console.warn('Unknown direction:', direction);
        return;
    }

    // Use Leaflet's panBy method for smooth panning
    map.panBy([offsetX, offsetY], {
      animate: true,
      duration: 0.3, // Smooth 300ms animation
    });

    // Add visual feedback to button
    const button = document.getElementById(`map-pan-${direction}`);
    if (button) {
      button.classList.add('map-control-active');
      setTimeout(() => {
        button.classList.remove('map-control-active');
      }, 200);
    }
  }

  // ================================
  // EXPOSE CLOSE FUNCTION GLOBALLY (for onclick if needed)
  // ================================

  window.closeOpenStreetMap = handleCloseMap;
})();
