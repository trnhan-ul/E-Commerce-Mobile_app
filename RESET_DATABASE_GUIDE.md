# 🔄 Hướng Dẫn Reset Database Mỗi Lần Chạy

## 📋 Tổng Quan

File `services/databaseService.js` đã được cập nhật với tính năng reset database tự động mỗi lần khởi động app.

## ⚙️ Cấu Hình

Trong file `services/databaseService.js`, có flag để bật/tắt tính năng:

```javascript
constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initPromise = null;
    // ⚠️ BẬT FLAG NÀY ĐỂ XÓA DATABASE MỖI LẦN CHẠY
    this.RESET_DATABASE_ON_START = true; // ✅ true = Reset, ❌ false = Giữ data
}
```

## 🎯 Cách Sử Dụng

### 1️⃣ Để Reset Database Mỗi Lần Chạy (Development Mode)

```javascript
this.RESET_DATABASE_ON_START = true; // ✅ BẬT
```

**Kết quả:**
- ✅ Database cũ bị xóa hoàn toàn
- ✅ Tạo database mới
- ✅ Import lại sample data từ `sampleData/supercarShopData.js`
- ✅ Tất cả users, products, categories được tạo lại từ đầu

**Khi nào dùng:**
- Đang phát triển và test
- Muốn data luôn sạch mỗi lần chạy
- Đã thay đổi sample data và muốn apply ngay

### 2️⃣ Để Giữ Database (Production Mode)

```javascript
this.RESET_DATABASE_ON_START = false; // ❌ TẮT
```

**Kết quả:**
- ✅ Giữ nguyên database cũ
- ✅ Không mất dữ liệu user đã tạo
- ✅ Orders, cart, reviews được giữ nguyên

**Khi nào dùng:**
- App đã release cho users
- Cần giữ dữ liệu lâu dài
- Không muốn mất data sau mỗi lần restart

## 🚀 Cách Test

### Test Reset Database:

1. **Bật reset mode:**
   ```javascript
   this.RESET_DATABASE_ON_START = true;
   ```

2. **Chạy app:**
   ```bash
   npm start
   ```

3. **Login với admin:**
   - Email: `admin@shopapp.com`
   - Password: `123456` (hash)

4. **Kiểm tra console:**
   ```
   🗑️ Resetting database...
   ✅ Database file deleted successfully
   ✅ Database reset completed
   Database initialized successfully
   📦 Starting to populate sample data...
   ✅ Database populated successfully!
   ```

5. **Tắt app và chạy lại** - Data sẽ được import lại từ đầu!

## 📝 Lưu Ý Quan Trọng

### ⚠️ Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Reset Flag | `true` ✅ | `false` ❌ |
| Data Loss | Có (mỗi lần chạy) | Không |
| Sample Data | Import lại | Chỉ import lần đầu |
| User Data | Bị xóa | Được giữ nguyên |

### 🔧 Khi Nào Cần Reset Manual

Nếu app đang chạy mà muốn reset:

1. **Dừng app** (Ctrl + C)
2. **Xóa cache Expo:**
   ```bash
   npx expo start -c
   ```
3. **Hoặc xóa app khỏi simulator/device và cài lại**

### 📱 Reset Trên Device/Simulator

**iOS Simulator:**
```bash
Device > Erase All Content and Settings...
```

**Android Emulator:**
```bash
Settings > Apps > Your App > Storage > Clear Data
```

**Physical Device:**
- Gỡ cài đặt app và cài lại

## 🐛 Troubleshooting

### Lỗi: Database không reset

**Nguyên nhân:** Flag vẫn = `false`

**Giải pháp:**
```javascript
this.RESET_DATABASE_ON_START = true; // ✅ Đảm bảo = true
```

### Lỗi: "expo-file-system not found"

**Giải pháp:**
```bash
npm install expo-file-system
npx expo start -c
```

### Data vẫn giữ nguyên sau khi restart

**Nguyên nhân:** 
- Flag = `false`
- Hoặc app đang dùng cache

**Giải pháp:**
```bash
# Clear cache
npx expo start -c

# Hoặc
rm -rf .expo
npm start
```

## 💡 Tips

### Để Test Nhanh Các Scenarios:

1. **Test với fresh data:**
   ```javascript
   this.RESET_DATABASE_ON_START = true;
   ```
   - Chạy app
   - Login với admin
   - Test features

2. **Test với existing data:**
   ```javascript
   this.RESET_DATABASE_ON_START = false;
   ```
   - Tạo orders, add cart
   - Restart app
   - Kiểm tra data còn không

3. **Test migration/schema changes:**
   - Đổi database schema
   - Bật reset = true
   - Chạy lại để apply changes

## 📦 Sample Data Location

Data được import từ: `sampleData/supercarShopData.js`

**Bao gồm:**
- ✅ 2 Users (admin + user)
- ✅ 8 Categories (Supercars, SUVs, etc.)
- ✅ 30+ Products (Ferrari, Lamborghini, etc.)
- ✅ Sample reviews

**Để thay đổi sample data:**
1. Edit file `sampleData/supercarShopData.js`
2. Bật `RESET_DATABASE_ON_START = true`
3. Restart app
4. Data mới được import!

## ✅ Checklist Trước Khi Deploy

- [ ] Đổi `RESET_DATABASE_ON_START = false`
- [ ] Test app không bị reset data
- [ ] Verify users có thể register
- [ ] Verify orders được lưu sau restart
- [ ] Remove các console.log không cần thiết
- [ ] Test migration nếu có database schema changes

---

**Tác giả:** Generated for E-Commerce Mobile App
**Ngày:** 2025-01-12
**Version:** 1.0
