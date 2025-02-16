console.log('Loading search.js...');

// Import dependencies
import { sampleCars, formatPrice, formatLocation } from './main.js';
console.log('Successfully imported from main.js:', { sampleCarsCount: sampleCars?.length });

// DOM Elements
console.log('Getting DOM elements...');
const carGrid = document.getElementById('car-results');
console.log('carGrid element:', carGrid);
const mapView = document.getElementById('map-view');
const sortSelect = document.getElementById('sort');
const resultsCount = document.getElementById('results-count');
const viewToggleButtons = document.querySelectorAll('.view-toggle button');
const clearFiltersBtn = document.getElementById('clear-filters');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav__links');
const filters = document.querySelector('.filters');
const locationDisplay = document.querySelector('.results__count h2');

// State
let map = null;
let markers = null;
let userLocation = null;
let activeView = 'grid';
let filteredCars = [];
let activeFilters = {
    priceRange: [0, 200],
    types: [],
    features: []
};

// Functions
function clearFilters() {
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset active filters
    activeFilters = {
        priceRange: [
            Math.min(...sampleCars.map(car => car.price)),
            Math.max(...sampleCars.map(car => car.price))
        ],
        types: [],
        features: []
    };
    
    // Reset price range inputs
    const priceRangeInput = document.getElementById('price-range');
    const maxPriceInput = document.getElementById('max-price');
    const minPriceInput = document.getElementById('min-price');
    
    if (priceRangeInput && maxPriceInput && minPriceInput) {
        const maxPrice = Math.max(...sampleCars.map(car => car.price));
        const minPrice = Math.min(...sampleCars.map(car => car.price));
        
        priceRangeInput.value = maxPrice;
        maxPriceInput.value = maxPrice;
        minPriceInput.value = minPrice;
    }
    
    // Reset to show all cars
    filteredCars = [...sampleCars];
    
    // Update display
    renderCars(filteredCars);
    if (activeView === 'map') {
        updateMapMarkers();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded in search.js');
    console.log('Starting initialization...');
    initializeSearch();
    console.log('Search initialized');
});

viewToggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const view = button.dataset.view;
        setActiveView(view);
    });
});

if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Filter event listeners
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
});

document.getElementById('price-range')?.addEventListener('input', handlePriceRangeChange);

// Functions
function initializeSearch() {
    console.log('Initializing search...');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    const carsParam = urlParams.get('cars');
    
    if (!sampleCars || sampleCars.length === 0) {
        console.error('No sample cars available!');
        return;
    }
    
    if (!carGrid) {
        console.error('Car grid element not found!');
        return;
    }

    // Initialize filtered cars - show all cars by default
    filteredCars = [...sampleCars];
    
    // Update location display
    if (locationDisplay) {
        if (locationParam) {
            locationDisplay.textContent = `Cars in ${locationParam}`;
            // If location is specified, filter cars
            if (carsParam) {
                try {
                    const carIds = JSON.parse(carsParam);
                    filteredCars = sampleCars.filter(car => carIds.includes(car.id));
                } catch (e) {
                    console.error('Error parsing car IDs:', e);
                }
            }
        } else {
            locationDisplay.textContent = 'All available cars';
        }
    }
    
    console.log('Initial filtered cars:', filteredCars.length);
    
    // Adjust price range based on available cars
    if (filteredCars.length > 0) {
        const maxPrice = Math.max(...filteredCars.map(car => car.price));
        const minPrice = Math.min(...filteredCars.map(car => car.price));
        const priceRangeInput = document.getElementById('price-range');
        const maxPriceInput = document.getElementById('max-price');
        const minPriceInput = document.getElementById('min-price');
        
        if (priceRangeInput && maxPrice > priceRangeInput.max) {
            priceRangeInput.max = maxPrice;
            priceRangeInput.value = maxPrice;
            if (maxPriceInput) {
                maxPriceInput.value = maxPrice;
            }
            activeFilters.priceRange[1] = maxPrice;
        }

        // Set minimum price
        if (minPriceInput) {
            minPriceInput.value = minPrice;
            activeFilters.priceRange[0] = minPrice;
        }
    }
    
    // Render cars first
    renderCars(filteredCars);
    updateResultsCount();
    
    // Initialize map
    initializeMap();
    
    // Get user location
    getUserLocation();
}

