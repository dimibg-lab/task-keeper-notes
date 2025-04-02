
import { ChatMessage } from '@/types';

const API_KEY = "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";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Функция за конвертиране на съобщения за Groq API
export const formatMessagesForApi = (messages: ChatMessage[]) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
};

// Функция за премахване на markdown звездички от текста
const removeMarkdownFormatting = (text: string): string => {
  // Премахваме ** за удебелен текст
  let formattedText = text.replace(/\*\*/g, '');
  
  // Премахваме * за курсив
  formattedText = formattedText.replace(/\*/g, '');
  
  return formattedText;
};

// Функция за генериране на заглавие на разговор от първото съобщение
export const generateConversationTitle = (message: string): string => {
  // Вземаме първите 30 символа от съобщението или цялото съобщение, ако е по-кратко
  const firstLine = message.split('\n')[0];
  const title = firstLine.length > 30 
    ? firstLine.substring(0, 30) + '...' 
    : firstLine;
  
  return title;
};

// Функция за изпращане на съобщение към AI и получаване на отговор
export const sendMessageToAI = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // Добавяме системно съобщение, което инструктира модела да отговаря само на български
    const messagesWithSystemInstruction = [
      {
        role: "system",
        content: "Отговаряй само на български език, независимо на какъв език е зададен въпросът. Бъди подробен и учтив в отговорите си. Не използвай markdown форматиране като звездички."
      },
      ...formatMessagesForApi(messages)
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: messagesWithSystemInstruction,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API грешка: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Премахваме markdown форматирането от отговора на AI
    const formattedResponse = removeMarkdownFormatting(data.choices[0].message.content);
    return formattedResponse;
  } catch (error) {
    console.error('Грешка при изпращане на съобщение:', error);
    throw error;
  }
};
