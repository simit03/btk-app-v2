// Quiz Main Module - Orchestrates all quiz functionality
// This file imports all modular quiz JS components

// Import GSAP for animations
// Note: GSAP should be loaded before this file

// Import Quiz Modules
// Note: These modules should be loaded before this main file

class QuizApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.userAnswers = [];
        this.correctAnswers = 0;
        this.quizSessionId = null;
        this.isQuizActive = false;
        this.quizHeader = null;
        this.aiChat = null;
         this.answeredQuestions = [];
        
        this.initializeQuiz();
    }
    
    async initializeQuiz() {
        try {
            // Quiz oturumu başlat
            const sessionResponse = await fetch('/api/quiz/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                this.quizSessionId = sessionData.data.session_id;
            } else {
                let errorPayload = null;
                try { errorPayload = await sessionResponse.json(); } catch (_) {}
                const message = (errorPayload && (errorPayload.message || errorPayload.error)) || sessionResponse.statusText || 'Quiz oturumu başlatılamadı.';
                console.error('Quiz oturumu başlatılamadı:', message);
                const quizContainer = document.querySelector('.quiz-container');
                if (quizContainer) {
                    quizContainer.innerHTML = `
                        <div class="quiz-error-container">
                            <div class="quiz-error-content">
                                <div class="error-icon">❌</div>
                                <h2>Quiz Başlatılamadı</h2>
                                <p>${message}</p>
                                <div class="error-actions">
                                    <button onclick="window.location.href='/profile'" class="btn-primary">Profil Sayfasına Git</button>
                                    <button onclick="window.location.reload()" class="btn-secondary">Sayfayı Yenile</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
                return;
            }
            
            // Soruları getir
            const response = await fetch('/api/quiz/questions?limit=20');
            let payload = null;
            try { payload = await response.json(); } catch (_) { payload = null; }
            if (response.ok && payload && payload.data) {
                this.questions = payload.data.questions;
                this.userAnswers = new Array(this.questions.length).fill(null);
                 this.answeredQuestions = new Array(this.questions.length).fill(false);
                
                // Quiz header'ı başlat
                this.quizHeader = new QuizHeader();
                this.quizHeader.setTotalQuestions(this.questions.length);
                this.quizHeader.setCurrentQuestion(0);
                
                console.log('Quiz initialized with', this.questions.length, 'questions');
                
                // Hariç tutulan soru sayısını göster
                if (payload.data.excluded_questions > 0) {
                    this.showExcludedQuestionsInfo(payload.data.excluded_questions);
                }
                
                this.displayQuestion();
                this.isQuizActive = true;
                
                // Initialize AI Chat
                this.initializeAIChat();
            } else {
                const message = (payload && (payload.message || payload.error)) || response.statusText || 'Sorular yüklenemedi.';
                console.error('Sorular yüklenemedi:', message);
                
                // Hata mesajını göster
                const quizContainer = document.querySelector('.quiz-container');
                quizContainer.innerHTML = `
                    <div class="quiz-error-container">
                        <div class="quiz-error-content">
                            <div class="error-icon">❌</div>
                            <h2>Quiz Başlatılamadı</h2>
                            <p>${message}</p>
                            <div class="error-actions">
                                <button onclick="window.location.href='/profile'" class="btn-primary">Profil Sayfasına Git</button>
                                <button onclick="window.location.reload()" class="btn-secondary">Sayfayı Yenile</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Quiz başlatma hatası:', error);
        }
    }
    
    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Progress bar'ı güncelle
        if (this.quizHeader) {
            this.quizHeader.setCurrentQuestion(this.currentQuestionIndex);
        }
        
        // Soru numarasını güncelle
        document.querySelector('.question-number').textContent = `Soru ${question.number}`;
        document.querySelector('.question-text').textContent = question.question_text;
        
        // Şıkları güncelle
        const optionsContainer = document.querySelector('.quiz-options');
        optionsContainer.innerHTML = '';
        
        Object.entries(question.options).forEach(([key, value]) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            optionDiv.innerHTML = `
                <div class="option-label">
                    <span class="option-letter">${key}</span>
                    <span class="option-text">${value}</span>
                </div>
            `;
            
            optionDiv.addEventListener('click', () => this.selectOption(key));
            optionsContainer.appendChild(optionDiv);
        });

         // Daha önce seçili cevabı görsel olarak işaretle
         const previousAnswer = this.userAnswers[this.currentQuestionIndex];
         if (previousAnswer) {
             const optionItems = document.querySelectorAll('.option-item');
             optionItems.forEach(item => {
                 const letterEl = item.querySelector('.option-letter');
                 if (letterEl && letterEl.textContent.trim() === previousAnswer) {
                     item.classList.add('selected');
                 }
             });
         }
        
        // Navigasyon bilgilerini güncelle
        document.querySelector('.quiz-nav-info').textContent = `${this.currentQuestionIndex + 1} / ${this.questions.length}`;
        
        // Butonları güncelle
        document.getElementById('prevBtn').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentQuestionIndex === this.questions.length - 1;

         // Sorunun cevaplanma durumuna göre etkileşimi ayarla
         if (this.answeredQuestions[this.currentQuestionIndex]) {
             this.disableInteractionsForCurrentQuestion();
         } else {
             this.enableInteractionsForCurrentQuestion();
         }
    }
    
    selectOption(option) {
        // Eğer soru zaten cevaplandıysa seçim yapılmasın
        if (this.answeredQuestions[this.currentQuestionIndex]) {
            return;
        }

        // Önceki seçimi temizle
        document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Yeni seçimi işaretle (option harfine göre)
        const optionItems = document.querySelectorAll('.option-item');
        for (const item of optionItems) {
            const letterEl = item.querySelector('.option-letter');
            if (letterEl && letterEl.textContent.trim() === option) {
                item.classList.add('selected');
                break;
            }
        }

        // Cevabı kaydet
        this.userAnswers[this.currentQuestionIndex] = option;
    }
    
    async submitAnswer() {
        // Eğer bu soru daha önce cevaplandıysa tekrar gönderme
        if (this.answeredQuestions[this.currentQuestionIndex]) {
            return;
        }

        if (this.userAnswers[this.currentQuestionIndex] === null) {
            alert('Lütfen bir seçenek seçin!');
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        const isCorrect = userAnswer === question.correct_answer;
        
        // Çift tıklamaları engellemek için hemen kilitle
        this.answeredQuestions[this.currentQuestionIndex] = true;
        this.disableInteractionsForCurrentQuestion();

        if (isCorrect) {
            this.correctAnswers++;
            this.showCorrectAnimation();
        } else {
            this.showIncorrectAnimation();
            
            // Yanlış cevap için AI yardımı
            if (this.aiChat) {
                const options = question.options;
                this.aiChat.autoHelpForWrongAnswer(
                    question.question_text,
                    userAnswer,
                    options
                );
            }
        }
        
        // Cevabı sunucuya gönder
        try {
            await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question_id: question.id,
                    user_answer: userAnswer,
                    is_correct: isCorrect,
                    session_id: this.quizSessionId
                })
            });
        } catch (error) {
            console.error('Cevap gönderme hatası:', error);
        }
        
        // Sonraki soruya geç
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    skipQuestion() {
        this.nextQuestion();
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            // Progress bar'ı güncelle
            if (this.quizHeader) {
                this.quizHeader.setCurrentQuestion(this.currentQuestionIndex);
            }
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            // Progress bar'ı güncelle
            if (this.quizHeader) {
                this.quizHeader.setCurrentQuestion(this.currentQuestionIndex);
            }
            this.displayQuestion();
        }
    }

     enableInteractionsForCurrentQuestion() {
         const submitBtn = document.getElementById('submitBtn');
         if (submitBtn) {
             submitBtn.disabled = false;
             submitBtn.classList.remove('btn-disabled');
         }
         document.querySelectorAll('.option-item').forEach(item => {
             item.style.pointerEvents = 'auto';
             item.style.opacity = '1';
         });
     }

     disableInteractionsForCurrentQuestion() {
         const submitBtn = document.getElementById('submitBtn');
         if (submitBtn) {
             submitBtn.disabled = true;
             submitBtn.classList.add('btn-disabled');
         }
         document.querySelectorAll('.option-item').forEach(item => {
             item.style.pointerEvents = 'none';
             item.style.opacity = '0.7';
         });
     }
    
    async showResults() {
        // Quiz'i tamamla
        try {
            const response = await fetch('/api/quiz/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: this.quizSessionId,
                    correct_answers: this.correctAnswers,
                    total_questions: this.questions.length
                })
            });
            
            const result = await response.json();
            
            // Başarı kazanıldıysa göster
            if (result.success && result.data.achievement_earned) {
                this.showAchievementNotification(result.data.achievement_earned);
            }
        } catch (error) {
            console.error('Quiz tamamlama hatası:', error);
        }
        
        // Sonuçları göster
        const scorePercentage = Math.round((this.correctAnswers / this.questions.length) * 100);
        
        document.querySelector('.score-percentage').textContent = `${scorePercentage}%`;
        document.querySelector('.score-details').textContent = `${this.correctAnswers} / ${this.questions.length} doğru`;
        
        // Progress bar'ı gizle
        const quizHeader = document.querySelector('.quiz-header-container');
        if (quizHeader) {
            quizHeader.style.display = 'none';
        }
        
        // Quiz container'ı gizle, sonuçları göster
        document.querySelector('.quiz-content').style.display = 'none';
        document.querySelector('.quiz-results-container').style.display = 'block';
        
        // Konfeti efekti
        if (scorePercentage >= 80) {
            this.showConfetti();
        }
    }
    
    showAchievementNotification(achievement) {
        // Başarı bildirimi oluştur
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animasyon için GSAP kullan
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(notification, 
                { 
                    scale: 0, 
                    opacity: 0,
                    y: 50
                },
                { 
                    scale: 1, 
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "back.out(1.7)"
                }
            );
            
            // 5 saniye sonra kaldır
            setTimeout(() => {
                gsap.to(notification, {
                    scale: 0.8,
                    opacity: 0,
                    y: -50,
                    duration: 0.3,
                    onComplete: () => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }
                });
            }, 5000);
        } else {
            // GSAP yoksa basit animasyon
            notification.style.transform = 'scale(0)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                notification.style.transition = 'all 0.5s ease';
                notification.style.transform = 'scale(1)';
                notification.style.opacity = '1';
            }, 100);
            
            setTimeout(() => {
                notification.style.transform = 'scale(0.8)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        }
    }
    
    showCorrectAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'correct-answer-overlay';
        overlay.innerHTML = '<div class="correct-symbol">✓</div>';
        document.body.appendChild(overlay);
        
        // Balık ekle
        this.addScoreFish();
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 2500);
    }

    showIncorrectAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'wrong-answer-overlay';
        overlay.innerHTML = '<div class="wrong-symbol">✗</div>';
        document.body.appendChild(overlay);
        
        // Çarpı işareti ekle
        this.addScoreCross();
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 2000);
    }

    showConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    showExcludedQuestionsInfo(excludedCount) {
        // Hariç tutulan soru bilgisini göster
        const infoDiv = document.createElement('div');
        infoDiv.className = 'excluded-questions-info';
        infoDiv.innerHTML = `
            <div class="info-icon">✅</div>
            <div class="info-text">
                <strong>${excludedCount} soru</strong> daha önce doğru cevaplandığı için bu quiz'de gösterilmiyor.
            </div>
        `;
        
        // Quiz container'ın başına ekle
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.insertBefore(infoDiv, quizContainer.firstChild);
        
        // 5 saniye sonra kaldır
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.style.opacity = '0';
                setTimeout(() => {
                    if (infoDiv.parentNode) {
                        infoDiv.parentNode.removeChild(infoDiv);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    showAllQuestionsCompletedMessage() {
        // Tüm sorular tamamlandı mesajı
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.innerHTML = `
            <div class="all-questions-completed">
                <div class="completion-icon">🎉</div>
                <h2>Tüm Soruları Tamamladınız!</h2>
                <p>Bu sınıf için tüm soruları doğru cevapladınız. Yeni sorular eklenene kadar bekleyin.</p>
                <div class="completion-stats">
                    <div class="stat-item">
                        <span class="stat-number">100%</span>
                        <span class="stat-label">Başarı</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">🏆</span>
                        <span class="stat-label">Mükemmel</span>
                    </div>
                </div>
                <button class="btn-primary" onclick="location.reload()">Yenile</button>
            </div>
        `;
    }
    
    initializeAIChat() {
        try {
            console.log('🤖 Initializing AI Chat...');
            this.aiChat = new AIChat();
            console.log('✅ AI Chat initialized successfully');
        } catch (error) {
            console.error('❌ AI Chat initialization error:', error);
        }
    }

    addScoreFish() {
        const scoreContainer = document.querySelector('.score-container');
        if (scoreContainer) {
            const fish = document.createElement('div');
            fish.className = 'score-fish';
            fish.innerHTML = '🐠';
            
            // Mevcut satırları say
            const rows = scoreContainer.querySelectorAll('.score-row');
            const currentRow = rows[rows.length - 1];
            
            if (currentRow && currentRow.children.length < 5) {
                // Mevcut satıra ekle
                currentRow.appendChild(fish);
            } else {
                // Yeni satır oluştur
                const newRow = document.createElement('div');
                newRow.className = 'score-row';
                newRow.style.display = 'flex';
                newRow.style.gap = '3px';
                newRow.style.marginTop = '5px';
                newRow.appendChild(fish);
                scoreContainer.appendChild(newRow);
            }
        }
    }
    
    addScoreCross() {
        const scoreContainer = document.querySelector('.score-container');
        if (scoreContainer) {
            const cross = document.createElement('div');
            cross.className = 'score-cross';
            cross.innerHTML = '❌';
            
            // Mevcut satırları say
            const rows = scoreContainer.querySelectorAll('.score-row');
            const currentRow = rows[rows.length - 1];
            
            if (currentRow && currentRow.children.length < 5) {
                // Mevcut satıra ekle
                currentRow.appendChild(cross);
            } else {
                // Yeni satır oluştur
                const newRow = document.createElement('div');
                newRow.className = 'score-row';
                newRow.style.display = 'flex';
                newRow.style.gap = '3px';
                newRow.style.marginTop = '5px';
                newRow.appendChild(cross);
                scoreContainer.appendChild(newRow);
            }
        }
    }
}

// Quiz uygulamasını başlat
document.addEventListener('DOMContentLoaded', () => {
    const quizApp = new QuizApp();
    
    // Event listeners
    document.getElementById('submitBtn').addEventListener('click', () => {
        quizApp.submitAnswer();
    });
    
    document.getElementById('skipBtn').addEventListener('click', () => {
        quizApp.skipQuestion();
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        quizApp.nextQuestion();
    });
    
    document.getElementById('prevBtn').addEventListener('click', () => {
        quizApp.prevQuestion();
    });
});
