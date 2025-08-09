// Quiz Options Module
class QuizOptions {
    constructor() {
        this.selectedOption = null;
        this.optionsContainer = null;
        this.options = [];
        this.init();
    }

    init() {
        this.optionsContainer = document.querySelector('.quiz-options-container .quiz-options');
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('optionsChanged', (e) => {
            this.displayOptions(e.detail.options);
        });

        document.addEventListener('optionSelected', (e) => {
            this.handleOptionSelection(e.detail.optionIndex);
        });
    }

    displayOptions(options) {
        this.options = options;
        this.selectedOption = null;
        
        if (!this.optionsContainer) {
            this.createOptionsContainer();
        }

        this.optionsContainer.innerHTML = '';
        
        options.forEach((option, index) => {
            const optionElement = this.createOptionElement(option, index);
            this.optionsContainer.appendChild(optionElement);
        });

        this.animateOptionsIn();
    }

    createOptionsContainer() {
        const container = document.createElement('div');
        container.className = 'quiz-options';
        const optionsContainer = document.querySelector('.quiz-options-container');
        optionsContainer.innerHTML = '';
        optionsContainer.appendChild(container);
        this.optionsContainer = container;
    }

    createOptionElement(option, index) {
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
        optionElement.dataset.index = index;
        
        const letter = String.fromCharCode(65 + index);
        
        optionElement.innerHTML = `
            <div class="option-label">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${option.text}</span>
            </div>
            <div class="option-feedback">${option.feedback || ''}</div>
        `;

        optionElement.addEventListener('click', () => {
            this.selectOption(index);
        });

        return optionElement;
    }

    selectOption(optionIndex) {
        const previousSelected = this.optionsContainer.querySelector('.option-item.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        const optionElement = this.optionsContainer.querySelector(`[data-index="${optionIndex}"]`);
        if (optionElement) {
            optionElement.classList.add('selected');
            this.selectedOption = optionIndex;
            
            gsap.to(optionElement, {
                scale: 1.02,
                duration: 0.2,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1
            });

            const event = new CustomEvent('optionSelected', {
                detail: { optionIndex, option: this.options[optionIndex] }
            });
            document.dispatchEvent(event);
        }
    }

    handleOptionSelection(optionIndex) {
        // Sadece seçimi işle, event dispatch ETME!
        // Gerekirse burada başka işlemler yapabilirsin.
    }

    animateOptionsIn() {
        const options = this.optionsContainer.querySelectorAll('.option-item');
        
        gsap.fromTo(options, {
            opacity: 0,
            y: 30
        }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }

    showCorrectAnswer(correctOptionIndex) {
        const options = this.optionsContainer.querySelectorAll('.option-item');
        
        options.forEach((option, index) => {
            if (index === correctOptionIndex) {
                option.classList.add('correct');
                
                gsap.to(option, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    }

    showUserAnswer(userAnswerIndex, correctOptionIndex) {
        const options = this.optionsContainer.querySelectorAll('.option-item');
        
        options.forEach((option, index) => {
            if (index === userAnswerIndex && index !== correctOptionIndex) {
                option.classList.add('incorrect');
                
                gsap.to(option, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    }

    disableOptions() {
        const options = this.optionsContainer.querySelectorAll('.option-item');
        options.forEach(option => {
            option.style.pointerEvents = 'none';
            option.style.opacity = '0.7';
        });
    }

    resetOptions() {
        const options = this.optionsContainer.querySelectorAll('.option-item');
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.pointerEvents = 'auto';
            option.style.opacity = '1';
        });
        this.selectedOption = null;
    }

    getSelectedOption() {
        return this.selectedOption;
    }

    destroy() {
        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = '';
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizOptions;
} else {
    window.QuizOptions = QuizOptions;
} 