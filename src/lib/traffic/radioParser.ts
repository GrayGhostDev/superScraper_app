import { useAIStore } from '../../store/aiStore';
import { notifications } from '../../utils/notifications';

export class RadioTransmissionParser {
  private aiProvider: string;
  private apiKey: string;

  constructor(aiProvider: string, apiKey: string) {
    this.aiProvider = aiProvider;
    this.apiKey = apiKey;
  }

  async parseTransmission(text: string) {
    try {
      // Use selected AI provider to analyze the radio transmission
      const aiEndpoint = this.getAIEndpoint();
      
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          text,
          extractFields: [
            'location',
            'incidentType',
            'severity',
            'estimatedDuration',
            'affectedRoutes'
          ]
        })
      });

      if (!response.ok) throw new Error('Failed to analyze radio transmission');

      return await response.json();
    } catch (error) {
      notifications.show('Failed to parse radio transmission', 'error');
      throw error;
    }
  }

  private getAIEndpoint(): string {
    switch (this.aiProvider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'gemini':
        return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
      case 'claude':
        return 'https://api.anthropic.com/v1/complete';
      case 'perplexity':
        return 'https://api.perplexity.ai/chat/completions';
      default:
        return 'http://localhost:11434/api/generate'; // Ollama
    }
  }
}