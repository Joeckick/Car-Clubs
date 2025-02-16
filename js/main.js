// DOM Elements
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form__input');

// Car data generation helpers
const carMakes = [
    { make: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X'], type: 'Electric' },
    { make: 'BMW', models: ['i3', 'i4', '330e', 'X5'], type: 'Hybrid' },
    { make: 'Volkswagen', models: ['ID.4', 'ID.3', 'e-Golf', 'Passat GTE'], type: 'Electric' },
    { make: 'Toyota', models: ['Prius', 'RAV4', 'Corolla Hybrid', 'Camry'], type: 'Hybrid' },
    { make: 'Nissan', models: ['Leaf', 'Ariya', 'Qashqai', 'Juke'], type: 'Electric' },
    { make: 'Hyundai', models: ['IONIQ 5', 'Kona Electric', 'Tucson PHEV'], type: 'Electric' },
    { make: 'Mini', models: ['Cooper SE', 'Countryman PHEV'], type: 'Electric' },
    { make: 'Kia', models: ['e-Niro', 'EV6', 'Soul EV', 'Sportage'], type: 'Electric' },
    { make: 'Audi', models: ['e-tron', 'Q4 e-tron', 'A3 TFSI e'], type: 'Electric' },
    { make: 'Mercedes', models: ['EQC', 'EQA', 'EQS', 'A250e'], type: 'Electric' }
];

const cities = [
    { name: 'London', areas: ['E1', 'E2', 'E14', 'N1', 'SE1', 'SW1', 'W1', 'WC1', 'EC1'], center: { lat: 51.5074, lng: -0.1278 } },
    { name: 'Manchester', areas: ['M1', 'M2', 'M3', 'M4', 'M15'], center: { lat: 53.4808, lng: -2.2426 } },
    { name: 'Birmingham', areas: ['B1', 'B2', 'B3', 'B4', 'B5'], center: { lat: 52.4862, lng: -1.8904 } },
    { name: 'Leeds', areas: ['LS1', 'LS2', 'LS3', 'LS4', 'LS6'], center: { lat: 53.8008, lng: -1.5491 } },
    { name: 'Bristol', areas: ['BS1', 'BS2', 'BS3', 'BS4', 'BS5'], center: { lat: 51.4545, lng: -2.5879 } },
    { name: 'Glasgow', areas: ['G1', 'G2', 'G3', 'G4', 'G5'], center: { lat: 55.8642, lng: -4.2518 } },
    { name: 'Edinburgh', areas: ['EH1', 'EH2', 'EH3', 'EH8', 'EH9'], center: { lat: 55.9533, lng: -3.1883 } },
    { name: 'Cardiff', areas: ['CF10', 'CF11', 'CF14', 'CF15', 'CF23'], center: { lat: 51.4816, lng: -3.1791 } },
    { name: 'Liverpool', areas: ['L1', 'L2', 'L3', 'L4', 'L5'], center: { lat: 53.4084, lng: -2.9916 } },
    { name: 'Newcastle', areas: ['NE1', 'NE2', 'NE3', 'NE4', 'NE5'], center: { lat: 54.9783, lng: -1.6178 } }
];

const features = [
    ['Autopilot', 'Lane Assist', 'Parking Assist', 'Backup Camera'],
    ['ProPilot', 'Highway Assist', '360° Camera', 'Blind Spot Detection'],
    ['Self Parking', 'Cruise Control', 'Emergency Braking', 'Lane Departure Warning'],
    ['Traffic Sign Recognition', 'Adaptive Cruise', 'Night Vision', 'Head-up Display']
];

function generateSampleCars(count) {
    const cars = [];
    for (let i = 1; i <= count; i++) {
        // Use ID as seed for consistent random generation
        const seed = i;
        
        // Deterministic selections based on ID
        const makeIndex = seed % carMakes.length;
        const makeData = carMakes[makeIndex];
        const modelIndex = Math.floor(seed / carMakes.length) % makeData.models.length;
        const model = makeData.models[modelIndex];
        
        // Deterministic city selection
        const cityIndex = Math.floor(seed / (carMakes.length * 4)) % cities.length;
        const city = cities[cityIndex];
        const areaIndex = seed % city.areas.length;
        const area = city.areas[areaIndex];
        
        // Deterministic coordinates (still within ~5km of city center)
        const latOffset = ((seed % 100) / 1000) - 0.05;
        const lngOffset = ((Math.floor(seed / 100) % 100) / 1000) - 0.05;
        const lat = city.center.lat + latOffset;
        const lng = city.center.lng + lngOffset;
        
        // Deterministic features
        const featureSetIndex = seed % features.length;
        const featureSet = features[featureSetIndex];
        const featureCount = (seed % 3) + 1;
        const carFeatures = [makeData.type, `${(seed % 2) + 4} Seats`]
            .concat(featureSet.slice(0, featureCount));
        
        // Deterministic price based on make and type
        const basePrice = makeData.make === 'Tesla' || makeData.make === 'Mercedes' ? 75 : 45;
        const priceVariation = seed % 30;
        const price = basePrice + priceVariation;
        
        // Deterministic rating and reviews
        const rating = (4 + (seed % 10) / 10).toFixed(1);
        const reviews = 50 + (seed % 150);
        
        const imagePath = `https://source.unsplash.com/400x300/?car,${makeData.make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`;
        
        cars.push({
            id: i,
            make: makeData.make,
            model: model,
            year: 2021 + (seed % 3),
            price: price,
            location: `${city.name}, UK`,
            postcode: area,
            areas: city.areas,
            coordinates: { lat, lng },
            image: imagePath,
            features: carFeatures,
            rating: parseFloat(rating),
            reviews: reviews
        });
    }
    return cars;
}

// Generate 500 sample cars
console.log('Starting to generate sample cars...');
const sampleCars = generateSampleCars(500);
console.log('Generated sample cars array:', sampleCars);
console.log('First car example:', sampleCars[0]);
console.log('Total cars generated:', sampleCars.length);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded in main.js');
    console.log('Sample cars available:', sampleCars.length);
    initializeApp();
});

