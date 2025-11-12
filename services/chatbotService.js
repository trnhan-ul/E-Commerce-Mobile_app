import { GoogleGenerativeAI } from '@google/generative-ai';
import databaseService from './databaseService';

const API_KEY = 'AIzaSyBOb2SIw5_AYiDu-Vy1RahBmTcRDLvJrAo';

const genAI = new GoogleGenerativeAI(API_KEY);

// Function để lấy context từ database
async function getShopContext() {
    try {
        // Đảm bảo database ready
        await databaseService.ensureDatabaseReady();

        // Lấy tất cả categories (không check is_active nếu cột không tồn tại)
        const categoriesQuery = 'SELECT id, name, description FROM categories LIMIT 50';
        const categories = await databaseService.db.getAllAsync(categoriesQuery);

        // Lấy top products (chỉ check stock_quantity)
        const productsQuery = `
            SELECT p.id, p.name, p.description, p.price, p.stock_quantity, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock_quantity > 0
            ORDER BY p.created_at DESC
            LIMIT 20
        `;
        const products = await databaseService.db.getAllAsync(productsQuery);

        return {
            categories,
            products
        };
    } catch (error) {
        console.error('Error getting shop context:', error);
        return {
            categories: [],
            products: []
        };
    }
}

// Function để tạo system prompt với context
function createSystemPrompt(shopContext) {
    const { categories, products } = shopContext;

    let prompt = `Bạn là trợ lý AI của cửa hàng bán siêu xe cao cấp. Nhiệm vụ của bạn là tư vấn và hỗ trợ khách hàng về các sản phẩm trong cửa hàng.

**THÔNG TIN CỬA HÀNG:**

**Danh mục sản phẩm có sẵn:**
`;

    if (categories.length > 0) {
        categories.forEach(cat => {
            prompt += `\n- ${cat.name}${cat.description ? `: ${cat.description}` : ''}`;
        });
    } else {
        prompt += '\n(Chưa có danh mục)';
    }

    prompt += '\n\n**Sản phẩm đang bán:**\n';

    if (products.length > 0) {
        products.forEach(prod => {
            prompt += `\n${prod.name}:
- Danh mục: ${prod.category_name || 'Chưa phân loại'}
- Giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
- Còn hàng: ${prod.stock_quantity} chiếc
${prod.description ? `- Mô tả: ${prod.description}` : ''}
`;
        });
    } else {
        prompt += '\n(Chưa có sản phẩm)';
    }

    prompt += `

**HƯỚNG DẪN TRẢ LỜI:**
1. Chỉ tư vấn về các sản phẩm có trong danh sách trên
2. Nếu khách hỏi về sản phẩm không có, hãy gợi ý các sản phẩm tương tự trong cửa hàng
3. Luôn đề xuất sản phẩm phù hợp với nhu cầu khách hàng
4. Trả lời ngắn gọn, thân thiện, chuyên nghiệp
5. Khi khách hỏi giá hoặc chi tiết, cung cấp thông tin chính xác từ danh sách
6. Nếu hỏi về số lượng còn hàng, trả lời dựa trên stock_quantity
7. Khuyến khích khách hàng xem chi tiết sản phẩm hoặc thêm vào giỏ hàng

Bây giờ hãy trả lời câu hỏi của khách hàng:`;

    return prompt;
}

// Function để list các model có sẵn
export async function listAvailableModels() {
    if (!API_KEY) {
        throw new Error('API key is not configured properly');
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

        if (!response.ok) {
            console.error('Failed to list models:', response.status);
            return [];
        }

        const data = await response.json();

        if (data.models && Array.isArray(data.models)) {
            const modelNames = data.models
                .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                .map(m => m.name);
            console.log('Available models:', modelNames);
            return modelNames;
        }
        return [];
    } catch (error) {
        console.error('Error listing models:', error);
        return [];
    }
}

export async function sendMessageToBotApi(message) {
    if (!API_KEY) {
        throw new Error('API key is not configured properly');
    }

    if (!message || message.trim() === '') {
        throw new Error('Message cannot be empty');
    }

    try {
        console.log('Sending message to Gemini:', message);

        // Lấy context từ database
        const shopContext = await getShopContext();
        const systemPrompt = createSystemPrompt(shopContext);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        // Gửi message kèm system prompt
        const fullMessage = `${systemPrompt}\n\nKhách hàng hỏi: ${message}`;

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: fullMessage }]
            }]
        });

        const response = await result.response;

        if (!response) {
            throw new Error('No response received from Gemini');
        }

        const text = response.text();

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        console.log('Gemini response:', text);

        return {
            text: text,
            role: 'assistant',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Gemini API Error Details:', error);
        if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
            throw new Error('API key không hợp lệ hoặc chưa được cấp quyền truy cập');
        } else if (error.message.includes('429')) {
            throw new Error('Đã vượt quá giới hạn request. Vui lòng thử lại sau');
        } else if (error.message.includes('500')) {
            throw new Error('Lỗi server từ Gemini. Vui lòng thử lại sau');
        } else if (error.message.includes('Network')) {
            throw new Error('Lỗi kết nối mạng. Kiểm tra internet của bạn');
        } else {
            throw new Error(`Lỗi Gemini API: ${error.message}`);
        }
    }
}

