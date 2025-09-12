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

  /**
   * Send a file to the document analysis endpoint
   */
  sendFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.response;
    } catch (error) {
      console.error('Error uploading file to document analysis API:', error);
      throw new Error('Failed to process document');
    }
  },

  /**
   * Send a file with a prompt for enhanced document analysis
   */
  analyzeDocumentWithPrompt: async (file: File, prompt: string, history: ChatMessage[] = []): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      formData.append('history', JSON.stringify(history));

      const response = await apiClient.post('/analyze-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.response;
    } catch (error) {
      console.error('Error analyzing document with prompt:', error);
      throw new Error('Failed to analyze document');
    }
  }
  
};


export default chatAPI;
