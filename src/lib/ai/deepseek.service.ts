/**
 * @file deepseek.service.ts
 * @description Unified DeepSeek API client (OpenAI-compatible SDK with streaming support)
 * @dependencies openai
 * @created 2026-02-22
 */

import OpenAI from 'openai';

const MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

export const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1',
});

export interface ChatCompletionOptions {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  stream?: false;
}

export interface ChatCompletionStreamOptions {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  stream: true;
}

export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  const response = await deepseekClient.chat.completions.create({
    model: MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 500,
    stream: false,
  });

  return response.choices[0]?.message?.content ?? '';
}

export async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  return deepseekClient.chat.completions.create({
    model: MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 500,
    stream: true,
  });
}
