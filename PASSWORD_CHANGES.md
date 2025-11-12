# ✅ ĐÃ XÓA PASSWORD HASHING

## Thay đổi:

### 1. ✅ Đã xóa password hashing trong `authService.js`
- ❌ Xóa method `hashPassword()`
- ❌ Xóa import `expo-crypto`
- ✅ Tất cả password giờ lưu và so sánh dạng **plain text**

### 2. ✅ Đã cập nhật sample data
- File: `sampleData/supercarShopData.js`
- Admin password: `123456` (plain text)
- User password: `123456` (plain text)

### 3. ✅ Database sẽ tự động reset khi chạy app
- Flag `RESET_DATABASE_ON_START = true` trong `databaseService.js`
- Mỗi lần reload app → Database sẽ xóa và import lại data mới

## Cách test:

1. **Reload app** (nhấn `r` trong terminal Expo)
2. Login với:
   - **Admin**: admin@shopapp.com / 123456
   - **User**: user@shopapp.com / 123456

## Lưu ý:
- ⚠️ Password giờ lưu dạng **plain text** (không an toàn cho production)
- ⚠️ Database sẽ **reset mỗi lần reload** (tắt flag khi cần giữ data)
