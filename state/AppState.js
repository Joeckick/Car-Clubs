/**
 * @typedef {Object} AppState
 * @property {'grid'|'map'} activeView - Current view mode
 * @property {import('../services/CarService').Car[]} filteredCars - Currently filtered cars
 * @property {Object} activeFilters - Active filter settings
 * @property {[number, number]} activeFilters.priceRange - Min and max price range
 * @property {string[]} activeFilters.types - Selected vehicle types
 * @property {string[]} activeFilters.features - Selected features
 * @property {string} sortOption - Current sort option
 * @property {Object|null} userLocation - User's location coordinates
 */

/**
 * @typedef {Object} StateChangeEvent
 * @property {keyof AppState} key - The state key that changed
 * @property {any} value - The new value
 * @property {any} previousValue - The previous value
 */

/**
 * @callback StateChangeCallback
 * @param {StateChangeEvent} event - The state change event
 */

class AppState {
    constructor() {
        /** @type {AppState} */
        this.state = {
            activeView: 'grid',
            filteredCars: [],
            activeFilters: {
                priceRange: [0, 200],
                types: [],
                features: []
            },
            sortOption: 'price-asc',
            userLocation: null
        };

        /** @type {Map<keyof AppState, Set<StateChangeCallback>>} */
        this.listeners = new Map();
    }

    /**
     * Get current state
     * @returns {AppState} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update state
     * @param {Partial<AppState>} updates - State updates
     */
    setState(updates) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...updates };

        // Notify listeners of changes
        Object.keys(updates).forEach(key => {
            if (updates[key] !== previousState[key]) {
                this.notifyListeners(key, updates[key], previousState[key]);
            }
        });
    }

    /**
     * Subscribe to state changes
     * @param {keyof AppState} key - State key to listen for
     * @param {StateChangeCallback} callback - Callback function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    }

    /**
     * Unsubscribe from state changes
     * @param {keyof AppState} key - State key to unsubscribe from
     * @param {StateChangeCallback} callback - Callback function to remove
     */
    unsubscribe(key, callback) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(callback);
        }
    }

    /**
     * Notify listeners of state change
     * @param {keyof AppState} key - Changed state key
     * @param {any} value - New value
     * @param {any} previousValue - Previous value
     * @private
     */
    notifyListeners(key, value, previousValue) {
        if (this.listeners.has(key)) {
            const event = { key, value, previousValue };
            this.listeners.get(key).forEach(callback => callback(event));
        }
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.setState({
            activeView: 'grid',
            filteredCars: [],
            activeFilters: {
                priceRange: [0, 200],
                types: [],
                features: []
            },
            sortOption: 'price-asc',
            userLocation: null
        });
    }

    /**
     * Update active filters
     * @param {Partial<AppState['activeFilters']>} filters - Filter updates
     */
    updateFilters(filters) {
        this.setState({
            activeFilters: {
                ...this.state.activeFilters,
                ...filters
            }
        });
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.setState({
            activeFilters: {
                priceRange: [0, 200],
                types: [],
                features: []
            }
        });
    }

    /**
     * Set user location
     * @param {GeolocationCoordinates} coordinates - User's coordinates
     */
    setUserLocation(coordinates) {
        this.setState({
            userLocation: {
                lat: coordinates.latitude,
                lng: coordinates.longitude
            }
        });
    }
}

// Export a singleton instance
export const appState = new AppState(); 