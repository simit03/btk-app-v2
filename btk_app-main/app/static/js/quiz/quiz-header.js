// Quiz Header Module
class QuizHeader {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.init();
    }

    init() {
        this.updateProgress();
        this.initTimer();
    }

    setTotalQuestions(total) {
        this.totalQuestions = total;
        this.updateProgress();
    }

    setCurrentQuestion(current) {
        this.currentQuestion = current;
        this.updateProgress();
    }

    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        console.log('Progress fill element:', progressFill);
        console.log('Total questions:', this.totalQuestions);
        console.log('Current question:', this.currentQuestion);
        
        if (progressFill && this.totalQuestions > 0) {
            // Progress should be based on completed questions (currentQuestion + 1)
            // But we want to show progress as we go through questions
            const percentage = Math.min(((this.currentQuestion + 1) / this.totalQuestions) * 100, 100);
            
            console.log(`Progress: ${this.currentQuestion + 1}/${this.totalQuestions} = ${percentage}%`);
            
            // Animate progress bar
            gsap.to(progressFill, {
                width: `${percentage}%`,
                duration: 0.5,
                ease: 'power2.out'
            });
        } else {
            console.log('Progress fill not found or total questions is 0');
        }
    }

    initTimer() {
        const timerDisplay = document.querySelector('.question-timer');
        if (timerDisplay) {
            this.updateTimerDisplay();
        }
    }

    startTimer(seconds) {
        this.timeLeft = seconds;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.onTimeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerDisplay = document.querySelector('.question-timer');
        if (timerDisplay) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Add warning class when time is running low
            if (this.timeLeft <= 30) {
                timerDisplay.classList.add('timer-warning');
            } else {
                timerDisplay.classList.remove('timer-warning');
            }
        }
    }

    onTimeUp() {
        // Trigger time up event
        const event = new CustomEvent('quizTimeUp', {
            detail: { questionIndex: this.currentQuestion }
        });
        document.dispatchEvent(event);
    }

    animateHeader() {
        const header = document.querySelector('.quiz-header');
        if (header) {
            gsap.fromTo(header, 
                { y: -50, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
            );
        }
    }

    updateTitle(title) {
        const titleElement = document.querySelector('.quiz-title');
        if (titleElement) {
            gsap.to(titleElement, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    titleElement.textContent = title;
                    gsap.to(titleElement, { opacity: 1, duration: 0.3 });
                }
            });
        }
    }

    updateSubtitle(subtitle) {
        const subtitleElement = document.querySelector('.quiz-subtitle');
        if (subtitleElement) {
            gsap.to(subtitleElement, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    subtitleElement.textContent = subtitle;
                    gsap.to(subtitleElement, { opacity: 1, duration: 0.3 });
                }
            });
        }
    }
}

// Export for use in main quiz module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizHeader;
} else {
    window.QuizHeader = QuizHeader;
} 