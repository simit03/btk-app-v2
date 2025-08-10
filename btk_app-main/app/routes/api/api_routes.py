from flask import Blueprint, request, jsonify, session
from app.services.user_service import UserService
from app.database.question_repository import QuestionRepository
from app.services.gemini_service import get_gemini_service
import uuid

api_bp = Blueprint('api', __name__)
user_service = UserService()
question_repo = QuestionRepository()

@api_bp.route('/register', methods=['POST'])
def register():
    """Kullanıcı kaydı"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        grade = data.get('grade')
        
        if not all([username, password, first_name, last_name, grade]):
            return jsonify({
                'success': False,
                'message': 'Tüm alanlar gereklidir!'
            }), 400
        
        result = user_service.create_new_user(username, password, first_name, last_name, grade)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Kayıt başarılı! Giriş yapabilirsiniz.'
            })
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Kayıt hatası: {str(e)}'
        }), 500

@api_bp.route('/login', methods=['POST'])
def login():
    """Kullanıcı girişi"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Kullanıcı adı ve şifre gereklidir!'
            }), 400
        
        result = user_service.login_user(username, password)
        
        if result['success']:
            # Session'a kullanıcı bilgilerini kaydet
            session['logged_in'] = True
            session['user_id'] = result['data']['id']
            session['username'] = result['data']['username']
            session['first_name'] = result['data']['first_name']
            session['last_name'] = result['data']['last_name']
            session['grade'] = result['data']['grade']
            
            return jsonify({
                'success': True,
                'message': 'Giriş başarılı!',
                'redirect': '/'
            })
        else:
            return jsonify(result), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Giriş hatası: {str(e)}'
        }), 500

