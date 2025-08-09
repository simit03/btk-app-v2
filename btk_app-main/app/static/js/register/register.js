/**
 * Register Page JavaScript
 * Yapay Zeka Matematik Asistanı - Kayıt Ol Sayfası
 */

class RegisterForm {
    constructor() {
        this.inputs = {
            username: document.getElementById('username'),
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword')
        };
        this.init();
    }
    
    init() {
        this.setupPasswordToggles();
        this.setupInputAnimations();
        console.log('🐱 RegisterForm initialized');
    }
    
    setupPasswordToggles() {
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const password = this.inputs.password;
                password.type = password.type === 'password' ? 'text' : 'password';
                togglePassword.textContent = password.type === 'password' ? '👁️' : '🙈';
            });
        }
        
        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => {
                const confirmPassword = this.inputs.confirmPassword;
                confirmPassword.type = confirmPassword.type === 'password' ? 'text' : 'password';
                toggleConfirmPassword.textContent = confirmPassword.type === 'password' ? '👁️' : '🙈';
            });
        }
    }
    
    setupInputAnimations() {
        Object.values(this.inputs).forEach(input => {
            if (input) {
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    input.parentElement.classList.remove('focused');
                });
            }
        });
    }
}

class RegisterHeader {
    constructor() {
        this.elements = [];
        this.init();
    }
    
    init() {
        this.setupElements();
        console.log('🐱 RegisterHeader initialized');
    }
    
    setupElements() {
        const elementsContainer = document.querySelector('.floating-elements-container');
        if (!elementsContainer) return;
        this.elements = Array.from(elementsContainer.querySelectorAll('.floating-element'));
        this.addExtraElements();
    }
    
    addExtraElements() {
        const container = document.querySelector('.floating-elements-container');
        if (!container) return;
        
        const extraElements = [
            { emoji: '⭐', class: 'star-3', top: '55%', left: '10%', delay: 1 },
            { emoji: '🌟', class: 'star-4', top: '65%', right: '10%', delay: 3 },
            { emoji: '✨', class: 'sparkle-3', top: '75%', left: '20%', delay: 5 },
            { emoji: '💫', class: 'sparkle-4', top: '85%', right: '20%', delay: 7 }
        ];
        
        extraElements.forEach(element => {
            const div = document.createElement('div');
            div.className = `floating-element ${element.class}`;
            div.textContent = element.emoji;
            div.style.top = element.top;
            div.style.left = element.left;
            div.style.right = element.right;
            div.style.animationDelay = `${element.delay}s`;
            container.appendChild(div);
            this.elements.push(div);
        });
    }
}

class RegisterApp {
    constructor() {
        this.formData = {};
        this.isSubmitting = false;
        this.init();
    }
    
    init() {
        this.initializeComponents();
        this.setupEventListeners();
        this.setupMouseTracking();
        console.log('🐱 Register app initialized');
    }
    
    initializeComponents() {
        // Initialize form components
        this.registerForm = new RegisterForm();
        this.registerHeader = new RegisterHeader();
        
        console.log('🐱 Register components initialized');
    }
    
    setupEventListeners() {
        // Form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
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
        
        // Grade selection
        const gradeOptions = document.querySelectorAll('input[type="radio"]');
        gradeOptions.forEach(option => {
            option.addEventListener('change', () => this.handleGradeChange(option));
        });
        
        // Mouse tracking for cat eyes
        this.setupMouseTracking();
        
        // Page load animation
        window.addEventListener('load', () => this.handlePageLoad());
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
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateForm(data)) {
            return;
        }
        
        this.isSubmitting = true;
        this.showLoading();
        
        try {
            // Send registration request to server
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                this.showSuccess('Kayıt başarıyla tamamlandı! 🎉');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    if (result.redirect) {
                        window.location.href = result.redirect;
                    } else {
                        window.location.href = '/login';
                    }
                }, 2000);
            } else {
                this.showError(result.message || 'Kayıt işlemi başarısız oldu');
            }
        } catch (error) {
            console.error('🐱 Registration request failed:', error);
            this.showError('Ağ hatası oluştu. Lütfen tekrar deneyin.');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }
    
    validateForm(data) {
        const errors = [];
        
        // Username validation
        if (!data.username || data.username.length < 3) {
            errors.push('Kullanıcı adı en az 3 karakter olmalıdır');
        }
        
        // First name validation
        if (!data.firstName || data.firstName.length < 2) {
            errors.push('Adı en az 2 karakter olmalıdır');
        }
        
        // Last name validation
        if (!data.lastName || data.lastName.length < 2) {
            errors.push('Soyadı en az 2 karakter olmalıdır');
        }
        
        // Password validation
        if (!data.password || data.password.length < 6) {
            errors.push('Şifre en az 6 karakter olmalıdır');
        }
        
        // Confirm password validation
        if (data.password !== data.confirmPassword) {
            errors.push('Şifreler eşleşmiyor');
        }
        
        // Grade validation
        if (!data.grade) {
            errors.push('Lütfen sınıfınızı seçin');
        }
        
        if (errors.length > 0) {
            this.showError(errors.join('\n'));
            return false;
        }
        
        return true;
    }
    
    handleInputFocus(input) {
        input.parentElement.classList.add('focused');
    }
    
    handleInputBlur(input) {
        input.parentElement.classList.remove('focused');
    }
    
    handleInputChange(input) {
        this.formData[input.name] = input.value;
    }
    
    handleButtonHover(button) {
        button.style.transform = 'translateY(-2px)';
    }
    
    handleButtonLeave(button) {
        button.style.transform = 'translateY(0)';
    }
    
    handleButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    handleGradeChange(option) {
        console.log('🐱 Grade selected:', option.value);
        
        // Remove active class from all options
        document.querySelectorAll('.grade-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Add active class to selected option
        option.closest('.grade-option').classList.add('active');
    }
    
    handlePageLoad() {
        console.log('🐱 Register page loaded');
        
        // Add floating elements
        this.registerHeader.addExtraElements();
        
        // Start animations
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }
    
    showLoading() {
        const btn = document.getElementById('registerBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        btn.disabled = true;
    }
    
    hideLoading() {
        const btn = document.getElementById('registerBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        btn.disabled = false;
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
    
    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF6B6B;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            white-space: pre-line;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize register app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterApp();
}); 