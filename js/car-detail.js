import { sampleCars } from './main.js';

// DOM Elements
const galleryThumbs = document.querySelectorAll('.gallery__thumb');
const mainImage = document.querySelector('.gallery__image');
const bookingForm = document.querySelector('.booking-form');
const pickupDate = document.getElementById('pickup-date');
const returnDate = document.getElementById('return-date');
const totalPrice = document.querySelector('.total span:last-child');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav__links');

// Additional DOM Elements for car details
const pageTitle = document.querySelector('title');
const carTitle = document.querySelector('.car-detail__header h1');
const carRating = document.querySelector('.car-detail__rating .rating');
const carReviews = document.querySelector('.car-detail__rating .reviews');
const carLocation = document.querySelector('.car-detail__location');
const carPrice = document.querySelector('.car-detail__price .amount');
const carFeatures = document.querySelector('.features-grid');
const carDescription = document.querySelector('.car-detail__description p');
const dailyRate = document.querySelector('.summary-item:first-child span:last-child');
const badge = document.querySelector('.gallery__badge');

// Constants
let DAILY_RATE = 75;
const MIN_RENTAL_HOURS = 1;
const MAX_RENTAL_DAYS = 30;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCarDetails();
    initializeCarDetail();
});

if (galleryThumbs) {
    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', handleGalleryClick);
    });
}

if (bookingForm) {
    bookingForm.addEventListener('submit', handleBooking);
}