// REST API approach (recommended for React Native)
export async function sendMessageToBotApiRest(message) {
    if (!API_KEY) {
        throw new Error('API key is not configured properly');
    }

    if (!message || message.trim() === '') {
        throw new Error('Message cannot be empty');
    }

    // Danh sách các model và endpoint để thử (theo thứ tự ưu tiên)
    // Cập nhật với các model mới nhất có sẵn (dựa trên API response)
    const modelConfigs = [
        // Gemini 2.5 Flash (mới nhất, ổn định)
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            modelName: 'gemini-2.5-flash (v1beta)'
        },
        // Gemini 2.0 Flash
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            modelName: 'gemini-2.0-flash (v1beta)'
        },
        // Gemini Flash Latest (alias tự động trỏ đến version mới nhất)
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-flash-latest (v1beta)'
        },
        // Gemini Pro Latest
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-pro-latest (v1beta)'
        },
        // Gemini 2.5 Pro
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`,
            modelName: 'gemini-2.5-pro (v1beta)'
        },
    ];

    let lastError = null;
    let lastErrorData = null;

    // Lấy context từ database
    const shopContext = await getShopContext();
    const systemPrompt = createSystemPrompt(shopContext);
    const fullMessage = `${systemPrompt}\n\nKhách hàng hỏi: ${message}`;

    for (const config of modelConfigs) {
        try {
            console.log(`Trying model: ${config.modelName}`);

            const response = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullMessage.trim()
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`Model ${config.modelName} failed:`, {
                    status: response.status,
                    error: errorData
                });

                lastErrorData = errorData;
                lastError = new Error(`HTTP ${response.status}: ${errorData.error?.message || errorData.error?.code || 'Unknown error'}`);

                // Nếu là 404, thử model tiếp theo
                if (response.status === 404) {
                    console.log(`Model ${config.modelName} not found (404), trying next...`);
                    continue;
                }

                // Nếu là lỗi khác (400, 403, 429, 500), throw ngay
                if (response.status === 400 || response.status === 403) {
                    throw new Error(`HTTP ${response.status}: ${errorData.error?.message || errorData.error?.code || 'Bad request or invalid API key'}`);
                }

                // Tiếp tục thử model khác
                continue;
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error(`Model ${config.modelName} returned invalid format:`, data);
                continue;
            }

            const text = data.candidates[0].content.parts[0].text;

            if (!text) {
                console.error(`Model ${config.modelName} returned empty text`);
                continue;
            }

            console.log(`✅ Success with model: ${config.modelName}`);
            console.log('Gemini response:', text);

            return {
                text: text,
                role: 'assistant',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            lastError = error;
            // Nếu không phải lỗi 404, throw ngay
            if (!error.message.includes('404')) {
                console.error(`Error with ${config.modelName}:`, error);
                // Không throw ngay, tiếp tục thử model khác
            }
        }
    }

    // Tất cả các model đều thất bại - thử list models để xem model nào có sẵn
    console.error('All models failed. Trying to list available models...');
    try {
        const availableModels = await listAvailableModels();
        if (availableModels.length > 0) {
            console.log('✅ Available models found:', availableModels);
            // Thử với model đầu tiên có sẵn
            const firstModel = availableModels[0];
            if (firstModel.includes('models/')) {
                const modelName = firstModel.replace('models/', '');
                const tryUrl = `https://generativelanguage.googleapis.com/v1beta/${firstModel}:generateContent?key=${API_KEY}`;

                console.log(`Trying discovered model: ${modelName}`);
                const response = await fetch(tryUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message.trim()
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const text = data.candidates[0].content.parts[0].text;
                        console.log(`✅ Success with discovered model: ${modelName}`);
                        return {
                            text: text,
                            role: 'assistant',
                            timestamp: new Date().toISOString()
                        };
                    }
                }
            }
        } else {
            console.warn('⚠️ No models found in API response');
        }
    } catch (listError) {
        console.error('Error listing models:', listError);
    }

    // Format error message
    console.error('All models failed. Last error:', lastError);
    console.error('Last error data:', lastErrorData);

    if (lastErrorData?.error) {
        const errorMsg = lastErrorData.error.message || lastErrorData.error.code || 'Unknown error';
        if (errorMsg.includes('API key') || lastError?.message?.includes('403')) {
            throw new Error('API key không hợp lệ hoặc chưa được kích hoạt. Vui lòng:\n1. Kiểm tra lại API key từ https://aistudio.google.com/\n2. Đảm bảo API key đã được kích hoạt\n3. Kiểm tra quota/limits của API key');
        }
        if (errorMsg.includes('NOT_FOUND') || errorMsg.includes('404')) {
            throw new Error('Không tìm thấy model nào khả dụng với API key này.\nVui lòng:\n1. Kiểm tra API key có quyền truy cập Gemini API không\n2. Thử tạo API key mới từ https://aistudio.google.com/\n3. Đảm bảo đã enable Gemini API trong Google Cloud Console');
        }
        throw new Error(`Lỗi Gemini API: ${errorMsg}`);
    }

    throw new Error(`Không thể kết nối với Gemini. Tất cả các model đã thử đều thất bại.\nLỗi: ${lastError?.message || 'Unknown error'}\n\nVui lòng kiểm tra:\n1. API key có hợp lệ không\n2. API key có quyền truy cập Gemini API không\n3. Đã enable Gemini API trong Google Cloud Console chưa`);
}
