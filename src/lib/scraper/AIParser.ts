import { AIProvider } from '../../types/ai';
import { notifications } from '../../utils/notifications';

interface ParsedFormField {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface ParsedForm {
  action?: string;
  method?: string;
  fields: ParsedFormField[];
}

interface AIParseResult {
  entities: {
    names: string[];
    emails: string[];
    phones: string[];
    addresses: string[];
  };
  forms: ParsedForm[];
  relevantText: string[];
  confidence: number;
}

export class AIParser {
  private provider: AIProvider;
  private apiKey: string;
  private temperature: number;

  constructor(provider: AIProvider, apiKey: string, temperature: number = 0.7) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.temperature = temperature;
  }

  async parseContent(html: string): Promise<AIParseResult> {
    try {
      const endpoint = this.getProviderEndpoint();
      const prompt = this.generatePrompt(html);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.provider.defaultModel,
          messages: [{
            role: 'system',
            content: 'You are an expert at parsing web content and identifying key information and form structures.'
          }, {
            role: 'user',
            content: prompt
          }],
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        throw new Error('Failed to parse content with AI');
      }

      const result = await response.json();
      return this.processAIResponse(result);
    } catch (error) {
      console.error('AI parsing error:', error);
      notifications.show('Failed to parse content with AI', 'error');
      throw error;
    }
  }

  private getProviderEndpoint(): string {
    switch (this.provider.id) {
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

  private generatePrompt(html: string): string {
    return `
      Analyze the following HTML content and extract:
      1. All personal information fields (names, emails, phones, addresses)
      2. Any web forms present, including their fields and structure
      3. Relevant text content related to contact or personal information
      4. Assign confidence scores to extracted information

      HTML Content:
      ${html}

      Please format the response as a structured JSON object with the following schema:
      {
        "entities": {
          "names": [],
          "emails": [],
          "phones": [],
          "addresses": []
        },
        "forms": [{
          "action": "",
          "method": "",
          "fields": [{
            "name": "",
            "type": "",
            "label": "",
            "required": false,
            "options": [],
            "placeholder": ""
          }]
        }],
        "relevantText": [],
        "confidence": 0.0
      }
    `;
  }

  private processAIResponse(response: any): AIParseResult {
    let parsedContent: AIParseResult;

    try {
      // Handle different AI provider response formats
      switch (this.provider.id) {
        case 'openai':
          parsedContent = JSON.parse(response.choices[0].message.content);
          break;
        case 'gemini':
          parsedContent = JSON.parse(response.candidates[0].content.parts[0].text);
          break;
        case 'claude':
          parsedContent = JSON.parse(response.completion);
          break;
        case 'perplexity':
          parsedContent = JSON.parse(response.choices[0].text);
          break;
        default:
          parsedContent = JSON.parse(response.response);
      }

      // Validate and clean the parsed content
      return this.validateParseResult(parsedContent);
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw new Error('Failed to process AI response');
    }
  }

  private validateParseResult(result: any): AIParseResult {
    // Ensure all required properties exist
    const validated: AIParseResult = {
      entities: {
        names: Array.isArray(result.entities?.names) ? result.entities.names : [],
        emails: Array.isArray(result.entities?.emails) ? result.entities.emails : [],
        phones: Array.isArray(result.entities?.phones) ? result.entities.phones : [],
        addresses: Array.isArray(result.entities?.addresses) ? result.entities.addresses : []
      },
      forms: Array.isArray(result.forms) ? result.forms.map(this.validateForm) : [],
      relevantText: Array.isArray(result.relevantText) ? result.relevantText : [],
      confidence: typeof result.confidence === 'number' ? result.confidence : 0
    };

    return validated;
  }

  private validateForm(form: any): ParsedForm {
    return {
      action: typeof form.action === 'string' ? form.action : undefined,
      method: typeof form.method === 'string' ? form.method : undefined,
      fields: Array.isArray(form.fields) ? form.fields.map(this.validateFormField) : []
    };
  }

  private validateFormField(field: any): ParsedFormField {
    return {
      name: typeof field.name === 'string' ? field.name : '',
      type: typeof field.type === 'string' ? field.type : 'text',
      label: typeof field.label === 'string' ? field.label : undefined,
      required: typeof field.required === 'boolean' ? field.required : false,
      options: Array.isArray(field.options) ? field.options : undefined,
      placeholder: typeof field.placeholder === 'string' ? field.placeholder : undefined
    };
  }
}