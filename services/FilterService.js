/**
 * @typedef {Object} FilterOptions
 * @property {[number, number]} priceRange - Min and max price range
 * @property {string[]} types - Selected vehicle types
 * @property {string[]} features - Selected features
 */

/**
 * @typedef {Object} SortOption
 * @property {'price-asc'|'price-desc'|'rating'|'distance'} value - Sort option value
 * @property {string} label - Display label for the sort option
 */

class FilterService {
    constructor() {
        this.sortOptions = [
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
            { value: 'rating', label: 'Highest Rated' },
            { value: 'distance', label: 'Nearest to You' }
        ];
    }

    /**
     * Apply filters to a list of cars
     * @param {import('./CarService').Car[]} cars - Cars to filter
     * @param {FilterOptions} filters - Filter options to apply
     * @returns {import('./CarService').Car[]} Filtered cars
     */
    applyFilters(cars, filters) {
        return cars.filter(car => {
            // Check type filters
            if (filters.types.length > 0) {
                const carType = car.features.find(f => ['Electric', 'Hybrid', 'Petrol'].includes(f));
                if (!filters.types.includes(carType?.toLowerCase())) {
                    return false;
                }
            }
            
            // Check feature filters
            if (filters.features.length > 0) {
                const hasAllFeatures = filters.features.every(feature =>
                    car.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
                );
                if (!hasAllFeatures) {
                    return false;
                }
            }
            
            // Check price range
            const price = car.price;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
    }

    /**
     * Sort cars based on selected option
     * @param {import('./CarService').Car[]} cars - Cars to sort
     * @param {string} sortOption - Sort option to apply
     * @param {Object} [userLocation] - User's location for distance sorting
     * @returns {import('./CarService').Car[]} Sorted cars
     */
    sortCars(cars, sortOption, userLocation) {
        const sortedCars = [...cars];

        switch (sortOption) {
            case 'price-asc':
                sortedCars.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sortedCars.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sortedCars.sort((a, b) => b.rating - a.rating);
                break;
            case 'distance':
                if (userLocation) {
                    sortedCars.sort((a, b) => {
                        const distA = this.calculateDistance(userLocation, a.coordinates);
                        const distB = this.calculateDistance(userLocation, b.coordinates);
                        return distA - distB;
                    });
                }
                break;
        }

        return sortedCars;
    }

    /**
     * Calculate distance between two points
     * @param {Object} point1 - First point coordinates
     * @param {Object} point2 - Second point coordinates
     * @returns {number} Distance in kilometers
     * @private
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLon = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Get available sort options
     * @returns {SortOption[]} Array of sort options
     */
    getSortOptions() {
        return this.sortOptions;
    }

    /**
     * Get price range for a list of cars
     * @param {import('./CarService').Car[]} cars - Cars to analyze
     * @returns {[number, number]} Min and max prices
     */
    getPriceRange(cars) {
        const prices = cars.map(car => car.price);
        return [Math.min(...prices), Math.max(...prices)];
    }
}

// Export a singleton instance
export const filterService = new FilterService(); 