// DOM Elements
const galleryThumbs = document.querySelectorAll('.gallery__thumb');
const mainImage = document.querySelector('.gallery__image');
const bookingForm = document.querySelector('.booking-form');
const pickupDate = document.getElementById('pickup-date');
const returnDate = document.getElementById('return-date');
const totalPrice = document.querySelector('.total span:last-child');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav__links');

// Constants
const DAILY_RATE = 75;
const MIN_RENTAL_HOURS = 1;
const MAX_RENTAL_DAYS = 30;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
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
    const newSrc = thumb.querySelector('img').src;
    
    // Update main image
    if (mainImage) {
        mainImage.src = newSrc;
    }
    
    // Update active state
    galleryThumbs.forEach(t => t.classList.remove('active'));
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