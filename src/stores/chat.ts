import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message } from '../types/chat';
import * as chatCache from '../utils/chatCache';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([]);
  const isLoaded = ref(false);

  async function loadMessages() {
    if (isLoaded.value) return;
    const cachedMessages = await chatCache.getAllMessages();
    messages.value = cachedMessages;
    isLoaded.value = true;
  }

  async function addMessage(message: Message) {
    // Prevent duplicates by ID
    if (message.id && messages.value.some(m => m.id === message.id)) {
      return;
    }

    messages.value.push(message);
    await chatCache.saveMessage(message);
    
    // Periodically trim messages to keep DB size small
    if (messages.value.length > 1100) {
      await chatCache.trimMessages();
      if (messages.value.length > 1000) {
        messages.value = messages.value.slice(-1000);
      }
    }
  }

  async function clearHistory() {
    messages.value = [];
    await chatCache.clearMessages();
  }

  return {
    messages,
    isLoaded,
    loadMessages,
    addMessage,
    clearHistory
  };
});
