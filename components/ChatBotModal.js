import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    addUserMessage,
    sendMessageToBot,
    clearChat,
    clearError,
} from "../store/slices/chatbotSlice";
import { wp, hp, rf, spacing, borderRadius, fontSizes, SCREEN_HEIGHT } from "../utils/responsive";

const ChatBotModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const flatListRef = useRef(null);

    const dispatch = useDispatch();
    const messages = useSelector((state) => state.chatBot.messages);
    const isLoading = useSelector((state) => state.chatBot.isLoading);
    const error = useSelector((state) => state.chatBot.error);

    // Lấy kích thước màn hình để tính toán layout
    const maxChatHeight = SCREEN_HEIGHT * 0.7; // Giới hạn chiều cao chat tối đa 70% màn hình

    const sendMessage = async () => {
        if (!input.trim()) return;

        const message = input.trim();
        setInput(""); // Clear input immediately

        // Add user message first
        dispatch(addUserMessage(message));

        // Then send to bot
        try {
            await dispatch(sendMessageToBot(message)).unwrap();
        } catch (error) {
            console.error('Failed to send message:', error);
            // Error is already handled in the slice
        }
    };

    const handleRetry = () => {
        const lastUserMessage = messages
            .slice()
            .reverse()
            .find(msg => msg.role === 'user');

        if (lastUserMessage) {
            dispatch(clearError());
            dispatch(sendMessageToBot(lastUserMessage.text));
        }
    };

    const handleClearChat = () => {
        Alert.alert(
            "Xóa cuộc trò chuyện",
            "Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", onPress: () => dispatch(clearChat()) }
            ]
        );
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const renderMessage = ({ item, index }) => {
        const isUser = item.role === "user";
        const isSystem = item.role === "system";
        const isError = item.isError;

        return (
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                }}
            >
                <View
                    style={{
                        backgroundColor: isError
                            ? "#fee2e2"
                            : isUser
                                ? "#2563eb"
                                : isSystem
                                    ? "#f3f4f6"
                                    : "#e5e7eb",
                        padding: 12,
                        borderRadius: 12,
                        maxWidth: "85%",
                        borderBottomRightRadius: isUser ? 4 : 12,
                        borderBottomLeftRadius: isUser ? 12 : 4,
                        borderWidth: isError ? 1 : 0,
                        borderColor: isError ? "#fca5a5" : "transparent",
                    }}
                >
                    <Text
                        style={{
                            color: isError
                                ? "#dc2626"
                                : isUser
                                    ? "#fff"
                                    : "#111827",
                            fontSize: 14,
                            lineHeight: 20,
                        }}
                    >
                        {item.text}
                    </Text>

                    {/* Show timestamp for non-error messages */}
                    {!isError && item.timestamp && (
                        <Text
                            style={{
                                color: isUser ? "#bfdbfe" : "#6b7280",
                                fontSize: 10,
                                marginTop: 4,
                                textAlign: isUser ? "right" : "left"
                            }}
                        >
                            {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <>
            {/* Floating Button */}
            <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                style={{
                    position: "absolute",
                    bottom: 120,
                    right: 30,
                    backgroundColor: "#2563eb",
                    padding: 15,
                    borderRadius: 30,
                    zIndex: 999,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    elevation: 5,
                }}
            >
                <Text style={{ color: "white", fontSize: 18 }}>
                    {isOpen ? "❌" : "💬"}
                </Text>
            </TouchableOpacity>

            {/* Chat Window */}
            {isOpen && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                    style={{
                        position: "absolute",
                        bottom: 190,
                        right: 20,
                        width: 340,
                        maxHeight: maxChatHeight, // Sử dụng maxHeight tính toán
                        backgroundColor: "white",
                        borderRadius: 12,
                        shadowColor: "#000",
                        shadowOpacity: 0.15,
                        shadowRadius: 10,
                        elevation: 8,
                        zIndex: 700,
                        overflow: "hidden",
                    }}
                >
                    {/* Header - Cố định */}
                    <View
                        style={{
                            backgroundColor: "#2563eb",
                            padding: 15,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            // Không dùng flex để header không co giãn
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                                🤖 Gemini AI
                            </Text>
                            {isLoading && (
                                <View
                                    style={{
                                        marginLeft: 8,
                                        width: 8,
                                        height: 8,
                                        backgroundColor: "#10b981",
                                        borderRadius: 4
                                    }}
                                />
                            )}
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TouchableOpacity
                                onPress={handleClearChat}
                                style={{ marginRight: 10 }}
                            >
                                <Text style={{ color: "white", fontSize: 16 }}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Chat Content - Linh hoạt nhưng có giới hạn */}
                    <View
                        style={{
                            flex: 1,
                            minHeight: 200, // Chiều cao tối thiểu
                            maxHeight: maxChatHeight - 200, // Trừ đi header + input + padding
                        }}
                    >
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderMessage}
                            contentContainerStyle={{
                                paddingVertical: 10,
                                flexGrow: 1
                            }}
                            showsVerticalScrollIndicator={false}
                            // Đảm bảo scroll được khi có nhiều tin nhắn
                            nestedScrollEnabled={true}
                        />
                    </View>

                    {/* Loading Indicator - Cố định */}
                    {isLoading && (
                        <View style={{
                            paddingHorizontal: 15,
                            paddingBottom: 5,
                            flexShrink: 0, // Không co lại
                        }}>
                            <Text style={{ color: "#6b7280", fontStyle: "italic" }}>
                                💭 Đang suy nghĩ...
                            </Text>
                        </View>
                    )}

                    {/* Error with Retry Button - Cố định */}
                    {error && (
                        <View
                            style={{
                                paddingHorizontal: 15,
                                paddingVertical: 8,
                                backgroundColor: "#fee2e2",
                                borderRadius: 8,
                                margin: 10,
                                flexShrink: 0,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                <Text style={{ fontSize: 16, marginRight: 5 }}>❌</Text>
                                <Text style={{ color: "#dc2626", fontSize: 12, flex: 1, lineHeight: 18 }}>
                                    {error.includes('API key') || error.includes('model')
                                        ? 'Lỗi cấu hình Gemini API. Vui lòng kiểm tra API key và thử lại.'
                                        : error}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleRetry}
                                style={{
                                    backgroundColor: "#dc2626",
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 6,
                                    marginTop: 8,
                                    alignSelf: "flex-start",
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                                    🔄 Thử lại
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Input - Cố định ở dưới cùng */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-end", // Thay đổi từ center thành flex-end
                            borderTopWidth: 1,
                            borderColor: "#e5e7eb",
                            padding: 10,
                            backgroundColor: "#f9fafb",
                            flexShrink: 0, // Không cho phép co lại
                        }}
                    >
                        <TextInput
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: "#d1d5db",
                                borderRadius: 8,
                                paddingHorizontal: 12, // Tăng padding ngang
                                paddingVertical: 8, // Giảm padding dọc
                                marginRight: 8,
                                backgroundColor: "white",
                                fontSize: 14,
                                maxHeight: 80, // Giảm maxHeight
                                minHeight: 40, // Thêm minHeight
                                textAlignVertical: 'top', // Căn text lên trên cho Android
                            }}
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={sendMessage}
                            editable={!isLoading}
                            multiline
                            maxLength={500}
                            returnKeyType="send" // Thêm nút Send trên bàn phím
                            blurOnSubmit={false} // Không ẩn bàn phím khi nhấn send
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={isLoading || !input.trim()}
                            style={{
                                backgroundColor: (!isLoading && input.trim()) ? "#2563eb" : "#9ca3af",
                                padding: 12,
                                borderRadius: 8,
                                minWidth: 50,
                                alignItems: "center",
                                justifyContent: "center", // Căn giữa icon
                                height: 40, // Cố định chiều cao button
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>
                                {isLoading ? "..." : "📤"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </>
    );
};

export default ChatBotModal;
