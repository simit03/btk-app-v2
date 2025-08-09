/**
 * Enhanced Navbar JavaScript
 * Tüm sayfalarda tutarlı navbar işlevselliği
 */

class EnhancedNavbar {
    constructor() {
        this.navbar = null;
        this.userProfile = null;
        this.dropdownMenu = null;
        this.dropdownToggle = null;
        this.isDropdownOpen = false;
        this.init();
    }

    init() {
        this.setupNavbar();
        this.setupDropdown();
        this.setupAnimations();
        this.setupResponsive();
        this.setupActiveLinks();
    }

    setupNavbar() {
        // Navbar elementlerini bul
        this.navbar = document.querySelector('.navbar');
        this.userProfile = document.querySelector('.nav-user-profile');
        this.dropdownMenu = document.querySelector('.dropdown-menu');
        this.dropdownToggle = document.querySelector('.dropdown-toggle');

        if (this.navbar) {
            // Navbar'a enhanced class'ları ekle
            this.navbar.classList.add('navbar-enhanced');
            
            // Container'ı enhanced yap
            const container = this.navbar.querySelector('.navbar-container');
            if (container) {
                container.classList.add('navbar-container-enhanced');
            }

            // Brand'ı enhanced yap
            const brand = this.navbar.querySelector('.navbar-brand');
            if (brand) {
                brand.classList.add('navbar-brand-enhanced');
            }

            // Logo'yu enhanced yap
            const logo = this.navbar.querySelector('.navbar-logo');
            if (logo) {
                logo.classList.add('navbar-logo-enhanced');
            }

            // Title'ı enhanced yap
            const title = this.navbar.querySelector('.navbar-title');
            if (title) {
                title.classList.add('navbar-title-enhanced');
            }

            // Nav'ı enhanced yap
            const nav = this.navbar.querySelector('.navbar-nav');
            if (nav) {
                nav.classList.add('navbar-nav-enhanced');
            }

            // Link'leri enhanced yap
            const links = this.navbar.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.classList.add('nav-link-enhanced');
            });

            // Button'ları enhanced yap
            const buttons = this.navbar.querySelectorAll('.nav-button');
            buttons.forEach(button => {
                button.classList.add('nav-button-enhanced');
            });

            // User profile'ı enhanced yap
            if (this.userProfile) {
                this.userProfile.classList.add('nav-user-profile-enhanced');
            }

            // Avatar'ı enhanced yap
            const avatar = this.navbar.querySelector('.user-avatar-small');
            if (avatar) {
                avatar.classList.add('user-avatar-enhanced');
            }

            // Avatar emoji'yi enhanced yap
            const avatarEmoji = this.navbar.querySelector('.avatar-emoji-small');
            if (avatarEmoji) {
                avatarEmoji.classList.add('avatar-emoji-enhanced');
            }

            // User info'yu enhanced yap
            const userInfo = this.navbar.querySelector('.user-info-small');
            if (userInfo) {
                userInfo.classList.add('user-info-enhanced');
            }

            // User name'i enhanced yap
            const userName = this.navbar.querySelector('.user-name');
            if (userName) {
                userName.classList.add('user-name-enhanced');
            }

            // User grade'i enhanced yap
            const userGrade = this.navbar.querySelector('.user-grade');
            if (userGrade) {
                userGrade.classList.add('user-grade-enhanced');
            }

            // Dropdown'ı enhanced yap
            const dropdown = this.navbar.querySelector('.nav-dropdown');
            if (dropdown) {
                dropdown.classList.add('nav-dropdown-enhanced');
            }

            // Dropdown toggle'ı enhanced yap
            if (this.dropdownToggle) {
                this.dropdownToggle.classList.add('dropdown-toggle-enhanced');
            }

            // Dropdown menu'yü enhanced yap
            if (this.dropdownMenu) {
                this.dropdownMenu.classList.add('dropdown-menu-enhanced');
            }

