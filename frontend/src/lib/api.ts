import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

console.log("🚀 API Configuration Loaded:", API_URL);

export const api = axios.create({
    baseURL: API_URL,
    timeout: 120000, // 2 minutes (LLM generation can be slow)
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface InterviewConfig {
    role: string;
    experience_level: string;
    topic?: string;
}

export const startInterview = async (config: InterviewConfig) => {
    const response = await api.post('/api/interview/start', { config });
    return response.data;
};

export const sendChat = async (sessionId: string, content: string) => {
    const response = await api.post('/api/interview/chat', { session_id: sessionId, content });
    return response.data;
};

export const getFeedback = async (sessionId: string) => {
    const response = await api.post('/api/interview/feedback', { session_id: sessionId });
    return response.data;
};
