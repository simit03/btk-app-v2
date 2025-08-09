/**
 * Login Form
 * Handles form validation, password toggle, and form interactions
 */

class LoginForm {
    constructor() {
        this.form = null;
        this.inputs = {};
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('🐱 Login Form Initializing...');
        
        this.setupForm();
        this.setupPasswordToggle();
        this.setupValidation();
        this.setupAnimations();
        
        this.isInitialized = true;
        console.log('🐱 Login Form Ready!');
    }
    
    setupForm() {
        this.form = document.getElementById('loginForm');
        if (!this.form) return;
        
        // Get form inputs
        this.inputs = {
            username: this.form.querySelector('#username'),
            password: this.form.querySelector('#password'),
            rememberMe: this.form.querySelector('#rememberMe'),
            togglePassword: this.form.querySelector('#togglePassword'),
            loginBtn: this.form.querySelector('#loginBtn')
        };
        
        // Add input event listeners
        Object.values(this.inputs).forEach(input => {
            if (input && input.type !== 'checkbox') {
                input.addEventListener('focus', () => this.handleInputFocus(input));
                input.addEventListener('blur', () => this.handleInputBlur(input));
                input.addEventListener('input', () => this.handleInputChange(input));
            }
        });
    }
    
    setupPasswordToggle() {
        const toggleBtn = this.inputs.togglePassword;
        const passwordInput = this.inputs.password;
        
        if (!toggleBtn || !passwordInput) return;
        
        toggleBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Update toggle button text based on password visibility
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                toggleBtn.style.opacity = '1';
            } else {
                toggleBtn.style.opacity = '0.5';
            }
        });
    }
    
    setupValidation() {
        // Real-time validation
        this.inputs.username?.addEventListener('input', () => this.validateUsername());
        this.inputs.password?.addEventListener('input', () => this.validatePassword());
        
        // Form submission validation
        this.form?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
    
    setupAnimations() {
        // Add input animations
        this.addInputAnimations();
        
        // Add button animations
        this.addButtonAnimations();
        
        // Add checkbox animations
        this.addCheckboxAnimations();
    }
    
    addInputAnimations() {
        const inputs = [this.inputs.username, this.inputs.password];
        
        inputs.forEach(input => {
            if (!input) return;
            
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }
    
    addButtonAnimations() {
        const loginBtn = this.inputs.loginBtn;
        if (!loginBtn) return;
        
        loginBtn.addEventListener('mouseenter', () => {
            loginBtn.style.transform = 'translateY(-2px)';
        });
        
        loginBtn.addEventListener('mouseleave', () => {
            loginBtn.style.transform = 'translateY(0)';
        });
        
        loginBtn.addEventListener('mousedown', () => {
            loginBtn.style.transform = 'translateY(0) scale(0.98)';
        });
        
        loginBtn.addEventListener('mouseup', () => {
            loginBtn.style.transform = 'translateY(-2px)';
        });
    }
    
    addCheckboxAnimations() {
        const checkbox = this.inputs.rememberMe;
        if (!checkbox) {
            console.error('🐱 Checkbox not found!');
            return;
        }
        
        console.log('🐱 Checkbox found:', checkbox);
        
        // Add change event listener
        checkbox.addEventListener('change', (e) => {
            console.log('🐱 Checkbox changed:', checkbox.checked);
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
        });
        
        // Add click event for better accessibility
        const checkboxLabel = checkbox.parentElement;
        if (checkboxLabel) {
            checkboxLabel.addEventListener('click', (e) => {
                console.log('🐱 Label clicked');
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
        
        // Add direct click on checkbox
        checkbox.addEventListener('click', (e) => {
            console.log('🐱 Checkbox clicked directly');
        });
    }
    
    togglePasswordVisibility() {
        const passwordInput = this.inputs.password;
        const toggleBtn = this.inputs.togglePassword;
        
        if (!passwordInput || !toggleBtn) return;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
            toggleBtn.title = 'Şifreyi gizle';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
            toggleBtn.title = 'Şifreyi göster';
        }
        
        // Add animation
        toggleBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            toggleBtn.style.transform = 'scale(1)';
        }, 150);
    }
    
    validateUsername() {
        const username = this.inputs.username;
        if (!username) return true;
        
        const value = username.value.trim();
        const isValid = value.length >= 3;
        
        this.updateInputValidation(username, isValid, 'Kullanıcı adı en az 3 karakter olmalıdır');
        
        return isValid;
    }
    
    validatePassword() {
        const password = this.inputs.password;
        if (!password) return true;
        
        const value = password.value;
        const isValid = value.length >= 6;
        
        this.updateInputValidation(password, isValid, 'Şifre en az 6 karakter olmalıdır');
        
        return isValid;
    }
    
    updateInputValidation(input, isValid, errorMessage) {
        const wrapper = input.parentElement;
        
        // Remove existing validation classes
        wrapper.classList.remove('valid', 'invalid');
        
        // Remove existing error message
        const existingError = wrapper.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        if (input.value.length === 0) {
            // No validation for empty fields
            return;
        }
        
        if (isValid) {
            wrapper.classList.add('valid');
        } else {
            wrapper.classList.add('invalid');
            
            // Add error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            errorElement.style.cssText = `
                color: #ff6b6b;
                font-size: 0.8rem;
                margin-top: 0.25rem;
                animation: fadeIn 0.3s ease-out;
            `;
            
            wrapper.appendChild(errorElement);
        }
    }
    
    handleInputFocus(input) {
        console.log('🐱 Input focused:', input.name);
        
        // Add focus animation
        input.parentElement.classList.add('focused');
        
        // Trigger cat cursor typing
        if (window.loginApp && window.loginApp.loginCursor) {
            window.loginApp.loginCursor.setTyping();
        }
    }
    
    handleInputBlur(input) {
        console.log('🐱 Input blurred:', input.name);
        
        // Remove focus animation
        input.parentElement.classList.remove('focused');
        
        // Validate on blur
        if (input.name === 'username') {
            this.validateUsername();
        } else if (input.name === 'password') {
            this.validatePassword();
        }
        
        // Reset cat cursor
        if (window.loginApp && window.loginApp.loginCursor) {
            window.loginApp.loginCursor.setIdle();
        }
    }
    
    handleInputChange(input) {
        console.log('🐱 Input changed:', input.name, input.value);
        
        // Real-time validation
        if (input.name === 'username') {
            this.validateUsername();
        } else if (input.name === 'password') {
            this.validatePassword();
        }
        
        // Update form state
        this.updateFormState();
    }
    
    updateFormState() {
        const username = this.inputs.username?.value.trim() || '';
        const password = this.inputs.password?.value || '';
        const loginBtn = this.inputs.loginBtn;
        
        if (!loginBtn) return;
        
        // Enable/disable login button
        if (username.length >= 3 && password.length >= 6) {
            loginBtn.disabled = false;
            loginBtn.style.opacity = '1';
        } else {
            loginBtn.disabled = true;
            loginBtn.style.opacity = '0.6';
        }
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        console.log('🐱 Form submission handled by LoginForm');
        
        // Validate all fields
        const isUsernameValid = this.validateUsername();
        const isPasswordValid = this.validatePassword();
        
        if (!isUsernameValid || !isPasswordValid) {
            this.showFormError('Lütfen tüm alanları doğru şekilde doldurun');
            return false;
        }
        
        // Form is valid, let the main app handle submission
        return true;
    }
    
    showFormError(message) {
        // Create form error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ff6b6b;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
            animation: slideInDown 0.3s ease-out;
        `;
        
        // Insert after form
        this.form.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOutUp 0.3s ease-out';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 3000);
    }
    
    getFormData() {
        return {
            username: this.inputs.username?.value.trim() || '',
            password: this.inputs.password?.value || '',
            rememberMe: this.inputs.rememberMe?.checked || false
        };
    }
    
    setFormData(data) {
        if (data.username) {
            this.inputs.username.value = data.username;
        }
        if (data.password) {
            this.inputs.password.value = data.password;
        }
        if (data.rememberMe !== undefined) {
            this.inputs.rememberMe.checked = data.rememberMe;
        }
    }
    
    clearForm() {
        Object.values(this.inputs).forEach(input => {
            if (input && input.type !== 'checkbox') {
                input.value = '';
            } else if (input && input.type === 'checkbox') {
                input.checked = false;
            }
        });
        
        // Clear validation states
        Object.values(this.inputs).forEach(input => {
            if (input && input.type !== 'checkbox') {
                const wrapper = input.parentElement;
                wrapper.classList.remove('valid', 'invalid');
                const errorMessage = wrapper.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
        
        this.updateFormState();
    }
    
    setLoadingState(isLoading) {
        const loginBtn = this.inputs.loginBtn;
        if (!loginBtn) return;
        
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
    
    destroy() {
        // Remove event listeners
        Object.values(this.inputs).forEach(input => {
            if (input && input.type !== 'checkbox') {
                input.removeEventListener('focus', this.handleInputFocus);
                input.removeEventListener('blur', this.handleInputBlur);
                input.removeEventListener('input', this.handleInputChange);
            }
        });
        
        console.log('🐱 Login Form Destroyed');
    }
}

// Add CSS animations for form
const formStyle = document.createElement('style');
formStyle.textContent = `
    @keyframes slideInDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideOutUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .input-wrapper.focused {
        transform: scale(1.02);
    }
    
    .input-wrapper.valid input {
        border-color: #4ECDC4;
        box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
    }
    
    .input-wrapper.invalid input {
        border-color: #ff6b6b;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }
`;
document.head.appendChild(formStyle);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginForm;
}

// Make available globally
window.LoginForm = LoginForm; 