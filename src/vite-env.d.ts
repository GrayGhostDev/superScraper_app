/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_TOMTOM_TOKEN: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_HOSPITAL_API_KEY: string
  readonly VITE_HOSPITAL_API_URL: string
  readonly VITE_WAZE_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_PERPLEXITY_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}