if (pickupDate && returnDate) {
    pickupDate.addEventListener('change', updateBookingSummary);
    returnDate.addEventListener('change', updateBookingSummary);
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Functions
function loadCarDetails() {
    // Get car ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const carId = parseInt(urlParams.get('id'));
    
    // Find car in sample data
    const car = sampleCars.find(c => c.id === carId);
    
    // If no car found, redirect to search page
    if (!car) {
        window.location.href = 'search.html';
        return;
    }
    
    // Update page title
    pageTitle.textContent = `${car.make} ${car.model} - Car Clubs`;
    
    // Update car details
    carTitle.textContent = `${car.make} ${car.model} ${car.year}`;
    carRating.textContent = `★ ${car.rating}`;
    carReviews.textContent = `(${car.reviews} reviews)`;
    carLocation.textContent = car.location;
    carPrice.textContent = `£${car.price}`;
    DAILY_RATE = car.price;
    dailyRate.textContent = `£${car.price}`;
    
    // Update main image and gallery
    mainImage.src = car.images[0];
    mainImage.alt = `${car.make} ${car.model}`;
    mainImage.onerror = () => {
        mainImage.src = car.fallbackImage;
    };
    
    // Update gallery thumbs
    const galleryThumbsContainer = document.querySelector('.gallery__thumbs');
    if (galleryThumbsContainer) {
        galleryThumbsContainer.innerHTML = car.images.map((image, index) => `
            <button class="gallery__thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${image}" 
                     alt="${car.make} ${car.model} - View ${index + 1}"
                     onerror="this.src='${car.fallbackImage}'">
            </button>
        `).join('');
        
        // Reattach event listeners to new thumbs
        document.querySelectorAll('.gallery__thumb').forEach(thumb => {
            thumb.addEventListener('click', handleGalleryClick);
        });
    }
    
    // Update features
    carFeatures.innerHTML = car.features.map(feature => `
        <div class="feature">
            <span class="feature__icon">${getFeatureIcon(feature)}</span>
            <span class="feature__name">${feature}</span>
        </div>
    `).join('');
    
    // Update description
    carDescription.textContent = generateDescription(car);
    
    // Update badge
    if (car.features.includes('Electric')) {
        badge.textContent = '⚡ Electric';
        badge.style.display = 'block';
    } else if (car.features.includes('Hybrid')) {
        badge.textContent = '🔋 Hybrid';
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
    
    // Update review section
    updateReviewSection(car);
}

function getFeatureIcon(feature) {
    const iconMap = {
        'Electric': '⚡',
        'Hybrid': '🔋',
        'Autopilot': '🚗',
        'Lane Assist': '🛣️',
        'Parking Assist': '🅿️',
        'Backup Camera': '📸',
        'ProPilot': '🤖',
        'Highway Assist': '🛣️',
        '360° Camera': '🎥',
        'Blind Spot Detection': '👁️',
        'Self Parking': '🅿️',
        'Cruise Control': '⚡',
        'Emergency Braking': '🛑',
        'Lane Departure Warning': '⚠️',
        'Traffic Sign Recognition': '🚸',
        'Adaptive Cruise': '🚗',
        'Night Vision': '🌙',
        'Head-up Display': '📺'
    };
    
    if (feature.includes('Seats')) return '👥';
    return iconMap[feature] || '✨';
}

function generateDescription(car) {
    const descriptions = {
        'Electric': `Experience the future of driving with this ${car.make} ${car.model}. This all-electric vehicle comes with ${car.features.join(', ')}, making your journey safer and more comfortable.`,
        'Hybrid': `Drive efficiently with this ${car.make} ${car.model}. This hybrid vehicle combines the best of both worlds with features like ${car.features.join(', ')}.`,
        'default': `Experience the excellence of this ${car.make} ${car.model}. Equipped with ${car.features.join(', ')}, this car offers both comfort and performance.`
    };
    
    const type = car.features.find(f => ['Electric', 'Hybrid'].includes(f)) || 'default';
    return descriptions[type];
}

function updateReviewSection(car) {
    const ratingLarge = document.querySelector('.rating-large');
    const ratingCount = document.querySelector('.rating-count');
    
    if (ratingLarge) ratingLarge.textContent = car.rating;
    if (ratingCount) ratingCount.textContent = `${car.reviews} reviews`;
}

function initializeCarDetail() {
    // Set minimum dates for booking
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (pickupDate && returnDate) {
        pickupDate.min = formatDateTime(now);
        returnDate.min = formatDateTime(tomorrow);
    }
}

function handleGalleryClick(e) {
    const thumb = e.currentTarget;
    const img = thumb.querySelector('img');
    const newSrc = img.src;
    
    // Update main image
    if (mainImage) {
        mainImage.src = newSrc;
    }
    
    // Update active state
    document.querySelectorAll('.gallery__thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

function handleBooking(e) {
    e.preventDefault();
    
    const pickup = new Date(pickupDate.value);
    const returnD = new Date(returnDate.value);
    
    // Validate dates
    if (!validateDates(pickup, returnD)) {
        return;
    }
    
    // Calculate total price
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
    const total = totalDays * DAILY_RATE;
    
    // In a real app, this would make an API call to create the booking
    console.log('Booking details:', {
        pickup: pickup,
        return: returnD,
        totalDays,
        total
    });
    
    // Show success message (in a real app, would wait for API response)
    showBookingConfirmation(total, pickup, returnD);
}

function updateBookingSummary() {
    if (!pickupDate.value || !returnDate.value) return;
    
    const pickup = new Date(pickupDate.value);
    const returnD = new Date(returnDate.value);
    
    if (validateDates(pickup, returnD)) {
        const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
        const total = totalDays * DAILY_RATE;
        totalPrice.textContent = `£${total}`;
    }
}

function validateDates(pickup, returnD) {
    const now = new Date();
    const diffHours = (returnD - pickup) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    if (pickup < now) {
        showError(pickupDate, 'Pickup date cannot be in the past');
        return false;
    }
    
    if (returnD <= pickup) {
        showError(returnDate, 'Return date must be after pickup date');
        return false;
    }
    
    if (diffHours < MIN_RENTAL_HOURS) {
        showError(returnDate, `Minimum rental duration is ${MIN_RENTAL_HOURS} hour${MIN_RENTAL_HOURS > 1 ? 's' : ''}`);
        return false;
    }
    
    if (diffDays > MAX_RENTAL_DAYS) {
        showError(returnDate, `Maximum rental duration is ${MAX_RENTAL_DAYS} days`);
        return false;
    }
    
    return true;
}

function showError(input, message) {
    removeErrors();
    
    input.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    input.parentElement.appendChild(errorElement);
}

function removeErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function formatDateTime(date) {
    return date.toISOString().slice(0, 16);
}

function showBookingConfirmation(total, pickup, returnD) {
    const message = `
        <div class="booking-confirmation">
            <h3>Booking Confirmed!</h3>
            <p>Total: £${total}</p>
            <p>Pickup: ${pickup.toLocaleString()}</p>
            <p>Return: ${returnD.toLocaleString()}</p>
        </div>
    `;
    
    // In a real app, this would be a proper modal or notification system
    alert('Booking confirmed! Check console for details.');
}

function toggleMobileMenu() {
    navLinks?.classList.toggle('active');
    
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
    handleGalleryClick,
    handleBooking,
    updateBookingSummary,
    toggleMobileMenu
}; 