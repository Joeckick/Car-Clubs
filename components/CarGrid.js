import { appState } from '../state/AppState.js';
import { errorService } from '../services/ErrorService.js';

export class CarGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }

        // Bind methods
        this.render = this.render.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.showAppPrompt = this.showAppPrompt.bind(this);

        // Subscribe to state changes
        appState.subscribe('filteredCars', this.handleStateChange);
        appState.subscribe('activeView', this.handleStateChange);
    }

    /**
     * Handle state changes
     * @param {import('../state/AppState').StateChangeEvent} event - State change event
     */
    handleStateChange(event) {
        if (event.key === 'activeView') {
            this.container.classList.toggle('active', event.value === 'grid');
        }
        if (event.key === 'filteredCars' || (event.key === 'activeView' && event.value === 'grid')) {
            this.render();
        }
    }

    /**
     * Render the car grid
     */
    render() {
        try {
            const { filteredCars } = appState.getState();
            
            // Clear existing content
            this.container.innerHTML = '';
            
            if (filteredCars.length === 0) {
                this.renderNoResults();
                return;
            }

            // Group cars by club
            const carsByClub = this.groupCarsByClub(filteredCars);
            
            // Render each club section
            Object.values(carsByClub).forEach(club => {
                const clubElement = this.createClubElement(club);
                this.container.appendChild(clubElement);
            });

        } catch (error) {
            errorService.handleError(error, {
                code: 'GRID_001',
                message: 'Error rendering car grid'
            });
        }
    }

    /**
     * Group cars by club
     * @param {import('../services/CarService').Car[]} cars - Cars to group
     * @returns {Object} Grouped cars
     * @private
     */
    groupCarsByClub(cars) {
        return cars.reduce((acc, car) => {
            const clubId = Math.floor(car.id / 5);
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
    }

    /**
     * Create club section element
     * @param {Object} club - Club data
     * @returns {HTMLElement} Club element
     * @private
     */
    createClubElement(club) {
        const element = document.createElement('div');
        element.className = 'club-section';
        
        element.innerHTML = `
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
                ${club.cars.map(car => this.createCarCard(car)).join('')}
            </div>
        `;

        return element;
    }

    /**
     * Create car card HTML
     * @param {import('../services/CarService').Car} car - Car data
     * @returns {string} Car card HTML
     * @private
     */
    createCarCard(car) {
        return `
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
                        <button class="btn btn--primary" onclick="carGrid.showAppPrompt()">Book Now</button>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render no results message
     * @private
     */
    renderNoResults() {
        this.container.innerHTML = `
            <div class="no-results">
                <h3>No car clubs found in your area</h3>
                <p>We're expanding our network! Leave your email to be notified when car clubs become available in your area.</p>
                <form class="notify-form" onsubmit="event.preventDefault(); carGrid.handleNotifySubmit(event);">
                    <input type="email" placeholder="Your email address" required>
                    <button type="submit" class="btn btn--primary">Notify Me</button>
                </form>
            </div>
        `;
    }

    /**
     * Show app download prompt
     */
    showAppPrompt() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                <h2>Download our app to book this car</h2>
                <p>Get the Car Clubs app for the best booking experience</p>
                <div class="app-buttons">
                    <a href="#" class="app-button">
                        <img src="assets/app-store.png" alt="Download on App Store">
                    </a>
                    <a href="#" class="app-button">
                        <img src="assets/play-store.png" alt="Get it on Google Play">
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.style.display = 'flex', 0);
    }

    /**
     * Handle notify form submission
     * @param {Event} event - Form submit event
     */
    handleNotifySubmit(event) {
        const email = event.target.querySelector('input[type="email"]').value;
        // In a real app, would send this to an API
        alert(`Thank you! We'll notify ${email} when cars become available.`);
    }

    /**
     * Clean up component
     */
    destroy() {
        appState.unsubscribe('filteredCars', this.handleStateChange);
        appState.unsubscribe('activeView', this.handleStateChange);
    }
}

// Make instance available globally for event handlers
window.carGrid = new CarGrid('car-results'); 