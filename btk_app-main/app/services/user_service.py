# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, kullanıcılarla ilgili iş mantığını yöneten UserService sınıfını
# içerir. API rotaları ile veritabanı işlemleri (repository) arasında bir
# köprü görevi görür. Veri doğrulama ve işleme gibi operasyonlar burada
# gerçekleştirilir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. USERSERVICE SINIFI
#   4.1. Başlatma (Initialization)
#     4.1.1. __init__(self)
#   4.2. Kullanıcı İş Mantığı Metotları
#     4.2.1. get_all_users(self)
#     4.2.2. create_new_user(self, user_data)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from app.database.user_repository import UserRepository # Önceki adımdan UserRepository
from typing import Dict, Any, List, Tuple, Optional

# =============================================================================
# 4.0. USERSERVICE SINIFI
# =============================================================================
class UserService:
    """
    Kullanıcılarla ilgili iş mantığını yönetir.
    """

    # -------------------------------------------------------------------------
    # 4.1. Başlatma (Initialization)
    # -------------------------------------------------------------------------
    def __init__(self):
        """4.1.1. Servisin kurucu metodu. Gerekli repository'leri başlatır."""
        self.user_repo = UserRepository()

    # -------------------------------------------------------------------------
    # 4.2. Kullanıcı İş Mantığı Metotları
    # -------------------------------------------------------------------------
    def get_all_users(self) -> List[Dict[str, Any]]:
        """4.2.1. Tüm kullanıcıları alır ve API için uygun formata dönüştürür."""
        try:
            users = self.user_repo.get_all_users() # Depo metodunu çağırır
            formatted_users = [{
                'id': user.get('id'),
                'username': user.get('username'),
                'first_name': user.get('first_name'),
                'last_name': user.get('last_name'),
                'grade': user.get('grade'),
                'is_active': user.get('is_active', True),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            } for user in users]
            return formatted_users
        except Exception as e:
            # Hata durumunda boş liste veya hata fırlatılabilir.
            # Burada loglama yapmak önemlidir.
            print(f"Error in get_all_users service: {e}")
            return []

    def create_new_user(self, user_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        4.2.2. Yeni bir kullanıcı oluşturmak için iş mantığını çalıştırır.
        Doğrulama, kontrol ve oluşturma işlemlerini içerir.
        Dönüş Değeri: (başarı_durumu, sonuç_veya_hata_mesajı)
        """
        # 1. Gerekli alanların kontrolü
        required_fields = ['username', 'firstName', 'lastName', 'password', 'grade']
        missing_fields = [field for field in required_fields if not user_data.get(field)]
        if missing_fields:
            return False, {'message': 'Missing required fields', 'missing': missing_fields}

        username = user_data['username']
        first_name = user_data['firstName']
        last_name = user_data['lastName']
        password = user_data['password']
        grade = int(user_data['grade'])

        try:
            # 2. Kullanıcı adı zaten var mı kontrol et
            if self.user_repo.get_user(username):
                return False, {'message': 'Username already exists'}

            # 3. Şifre doğrulama
            if user_data.get('confirmPassword') != password:
                return False, {'message': 'Passwords do not match'}

            # 4. Şifreyi hash'leme işlemi burada yapılmalıdır. Örn:
            # from werkzeug.security import generate_password_hash
            # password_hash = generate_password_hash(password)
            password_hash = password  # Geçici olarak hash'lenmemiş şifre

            # 5. Yeni kullanıcıyı oluştur
            new_user_id = self.user_repo.create_user(username, password_hash, first_name, last_name, grade)

            if not new_user_id:
                return False, {'message': 'Failed to create user in database'}

            # 6. Başarılı sonuç dön
            created_user = self.user_repo.get_user_by_id(new_user_id)
            return True, {
                'id': created_user.get('id'),
                'username': created_user.get('username'),
                'first_name': created_user.get('first_name'),
                'last_name': created_user.get('last_name'),
                'grade': created_user.get('grade')
            }

        except Exception as e:
            print(f"Error in create_new_user service: {e}")
            return False, {'message': 'An unexpected error occurred'}

    def login_user(self, login_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        4.2.3. Kullanıcı girişi için iş mantığını çalıştırır.
        Doğrulama ve giriş işlemlerini içerir.
        Dönüş Değeri: (başarı_durumu, sonuç_veya_hata_mesajı)
        """
        # 1. Gerekli alanların kontrolü
        required_fields = ['username', 'password']
        missing_fields = [field for field in required_fields if not login_data.get(field)]
        if missing_fields:
            return False, {'message': 'Missing required fields', 'missing': missing_fields}

        username = login_data['username']
        password = login_data['password']

        try:
            # 2. Kullanıcıyı veritabanından getir
            user = self.user_repo.get_user(username)
            
            if not user:
                return False, {'message': 'Invalid username or password'}

            # 3. Şifre doğrulama (gerçekte hash karşılaştırması yapılmalı)
            # from werkzeug.security import check_password_hash
            # if not check_password_hash(user['password'], password):
            if user['password'] != password:  # Geçici olarak düz karşılaştırma
                return False, {'message': 'Invalid username or password'}

            # 4. Başarılı giriş sonuç dön
            return True, {
                'id': user.get('id'),
                'username': user.get('username'),
                'first_name': user.get('first_name'),
                'last_name': user.get('last_name'),
                'grade': user.get('grade')
            }

        except Exception as e:
            print(f"Error in login_user service: {e}")
            return False, {'message': 'An unexpected error occurred'}

    def update_user_profile(self, profile_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        4.2.4. Kullanıcı profil bilgilerini günceller.
        Doğrulama ve güncelleme işlemlerini içerir.
        Dönüş Değeri: (başarı_durumu, sonuç_veya_hata_mesajı)
        """
        # 1. Gerekli alanların kontrolü
        required_fields = ['user_id', 'first_name', 'last_name', 'grade']
        missing_fields = [field for field in required_fields if not profile_data.get(field)]
        if missing_fields:
            return False, {'message': 'Missing required fields', 'missing': missing_fields}

        user_id = profile_data['user_id']
        first_name = profile_data['first_name']
        last_name = profile_data['last_name']
        grade = int(profile_data['grade'])

        try:
            # 2. Kullanıcının var olup olmadığını kontrol et
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                return False, {'message': 'User not found'}

            # 3. Sınıf değerinin geçerli olup olmadığını kontrol et
            if grade < 1 or grade > 4:
                return False, {'message': 'Invalid grade value. Must be between 1 and 4'}

            # 4. Profil bilgilerini güncelle
            success = self.user_repo.update_user_profile(user_id, first_name, last_name, grade)
            
            if not success:
                return False, {'message': 'Failed to update profile in database'}

            # 5. Güncellenmiş kullanıcı bilgilerini getir
            updated_user = self.user_repo.get_user_by_id(user_id)
            return True, {
                'id': updated_user.get('id'),
                'username': updated_user.get('username'),
                'first_name': updated_user.get('first_name'),
                'last_name': updated_user.get('last_name'),
                'grade': updated_user.get('grade')
            }

        except Exception as e:
            print(f"Error in update_user_profile service: {e}")
            return False, {'message': 'An unexpected error occurred'}