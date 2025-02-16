/**
 * @typedef {Object} ErrorConfig
 * @property {string} message - User-friendly error message
 * @property {string} [code] - Error code for tracking
 * @property {boolean} [showToUser=true] - Whether to show error to user
 * @property {boolean} [isRecoverable=true] - Whether error is recoverable
 * @property {'error'|'warning'|'info'} [level='error'] - Error severity level
 */

class ErrorService {
    constructor() {
        this.listeners = new Set();
        this.errorMap = new Map([
            ['MAP_INIT_ERROR', {
                message: 'Failed to initialize map. Please refresh the page.',
                code: 'MAP_001',
                showToUser: true,
                isRecoverable: false,
                level: 'error'
            }],
            ['GEOLOCATION_ERROR', {
                message: 'Could not get your location. Distance-based features may be limited.',
                code: 'GEO_001',
                showToUser: true,
                isRecoverable: true,
                level: 'warning'
            }],
            ['FILTER_ERROR', {
                message: 'Error applying filters. Please try again.',
                code: 'FIL_001',
                showToUser: true,
                isRecoverable: true,
                level: 'error'
            }],
            ['NETWORK_ERROR', {
                message: 'Network connection issue. Please check your connection.',
                code: 'NET_001',
                showToUser: true,
                isRecoverable: true,
                level: 'error'
            }],
            ['IMAGE_LOAD_ERROR', {
                message: 'Failed to load some images. Using fallback images.',
                code: 'IMG_001',
                showToUser: false,
                isRecoverable: true,
                level: 'warning'
            }]
        ]);
    }

    /**
     * Handle an error
     * @param {Error|string} error - Error object or error key
     * @param {Partial<ErrorConfig>} [config] - Additional error configuration
     */
    handleError(error, config = {}) {
        let errorConfig;

        if (typeof error === 'string' && this.errorMap.has(error)) {
            // Known error type
            errorConfig = {
                ...this.errorMap.get(error),
                ...config
            };
        } else {
            // Unknown error
            errorConfig = {
                message: error instanceof Error ? error.message : String(error),
                code: 'UNK_001',
                showToUser: true,
                isRecoverable: true,
                level: 'error',
                ...config
            };
        }

        // Log error
        this.logError(errorConfig);

        // Notify listeners
        if (errorConfig.showToUser) {
            this.notifyListeners(errorConfig);
        }

        // Handle unrecoverable errors
        if (!errorConfig.isRecoverable) {
            this.handleUnrecoverableError(errorConfig);
        }
    }

    /**
     * Add error listener
     * @param {function(ErrorConfig): void} listener - Error listener callback
     */
    addListener(listener) {
        this.listeners.add(listener);
    }

    /**
     * Remove error listener
     * @param {function(ErrorConfig): void} listener - Error listener to remove
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * Log error to console and analytics
     * @param {ErrorConfig} errorConfig - Error configuration
     * @private
     */
    logError(errorConfig) {
        const { level, code, message } = errorConfig;
        
        // Log to console
        console[level](`[${code}] ${message}`);
        
        // In a real app, would also log to analytics/monitoring service
        // this.logToAnalytics(errorConfig);
    }

    /**
     * Notify all error listeners
     * @param {ErrorConfig} errorConfig - Error configuration
     * @private
     */
    notifyListeners(errorConfig) {
        this.listeners.forEach(listener => {
            try {
                listener(errorConfig);
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }

    /**
     * Handle unrecoverable errors
     * @param {ErrorConfig} errorConfig - Error configuration
     * @private
     */
    handleUnrecoverableError(errorConfig) {
        // Show error page or modal
        document.body.innerHTML = `
            <div class="error-page">
                <h1>Something went wrong</h1>
                <p>${errorConfig.message}</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }

    /**
     * Create an error boundary for async functions
     * @param {function(): Promise<any>} fn - Async function to wrap
     * @param {string} [errorKey] - Known error key
     * @returns {Promise<any>}
     */
    async errorBoundary(fn, errorKey) {
        try {
            return await fn();
        } catch (error) {
            this.handleError(errorKey || error);
            throw error;
        }
    }
}

// Export a singleton instance
export const errorService = new ErrorService(); 