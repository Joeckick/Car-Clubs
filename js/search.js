import { sampleCars } from './main.js';

// DOM Elements
const carGrid = document.getElementById('car-results');
const sortSelect = document.getElementById('sort');
const resultsCount = document.getElementById('results-count');
const clearFiltersBtn = document.getElementById('clear-filters');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav__links');
const filters = document.querySelector('.filters');

// State
let filteredCars = [...sampleCars];
let activeFilters = {
    priceRange: [0, 200],
    types: [],
    features: []
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
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
    renderCars(filteredCars);
    updateResultsCount();
}

function renderCars(cars) {
    if (!carGrid) return;
    
    carGrid.innerHTML = '';
    const template = document.getElementById('car-card-template');

    cars.forEach(car => {
        const clone = template.content.cloneNode(true);
        
        // Set image
        const img = clone.querySelector('img');
        img.src = car.image;
        img.alt = `${car.make} ${car.model}`;

        // Set badge if electric
        const badge = clone.querySelector('.car-card__badge');
        if (car.features.includes('Electric')) {
            badge.textContent = '⚡ Electric';
        } else if (car.features.includes('Hybrid')) {
            badge.textContent = '🔋 Hybrid';
        } else {
            badge.remove();
        }

        // Set title
        clone.querySelector('h3').textContent = `${car.make} ${car.model} ${car.year}`;

        // Set rating
        clone.querySelector('.rating').textContent = `★ ${car.rating}`;
        clone.querySelector('.reviews').textContent = `(${car.reviews} reviews)`;

        // Set location
        clone.querySelector('.car-card__location').textContent = car.location;

        // Set features
        const featuresContainer = clone.querySelector('.car-card__features');
        car.features.forEach(feature => {
            const span = document.createElement('span');
            span.textContent = feature;
            featuresContainer.appendChild(span);
        });

        // Set price
        clone.querySelector('.amount').textContent = `£${car.price}`;

        carGrid.appendChild(clone);
    });
}

function handleSort(e) {
    const sortValue = e.target.value;
    
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
        case 'reviews':
            filteredCars.sort((a, b) => b.reviews - a.reviews);
            break;
    }

    renderCars(filteredCars);
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

// Export functions for use in other modules
export {
    renderCars,
    handleSort,
    handleFilterChange,
    clearFilters,
    toggleMobileMenu
}; 