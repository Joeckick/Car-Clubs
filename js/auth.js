// DOM Elements
const signinForm = document.getElementById('signin-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordToggle = document.querySelector('.password-toggle');

// Event Listeners
if (signinForm) {
    signinForm.addEventListener('submit', handleSignin);
}

if (passwordToggle) {
    passwordToggle.addEventListener('click', togglePasswordVisibility);
}

// Functions
async function handleSignin(e) {
    e.preventDefault();
    
    const submitButton = signinForm.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Reset previous errors
    removeErrors();

    // Validate inputs
    if (!isValidEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        return;
    }

    if (password.length < 8) {
        showError(passwordInput, 'Password must be at least 8 characters');
        return;
    }

    // Show loading state
    submitButton.classList.add('btn--loading');
    submitButton.disabled = true;

    try {
        // In a real app, this would be an API call
        await mockSigninRequest(email, password);
        
        // Redirect to dashboard on success
        window.location.href = '/dashboard';
    } catch (error) {
        showError(passwordInput, error.message);
    } finally {
        submitButton.classList.remove('btn--loading');
        submitButton.disabled = false;
    }
}

function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    // Update icon (in a real app, use proper icons)
    const icon = passwordToggle.querySelector('.eye-icon');
    icon.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

function showError(input, message) {
    input.classList.add('error');
    
    // Remove any existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    input.parentElement.appendChild(errorElement);
}

function removeErrors() {
    // Remove all error states and messages
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
        const errorMessage = input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mock API call
function mockSigninRequest(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate API validation
            if (email === 'test@example.com' && password === 'password123') {
                resolve({ success: true });
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

// Export functions for use in other modules
export {
    handleSignin,
    togglePasswordVisibility,
    showError,
    removeErrors,
    isValidEmail
}; 