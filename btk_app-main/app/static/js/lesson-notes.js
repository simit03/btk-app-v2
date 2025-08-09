/**
 * Lesson Notes JavaScript
 * Ders notları sayfası işlevleri
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Lesson notes page loaded');
    
    // Sayfa yüklendiğinde animasyonları başlat
    initializeAnimations();
    
    // Back to top butonu ekle
    addBackToTopButton();
    
    // Scroll event listener ekle
    window.addEventListener('scroll', handleScroll);
});

// Konu başlıklarını açma/kapama fonksiyonu
function toggleTopic(header) {
    const topic = header.closest('.lesson-topic');
    const content = topic.querySelector('.topic-content');
    const arrow = header.querySelector('.topic-arrow');
    
    // Diğer açık konuları kapat
    const allTopics = document.querySelectorAll('.lesson-topic');
    allTopics.forEach(otherTopic => {
        if (otherTopic !== topic) {
            const otherContent = otherTopic.querySelector('.topic-content');
            const otherArrow = otherTopic.querySelector('.topic-arrow');
            
            if (otherContent.classList.contains('expanded')) {
                otherContent.classList.remove('expanded');
                otherArrow.style.transform = 'rotate(0deg)';
                otherTopic.classList.remove('active');
            }
        }
    });
    
    // Mevcut konuyu aç/kapat
    if (content.classList.contains('expanded')) {
        // Kapat
        content.classList.remove('expanded');
        arrow.style.transform = 'rotate(0deg)';
        topic.classList.remove('active');
        
        // Animasyonlu kapatma
        setTimeout(() => {
            content.style.maxHeight = '0';
        }, 300);
    } else {
        // Aç
        content.classList.add('expanded');
        arrow.style.transform = 'rotate(180deg)';
        topic.classList.add('active');
        
        // Animasyonlu açma
        content.style.maxHeight = content.scrollHeight + 'px';
        
        // Konuya smooth scroll
        setTimeout(() => {
            topic.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
}

// Sayfa animasyonlarını başlat
function initializeAnimations() {
    // Konuları sırayla göster
    const topics = document.querySelectorAll('.lesson-topic');
    topics.forEach((topic, index) => {
        topic.style.opacity = '0';
        topic.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            topic.style.transition = 'all 0.6s ease-out';
            topic.style.opacity = '1';
            topic.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Header animasyonu
    const header = document.querySelector('.lesson-notes-header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'all 0.8s ease-out';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Back to top butonu ekle
function addBackToTopButton() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.title = 'Yukarı çık';
    backToTop.onclick = scrollToTop;
    
    document.body.appendChild(backToTop);
}

// Scroll event handler
function handleScroll() {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
}

// Yukarı çık fonksiyonu
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Konu arama fonksiyonu
function searchTopics(query) {
    const topics = document.querySelectorAll('.lesson-topic');
    const searchTerm = query.toLowerCase();
    
    topics.forEach(topic => {
        const title = topic.querySelector('h3').textContent.toLowerCase();
        const description = topic.querySelector('.topic-description p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            topic.style.display = 'block';
            topic.style.opacity = '1';
        } else {
            topic.style.opacity = '0.3';
        }
    });
}

// Konu filtreleme fonksiyonu
function filterTopics(category) {
    const topics = document.querySelectorAll('.lesson-topic');
    
    topics.forEach(topic => {
        if (category === 'all' || topic.dataset.category === category) {
            topic.style.display = 'block';
            topic.style.opacity = '1';
        } else {
            topic.style.display = 'none';
        }
    });
}

// Konu favorilere ekleme
function toggleFavorite(topicId) {
    const favorites = JSON.parse(localStorage.getItem('lessonFavorites') || '[]');
    const index = favorites.indexOf(topicId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(topicId);
    }
    
    localStorage.setItem('lessonFavorites', JSON.stringify(favorites));
    updateFavoriteButton(topicId);
}

// Favori butonunu güncelle
function updateFavoriteButton(topicId) {
    const favorites = JSON.parse(localStorage.getItem('lessonFavorites') || '[]');
    const isFavorite = favorites.includes(topicId);
    
    const button = document.querySelector(`[data-topic-id="${topicId}"]`);
    if (button) {
        button.innerHTML = isFavorite ? '❤️' : '🤍';
        button.title = isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle';
    }
}

// Konu notlarını yazdır
function printTopic(topicId) {
    const topic = document.querySelector(`[data-topic-id="${topicId}"]`);
    if (topic) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Ders Notu - ${topic.querySelector('h3').textContent}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        h4 { color: #666; margin-top: 20px; }
                        ul { margin-left: 20px; }
                        li { margin-bottom: 10px; }
                        .topic-header { background: #f0f0f0; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="topic-header">
                        <h1>${topic.querySelector('h3').textContent}</h1>
                        <p>${topic.querySelector('.topic-description p').textContent}</p>
                    </div>
                    ${topic.querySelector('.topic-notes').innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Konu paylaşma
function shareTopic(topicId) {
    const topic = document.querySelector(`[data-topic-id="${topicId}"]`);
    if (topic && navigator.share) {
        const title = topic.querySelector('h3').textContent;
        const text = topic.querySelector('.topic-description p').textContent;
        const url = window.location.href;
        
        navigator.share({
            title: title,
            text: text,
            url: url
        });
    } else {
        // Fallback: URL'yi kopyala
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link kopyalandı!', 'success');
        });
    }
}

// Toast mesajı göster
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Toast stilleri
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Klavye kısayolları
document.addEventListener('keydown', function(e) {
    // ESC tuşu ile açık konuları kapat
    if (e.key === 'Escape') {
        const openTopics = document.querySelectorAll('.topic-content.expanded');
        openTopics.forEach(content => {
            const header = content.previousElementSibling;
            toggleTopic(header);
        });
    }
    
    // Enter tuşu ile seçili konuyu aç/kapat
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.classList.contains('topic-header')) {
            toggleTopic(activeElement);
        }
    }
});

// Konuları otomatik açma (ilk konu)
setTimeout(() => {
    const firstTopic = document.querySelector('.lesson-topic');
    if (firstTopic) {
        const header = firstTopic.querySelector('.topic-header');
        if (header) {
            toggleTopic(header);
        }
    }
}, 1000);

// Sayfa yüklendiğinde favori durumlarını kontrol et
document.addEventListener('DOMContentLoaded', function() {
    const topics = document.querySelectorAll('.lesson-topic');
    topics.forEach(topic => {
        const topicId = topic.dataset.topicId;
        if (topicId) {
            updateFavoriteButton(topicId);
        }
    });
});

// Konu istatistikleri
function trackTopicView(topicId) {
    const views = JSON.parse(localStorage.getItem('topicViews') || '{}');
    views[topicId] = (views[topicId] || 0) + 1;
    localStorage.setItem('topicViews', JSON.stringify(views));
}

// En çok görüntülenen konuları göster
function showMostViewedTopics() {
    const views = JSON.parse(localStorage.getItem('topicViews') || '{}');
    const sortedTopics = Object.entries(views)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    console.log('En çok görüntülenen konular:', sortedTopics);
}

// Konu açıldığında istatistik güncelle
document.addEventListener('click', function(e) {
    if (e.target.closest('.topic-header')) {
        const topic = e.target.closest('.lesson-topic');
        const topicId = topic.dataset.topicId;
        if (topicId) {
            trackTopicView(topicId);
        }
    }
});

// ===== INTERACTIVE LEARNING FUNCTIONS =====

// Check missing number exercise
function checkMissingNumber() {
    const missingElement = document.querySelector('.missing');
    if (!missingElement) return;
    
    const userAnswer = prompt('Eksik sayı nedir? (1-5 arası)');
    
    if (userAnswer === '3') {
        missingElement.textContent = '3';
        missingElement.style.color = '#00b894';
        missingElement.style.animation = 'none';
        showToast('🎉 Doğru! Eksik sayı 3\'tü!', 'success');
        earnBadge('badge-1');
    } else {
        showToast('❌ Yanlış! Tekrar dene. İpucu: 1, 2, ?, 4, 5', 'error');
    }
}

// Check apple counting game
function checkAppleCount() {
    const appleCountInput = document.getElementById('apple-count');
    if (!appleCountInput) return;
    
    const userAnswer = appleCountInput.value;
    const correctAnswer = 5;
    
    if (parseInt(userAnswer) === correctAnswer) {
        showToast('🎉 Harika! 5 elma var!', 'success');
        earnBadge('badge-3');
        appleCountInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar say ve dene.', 'error');
        appleCountInput.style.borderColor = '#ff6b6b';
    }
}

// Check comparison game
function checkComparison(operator) {
    const gameNumbers = document.querySelector('.game-numbers');
    if (!gameNumbers) return;
    
    const firstNumberElement = gameNumbers.querySelector('.game-number:first-child');
    const secondNumberElement = gameNumbers.querySelector('.game-number:last-child');
    
    if (!firstNumberElement || !secondNumberElement) return;
    
    const firstNumber = parseInt(firstNumberElement.textContent);
    const secondNumber = parseInt(secondNumberElement.textContent);
    
    let correctOperator = '';
    if (firstNumber > secondNumber) {
        correctOperator = '>';
    } else if (firstNumber < secondNumber) {
        correctOperator = '<';
    } else {
        correctOperator = '=';
    }
    
    if (operator === correctOperator) {
        const comparisonOperator = document.querySelector('.comparison-operator');
        if (comparisonOperator) {
            comparisonOperator.textContent = operator;
            comparisonOperator.style.color = '#00b894';
            comparisonOperator.style.animation = 'none';
        }
        showToast('🎉 Doğru! 8 < 12', 'success');
        earnBadge('badge-4');
    } else {
        showToast('❌ Yanlış! Tekrar dene.', 'error');
    }
}

// Earn badge function
function earnBadge(badgeId) {
    const badge = document.getElementById(badgeId);
    if (badge && !badge.classList.contains('earned')) {
        badge.classList.add('earned');
        const badgeText = badge.querySelector('.badge-text');
        const badgeName = badgeText ? badgeText.textContent : 'Rozet';
        showToast(`🏆 ${badgeName} rozetini kazandın!`, 'success');
        
        // Save badge to localStorage
        const earnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
        if (!earnedBadges.includes(badgeId)) {
            earnedBadges.push(badgeId);
            localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
        }
    }
}

// Load earned badges on page load
function loadEarnedBadges() {
    const earnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
    earnedBadges.forEach(badgeId => {
        const badge = document.getElementById(badgeId);
        if (badge) {
            badge.classList.add('earned');
        }
    });
}

// Drag and drop functionality for sorting game
function initializeDragAndDrop() {
    const sortableNumbers = document.querySelectorAll('.sortable-number');
    const container = document.querySelector('.sortable-numbers');
    
    if (!container || sortableNumbers.length === 0) return;
    
    sortableNumbers.forEach(number => {
        number.addEventListener('dragstart', handleDragStart);
        number.addEventListener('dragend', handleDragEnd);
    });
    
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const draggedElement = e.dataTransfer.getData('text/html');
    const targetElement = e.target.closest('.sortable-number');
    
    if (targetElement && targetElement !== document.querySelector('.sortable-number[draggable="true"]')) {
        const container = document.querySelector('.sortable-numbers');
        const elements = Array.from(container.children);
        const draggedIndex = elements.findIndex(el => el.outerHTML === draggedElement);
        const targetIndex = elements.indexOf(targetElement);
        
        if (draggedIndex !== -1) {
            const draggedNode = elements[draggedIndex];
            container.insertBefore(draggedNode, targetElement);
            
            // Check if numbers are in correct order
            checkSortingOrder();
        }
    }
}

function checkSortingOrder() {
    const numbers = Array.from(document.querySelectorAll('.sortable-number'));
    if (numbers.length === 0) return;
    
    const currentOrder = numbers.map(num => parseInt(num.textContent));
    const correctOrder = [1, 2, 5, 8, 9];
    
    if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
        showToast('🎉 Harika! Sayıları doğru sıraladın!', 'success');
        earnBadge('badge-5');
        
        // Disable drag and drop
        numbers.forEach(num => {
            num.draggable = false;
            num.style.opacity = '0.8';
        });
    }
}

// Number writing practice
function initializeWritingPractice() {
    const traceNumbers = document.querySelectorAll('.trace-number');
    if (traceNumbers.length === 0) return;
    
    traceNumbers.forEach(number => {
        number.addEventListener('click', function() {
            this.style.transform = 'scale(1.2)';
            this.style.boxShadow = '0 6px 20px rgba(116, 185, 255, 0.6)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 2px 8px rgba(116, 185, 255, 0.3)';
            }, 300);
            
            showToast(`📝 ${this.textContent} sayısını çizdin!`, 'info');
        });
    });
}

// Visual number line interaction
function initializeNumberLine() {
    const numberItems = document.querySelectorAll('.number-item');
    if (numberItems.length === 0) return;
    
    numberItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            showToast(`🔢 ${index} sayısını seçtin!`, 'info');
            this.style.transform = 'scale(1.2)';
            this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
            }, 500);
        });
    });
}

// Comparison visual interaction
function initializeComparisonVisuals() {
    const comparisonExamples = document.querySelectorAll('.comparison-example');
    if (comparisonExamples.length === 0) return;
    
    comparisonExamples.forEach(example => {
        example.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }, 300);
        });
    });
}

// Learning song interaction
function initializeLearningSongs() {
    const learningSongs = document.querySelectorAll('.learning-song');
    if (learningSongs.length === 0) return;
    
    learningSongs.forEach(song => {
        song.addEventListener('click', function() {
            showToast('🎵 Şarkıyı söylemeye başla!', 'info');
            this.style.background = 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)';
            
            setTimeout(() => {
                this.style.background = 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)';
            }, 1000);
        });
    });
}

// Enhanced toast function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '8px';
    toast.style.color = 'white';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '1000';
    toast.style.animation = 'slideIn 0.3s ease';
    
    // Set background color based on type
    switch(type) {
        case 'success':
            toast.style.background = 'linear-gradient(135deg, #00b894 0%, #00a085 100%)';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
            break;
        case 'info':
            toast.style.background = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
            break;
        default:
            toast.style.background = 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for toast
function addToastStyles() {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Learning progress tracking
function trackLearningProgress() {
    const topics = document.querySelectorAll('.lesson-topic');
    if (topics.length === 0) return;
    
    let completedTopics = 0;
    
    topics.forEach(topic => {
        const content = topic.querySelector('.topic-content');
        if (content && content.style.display === 'block') {
            completedTopics++;
        }
    });
    
    const progress = (completedTopics / topics.length) * 100;
    
    // Save progress to localStorage
    localStorage.setItem('learningProgress', progress);
    
    // Show progress notification
    if (progress > 0) {
        showToast(`📚 Öğrenme ilerlemen: %${Math.round(progress)}`, 'info');
    }
}

// ===== EXAMPLE QUESTION FUNCTIONS =====

// Check answer function for example questions
function checkAnswer(selectedAnswer, correctAnswer) {
    const questionContainer = event.target.closest('.example-question');
    const answerButtons = questionContainer.querySelectorAll('.answer-btn');
    const resultDiv = questionContainer.querySelector('.question-result');
    
    // Disable all buttons after answer is selected
    answerButtons.forEach(btn => {
        btn.classList.add('disabled');
    });
    
    // Find the correct and selected buttons
    const correctButton = Array.from(answerButtons).find(btn => 
        btn.textContent.startsWith(correctAnswer + ')')
    );
    const selectedButton = event.target;
    
    if (selectedAnswer === correctAnswer) {
        // Correct answer
        selectedButton.classList.add('correct');
        resultDiv.textContent = '🎉 Doğru! Harika bir iş çıkardın!';
        resultDiv.className = 'question-result correct';
        
        // Earn a badge for correct answers
        const questionId = questionContainer.querySelector('.question-result').id;
        if (questionId === 'result-1') {
            earnBadge('badge-2'); // Writing Master badge
        } else if (questionId === 'result-2') {
            earnBadge('badge-4'); // Comparison Master badge
        }
        
        showToast('✅ Doğru cevap!', 'success');
    } else {
        // Incorrect answer
        selectedButton.classList.add('incorrect');
        correctButton.classList.add('correct');
        
        resultDiv.innerHTML = `
            ❌ Yanlış cevap!<br>
            <strong>Doğru cevap:</strong> ${correctButton.textContent}<br>
            <small>Tekrar dene ve öğren!</small>
        `;
        resultDiv.className = 'question-result incorrect';
        
        showToast('❌ Yanlış! Tekrar dene.', 'error');
    }
    
    // Add explanation after a short delay
    setTimeout(() => {
        addQuestionExplanation(questionContainer, correctAnswer);
    }, 2000);
}

// Add explanation to question
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// Reset question function
function resetQuestion(questionId) {
    const questionContainer = document.getElementById(questionId).closest('.example-question');
    const answerButtons = questionContainer.querySelectorAll('.answer-btn');
    const resultDiv = questionContainer.querySelector('.question-result');
    
    // Reset buttons
    answerButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect', 'disabled');
    });
    
    // Reset result
    resultDiv.textContent = '';
    resultDiv.className = 'question-result';
}

// Track question performance
function trackQuestionPerformance(questionId, isCorrect) {
    const performance = JSON.parse(localStorage.getItem('questionPerformance') || '{}');
    
    if (!performance[questionId]) {
        performance[questionId] = { correct: 0, total: 0 };
    }
    
    performance[questionId].total++;
    if (isCorrect) {
        performance[questionId].correct++;
    }
    
    localStorage.setItem('questionPerformance', JSON.stringify(performance));
    
    // Show progress notification
    const accuracy = (performance[questionId].correct / performance[questionId].total) * 100;
    if (performance[questionId].total >= 3) {
        showToast(`📊 Bu soruda başarı oranın: %${Math.round(accuracy)}`, 'info');
    }
}

// Initialize example questions
function initializeExampleQuestions() {
    const exampleQuestions = document.querySelectorAll('.example-question');
    if (exampleQuestions.length === 0) return;
    
    exampleQuestions.forEach((question, index) => {
        // Add question number
        const questionNumber = question.querySelector('.question-content p');
        if (questionNumber) {
            questionNumber.innerHTML = `<strong>Soru ${index + 1}:</strong> ` + 
                questionNumber.innerHTML.replace('<strong>Soru:</strong>', '');
        }
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = '🔄 Tekrar Dene';
        resetButton.className = 'reset-question-btn';
        resetButton.style.cssText = `
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        resetButton.addEventListener('click', () => {
            const resultDiv = question.querySelector('.question-result');
            resetQuestion(resultDiv.id);
        });
        
        question.querySelector('.question-content').appendChild(resetButton);
    });
}

// Add CSS for reset button
function addResetButtonStyles() {
    if (!document.getElementById('reset-button-styles')) {
        const style = document.createElement('style');
        style.id = 'reset-button-styles';
        style.textContent = `
            .reset-question-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== ADDITIONAL INTERACTIVE FUNCTIONS =====

// Rhythm counting game
function checkRhythmCount() {
    const rhythmInput = document.getElementById('rhythm-count');
    if (!rhythmInput) return;
    
    const userAnswer = parseInt(rhythmInput.value);
    const correctAnswer = 10; // 5 objects counted by 2s = 10
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! İkişer sayarak 10 sayı var!', 'success');
        earnBadge('badge-6');
        rhythmInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar dene. İkişer saymayı unutma!', 'error');
        rhythmInput.style.borderColor = '#ff6b6b';
    }
}

// Rhythm missing number
function checkRhythmMissingNumber() {
    const missingElement = document.querySelector('.missing');
    if (!missingElement) return;
    
    const userAnswer = prompt('Eksik sayı nedir? (İkişer sayma)');
    
    if (userAnswer === '4') {
        missingElement.textContent = '4';
        missingElement.style.color = '#00b894';
        missingElement.style.animation = 'none';
        showToast('🎉 Doğru! Eksik sayı 4\'tü!', 'success');
        earnBadge('badge-7');
    } else {
        showToast('❌ Yanlış! İkişer saymayı unutma: 0, 2, 4, 6, 8', 'error');
    }
}

// Place value game
function checkPlaceValue() {
    const tensInput = document.getElementById('tens-answer');
    const onesInput = document.getElementById('ones-answer');
    
    if (!tensInput || !onesInput) return;
    
    const tensAnswer = parseInt(tensInput.value);
    const onesAnswer = parseInt(onesInput.value);
    
    if (tensAnswer === 2 && onesAnswer === 7) {
        showToast('🎉 Doğru! 27 = 2 onluk + 7 birlik!', 'success');
        earnBadge('badge-8');
        tensInput.style.borderColor = '#00b894';
        onesInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar dene. 27 sayısını düşün!', 'error');
        tensInput.style.borderColor = '#ff6b6b';
        onesInput.style.borderColor = '#ff6b6b';
    }
}

// Pattern game
function checkPattern() {
    const patternInput = document.getElementById('pattern-answer');
    if (!patternInput) return;
    
    const userAnswer = parseInt(patternInput.value);
    const correctAnswer = 12; // 3, 6, 9, 12, 15 pattern
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! Örüntü: her seferinde 3 ekleniyor!', 'success');
        earnBadge('badge-10');
        patternInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Her seferinde 3 ekleniyor: 3, 6, 9, 12, 15', 'error');
        patternInput.style.borderColor = '#ff6b6b';
    }
}

// Addition game
function checkAddition() {
    const additionInput = document.getElementById('addition-answer');
    if (!additionInput) return;
    
    const userAnswer = parseInt(additionInput.value);
    const correctAnswer = 15; // 6 + 9 = 15
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 6 + 9 = 15!', 'success');
        earnBadge('badge-12');
        additionInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 6 + 9', 'error');
        additionInput.style.borderColor = '#ff6b6b';
    }
}

// Addition puzzle
function checkPuzzle(answer) {
    const correctAnswer = '6+6';
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 6 + 6 = 12!', 'success');
        earnBadge('badge-13');
    } else {
        showToast('❌ Yanlış! Hangi iki sayının toplamı 12 eder?', 'error');
    }
}

// Subtraction game
function checkSubtraction() {
    const subtractionInput = document.getElementById('subtraction-answer');
    if (!subtractionInput) return;
    
    const userAnswer = parseInt(subtractionInput.value);
    const correctAnswer = 7; // 12 - 5 = 7
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 12 - 5 = 7!', 'success');
        earnBadge('badge-14');
        subtractionInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 12 - 5', 'error');
        subtractionInput.style.borderColor = '#ff6b6b';
    }
}

// Subtraction puzzle
function checkSubtractionPuzzle(answer) {
    const correctAnswer = '14';
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 14 - 6 = 8!', 'success');
        earnBadge('badge-15');
    } else {
        showToast('❌ Yanlış! Hangi sayıdan 6 çıkarırsak 8 kalır?', 'error');
    }
}

// Relationship game
function checkRelationship() {
    const relationshipInput = document.getElementById('relationship-answer');
    if (!relationshipInput) return;
    
    const userAnswer = parseInt(relationshipInput.value);
    const correctAnswer = 6; // 15 - 9 = 6
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 15 - 9 = 6!', 'success');
        earnBadge('badge-16');
        relationshipInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 15 - 9', 'error');
        relationshipInput.style.borderColor = '#ff6b6b';
    }
}

// Missing number game
function checkMissingNumberGame() {
    const missingInput = document.getElementById('missing-number-answer');
    if (!missingInput) return;
    
    const userAnswer = parseInt(missingInput.value);
    const correctAnswer = 7; // 7 + 8 = 15
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 7 + 8 = 15!', 'success');
        earnBadge('badge-17');
        missingInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Hangi sayı + 8 = 15?', 'error');
        missingInput.style.borderColor = '#ff6b6b';
    }
}

// Shape recognition game
function checkShape(shapeType) {
    const correctShape = 'kare';
    
    if (shapeType === correctShape) {
        showToast('🎉 Doğru! Bu bir kare!', 'success');
        earnBadge('badge-18');
    } else {
        showToast('❌ Yanlış! Bu şekil bir kare!', 'error');
    }
}

// Shape counting game
function checkShapeCount() {
    const shapeInput = document.getElementById('shape-count');
    if (!shapeInput) return;
    
    const userAnswer = parseInt(shapeInput.value);
    const correctAnswer = 3; // 3 squares in the collection
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3 tane kare var!', 'success');
        earnBadge('badge-19');
        shapeInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Kareleri tekrar say!', 'error');
        shapeInput.style.borderColor = '#ff6b6b';
    }
}

// Length comparison game
function checkLength(choice) {
    const correctChoice = '2'; // Second object is longest
    
    if (choice === correctChoice) {
        showToast('🎉 Doğru! 2. nesne en uzun!', 'success');
        earnBadge('badge-20');
    } else {
        showToast('❌ Yanlış! Nesneleri tekrar karşılaştır!', 'error');
    }
}

// Money game
function checkMoney() {
    const moneyInput = document.getElementById('money-answer');
    if (!moneyInput) return;
    
    const userAnswer = parseInt(moneyInput.value);
    const correctAnswer = 7; // 3 + 4 = 7 TL
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3 TL + 4 TL = 7 TL!', 'success');
        earnBadge('badge-22');
        moneyInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 3 + 4', 'error');
        moneyInput.style.borderColor = '#ff6b6b';
    }
}

// Shopping game
function checkShopping() {
    const shoppingInput = document.getElementById('shopping-answer');
    if (!shoppingInput) return;
    
    const userAnswer = parseInt(shoppingInput.value);
    const correctAnswer = 5; // 3 + 2 = 5 TL
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3 TL + 2 TL = 5 TL!', 'success');
        earnBadge('badge-23');
        shoppingInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 3 + 2', 'error');
        shoppingInput.style.borderColor = '#ff6b6b';
    }
}

// Enhanced checkAnswer function with more explanations
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.',
        'C': 'İkişer sayarken 8\'den sonra 10 gelir. Her seferinde 2 ekleniyor.',
        'D': '34 = 3 onluk + 4 birlik. Sol basamak onluk, sağ basamak birlik.',
        'E': '5, 10, 15, 20, 25 örüntüsünde her seferinde 5 ekleniyor.',
        'F': '7 + 8 = 15. Toplama işleminde sayılar artar.',
        'G': '15 - 7 = 8. Çıkarma işleminde sayı azalır.',
        'H': '7 + 9 = 16 ise 16 - 7 = 9. Ters işlemler birbirini kontrol eder.',
        'I': 'Üçgen 3 kenara sahiptir. Kare 4, dikdörtgen 4, daire 0 kenara sahiptir.',
        'J': 'Cetvel kalemden daha uzundur. Cetvel daha fazla yer kaplar.',
        'K': '4 + 6 = 10. Para toplama işleminde dikkatli ol!'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// ===== ADDITIONAL INTERACTIVE FUNCTIONS FOR ALL GRADES =====

// Number reading game for 2nd grade
function checkNumberReading(answer) {
    const correctAnswer = 'otuz altı';
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 36 = "otuz altı"!', 'success');
        earnBadge('badge-24');
    } else {
        showToast('❌ Yanlış! 36 sayısı "otuz altı" olarak okunur!', 'error');
    }
}

// Number writing game for 2nd grade
function checkNumberWriting() {
    const tensInput = document.getElementById('tens-write');
    const onesInput = document.getElementById('ones-write');
    
    if (!tensInput || !onesInput) return;
    
    const tensAnswer = parseInt(tensInput.value);
    const onesAnswer = parseInt(onesInput.value);
    
    if (tensAnswer === 4 && onesAnswer === 2) {
        showToast('🎉 Doğru! "Kırk iki" = 42!', 'success');
        earnBadge('badge-25');
        tensInput.style.borderColor = '#00b894';
        onesInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! "Kırk iki" = 42 (4 onluk + 2 birlik)!', 'error');
        tensInput.style.borderColor = '#ff6b6b';
        onesInput.style.borderColor = '#ff6b6b';
    }
}

// Three digit number reading game for 3rd grade
function checkThreeDigitReading(answer) {
    const correctAnswer = 'dört yüz elli altı';
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 456 = "dört yüz elli altı"!', 'success');
        earnBadge('badge-28');
    } else {
        showToast('❌ Yanlış! 456 sayısı "dört yüz elli altı" olarak okunur!', 'error');
    }
}

// Three digit number writing game for 3rd grade
function checkThreeDigitWriting() {
    const hundredsInput = document.getElementById('hundreds-write');
    const tensInput = document.getElementById('tens-write-three');
    const onesInput = document.getElementById('ones-write-three');
    
    if (!hundredsInput || !tensInput || !onesInput) return;
    
    const hundredsAnswer = parseInt(hundredsInput.value);
    const tensAnswer = parseInt(tensInput.value);
    const onesAnswer = parseInt(onesInput.value);
    
    if (hundredsAnswer === 7 && tensAnswer === 8 && onesAnswer === 3) {
        showToast('🎉 Doğru! "Yedi yüz seksen üç" = 783!', 'success');
        earnBadge('badge-29');
        hundredsInput.style.borderColor = '#00b894';
        tensInput.style.borderColor = '#00b894';
        onesInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! "Yedi yüz seksen üç" = 783 (7 yüzlük + 8 onluk + 3 birlik)!', 'error');
        hundredsInput.style.borderColor = '#ff6b6b';
        tensInput.style.borderColor = '#ff6b6b';
        onesInput.style.borderColor = '#ff6b6b';
    }
}

// Large addition game for 4th grade
function checkLargeAddition() {
    const additionInput = document.getElementById('large-addition-answer');
    if (!additionInput) return;
    
    const userAnswer = parseInt(additionInput.value);
    const correctAnswer = 5801; // 3456 + 2345 = 5801
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3456 + 2345 = 5801!', 'success');
        earnBadge('badge-30');
        additionInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 3456 + 2345', 'error');
        additionInput.style.borderColor = '#ff6b6b';
    }
}

// Large subtraction game for 4th grade
function checkLargeSubtraction() {
    const subtractionInput = document.getElementById('large-subtraction-answer');
    if (!subtractionInput) return;
    
    const userAnswer = parseInt(subtractionInput.value);
    const correctAnswer = 3333; // 5678 - 2345 = 3333
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 5678 - 2345 = 3333!', 'success');
        earnBadge('badge-31');
        subtractionInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 5678 - 2345', 'error');
        subtractionInput.style.borderColor = '#ff6b6b';
    }
}

// Enhanced checkAnswer function with more explanations for all grades
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.',
        'C': 'İkişer sayarken 8\'den sonra 10 gelir. Her seferinde 2 ekleniyor.',
        'D': '34 = 3 onluk + 4 birlik. Sol basamak onluk, sağ basamak birlik.',
        'E': '5, 10, 15, 20, 25 örüntüsünde her seferinde 5 ekleniyor.',
        'F': '7 + 8 = 15. Toplama işleminde sayılar artar.',
        'G': '15 - 7 = 8. Çıkarma işleminde sayı azalır.',
        'H': '7 + 9 = 16 ise 16 - 7 = 9. Ters işlemler birbirini kontrol eder.',
        'I': 'Üçgen 3 kenara sahiptir. Kare 4, dikdörtgen 4, daire 0 kenara sahiptir.',
        'J': 'Cetvel kalemden daha uzundur. Cetvel daha fazla yer kaplar.',
        'K': '4 + 6 = 10. Para toplama işleminde dikkatli ol!',
        'L': '47 = 4 onluk + 7 birlik. İki basamaklı sayılarda sol basamak onluk, sağ basamak birlik.',
        'M': '4 × 6 = 24. Çarpma işlemi tekrarlı toplama işlemidir.',
        'N': '456 = 4 yüzlük + 5 onluk + 6 birlik. Üç basamaklı sayılarda yüzlük, onluk, birlik basamakları vardır.',
        'O': '3456 + 2345 = 5801. Elde ile toplama yaparken dikkatli ol!',
        'P': '15 ÷ 3 = 5. Bölme işlemi çarpma işleminin tersidir.',
        'Q': '3 metre = 300 santimetre. 1 metre = 100 santimetre.',
        'R': '23 × 45 = 1035. İki basamaklı çarpma yaparken kısmi çarpımları hesapla!',
        'S': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'T': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'U': '1/2 + 1/4 = 3/4. Kesir toplama yaparken payda eşitlemeyi unutma!',
        'V': '6 cm × 6 cm = 36 cm². Kare alanı = kenar × kenar!',
        'W': '2/3 × 3/4 = 6/12 = 1/2. Kesir çarpma yaparken pay ile pay, payda ile payda çarp!',
        'X': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'Y': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'Z': '345 + 267 = 612. Üç basamaklı toplama yaparken elde işlemini unutma!',
        'AA': '84 ÷ 4 = 21. Bölme işlemi çarpma işleminin tersidir.',
        'BB': '3456 = "üç bin dört yüz elli altı". Dört basamaklı sayıları okurken binlik, yüzlük, onluk, birlik sırasını takip et!'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// Division game for 2nd grade
function checkDivision() {
    const divisionInput = document.getElementById('division-answer');
    if (!divisionInput) return;
    
    const userAnswer = parseInt(divisionInput.value);
    const correctAnswer = 4; // 12 ÷ 3 = 4
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 12 ÷ 3 = 4!', 'success');
        earnBadge('badge-32');
        divisionInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 12 ÷ 3', 'error');
        divisionInput.style.borderColor = '#ff6b6b';
    }
}

// Division puzzle for 2nd grade
function checkDivisionPuzzle(answer) {
    const correctAnswer = '15'; // 15 ÷ 4 = 3 kalan 3
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 15 ÷ 4 = 3 kalan 3!', 'success');
        earnBadge('badge-33');
    } else {
        showToast('❌ Yanlış! 15 ÷ 4 = 3 kalan 3 olur!', 'error');
    }
}

// Length conversion game for 2nd grade
function checkLengthConversion() {
    const lengthInput = document.getElementById('length-conversion-answer');
    if (!lengthInput) return;
    
    const userAnswer = parseInt(lengthInput.value);
    const correctAnswer = 200; // 2 m = 200 cm
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 2 metre = 200 santimetre!', 'success');
        earnBadge('badge-34');
        lengthInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 1 metre = 100 santimetre, 2 metre = 200 santimetre!', 'error');
        lengthInput.style.borderColor = '#ff6b6b';
    }
}

// Length comparison game for 2nd grade
function checkLengthComparison(answer) {
    const correctAnswer = '3'; // 40 cm en uzun
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 40 cm en uzun nesne!', 'success');
        earnBadge('badge-35');
    } else {
        showToast('❌ Yanlış! 40 cm (3. nesne) en uzun!', 'error');
    }
}

// Large multiplication game for 3rd grade
function checkLargeMultiplication() {
    const multiplicationInput = document.getElementById('large-multiplication-answer');
    if (!multiplicationInput) return;
    
    const userAnswer = parseInt(multiplicationInput.value);
    const correctAnswer = 408; // 34 × 12 = 408
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 34 × 12 = 408!', 'success');
        earnBadge('badge-36');
        multiplicationInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Tekrar hesapla: 34 × 12', 'error');
        multiplicationInput.style.borderColor = '#ff6b6b';
    }
}

// Large multiplication puzzle for 3rd grade
function checkLargeMultiplicationPuzzle(answer) {
    const correctAnswer = '34x12'; // 34 × 12 = 408
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 34 × 12 = 408!', 'success');
        earnBadge('badge-37');
    } else {
        showToast('❌ Yanlış! 34 × 12 = 408 olur!', 'error');
    }
}

// Enhanced addQuestionExplanation with more explanations for all grades
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.',
        'C': 'İkişer sayarken 8\'den sonra 10 gelir. Her seferinde 2 ekleniyor.',
        'D': '34 = 3 onluk + 4 birlik. Sol basamak onluk, sağ basamak birlik.',
        'E': '5, 10, 15, 20, 25 örüntüsünde her seferinde 5 ekleniyor.',
        'F': '7 + 8 = 15. Toplama işleminde sayılar artar.',
        'G': '15 - 7 = 8. Çıkarma işleminde sayı azalır.',
        'H': '7 + 9 = 16 ise 16 - 7 = 9. Ters işlemler birbirini kontrol eder.',
        'I': 'Üçgen 3 kenara sahiptir. Kare 4, dikdörtgen 4, daire 0 kenara sahiptir.',
        'J': 'Cetvel kalemden daha uzundur. Cetvel daha fazla yer kaplar.',
        'K': '4 + 6 = 10. Para toplama işleminde dikkatli ol!',
        'L': '47 = 4 onluk + 7 birlik. İki basamaklı sayılarda sol basamak onluk, sağ basamak birlik.',
        'M': '4 × 6 = 24. Çarpma işlemi tekrarlı toplama işlemidir.',
        'N': '456 = 4 yüzlük + 5 onluk + 6 birlik. Üç basamaklı sayılarda yüzlük, onluk, birlik basamakları vardır.',
        'O': '3456 + 2345 = 5801. Elde ile toplama yaparken dikkatli ol!',
        'P': '15 ÷ 3 = 5. Bölme işlemi çarpma işleminin tersidir.',
        'Q': '3 metre = 300 santimetre. 1 metre = 100 santimetre.',
        'R': '23 × 45 = 1035. İki basamaklı çarpma yaparken kısmi çarpımları hesapla!',
        'S': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'T': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'U': '1/2 + 1/4 = 3/4. Kesir toplama yaparken payda eşitlemeyi unutma!',
        'V': '6 cm × 6 cm = 36 cm². Kare alanı = kenar × kenar!',
        'W': '2/3 × 3/4 = 6/12 = 1/2. Kesir çarpma yaparken pay ile pay, payda ile payda çarp!',
        'X': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'Y': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'Z': '345 + 267 = 612. Üç basamaklı toplama yaparken elde işlemini unutma!',
        'AA': '84 ÷ 4 = 21. Bölme işlemi çarpma işleminin tersidir.',
        'BB': '3456 = "üç bin dört yüz elli altı". Dört basamaklı sayıları okurken binlik, yüzlük, onluk, birlik sırasını takip et!'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// Money conversion game for 2nd grade
function checkMoneyConversion() {
    const moneyInput = document.getElementById('money-conversion-answer');
    if (!moneyInput) return;
    
    const userAnswer = parseInt(moneyInput.value);
    const correctAnswer = 300; // 3 TL = 300 kuruş
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3 TL = 300 kuruş!', 'success');
        earnBadge('badge-38');
        moneyInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 1 TL = 100 kuruş, 3 TL = 300 kuruş!', 'error');
        moneyInput.style.borderColor = '#ff6b6b';
    }
}

// Shopping game for 2nd grade
function checkShopping() {
    const shoppingInput = document.getElementById('shopping-answer');
    if (!shoppingInput) return;
    
    const userAnswer = parseInt(shoppingInput.value);
    const correctAnswer = 7; // Ekmek 2 TL + Süt 5 TL = 7 TL
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! Ekmek 2 TL + Süt 5 TL = 7 TL!', 'success');
        earnBadge('badge-39');
        shoppingInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Ekmek 2 TL + Süt 5 TL = 7 TL!', 'error');
        shoppingInput.style.borderColor = '#ff6b6b';
    }
}

// Time reading game for 2nd grade
function checkTimeReading(answer) {
    const correctAnswer = '3:00';
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! Bu saat 3:00!', 'success');
        earnBadge('badge-40');
    } else {
        showToast('❌ Yanlış! Bu saat 3:00 olarak okunur!', 'error');
    }
}

// Time calculation game for 2nd grade
function checkTimeCalculation() {
    const timeInput = document.getElementById('time-calculation-answer');
    if (!timeInput) return;
    
    const userAnswer = parseInt(timeInput.value);
    const correctAnswer = 3; // 2 saat + 1 saat = 3 saat
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 2 saat + 1 saat = 3 saat!', 'success');
        earnBadge('badge-41');
        timeInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 2 saat + 1 saat = 3 saat!', 'error');
        timeInput.style.borderColor = '#ff6b6b';
    }
}

// Fraction comparison game for 3rd grade
function checkFractionComparison(answer) {
    const correctAnswer = '1/2'; // 1/2 > 1/4
    
    if (answer === correctAnswer) {
        showToast('🎉 Doğru! 1/2 > 1/4 çünkü yarım çeyrekten büyüktür!', 'success');
        earnBadge('badge-42');
    } else {
        showToast('❌ Yanlış! 1/2 > 1/4 çünkü yarım çeyrekten büyüktür!', 'error');
    }
}

// Fraction simplification game for 3rd grade
function checkFractionSimplification() {
    const numeratorInput = document.getElementById('numerator-simplify');
    const denominatorInput = document.getElementById('denominator-simplify');
    
    if (!numeratorInput || !denominatorInput) return;
    
    const numeratorAnswer = parseInt(numeratorInput.value);
    const denominatorAnswer = parseInt(denominatorInput.value);
    
    if (numeratorAnswer === 1 && denominatorAnswer === 2) {
        showToast('🎉 Doğru! 2/4 = 1/2 (2 ile sadeleştirildi)!', 'success');
        earnBadge('badge-43');
        numeratorInput.style.borderColor = '#00b894';
        denominatorInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 2/4 = 1/2 olur (2 ile sadeleştirilir)!', 'error');
        numeratorInput.style.borderColor = '#ff6b6b';
        denominatorInput.style.borderColor = '#ff6b6b';
    }
}

// Enhanced addQuestionExplanation with more explanations for all grades
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.',
        'C': 'İkişer sayarken 8\'den sonra 10 gelir. Her seferinde 2 ekleniyor.',
        'D': '34 = 3 onluk + 4 birlik. Sol basamak onluk, sağ basamak birlik.',
        'E': '5, 10, 15, 20, 25 örüntüsünde her seferinde 5 ekleniyor.',
        'F': '7 + 8 = 15. Toplama işleminde sayılar artar.',
        'G': '15 - 7 = 8. Çıkarma işleminde sayı azalır.',
        'H': '7 + 9 = 16 ise 16 - 7 = 9. Ters işlemler birbirini kontrol eder.',
        'I': 'Üçgen 3 kenara sahiptir. Kare 4, dikdörtgen 4, daire 0 kenara sahiptir.',
        'J': 'Cetvel kalemden daha uzundur. Cetvel daha fazla yer kaplar.',
        'K': '4 + 6 = 10. Para toplama işleminde dikkatli ol!',
        'L': '47 = 4 onluk + 7 birlik. İki basamaklı sayılarda sol basamak onluk, sağ basamak birlik.',
        'M': '4 × 6 = 24. Çarpma işlemi tekrarlı toplama işlemidir.',
        'N': '456 = 4 yüzlük + 5 onluk + 6 birlik. Üç basamaklı sayılarda yüzlük, onluk, birlik basamakları vardır.',
        'O': '3456 + 2345 = 5801. Elde ile toplama yaparken dikkatli ol!',
        'P': '15 ÷ 3 = 5. Bölme işlemi çarpma işleminin tersidir.',
        'Q': '3 metre = 300 santimetre. 1 metre = 100 santimetre.',
        'R': '23 × 45 = 1035. İki basamaklı çarpma yaparken kısmi çarpımları hesapla!',
        'S': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'T': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'U': '1/2 + 1/4 = 3/4. Kesir toplama yaparken payda eşitlemeyi unutma!',
        'V': '6 cm × 6 cm = 36 cm². Kare alanı = kenar × kenar!',
        'W': '2/3 × 3/4 = 6/12 = 1/2. Kesir çarpma yaparken pay ile pay, payda ile payda çarp!',
        'X': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'Y': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'Z': '345 + 267 = 612. Üç basamaklı toplama yaparken elde işlemini unutma!',
        'AA': '84 ÷ 4 = 21. Bölme işlemi çarpma işleminin tersidir.',
        'BB': '3456 = "üç bin dört yüz elli altı". Dört basamaklı sayıları okurken binlik, yüzlük, onluk, birlik sırasını takip et!'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// Area calculation game for 3rd grade
function checkAreaCalculation() {
    const areaInput = document.getElementById('area-calculation-answer');
    if (!areaInput) return;
    
    const userAnswer = parseInt(areaInput.value);
    const correctAnswer = 16; // 4 cm × 4 cm = 16 cm²
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 4 cm × 4 cm = 16 cm²!', 'success');
        earnBadge('badge-44');
        areaInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Kare alanı = kenar × kenar = 4 × 4 = 16 cm²!', 'error');
        areaInput.style.borderColor = '#ff6b6b';
    }
}

// Perimeter calculation game for 3rd grade
function checkPerimeterCalculation() {
    const perimeterInput = document.getElementById('perimeter-calculation-answer');
    if (!perimeterInput) return;
    
    const userAnswer = parseInt(perimeterInput.value);
    const correctAnswer = 12; // 3 cm + 4 cm + 5 cm = 12 cm
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3 cm + 4 cm + 5 cm = 12 cm!', 'success');
        earnBadge('badge-45');
        perimeterInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! Üçgen çevresi = tüm kenarların toplamı = 3 + 4 + 5 = 12 cm!', 'error');
        perimeterInput.style.borderColor = '#ff6b6b';
    }
}

// Initialize all interactive elements when page loads
function initializeInteractiveElements() {
    // Add toast styles first
    addToastStyles();
    addResetButtonStyles();
    
    // Load earned badges
    loadEarnedBadges();
    
    // Initialize interactive elements with null checks
    setTimeout(() => {
        initializeDragAndDrop();
        initializeWritingPractice();
        initializeNumberLine();
        initializeComparisonVisuals();
        initializeLearningSongs();
        initializeExampleQuestions();
        
        // Track progress
        trackLearningProgress();
    }, 100);
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInteractiveElements);
} else {
    initializeInteractiveElements();
}

// Complex fraction addition game for 4th grade
function checkComplexFractionAddition() {
    const fractionInput = document.getElementById('complex-fraction-answer');
    if (!fractionInput) return;
    
    const userAnswer = fractionInput.value.toLowerCase().trim();
    const correctAnswers = ['4/4', '1', '1/1', '4/4', '1/1'];
    
    if (correctAnswers.includes(userAnswer)) {
        showToast('🎉 Doğru! 3/4 + 1/4 = 4/4 = 1!', 'success');
        earnBadge('badge-46');
        fractionInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 3/4 + 1/4 = 4/4 = 1 olur!', 'error');
        fractionInput.style.borderColor = '#ff6b6b';
    }
}

// Complex fraction simplification game for 4th grade
function checkComplexFractionSimplification() {
    const numeratorInput = document.getElementById('complex-numerator-simplify');
    const denominatorInput = document.getElementById('complex-denominator-simplify');
    
    if (!numeratorInput || !denominatorInput) return;
    
    const numeratorAnswer = parseInt(numeratorInput.value);
    const denominatorAnswer = parseInt(denominatorInput.value);
    
    if (numeratorAnswer === 3 && denominatorAnswer === 4) {
        showToast('🎉 Doğru! 15/20 = 3/4 (5 ile sadeleştirildi)!', 'success');
        earnBadge('badge-47');
        numeratorInput.style.borderColor = '#00b894';
        denominatorInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 15/20 = 3/4 olur (5 ile sadeleştirilir)!', 'error');
        numeratorInput.style.borderColor = '#ff6b6b';
        denominatorInput.style.borderColor = '#ff6b6b';
    }
}

// Enhanced addQuestionExplanation with more explanations for all grades
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.',
        'C': 'İkişer sayarken 8\'den sonra 10 gelir. Her seferinde 2 ekleniyor.',
        'D': '34 = 3 onluk + 4 birlik. Sol basamak onluk, sağ basamak birlik.',
        'E': '5, 10, 15, 20, 25 örüntüsünde her seferinde 5 ekleniyor.',
        'F': '7 + 8 = 15. Toplama işleminde sayılar artar.',
        'G': '15 - 7 = 8. Çıkarma işleminde sayı azalır.',
        'H': '7 + 9 = 16 ise 16 - 7 = 9. Ters işlemler birbirini kontrol eder.',
        'I': 'Üçgen 3 kenara sahiptir. Kare 4, dikdörtgen 4, daire 0 kenara sahiptir.',
        'J': 'Cetvel kalemden daha uzundur. Cetvel daha fazla yer kaplar.',
        'K': '4 + 6 = 10. Para toplama işleminde dikkatli ol!',
        'L': '47 = 4 onluk + 7 birlik. İki basamaklı sayılarda sol basamak onluk, sağ basamak birlik.',
        'M': '4 × 6 = 24. Çarpma işlemi tekrarlı toplama işlemidir.',
        'N': '456 = 4 yüzlük + 5 onluk + 6 birlik. Üç basamaklı sayılarda yüzlük, onluk, birlik basamakları vardır.',
        'O': '3456 + 2345 = 5801. Elde ile toplama yaparken dikkatli ol!',
        'P': '15 ÷ 3 = 5. Bölme işlemi çarpma işleminin tersidir.',
        'Q': '3 metre = 300 santimetre. 1 metre = 100 santimetre.',
        'R': '23 × 45 = 1035. İki basamaklı çarpma yaparken kısmi çarpımları hesapla!',
        'S': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'T': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'U': '1/2 + 1/4 = 3/4. Kesir toplama yaparken payda eşitlemeyi unutma!',
        'V': '6 cm × 6 cm = 36 cm². Kare alanı = kenar × kenar!',
        'W': '2/3 × 3/4 = 6/12 = 1/2. Kesir çarpma yaparken pay ile pay, payda ile payda çarp!',
        'X': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'Y': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'Z': '345 + 267 = 612. Üç basamaklı toplama yaparken elde işlemini unutma!',
        'AA': '84 ÷ 4 = 21. Bölme işlemi çarpma işleminin tersidir.',
        'BB': '3456 = "üç bin dört yüz elli altı". Dört basamaklı sayıları okurken binlik, yüzlük, onluk, birlik sırasını takip et!'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// Money conversion game for 3rd grade
function checkMoneyConversion() {
    const moneyInput = document.getElementById('money-conversion-answer');
    if (!moneyInput) return;
    
    const userAnswer = parseInt(moneyInput.value);
    const correctAnswer = 300; // 3 TL = 300 kuruş
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 3 TL = 300 kuruş!', 'success');
        earnBadge('badge-38');
        moneyInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 1 TL = 100 kuruş, 3 TL = 300 kuruş!', 'error');
        moneyInput.style.borderColor = '#ff6b6b';
    }
}

// Shopping game for 3rd grade
function checkShopping() {
    const shoppingInput = document.getElementById('shopping-answer');
    if (!shoppingInput) return;
    
    const userAnswer = parseInt(shoppingInput.value);
    const correctAnswer = 7; // 2 TL + 5 TL = 7 TL
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! Ekmek 2 TL + Süt 5 TL = 7 TL!', 'success');
        earnBadge('badge-39');
        shoppingInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 2 TL + 5 TL = 7 TL!', 'error');
        shoppingInput.style.borderColor = '#ff6b6b';
    }
}

// Time conversion game for 3rd grade
function checkTimeConversion() {
    const timeInput = document.getElementById('time-conversion-answer');
    if (!timeInput) return;
    
    const userAnswer = parseInt(timeInput.value);
    const correctAnswer = 120; // 2 saat = 120 dakika
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! 2 saat = 120 dakika!', 'success');
        earnBadge('badge-40');
        timeInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 1 saat = 60 dakika, 2 saat = 120 dakika!', 'error');
        timeInput.style.borderColor = '#ff6b6b';
    }
}

// Activity game for 3rd grade
function checkActivity() {
    const activityInput = document.getElementById('activity-answer');
    if (!activityInput) return;
    
    const userAnswer = parseInt(activityInput.value);
    const correctAnswer = 8; // 6 saat + 2 saat = 8 saat
    
    if (userAnswer === correctAnswer) {
        showToast('🎉 Doğru! Okul 6 saat + Ev 2 saat = 8 saat!', 'success');
        earnBadge('badge-41');
        activityInput.style.borderColor = '#00b894';
    } else {
        showToast('❌ Yanlış! 6 saat + 2 saat = 8 saat!', 'error');
        activityInput.style.borderColor = '#ff6b6b';
    }
}

// Enhanced addQuestionExplanation with more explanations for all grades
function addQuestionExplanation(questionContainer, correctAnswer) {
    const resultDiv = questionContainer.querySelector('.question-result');
    const explanations = {
        'A': '7\'den sonra 8 gelir. Sayıları sırayla saymayı unutma!',
        'B': '14 > 9 çünkü 14 daha büyük bir sayıdır. Büyük sayı daha fazla değere sahiptir.',
        'C': 'İkişer sayarken 8\'den sonra 10 gelir. Her seferinde 2 ekleniyor.',
        'D': '34 = 3 onluk + 4 birlik. Sol basamak onluk, sağ basamak birlik.',
        'E': '5, 10, 15, 20, 25 örüntüsünde her seferinde 5 ekleniyor.',
        'F': '7 + 8 = 15. Toplama işleminde sayılar artar.',
        'G': '15 - 7 = 8. Çıkarma işleminde sayı azalır.',
        'H': '7 + 9 = 16 ise 16 - 7 = 9. Ters işlemler birbirini kontrol eder.',
        'I': 'Üçgen 3 kenara sahiptir. Kare 4, dikdörtgen 4, daire 0 kenara sahiptir.',
        'J': 'Cetvel kalemden daha uzundur. Cetvel daha fazla yer kaplar.',
        'K': '4 + 6 = 10. Para toplama işleminde dikkatli ol!',
        'L': '47 = 4 onluk + 7 birlik. İki basamaklı sayılarda sol basamak onluk, sağ basamak birlik.',
        'M': '4 × 6 = 24. Çarpma işlemi tekrarlı toplama işlemidir.',
        'N': '456 = 4 yüzlük + 5 onluk + 6 birlik. Üç basamaklı sayılarda yüzlük, onluk, birlik basamakları vardır.',
        'O': '3456 + 2345 = 5801. Elde ile toplama yaparken dikkatli ol!',
        'P': '15 ÷ 3 = 5. Bölme işlemi çarpma işleminin tersidir.',
        'Q': '3 metre = 300 santimetre. 1 metre = 100 santimetre.',
        'R': '23 × 45 = 1035. İki basamaklı çarpma yaparken kısmi çarpımları hesapla!',
        'S': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'T': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'U': '1/2 + 1/4 = 3/4. Kesir toplama yaparken payda eşitlemeyi unutma!',
        'V': '6 cm × 6 cm = 36 cm². Kare alanı = kenar × kenar!',
        'W': '2/3 × 3/4 = 6/12 = 1/2. Kesir çarpma yaparken pay ile pay, payda ile payda çarp!',
        'X': '2 TL + 3 TL = 5 TL. Para toplama işleminde dikkatli ol!',
        'Y': '2 saat + 1 saat = 3 saat. Zaman toplama işleminde dikkatli ol!',
        'Z': '345 + 267 = 612. Üç basamaklı toplama yaparken elde işlemini unutma!',
        'AA': '84 ÷ 4 = 21. Bölme işlemi çarpma işleminin tersidir.',
        'BB': '3456 = "üç bin dört yüz elli altı". Dört basamaklı sayıları okurken binlik, yüzlük, onluk, birlik sırasını takip et!'
    };
    
    const explanation = explanations[correctAnswer];
    if (explanation) {
        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;">
                <strong>💡 Açıklama:</strong><br>
                ${explanation}
            </div>
        `;
        resultDiv.classList.add('explanation');
    }
}

// Large number reading game for 4th grade
function checkLargeNumberReading(answer) {
    const resultDiv = document.getElementById('large-number-reading-result');
    const correctAnswer = 'dört bin beş yüz altmış yedi';
    
    if (answer === correctAnswer) {
        resultDiv.innerHTML = '<div class="correct-answer">🎉 Doğru! 4567 = "dört bin beş yüz altmış yedi"</div>';
        earnBadge('badge-52');
        showToast('🎉 Doğru! Büyük sayıları okumayı öğrendin!', 'success');
    } else {
        resultDiv.innerHTML = '<div class="incorrect-answer">❌ Yanlış! 4567 = "dört bin beş yüz altmış yedi"</div>';
        showToast('❌ Yanlış! Tekrar dene!', 'error');
    }
}

// Large number writing game for 4th grade
function checkLargeNumberWriting() {
    const thousandsInput = document.getElementById('thousands-write');
    const hundredsInput = document.getElementById('hundreds-write-four');
    const tensInput = document.getElementById('tens-write-four');
    const onesInput = document.getElementById('ones-write-four');
    const resultDiv = document.getElementById('large-number-writing-result');
    
    if (!thousandsInput || !hundredsInput || !tensInput || !onesInput) return;
    
    const thousands = parseInt(thousandsInput.value) || 0;
    const hundreds = parseInt(hundredsInput.value) || 0;
    const tens = parseInt(tensInput.value) || 0;
    const ones = parseInt(onesInput.value) || 0;
    
    const userAnswer = thousands * 1000 + hundreds * 100 + tens * 10 + ones;
    const correctAnswer = 7891; // "Yedi bin sekiz yüz doksan bir"
    
    if (userAnswer === correctAnswer) {
        resultDiv.innerHTML = '<div class="correct-answer">🎉 Doğru! 7891 = "yedi bin sekiz yüz doksan bir"</div>';
        earnBadge('badge-53');
        showToast('🎉 Doğru! Büyük sayıları yazmayı öğrendin!', 'success');
    } else {
        resultDiv.innerHTML = '<div class="incorrect-answer">❌ Yanlış! "Yedi bin sekiz yüz doksan bir" = 7891</div>';
        showToast('❌ Yanlış! Tekrar dene!', 'error');
    }
}

// Large addition game for 3rd grade
function checkLargeAddition(answer) {
    const resultDiv = document.getElementById('addition-result');
    const correctAnswer = '390';
    
    if (answer === correctAnswer) {
        resultDiv.innerHTML = '<div class="correct-answer">🎉 Doğru! 234 + 156 = 390</div>';
        earnBadge('badge-48');
        showToast('🎉 Doğru! Üç basamaklı toplama yapmayı öğrendin!', 'success');
    } else {
        resultDiv.innerHTML = '<div class="incorrect-answer">❌ Yanlış! 234 + 156 = 390</div>';
        showToast('❌ Yanlış! Tekrar dene!', 'error');
    }
}

// Large subtraction game for 3rd grade
function checkLargeSubtraction(answer) {
    const resultDiv = document.getElementById('subtraction-result');
    const correctAnswer = '333';
    
    if (answer === correctAnswer) {
        resultDiv.innerHTML = '<div class="correct-answer">🎉 Doğru! 567 - 234 = 333</div>';
        earnBadge('badge-49');
        showToast('🎉 Doğru! Üç basamaklı çıkarma yapmayı öğrendin!', 'success');
    } else {
        resultDiv.innerHTML = '<div class="incorrect-answer">❌ Yanlış! 567 - 234 = 333</div>';
        showToast('❌ Yanlış! Tekrar dene!', 'error');
    }
}

// Division game for 3rd grade
function checkDivision(answer) {
    const resultDiv = document.getElementById('division-result');
    const correctAnswer = '25';
    
    if (answer === correctAnswer) {
        resultDiv.innerHTML = '<div class="correct-answer">🎉 Doğru! 75 ÷ 3 = 25</div>';
        earnBadge('badge-50');
        showToast('🎉 Doğru! Bölme işlemini öğrendin!', 'success');
    } else {
        resultDiv.innerHTML = '<div class="incorrect-answer">❌ Yanlış! 75 ÷ 3 = 25</div>';
        showToast('❌ Yanlış! Tekrar dene!', 'error');
    }
}

// Division puzzle game for 3rd grade
function checkDivisionPuzzle(answer) {
    const resultDiv = document.getElementById('division-puzzle-result');
    const correctAnswer = '84';
    
    if (answer === correctAnswer) {
        resultDiv.innerHTML = '<div class="correct-answer">🎉 Doğru! 84 ÷ 4 = 21</div>';
        earnBadge('badge-51');
        showToast('🎉 Doğru! Bölme bulmacasını çözdün!', 'success');
    } else {
        resultDiv.innerHTML = '<div class="incorrect-answer">❌ Yanlış! 84 ÷ 4 = 21</div>';
        showToast('❌ Yanlış! Tekrar dene!', 'error');
    }
}

// Learning song player
function playLearningSong(songType) {
    const songs = {
        'addition-subtraction': '🎵 Toplama ve çıkarma şarkısı çalınıyor...',
        'division': '🎵 Bölme şarkısı çalınıyor...',
        'large-numbers': '🎵 Büyük sayılar şarkısı çalınıyor...'
    };
    
    const message = songs[songType] || '🎵 Şarkı çalınıyor...';
    showToast(message, 'info');
    
    // Simulate song playing
    setTimeout(() => {
        showToast('🎉 Şarkı bitti! Öğrenmeye devam et!', 'success');
    }, 3000);
}
