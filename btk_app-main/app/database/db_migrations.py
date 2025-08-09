# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, veritabanı şemasının (tabloların) oluşturulması ve yönetilmesi
# için gerekli geçiş işlemlerini yürüten `Migrations` sınıfını içerir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# 4.0. MIGRATIONS SINIFI
#   4.1. Başlatma ve Bağlantı Sahipliği
#     4.1.1. __init__(self, db_connection)
#   4.2. Dahili Bağlantı Yönetimi
#     4.2.1. _ensure_connection(self)
#     4.2.2. _close_if_owned(self)
#   4.3. Geçiş Metotları (Migration Methods)
#     4.3.1. create_users_table(self)
#   4.4. Ana Geçiş Yöneticisi
#     4.4.1. run_migrations(self)
# 5.0. DOĞRUDAN ÇALIŞTIRMA BLOĞU
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# =============================================================================
import mysql.connector
from mysql.connector import Error
import sys
import os

# Config dosyasını import etmek için path ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config import DB_CONFIG

def create_database():
    """Veritabanını oluşturur"""
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
            print(f"Veritabanı {DB_CONFIG['database']} oluşturuldu veya zaten mevcut.")
            
    except Error as e:
        print(f"Veritabanı oluşturma hatası: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_users_table():
    """Kullanıcılar tablosunu oluşturur"""
    query = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        grade INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
    """
    execute_query(query)

def create_questions_table():
    """Matematik soruları tablosunu oluşturur"""
    query = """
    CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        grade INT NOT NULL,
        topic VARCHAR(100) NOT NULL,
        question_text TEXT NOT NULL,
        option_a VARCHAR(255) NOT NULL,
        option_b VARCHAR(255) NOT NULL,
        option_c VARCHAR(255) NOT NULL,
        option_d VARCHAR(255) NOT NULL,
        correct_answer CHAR(1) NOT NULL,
        difficulty_level ENUM('kolay', 'orta', 'zor') DEFAULT 'orta',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    execute_query(query)

def create_user_progress_table():
    """Kullanıcı ilerleme tablosunu oluşturur"""
    # Önce eski tabloyu sil
    drop_query = "DROP TABLE IF EXISTS user_progress"
    execute_query(drop_query)
    
    query = """
    CREATE TABLE user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_id INT NOT NULL,
        user_answer CHAR(1),
        is_correct BOOLEAN,
        quiz_session_id VARCHAR(100),
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
    """
    execute_query(query)

def create_quiz_sessions_table():
    """Quiz oturumları tablosunu oluşturur"""
    query = """
    CREATE TABLE IF NOT EXISTS quiz_sessions (
        id VARCHAR(100) PRIMARY KEY,
        user_id INT NOT NULL,
        grade INT NOT NULL,
        total_questions INT DEFAULT 20,
        correct_answers INT DEFAULT 0,
        score_percentage DECIMAL(5,2) DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    execute_query(query)

def create_achievements_table():
    """Başarılar ve kupalar tablosunu oluşturur"""
    query = """
    CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        achievement_type ENUM('perfect_score', 'first_quiz', 'streak_5', 'streak_10', 'questions_50', 'questions_100', 'questions_500', 'questions_1000', 'daily_streak_3', 'daily_streak_7', 'daily_streak_30', 'high_score_90', 'high_score_95', 'topic_master', 'speed_demon', 'persistent_learner', 'quick_learner', 'math_genius', 'dedicated_student') NOT NULL,
        achievement_name VARCHAR(100) NOT NULL,
        achievement_description TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
    execute_query(query)

def execute_query(query):
    """SQL sorgusunu çalıştırır"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(query)
            connection.commit()
            print("Tablo başarıyla oluşturuldu.")
            
    except Error as e:
        print(f"Sorgu çalıştırma hatası: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def initialize_database():
    """Veritabanını başlatır"""
    create_database()
    create_users_table()
    create_questions_table()
    create_user_progress_table()
    create_quiz_sessions_table()
    create_achievements_table()
    print("Veritabanı başlatma tamamlandı!")

if __name__ == "__main__":
    initialize_database()