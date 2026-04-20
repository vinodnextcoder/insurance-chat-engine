import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const HEALTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Conversation API
export const conversationAPI = {
  startConversation: async (data) => {
    const response = await apiClient.post('/conversation/start', data);
    return response.data;
  },
  
  sendMessage: async (conversationId, message) => {
    const response = await apiClient.post('/conversation/ask', {
      sessionId: conversationId,
      userInput: message
    });
    return response.data;
  },
  
  getConversation: async (conversationId) => {
    const response = await apiClient.get(`/conversation/${conversationId}`);
    return response.data;
  }
};

// Quote API
export const quoteAPI = {
  getQuote: async (data) => {
    const response = await apiClient.post('/quote/calculate', data);
    return response.data;
  },
  
  generateQuote: async (sessionId) => {
    const response = await apiClient.post('/quote/generate', { sessionId });
    return response.data;
  },
  
  saveQuote: async (quoteData) => {
    const response = await apiClient.post('/quote/save', quoteData);
    return response.data;
  },
  
  getQuotes: async () => {
    const response = await apiClient.get('/quote/list');
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${HEALTH_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
};

export default apiClient;
