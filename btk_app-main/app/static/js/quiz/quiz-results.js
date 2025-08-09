// Quiz Results Module
class QuizResults {
    constructor() {
        this.resultsContainer = null;
        this.quizData = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('showResults', (e) => {
            this.showResults(e.detail);
        });
    }

    showResults(quizData) {
        this.quizData = quizData;
        this.createResultsContainer();
        this.calculateResults();
        this.displayResults();
        this.animateResultsIn();
    }

    createResultsContainer() {
        const container = document.createElement('div');
        container.className = 'quiz-results';
        container.innerHTML = `
            <div class="results-header">
                <h2 class="results-title">Quiz Tamamlandı!</h2>
                <p class="results-subtitle">Sonuçlarınızı görüntüleyin</p>
            </div>
            <div class="score-display">
                <div class="score-circle">
                    <div class="score-percentage">0%</div>
                </div>
                <div class="score-text">Puanınız</div>
                <div class="score-details">0 / 0 doğru</div>
            </div>
            <div class="results-stats"></div>
            <div class="results-feedback"></div>
            <div class="results-actions"></div>
        `;
        
        document.querySelector('.quiz-results-container').appendChild(container);
        this.resultsContainer = container;
    }

    calculateResults() {
        const { questions, answers, timeLimit } = this.quizData;
        let correctAnswers = 0;
        let totalQuestions = questions.length;
        let totalTime = 0;
        let skippedQuestions = 0;

        answers.forEach((answer, index) => {
            if (answer !== null && answer !== undefined) {
                if (answer === questions[index].correctAnswer) {
                    correctAnswers++;
                }
                totalTime += answer.timeSpent || 0;
            } else {
                skippedQuestions++;
            }
        });

        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const averageTime = totalTime / (totalQuestions - skippedQuestions);

        this.results = {
            correctAnswers,
            totalQuestions,
            percentage,
            averageTime,
            skippedQuestions,
            totalTime
        };
    }

    displayResults() {
        if (!this.resultsContainer) return;

        const { correctAnswers, totalQuestions, percentage, averageTime, skippedQuestions } = this.results;

        // Update score display
        const scorePercentage = this.resultsContainer.querySelector('.score-percentage');
        const scoreDetails = this.resultsContainer.querySelector('.score-details');
        
        if (scorePercentage) {
            gsap.to(scorePercentage, {
                textContent: 0,
                duration: 0,
                onComplete: () => {
                    gsap.to(scorePercentage, {
                        textContent: percentage,
                        duration: 2,
                        ease: 'power2.out',
                        snap: { textContent: 1 }
                    });
                }
            });
        }

        if (scoreDetails) {
            scoreDetails.textContent = `${correctAnswers} / ${totalQuestions} doğru`;
        }

        // Update stats
        const statsContainer = this.resultsContainer.querySelector('.results-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${correctAnswers}</div>
                    <div class="stat-label">Doğru Cevap</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalQuestions - correctAnswers - skippedQuestions}</div>
                    <div class="stat-label">Yanlış Cevap</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${skippedQuestions}</div>
                    <div class="stat-label">Atlanan</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Math.round(averageTime)}s</div>
                    <div class="stat-label">Ortalama Süre</div>
                </div>
            `;
        }

        // Update feedback
        this.updateFeedback(percentage);

        // Update actions
        this.updateActions();
    }

    updateFeedback(percentage) {
        const feedbackContainer = this.resultsContainer.querySelector('.results-feedback');
        if (!feedbackContainer) return;

        let feedbackTitle, feedbackText;

        if (percentage >= 90) {
            feedbackTitle = 'Mükemmel!';
            feedbackText = 'Harika bir performans gösterdiniz. Bu konuda gerçekten uzmanlaşmışsınız.';
        } else if (percentage >= 75) {
            feedbackTitle = 'Çok İyi!';
            feedbackText = 'Güzel bir sonuç elde ettiniz. Biraz daha çalışarak mükemmel sonuçlar alabilirsiniz.';
        } else if (percentage >= 60) {
            feedbackTitle = 'İyi!';
            feedbackText = 'İyi bir başlangıç yaptınız. Daha fazla pratik yaparak gelişebilirsiniz.';
        } else if (percentage >= 40) {
            feedbackTitle = 'Orta';
            feedbackText = 'Temel bilgileriniz var ama daha fazla çalışmanız gerekiyor.';
        } else {
            feedbackTitle = 'Geliştirilmeli';
            feedbackText = 'Bu konuda daha fazla çalışmanız gerekiyor. Tekrar deneyin!';
        }

        feedbackContainer.innerHTML = `
            <div class="feedback-title">${feedbackTitle}</div>
            <div class="feedback-text">${feedbackText}</div>
        `;

        // Show certificate badge for high scores
        if (percentage >= 80) {
            const badge = document.createElement('div');
            badge.className = 'certificate-badge';
            badge.textContent = 'Sertifika Kazandınız!';
            feedbackContainer.appendChild(badge);
        }
    }

    updateActions() {
        const actionsContainer = this.resultsContainer.querySelector('.results-actions');
        if (!actionsContainer) return;

        actionsContainer.innerHTML = `
            <button class="quiz-btn btn-primary" id="retryBtn">Tekrar Dene</button>
            <button class="quiz-btn btn-secondary" id="homeBtn">Ana Sayfa</button>
            <button class="quiz-btn btn-success" id="shareBtn">Paylaş</button>
        `;

        // Bind action events
        const retryBtn = actionsContainer.querySelector('#retryBtn');
        const homeBtn = actionsContainer.querySelector('#homeBtn');
        const shareBtn = actionsContainer.querySelector('#shareBtn');

        retryBtn.addEventListener('click', () => this.retryQuiz());
        homeBtn.addEventListener('click', () => this.goHome());
        shareBtn.addEventListener('click', () => this.shareResults());
    }

    animateResultsIn() {
        if (!this.resultsContainer) return;

        gsap.timeline()
            .fromTo(this.resultsContainer, {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            })
            .fromTo(this.resultsContainer.querySelector('.results-title'), {
                x: -30,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.4')
            .fromTo(this.resultsContainer.querySelector('.score-circle'), {
                scale: 0,
                rotation: 180
            }, {
                scale: 1,
                rotation: 0,
                duration: 1,
                ease: 'back.out(1.7)'
            }, '-=0.2')
            .fromTo(this.resultsContainer.querySelectorAll('.stat-item'), {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.5');
    }

    retryQuiz() {
        const event = new CustomEvent('retryQuiz', {
            detail: { quizData: this.quizData }
        });
        document.dispatchEvent(event);
    }

    goHome() {
        window.location.href = '/';
    }

    shareResults() {
        const { percentage, correctAnswers, totalQuestions } = this.results;
        const shareText = `Quiz sonucum: ${correctAnswers}/${totalQuestions} doğru (%${percentage})`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz Sonucum',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Sonuç panoya kopyalandı!');
            });
        }
    }

    destroy() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizResults;
} else {
    window.QuizResults = QuizResults;
} 