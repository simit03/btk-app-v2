// Quiz Controls Module
class QuizControls {
    constructor() {
        this.controlsContainer = null;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 0;
        this.init();
    }

    init() {
        this.controlsContainer = document.querySelector('.quiz-controls-container .quiz-controls');
        this.bindEvents();
    }

    bindEvents() {
        const prevBtn = this.controlsContainer.querySelector('#prevBtn');
        const nextBtn = this.controlsContainer.querySelector('#nextBtn');
        const skipBtn = this.controlsContainer.querySelector('#skipBtn');
        const submitBtn = this.controlsContainer.querySelector('#submitBtn');

        prevBtn.addEventListener('click', () => this.previousQuestion());
        nextBtn.addEventListener('click', () => this.nextQuestion());
        skipBtn.addEventListener('click', () => this.skipQuestion());
        submitBtn.addEventListener('click', () => this.submitAnswer());
    }

    setTotalQuestions(total) {
        this.totalQuestions = total;
        this.updateNavigation();
    }

    setCurrentQuestion(index) {
        this.currentQuestionIndex = index;
        this.updateNavigation();
    }

    updateNavigation() {
        const prevBtn = this.controlsContainer.querySelector('#prevBtn');
        const nextBtn = this.controlsContainer.querySelector('#nextBtn');
        const navInfo = this.controlsContainer.querySelector('.quiz-nav-info');

        // Update navigation info
        if (navInfo) {
            navInfo.textContent = `${this.currentQuestionIndex + 1} / ${this.totalQuestions}`;
        }

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
            prevBtn.classList.toggle('disabled', this.currentQuestionIndex === 0);
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentQuestionIndex === this.totalQuestions - 1;
            nextBtn.classList.toggle('disabled', this.currentQuestionIndex === this.totalQuestions - 1);
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            const event = new CustomEvent('navigateQuestion', {
                detail: { direction: 'prev', index: this.currentQuestionIndex - 1 }
            });
            document.dispatchEvent(event);
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            const event = new CustomEvent('navigateQuestion', {
                detail: { direction: 'next', index: this.currentQuestionIndex + 1 }
            });
            document.dispatchEvent(event);
        }
    }

    skipQuestion() {
        const event = new CustomEvent('skipQuestion', {
            detail: { questionIndex: this.currentQuestionIndex }
        });
        document.dispatchEvent(event);
    }

    submitAnswer() {
        const event = new CustomEvent('submitAnswer', {
            detail: { questionIndex: this.currentQuestionIndex }
        });
        document.dispatchEvent(event);
    }

    showSubmitButton() {
        const submitBtn = this.controlsContainer.querySelector('#submitBtn');
        if (submitBtn) {
            gsap.to(submitBtn, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }

    hideSubmitButton() {
        const submitBtn = this.controlsContainer.querySelector('#submitBtn');
        if (submitBtn) {
            gsap.to(submitBtn, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                ease: 'power2.in'
            });
        }
    }

    disableControls() {
        const buttons = this.controlsContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = true;
            button.classList.add('btn-disabled');
        });
    }

    enableControls() {
        const buttons = this.controlsContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
            button.classList.remove('btn-disabled');
        });
        this.updateNavigation();
    }

    animateControlsIn() {
        if (!this.controlsContainer) return;

        gsap.fromTo(this.controlsContainer, {
            opacity: 0,
            y: 30
        }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    showTimerDisplay(timeLeft) {
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'quiz-timer-display';
        timerDisplay.innerHTML = `
            <div class="timer-icon"></div>
            <span>${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}</span>
        `;
        
        this.controlsContainer.appendChild(timerDisplay);
        
        gsap.fromTo(timerDisplay, {
            opacity: 0,
            scale: 0.8
        }, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    updateTimerDisplay(timeLeft) {
        const timerDisplay = this.controlsContainer.querySelector('.quiz-timer-display span');
        if (timerDisplay) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 30) {
                timerDisplay.parentElement.classList.add('timer-warning');
            } else {
                timerDisplay.parentElement.classList.remove('timer-warning');
            }
        }
    }

    destroy() {
        if (this.controlsContainer) {
            this.controlsContainer.innerHTML = '';
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizControls;
} else {
    window.QuizControls = QuizControls;
} 