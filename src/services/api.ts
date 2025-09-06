import axios from 'axios';

// Configure the base URL for the API
const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  prompt: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  response: string;
}

export const chatAPI = {
  /**
   * Send a message to the chat endpoint
   */
  sendMessage: async (prompt: string, history: ChatMessage[] = []): Promise<string> => {
    try {
      const response = await apiClient.post<ChatResponse>('/chat', {
        prompt,
        history,
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error sending message to chat API:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  },

  /**
   * Send a message to the agent endpoint (for future use)
   */
  sendAgentMessage: async (prompt: string, history: ChatMessage[] = []): Promise<string> => {
    try {
      const response = await apiClient.post<ChatResponse>('/agent', {
        prompt,
        history,
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error sending message to agent API:', error);
      throw new Error('Failed to get response from AI agent');
    }
  },
};

export default chatAPI;