            // Dropdown item'ları enhanced yap
            const dropdownItems = this.navbar.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.classList.add('dropdown-item-enhanced');
            });

            // Dropdown divider'ı enhanced yap
            const divider = this.navbar.querySelector('.dropdown-divider');
            if (divider) {
                divider.classList.add('dropdown-divider-enhanced');
            }
        }
    }

    setupDropdown() {
        if (this.userProfile && this.dropdownMenu && this.dropdownToggle) {
            // Click event'i
            this.dropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Hover event'leri
            this.userProfile.addEventListener('mouseenter', () => {
                this.openDropdown();
            });

            this.userProfile.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!this.userProfile.matches(':hover')) {
                        this.closeDropdown();
                    }
                }, 200);
            });

            // Dışarı tıklama ile kapatma
            document.addEventListener('click', (e) => {
                if (!this.userProfile.contains(e.target)) {
                    this.closeDropdown();
                }
            });

            // ESC tuşu ile kapatma
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeDropdown();
                }
            });
        }
    }

    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        if (this.dropdownMenu) {
            this.dropdownMenu.style.opacity = '1';
            this.dropdownMenu.style.visibility = 'visible';
            this.dropdownMenu.style.transform = 'translateY(0)';
            this.isDropdownOpen = true;
            
            // Toggle button'a active class ekle
            if (this.dropdownToggle) {
                this.dropdownToggle.style.transform = 'rotate(180deg)';
            }
        }
    }

    closeDropdown() {
        if (this.dropdownMenu) {
            this.dropdownMenu.style.opacity = '0';
            this.dropdownMenu.style.visibility = 'hidden';
            this.dropdownMenu.style.transform = 'translateY(-10px)';
            this.isDropdownOpen = false;
            
            // Toggle button'dan active class'ı kaldır
            if (this.dropdownToggle) {
                this.dropdownToggle.style.transform = 'rotate(0deg)';
            }
        }
    }

    setupAnimations() {
        // Navbar fade-in animasyonu
        if (this.navbar) {
            this.navbar.classList.add('navbar-fade-in');
        }

        // Link hover animasyonları
        const links = this.navbar?.querySelectorAll('.nav-link-enhanced');
        if (links) {
            links.forEach(link => {
                link.addEventListener('mouseenter', () => {
                    link.style.transform = 'translateY(-2px) scale(1.05)';
                });

                link.addEventListener('mouseleave', () => {
                    link.style.transform = 'translateY(0) scale(1)';
                });
            });
        }

        // Button hover animasyonları
        const buttons = this.navbar?.querySelectorAll('.nav-button-enhanced');
        if (buttons) {
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-3px) scale(1.05)';
                });

                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0) scale(1)';
                });
            });
        }

        // User profile hover animasyonları
        if (this.userProfile) {
            this.userProfile.addEventListener('mouseenter', () => {
                this.userProfile.style.transform = 'translateY(-2px) scale(1.02)';
            });

            this.userProfile.addEventListener('mouseleave', () => {
                this.userProfile.style.transform = 'translateY(0) scale(1)';
            });
        }
    }

    setupResponsive() {
        // Mobil menü toggle (gelecekte eklenebilir)
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                const nav = this.navbar?.querySelector('.navbar-nav-enhanced');
                if (nav) {
                    nav.classList.toggle('mobile-open');
                }
            });
        }

        // Resize event'i
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Mobil cihazlarda dropdown'ı kapat
        if (window.innerWidth <= 768 && this.isDropdownOpen) {
            this.closeDropdown();
        }
    }

    setupActiveLinks() {
        // Aktif sayfa link'ini işaretle
        const currentPath = window.location.pathname;
        const links = this.navbar?.querySelectorAll('.nav-link-enhanced');
        
        if (links) {
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    // Navbar'ı yenile
    refresh() {
        this.setupActiveLinks();
    }

    // Navbar'ı gizle/göster
    toggle() {
        if (this.navbar) {
            this.navbar.style.display = this.navbar.style.display === 'none' ? 'flex' : 'none';
        }
    }

    // Navbar'ı sabit yap
    makeSticky() {
        if (this.navbar) {
            this.navbar.style.position = 'sticky';
            this.navbar.style.top = '0';
            this.navbar.style.zIndex = '1000';
        }
    }
}

// Navbar'ı başlat
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced Navbar initialized');
    window.enhancedNavbar = new EnhancedNavbar();
});

// Global fonksiyonlar
window.NavbarUtils = {
    // Navbar'ı yenile
    refresh: () => {
        if (window.enhancedNavbar) {
            window.enhancedNavbar.refresh();
        }
    },

    // Dropdown'ı aç
    openDropdown: () => {
        if (window.enhancedNavbar) {
            window.enhancedNavbar.openDropdown();
        }
    },

    // Dropdown'ı kapat
    closeDropdown: () => {
        if (window.enhancedNavbar) {
            window.enhancedNavbar.closeDropdown();
        }
    },

    // Navbar'ı gizle/göster
    toggle: () => {
        if (window.enhancedNavbar) {
            window.enhancedNavbar.toggle();
        }
    }
}; 