@api_bp.route('/profile/update', methods=['POST'])
def update_profile():
    """Profil güncelleme"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        grade = data.get('grade')
        user_id = session.get('user_id')
        
        if not all([first_name, last_name, grade, user_id]):
            return jsonify({
                'success': False,
                'message': 'Tüm alanlar gereklidir!'
            }), 400
        
        success, result_data = user_service.update_user_profile({
            'user_id': user_id,
            'first_name': first_name,
            'last_name': last_name,
            'grade': grade
        })
        
        if success:
            # Session'ı güncelle
            session['first_name'] = first_name
            session['last_name'] = last_name
            session['grade'] = grade
            
            return jsonify({
                'success': True,
                'message': 'Profil güncellendi!'
            })
        else:
            return jsonify({
                'success': False,
                'message': result_data.get('message', 'Profil güncellenirken hata oluştu!')
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Profil güncelleme hatası: {str(e)}'
        }), 500

@api_bp.route('/session/user', methods=['GET'])
def get_session_user():
    """Session kullanıcı bilgilerini getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        return jsonify({
            'success': True,
            'data': {
                'id': session.get('user_id'),
                'username': session.get('username'),
                'first_name': session.get('first_name'),
                'last_name': session.get('last_name'),
                'grade': session.get('grade')
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Session hatası: {str(e)}'
        }), 500

@api_bp.route('/quiz/questions', methods=['GET'])
def get_quiz_questions():
    """Quiz sorularını getir (doğru cevaplanan sorular hariç)"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        grade = session.get('grade', 1)
        limit = request.args.get('limit', 20, type=int)
        
        print(f"👤 Kullanıcı ID: {user_id}, Sınıf: {grade}")
        
        # Kullanıcının doğru cevapladığı soruları al
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if not db.connection:
            return jsonify({
                'success': False,
                'message': 'Veritabanı bağlantı hatası'
            }), 500
        
        cursor = db.connection.cursor(dictionary=True)
        
        # Kullanıcının doğru cevapladığı soru ID'lerini al
        cursor.execute("""
            SELECT DISTINCT question_id 
            FROM user_progress 
            WHERE user_id = %s AND is_correct = 1
        """, (user_id,))
        
        correct_question_ids = [row['question_id'] for row in cursor.fetchall()]
        cursor.close()
        
        # Kullanıcının sınıfına göre soruları getir
        print(f"🔍 Quiz soruları aranıyor - Sınıf: {grade}, Limit: {limit}")
        questions = question_repo.get_questions_by_grade_with_topic_distribution(grade, limit * 3)  # Daha fazla soru al
        print(f"📊 Bulunan soru sayısı: {len(questions) if questions else 0}")
        
        if not questions:
            return jsonify({
                'success': False,
                'message': f'Bu sınıf ({grade}. sınıf) için soru bulunamadı! Lütfen profil sayfasından sınıfınızı kontrol edin.'
            }), 404
        
        # Doğru cevaplanan soruları filtrele
        available_questions = [q for q in questions if q['id'] not in correct_question_ids]
        
        if not available_questions:
            return jsonify({
                'success': False,
                'message': 'Tüm soruları doğru cevapladınız! Yeni sorular eklenene kadar bekleyin.'
            }), 404
        
        # Soruları karıştır ve limit kadar al
        import random
        random.shuffle(available_questions)
        selected_questions = available_questions[:limit]
        
        formatted_questions = []
        for i, q in enumerate(selected_questions):
            # Şıkları karıştır
            options = [q['option_a'], q['option_b'], q['option_c'], q['option_d']]
            correct_answer = q['correct_answer']
            correct_value = options[ord(correct_answer) - ord('A')]
            
            random.shuffle(options)
            
            # Yeni doğru cevabı bul
            new_correct_answer = chr(ord('A') + options.index(correct_value))
            
            formatted_questions.append({
                'id': q['id'],
                'number': i + 1,
                'question_text': q['question_text'],
                'topic': q['topic'],
                'options': {
                    'A': options[0],
                    'B': options[1],
                    'C': options[2],
                    'D': options[3]
                },
                'correct_answer': new_correct_answer
            })
        
        return jsonify({
            'success': True,
            'data': {
                'questions': formatted_questions,
                'total_questions': len(formatted_questions),
                'grade': grade,
                'excluded_questions': len(correct_question_ids)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Soru getirme hatası: {str(e)}'
        }), 500

@api_bp.route('/quiz/start', methods=['POST'])
def start_quiz():
    """Quiz oturumu başlat"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        grade = session.get('grade', 1)
        session_id = str(uuid.uuid4())
        
        # Quiz oturumu oluştur
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor()
            cursor.execute("""
                INSERT INTO quiz_sessions (id, user_id, grade, total_questions)
                VALUES (%s, %s, %s, %s)
            """, (session_id, user_id, grade, 20))
            db.connection.commit()
            cursor.close()
        
        return jsonify({
            'success': True,
            'data': {
                'session_id': session_id,
                'grade': grade
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Quiz başlatma hatası: {str(e)}'
        }), 500

@api_bp.route('/quiz/submit', methods=['POST'])
def submit_quiz_answer():
    """Quiz cevabını kaydet"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        user_id = session.get('user_id')
        question_id = data.get('question_id')
        user_answer = data.get('user_answer')
        is_correct = data.get('is_correct')
        session_id = data.get('session_id')
        
        # Cevabı kaydet
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            # Aynı oturumda aynı soruyu tekrar kaydetmeyi engelle
            cursor.execute("""
                SELECT id FROM user_progress 
                WHERE user_id = %s AND quiz_session_id = %s AND question_id = %s
                LIMIT 1
            """, (user_id, session_id, question_id))
            existing = cursor.fetchone()
            if existing:
                cursor.close()
                return jsonify({
                    'success': False,
                    'message': 'Bu soru bu oturumda zaten cevaplandı.'
                }), 409

            # İlk kez gönderiliyorsa kaydet
            cursor.execute("""
                INSERT INTO user_progress (user_id, question_id, user_answer, is_correct, quiz_session_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, question_id, user_answer, is_correct, session_id))
            db.connection.commit()
            cursor.close()
        
        return jsonify({
            'success': True,
            'message': 'Cevap kaydedildi!'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Cevap kaydetme hatası: {str(e)}'
        }), 500

@api_bp.route('/quiz/complete', methods=['POST'])
def complete_quiz():
    """Quiz'i tamamla"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        session_id = data.get('session_id')
        correct_answers = data.get('correct_answers', 0)
        total_questions = data.get('total_questions', 20)
        score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        user_id = session.get('user_id')
        
        # Quiz oturumunu güncelle
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor()
            cursor.execute("""
                UPDATE quiz_sessions 
                SET correct_answers = %s, score_percentage = %s, completed_at = NOW()
                WHERE id = %s
            """, (correct_answers, score_percentage, session_id))
            db.connection.commit()
            
            # Mükemmel skor kontrolü (tüm sorular doğru)
            achievement_earned = None
            if correct_answers == total_questions and total_questions > 0:
                # Mükemmel skor başarısını kontrol et
                cursor.execute("""
                    SELECT id FROM achievements 
                    WHERE user_id = %s AND achievement_type = 'perfect_score'
                """, (user_id,))
                
                if not cursor.fetchone():
                    # Yeni mükemmel skor başarısı ekle
                    cursor.execute("""
                        INSERT INTO achievements (user_id, achievement_type, achievement_name, achievement_description)
                        VALUES (%s, 'perfect_score', 'Mükemmel Skor', 'Tüm soruları doğru cevapladınız! 🏆')
                    """, (user_id,))
                    db.connection.commit()
                    achievement_earned = {
                        'type': 'perfect_score',
                        'name': 'Mükemmel Skor',
                        'description': 'Tüm soruları doğru cevapladınız! 🏆',
                        'icon': '🏆'
                    }
            
            cursor.close()
        
            # Başarıları kontrol et
            try:
                # Başarı kontrolü için gerekli verileri hazırla
                cursor = db.connection.cursor(dictionary=True)
                
                # Kullanıcının mevcut başarılarını al
                cursor.execute("""
                    SELECT achievement_type FROM achievements 
                    WHERE user_id = %s
                """, (user_id,))
                
                existing_achievements = [row['achievement_type'] for row in cursor.fetchall()]
                
                # Yeni başarıları kontrol et
                new_achievements = []
                
                # Toplam soru sayısı
                cursor.execute("""
                    SELECT COUNT(*) as total_questions
                    FROM user_progress 
                    WHERE user_id = %s
                """, (user_id,))
                
                total_questions = cursor.fetchone()['total_questions']
                
                # Doğru soru sayısı
                cursor.execute("""
                    SELECT COUNT(*) as correct_questions
                    FROM user_progress 
                    WHERE user_id = %s AND is_correct = 1
                """, (user_id,))
                
                correct_questions = cursor.fetchone()['correct_questions']
                total_points = correct_questions * 10
                
                # Başarı oranı
                success_rate = (correct_questions / total_questions * 100) if total_questions > 0 else 0
                
                # Yeni başarı sistemi
                achievements_to_check = [
                    {
                        'type': 'first_quiz',
                        'name': 'İlk Sınavım',
                        'description': 'İlk quiz\'inizi tamamladınız! 🎉',
                        'icon': '🎉',
                        'condition': total_questions >= 1
                    },
                    {
                        'type': 'questions_10',
                        'name': 'Başlangıç',
                        'description': '10 soru çözdünüz! 📝',
                        'icon': '📝',
                        'condition': total_questions >= 10
                    },
                    {
                        'type': 'questions_25',
                        'name': 'Öğrenci',
                        'description': '25 soru çözdünüz! 📚',
                        'icon': '📚',
                        'condition': total_questions >= 25
                    },
                    {
                        'type': 'questions_50',
                        'name': 'Çalışkan',
                        'description': '50 soru çözdünüz! 🎯',
                        'icon': '🎯',
                        'condition': total_questions >= 50
                    },
                    {
                        'type': 'questions_100',
                        'name': 'Aktif Öğrenci',
                        'description': '100 soru çözdünüz! ⭐',
                        'icon': '⭐',
                        'condition': total_questions >= 100
                    },
                    {
                        'type': 'questions_200',
                        'name': 'Matematik Sever',
                        'description': '200 soru çözdünüz! 🧮',
                        'icon': '🧮',
                        'condition': total_questions >= 200
                    },
                    {
                        'type': 'questions_500',
                        'name': 'Matematik Ustası',
                        'description': '500 soru çözdünüz! 👑',
                        'icon': '👑',
                        'condition': total_questions >= 500
                    },
                    {
                        'type': 'perfect_score',
                        'name': 'Mükemmel Skor',
                        'description': 'Tüm soruları doğru cevapladınız! 🏆',
                        'icon': '🏆',
                        'condition': success_rate == 100 and total_questions >= 5
                    },
                    {
                        'type': 'high_achievement',
                        'name': 'İyi Başarı',
                        'description': '%80 başarı oranına ulaştınız! 🎯',
                        'icon': '🎯',
                        'condition': success_rate >= 80 and total_questions >= 10
                    },
                    {
                        'type': 'excellent_achievement',
                        'name': 'Yüksek Başarı',
                        'description': '%90 başarı oranına ulaştınız! 🌟',
                        'icon': '🌟',
                        'condition': success_rate >= 90 and total_questions >= 10
                    },
                    {
                        'type': 'quiz_5',
                        'name': 'Quiz Sever',
                        'description': '5 quiz tamamladınız! 📊',
                        'icon': '📊',
                        'condition': total_questions >= 25
                    },
                    {
                        'type': 'quiz_10',
                        'name': 'Quiz Ustası',
                        'description': '10 quiz tamamladınız! 🏅',
                        'icon': '🏅',
                        'condition': total_questions >= 50
                    },
                    {
                        'type': 'quiz_20',
                        'name': 'Quiz Şampiyonu',
                        'description': '20 quiz tamamladınız! 🏆',
                        'icon': '🏆',
                        'condition': total_questions >= 100
                    },
                    {
                        'type': 'score_500',
                        'name': 'Puan Ustası',
                        'description': '500 puana ulaştınız! 🎯',
                        'icon': '🎯',
                        'condition': total_points >= 500
                    },
                    {
                        'type': 'high_score_80',
                        'name': 'İyi Başarı (%80)',
                        'description': '%80 başarı oranına ulaştınız! 🎯',
                        'icon': '🎯',
                        'condition': max_score >= 80
                    },
                    {
                        'type': 'high_score_90',
                        'name': 'Yüksek Başarı (%90)',
                        'description': '%90 başarı oranına ulaştınız! 🌟',
                        'icon': '🌟',
                        'condition': max_score >= 90
                    },
                    {
                        'type': 'topic_master',
                        'name': 'Konu Ustası',
                        'description': '3 farklı konuda çalıştınız! 📖',
                        'icon': '📖',
                        'condition': topic_count >= 3
                    },
                    {
                        'type': 'topic_expert',
                        'name': 'Konu Uzmanı',
                        'description': '5 farklı konuda çalıştınız! 🎓',
                        'icon': '🎓',
                        'condition': topic_count >= 5
                    },
                    {
                        'type': 'daily_streak_3',
                        'name': 'Düzenli Öğrenci',
                        'description': '3 gün üst üste çalıştınız! 📅',
                        'icon': '📅',
                        'condition': consecutive_days >= 3
                    },
                    {
                        'type': 'daily_streak_7',
                        'name': 'Haftalık Çalışkan',
                        'description': '7 gün üst üste çalıştınız! 📆',
                        'icon': '📆',
                        'condition': consecutive_days >= 7
                    },
                    {
                        'type': 'daily_streak_14',
                        'name': 'Kararlı Öğrenci',
                        'description': '14 gün üst üste çalıştınız! 💪',
                        'icon': '💪',
                        'condition': consecutive_days >= 14
                    }
                ]
                
                # Başarıları kontrol et ve veritabanına ekle
                for achievement in achievements_to_check:
                    if achievement['condition'] and achievement['type'] not in existing_achievements:
                        cursor.execute("""
                            INSERT INTO achievements (user_id, achievement_type, achievement_name, achievement_description)
                            VALUES (%s, %s, %s, %s)
                        """, (user_id, achievement['type'], achievement['name'], achievement['description']))
                        new_achievements.append(achievement)
                
                db.connection.commit()
                cursor.close()
                
                if new_achievements:
                    achievement_earned = new_achievements[0]  # İlk yeni başarıyı al
                    
            except Exception as e:
                print(f"Başarı kontrolü hatası: {e}")
                pass  # Başarı kontrolü başarısız olsa bile quiz tamamlanır
        
        return jsonify({
            'success': True,
            'data': {
                'score_percentage': score_percentage,
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'achievement_earned': achievement_earned
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Quiz tamamlama hatası: {str(e)}'
        }), 500

@api_bp.route('/achievements', methods=['GET'])
def get_user_achievements():
    """Kullanıcının başarılarını getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT achievement_type, achievement_name, achievement_description, earned_at
                FROM achievements 
                WHERE user_id = %s
                ORDER BY earned_at DESC
            """, (user_id,))
            
            achievements = cursor.fetchall()
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'achievements': achievements,
                    'total_achievements': len(achievements)
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Başarıları getirme hatası: {str(e)}'
        }), 500

@api_bp.route('/user/stats', methods=['GET'])
def get_user_stats():
    """Kullanıcının istatistiklerini getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Toplam çözülen soru sayısı
            cursor.execute("""
                SELECT COUNT(*) as total_questions
                FROM user_progress 
                WHERE user_id = %s
            """, (user_id,))
            total_questions = cursor.fetchone()['total_questions']
            
            # Doğru çözülen soru sayısı
            cursor.execute("""
                SELECT COUNT(*) as correct_questions
                FROM user_progress 
                WHERE user_id = %s AND is_correct = 1
            """, (user_id,))
            correct_questions = cursor.fetchone()['correct_questions']
            
            # Yanlış çözülen soru sayısı
            cursor.execute("""
                SELECT COUNT(*) as incorrect_questions
                FROM user_progress 
                WHERE user_id = %s AND is_correct = 0
            """, (user_id,))
            incorrect_questions = cursor.fetchone()['incorrect_questions']
            
            # Toplam puan (her soru 10 puan)
            total_points = correct_questions * 10
            
            # Kazanılan başarı sayısı
            cursor.execute("""
                SELECT COUNT(*) as total_achievements
                FROM achievements 
                WHERE user_id = %s
            """, (user_id,))
            total_achievements = cursor.fetchone()['total_achievements']
            
            # Quiz tamamlanma sayısı
            cursor.execute("""
                SELECT COUNT(*) as completed_quizzes
                FROM quiz_sessions 
                WHERE user_id = %s AND completed_at IS NOT NULL
            """, (user_id,))
            completed_quizzes = cursor.fetchone()['completed_quizzes']
            
            # Başarı yüzdesi
            success_percentage = (correct_questions / total_questions * 100) if total_questions > 0 else 0
            
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'total_questions': total_questions,
                    'correct_questions': correct_questions,
                    'incorrect_questions': incorrect_questions,
                    'total_points': total_points,
                    'total_achievements': total_achievements,
                    'completed_quizzes': completed_quizzes,
                    'success_percentage': round(success_percentage, 1)
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'İstatistikleri getirme hatası: {str(e)}'
        }), 500

