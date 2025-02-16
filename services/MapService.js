/**
 * @typedef {Object} MapOptions
 * @property {number} zoom - Initial zoom level
 * @property {Object} center - Initial center coordinates
 * @property {number} center.lat - Latitude
 * @property {number} center.lng - Longitude
 * @property {boolean} scrollWheelZoom - Enable scroll wheel zoom
 */

class MapService {
    constructor() {
        /** @type {L.Map} */
        this.map = null;
        /** @type {L.LayerGroup} */
        this.markers = null;
        this.defaultOptions = {
            zoom: 6,
            center: { lat: 54.5, lng: -2 }, // Center of UK
            scrollWheelZoom: true
        };
    }

    /**
     * Initialize the map
     * @param {string} elementId - ID of the map container element
     * @param {Partial<MapOptions>} [options] - Map initialization options
     * @returns {Promise<void>}
     */
    async initializeMap(elementId, options = {}) {
        try {
            const mapElement = document.getElementById(elementId);
            if (!mapElement) {
                throw new Error(`Map container element '${elementId}' not found`);
            }

            // Set explicit height and ensure the container is visible
            mapElement.style.height = '600px';
            mapElement.style.display = 'block';

            const mapOptions = { ...this.defaultOptions, ...options };
            
            this.map = L.map(elementId, {
                center: [mapOptions.center.lat, mapOptions.center.lng],
                zoom: mapOptions.zoom,
                scrollWheelZoom: mapOptions.scrollWheelZoom,
                zoomControl: true
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 3
            }).addTo(this.map);

            // Initialize markers layer group
            this.markers = L.layerGroup().addTo(this.map);

            // Force a resize after a short delay
            await new Promise(resolve => setTimeout(resolve, 250));
            this.map.invalidateSize();

        } catch (error) {
            console.error('Error initializing map:', error);
            throw error;
        }
    }

    /**
     * Update map markers with car data
     * @param {import('./CarService').Car[]} cars - Cars to display on the map
     */
    updateMarkers(cars) {
        if (!this.map || !this.markers) {
            throw new Error('Map not initialized');
        }

        try {
            // Clear existing markers
            this.markers.clearLayers();
            
            // Add markers for filtered cars
            const markerBounds = [];
            
            cars.forEach(car => {
                const marker = this.createCarMarker(car);
                this.markers.addLayer(marker);
                markerBounds.push([car.coordinates.lat, car.coordinates.lng]);
            });
            
            // Fit map to bounds if we have markers
            if (markerBounds.length > 0) {
                this.map.fitBounds(markerBounds);
            }
        } catch (error) {
            console.error('Error updating map markers:', error);
            throw error;
        }
    }

    /**
     * Create a marker for a car
     * @param {import('./CarService').Car} car - Car data
     * @returns {L.Marker} Leaflet marker
     * @private
     */
    createCarMarker(car) {
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: car.features.includes('Electric') 
                ? '<div class="marker electric">⚡</div>'
                : car.features.includes('Hybrid')
                    ? '<div class="marker hybrid">🔋</div>'
                    : '<div class="marker">🚗</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        
        const marker = L.marker([car.coordinates.lat, car.coordinates.lng], {
            icon: markerIcon,
            title: `${car.make} ${car.model}`
        });
        
        const popupContent = `
            <div class="map-info-window">
                <img src="${car.images[0]}" 
                     alt="${car.make} ${car.model}"
                     onerror="this.src='${car.fallbackImage}'">
                <h3>${car.make} ${car.model}</h3>
                <p class="price">£${car.price}/day</p>
                <p class="location">${car.location}</p>
                <div class="rating">★ ${car.rating} (${car.reviews} reviews)</div>
                <button onclick="window.location.href='car-detail.html?id=${car.id}'" class="btn btn--primary">View Details</button>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'car-popup'
        });

        return marker;
    }

    /**
     * Get user's current location
     * @returns {Promise<GeolocationCoordinates>}
     */
    getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error)
            );
        });
    }

    /**
     * Center map on specific coordinates
     * @param {Object} coordinates - Coordinates to center on
     * @param {number} coordinates.lat - Latitude
     * @param {number} coordinates.lng - Longitude
     * @param {number} [zoom] - Optional zoom level
     */
    centerOn(coordinates, zoom) {
        if (!this.map) {
            throw new Error('Map not initialized');
        }

        this.map.setView([coordinates.lat, coordinates.lng], zoom || this.map.getZoom());
    }

    /**
     * Clean up map instance
     */
    cleanup() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.markers = null;
        }
    }
}

// Export a singleton instance
export const mapService = new MapService(); 