function initializeMap() {
    console.log('Initializing map...');
    if (!mapView) {
        console.error('Map view element not found!');
        return;
    }

    try {
        // Set explicit height and ensure the container is visible
        mapView.style.height = '600px';
        mapView.style.display = 'block';
        
        // Initialize the map with specific options
        map = L.map(mapView, {
            center: [54.5, -2], // Center of UK
            zoom: 6,
            scrollWheelZoom: true,
            zoomControl: true
        });

        // Add tile layer with proper attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 3
        }).addTo(map);

        // Initialize markers layer group
        markers = L.layerGroup().addTo(map);
        
        console.log('Map initialized successfully');
        
        // Force a resize after a short delay to ensure proper rendering
        setTimeout(() => {
            map.invalidateSize();
            // If we're in map view, update markers
            if (activeView === 'map') {
                updateMapMarkers();
            }
        }, 250);
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // If distance sorting is selected, re-sort the results
                if (sortSelect.value === 'distance') {
                    handleSort();
                }
            },
            (error) => {
                console.error('Error getting user location:', error);
            }
        );
    }
}

function setActiveView(view) {
    console.log('Setting active view:', view);
    activeView = view;
    
    // Update buttons
    viewToggleButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
    });
    
    // Update view containers
    if (carGrid) carGrid.classList.toggle('active', view === 'grid');
    if (mapView) mapView.classList.toggle('active', view === 'map');
    
    if (view === 'map' && map) {
        // Small delay to ensure the map container is visible
        setTimeout(() => {
            map.invalidateSize();
            updateMapMarkers();
        }, 100);
    }
}

function updateMapMarkers() {
    console.log('Updating map markers...');
    if (!map || !markers) {
        console.error('Map or markers not initialized');
        return;
    }

    try {
        // Clear existing markers
        markers.clearLayers();
        
        // Add markers for filtered cars
        const markerBounds = [];
        
        filteredCars.forEach(car => {
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
            
            markers.addLayer(marker);
            markerBounds.push([car.coordinates.lat, car.coordinates.lng]);
        });
        
        // Fit map to bounds if we have markers
        if (markerBounds.length > 0) {
            map.fitBounds(markerBounds);
        }
        
        console.log('Map markers updated successfully');
    } catch (error) {
        console.error('Error updating map markers:', error);
    }
}

function calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function handleSort() {
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'price-asc':
            filteredCars.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredCars.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredCars.sort((a, b) => b.rating - a.rating);
            break;
        case 'distance':
            if (userLocation) {
                filteredCars.sort((a, b) => {
                    const distA = calculateDistance(userLocation, a.coordinates);
                    const distB = calculateDistance(userLocation, b.coordinates);
                    return distA - distB;
                });
            } else {
                alert('Please enable location services to sort by distance');
                sortSelect.value = 'price-asc';
                filteredCars.sort((a, b) => a.price - b.price);
            }
            break;
    }
    
    renderCars(filteredCars);
    if (activeView === 'map') {
        updateMapMarkers();
    }
}

