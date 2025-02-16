// DOM Elements
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form__input');

// Sample car data (in a real app, this would come from an API)
const sampleCars = [
    {
        id: 1,
        make: 'Tesla',
        model: 'Model 3',
        year: 2022,
        price: 75,
        location: 'London, UK',
        image: '/assets/images/cars/tesla-model-3.jpg',
        features: ['Electric', 'Autopilot', '5 Seats'],
        rating: 4.9,
        reviews: 128
    },
    {
        id: 2,
        make: 'BMW',
        model: 'i3',
        year: 2021,
        price: 55,
        location: 'Manchester, UK',
        image: '/assets/images/cars/bmw-i3.jpg',
        features: ['Electric', 'Parking Assist', '4 Seats'],
        rating: 4.7,
        reviews: 89
    },
    {
        id: 3,
        make: 'Volkswagen',
        model: 'ID.4',
        year: 2022,
        price: 65,
        location: 'Birmingham, UK',
        image: '/assets/images/cars/vw-id4.jpg',
        features: ['Electric', 'Lane Assist', '5 Seats'],
        rating: 4.8,
        reviews: 94
    },
    {
        id: 4,
        make: 'Toyota',
        model: 'Prius',
        year: 2021,
        price: 45,
        location: 'Leeds, UK',
        image: '/assets/images/cars/toyota-prius.jpg',
        features: ['Hybrid', 'Backup Camera', '5 Seats'],
        rating: 4.6,
        reviews: 156
    },
    {
        id: 5,
        make: 'Nissan',
        model: 'Leaf',
        year: 2022,
        price: 50,
        location: 'Bristol, UK',
        image: '/assets/images/cars/nissan-leaf.jpg',
        features: ['Electric', 'ProPilot', '5 Seats'],
        rating: 4.7,
        reviews: 112
    },
    {
        id: 6,
        make: 'Hyundai',
        model: 'IONIQ 5',
        year: 2022,
        price: 70,
        location: 'Glasgow, UK',
        image: '/assets/images/cars/hyundai-ioniq5.jpg',
        features: ['Electric', 'Highway Assist', '5 Seats'],
        rating: 4.9,
        reviews: 76
    },
    {
        id: 7,
        make: 'Mini',
        model: 'Cooper SE',
        year: 2021,
        price: 60,
        location: 'Edinburgh, UK',
        image: '/assets/images/cars/mini-cooper-se.jpg',
        features: ['Electric', 'Parking Assist', '4 Seats'],
        rating: 4.8,
        reviews: 83
    },
    {
        id: 8,
        make: 'Kia',
        model: 'e-Niro',
        year: 2022,
        price: 55,
        location: 'Cardiff, UK',
        image: '/assets/images/cars/kia-eniro.jpg',
        features: ['Electric', 'Lane Keep Assist', '5 Seats'],
        rating: 4.7,
        reviews: 97
    }
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
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
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // In a real app, this would make an API call
    // For now, we'll just log the search term
    console.log('Searching for:', searchTerm);
    
    // Redirect to search results page (to be implemented)
    // window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
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

// Export functions for use in other modules
export {
    handleSearch,
    formatPrice,
    formatLocation,
    toggleMobileMenu
}; 