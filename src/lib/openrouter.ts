import OpenAI from 'openai'

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set')
}

export const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    'X-Title': 'AI Regulatory Requirements Assistant',
  },
  dangerouslyAllowBrowser: true,
})

export const MODEL = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini'
export const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 30000)
export const MAX_RETRIES = Number(process.env.AI_MAX_RETRIES ?? 2)
