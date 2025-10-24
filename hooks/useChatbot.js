import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addUserMessage,
    sendMessageToBot,
    clearChat,
    clearError
} from '../store/slices/chatbotSlice';

export const useChatbot = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);

    // Selectors
    const messages = useSelector((state) => state.chatBot.messages);
    const isLoading = useSelector((state) => state.chatBot.isLoading);
    const error = useSelector((state) => state.chatBot.error);
    const retryCount = useSelector((state) => state.chatBot.retryCount);

    // Toggle chatbot visibility
    const toggleChatbot = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    // Open chatbot
    const openChatbot = useCallback(() => {
        setIsOpen(true);
    }, []);

    // Close chatbot
    const closeChatbot = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Send message to bot
    const sendMessage = useCallback(async (message) => {
        if (!message || message.trim() === '') {
            return false;
        }

        try {
            // Add user message first
            dispatch(addUserMessage(message.trim()));

            // Send to bot
            await dispatch(sendMessageToBot(message.trim())).unwrap();
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }, [dispatch]);

    // Clear chat
    const clearChatHistory = useCallback(() => {
        dispatch(clearChat());
    }, [dispatch]);

    // Clear error
    const clearErrorMessage = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Get last user message
    const getLastUserMessage = useCallback(() => {
        const userMessages = messages.filter(msg => msg.role === 'user');
        return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    }, [messages]);

    // Get last assistant message
    const getLastAssistantMessage = useCallback(() => {
        const assistantMessages = messages.filter(msg => msg.role === 'assistant');
        return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null;
    }, [messages]);

    // Check if chatbot is ready
    const isReady = useCallback(() => {
        return !isLoading && !error;
    }, [isLoading, error]);

    // Get chat statistics
    const getChatStats = useCallback(() => {
        const userMessages = messages.filter(msg => msg.role === 'user');
        const assistantMessages = messages.filter(msg => msg.role === 'assistant');
        const systemMessages = messages.filter(msg => msg.role === 'system');

        return {
            totalMessages: messages.length,
            userMessages: userMessages.length,
            assistantMessages: assistantMessages.length,
            systemMessages: systemMessages.length,
            hasError: error !== null,
            retryCount
        };
    }, [messages, error, retryCount]);

    // Check if message is error
    const isErrorMessage = useCallback((message) => {
        return message.role === 'system' && message.isError;
    }, []);

    // Get conversation summary
    const getConversationSummary = useCallback(() => {
        const userMessages = messages.filter(msg => msg.role === 'user');
        const topics = userMessages.map(msg => msg.text.substring(0, 50) + '...');

        return {
            messageCount: userMessages.length,
            topics: topics,
            lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : null
        };
    }, [messages]);

    // Check if chatbot should be available
    const isAvailable = useCallback(() => {
        return !isLoading && error === null;
    }, [isLoading, error]);

    // Get chatbot status
    const getStatus = useCallback(() => {
        if (isLoading) return 'thinking';
        if (error) return 'error';
        if (isOpen) return 'open';
        return 'closed';
    }, [isLoading, error, isOpen]);

    return {
        // State
        messages,
        isLoading,
        error,
        retryCount,
        isOpen,

        // Actions
        toggleChatbot,
        openChatbot,
        closeChatbot,
        sendMessage,
        clearChatHistory,
        clearErrorMessage,

        // Getters
        getLastUserMessage,
        getLastAssistantMessage,
        getChatStats,
        getConversationSummary,
        isErrorMessage,
        isReady,
        isAvailable,
        getStatus
    };
};

export default useChatbot;