@api_bp.route('/progress/daily', methods=['GET'])
def get_daily_progress():
    """Günlük ilerleme verilerini getir"""
    try:
        print(f"DEBUG: get_daily_progress started")
        print(f"DEBUG: session data: {dict(session)}")
        
        if not session.get('logged_in'):
            print(f"DEBUG: User not logged in")
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        print(f"DEBUG: user_id = {user_id}")
        
        # Period parametresini al (varsayılan: 30 gün)
        period = request.args.get('period', 30, type=int)
        
        print(f"DEBUG: get_daily_progress called with user_id={user_id}, period={period}")
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        print(f"DEBUG: Database connection: {db.connection is not None}")
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Önce user_progress tablosunda veri var mı kontrol et
            cursor.execute("""
                SELECT COUNT(*) as total_records
                FROM user_progress 
                WHERE user_id = %s
            """, (user_id,))
            
            total_records = cursor.fetchone()['total_records']
            
            print(f"DEBUG: User {user_id} has {total_records} progress records")
            
            if total_records == 0:
                # Veri yoksa boş sonuç döndür (yeni kullanıcılar için)
                print(f"DEBUG: No progress data for user {user_id}, returning empty data")
                return jsonify({
                    'success': True,
                    'data': {
                        'daily_data': [],
                        'summary': {
                            'study_days': 0,
                            'average_daily': 0,
                            'most_active_day': None,
                            'total_study_time': 0
                        }
                    }
                })
            
            # Period'a göre günlük veri
            cursor.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as solved,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
                FROM user_progress 
                WHERE user_id = %s 
                AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            """, (user_id, period))
            
            daily_data = cursor.fetchall()
            
            # Özet istatistikler
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT DATE(created_at)) as study_days,
                    AVG(daily_solved) as average_daily
                FROM (
                    SELECT 
                        DATE(created_at) as study_date,
                        COUNT(*) as daily_solved
                    FROM user_progress 
                    WHERE user_id = %s 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                    GROUP BY DATE(created_at)
                ) as daily_stats
            """, (user_id, period))
            
            summary = cursor.fetchone()
            
            # Eğer veri yoksa varsayılan değerler
            if not summary:
                summary = {
                    'study_days': 0,
                    'average_daily': 0,
                    'most_active_day': None,
                    'total_study_time': 0
                }
            else:
                # En aktif gün
                cursor.execute("""
                    SELECT DATE(created_at) as most_active_day
                    FROM user_progress 
                    WHERE user_id = %s 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                """, (user_id, period))
                
                most_active = cursor.fetchone()
                summary['most_active_day'] = most_active['most_active_day'] if most_active else None
                
                # Toplam çalışma süresi (dakika cinsinden)
                cursor.execute("""
                    SELECT COUNT(*) as total_questions
                    FROM user_progress 
                    WHERE user_id = %s 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                """, (user_id, period))
                
                total_questions = cursor.fetchone()['total_questions']
                summary['total_study_time'] = total_questions * 2  # Her soru için 2 dakika varsayımı
            
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'daily_data': daily_data,
                    'summary': summary
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Günlük ilerleme hatası: {str(e)}'
        }), 500

@api_bp.route('/progress/topics', methods=['GET'])
def get_topic_performance():
    """Konu bazlı performans verilerini getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Önce user_progress tablosunda veri var mı kontrol et
            cursor.execute("""
                SELECT COUNT(*) as total_records
                FROM user_progress 
                WHERE user_id = %s
            """, (user_id,))
            
            total_records = cursor.fetchone()['total_records']
            
            if total_records == 0:
                # Veri yoksa boş sonuç döndür
                cursor.close()
                return jsonify({
                    'success': True,
                    'data': {
                        'topics': []
                    }
                })
            
            cursor.execute("""
                SELECT 
                    q.topic,
                    COUNT(*) as total_questions,
                    SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct_questions
                FROM user_progress up
                JOIN questions q ON up.question_id = q.id
                WHERE up.user_id = %s
                GROUP BY q.topic
                ORDER BY total_questions DESC
            """, (user_id,))
            
            topics = cursor.fetchall()
            
            # Konu isimlerini düzenle
            for topic in topics:
                topic['topic_name'] = topic['topic']
            
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'topics': topics
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Konu performans hatası: {str(e)}'
        }), 500

@api_bp.route('/progress/weekly', methods=['GET'])
def get_weekly_summary():
    """Haftalık özet verilerini getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Son 4 haftalık veri
            cursor.execute("""
                SELECT 
                    YEARWEEK(created_at) as week_number,
                    MIN(DATE(created_at)) as week_start,
                    MAX(DATE(created_at)) as week_end,
                    COUNT(*) as total_questions,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_questions,
                    SUM(CASE WHEN is_correct = 1 THEN 10 ELSE 0 END) as points_earned
                FROM user_progress 
                WHERE user_id = %s 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
                GROUP BY YEARWEEK(created_at)
                ORDER BY week_number DESC
            """, (user_id,))
            
            weeks = cursor.fetchall()
            
            # Hafta bilgilerini düzenle
            for week in weeks:
                week['week_title'] = f"{week['week_start']} - {week['week_end']}"
                week['date_range'] = f"{week['week_start']} - {week['week_end']}"
            
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'weeks': weeks
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Haftalık özet hatası: {str(e)}'
        }), 500

