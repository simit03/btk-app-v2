/**
 * Enhanced Navbar JavaScript
 * Tüm sayfalarda tutarlı navbar işlevselliği
 */

class EnhancedNavbar {
    constructor() {
        this.navbar = null;
        this.mobileMenuToggle = null;
        this.navbarNav = null;
        this.isMobileMenuOpen = false;
        this.init();
    }

    init() {
        this.setupNavbar();
        this.setupDropdown();
        this.setupMobileMenu();
        this.setupAnimations();
        this.setupResponsive();
        this.setupActiveLinks();
    }

    setupNavbar() {
        // Navbar elementlerini bul - HTML'de zaten enhanced class'ları var
        this.navbar = document.querySelector('.navbar-enhanced');
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.navbarNav = document.querySelector('.navbar-nav-enhanced');

        // HTML'de zaten tüm enhanced class'ları mevcut olduğu için
        // ekstra class eklemeye gerek yok
        console.log('Enhanced Navbar initialized:', {
            navbar: this.navbar,
            mobileMenuToggle: this.mobileMenuToggle,
            navbarNav: this.navbarNav
        });
    }

    setupDropdown() {
        // Dropdown functionality removed - now flat menu
        console.log('Dropdown functionality removed - flat menu implemented');
    }

    setupMobileMenu() {
        if (this.mobileMenuToggle && this.navbarNav) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking on a link
            const mobileLinks = this.navbarNav.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !this.navbar.contains(e.target) && 
                    !this.mobileMenuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    // Dropdown methods removed - flat menu implementation

    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

        openMobileMenu() {
        if (this.mobileMenuToggle && this.navbarNav) {
            this.mobileMenuToggle.classList.add('active');
            this.navbarNav.classList.add('active');
            this.isMobileMenuOpen = true;
            
            // Prevent body scroll
            document.body.classList.add('mobile-menu-open');
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    }
    
    closeMobileMenu() {
        if (this.mobileMenuToggle && this.navbarNav) {
            this.mobileMenuToggle.classList.remove('active');
            this.navbarNav.classList.remove('active');
            this.isMobileMenuOpen = false;
            
            // Restore body scroll
            document.body.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }

    setupAnimations() {
        if (this.navbar) {
            // Navbar fade in animation
            this.navbar.classList.add('navbar-fade-in');

            // Add bounce animation on scroll
            let lastScrollTop = 0;
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    this.navbar.classList.remove('navbar-bounce');
                } else if (scrollTop < lastScrollTop && scrollTop < 100) {
                    // Scrolling up to top
                    this.navbar.classList.add('navbar-bounce');
                }
                
                lastScrollTop = scrollTop;
            });

            // Hover effects removed - flat menu implementation
        }
    }

    setupResponsive() {
        // Handle resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Initial setup
        this.handleResize();
    }

    handleResize() {
        if (window.innerWidth > 768) {
            // Desktop view - close mobile menu
            this.closeMobileMenu();
        }
    }

    setupActiveLinks() {
        // Set active state for current page
        const currentPath = window.location.pathname;
        const navLinks = this.navbar.querySelectorAll('.nav-link-enhanced');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    refresh() {
        this.setupNavbar();
        this.setupActiveLinks();
    }

    toggle() {
        if (this.navbar) {
            this.navbar.classList.toggle('navbar-hidden');
        }
    }

    makeSticky() {
        if (this.navbar) {
            this.navbar.style.position = 'sticky';
            this.navbar.style.top = '0';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedNavbar();
});

// Export for global access
window.EnhancedNavbar = EnhancedNavbar; 