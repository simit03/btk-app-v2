/**
 * Profile Page JavaScript
 * Kullanıcı profil sayfası işlevleri
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🐱 Profile page loaded');
    
    // Navbar dropdown functionality
    setupNavbarDropdown();
    
    // Tüm bölümler için animasyon
    const sections = document.querySelectorAll('.profile-card, .profile-edit-section, .quiz-report-section, .topic-report-section, .profile-actions');
    
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // İstatistik kartları için hover efektleri
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Rapor kartları için hover efektleri
    const reportCards = document.querySelectorAll('.report-card');
    reportCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Konu kartları için hover efektleri
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Buton hover efektleri
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Profil düzenleme formu
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            // Form verilerini topla
            const inputs = document.querySelectorAll('.edit-input');
            const firstName = inputs[0].value.trim();
            const lastName = inputs[1].value.trim();
            const grade = inputs[2].value;
            
            // Validasyon
            if (!firstName || !lastName || !grade) {
                showNotification('Lütfen tüm alanları doldurun! ❌', 'error');
                return;
            }
            
            // Kullanıcı ID'sini session'dan al
            const userId = await getUserIdFromSession();
            
            if (!userId) {
                showNotification('Kullanıcı bilgisi bulunamadı! ❌', 'error');
                return;
            }
            
            // Loading durumu
            saveBtn.textContent = '💾 Kaydediliyor...';
            saveBtn.disabled = true;
            
            // API'ye gönder
            await updateProfileAPI(userId, firstName, lastName, grade);
            
            // Loading durumunu kaldır
            saveBtn.textContent = '💾 Değişiklikleri Kaydet';
            saveBtn.disabled = false;
        });
    }
    
    // Input focus efektleri
    const inputs = document.querySelectorAll('.edit-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Progress bar animasyonları
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 1000);
    });
    
    // Başarıları yükle
    loadUserAchievements();
    
    // İstatistikleri yükle
    loadUserStats();
});

// Kullanıcı ID'sini session'dan alma fonksiyonu
async function getUserIdFromSession() {
    try {
        console.log('🔍 Session bilgisi alınıyor...');
        // Backend'den session bilgilerini al
        const response = await fetch('/api/session/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Session API Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('📊 Session API Response data:', result);
            const userId = result.data ? result.data.id : null;
            console.log('👤 User ID:', userId);
            return userId;
        } else {
            console.error('❌ Session API Error:', response.status);
        }
    } catch (error) {
        console.error('Session bilgisi alınamadı:', error);
    }
    
    return null;
}

// Profil güncelleme API fonksiyonu
async function updateProfileAPI(userId, firstName, lastName, grade) {
    try {
        console.log('🔄 Profil güncelleniyor...', { userId, firstName, lastName, grade });
        
        const requestData = {
            first_name: firstName,
            last_name: lastName,
            grade: parseInt(grade)
        };
        
        console.log('📤 Request data:', requestData);
        
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        console.log('📡 Profile API Response status:', response.status);
        const result = await response.json();
        console.log('📊 Profile API Response data:', result);

        if (result.success) {
            showNotification('Profil başarıyla güncellendi! ✅', 'success');
            
            // Sayfayı yenile (session'ı güncellemek için)
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showNotification(result.message || 'Profil güncellenirken hata oluştu! ❌', 'error');
        }
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        showNotification('Bağlantı hatası! Lütfen tekrar deneyin. ❌', 'error');
    }
}

// Navbar dropdown setup
function setupNavbarDropdown() {
    const userProfile = document.querySelector('.nav-user-profile');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    if (userProfile && dropdownMenu && dropdownToggle) {
        // Toggle dropdown on click
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.style.opacity = dropdownMenu.style.opacity === '1' ? '0' : '1';
            dropdownMenu.style.visibility = dropdownMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
            dropdownMenu.style.transform = dropdownMenu.style.transform === 'translateY(0px)' ? 'translateY(-10px)' : 'translateY(0px)';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfile.contains(e.target)) {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.transform = 'translateY(-10px)';
            }
        });
        
        // Hover functionality
        userProfile.addEventListener('mouseenter', function() {
            dropdownMenu.style.opacity = '1';
            dropdownMenu.style.visibility = 'visible';
            dropdownMenu.style.transform = 'translateY(0px)';
        });
        
        userProfile.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!userProfile.matches(':hover')) {
                    dropdownMenu.style.opacity = '0';
                    dropdownMenu.style.visibility = 'hidden';
                    dropdownMenu.style.transform = 'translateY(-10px)';
                }
            }, 200);
        });
    }
}

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
            
            // Profil kartındaki istatistikleri güncelle
            updateStatElement('profileCorrectQuestions', stats.correct_questions);
            updateStatElement('profileTotalAchievements', stats.total_achievements);
            updateStatElement('profileTotalPoints', stats.total_points);
            updateStatElement('profileCompletedQuizzes', stats.completed_quizzes);
            
            // Quiz raporu istatistiklerini güncelle
            updateStatElement('profileCorrectReport', stats.correct_questions);
            updateStatElement('profileIncorrectReport', stats.incorrect_questions);
            updateStatElement('profileSuccessPercentage', `${stats.success_percentage}%`);
            
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
    const statValues = document.querySelectorAll('.stat-value, .report-value');
    
    statValues.forEach((value, index) => {
        const finalValue = value.textContent;
        let currentValue = 0;
        
        // Eğer yüzde işareti varsa, sadece sayıyı al
        const isPercentage = finalValue.includes('%');
        const numericValue = isPercentage ? parseFloat(finalValue) : parseInt(finalValue);
        
        if (isNaN(numericValue)) return;
        
        const increment = numericValue / 20; // 20 adımda artır
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }
            
            if (isPercentage) {
                value.textContent = `${Math.floor(currentValue)}%`;
            } else {
                value.textContent = Math.floor(currentValue);
            }
        }, 50 + (index * 10)); // Her istatistik için farklı hız
    });
}

// Başarıları yükleme fonksiyonu
async function loadUserAchievements() {
    try {
        const response = await fetch('/api/achievements', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        const achievementsContainer = document.getElementById('achievementsContainer');

        if (result.success) {
            const achievements = result.data.achievements;
            
            if (achievements.length === 0) {
                achievementsContainer.innerHTML = `
                    <div class="no-achievements">
                        <p>Henüz hiç başarı kazanmadınız! 😊</p>
                        <p class="encourage-text">Quiz'e başlayarak ilk başarınızı kazanın! 🏆</p>
                    </div>
                `;
            } else {
                let achievementsHTML = '';
                achievements.forEach(achievement => {
                    const date = new Date(achievement.earned_at).toLocaleDateString('tr-TR');
                    achievementsHTML += `
                        <div class="achievement-item">
                            <div class="achievement-icon">
                                ${achievement.achievement_type === 'perfect_score' ? '🏆' : '⭐'}
                            </div>
                            <div class="achievement-info">
                                <div class="achievement-name">${achievement.achievement_name}</div>
                                <div class="achievement-description">${achievement.achievement_description}</div>
                                <div class="achievement-date">Kazanıldı: ${date}</div>
                            </div>
                        </div>
                    `;
                });
                achievementsContainer.innerHTML = achievementsHTML;
            }
        } else {
            achievementsContainer.innerHTML = `
                <div class="no-achievements">
                    <p>Başarılar yüklenirken hata oluştu! 😔</p>
                    <p class="encourage-text">Lütfen sayfayı yenileyin.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Başarıları yükleme hatası:', error);
        const achievementsContainer = document.getElementById('achievementsContainer');
        achievementsContainer.innerHTML = `
            <div class="no-achievements">
                <p>Bağlantı hatası! 😔</p>
                <p class="encourage-text">Lütfen internet bağlantınızı kontrol edin.</p>
            </div>
        `;
    }
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
} 