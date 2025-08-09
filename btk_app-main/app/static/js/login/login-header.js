/**
 * Login Header
 * Handles header animations and floating hearts
 */

class LoginHeader {
    constructor() {
        this.hearts = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('🐱 Login Header Initializing...');
        
        this.setupHearts();
        this.startAnimations();
        
        this.isInitialized = true;
        console.log('🐱 Login Header Ready!');
    }
    
    setupHearts() {
        const elementsContainer = document.querySelector('.floating-elements-container');
        if (!elementsContainer) return;
        
        // Get existing elements and convert to array
        this.elements = Array.from(elementsContainer.querySelectorAll('.floating-element'));
        
        // Add more elements if needed
        this.addExtraElements();
    }
    
    addExtraElements() {
        const elementsContainer = document.querySelector('.floating-elements-container');
        if (!elementsContainer) return;
        
        // Add more elements for better effect
        const extraElements = [
            { emoji: '⭐', delay: 1, duration: 6, color: '#FFD700' },
            { emoji: '✨', delay: 3, duration: 8, color: '#FF69B4' },
            { emoji: '💫', delay: 5, duration: 7, color: '#4ECDC4' }
        ];
        
        extraElements.forEach((element, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = `floating-element element-extra-${index + 1}`;
            elementDiv.textContent = element.emoji;
            elementDiv.style.cssText = `
                position: absolute;
                font-size: 1rem;
                animation: floatElement ${element.duration}s ease-in-out infinite;
                animation-delay: ${element.delay}s;
                opacity: 0.5;
                color: ${element.color};
                top: ${30 + (index * 10)}%;
                left: ${40 + (index * 15)}%;
            `;
            
            elementsContainer.appendChild(elementDiv);
            this.elements.push(elementDiv);
        });
    }
    
    startAnimations() {
        // Add CSS animations if not already present
        this.addHeartAnimations();
        
        // Start title gradient animation
        this.startTitleAnimation();
        
        // Add random element movements
        this.startRandomElementMovements();
    }
    
    addHeartAnimations() {
        // Check if animations are already added
        if (document.querySelector('#login-header-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'login-header-animations';
        style.textContent = `
            @keyframes floatHeart {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg) scale(1);
                    opacity: 0.6;
                }
                25% {
                    transform: translateY(-15px) rotate(5deg) scale(1.1);
                    opacity: 1;
                }
                50% {
                    transform: translateY(-8px) rotate(-3deg) scale(0.9);
                    opacity: 0.8;
                }
                75% {
                    transform: translateY(-12px) rotate(2deg) scale(1.05);
                    opacity: 1;
                }
            }
            
            @keyframes titleGlow {
                0%, 100% {
                    text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
                }
                50% {
                    text-shadow: 0 0 30px rgba(255, 107, 107, 0.8);
                }
            }
            
            @keyframes heartPulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.2);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    startTitleAnimation() {
        const title = document.querySelector('.login-title h1');
        if (title) {
            title.style.animation = 'titleGlow 3s ease-in-out infinite';
        }
    }
    
    startRandomElementMovements() {
        // Add random movements to elements
        this.elements.forEach((element, index) => {
            setInterval(() => {
                if (Math.random() > 0.7) { // 30% chance every interval
                    this.pulseElement(element);
                }
            }, 2000 + (index * 500));
        });
    }
    
    pulseElement(element) {
        element.style.animation = 'elementPulse 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
    
    // Public methods for external control
    addElement(emoji = '⭐', position = { x: 50, y: 50 }) {
        const elementsContainer = document.querySelector('.floating-elements-container');
        if (!elementsContainer) return;
        
        const element = document.createElement('div');
        element.className = 'floating-element element-dynamic';
        element.textContent = emoji;
        element.style.cssText = `
            position: absolute;
            font-size: 1.2rem;
            left: ${position.x}%;
            top: ${position.y}%;
            animation: floatElement 4s ease-in-out;
            opacity: 0.8;
            z-index: 10;
        `;
        
        elementsContainer.appendChild(element);
        
        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 4000);
        
        return element;
    }
    
    celebrate() {
        // Add celebration elements
        const celebrations = ['⭐', '🌟', '✨', '💫'];
        celebrations.forEach((emoji, index) => {
            setTimeout(() => {
                this.addElement(emoji, {
                    x: 20 + (index * 15),
                    y: 30 + (index * 10)
                });
            }, index * 200);
        });
    }
    
    destroy() {
        // Remove all dynamic elements
        const dynamicElements = document.querySelectorAll('.element-dynamic');
        dynamicElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        console.log('🐱 Login Header Destroyed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginHeader;
}

// Make available globally
window.LoginHeader = LoginHeader; 