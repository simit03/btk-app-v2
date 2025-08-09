/**
 * Home Page JavaScript
 * Ana sayfa işlevleri
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Home page loaded');
    
    // Eğer kullanıcı giriş yapmışsa istatistikleri yükle
    if (document.querySelector('.user-dashboard-section')) {
        loadUserStats();
    }
    
    // Animasyonlar
    animateElements();
    
    // Ders notları etkileşimleri
});

// Kullanıcı istatistiklerini yükleme fonksiyonu
async function loadUserStats() {
    try {
        const response = await fetch('/api/user/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            const stats = result.data;
            
            // İstatistikleri güncelle
            updateStatElement('correctQuestions', stats.correct_questions);
            updateStatElement('totalAchievements', stats.total_achievements);
            updateStatElement('totalPoints', stats.total_points);
            updateStatElement('completedQuizzes', stats.completed_quizzes);
            
            // Animasyonlu güncelleme
            animateStatUpdates();
        } else {
            console.error('İstatistikler yüklenemedi:', result.message);
        }
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// İstatistik elementini güncelleme
function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// İstatistik güncellemelerini animasyonlu yapma
function animateStatUpdates() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach((value, index) => {
        const finalValue = parseInt(value.textContent);
        let currentValue = 0;
        
        const increment = finalValue / 20; // 20 adımda artır
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            value.textContent = Math.floor(currentValue);
        }, 50 + (index * 10)); // Her istatistik için farklı hız
    });
}

// Sayfa elementlerini animasyonlu yapma
function animateElements() {
    // Hero section animasyonu
    const heroElements = document.querySelectorAll('.hero-content, .hero-buttons');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Feature cards animasyonu
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 100));
    });
    
    // Grade cards animasyonu
    const gradeCards = document.querySelectorAll('.grade-card');
    gradeCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 800 + (index * 150));
    });
    
    // User dashboard animasyonu
    const dashboardElements = document.querySelectorAll('.user-info-card, .quick-actions');
    dashboardElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
            setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 + (index * 200));
    });
}

// Hover efektleri
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards hover efektleri
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Grade cards hover efektleri
    const gradeCards = document.querySelectorAll('.grade-card');
    gradeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Action buttons hover efektleri
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Stat items hover efektleri
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Ders notları etkileşimleri

// CSS animasyonları için stil ekleme
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 