import { Brain, Sparkles, Bot, Cpu, Terminal } from 'lucide-react';

export interface AIConfig {
  enabled: boolean;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIAnalysisResult {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  summary: string;
  confidence: Record<string, number>;
  analysis: Record<string, number>;
  recommendations: string[];
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresApiKey: boolean;
  defaultModel?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'ChatGPT',
    description: 'Powered by OpenAI GPT-4',
    icon: '🤖',
    requiresApiKey: true,
    defaultModel: 'gpt-4'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s advanced AI model',
    icon: '✨',
    requiresApiKey: true,
    defaultModel: 'gemini-pro'
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s AI assistant',
    icon: '🧠',
    requiresApiKey: true,
    defaultModel: 'claude-2'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Advanced language understanding',
    icon: '💡',
    requiresApiKey: true
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local AI processing',
    icon: '🖥️',
    requiresApiKey: false,
    defaultModel: 'llama2'
  }
];