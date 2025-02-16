console.log('Loading search.js...');

let renderCars, handleSort, handleFilterChange, clearFilters, toggleMobileMenu;

try {
    const { sampleCars, formatPrice, formatLocation } = await import('./main.js');
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

        // Initialize filtered cars based on URL parameters or use all cars
        if (carsParam) {
            try {
                const carIds = JSON.parse(carsParam);
                filteredCars = sampleCars.filter(car => carIds.includes(car.id));
            } catch (e) {
                console.error('Error parsing car IDs:', e);
                filteredCars = [...sampleCars];
            }
        } else {
            filteredCars = [...sampleCars];
        }
        
        console.log('Initial filtered cars:', filteredCars.length);
        
        // Update location display if provided
        if (locationParam && locationDisplay) {
            locationDisplay.textContent = `Cars in ${locationParam}`;
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
            // Initialize the map
            map = L.map(mapView, {
                center: [54.5, -2], // Center of UK
                zoom: 6
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Initialize markers layer group
            markers = L.layerGroup().addTo(map);
            
            console.log('Map initialized successfully');
            
            // If we're in map view, update markers
            if (activeView === 'map') {
                updateMapMarkers();
            }
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
                        <img src="${car.image}" alt="${car.make} ${car.model}">
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

    function renderCars(cars) {
        console.log('Rendering cars:', cars.length);
        if (!carGrid) {
            console.error('Car grid element not found!');
            return;
        }
        
        // Clear existing content
        carGrid.innerHTML = '';
        
        if (cars.length === 0) {
            console.log('No cars to display');
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <h3>No cars found</h3>
                <p>Try adjusting your filters or search criteria</p>
            `;
            carGrid.appendChild(noResults);
            return;
        }

        cars.forEach((car, index) => {
            console.log(`Rendering car ${index + 1}/${cars.length}:`, car.make, car.model);
            const carElement = document.createElement('article');
            carElement.className = 'car-card';
            
            carElement.innerHTML = `
                <div class="car-card__image">
                    <img src="${car.image}" alt="${car.make} ${car.model}" onerror="this.src='https://via.placeholder.com/300x200?text=Car+Image'">
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
                        <div class="car-card__location">${car.location}</div>
                        <div class="car-card__features">
                            ${car.features.map(feature => `<span>${feature}</span>`).join('')}
                        </div>
                    </div>
                    <div class="car-card__footer">
                        <div class="car-card__price">
                            <span class="amount">£${car.price}</span>
                            <span class="period">per day</span>
                        </div>
                        <button class="btn btn--primary" onclick="window.location.href='car-detail.html?id=${car.id}'">View Details</button>
                    </div>
                </div>
            `;
            
            carGrid.appendChild(carElement);
        });
        
        console.log('Finished rendering cars');
    }

    function handleFilterChange(e) {
        const { name, value, checked } = e.target;
        
        if (name === 'type') {
            if (checked) {
                activeFilters.types.push(value);
            } else {
                activeFilters.types = activeFilters.types.filter(type => type !== value);
            }
        } else if (name === 'features') {
            if (checked) {
                activeFilters.features.push(value);
            } else {
                activeFilters.features = activeFilters.features.filter(feature => feature !== value);
            }
        }

        applyFilters();
    }

    function handlePriceRangeChange(e) {
        const value = parseInt(e.target.value);
        document.getElementById('max-price').value = value;
        activeFilters.priceRange[1] = value;
        applyFilters();
    }

    function applyFilters() {
        filteredCars = sampleCars.filter(car => {
            // Price filter
            if (car.price < activeFilters.priceRange[0] || car.price > activeFilters.priceRange[1]) {
                return false;
            }

            // Type filter
            if (activeFilters.types.length > 0) {
                const carType = car.features.find(f => ['Electric', 'Hybrid', 'Petrol'].includes(f));
                if (!activeFilters.types.includes(carType?.toLowerCase())) {
                    return false;
                }
            }

            // Features filter
            if (activeFilters.features.length > 0) {
                return activeFilters.features.every(feature => 
                    car.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
                );
            }

            return true;
        });

        renderCars(filteredCars);
        updateResultsCount();
    }

    function clearFilters() {
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset price range
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.value = 200;
        }
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';

        // Reset state
        activeFilters = {
            priceRange: [0, 200],
            types: [],
            features: []
        };

        filteredCars = [...sampleCars];
        renderCars(filteredCars);
        updateResultsCount();
    }

    function updateResultsCount() {
        if (resultsCount) {
            resultsCount.textContent = `${filteredCars.length} cars found`;
        }
    }

    function toggleMobileMenu() {
        navLinks?.classList.toggle('active');
        filters?.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = mobileMenuToggle?.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = spans[0].style.transform ? '' : 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = spans[1].style.opacity ? '' : '0';
            spans[2].style.transform = spans[2].style.transform ? '' : 'rotate(-45deg) translate(5px, -5px)';
        }
    }

    // Assign the functions
    renderCars = function(cars) {
        console.log('Rendering cars:', cars.length);
        if (!carGrid) {
            console.error('Car grid element not found!');
            return;
        }
        
        // Clear existing content
        carGrid.innerHTML = '';
        
        if (cars.length === 0) {
            console.log('No cars to display');
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <h3>No cars found</h3>
                <p>Try adjusting your filters or search criteria</p>
            `;
            carGrid.appendChild(noResults);
            return;
        }

        cars.forEach((car, index) => {
            console.log(`Rendering car ${index + 1}/${cars.length}:`, car.make, car.model);
            const carElement = document.createElement('article');
            carElement.className = 'car-card';
            
            carElement.innerHTML = `
                <div class="car-card__image">
                    <img src="${car.image}" alt="${car.make} ${car.model}" onerror="this.src='https://via.placeholder.com/300x200?text=Car+Image'">
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
                        <div class="car-card__location">${car.location}</div>
                        <div class="car-card__features">
                            ${car.features.map(feature => `<span>${feature}</span>`).join('')}
                        </div>
                    </div>
                    <div class="car-card__footer">
                        <div class="car-card__price">
                            <span class="amount">£${car.price}</span>
                            <span class="period">per day</span>
                        </div>
                        <button class="btn btn--primary" onclick="window.location.href='car-detail.html?id=${car.id}'">View Details</button>
                    </div>
                </div>
            `;
            
            carGrid.appendChild(carElement);
        });
        
        console.log('Finished rendering cars');
    };
    handleSort = function() {
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
    };
    handleFilterChange = function(e) {
        const { name, value, checked } = e.target;
        
        if (name === 'type') {
            if (checked) {
                activeFilters.types.push(value);
            } else {
                activeFilters.types = activeFilters.types.filter(type => type !== value);
            }
        } else if (name === 'features') {
            if (checked) {
                activeFilters.features.push(value);
            } else {
                activeFilters.features = activeFilters.features.filter(feature => feature !== value);
            }
        }

        applyFilters();
    };
    clearFilters = function() {
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset price range
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.value = 200;
        }
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';

        // Reset state
        activeFilters = {
            priceRange: [0, 200],
            types: [],
            features: []
        };

        filteredCars = [...sampleCars];
        renderCars(filteredCars);
        updateResultsCount();
    };
    toggleMobileMenu = function() {
        navLinks?.classList.toggle('active');
        filters?.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = mobileMenuToggle?.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = spans[0].style.transform ? '' : 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = spans[1].style.opacity ? '' : '0';
            spans[2].style.transform = spans[2].style.transform ? '' : 'rotate(-45deg) translate(5px, -5px)';
        }
    };
} catch (error) {
    console.error('Error loading search.js:', error);
}

// Export functions for use in other modules
export {
    renderCars,
    handleSort,
    handleFilterChange,
    clearFilters,
    toggleMobileMenu
}; 