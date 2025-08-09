from flask import Flask, render_template
from config import Config
from app.database.db_connection import DatabaseConnection
import os
import sys

# Veritabanı yedekleme sistemini import et
try:
    from data_backup_restore import auto_restore_on_startup
except ImportError as e:
    print(f"⚠️ Veritabanı yedekleme sistemi import edilemedi: {e}")
    auto_restore_on_startup = None

# Veritabanı başlatıcı sistemini import et
try:
    from database_initializer import auto_initialize_database
except ImportError as e:
    print(f"⚠️ Veritabanı başlatıcı sistemi import edilemedi: {e}")
    auto_initialize_database = None

# Soru oluşturucu sistemini import et
try:
    from question_generator import main as generate_questions
except ImportError as e:
    print(f"⚠️ Soru oluşturucu sistemi import edilemedi: {e}")
    generate_questions = None

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    # Get the directory where main.py is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(base_dir, 'app', 'templates')
    static_dir = os.path.join(base_dir, 'app', 'static')
    app = Flask(__name__, 
               template_folder=template_dir,
               static_folder=static_dir,
               static_url_path='/static')
    app.config.from_object(config_class)
    
    # Session secret key
    app.secret_key = 'your-secret-key-here'  # Production'da güvenli bir key kullanın
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError as e:
        app.logger.error(f"Failed to create instance directory: {e}")
    
    # Initialize database
    db_connection = None
    try:
        # Otomatik veritabanı başlatma
        if auto_initialize_database:
            print("🔄 Veritabanı otomatik başlatma kontrol ediliyor...")
            auto_initialize_database()
        
        # Otomatik veritabanı geri yükleme
        if auto_restore_on_startup:
            print("🔄 Veritabanı otomatik geri yükleme kontrol ediliyor...")
            auto_restore_on_startup()
        
        # Soru oluşturucu çalıştır
        if generate_questions:
            print("📚 Soru oluşturucu çalıştırılıyor...")
            generate_questions()
        
        # Create database connection
        db_connection = DatabaseConnection()
        
        # Store the database connection in the app context
        app.config['DB_CONNECTION'] = db_connection
        
        app.logger.info("Database initialized successfully")
    except Exception as e:
        app.logger.error(f"Failed to initialize database: {e}")
        if db_connection:
            db_connection.close()
        # Don't raise the exception, just log it for now
        # raise
    
    # Register blueprints
    try:
        from app.routes import api_bp, pages_bp
        
        app.register_blueprint(api_bp, url_prefix='/api')
        app.register_blueprint(pages_bp)
        app.logger.info("Blueprints registered successfully")
    except ImportError as e:
        app.logger.error(f"Failed to import blueprints: {e}")
        raise
    except Exception as e:
        app.logger.error(f"Failed to register blueprints: {e}")
        raise
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)