if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
}

// Functions
function initializeApp() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll event listener for header
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 0) {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }
}

function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toUpperCase();
    
    // Find cars in the searched area
    const matchingCars = findCarsInArea(searchTerm);
    
    // Redirect to search results page with the matching cars
    const searchParams = new URLSearchParams();
    searchParams.set('location', searchTerm);
    searchParams.set('cars', JSON.stringify(matchingCars.map(car => car.id)));
    
    window.location.href = `search.html?${searchParams.toString()}`;
}

function findCarsInArea(postcode) {
    // Remove spaces and convert to uppercase for consistent comparison
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // First, try exact postcode match
    const exactMatches = sampleCars.filter(car => 
        car.postcode.replace(/\s+/g, '').toUpperCase() === cleanPostcode
    );
    
    if (exactMatches.length > 0) {
        return exactMatches;
    }
    
    // If no exact matches, try matching the outcode (first part of postcode)
    const outcode = cleanPostcode.split(' ')[0];
    return sampleCars.filter(car => 
        car.areas.some(area => area.replace(/\s+/g, '').toUpperCase().startsWith(outcode))
    );
}

// Utility functions
function formatPrice(price) {
    return `£${price}/day`;
}

function formatLocation(location) {
    return location.split(',')[0].trim();
}

// Mobile menu toggle (to be implemented)
function toggleMobileMenu() {
    const nav = document.querySelector('.nav__links');
    if (nav) {
        nav.classList.toggle('nav__links--active');
    }
}

// Export functions and data for use in other modules
console.log('Exporting from main.js:', { sampleCars, handleSearch, formatPrice, formatLocation, toggleMobileMenu, findCarsInArea });
export {
    sampleCars,
    handleSearch,
    formatPrice,
    formatLocation,
    toggleMobileMenu,
    findCarsInArea
}; 