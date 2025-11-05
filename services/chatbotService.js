import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCneKUoY3zNSZ5DStp_qYcHW_2D45oH3j4';

const genAI = new GoogleGenerativeAI(API_KEY);

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

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: message }]
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
    // Đã cập nhật với các tên model phổ biến nhất
    const modelConfigs = [
        // Gemini 2.0 (mới nhất)
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            modelName: 'gemini-2.0-flash-exp (v1beta)'
        },
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key=${API_KEY}`,
            modelName: 'gemini-2.0-flash-thinking-exp (v1beta)'
        },
        // Gemini 1.5 với các biến thể
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.5-pro-latest (v1beta)'
        },
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.5-flash-latest (v1beta)'
        },
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.5-pro (v1beta)'
        },
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.5-flash (v1beta)'
        },
        // Gemini 1.0
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.0-pro-latest (v1beta)'
        },
        {
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.0-pro (v1beta)'
        },
        // V1 API (fallback)
        {
            url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.5-pro-latest (v1)'
        },
        {
            url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
            modelName: 'gemini-1.5-flash-latest (v1)'
        },
    ];

    let lastError = null;
    let lastErrorData = null;

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
