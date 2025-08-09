/**
 * AI Chat Module for Quiz
 * Gemini AI ile haberleşme modülü
 */

class AIChat {
    constructor() {
        this.chatInput = document.getElementById('aiChatInput');
        this.chatSend = document.getElementById('aiChatSend');
        this.chatMessages = document.querySelector('.ai-chat-messages');
        this.chatLoading = document.getElementById('aiChatLoading');
        this.conversationHistory = [];
        
        this.initializeChat();
    }
    
    initializeChat() {
        console.log('🤖 AI Chat initialized');
        
        // Send button click event
        this.chatSend.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key press event
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Initial welcome message
        const welcomeMessage = 'Merhaba! Ben MatchCatAI. Quiz çözerken size yardım ederim! 😊';
        this.addAIMessage(welcomeMessage);
        this.conversationHistory.push({
            role: 'assistant',
            content: welcomeMessage
        });
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message) {
            return;
        }
        
        console.log('📤 Sending message:', message);
        
        // Add user message to chat
        this.addUserMessage(message);
        this.conversationHistory.push({
            role: 'user',
            content: message
        });
        
        // Clear input
        this.chatInput.value = '';
        
        // Show loading
        this.showLoading();
        
        try {
            // Send to AI API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversation_history: this.conversationHistory
                })
            });
            
            const result = await response.json();
            
            console.log('📥 AI Response:', result);
            
            // Hide loading
            this.hideLoading();
            
            if (result.success) {
                // Add AI response to chat
                this.addAIMessage(result.message);
                this.conversationHistory.push({
                    role: 'assistant',
                    content: result.message
                });
            } else {
                // Show error message
                this.addAIMessage(`Hata oluştu: ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ AI Chat error:', error);
            this.hideLoading();
            this.addAIMessage('Bağlantı hatası! Tekrar deneyin.');
        }
    }
    
    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message user';
        messageDiv.textContent = message;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addAIMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message ai';
        messageDiv.textContent = message;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showLoading() {
        this.chatLoading.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideLoading() {
        this.chatLoading.style.display = 'none';
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Quiz help method
    async getQuizHelp(questionText, userAnswer = '', isCorrect = null, options = {}) {
        console.log('🎯 Getting quiz help for:', questionText);
        console.log('📝 Options:', options);
        
        try {
            const response = await fetch('/api/ai/quiz-help', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question_text: questionText,
                    user_answer: userAnswer,
                    is_correct: isCorrect,
                    options: options,
                    conversation_history: this.conversationHistory
                })
            });
            
            const result = await response.json();
            
            console.log('📥 Quiz help response:', result);
            
            if (result.success) {
                this.addAIMessage(result.message);
                this.conversationHistory.push({
                    role: 'assistant',
                    content: result.message
                });
            } else {
                this.addAIMessage(`Yardım alınamadı: ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ Quiz help error:', error);
            this.addAIMessage('Yardım alınamadı. Tekrar deneyin.');
        }
    }
    
    // Auto help for wrong answers
    async autoHelpForWrongAnswer(questionText, userAnswer, options) {
        console.log('❌ Auto help for wrong answer:', userAnswer);
        
        this.addAIMessage('Yanlış cevap! Size basit açıklama yapıyorum... 🤔');
        
        await this.getQuizHelp(questionText, userAnswer, false, options);
    }
    
    // General help method
    async getGeneralHelp(topic = '') {
        console.log('📚 Getting general help for topic:', topic);
        
        try {
            const response = await fetch('/api/ai/general-help', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic: topic,
                    conversation_history: this.conversationHistory
                })
            });
            
            const result = await response.json();
            
            console.log('📥 General help response:', result);
            
            if (result.success) {
                this.addAIMessage(result.message);
                this.conversationHistory.push({
                    role: 'assistant',
                    content: result.message
                });
            } else {
                this.addAIMessage(`Yardım alınamadı: ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ General help error:', error);
            this.addAIMessage('Yardım alınamadı. Tekrar deneyin.');
        }
    }
    
    // Motivation method
    async getMotivation(performance) {
        console.log('💪 Getting motivation for performance:', performance);
        
        try {
            const response = await fetch('/api/ai/motivation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    performance: performance,
                    conversation_history: this.conversationHistory
                })
            });
            
            const result = await response.json();
            
            console.log('📥 Motivation response:', result);
            
            if (result.success) {
                this.addAIMessage(result.message);
                this.conversationHistory.push({
                    role: 'assistant',
                    content: result.message
                });
            } else {
                this.addAIMessage(`Mesaj alınamadı: ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ Motivation error:', error);
            this.addAIMessage('Mesaj alınamadı. Tekrar deneyin.');
        }
    }
}

// Export for use in other modules
window.AIChat = AIChat; 