from flask import Blueprint, render_template, session, redirect, url_for, request, jsonify
from app.services.user_service import UserService

# Create the blueprint
pages_bp = Blueprint('pages', __name__)
user_service = UserService()

@pages_bp.route('/')
def index():
    """Render the home page."""
    return render_template('index.html', title='Home')

@pages_bp.route('/about')
def about():
    """Render the about page."""
    return render_template('about.html', title='About')

@pages_bp.route('/contact')
def contact():
    """Render the contact page."""
    return render_template('contact.html', title='Contact')


@pages_bp.route('/quiz')
def quiz():
    """Render the quiz page."""
    # Check if user is logged in
    if not session.get('logged_in'):
        return redirect(url_for('pages.login'))
    
    return render_template('quiz.html', title='Quiz')

@pages_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Render the login page or handle login POST request."""
    # Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if session.get('logged_in'):
        return redirect(url_for('pages.index'))
    
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400

        success, result = user_service.login_user(data)
        
        if success:
            # Session'a kullanıcı bilgilerini kaydet
            session['logged_in'] = True
            session['user_id'] = result['id']
            session['username'] = result['username']
            session['first_name'] = result['first_name']
            session['last_name'] = result['last_name']
            session['grade'] = result['grade']
            
            return jsonify({
                'status': 'success',
                'message': 'Login successful',
                'redirect': url_for('pages.index')
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('message', 'Login failed')
            }), 401
    
    return render_template('login.html', title='Login')

@pages_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Render the registration page or handle register POST request."""
    # Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if session.get('logged_in'):
        return redirect(url_for('pages.index'))
    
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400

        success, result = user_service.create_new_user(data)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Registration successful',
                'redirect': url_for('pages.login')
            }), 201
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('message', 'Registration failed')
            }), 400
    
    return render_template('register.html', title='Register')

@pages_bp.route('/logout')
def logout():
    """Logout the user and clear session."""
    session.clear()
    return redirect(url_for('pages.index'))

@pages_bp.route('/profile')
def profile():
    """Render the user profile page."""
    # Check if user is logged in
    if not session.get('logged_in'):
        return redirect(url_for('pages.login'))
    
    return render_template('profile.html', title='Profilim')

@pages_bp.route('/progress')
def progress():
    """Render the progress page."""
    if not session.get('logged_in'):
        return redirect(url_for('pages.login'))
    
    return render_template('progress.html', title='İlerleme Tablosu')

@pages_bp.route('/lesson_notes')
def lesson_notes():
    """Render the lesson notes page."""
    # Check if user is logged in
    if not session.get('logged_in'):
        return redirect(url_for('pages.login'))
    
    return render_template('lesson_notes.html', title='Ders Notları')

@pages_bp.route('/debug/users')
def debug_users():
    """Debug endpoint to see all users in database."""
    try:
        users = user_service.get_all_users()
        return jsonify({
            'status': 'success',
            'count': len(users),
            'users': users
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500