/**
 * Login Cat Cursor
 * Handles the cute cat cursor that follows the mouse and reacts to interactions
 */

class LoginCursor {
    constructor() {
        this.cursor = null;
        this.isVisible = false;
        this.currentState = 'idle';
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        console.log('🐱 Cat Cursor Initializing...');
        
        this.cursor = document.getElementById('catCursor');
        if (!this.cursor) {
            console.error('Cat cursor element not found');
            return;
        }
        
        this.setupEventListeners();
        this.startAnimation();
        this.isVisible = true;
        
        console.log('🐱 Cat Cursor Ready!');
    }
    
    setupEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Mouse click
        document.addEventListener('mousedown', () => this.handleMouseDown());
        document.addEventListener('mouseup', () => this.handleMouseUp());
        
        // Mouse enter/leave
        document.addEventListener('mouseenter', () => this.handleMouseEnter());
        document.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Keyboard events for accessibility
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', () => this.handleTouchEnd());
    }
    
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // Update target position with slight offset for cat's head
        this.targetX = this.mouseX - 30;
        this.targetY = this.mouseY - 30;
        
        // Look at mouse position
        this.lookAtPosition(this.mouseX, this.mouseY);
    }
    
    handleMouseDown() {
        this.setState('clicking');
    }
    
    handleMouseUp() {
        this.setState('idle');
    }
    
    handleMouseEnter() {
        this.show();
    }
    
    handleMouseLeave() {
        this.hide();
    }
    
    handleKeyDown(e) {
        // Handle keyboard navigation
        if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
            this.setState('clicking');
            setTimeout(() => this.setState('idle'), 200);
        }
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.mouseX = touch.clientX;
        this.mouseY = touch.clientY;
        this.targetX = this.mouseX - 30;
        this.targetY = this.mouseY - 30;
        this.setState('clicking');
    }
    
    handleTouchMove(e) {
        const touch = e.touches[0];
        this.mouseX = touch.clientX;
        this.mouseY = touch.clientY;
        this.targetX = this.mouseX - 30;
        this.targetY = this.mouseY - 30;
        this.lookAtPosition(this.mouseX, this.mouseY);
    }
    
    handleTouchEnd() {
        this.setState('idle');
    }
    
    startAnimation() {
        const animate = () => {
            if (this.isVisible && this.cursor) {
                // Smooth cursor movement
                const currentX = parseFloat(this.cursor.style.left) || this.targetX;
                const currentY = parseFloat(this.cursor.style.top) || this.targetY;
                
                const newX = currentX + (this.targetX - currentX) * 0.1;
                const newY = currentY + (this.targetY - currentY) * 0.1;
                
                this.cursor.style.left = newX + 'px';
                this.cursor.style.top = newY + 'px';
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    lookAtPosition(x, y) {
        if (!this.cursor) return;
        
        const cursorRect = this.cursor.getBoundingClientRect();
        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;
        
        const deltaX = x - cursorCenterX;
        const deltaY = y - cursorCenterY;
        
        // Determine look direction
        this.cursor.classList.remove('looking-left', 'looking-right', 'looking-up', 'looking-down');
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 10) {
                this.cursor.classList.add('looking-right');
            } else if (deltaX < -10) {
                this.cursor.classList.add('looking-left');
            }
        } else {
            if (deltaY > 10) {
                this.cursor.classList.add('looking-down');
            } else if (deltaY < -10) {
                this.cursor.classList.add('looking-up');
            }
        }
    }
    
    lookAtElement(element) {
        if (!element || !this.cursor) return;
        
        const elementRect = element.getBoundingClientRect();
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;
        
        this.lookAtPosition(elementCenterX, elementCenterY);
    }
    
    setState(state) {
        if (this.currentState === state) return;
        
        // Remove previous state classes
        this.cursor.classList.remove(
            'idle', 'hovering', 'clicking', 'typing', 'loading', 
            'success', 'error', 'happy', 'sad', 'excited'
        );
        
        // Add new state class
        this.cursor.classList.add(state);
        this.currentState = state;
        
        console.log('🐱 Cat cursor state:', state);
    }
    
    setIdle() {
        this.setState('idle');
    }
    
    setHovering() {
        this.setState('hovering');
    }
    
    setClicking() {
        this.setState('clicking');
    }
    
    setTyping() {
        this.setState('typing');
    }
    
    setLoading() {
        this.setState('loading');
    }
    
    setSuccess() {
        this.setState('success');
    }
    
    setError() {
        this.setState('error');
    }
    
    setHappy() {
        this.setState('happy');
        
        // Reset to idle after animation
        setTimeout(() => {
            this.setState('idle');
        }, 1500);
    }
    
    setSad() {
        this.setState('sad');
        
        // Reset to idle after animation
        setTimeout(() => {
            this.setState('idle');
        }, 800);
    }
    
    setExcited() {
        this.setState('excited');
        
        // Reset to idle after animation
        setTimeout(() => {
            this.setState('idle');
        }, 600);
    }
    
    show() {
        if (this.cursor) {
            this.cursor.style.display = 'block';
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.cursor) {
            this.cursor.style.display = 'none';
            this.isVisible = false;
        }
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseenter', this.handleMouseEnter);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        
        console.log('🐱 Cat Cursor Destroyed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginCursor;
}

// Make available globally
window.LoginCursor = LoginCursor; 