function getUniqueMakesAndModels(cars) {
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

function updateResultsCount() {
    if (!resultsCount) return;
    
    const { makeCount, modelCount } = getUniqueMakesAndModels(sampleCars);
    const currentCount = filteredCars.length;
    
    resultsCount.innerHTML = `
        ${currentCount} cars available
        <span class="results-detail">
            (${makeCount} makes, ${modelCount} unique models)
        </span>
    `;
}

function renderCars(cars) {
    console.log('Rendering cars:', cars.length);
    if (!carGrid) {
        console.error('Car grid element not found!');
        return;
    }
    
    // Clear existing content
    carGrid.innerHTML = '';
    
    // Update results count with makes and models
    updateResultsCount();
    
    if (cars.length === 0) {
        console.log('No cars to display');
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <h3>No car clubs found in your area</h3>
            <p>We're expanding our network! Leave your email to be notified when car clubs become available in your area.</p>
            <form class="notify-form">
                <input type="email" placeholder="Your email address" required>
                <button type="submit" class="btn btn--primary">Notify Me</button>
            </form>
        `;
        carGrid.appendChild(noResults);
        return;
    }

    // Group cars by owner/club
    const carsByClub = cars.reduce((acc, car) => {
        const clubId = Math.floor(car.id / 5); // Group every 5 cars as a club
        if (!acc[clubId]) {
            acc[clubId] = {
                name: `Car Club ${clubId}`,
                location: car.location,
                rating: (4 + (clubId % 10) / 10).toFixed(1),
                reviews: 10 + (clubId % 90),
                cars: []
            };
        }
        acc[clubId].cars.push(car);
        return acc;
    }, {});

    Object.values(carsByClub).forEach(club => {
        const clubElement = document.createElement('div');
        clubElement.className = 'club-section';
        
        clubElement.innerHTML = `
            <div class="club-header">
                <div class="club-info">
                    <h2>${club.name}</h2>
                    <div class="club-rating">
                        <span class="rating">★ ${club.rating}</span>
                        <span class="reviews">(${club.reviews} club reviews)</span>
                    </div>
                    <p class="club-location">${club.location}</p>
                </div>
            </div>
            <div class="club-cars">
                ${club.cars.map(car => `
                    <article class="car-card">
                        <div class="car-card__image">
                            <img src="${car.images[0]}" 
                                 alt="${car.make} ${car.model}"
                                 onerror="this.src='${car.fallbackImage}'">
                            ${car.features.includes('Electric') 
                                ? '<div class="car-card__badge">⚡ Electric</div>' 
                                : car.features.includes('Hybrid')
                                    ? '<div class="car-card__badge">🔋 Hybrid</div>'
                                    : ''}
                        </div>
                        <div class="car-card__content">
                            <div>
                                <div class="car-card__header">
                                    <h3>${car.make} ${car.model} ${car.year}</h3>
                                    <div class="car-card__rating">
                                        <span class="rating">★ ${car.rating}</span>
                                        <span class="reviews">(${car.reviews} reviews)</span>
                                    </div>
                                </div>
                                <div class="car-card__availability">
                                    Available: ${Math.random() > 0.3 ? 'Now' : 'From tomorrow'}
                                </div>
                                <div class="car-card__features">
                                    ${car.features.map(feature => `<span>${feature}</span>`).join('')}
                                </div>
                            </div>
                            <div class="car-card__footer">
                                <div class="car-card__price">
                                    <span class="amount">£${car.price}</span>
                                    <span class="period">per day</span>
                                    <span class="insurance-note">Insurance included</span>
                                </div>
                                <button class="btn btn--primary" onclick="showAppPrompt()">Book Now</button>
                            </div>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
        carGrid.appendChild(clubElement);
    });
}

function handleFilterChange(e) {
    const checkbox = e.target;
    const filterType = checkbox.name; // 'type' or 'features'
    const value = checkbox.value;
    
    if (checkbox.checked) {
        activeFilters[filterType + 's'].push(value);
    } else {
        activeFilters[filterType + 's'] = activeFilters[filterType + 's']
            .filter(item => item !== value);
    }
    
    // Apply filters
    filteredCars = sampleCars.filter(car => {
        // Check type filters
        if (activeFilters.types.length > 0) {
            const carType = car.features.find(f => ['Electric', 'Hybrid', 'Petrol'].includes(f));
            if (!activeFilters.types.includes(carType?.toLowerCase())) {
                return false;
            }
        }
        
        // Check feature filters
        if (activeFilters.features.length > 0) {
            const hasAllFeatures = activeFilters.features.every(feature =>
                car.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
            );
            if (!hasAllFeatures) {
                return false;
            }
        }
        
        // Check price range
        const price = car.price;
        return price >= activeFilters.priceRange[0] && price <= activeFilters.priceRange[1];
    });
    
    // Update display
    renderCars(filteredCars);
    if (activeView === 'map') {
        updateMapMarkers();
    }
}

function handlePriceRangeChange(e) {
    const value = parseInt(e.target.value);
    const isMaxPrice = e.target.id === 'max-price' || e.target.id === 'price-range';
    
    if (isMaxPrice) {
        activeFilters.priceRange[1] = value;
        // Update both range slider and max price input
        const maxPriceInput = document.getElementById('max-price');
        const priceRangeInput = document.getElementById('price-range');
        if (maxPriceInput) maxPriceInput.value = value;
        if (priceRangeInput) priceRangeInput.value = value;
    } else {
        activeFilters.priceRange[0] = value;
        // Update min price input
        const minPriceInput = document.getElementById('min-price');
        if (minPriceInput) minPriceInput.value = value;
    }
    
    // Apply price filter
    filteredCars = sampleCars.filter(car => {
        const price = car.price;
        return price >= activeFilters.priceRange[0] && price <= activeFilters.priceRange[1];
    });
    
    // Update display
    renderCars(filteredCars);
    if (activeView === 'map') {
        updateMapMarkers();
    }
}