# =============================================================================
# VERİTABANI OTOMATİK BAŞLATICI
# =============================================================================
# Bu modül, uygulama başlatıldığında veritabanı tablolarının
# otomatik olarak oluşturulmasını sağlar.
# =============================================================================

import mysql.connector
from mysql.connector import Error
import os
import sys
from typing import Optional

# Config dosyasını import etmek için path ekle
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import DB_CONFIG

class DatabaseInitializer:
    """Veritabanı tablolarını otomatik olarak oluşturan sınıf"""
    
    def __init__(self):
        self.db_config = DB_CONFIG
        self.connection: Optional[mysql.connector.MySQLConnection] = None
        self.cursor: Optional[mysql.connector.cursor.MySQLCursor] = None
    
    def create_database_if_not_exists(self):
        """Veritabanını oluşturur (eğer yoksa)"""
        try:
            # Veritabanı adını çıkararak bağlantı kur
            connection_config = self.db_config.copy()
            database_name = connection_config.pop('database')
            
            connection = mysql.connector.connect(**connection_config)
            
            if connection.is_connected():
                cursor = connection.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
                print(f"✅ Veritabanı '{database_name}' kontrol edildi/oluşturuldu.")
                
        except Error as e:
            print(f"❌ Veritabanı oluşturma hatası: {e}")
            raise
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    def execute_query(self, query: str, description: str = ""):
        """SQL sorgusunu çalıştırır"""
        try:
            if not self.connection or not self.connection.is_connected():
                self.connection = mysql.connector.connect(**self.db_config)
                self.cursor = self.connection.cursor()
            
            self.cursor.execute(query)
            self.connection.commit()
            print(f"✅ {description}")
            
        except Error as e:
            print(f"❌ {description} hatası: {e}")
            raise
    
    def create_users_table(self):
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Kullanıcılar tablosu oluşturuldu")
    
    def create_questions_table(self):
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Sorular tablosu oluşturuldu")
    
    def create_user_progress_table(self):
        """Kullanıcı ilerleme tablosunu oluşturur"""
        query = """
        CREATE TABLE IF NOT EXISTS user_progress (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Kullanıcı ilerleme tablosu oluşturuldu")
    
    def create_quiz_sessions_table(self):
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Quiz oturumları tablosu oluşturuldu")
    
    def create_achievements_table(self):
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Başarılar tablosu oluşturuldu")
    
    def create_user_settings_table(self):
        """Kullanıcı ayarları tablosunu oluşturur"""
        query = """
        CREATE TABLE IF NOT EXISTS user_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            theme VARCHAR(20) DEFAULT 'light',
            notifications_enabled BOOLEAN DEFAULT TRUE,
            sound_enabled BOOLEAN DEFAULT TRUE,
            questions_per_quiz INT DEFAULT 20,
            difficulty_preference ENUM('kolay', 'orta', 'zor', 'karışık') DEFAULT 'orta',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Kullanıcı ayarları tablosu oluşturuldu")
    
    def create_daily_stats_table(self):
        """Günlük istatistikler tablosunu oluşturur"""
        query = """
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date DATE NOT NULL,
            questions_answered INT DEFAULT 0,
            correct_answers INT DEFAULT 0,
            quizzes_completed INT DEFAULT 0,
            total_time_spent INT DEFAULT 0,
            streak_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_date (user_id, date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        self.execute_query(query, "Günlük istatistikler tablosu oluşturuldu")
    
    def initialize_database(self):
        """Tüm veritabanı tablolarını oluşturur"""
        try:
            print("🔄 Veritabanı başlatılıyor...")
            
            # Önce veritabanını oluştur
            self.create_database_if_not_exists()
            
            # Tabloları oluştur
            self.create_users_table()
            self.create_questions_table()
            self.create_user_progress_table()
            self.create_quiz_sessions_table()
            self.create_achievements_table()
            self.create_user_settings_table()
            self.create_daily_stats_table()
            
            print("✅ Veritabanı başlatma tamamlandı!")
            
        except Error as e:
            print(f"❌ Veritabanı başlatma hatası: {e}")
            raise
        finally:
            if self.cursor:
                self.cursor.close()
            if self.connection and self.connection.is_connected():
                self.connection.close()

def auto_initialize_database():
    """Veritabanını otomatik olarak başlatır"""
    try:
        initializer = DatabaseInitializer()
        initializer.initialize_database()
        return True
    except Exception as e:
        print(f"❌ Veritabanı otomatik başlatma hatası: {e}")
        return False

if __name__ == "__main__":
    auto_initialize_database()