@api_bp.route('/progress/detailed', methods=['GET'])
def get_detailed_progress():
    """Detaylı ilerleme tablosu verilerini getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Günlük detaylı veriler
            cursor.execute("""
                SELECT 
                    DATE(up.created_at) as date,
                    COUNT(*) as total_questions,
                    SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct_questions,
                    SUM(CASE WHEN up.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_questions,
                    SUM(CASE WHEN up.is_correct = 1 THEN 10 ELSE 0 END) as points_earned
                FROM user_progress up
                WHERE up.user_id = %s
                GROUP BY DATE(up.created_at)
                ORDER BY date DESC
                LIMIT 50
            """, (user_id,))
            
            records = cursor.fetchall()
            
            # Her gün için basit veri yapısı
            for record in records:
                record['solved'] = record['total_questions']
                record['correct'] = record['correct_questions']
            
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'daily_data': records
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Detaylı ilerleme hatası: {str(e)}'
        }), 500

@api_bp.route('/progress/wrong-answers', methods=['GET'])
def get_wrong_answers():
    """Yanlış cevapları getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Yanlış cevapları getir
            cursor.execute("""
                SELECT 
                    up.id as progress_id,
                    up.user_answer,
                    up.created_at,
                    q.id as question_id,
                    q.question_text,
                    q.topic,
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                    q.correct_answer
                FROM user_progress up
                JOIN questions q ON up.question_id = q.id
                WHERE up.user_id = %s AND up.is_correct = 0
                ORDER BY up.created_at DESC
                LIMIT 50
            """, (user_id,))
            
            wrong_answers = cursor.fetchall()
            
            # İstatistikler
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_wrong,
                    COUNT(DISTINCT q.topic) as topic_count,
                    COUNT(DISTINCT DATE(up.created_at)) as day_count
                FROM user_progress up
                JOIN questions q ON up.question_id = q.id
                WHERE up.user_id = %s AND up.is_correct = 0
            """, (user_id,))
            
            stats = cursor.fetchone()
            
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'wrong_answers': wrong_answers,
                    'stats': stats
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Yanlış cevapları getirme hatası: {str(e)}'
        }), 500

@api_bp.route('/achievements/check', methods=['POST'])
def check_and_award_achievements():
    """Yeni basit başarıları kontrol et ve ödüllendir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if not db.connection:
            return jsonify({
                'success': False,
                'message': 'Veritabanı bağlantı hatası'
            }), 500
        
        cursor = db.connection.cursor(dictionary=True)
        
        try:
            # 1. Kullanıcının mevcut başarılarını al
            cursor.execute("""
                SELECT achievement_type FROM achievements 
                WHERE user_id = %s
            """, (user_id,))
            
            existing_achievements = [row['achievement_type'] for row in cursor.fetchall()]
            new_achievements = []
            
            # 2. Basit başarı kontrolleri
            achievements_to_check = [
                {
                    'type': 'first_quiz',
                    'name': 'İlk Sınavım',
                    'description': 'İlk quiz\'inizi tamamladınız! 🎉',
                    'icon': '🎉',
                    'check_query': """
                        SELECT COUNT(*) as count FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 1
                },
                {
                    'type': 'questions_10',
                    'name': 'Başlangıç',
                    'description': '10 soru çözdünüz! 📝',
                    'icon': '📝',
                    'check_query': """
                        SELECT COUNT(*) as count FROM user_progress 
                        WHERE user_id = %s
                    """,
                    'check_value': 10
                },
                {
                    'type': 'questions_25',
                    'name': 'Öğrenci',
                    'description': '25 soru çözdünüz! 📚',
                    'icon': '📚',
                    'check_query': """
                        SELECT COUNT(*) as count FROM user_progress 
                        WHERE user_id = %s
                    """,
                    'check_value': 25
                },
                {
                    'type': 'questions_50',
                    'name': 'Çalışkan',
                    'description': '50 soru çözdünüz! 🎯',
                    'icon': '🎯',
                    'check_query': """
                        SELECT COUNT(*) as count FROM user_progress 
                        WHERE user_id = %s
                    """,
                    'check_value': 50
                },
                {
                    'type': 'questions_100',
                    'name': 'Aktif Öğrenci',
                    'description': '100 soru çözdünüz! ⭐',
                    'icon': '⭐',
                    'check_query': """
                        SELECT COUNT(*) as count FROM user_progress 
                        WHERE user_id = %s
                    """,
                    'check_value': 100
                },
                {
                    'type': 'questions_200',
                    'name': 'Matematik Sever',
                    'description': '200 soru çözdünüz! 🧮',
                    'icon': '🧮',
                    'check_query': """
                        SELECT COUNT(*) as count FROM user_progress 
                        WHERE user_id = %s
                    """,
                    'check_value': 200
                },
                {
                    'type': 'questions_500',
                    'name': 'Matematik Ustası',
                    'description': '500 soru çözdünüz! 👑',
                    'icon': '👑',
                    'check_query': """
                        SELECT COUNT(*) as count FROM user_progress 
                        WHERE user_id = %s
                    """,
                    'check_value': 500
                },
                {
                    'type': 'quiz_5',
                    'name': 'Quiz Sever',
                    'description': '5 quiz tamamladınız! 📊',
                    'icon': '📊',
                    'check_query': """
                        SELECT COUNT(*) as count FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 5
                },
                {
                    'type': 'quiz_10',
                    'name': 'Quiz Ustası',
                    'description': '10 quiz tamamladınız! 🏅',
                    'icon': '🏅',
                    'check_query': """
                        SELECT COUNT(*) as count FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 10
                },
                {
                    'type': 'quiz_20',
                    'name': 'Quiz Şampiyonu',
                    'description': '20 quiz tamamladınız! 🏆',
                    'icon': '🏆',
                    'check_query': """
                        SELECT COUNT(*) as count FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 20
                },
                {
                    'type': 'quiz_50',
                    'name': 'Quiz Uzmanı',
                    'description': '50 quiz tamamladınız! 🎓',
                    'icon': '🎓',
                    'check_query': """
                        SELECT COUNT(*) as count FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 50
                },
                {
                    'type': 'score_100',
                    'name': 'Puan Toplayıcı',
                    'description': '100 puan topladınız! 💰',
                    'icon': '💰',
                    'check_query': """
                        SELECT SUM(points_earned) as total_points FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 100
                },
                {
                    'type': 'score_250',
                    'name': 'Puan Avcısı',
                    'description': '250 puan topladınız! 🎯',
                    'icon': '🎯',
                    'check_query': """
                        SELECT SUM(points_earned) as total_points FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 250
                },
                {
                    'type': 'score_500',
                    'name': 'Puan Ustası',
                    'description': '500 puan topladınız! 🏆',
                    'icon': '🏆',
                    'check_query': """
                        SELECT SUM(points_earned) as total_points FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 500
                },
                {
                    'type': 'score_1000',
                    'name': 'Puan Şampiyonu',
                    'description': '1000 puan topladınız! 👑',
                    'icon': '👑',
                    'check_query': """
                        SELECT SUM(points_earned) as total_points FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 1000
                },
                {
                    'type': 'perfect_score',
                    'name': 'Mükemmel Skor',
                    'description': 'Tüm soruları doğru cevapladınız! 🏆',
                    'icon': '🏆',
                    'check_query': """
                        SELECT MAX(score_percentage) as max_score FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 100
                },
                {
                    'type': 'high_score_80',
                    'name': 'İyi Başarı',
                    'description': '%80 başarı oranına ulaştınız! 🎯',
                    'icon': '🎯',
                    'check_query': """
                        SELECT MAX(score_percentage) as max_score FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 80
                },
                {
                    'type': 'high_score_90',
                    'name': 'Yüksek Başarı',
                    'description': '%90 başarı oranına ulaştınız! 🌟',
                    'icon': '🌟',
                    'check_query': """
                        SELECT MAX(score_percentage) as max_score FROM quiz_sessions 
                        WHERE user_id = %s AND completed_at IS NOT NULL
                    """,
                    'check_value': 90
                },
                {
                    'type': 'topic_master',
                    'name': 'Konu Ustası',
                    'description': '3 farklı konuda çalıştınız! 📖',
                    'icon': '📖',
                    'check_query': """
                        SELECT COUNT(DISTINCT q.topic) as topic_count
                        FROM user_progress up
                        JOIN questions q ON up.question_id = q.id
                        WHERE up.user_id = %s
                    """,
                    'check_value': 3
                },
                {
                    'type': 'topic_expert',
                    'name': 'Konu Uzmanı',
                    'description': '5 farklı konuda çalıştınız! 🎓',
                    'icon': '🎓',
                    'check_query': """
                        SELECT COUNT(DISTINCT q.topic) as topic_count
                        FROM user_progress up
                        JOIN questions q ON up.question_id = q.id
                        WHERE up.user_id = %s
                    """,
                    'check_value': 5
                }
            ]
            
            # 3. Her başarımı kontrol et
            for achievement in achievements_to_check:
                if achievement['type'] not in existing_achievements:
                    try:
                        cursor.execute(achievement['check_query'], (user_id,))
                        result = cursor.fetchone()
                        current_value = result['count'] if result and result['count'] else 0
                        
                        if current_value >= achievement['check_value']:
                            cursor.execute("""
                                INSERT INTO achievements (user_id, achievement_type, achievement_name, achievement_description)
                                VALUES (%s, %s, %s, %s)
                            """, (user_id, achievement['type'], achievement['name'], achievement['description']))
                            
                            new_achievements.append({
                                'type': achievement['type'],
                                'name': achievement['name'],
                                'description': achievement['description'],
                                'icon': achievement['icon']
                            })
                    except Exception as e:
                        print(f"Error checking achievement {achievement['type']}: {str(e)}")
                        continue
            
            # 4. Özel başarılar (daha karmaşık kontroller)
            special_achievements = [
                {
                    'type': 'daily_streak_3',
                    'name': 'Düzenli Öğrenci',
                    'description': '3 gün üst üste çalıştınız! 📅',
                    'icon': '📅',
                    'check_query': """
                        SELECT COUNT(DISTINCT DATE(created_at)) as consecutive_days
                        FROM (
                            SELECT created_at,
                                   DATE(created_at) - INTERVAL ROW_NUMBER() OVER (ORDER BY DATE(created_at)) DAY as grp
                            FROM user_progress 
                            WHERE user_id = %s
                            GROUP BY DATE(created_at)
                        ) t
                        GROUP BY grp
                        ORDER BY consecutive_days DESC
                        LIMIT 1
                    """,
                    'check_condition': lambda value: value >= 3
                },
                {
                    'type': 'daily_streak_7',
                    'name': 'Haftalık Çalışkan',
                    'description': '7 gün üst üste çalıştınız! 📆',
                    'icon': '📆',
                    'check_query': """
                        SELECT COUNT(DISTINCT DATE(created_at)) as consecutive_days
                        FROM (
                            SELECT created_at,
                                   DATE(created_at) - INTERVAL ROW_NUMBER() OVER (ORDER BY DATE(created_at)) DAY as grp
                            FROM user_progress 
                            WHERE user_id = %s
                            GROUP BY DATE(created_at)
                        ) t
                        GROUP BY grp
                        ORDER BY consecutive_days DESC
                        LIMIT 1
                    """,
                    'check_condition': lambda value: value >= 7
                },
                {
                    'type': 'daily_streak_14',
                    'name': 'Kararlı Öğrenci',
                    'description': '14 gün üst üste çalıştınız! 💪',
                    'icon': '💪',
                    'check_query': """
                        SELECT COUNT(DISTINCT DATE(created_at)) as consecutive_days
                        FROM (
                            SELECT created_at,
                                   DATE(created_at) - INTERVAL ROW_NUMBER() OVER (ORDER BY DATE(created_at)) DAY as grp
                            FROM user_progress 
                            WHERE user_id = %s
                            GROUP BY DATE(created_at)
                        ) t
                        GROUP BY grp
                        ORDER BY consecutive_days DESC
                        LIMIT 1
                    """,
                    'check_condition': lambda value: value >= 14
                },
                {
                    'type': 'speed_learner',
                    'name': 'Hızlı Öğrenci',
                    'description': 'Bir günde 20 soru çözdünüz! ⚡',
                    'icon': '⚡',
                    'check_query': """
                        SELECT COUNT(*) as daily_questions
                        FROM user_progress 
                        WHERE user_id = %s AND DATE(created_at) = CURDATE()
                    """,
                    'check_condition': lambda value: value >= 20
                },
                {
                    'type': 'weekend_warrior',
                    'name': 'Hafta Sonu Savaşçısı',
                    'description': 'Hafta sonu çalıştınız! 🌅',
                    'icon': '🌅',
                    'check_query': """
                        SELECT COUNT(*) as weekend_activity
                        FROM user_progress 
                        WHERE user_id = %s AND DAYOFWEEK(created_at) IN (1, 7)
                    """,
                    'check_condition': lambda value: value >= 1
                }
            ]
            
            # 5. Özel başarıları kontrol et
            for achievement in special_achievements:
                if achievement['type'] not in existing_achievements:
                    try:
                        cursor.execute(achievement['check_query'], (user_id,))
                        result = cursor.fetchone()
                        current_value = result['consecutive_days'] if result and result['consecutive_days'] else 0
                        if 'daily_questions' in result:
                            current_value = result['daily_questions'] if result['daily_questions'] else 0
                        elif 'weekend_activity' in result:
                            current_value = result['weekend_activity'] if result['weekend_activity'] else 0
                        
                        if achievement['check_condition'](current_value):
                            cursor.execute("""
                                INSERT INTO achievements (user_id, achievement_type, achievement_name, achievement_description)
                                VALUES (%s, %s, %s, %s)
                            """, (user_id, achievement['type'], achievement['name'], achievement['description']))
                            
                            new_achievements.append({
                                'type': achievement['type'],
                                'name': achievement['name'],
                                'description': achievement['description'],
                                'icon': achievement['icon']
                            })
                    except Exception as e:
                        print(f"Error checking special achievement {achievement['type']}: {str(e)}")
                        continue
            
            db.connection.commit()
            cursor.close()
            
            return jsonify({
                'success': True,
                'data': {
                    'new_achievements': new_achievements,
                    'total_new': len(new_achievements)
                }
            })
            
        except Exception as e:
            cursor.close()
            return jsonify({
                'success': False,
                'message': f'Veritabanı işlem hatası: {str(e)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Başarı kontrolü hatası: {str(e)}'
        }), 500

@api_bp.route('/achievements/all', methods=['GET'])
def get_all_achievements():
    """Tüm başarıları ve kullanıcının kazandığı başarıları getir"""
    try:
        print(f"🔍 get_all_achievements called")
        if not session.get('logged_in'):
            print(f"❌ User not logged in")
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        print(f"👤 User ID: {user_id}")
        
        # Yeni temiz başarılar sistemi
        all_achievements = [
            {
                'type': 'first_quiz',
                'name': 'İlk Sınavım',
                'description': 'İlk quiz\'inizi tamamladınız! 🎉',
                'icon': '🎉',
                'requirement': 'İlk quiz\'inizi tamamlayın'
            },
            {
                'type': 'questions_10',
                'name': 'Başlangıç',
                'description': '10 soru çözdünüz! 📝',
                'icon': '📝',
                'requirement': '10 soru çözün'
            },
            {
                'type': 'questions_25',
                'name': 'Öğrenci',
                'description': '25 soru çözdünüz! 📚',
                'icon': '📚',
                'requirement': '25 soru çözün'
            },
            {
                'type': 'questions_50',
                'name': 'Çalışkan',
                'description': '50 soru çözdünüz! 🎯',
                'icon': '🎯',
                'requirement': '50 soru çözün'
            },
            {
                'type': 'questions_100',
                'name': 'Aktif Öğrenci',
                'description': '100 soru çözdünüz! ⭐',
                'icon': '⭐',
                'requirement': '100 soru çözün'
            },
            {
                'type': 'questions_200',
                'name': 'Matematik Sever',
                'description': '200 soru çözdünüz! 🧮',
                'icon': '🧮',
                'requirement': '200 soru çözün'
            },
            {
                'type': 'questions_500',
                'name': 'Matematik Ustası',
                'description': '500 soru çözdünüz! 👑',
                'icon': '👑',
                'requirement': '500 soru çözün'
            },
            {
                'type': 'quiz_5',
                'name': 'Quiz Sever',
                'description': '5 quiz tamamladınız! 📊',
                'icon': '📊',
                'requirement': '5 quiz tamamlayın'
            },
            {
                'type': 'quiz_10',
                'name': 'Quiz Ustası',
                'description': '10 quiz tamamladınız! 🏅',
                'icon': '🏅',
                'requirement': '10 quiz tamamlayın'
            },
            {
                'type': 'quiz_20',
                'name': 'Quiz Şampiyonu',
                'description': '20 quiz tamamladınız! 🏆',
                'icon': '🏆',
                'requirement': '20 quiz tamamlayın'
            },
            {
                'type': 'quiz_50',
                'name': 'Quiz Uzmanı',
                'description': '50 quiz tamamladınız! 🎓',
                'icon': '🎓',
                'requirement': '50 quiz tamamlayın'
            },
            {
                'type': 'score_100',
                'name': 'Puan Toplayıcı',
                'description': '100 puan topladınız! 💰',
                'icon': '💰',
                'requirement': '100 puan toplayın'
            },
            {
                'type': 'score_250',
                'name': 'Puan Avcısı',
                'description': '250 puan topladınız! 🎯',
                'icon': '🎯',
                'requirement': '250 puan toplayın'
            },
            {
                'type': 'score_500',
                'name': 'Puan Ustası',
                'description': '500 puan topladınız! 🏆',
                'icon': '🏆',
                'requirement': '500 puan toplayın'
            },
            {
                'type': 'score_1000',
                'name': 'Puan Şampiyonu',
                'description': '1000 puan topladınız! 👑',
                'icon': '👑',
                'requirement': '1000 puan toplayın'
            },
            {
                'type': 'perfect_score',
                'name': 'Mükemmel Skor',
                'description': 'Tüm soruları doğru cevapladınız! 🏆',
                'icon': '🏆',
                'requirement': 'Bir quiz\'de tüm soruları doğru cevaplayın'
            },
            {
                'type': 'high_score_80',
                'name': 'İyi Başarı',
                'description': '%80 başarı oranına ulaştınız! 🎯',
                'icon': '🎯',
                'requirement': '%80 başarı oranına ulaşın'
            },
            {
                'type': 'high_score_90',
                'name': 'Yüksek Başarı',
                'description': '%90 başarı oranına ulaştınız! 🌟',
                'icon': '🌟',
                'requirement': '%90 başarı oranına ulaşın'
            },
            {
                'type': 'topic_master',
                'name': 'Konu Ustası',
                'description': '3 farklı konuda çalıştınız! 📖',
                'icon': '📖',
                'requirement': '3 farklı konuda çalışın'
            },
            {
                'type': 'topic_expert',
                'name': 'Konu Uzmanı',
                'description': '5 farklı konuda çalıştınız! 🎓',
                'icon': '🎓',
                'requirement': '5 farklı konuda çalışın'
            },
            {
                'type': 'daily_streak_3',
                'name': 'Düzenli Öğrenci',
                'description': '3 gün üst üste çalıştınız! 📅',
                'icon': '📅',
                'requirement': '3 gün üst üste çalışın'
            },
            {
                'type': 'daily_streak_7',
                'name': 'Haftalık Çalışkan',
                'description': '7 gün üst üste çalıştınız! 📆',
                'icon': '📆',
                'requirement': '7 gün üst üste çalışın'
            },
            {
                'type': 'daily_streak_14',
                'name': 'Kararlı Öğrenci',
                'description': '14 gün üst üste çalıştınız! 💪',
                'icon': '💪',
                'requirement': '14 gün üst üste çalışın'
            },
            {
                'type': 'speed_learner',
                'name': 'Hızlı Öğrenci',
                'description': 'Bir günde 20 soru çözdünüz! ⚡',
                'icon': '⚡',
                'requirement': 'Bir günde 20 soru çözün'
            },
            {
                'type': 'weekend_warrior',
                'name': 'Hafta Sonu Savaşçısı',
                'description': 'Hafta sonu çalıştınız! 🌅',
                'icon': '🌅',
                'requirement': 'Hafta sonu çalışın'
            }
        ]
        
        # Kullanıcının kazandığı başarıları al
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if not db.connection:
            return jsonify({
                'success': False,
                'message': 'Veritabanı bağlantı hatası'
            }), 500
        
        cursor = db.connection.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT achievement_type, earned_at, achievement_name
                FROM achievements 
                WHERE user_id = %s
            """, (user_id,))
            
            earned_achievements = {}
            for row in cursor.fetchall():
                achievement_type = row['achievement_type']
                achievement_name = row['achievement_name']
                
                # Eğer achievement_type boşsa, achievement_name'e göre tip belirle
                if not achievement_type or achievement_type == '':
                    if achievement_name == 'Başlangıç':
                        achievement_type = 'questions_10'
                    elif achievement_name == 'İlk Sınavım':
                        achievement_type = 'first_quiz'
                    elif achievement_name == 'Öğrenci':
                        achievement_type = 'questions_25'
                    elif achievement_name == 'Çalışkan':
                        achievement_type = 'questions_50'
                    elif achievement_name == 'Aktif Öğrenci':
                        achievement_type = 'questions_100'
                    elif achievement_name == 'Mükemmel Skor':
                        achievement_type = 'perfect_score'
                    elif achievement_name == 'İyi Başarı':
                        achievement_type = 'high_score_80'
                    elif achievement_name == 'Yüksek Başarı':
                        achievement_type = 'high_score_90'
                    elif achievement_name == 'Quiz Sever':
                        achievement_type = 'quiz_5'
                    elif achievement_name == 'Quiz Ustası':
                        achievement_type = 'quiz_10'
                    elif achievement_name == 'Quiz Şampiyonu':
                        achievement_type = 'quiz_20'
                    elif achievement_name == 'Puan Ustası':
                        achievement_type = 'score_500'
                
                earned_achievements[achievement_type] = row['earned_at']
            
            cursor.close()
            
            # Başarıları kullanıcının durumuna göre işaretle
            for achievement in all_achievements:
                achievement['earned'] = achievement['type'] in earned_achievements
                achievement['earned_at'] = earned_achievements.get(achievement['type'])
            
            return jsonify({
                'success': True,
                'data': {
                    'achievements': all_achievements,
                    'total_earned': len(earned_achievements)
                }
            })
        
        except Exception as e:
            cursor.close()
            return jsonify({
                'success': False,
                'message': f'Veritabanı işlem hatası: {str(e)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Başarı listesi hatası: {str(e)}'
        }), 500

@api_bp.route('/achievements/unearned', methods=['GET'])
def get_unearned_achievements():
    """Sadece kazanılmayan başarıları getir"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        # Yeni basit başarılar sistemi
        all_achievements = [
            {
                'type': 'first_quiz',
                'name': 'İlk Sınavım',
                'description': 'İlk quiz\'inizi tamamladınız! 🎉',
                'icon': '🎉',
                'requirement': 'İlk quiz\'inizi tamamlayın'
            },
            {
                'type': 'questions_10',
                'name': 'Başlangıç',
                'description': '10 soru çözdünüz! 📝',
                'icon': '📝',
                'requirement': '10 soru çözün'
            },
            {
                'type': 'questions_25',
                'name': 'Öğrenci',
                'description': '25 soru çözdünüz! 📚',
                'icon': '📚',
                'requirement': '25 soru çözün'
            },
            {
                'type': 'questions_50',
                'name': 'Çalışkan',
                'description': '50 soru çözdünüz! 🎯',
                'icon': '🎯',
                'requirement': '50 soru çözün'
            },
            {
                'type': 'questions_100',
                'name': 'Aktif Öğrenci',
                'description': '100 soru çözdünüz! ⭐',
                'icon': '⭐',
                'requirement': '100 soru çözün'
            },
            {
                'type': 'questions_200',
                'name': 'Matematik Sever',
                'description': '200 soru çözdünüz! 🧮',
                'icon': '🧮',
                'requirement': '200 soru çözün'
            },
            {
                'type': 'questions_500',
                'name': 'Matematik Ustası',
                'description': '500 soru çözdünüz! 👑',
                'icon': '👑',
                'requirement': '500 soru çözün'
            },
            {
                'type': 'quiz_5',
                'name': 'Quiz Sever',
                'description': '5 quiz tamamladınız! 📊',
                'icon': '📊',
                'requirement': '5 quiz tamamlayın'
            },
            {
                'type': 'quiz_10',
                'name': 'Quiz Ustası',
                'description': '10 quiz tamamladınız! 🏅',
                'icon': '🏅',
                'requirement': '10 quiz tamamlayın'
            },
            {
                'type': 'quiz_20',
                'name': 'Quiz Şampiyonu',
                'description': '20 quiz tamamladınız! 🏆',
                'icon': '🏆',
                'requirement': '20 quiz tamamlayın'
            },
            {
                'type': 'quiz_50',
                'name': 'Quiz Uzmanı',
                'description': '50 quiz tamamladınız! 🎓',
                'icon': '🎓',
                'requirement': '50 quiz tamamlayın'
            },
            {
                'type': 'score_100',
                'name': 'Puan Toplayıcı',
                'description': '100 puan topladınız! 💰',
                'icon': '💰',
                'requirement': '100 puan toplayın'
            },
            {
                'type': 'score_250',
                'name': 'Puan Avcısı',
                'description': '250 puan topladınız! 🎯',
                'icon': '🎯',
                'requirement': '250 puan toplayın'
            },
            {
                'type': 'score_500',
                'name': 'Puan Ustası',
                'description': '500 puan topladınız! 🏆',
                'icon': '🏆',
                'requirement': '500 puan toplayın'
            },
            {
                'type': 'score_1000',
                'name': 'Puan Şampiyonu',
                'description': '1000 puan topladınız! 👑',
                'icon': '👑',
                'requirement': '1000 puan toplayın'
            },
            {
                'type': 'perfect_score',
                'name': 'Mükemmel Skor',
                'description': 'Tüm soruları doğru cevapladınız! 🏆',
                'icon': '🏆',
                'requirement': 'Bir quiz\'de tüm soruları doğru cevaplayın'
            },
            {
                'type': 'high_score_80',
                'name': 'İyi Başarı',
                'description': '%80 başarı oranına ulaştınız! 🎯',
                'icon': '🎯',
                'requirement': '%80 başarı oranına ulaşın'
            },
            {
                'type': 'high_score_90',
                'name': 'Yüksek Başarı',
                'description': '%90 başarı oranına ulaştınız! 🌟',
                'icon': '🌟',
                'requirement': '%90 başarı oranına ulaşın'
            },
            {
                'type': 'topic_master',
                'name': 'Konu Ustası',
                'description': '3 farklı konuda çalıştınız! 📖',
                'icon': '📖',
                'requirement': '3 farklı konuda çalışın'
            },
            {
                'type': 'topic_expert',
                'name': 'Konu Uzmanı',
                'description': '5 farklı konuda çalıştınız! 🎓',
                'icon': '🎓',
                'requirement': '5 farklı konuda çalışın'
            },
            {
                'type': 'daily_streak_3',
                'name': 'Düzenli Öğrenci',
                'description': '3 gün üst üste çalıştınız! 📅',
                'icon': '📅',
                'requirement': '3 gün üst üste çalışın'
            },
            {
                'type': 'daily_streak_7',
                'name': 'Haftalık Çalışkan',
                'description': '7 gün üst üste çalıştınız! 📆',
                'icon': '📆',
                'requirement': '7 gün üst üste çalışın'
            },
            {
                'type': 'daily_streak_14',
                'name': 'Kararlı Öğrenci',
                'description': '14 gün üst üste çalıştınız! 💪',
                'icon': '💪',
                'requirement': '14 gün üst üste çalışın'
            },
            {
                'type': 'speed_learner',
                'name': 'Hızlı Öğrenci',
                'description': 'Bir günde 20 soru çözdünüz! ⚡',
                'icon': '⚡',
                'requirement': 'Bir günde 20 soru çözün'
            },
            {
                'type': 'weekend_warrior',
                'name': 'Hafta Sonu Savaşçısı',
                'description': 'Hafta sonu çalıştınız! 🌅',
                'icon': '🌅',
                'requirement': 'Hafta sonu çalışın'
            }
        ]
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if db.connection:
            cursor = db.connection.cursor(dictionary=True)
            
            # Kullanıcının kazandığı başarıları al
            cursor.execute("""
                SELECT achievement_type, earned_at, achievement_name
                FROM achievements 
                WHERE user_id = %s
            """, (user_id,))
            
            earned_achievements = {}
            for row in cursor.fetchall():
                achievement_type = row['achievement_type']
                achievement_name = row['achievement_name']
                
                # Eğer achievement_type boşsa, achievement_name'e göre tip belirle
                if not achievement_type or achievement_type == '':
                    if achievement_name == 'Başlangıç':
                        achievement_type = 'questions_10'
                    elif achievement_name == 'İlk Sınavım':
                        achievement_type = 'first_quiz'
                    elif achievement_name == 'Öğrenci':
                        achievement_type = 'questions_25'
                    elif achievement_name == 'Çalışkan':
                        achievement_type = 'questions_50'
                    elif achievement_name == 'Aktif Öğrenci':
                        achievement_type = 'questions_100'
                    elif achievement_name == 'Mükemmel Skor':
                        achievement_type = 'perfect_score'
                    elif achievement_name == 'İyi Başarı':
                        achievement_type = 'high_score_80'
                    elif achievement_name == 'Yüksek Başarı':
                        achievement_type = 'high_score_90'
                    elif achievement_name == 'Quiz Sever':
                        achievement_type = 'quiz_5'
                    elif achievement_name == 'Quiz Ustası':
                        achievement_type = 'quiz_10'
                    elif achievement_name == 'Quiz Şampiyonu':
                        achievement_type = 'quiz_20'
                    elif achievement_name == 'Puan Ustası':
                        achievement_type = 'score_500'
                
                earned_achievements[achievement_type] = row['earned_at']
            
            cursor.close()
            
            # Sadece kazanılmayan başarıları filtrele
            unearned_achievements = []
            for achievement in all_achievements:
                if achievement['type'] not in earned_achievements:
                    achievement['earned'] = False
                    achievement['earned_at'] = None
                    unearned_achievements.append(achievement)
            
            return jsonify({
                'success': True,
                'data': {
                    'achievements': unearned_achievements,
                    'total_earned': len(earned_achievements)
                }
            })
        
        return jsonify({
            'success': False,
            'message': 'Veritabanı bağlantı hatası'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Başarıları getirme hatası: {str(e)}'
        }), 500

# ===== GEMINI AI ROUTES =====

@api_bp.route('/ai/chat', methods=['POST'])
def ai_chat():
    """AI ile sohbet"""
    try:
        print(f"🤖 AI Chat endpoint called")
        
        if not session.get('logged_in'):
            print(f"❌ User not logged in")
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        user_message = data.get('message', '').strip()
        conversation_history = data.get('conversation_history', [])
        
        if not user_message:
            print(f"❌ Empty message")
            return jsonify({
                'success': False,
                'message': 'Mesaj boş olamaz!'
            }), 400
        
        print(f"📝 User message: {user_message[:50]}...")
        print(f"📝 Conversation history length: {len(conversation_history)}")
        
        # Gemini servisini al
        try:
            gemini_service = get_gemini_service()
            print(f"✅ Gemini service initialized")
        except Exception as e:
            print(f"❌ Gemini service error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'AI servisi başlatılamadı',
                'error': str(e)
            }), 500
        
        # AI yanıtı al
        result = gemini_service.generate_response(user_message, "", conversation_history)
        
        print(f"🤖 AI response success: {result.get('success', False)}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ AI chat error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'AI sohbet hatası: {str(e)}'
        }), 500

@api_bp.route('/ai/quiz-help', methods=['POST'])
def ai_quiz_help():
    """Quiz sorusu için AI yardımı"""
    try:
        print(f"🎯 AI Quiz Help endpoint called")
        
        if not session.get('logged_in'):
            print(f"❌ User not logged in")
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        question_text = data.get('question_text', '').strip()
        user_answer = data.get('user_answer', '').strip()
        is_correct = data.get('is_correct')
        options = data.get('options', {})
        conversation_history = data.get('conversation_history', [])
        
        if not question_text:
            print(f"❌ Empty question text")
            return jsonify({
                'success': False,
                'message': 'Soru metni boş olamaz!'
            }), 400
        
        print(f"📝 Question: {question_text[:50]}...")
        print(f"📝 User answer: {user_answer}")
        print(f"📝 Is correct: {is_correct}")
        print(f"📝 Options: {options}")
        print(f"📝 Conversation history length: {len(conversation_history)}")
        
        # Gemini servisini al
        try:
            gemini_service = get_gemini_service()
            print(f"✅ Gemini service initialized")
        except Exception as e:
            print(f"❌ Gemini service error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'AI servisi başlatılamadı',
                'error': str(e)
            }), 500
        
        # Quiz yardımı al
        result = gemini_service.get_quiz_help(question_text, user_answer, is_correct, options, conversation_history)
        
        print(f"🤖 Quiz help success: {result.get('success', False)}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ AI quiz help error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'AI quiz yardımı hatası: {str(e)}'
        }), 500

@api_bp.route('/ai/general-help', methods=['POST'])
def ai_general_help():
    """Genel matematik yardımı"""
    try:
        print(f"📚 AI General Help endpoint called")
        
        if not session.get('logged_in'):
            print(f"❌ User not logged in")
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        topic = data.get('topic', '').strip()
        conversation_history = data.get('conversation_history', [])
        
        print(f"📝 Topic: {topic}")
        print(f"📝 Conversation history length: {len(conversation_history)}")
        
        # Gemini servisini al
        try:
            gemini_service = get_gemini_service()
            print(f"✅ Gemini service initialized")
        except Exception as e:
            print(f"❌ Gemini service error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'AI servisi başlatılamadı',
                'error': str(e)
            }), 500
        
        # Genel yardım al
        result = gemini_service.get_general_help(topic, conversation_history)
        
        print(f"🤖 General help success: {result.get('success', False)}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ AI general help error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'AI genel yardım hatası: {str(e)}'
        }), 500

@api_bp.route('/ai/motivation', methods=['POST'])
def ai_motivation():
    """Performansa göre motivasyon"""
    try:
        print(f"💪 AI Motivation endpoint called")
        
        if not session.get('logged_in'):
            print(f"❌ User not logged in")
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        data = request.get_json()
        performance = data.get('performance', {})
        conversation_history = data.get('conversation_history', [])
        
        print(f"📊 Performance data: {performance}")
        print(f"📝 Conversation history length: {len(conversation_history)}")
        
        # Gemini servisini al
        try:
            gemini_service = get_gemini_service()
            print(f"✅ Gemini service initialized")
        except Exception as e:
            print(f"❌ Gemini service error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'AI servisi başlatılamadı',
                'error': str(e)
            }), 500
        
        # Motivasyon mesajı al
        result = gemini_service.get_motivation(performance, conversation_history)
        
        print(f"🤖 Motivation success: {result.get('success', False)}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ AI motivation error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'AI motivasyon hatası: {str(e)}'
        }), 500

@api_bp.route('/achievements/cleanup', methods=['POST'])
def cleanup_duplicate_achievements():
    """Tekrarlanan başarımları temizle"""
    try:
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': 'Giriş yapmanız gerekiyor!'
            }), 401
        
        user_id = session.get('user_id')
        
        from app.database.db_connection import DatabaseConnection
        db = DatabaseConnection()
        
        if not db.connection:
            return jsonify({
                'success': False,
                'message': 'Veritabanı bağlantı hatası'
            }), 500
        
        cursor = db.connection.cursor(dictionary=True)
        
        try:
            # Her başarım tipi için sadece en son kazanılanı tut
            cursor.execute("""
                DELETE a1 FROM achievements a1
                INNER JOIN achievements a2 
                WHERE a1.id > a2.id 
                AND a1.user_id = %s 
                AND a2.user_id = %s
                AND a1.achievement_type = a2.achievement_type
            """, (user_id, user_id))
            
            # Boş achievement_type'ları düzelt
            cursor.execute("""
                UPDATE achievements 
                SET achievement_type = CASE 
                    WHEN achievement_name = 'Başlangıç' THEN 'questions_10'
                    WHEN achievement_name = 'İlk Sınavım' THEN 'first_quiz'
                    WHEN achievement_name = 'Öğrenci' THEN 'questions_25'
                    WHEN achievement_name = 'Çalışkan' THEN 'questions_50'
                    WHEN achievement_name = 'Aktif Öğrenci' THEN 'questions_100'
                    WHEN achievement_name = 'Matematik Sever' THEN 'questions_200'
                    WHEN achievement_name = 'Matematik Ustası' THEN 'questions_500'
                    WHEN achievement_name = 'Mükemmel Skor' THEN 'perfect_score'
                    WHEN achievement_name = 'İyi Başarı' THEN 'high_score_80'
                    WHEN achievement_name = 'Yüksek Başarı' THEN 'high_score_90'
                    WHEN achievement_name = 'Quiz Sever' THEN 'quiz_5'
                    WHEN achievement_name = 'Quiz Ustası' THEN 'quiz_10'
                    WHEN achievement_name = 'Quiz Şampiyonu' THEN 'quiz_20'
                    WHEN achievement_name = 'Quiz Uzmanı' THEN 'quiz_50'
                    WHEN achievement_name = 'Puan Toplayıcı' THEN 'score_100'
                    WHEN achievement_name = 'Puan Avcısı' THEN 'score_250'
                    WHEN achievement_name = 'Puan Ustası' THEN 'score_500'
                    WHEN achievement_name = 'Puan Şampiyonu' THEN 'score_1000'
                    WHEN achievement_name = 'Konu Ustası' THEN 'topic_master'
                    WHEN achievement_name = 'Konu Uzmanı' THEN 'topic_expert'
                    WHEN achievement_name = 'Düzenli Öğrenci' THEN 'daily_streak_3'
                    WHEN achievement_name = 'Haftalık Çalışkan' THEN 'daily_streak_7'
                    WHEN achievement_name = 'Kararlı Öğrenci' THEN 'daily_streak_14'
                    WHEN achievement_name = 'Hızlı Öğrenci' THEN 'speed_learner'
                    WHEN achievement_name = 'Hafta Sonu Savaşçısı' THEN 'weekend_warrior'
                    ELSE achievement_type
                END
                WHERE user_id = %s AND (achievement_type = '' OR achievement_type IS NULL)
            """, (user_id,))
            
            db.connection.commit()
            cursor.close()
            
            return jsonify({
                'success': True,
                'message': 'Tekrarlanan başarımlar temizlendi!'
            })
            
        except Exception as e:
            cursor.close()
            return jsonify({
                'success': False,
                'message': f'Veritabanı işlem hatası: {str(e)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Başarım temizleme hatası: {str(e)}'
        }), 500