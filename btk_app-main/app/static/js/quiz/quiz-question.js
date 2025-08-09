// Quiz Question Module
class QuizQuestion {
    constructor() {
        this.currentQuestion = null;
        this.questionContainer = null;
        this.init();
    }

    init() {
        this.questionContainer = document.querySelector('.quiz-question-container .quiz-question');
        this.bindEvents();
    }

    bindEvents() {
        // Listen for question change events
        document.addEventListener('questionChanged', (e) => {
            this.displayQuestion(e.detail.question);
        });
    }

    displayQuestion(questionData) {
        this.currentQuestion = questionData;
        
        if (!this.questionContainer) {
            this.createQuestionContainer();
        }

        this.updateQuestionContent(questionData);
        this.animateQuestionIn();
    }

    createQuestionContainer() {
        const container = document.createElement('div');
        container.className = 'quiz-question';
        container.innerHTML = `
            <div class="question-number">Soru 1</div>
            <div class="question-timer">00:00</div>
            <div class="question-text"></div>
            <div class="question-image-container"></div>
        `;
        
        const questionContainer = document.querySelector('.quiz-question-container');
        questionContainer.innerHTML = '';
        questionContainer.appendChild(container);
        this.questionContainer = container;
    }

    updateQuestionContent(questionData) {
        if (!this.questionContainer) return;

        const questionNumber = this.questionContainer.querySelector('.question-number');
        const questionText = this.questionContainer.querySelector('.question-text');
        const imageContainer = this.questionContainer.querySelector('.question-image-container');

        // Update question number
        if (questionNumber) {
            questionNumber.textContent = `Soru ${questionData.number || 1}`;
        }

        // Update question text
        if (questionText) {
            questionText.textContent = questionData.text || '';
        }

        // Update question image if exists
        if (imageContainer) {
            imageContainer.innerHTML = '';
            if (questionData.image) {
                const img = document.createElement('img');
                img.src = questionData.image;
                img.alt = 'Question Image';
                img.className = 'question-image';
                imageContainer.appendChild(img);
            }
        }
    }

    animateQuestionIn() {
        if (!this.questionContainer) return;

        // Reset animation state
        this.questionContainer.style.opacity = '0';
        this.questionContainer.style.transform = 'translateY(30px)';

        // Animate question elements
        gsap.timeline()
            .to(this.questionContainer, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out'
            })
            .fromTo(this.questionContainer.querySelector('.question-number'), {
                x: -20,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.3')
            .fromTo(this.questionContainer.querySelector('.question-text'), {
                y: 20,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            }, '-=0.2');
    }

    animateQuestionOut() {
        if (!this.questionContainer) return;

        return new Promise((resolve) => {
            gsap.to(this.questionContainer, {
                opacity: 0,
                y: -30,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: resolve
            });
        });
    }

    showCorrectAnswer(correctOptionIndex) {
        const options = document.querySelectorAll('.option-item');
        
        options.forEach((option, index) => {
            if (index === correctOptionIndex) {
                option.classList.add('correct');
                gsap.to(option, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }

    showUserAnswer(userAnswerIndex, correctOptionIndex) {
        const options = document.querySelectorAll('.option-item');
        
        options.forEach((option, index) => {
            if (index === userAnswerIndex && index !== correctOptionIndex) {
                option.classList.add('incorrect');
                gsap.to(option, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }

    resetQuestion() {
        if (!this.questionContainer) return;

        // Remove all option classes
        const options = document.querySelectorAll('.option-item');
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });

        // Reset question container
        gsap.set(this.questionContainer, {
            opacity: 1,
            y: 0
        });
    }

    updateTimer(timeLeft) {
        const timerElement = this.questionContainer?.querySelector('.question-timer');
        if (timerElement) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 30) {
                timerElement.classList.add('timer-warning');
            } else {
                timerElement.classList.remove('timer-warning');
            }
        }
    }

    getQuestionData() {
        return this.currentQuestion;
    }

    destroy() {
        if (this.questionContainer) {
            this.questionContainer.innerHTML = '';
        }
    }
}

// Export for use in main quiz module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizQuestion;
} else {
    window.QuizQuestion = QuizQuestion;
} 