#!/usr/bin/env python3
"""
Gemini AI Service
AI ile haberleşme için servis modülü
"""

import os
import requests
import json
from typing import Dict, Any, Optional

class GeminiService:
    def __init__(self):
        """Gemini servisini başlat"""
        self.api_key = "AIzaSyCw6nxbqUEqgpdB4REm0Nek-yyicOrkMwo"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        
        if not self.api_key:
            print("❌ GEMINI_API_KEY environment variable not found!")
            raise ValueError(self.api_key)
        
        print(f"✅ Gemini service initialized with API key: {self.api_key[:10]}...")
    
    def generate_response(self, user_message: str, context: str = "", conversation_history: list = None) -> Dict[str, Any]:
        """
        Gemini AI'dan yanıt al
        
        Args:
            user_message (str): Kullanıcının mesajı
            context (str): Ek bağlam bilgisi
            conversation_history (list): Sohbet geçmişi
            
        Returns:
            Dict[str, Any]: AI yanıtı ve durum bilgisi
        """
        try:
            print(f"🔍 Generating response for message: {user_message[:50]}...")
            
            # Sohbet geçmişini formatla
            history_text = ""
            if conversation_history and len(conversation_history) > 0:
                history_text = "\n\nSohbet Geçmişi:\n"
                for msg in conversation_history[-5:]:  # Son 5 mesaj
                    if msg.get('role') == 'user':
                        history_text += f"Kullanıcı: {msg.get('content', '')}\n"
                    elif msg.get('role') == 'assistant':
                        history_text += f"AI: {msg.get('content', '')}\n"
            
            # Sistem prompt'u hazırla
            system_prompt = f"""
            Sen MatchCatAI, ilkokul çocuklarına matematik öğreten bir AI asistanısın. 
            Çok basit ve kısa cevaplar ver. İlkokul çocuğu anlasın.
            
            Bağlam: {context}
            {history_text}
            
            Kullanıcı mesajı: {user_message}
            
            Yanıtını Türkçe olarak ver, emoji kullan ve ÇOK KISA YAZ.
            Sohbet geçmişini dikkate al ve bağlamı koru.
            """
            
            # API isteği için payload hazırla
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": system_prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            }
            
            print(f"📤 Sending request to Gemini API...")
            
            # API isteği gönder
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                headers={
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30
            )
            
            print(f"📥 Received response with status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Successfully parsed response")
                
                # Yanıtı çıkar
                if 'candidates' in data and len(data['candidates']) > 0:
                    ai_response = data['candidates'][0]['content']['parts'][0]['text']
                    print(f"🤖 AI Response: {ai_response[:100]}...")
                    
                    return {
                        'success': True,
                        'message': ai_response,
                        'timestamp': data.get('promptFeedback', {}).get('blockReason', 'unknown')
                    }
                else:
                    print(f"❌ No candidates in response")
                    return {
                        'success': False,
                        'message': 'AI yanıt üretemedi',
                        'error': 'No candidates in response'
                    }
            else:
                print(f"❌ API Error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'message': f'API hatası: {response.status_code}',
                    'error': response.text
                }
                
        except requests.exceptions.Timeout:
            print(f"❌ Request timeout")
            return {
                'success': False,
                'message': 'Yanıt zaman aşımına uğradı',
                'error': 'Request timeout'
            }
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {str(e)}")
            return {
                'success': False,
                'message': f'İstek hatası: {str(e)}',
                'error': str(e)
            }
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return {
                'success': False,
                'message': f'Beklenmeyen hata: {str(e)}',
                'error': str(e)
            }
    
    def get_quiz_help(self, question_text: str, user_answer: str = "", is_correct: bool = None, options: Dict[str, str] = None, conversation_history: list = None) -> Dict[str, Any]:
        """
        Quiz sorusu için yardım al
        
        Args:
            question_text (str): Soru metni
            user_answer (str): Kullanıcının cevabı
            is_correct (bool): Cevabın doğru olup olmadığı
            options (Dict[str, str]): Şık seçenekleri
            conversation_history (list): Sohbet geçmişi
            
        Returns:
            Dict[str, Any]: Yardım mesajı
        """
        try:
            print(f"🎯 Getting quiz help for question: {question_text[:50]}...")
            
            # Şık seçeneklerini formatla
            options_text = ""
            if options:
                options_text = "\nŞıklar:\n"
                for key, value in options.items():
                    options_text += f"{key}) {value}\n"
            
            context = f"""
            Soru: {question_text}
            {options_text}
            Kullanıcı cevabı: {user_answer}
            Doğru mu: {is_correct}
            """
            
            if is_correct == False:
                # Yanlış cevap için basit açıklama (ilkokul seviyesi)
                user_message = f"""
                Bu matematik sorusu için basit yardım et:
                
                Soru: {question_text}
                {options_text}
                Kullanıcının yanlış cevabı: {user_answer}
                
                Lütfen şunları yap (İLKOKUL ÇOCUĞU İÇİN):
                1. Soruyu çok basit kelimelerle açıkla
                2. Doğru cevabı söyle ve neden doğru olduğunu basitçe anlat
                3. Neden yanlış yapmış olabileceğini basitçe söyle
                4. Bir sonraki sefere nasıl yapacağını basitçe anlat
                5. Kullanıcıyı cesaretlendir
                
                Yanıtını şu formatta ver (ÇOK BASİT VE KISA):
                🔍 Bu soru ne diyor: [çok basit açıklama]
                ✅ Doğru cevap: [cevabı söyle]
                ❌ Neden yanlış yaptın: [basit açıklama]
                💡 Bir dahaki sefere: [basit ipucu]
                🌟 Sen yapabilirsin! [cesaretlendir]
                
                ÖNEMLİ: Çok kısa ve basit yaz. İlkokul çocuğu anlasın.
                """
            else:
                # Doğru cevap için basit yardım
                user_message = f"""
                Bu matematik sorusu için basit yardım et (İLKOKUL ÇOCUĞU İÇİN):
                Soru: {question_text}
                {options_text}
                {f'Kullanıcı cevabı: {user_answer}' if user_answer else ''}
                {f'Cevap doğru mu: {"Evet" if is_correct else "Hayır"}' if is_correct is not None else ''}
                
                Lütfen (ÇOK BASİT VE KISA):
                1. Soruyu basit kelimelerle açıkla
                2. Doğru cevabı söyle
                3. Kullanıcıyı cesaretlendir
                
                ÖNEMLİ: Çok kısa ve basit yaz. İlkokul çocuğu anlasın.
                """
            
            return self.generate_response(user_message, context, conversation_history)
            
        except Exception as e:
            print(f"❌ Quiz help error: {str(e)}")
            return {
                'success': False,
                'message': f'Quiz yardımı hatası: {str(e)}',
                'error': str(e)
            }
    
    def get_general_help(self, topic: str = "", conversation_history: list = None) -> Dict[str, Any]:
        """
        Genel matematik yardımı al (ilkokul seviyesi)
        
        Args:
            topic (str): Konu (opsiyonel)
            
        Returns:
            Dict[str, Any]: Yardım mesajı
        """
        try:
            print(f"📚 Getting general help for topic: {topic}")
            
            user_message = f"""
            {f'{topic} konusu hakkında' if topic else 'Matematik'} basit bilgi ver.
            İlkokul çocuğu anlasın. Çok kısa yaz.
            """
            
            return self.generate_response(user_message, f"Topic: {topic}", conversation_history)
            
        except Exception as e:
            print(f"❌ General help error: {str(e)}")
            return {
                'success': False,
                'message': f'Genel yardım hatası: {str(e)}',
                'error': str(e)
            }
    
    def get_motivation(self, performance: Dict[str, Any], conversation_history: list = None) -> Dict[str, Any]:
        """
        Performansa göre motivasyon mesajı al (ilkokul seviyesi)
        
        Args:
            performance (Dict[str, Any]): Performans bilgileri
            
        Returns:
            Dict[str, Any]: Motivasyon mesajı
        """
        try:
            print(f"💪 Getting motivation for performance: {performance}")
            
            user_message = f"""
            Öğrencinin performansı:
            - Toplam soru: {performance.get('total_questions', 0)}
            - Doğru cevap: {performance.get('correct_answers', 0)}
            - Başarı oranı: {performance.get('success_rate', 0)}%
            - Toplam puan: {performance.get('total_points', 0)}
            
            Bu performansa göre basit motivasyon mesajı yaz.
            İlkokul çocuğu anlasın. Çok kısa yaz.
            """
            
            return self.generate_response(user_message, f"Performance: {performance}", conversation_history)
            
        except Exception as e:
            print(f"❌ Motivation error: {str(e)}")
            return {
                'success': False,
                'message': f'Motivasyon hatası: {str(e)}',
                'error': str(e)
            }

# Singleton instance
gemini_service = None

def get_gemini_service() -> GeminiService:
    """Gemini servis instance'ını al"""
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service 
