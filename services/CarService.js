import { carMakes, cities, features } from '../data/car-data.js';

/**
 * @typedef {Object} Car
 * @property {number} id - Unique identifier
 * @property {string} make - Car manufacturer
 * @property {string} model - Car model
 * @property {number} year - Manufacturing year
 * @property {number} price - Daily rental price
 * @property {string} location - City location
 * @property {string} postcode - Area postcode
 * @property {string[]} areas - Available areas
 * @property {Object} coordinates - Car location coordinates
 * @property {string[]} images - Array of image URLs
 * @property {string} fallbackImage - Fallback image URL
 * @property {string[]} features - Car features
 * @property {number} rating - Car rating
 * @property {number} reviews - Number of reviews
 */

class CarService {
    constructor() {
        this.cars = [];
        this.initialize();
    }

    /**
     * Initialize the car service with sample data
     * @private
     */
    initialize() {
        this.cars = this.generateSampleCars(500);
    }

    /**
     * Generate sample cars for testing
     * @param {number} count - Number of cars to generate
     * @returns {Car[]} Array of generated cars
     * @private
     */
    generateSampleCars(count) {
        const cars = [];
        for (let i = 1; i <= count; i++) {
            const seed = i;
            const car = this.generateCar(seed);
            cars.push(car);
        }
        return cars;
    }

    /**
     * Generate a single car based on a seed
     * @param {number} seed - Seed for deterministic generation
     * @returns {Car} Generated car object
     * @private
     */
    generateCar(seed) {
        const makeIndex = seed % carMakes.length;
        const makeData = carMakes[makeIndex];
        const modelIndex = Math.floor(seed / carMakes.length) % makeData.models.length;
        const model = makeData.models[modelIndex];
        
        const cityIndex = Math.floor(seed / (carMakes.length * 4)) % cities.length;
        const city = cities[cityIndex];
        const areaIndex = seed % city.areas.length;
        const area = city.areas[areaIndex];
        
        const latOffset = ((seed % 100) / 1000) - 0.05;
        const lngOffset = ((Math.floor(seed / 100) % 100) / 1000) - 0.05;
        
        const featureSetIndex = seed % features.length;
        const featureSet = features[featureSetIndex];
        const featureCount = (seed % 3) + 1;
        
        return {
            id: seed,
            make: makeData.make,
            model: model,
            year: 2021 + (seed % 3),
            price: this.calculatePrice(makeData, seed),
            location: `${city.name}, UK`,
            postcode: area,
            areas: city.areas,
            coordinates: {
                lat: city.center.lat + latOffset,
                lng: city.center.lng + lngOffset
            },
            images: this.generateCarImages(makeData.make, model),
            fallbackImage: this.getFallbackImage(),
            features: [makeData.type, `${(seed % 2) + 4} Seats`]
                .concat(featureSet.slice(0, featureCount)),
            rating: parseFloat((4 + (seed % 10) / 10).toFixed(1)),
            reviews: 50 + (seed % 150)
        };
    }

    /**
     * Calculate car price based on make and seed
     * @param {CarMake} makeData - Car make data
     * @param {number} seed - Generation seed
     * @returns {number} Calculated price
     * @private
     */
    calculatePrice(makeData, seed) {
        const basePrice = makeData.make === 'Tesla' || makeData.make === 'Mercedes' ? 75 : 45;
        const priceVariation = seed % 30;
        return basePrice + priceVariation;
    }

    /**
     * Generate image URLs for a car
     * @param {string} make - Car make
     * @param {string} model - Car model
     * @returns {string[]} Array of image URLs
     * @private
     */
    generateCarImages(make, model) {
        const makeModel = `${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`;
        return [
            `https://source.unsplash.com/800x600/?${makeModel},car`,
            `https://source.unsplash.com/800x600/?${make.toLowerCase()},car-interior`,
            `https://source.unsplash.com/800x600/?${model.toLowerCase().replace(/\s+/g, '-')},car`,
            `https://source.unsplash.com/800x600/?luxury,car`
        ];
    }

    /**
     * Get fallback image URL
     * @returns {string} Fallback image URL
     * @private
     */
    getFallbackImage() {
        return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
    }

    /**
     * Get all available cars
     * @returns {Car[]} Array of all cars
     */
    getAllCars() {
        return this.cars;
    }

    /**
     * Find a car by ID
     * @param {number} id - Car ID
     * @returns {Car|undefined} Found car or undefined
     */
    getCarById(id) {
        return this.cars.find(car => car.id === id);
    }

    /**
     * Find cars by postcode
     * @param {string} postcode - Postcode to search for
     * @returns {Car[]} Array of matching cars
     */
    findCarsByPostcode(postcode) {
        const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
        
        // Try exact match first
        const exactMatches = this.cars.filter(car => 
            car.postcode.replace(/\s+/g, '').toUpperCase() === cleanPostcode
        );
        
        if (exactMatches.length > 0) {
            return exactMatches;
        }
        
        // Try outcode match
        const outcode = cleanPostcode.split(' ')[0];
        return this.cars.filter(car => 
            car.areas.some(area => area.replace(/\s+/g, '').toUpperCase().startsWith(outcode))
        );
    }

    /**
     * Get unique makes and models count
     * @param {Car[]} cars - Array of cars to analyze
     * @returns {Object} Counts of unique makes and models
     */
    getUniqueMakesAndModels(cars = this.cars) {
        const uniqueMakes = new Set();
        const uniqueModels = new Set();
        
        cars.forEach(car => {
            uniqueMakes.add(car.make);
            uniqueModels.add(`${car.make} ${car.model}`);
        });
        
        return {
            makeCount: uniqueMakes.size,
            modelCount: uniqueModels.size
        };
    }
}

// Export a singleton instance
export const carService = new CarService(); 