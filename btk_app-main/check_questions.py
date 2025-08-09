#!/usr/bin/env python3
"""
Veritabanındaki soruları kontrol etmek için test scripti
"""

from app.database.db_connection import DatabaseConnection
from app.database.question_repository import QuestionRepository

def check_questions():
    """Veritabanındaki soruları kontrol et"""
    print("🔍 Veritabanındaki sorular kontrol ediliyor...")
    
    # Veritabanı bağlantısı
    db = DatabaseConnection()
    if not db.connection:
        print("❌ Veritabanı bağlantısı başarısız!")
        return
    
    cursor = db.connection.cursor(dictionary=True)
    
    try:
        # Toplam soru sayısı
        cursor.execute("SELECT COUNT(*) as total FROM questions")
        total = cursor.fetchone()['total']
        print(f"📊 Toplam soru sayısı: {total}")
        
        # Sınıf bazında soru sayıları
        cursor.execute("SELECT grade, COUNT(*) as count FROM questions GROUP BY grade ORDER BY grade")
        grade_counts = cursor.fetchall()
        print("📚 Sınıf bazında soru sayıları:")
        for row in grade_counts:
            print(f"  {row['grade']}. sınıf: {row['count']} soru")
        
        # Konu bazında soru sayıları
        cursor.execute("SELECT topic, COUNT(*) as count FROM questions GROUP BY topic ORDER BY count DESC")
        topic_counts = cursor.fetchall()
        print("📖 Konu bazında soru sayıları:")
        for row in topic_counts:
            print(f"  {row['topic']}: {row['count']} soru")
        
        # Örnek sorular
        cursor.execute("SELECT * FROM questions LIMIT 3")
        sample_questions = cursor.fetchall()
        print("🔍 Örnek sorular:")
        for i, q in enumerate(sample_questions, 1):
            print(f"  {i}. Sınıf: {q['grade']}, Konu: {q['topic']}, Soru: {q['question_text'][:50]}...")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    check_questions() 