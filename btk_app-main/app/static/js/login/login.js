/**
 * Main Login Application
 * Handles overall login functionality and component initialization
 */

class LoginApp {
    constructor() {
        this.isInitialized = false;
        this.currentState = 'idle';
        this.formData = {
            username: '',
            password: '',
            rememberMe: false
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('🐱 Login App Initializing...');
        
        // Initialize components
        this.initializeComponents();
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('🐱 Login App Ready!');
    }
    
    initializeComponents() {
        // Initialize header animations
        if (window.LoginHeader) {
            this.loginHeader = new LoginHeader();
        }
        
        // Initialize form handling
        if (window.LoginForm) {
            this.loginForm = new LoginForm();
        }
    }
    
    setupEventListeners() {
        // Form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Input focus events
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => this.handleInputFocus(input));
            input.addEventListener('blur', () => this.handleInputBlur(input));
            input.addEventListener('input', () => this.handleInputChange(input));
        });
        
        // Button interactions
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => this.handleButtonHover(button));
            button.addEventListener('mouseleave', () => this.handleButtonLeave(button));
            button.addEventListener('click', () => this.handleButtonClick(button));
        });
        
        // Checkbox interactions
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            console.log('🐱 Found checkbox:', checkbox.id);
            checkbox.addEventListener('change', () => this.handleCheckboxChange(checkbox));
            checkbox.addEventListener('click', () => console.log('🐱 Checkbox clicked:', checkbox.checked));
        });
        
        // Mouse tracking for cat eyes
        this.setupMouseTracking();
        
        // Page load animation
        window.addEventListener('load', () => this.handlePageLoad());
    }
    
    handlePageLoad() {
        console.log('🐱 Login page loaded');
        
        // Add fade-in animation to main elements
        const elements = document.querySelectorAll('.login-form-container, .welcome-message');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
        
        // Page loaded successfully
        console.log('🐱 Login page loaded successfully');
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        console.log('🐱 Form submission started');
        
        // Get form data
        const formData = new FormData(e.target);
        this.formData = {
            username: formData.get('username') || '',
            password: formData.get('password') || '',
            rememberMe: formData.get('rememberMe') === 'on'
        };
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        // Send login request to server
        this.sendLoginRequest();
    }
    
    validateForm() {
        const { username, password } = this.formData;
        
        if (!username.trim()) {
            this.showError('Kullanıcı adı gereklidir');
            return false;
        }
        
        if (!password.trim()) {
            this.showError('Şifre gereklidir');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('Şifre en az 6 karakter olmalıdır');
            return false;
        }
        
        return true;
    }
    
    async sendLoginRequest() {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.formData.username,
                    password: this.formData.password,
                    rememberMe: this.formData.rememberMe
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                this.handleLoginSuccess(result);
            } else {
                this.handleLoginError(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('🐱 Login request failed:', error);
            this.handleLoginError('Network error occurred');
        }
    }
    
    handleLoginSuccess(result) {
        console.log('🐱 Login successful:', result);
        
        // Show success message
        this.showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Reset loading state
        this.setLoadingState(false);
        
        // Redirect after delay
        setTimeout(() => {
            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                window.location.href = '/';
            }
        }, 1500);
    }
    
    handleLoginError(message) {
        console.log('🐱 Login failed:', message);
        
        // Show error message
        this.showError(message || 'Kullanıcı adı veya şifre hatalı');
        
        // Reset loading state
        this.setLoadingState(false);
    }
    
    handleInputFocus(input) {
        console.log('🐱 Input focused:', input.name);
    }
    
    handleInputBlur(input) {
        console.log('🐱 Input blurred:', input.name);
    }
    
    handleInputChange(input) {
        console.log('🐱 Input changed:', input.name, input.value);
        
        // Update form data
        this.formData[input.name] = input.value;
    }
    
    handleButtonHover(button) {
        console.log('🐱 Button hovered:', button.textContent);
    }
    
    handleButtonLeave(button) {
        console.log('🐱 Button left:', button.textContent);
    }
    
    handleButtonClick(button) {
        console.log('🐱 Button clicked:', button.textContent);
    }
    
    handleCheckboxChange(checkbox) {
        console.log('🐱 Checkbox changed:', checkbox.name, checkbox.checked);
        
        this.formData[checkbox.name] = checkbox.checked;
        
        // Add visual feedback
        const checkmark = checkbox.nextElementSibling;
        if (checkmark) {
            if (checkbox.checked) {
                checkmark.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    checkmark.style.transform = 'scale(1)';
                }, 150);
            } else {
                checkmark.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    checkmark.style.transform = 'scale(1)';
                }, 150);
            }
        }
    }
    
    setLoadingState(isLoading) {
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');
        
        if (isLoading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    }
    
    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    setupMouseTracking() {
        const catContainer = document.querySelector('.mouse-tracking-cat-container');
        const leftPupil = document.querySelector('.tracking-pupil-left');
        const rightPupil = document.querySelector('.tracking-pupil-right');
        const cat = document.querySelector('.mouse-tracking-cat');
        
        if (!catContainer || !leftPupil || !rightPupil || !cat) {
            console.log('🐱 Mouse tracking elements not found');
            return;
        }
        
        console.log('🐱 Mouse tracking setup complete');
        
        document.addEventListener('mousemove', (e) => {
            const catRect = cat.getBoundingClientRect();
            const catCenterX = catRect.left + catRect.width / 2;
            const catCenterY = catRect.top + catRect.height / 2;
            
            // Calculate mouse position relative to cat
            const mouseX = e.clientX - catCenterX;
            const mouseY = e.clientY - catCenterY;
            
            // Calculate distance for intensity
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const maxDistance = 300; // Maximum tracking distance
            const intensity = Math.min(distance / maxDistance, 1);
            
            // Calculate pupil movement (max 2.5px movement to stay within eye boundaries)
            const maxMovement = 2.5;
            const leftPupilX = (mouseX / maxDistance) * maxMovement * intensity;
            const leftPupilY = (mouseY / maxDistance) * maxMovement * intensity;
            const rightPupilX = (mouseX / maxDistance) * maxMovement * intensity;
            const rightPupilY = (mouseY / maxDistance) * maxMovement * intensity;
            
            // Apply pupil movement with boundary checks
            leftPupil.style.transform = `translate(${leftPupilX}px, ${leftPupilY}px)`;
            rightPupil.style.transform = `translate(${rightPupilX}px, ${rightPupilY}px)`;
        });
    }
    
    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ECDC4;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize login app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loginApp = new LoginApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginApp;
} 