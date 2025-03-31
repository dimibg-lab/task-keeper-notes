
import { ChatMessage } from '@/types';

const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Функция за конвертиране на съобщения за OpenRouter API
export const formatMessagesForApi = (messages: ChatMessage[]) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
};

// Функция за изпращане на съобщение към AI и получаване на отговор
export const sendMessageToAI = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Personal Assistant App',
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-thinking-exp:free",
        messages: formatMessagesForApi(messages),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API грешка: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Грешка при изпращане на съобщение:', error);
    throw error;
  }
};
