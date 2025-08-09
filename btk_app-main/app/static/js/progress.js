/**
 * Progress Page JavaScript
 * İlerleme tablosu sayfası işlevleri
 */

let dailyProgressChart = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Progress page loaded');
    
    // Sayfa animasyonları
    initializePageAnimations();
    

    
    // Verileri yükle
    loadProgressData();
});



// Detaylı ilerleme verilerini yükle
async function loadDetailedProgress() {
    try {
        const response = await fetch('/api/progress/detailed', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Eğer veri yoksa boş durum göster
            if (!data.daily_data || data.daily_data.length === 0) {
                showEmptyState('detailed-progress-section', 'Henüz ilerleme verisi bulunmuyor', 'Quiz çözmeye başlayarak verilerinizi görün!');
                return;
            }
            
            // Tabloyu oluştur
            createDetailedTable(data.daily_data);
        } else {
            showEmptyState('detailed-progress-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
        }
    } catch (error) {
        console.error('Detaylı ilerleme yükleme hatası:', error);
        showEmptyState('detailed-progress-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
    }
}

// Konu detay verilerini yükle
async function loadTopicDetail() {
    try {
        const response = await fetch('/api/progress/topics', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Eğer veri yoksa boş durum göster
            if (!data.topics || data.topics.length === 0) {
                showEmptyState('topic-detail-section', 'Henüz konu verisi bulunmuyor', 'Quiz çözmeye başlayarak verilerinizi görün!');
                return;
            }
            
            // Tabloyu oluştur
            createTopicDetailTable(data.topics);
        } else {
            showEmptyState('topic-detail-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
        }
    } catch (error) {
        console.error('Konu detay yükleme hatası:', error);
        showEmptyState('topic-detail-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
    }
}





// Detaylı tabloyu oluştur
function createDetailedTable(dailyData) {
    const tbody = document.getElementById('detailedTableBody');
    
    if (!dailyData || dailyData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <div class="empty-state-text">Henüz ilerleme verisi bulunmuyor</div>
                        <div class="empty-state-subtext">Quiz çözmeye başlayarak verilerinizi görün!</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    dailyData.forEach(day => {
        const successRate = day.solved > 0 ? Math.round((day.correct / day.solved) * 100) : 0;
        const successClass = successRate >= 80 ? 'high' : successRate >= 60 ? 'medium' : 'low';
        const pointsEarned = day.correct * 10; // Her doğru cevap 10 puan
        
        html += `
            <tr>
                <td class="date-cell">${new Date(day.date).toLocaleDateString('tr-TR')}</td>
                <td>${day.solved}</td>
                <td>${day.correct}</td>
                <td>${day.solved - day.correct}</td>
                <td class="success-rate ${successClass}">${successRate}%</td>
                <td>${pointsEarned}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Konu detay tablosunu oluştur
function createTopicDetailTable(topics) {
    const tbody = document.getElementById('topicDetailTableBody');
    
    if (!topics || topics.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <div class="empty-state-text">Henüz konu verisi bulunmuyor</div>
                        <div class="empty-state-subtext">Quiz çözmeye başlayarak verilerinizi görün!</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    topics.forEach(topic => {
        const successRate = topic.total_questions > 0 ? Math.round((topic.correct_questions / topic.total_questions) * 100) : 0;
        const successClass = successRate >= 80 ? 'high' : successRate >= 60 ? 'medium' : 'low';
        const status = successRate >= 80 ? '✅ Tamamlandı' : successRate >= 60 ? '🔄 Devam Ediyor' : '❌ Geliştirilmeli';
        
        html += `
            <tr>
                <td>${topic.topic}</td>
                <td>${topic.total_questions}</td>
                <td>${topic.correct_questions}</td>
                <td>${topic.total_questions - topic.correct_questions}</td>
                <td class="success-rate ${successClass}">${successRate}%</td>
                <td>${status}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Sayfa animasyonları
function initializePageAnimations() {
    const sections = document.querySelectorAll('.stats-overview, .achievements-section, .weekly-summary-section, .detailed-progress-section, .topic-detail-section, .wrong-answers-section');
    
    sections.forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.animationDelay = `${index * 0.2}s`;
    });
}

// Ana veri yükleme fonksiyonu
async function loadProgressData() {
    try {
        // Önce tekrarlanan başarımları temizle
        await cleanupAchievements();
        
        // Tüm verileri paralel olarak yükle
        await Promise.all([
            loadOverviewStats(),
            loadDetailedProgress(),
            loadTopicDetail(),
            loadAchievements(),
            loadWeeklySummary(),
            loadWrongAnswers()
        ]);
        
        // Başarıları kontrol et
        await checkAchievements();
        
        console.log('✅ Tüm veriler başarıyla yüklendi');
    } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        showNotification('Veriler yüklenirken hata oluştu!', 'error');
    }
}

// Yanlış cevapları yükle
async function loadWrongAnswers() {
    try {
        const response = await fetch('/api/progress/wrong-answers', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // İstatistikleri güncelle
            updateWrongAnswersStats(data.stats);
            
            // Yanlış cevapları listele
            displayWrongAnswers(data.wrong_answers);
        } else {
            showEmptyState('wrong-answers-section', 'Yanlış cevap verisi yüklenemedi', 'Lütfen sayfayı yenileyin.');
        }
    } catch (error) {
        console.error('Yanlış cevaplar yükleme hatası:', error);
        showEmptyState('wrong-answers-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
    }
}

// Yanlış cevaplar istatistiklerini güncelle
function updateWrongAnswersStats(stats) {
    // Stats elements were removed from HTML, so we don't need to update them
    // This function is kept for compatibility but does nothing
    console.log('Wrong answers stats:', stats);
}

// Yanlış cevapları görüntüle
function displayWrongAnswers(wrongAnswers) {
    const container = document.getElementById('wrongAnswersList');
    
    if (!wrongAnswers || wrongAnswers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-text">Henüz yanlış cevabınız yok!</div>
                <div class="empty-state-subtext">Mükemmel çalışıyorsunuz!</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    wrongAnswers.forEach(answer => {
        const date = new Date(answer.created_at).toLocaleDateString('tr-TR');
        const questionText = answer.question_text.length > 100 
            ? answer.question_text.substring(0, 100) + '...' 
            : answer.question_text;
        
        html += `
            <div class="wrong-answer-item" data-question='${JSON.stringify(answer)}'>
                <div class="wrong-answer-header">
                    <span class="wrong-answer-topic">${answer.topic}</span>
                    <span class="wrong-answer-date">${date}</span>
                </div>
                <div class="wrong-answer-question">${questionText}</div>
                <div class="wrong-answer-details">
                    <div class="wrong-answer-detail">
                        <span class="wrong-answer-detail-icon">❌</span>
                        <span>Yanlış Cevabınız: ${answer.user_answer}</span>
                    </div>
                    <div class="wrong-answer-detail">
                        <span class="wrong-answer-detail-icon">✅</span>
                        <span>Doğru Cevap: ${answer.correct_answer}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Click event listeners ekle
    document.querySelectorAll('.wrong-answer-item').forEach(item => {
        item.addEventListener('click', function() {
            const questionData = JSON.parse(this.dataset.question);
            showWrongAnswerModal(questionData);
        });
    });
}

// Yanlış cevap modalını göster
function showWrongAnswerModal(questionData) {
    const modal = document.getElementById('wrongAnswerModal');
    const questionText = document.getElementById('modalQuestion');
    const optionsContainer = document.getElementById('modalOptions');
    const modalDate = document.getElementById('modalDate');
    const modalTopic = document.getElementById('modalTopic');
    
    // Modal elementlerinin varlığını kontrol et
    if (!modal || !questionText || !optionsContainer || !modalDate || !modalTopic) {
        console.error('Modal elementleri bulunamadı');
        return;
    }
    
    // Soru metnini ayarla
    questionText.textContent = questionData.question_text;
    
    // Seçenekleri oluştur
    const options = [
        { key: 'A', text: questionData.option_a },
        { key: 'B', text: questionData.option_b },
        { key: 'C', text: questionData.option_c },
        { key: 'D', text: questionData.option_d }
    ];
    
    let optionsHtml = '';
    options.forEach(option => {
        let className = 'modal-option';
        if (option.key === questionData.correct_answer) {
            className += ' correct';
        } else if (option.key === questionData.user_answer) {
            className += ' wrong';
        }
        
        optionsHtml += `
            <div class="${className}">
                <strong>${option.key}.</strong> ${option.text}
            </div>
        `;
    });
    
    optionsContainer.innerHTML = optionsHtml;
    
    // Tarih ve konu bilgilerini ayarla
    modalDate.textContent = new Date(questionData.created_at).toLocaleDateString('tr-TR');
    modalTopic.textContent = questionData.topic;
    
    // Modalı göster
    modal.classList.add('show');
}

// Modal kapatma işlevi
function closeWrongAnswerModal() {
    const modal = document.getElementById('wrongAnswerModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Modal kapatma butonu
    const modalCloseBtn = document.getElementById('modalClose');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeWrongAnswerModal);
    }
    
    // Modal dışına tıklayarak kapatma
    const wrongAnswerModal = document.getElementById('wrongAnswerModal');
    if (wrongAnswerModal) {
        wrongAnswerModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeWrongAnswerModal();
            }
        });
    }
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeWrongAnswerModal();
        }
    });
});

// Başarıları kontrol et
async function checkAchievements() {
    try {
        const response = await fetch('/api/achievements/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            console.error('Başarı kontrolü API hatası:', response.status, response.statusText);
            return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data.new_achievements.length > 0) {
            showAchievementNotification(result.data.new_achievements);
            // Başarıları yenile
            await loadAchievements();
        }
    } catch (error) {
        console.error('Başarı kontrolü hatası:', error);
    }
}

// Yeni başarı bildirimi göster
function showAchievementNotification(achievements) {
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <div class="achievement-notification-content">
                    <div class="achievement-notification-icon">${achievement.icon}</div>
                    <div class="achievement-notification-text">
                        <div class="achievement-notification-title">🏆 Yeni Başarı!</div>
                        <div class="achievement-notification-name">${achievement.name}</div>
                        <div class="achievement-notification-description">${achievement.description}</div>
                    </div>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 350px;
                animation: slideInRight 0.5s ease-out;
                border: 3px solid #FFD700;
            `;
            
            document.body.appendChild(notification);
            
            // 5 saniye sonra kaldır
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.5s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 5000);
        }, index * 1000); // Her başarı için 1 saniye arayla göster
    });
}

// Genel istatistikleri yükle
async function loadOverviewStats() {
    try {
        const response = await fetch('/api/user/stats', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            
            // İstatistikleri güncelle
            updateStatElement('totalQuestionsSolved', stats.total_questions);
            updateStatElement('totalCorrectAnswers', stats.correct_questions);
            updateStatElement('successRate', `${stats.success_percentage}%`);
            updateStatElement('totalPoints', stats.total_points);
            
            // Animasyonlu güncelleme
            animateStatUpdates();
        }
    } catch (error) {
        console.error('Genel istatistik yükleme hatası:', error);
    }
}







// Başarıları yükle (tüm başarılar)
async function loadAchievements() {
    try {
        console.log('🔄 Başarılar yükleniyor...');
        const response = await fetch('/api/achievements/all', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('📡 API Response status:', response.status);
        const result = await response.json();
        console.log('📊 API Response data:', result);
        
        if (result.success) {
            const achievements = result.data.achievements;
            console.log('🏆 Achievements loaded:', achievements.length);
            displayAchievements(achievements);
            
            // Debug bilgisini güncelle
            const debugInfo = document.getElementById('debugInfo');
            const debugText = document.getElementById('debugText');
            if (debugInfo && debugText) {
                debugInfo.style.display = 'block';
                debugText.textContent = `Başarılar yüklendi: ${achievements.length} adet`;
            }
        } else {
            console.error('❌ API Error:', result.message);
            showEmptyState('achievements-section', 'Başarılar yüklenemedi', 'Lütfen sayfayı yenileyin.');
            
            // Debug bilgisini güncelle
            const debugInfo = document.getElementById('debugInfo');
            const debugText = document.getElementById('debugText');
            if (debugInfo && debugText) {
                debugInfo.style.display = 'block';
                debugText.textContent = `API Hatası: ${result.message}`;
            }
        }
    } catch (error) {
        console.error('❌ Başarılar yükleme hatası:', error);
        showEmptyState('achievements-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
    }
}

// Başarıları temizle (tekrarlanan başarımları kaldır)
async function cleanupAchievements() {
    try {
        const response = await fetch('/api/achievements/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Başarımlar temizlendi');
        } else {
            console.error('❌ Başarım temizleme hatası:', result.message);
        }
    } catch (error) {
        console.error('Başarım temizleme hatası:', error);
    }
}

// Başarıları görüntüle (yeni tasarım)
function displayAchievements(achievements) {
    const container = document.getElementById('achievementsGrid');
    
    if (!achievements || achievements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏆</div>
                <div class="empty-state-text">Henüz başarı bulunmuyor</div>
                <div class="empty-state-subtext">Quiz çözmeye başlayarak başarılarınızı görün!</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    achievements.forEach((achievement, index) => {
        // Boolean kontrolü - farklı veri tiplerini handle et
        const isEarned = achievement.earned === true || achievement.earned === 'true' || achievement.earned === 1;
        const cardClass = isEarned ? 'achievement-card earned' : 'achievement-card locked';
        const statusClass = isEarned ? 'achievement-status earned' : 'achievement-status locked';
        const statusText = isEarned ? 'KAZANILDI' : 'KİLİTLİ';
        const dateText = isEarned && achievement.earned_at ? new Date(achievement.earned_at).toLocaleDateString('tr-TR') : '';
        
        // Başarım kategorisini belirle
        let category = 'GENEL';
        if (achievement.name.includes('Soru') || achievement.name.includes('Çözülen')) {
            category = 'SORU';
        } else if (achievement.name.includes('Quiz') || achievement.name.includes('Sınav')) {
            category = 'QUIZ';
        } else if (achievement.name.includes('Başarı') || achievement.name.includes('Oran')) {
            category = 'BAŞARI';
        } else if (achievement.name.includes('Gün') || achievement.name.includes('Hafta')) {
            category = 'ZAMAN';
        } else if (achievement.name.includes('Konu')) {
            category = 'KONU';
        }
        
        html += `
            <div class="${cardClass}">
                <div class="achievement-status ${statusClass}">${statusText}</div>
                <div class="achievement-header">
                    <div class="achievement-icon">
                        ${achievement.icon}
                    </div>
                    <div class="achievement-info">
                        <div class="achievement-category">${category}</div>
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                </div>
                <div class="achievement-progress">
                    <div class="progress-bar-achievement">
                        <div class="progress-fill-achievement" style="width: ${isEarned ? '100%' : '0%'}"></div>
                    </div>
                    <div class="progress-text">
                        ${isEarned ? 'Kazanıldı!' : achievement.requirement}
                    </div>
                </div>
                ${isEarned ? `<div class="achievement-date">${dateText}</div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Haftalık özeti yükle
async function loadWeeklySummary() {
    try {
        const response = await fetch('/api/progress/weekly', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const weeks = result.data.weeks;
            displayWeeklySummary(weeks);
        } else {
            showEmptyState('weekly-summary-section', 'Henüz haftalık veri bulunmuyor', 'Quiz çözmeye başlayarak haftalık özetinizi görün!');
        }
    } catch (error) {
        console.error('Haftalık özet yükleme hatası:', error);
        showEmptyState('weekly-summary-section', 'Veri yüklenemedi', 'Lütfen sayfayı yenileyin.');
    }
}

// Haftalık özeti görüntüle
function displayWeeklySummary(weeks) {
    const container = document.getElementById('weeklyCards');
    
    if (weeks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Henüz haftalık veri bulunmuyor</div>
                <div class="empty-state-subtext">Quiz çözmeye başlayarak haftalık özetinizi görün!</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    weeks.forEach(week => {
        const successRate = week.total_questions > 0 ? Math.round((week.correct_questions / week.total_questions) * 100) : 0;
        
        html += `
            <div class="weekly-card">
                <div class="weekly-header">
                    <span class="weekly-title">${week.week_title}</span>
                    <span class="weekly-date">${week.date_range}</span>
                </div>
                <div class="weekly-stats">
                    <div class="weekly-stat">
                        <span class="weekly-stat-value">${week.total_questions}</span>
                        <span class="weekly-stat-label">Toplam Soru</span>
                    </div>
                    <div class="weekly-stat">
                        <span class="weekly-stat-value">${week.correct_questions}</span>
                        <span class="weekly-stat-label">Doğru</span>
                    </div>
                    <div class="weekly-stat">
                        <span class="weekly-stat-value">${successRate}%</span>
                        <span class="weekly-stat-label">Başarı</span>
                    </div>
                    <div class="weekly-stat">
                        <span class="weekly-stat-value">${week.points_earned}</span>
                        <span class="weekly-stat-label">Puan</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}



// İstatistik elementini güncelle
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

// Boş durum göster
function showEmptyState(sectionId, title, subtitle) {
    const section = document.querySelector(`#${sectionId}`);
    if (section) {
        // Eğer content bulunamazsa, section'ı güncelle
        section.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-text">${title}</div>
                <div class="empty-state-subtext">${subtitle}</div>
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