// Sample Data cho Shop Siêu Xe (Supercar)
// Dành cho demo ấn tượng - Các dòng xe cao cấp

export const supercarShopSampleData = {
    // Categories
    categories: [
        {
            id: 1,
            name: 'Ferrari',
            description: 'Xe siêu thể thao Ferrari - Biểu tượng của sự sang trọng',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400'
        },
        {
            id: 2,
            name: 'Lamborghini',
            description: 'Xe siêu thể thao Lamborghini - Thiết kế độc đáo, hiệu năng vượt trội',
            image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'
        },
        {
            id: 3,
            name: 'Bugatti',
            description: 'Xe siêu thể thao Bugatti - Tốc độ cực đại, công nghệ đỉnh cao',
            image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400'
        },
        {
            id: 4,
            name: 'McLaren',
            description: 'Xe siêu thể thao McLaren - Công nghệ F1, hiệu năng ấn tượng',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400'
        },
        {
            id: 5,
            name: 'Porsche',
            description: 'Xe thể thao Porsche - Cân bằng hoàn hảo giữa hiệu năng và thực dụng',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'
        },
        {
            id: 6,
            name: 'Aston Martin',
            description: 'Xe siêu sang Aston Martin - Thiết kế thanh lịch, sang trọng',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'
        }
    ],

    // Products
    products: [
        // === FERRARI ===
        {
            name: 'Ferrari 488 GTB',
            price: 12800000000, // 12.8 tỷ
            description: 'Ferrari 488 GTB - Siêu xe thể thao V8 twin-turbo, 670 mã lực, 0-100km/h trong 3.0 giây. Thiết kế đẹp mắt, nội thất sang trọng.',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            category_id: 1,
            stock_quantity: 2,
            is_featured: 1,
            is_new: 1,
            rating: 4.9,
            review_count: 15
        },
        {
            name: 'Ferrari SF90 Stradale',
            price: 28500000000, // 28.5 tỷ
            description: 'Ferrari SF90 Stradale - Hybrid siêu xe, 1000 mã lực, công nghệ plug-in hybrid. Một trong những Ferrari mạnh nhất từng được sản xuất.',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            category_id: 1,
            stock_quantity: 1,
            is_featured: 1,
            is_new: 1,
            rating: 5.0,
            review_count: 8
        },
        {
            name: 'Ferrari Portofino',
            price: 9800000000, // 9.8 tỷ
            description: 'Ferrari Portofino - Convertible GT, 600 mã lực. Có thể mở mái, phù hợp đi đường dài và thư giãn.',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            category_id: 1,
            stock_quantity: 3,
            is_featured: 0,
            is_new: 0,
            rating: 4.8,
            review_count: 12
        },

        // === LAMBORGHINI ===
        {
            name: 'Lamborghini Huracán EVO',
            price: 11500000000, // 11.5 tỷ
            description: 'Lamborghini Huracán EVO - V10 tự nhiên, 640 mã lực, 0-100km/h trong 2.9 giây. Thiết kế góc cạnh, đầy năng lượng.',
            image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
            category_id: 2,
            stock_quantity: 2,
            is_featured: 1,
            is_new: 1,
            rating: 4.9,
            review_count: 18
        },
        {
            name: 'Lamborghini Aventador SVJ',
            price: 18500000000, // 18.5 tỷ
            description: 'Lamborghini Aventador SVJ - V12 tự nhiên, 770 mã lực. Bản giới hạn đặc biệt, hiệu năng cực đại.',
            image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
            category_id: 2,
            stock_quantity: 1,
            is_featured: 1,
            is_new: 0,
            rating: 5.0,
            review_count: 10
        },
        {
            name: 'Lamborghini Urus',
            price: 14200000000, // 14.2 tỷ
            description: 'Lamborghini Urus - SUV hiệu năng cao, 650 mã lực. Kết hợp sự sang trọng và hiệu năng của siêu xe.',
            image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
            category_id: 2,
            stock_quantity: 4,
            is_featured: 1,
            is_new: 0,
            rating: 4.8,
            review_count: 25
        },

        // === BUGATTI ===
        {
            name: 'Bugatti Chiron',
            price: 45000000000, // 45 tỷ
            description: 'Bugatti Chiron - Siêu xe tốc độ cực đại, 1500 mã lực, tốc độ tối đa 420 km/h. Một trong những chiếc xe đắt nhất thế giới.',
            image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
            category_id: 3,
            stock_quantity: 1,
            is_featured: 1,
            is_new: 0,
            rating: 5.0,
            review_count: 3
        },
        {
            name: 'Bugatti Veyron',
            price: 32000000000, // 32 tỷ
            description: 'Bugatti Veyron - Tiền nhiệm của Chiron, 1000 mã lực. Biểu tượng của sự hoàn hảo trong công nghệ siêu xe.',
            image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
            category_id: 3,
            stock_quantity: 1,
            is_featured: 0,
            is_new: 0,
            rating: 4.9,
            review_count: 5
        },

        // === McLAREN ===
        {
            name: 'McLaren 720S',
            price: 13800000000, // 13.8 tỷ
            description: 'McLaren 720S - Siêu xe với công nghệ F1, 720 mã lực. Thiết kế khí động học ấn tượng, hiệu năng vượt trội.',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            category_id: 4,
            stock_quantity: 2,
            is_featured: 1,
            is_new: 1,
            rating: 4.9,
            review_count: 14
        },
        {
            name: 'McLaren P1',
            price: 28000000000, // 28 tỷ
            description: 'McLaren P1 - Hybrid hypercar, 916 mã lực. Kết hợp động cơ điện và xăng, công nghệ đỉnh cao.',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            category_id: 4,
            stock_quantity: 1,
            is_featured: 1,
            is_new: 0,
            rating: 5.0,
            review_count: 6
        },
        {
            name: 'McLaren Artura',
            price: 12500000000, // 12.5 tỷ
            description: 'McLaren Artura - Hybrid mới nhất, 680 mã lực. Kết hợp hiệu năng và hiệu quả nhiên liệu.',
            image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
            category_id: 4,
            stock_quantity: 3,
            is_featured: 0,
            is_new: 1,
            rating: 4.8,
            review_count: 11
        },

        // === PORSCHE ===
        {
            name: 'Porsche 911 Turbo S',
            price: 8800000000, // 8.8 tỷ
            description: 'Porsche 911 Turbo S - Thế hệ mới nhất, 650 mã lực. Cân bằng hoàn hảo giữa hiệu năng và thực dụng hàng ngày.',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            category_id: 5,
            stock_quantity: 5,
            is_featured: 1,
            is_new: 1,
            rating: 4.9,
            review_count: 32
        },
        {
            name: 'Porsche 718 Cayman GT4',
            price: 7200000000, // 7.2 tỷ
            description: 'Porsche 718 Cayman GT4 - Động cơ giữa sau, 420 mã lực. Tập trung vào trải nghiệm lái thuần túy.',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            category_id: 5,
            stock_quantity: 4,
            is_featured: 0,
            is_new: 0,
            rating: 4.8,
            review_count: 28
        },
        {
            name: 'Porsche Taycan Turbo',
            price: 9500000000, // 9.5 tỷ
            description: 'Porsche Taycan Turbo - Xe điện hiệu năng cao, 680 mã lực. Tốc độ và tầm hoạt động ấn tượng.',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            category_id: 5,
            stock_quantity: 3,
            is_featured: 1,
            is_new: 1,
            rating: 4.7,
            review_count: 19
        },

        // === ASTON MARTIN ===
        {
            name: 'Aston Martin DB11',
            price: 12500000000, // 12.5 tỷ
            description: 'Aston Martin DB11 - Grand Tourer sang trọng, 630 mã lực. Thiết kế thanh lịch, nội thất cao cấp.',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            category_id: 6,
            stock_quantity: 2,
            is_featured: 1,
            is_new: 0,
            rating: 4.8,
            review_count: 16
        },
        {
            name: 'Aston Martin Vantage',
            price: 9800000000, // 9.8 tỷ
            description: 'Aston Martin Vantage - Thể thao cỡ nhỏ, 510 mã lực. Nhanh nhẹn, linh hoạt, thiết kế đẹp mắt.',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            category_id: 6,
            stock_quantity: 3,
            is_featured: 0,
            is_new: 1,
            rating: 4.7,
            review_count: 22
        },
        {
            name: 'Aston Martin DBS Superleggera',
            price: 15800000000, // 15.8 tỷ
            description: 'Aston Martin DBS Superleggera - Siêu xe 725 mã lực. Kết hợp sức mạnh và sự tinh tế của Anh.',
            image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
            category_id: 6,
            stock_quantity: 1,
            is_featured: 1,
            is_new: 0,
            rating: 4.9,
            review_count: 12
        }
    ],

    // Users (giữ nguyên)
    users: [
        {
            email: 'admin@shopapp.com',
            username: 'admin', // Thêm username để dễ đăng nhập
            password: 'admin123',
            full_name: 'Admin User',
            phone: '0123456789',
            role: 'admin'
        },
        {
            email: 'user@shopapp.com',
            username: 'user', // Thêm username để dễ đăng nhập
            password: 'user123',
            full_name: 'Test User',
            phone: '0987654321',
            role: 'user'
        }
    ]
};

// Function để import sample data vào database
export const importSupercarShopData = async (databaseService) => {
    try {
        // Import categories
        for (const category of supercarShopSampleData.categories) {
            await databaseService.addCategory(category);
        }

        // Import products
        for (const product of supercarShopSampleData.products) {
            await databaseService.addProduct(product);
        }

        // Import users (if needed)
        for (const user of supercarShopSampleData.users) {
            await databaseService.createUser(user);
        }

        console.log('✅ Sample data imported successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error importing sample data:', error);
        return false;
    }
};

export default supercarShopSampleData;
