from mysql.connector import Error
from app.database.db_connection import DatabaseConnection

class QuestionRepository:
    def __init__(self):
        self.db = DatabaseConnection()
    
    def get_questions_by_grade_and_topic(self, grade, topic, limit=20):
        """Belirli sınıf ve konudan soruları getirir"""
        try:
            if not self.db.connection:
                return []
            
            cursor = self.db.connection.cursor(dictionary=True)
            query = """
            SELECT * FROM questions 
            WHERE grade = %s AND topic = %s 
            ORDER BY RAND() 
            LIMIT %s
            """
            cursor.execute(query, (grade, topic, limit))
            questions = cursor.fetchall()
            cursor.close()
            return questions
            
        except Error as e:
            print(f"Soru getirme hatası: {e}")
            return []
    
    def get_random_questions_by_grade(self, grade, limit=20):
        """Belirli sınıftan rastgele soruları getirir"""
        try:
            if not self.db.connection:
                return []
            
            cursor = self.db.connection.cursor(dictionary=True)
            query = """
            SELECT * FROM questions 
            WHERE grade = %s 
            ORDER BY RAND() 
            LIMIT %s
            """
            cursor.execute(query, (grade, limit))
            questions = cursor.fetchall()
            cursor.close()
            return questions
            
        except Error as e:
            print(f"Soru getirme hatası: {e}")
            return []
    
    def get_questions_by_grade_with_topic_distribution(self, grade, limit=20):
        """Belirli sınıftan konu dağılımı ile soruları getirir"""
        try:
            if not self.db.connection:
                return []
            
            cursor = self.db.connection.cursor(dictionary=True)
            
            # Önce konuları al
            topic_query = "SELECT DISTINCT topic FROM questions WHERE grade = %s"
            cursor.execute(topic_query, (grade,))
            topics = [row['topic'] for row in cursor.fetchall()]
            
            if not topics:
                return []
            
            # Her konudan eşit sayıda soru al
            questions_per_topic = max(1, limit // len(topics))
            all_questions = []
            
            for topic in topics:
                topic_query = """
                SELECT * FROM questions 
                WHERE grade = %s AND topic = %s 
                ORDER BY RAND() 
                LIMIT %s
                """
                cursor.execute(topic_query, (grade, topic, questions_per_topic))
                topic_questions = cursor.fetchall()
                all_questions.extend(topic_questions)
            
            # Eğer yeterli soru yoksa, rastgele ek sorular al
            if len(all_questions) < limit:
                remaining = limit - len(all_questions)
                remaining_query = """
                SELECT * FROM questions 
                WHERE grade = %s 
                ORDER BY RAND() 
                LIMIT %s
                """
                cursor.execute(remaining_query, (grade, remaining))
                remaining_questions = cursor.fetchall()
                all_questions.extend(remaining_questions)
            
            cursor.close()
            return all_questions[:limit]
            
        except Error as e:
            print(f"Soru getirme hatası: {e}")
            return []
    
    def get_topics_by_grade(self, grade):
        """Belirli sınıfın konularını getirir"""
        try:
            if not self.db.connection:
                return []
            
            cursor = self.db.connection.cursor()
            query = "SELECT DISTINCT topic FROM questions WHERE grade = %s ORDER BY topic"
            cursor.execute(query, (grade,))
            topics = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return topics
            
        except Error as e:
            print(f"Konu getirme hatası: {e}")
            return []
    
    def get_question_count_by_grade_and_topic(self, grade, topic):
        """Belirli sınıf ve konudaki soru sayısını getirir"""
        try:
            if not self.db.connection:
                return 0
            
            cursor = self.db.connection.cursor()
            query = "SELECT COUNT(*) FROM questions WHERE grade = %s AND topic = %s"
            cursor.execute(query, (grade, topic))
            count = cursor.fetchone()[0]
            cursor.close()
            return count
            
        except Error as e:
            print(f"Soru sayısı getirme hatası: {e}")
            return 0 