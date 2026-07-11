# Sorayori

Sorayori là ứng dụng thời tiết Android nhẹ của Sakayori Studio, xây dựng bằng Tauri 2, Rust và React. Ứng dụng dùng Open-Meteo nên không cần API key.

## Tính năng

- Thời tiết hiện tại, dự báo 24 giờ và 7 ngày.
- Tìm thành phố hoặc dùng vị trí thiết bị khi người dùng cấp quyền.
- Tiếng Việt và English.
- Đơn vị °C/km/h và °F/mph.
- Cảnh động theo thời tiết, ngày đêm và thiết lập giảm chuyển động.
- Cache dữ liệu gần nhất để xem khi mất mạng.
- Hỗ trợ Android 8.0 trở lên.

## Môi trường phát triển

Cần cài Node.js 20, Rust stable, Java 17, Android Studio/SDK và Android NDK. Sau khi Android SDK đã sẵn sàng:

```bash
npm ci
rustup target add aarch64-linux-android armv7-linux-androideabi
npm run tauri android init
npm run tauri android dev
```

Thư mục `src-tauri/gen` được Tauri sinh theo máy và không lưu trong source.

## APK release đã ký

Workflow `.github/workflows/android-release.yml` chạy thủ công hoặc khi push tag bắt đầu bằng `v`. Cấu hình các GitHub Actions secrets sau:

- `ANDROID_KEYSTORE_BASE64`: nội dung keystore đã mã hóa Base64 một dòng.
- `ANDROID_KEYSTORE_PASSWORD`: mật khẩu keystore.
- `ANDROID_KEY_ALIAS`: alias của signing key.
- `ANDROID_KEY_PASSWORD`: mật khẩu signing key.

Tạo keystore một lần và giữ bản gốc ở nơi an toàn:

```bash
keytool -genkeypair -v -keystore sorayori-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sorayori
base64 -w 0 sorayori-release.jks
```

Sau khi workflow hoàn tất, APK nằm trong artifact `Sorayori-Android-release`. Keystore không được đưa vào repository; mất keystore sẽ không thể cập nhật cùng một ứng dụng đã phát hành.

## Cấu trúc

- `src`: giao diện, bản dịch và weather scenes.
- `src-tauri/src/weather.rs`: Open-Meteo client, chuẩn hóa dữ liệu và cache.
- `src-tauri/capabilities`: quyền Tauri tối thiểu cho vị trí.
- `.github/workflows`: pipeline build và ký APK.
