# Veritabanı Otomatik Başlatıcı

Bu sistem, uygulama başlatıldığında veritabanı tablolarının otomatik olarak oluşturulmasını sağlar.

## 🚀 Özellikler

- ✅ Veritabanını otomatik oluşturur (eğer yoksa)
- ✅ Tüm gerekli tabloları otomatik oluşturur
- ✅ Foreign key ilişkilerini doğru kurar
- ✅ UTF-8 karakter desteği
- ✅ Hata yönetimi ve loglama
- ✅ Uygulama başlatıldığında otomatik çalışır

## 📋 Oluşturulan Tablolar

1. **users** - Kullanıcı bilgileri
2. **questions** - Matematik soruları
3. **user_progress** - Kullanıcı ilerleme kayıtları
4. **quiz_sessions** - Quiz oturumları
5. **achievements** - Başarılar ve kupalar
6. **user_settings** - Kullanıcı ayarları
7. **daily_stats** - Günlük istatistikler

## 🔧 Kurulum

### 1. Gerekli Paketler

```bash
pip install mysql-connector-python
```

### 2. Veritabanı Ayarları

`.env` dosyasında veya ortam değişkenlerinde şu ayarları yapın:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=btk_app
MYSQL_PORT=3306
```

### 3. Otomatik Başlatma

Uygulama `main.py` çalıştırıldığında veritabanı otomatik olarak başlatılır:

```bash
python main.py
```

## 🧪 Test Etme

Veritabanı başlatıcıyı test etmek için:

```bash
python test_database_init.py
```

Bu komut:
- Veritabanını başlatır
- Tüm tabloları oluşturur
- Tabloların doğru oluşturulduğunu kontrol eder

## 📁 Dosya Yapısı

```
btk_app-main/
├── database_initializer.py    # Ana veritabanı başlatıcı
├── test_database_init.py     # Test dosyası
├── main.py                   # Ana uygulama (otomatik başlatma)
└── config.py                 # Veritabanı ayarları
```

## 🔍 Manuel Kontrol

Veritabanı tablolarını manuel olarak kontrol etmek için:

```sql
-- Veritabanını seç
USE btk_app;

-- Tabloları listele
SHOW TABLES;

-- Tablo yapısını kontrol et
DESCRIBE users;
DESCRIBE questions;
DESCRIBE user_progress;
DESCRIBE quiz_sessions;
DESCRIBE achievements;
DESCRIBE user_settings;
DESCRIBE daily_stats;
```

## ⚠️ Sorun Giderme

### Hata: "Access denied for user"
- MySQL kullanıcı adı ve şifresini kontrol edin
- Kullanıcının veritabanı oluşturma yetkisi olduğundan emin olun

### Hata: "Can't connect to MySQL server"
- MySQL servisinin çalıştığından emin olun
- Host ve port ayarlarını kontrol edin

### Hata: "Table already exists"
- Bu normal bir durumdur, tablo zaten mevcut demektir
- Sistem `CREATE TABLE IF NOT EXISTS` kullandığı için güvenlidir

## 🎯 Kullanım Senaryoları

1. **İlk Kurulum**: Uygulama ilk kez çalıştırıldığında tüm tablolar otomatik oluşturulur
2. **Veritabanı Silinmesi**: Yanlışlıkla tablolar silinirse, uygulama yeniden başlatıldığında otomatik oluşturulur
3. **Yeni Sunucu**: Yeni bir sunucuya taşındığında veritabanı otomatik kurulur

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `test_database_init.py` dosyasını çalıştırın
2. Hata mesajlarını kontrol edin
3. MySQL bağlantı ayarlarınızı doğrulayın
