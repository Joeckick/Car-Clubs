# Car Clubs

A modern web application for finding and booking cars from local car clubs.

## Features

- Search for cars by location and postcode
- Filter cars by type (Electric, Hybrid, Petrol) and features
- View cars in both grid and map views
- Sort by price, rating, and distance
- Detailed car information with multiple images
- Club-based organization of cars
- Responsive design for all devices

## Project Structure

```
├── components/          # UI components
│   ├── CarGrid.js      # Grid view component
│   ├── MapView.js      # Map view component
│   └── Filters.js      # Filter controls component
├── services/           # Business logic services
│   ├── CarService.js   # Car data management
│   ├── FilterService.js # Filtering and sorting
│   ├── MapService.js   # Map functionality
│   └── ErrorService.js  # Error handling
├── state/              # State management
│   └── AppState.js     # Application state
├── data/               # Data layer
│   └── car-data.js     # Car data and constants
└── assets/            # Static assets
    ├── styles/        # CSS files
    └── images/        # Image assets
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/car-clubs.git
   ```

2. Open the project directory:
   ```bash
   cd car-clubs
   ```

3. Start a local server:
   ```bash
   python -m http.server 8000
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Development

The project uses a modular architecture with the following key components:

- **State Management**: Centralized state using the `AppState` class with a pub/sub pattern
- **Services**: Modular services for specific functionality (cars, filtering, mapping)
- **Components**: Reusable UI components with clear responsibilities
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Technologies Used

- Vanilla JavaScript (ES6+)
- Leaflet.js for mapping
- CSS Grid and Flexbox for layouts
- Unsplash API for car images

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 