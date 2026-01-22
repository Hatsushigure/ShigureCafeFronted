<template>
  <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <NavBar />

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col min-h-0">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-0">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Gamepad2 class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">{{ t('chat.game-relay', '游戏聊天转发') }}</h3>
              <p class="text-xs flex items-center" :class="isConnected ? 'text-green-500' : 'text-red-500'">
                <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                  :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></span>
                {{ isConnected ? t('chat.connected', '已连接至服务器') : (isReconnecting ? t('chat.reconnecting', '正在重新连接...')
                  : t('chat.disconnected', '未连接')) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div ref="messagesAreaRef" class="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          <div v-for="(group, gIdx) in groupedMessages" :key="gIdx" class="mb-6 flex items-end space-x-3"
            :class="group.isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'">

            <!-- Avatar -->
            <div v-if="group.sender" class="shrink-0 mb-1 sticky bottom-0 self-end">
              <UserAvatar :name="group.sender" :src="`https://crafthead.net/avatar/${group.sender}/32`" size="sm" />
            </div>
            <div v-else
              class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mb-1 sticky bottom-0 self-end">
              <Settings class="w-4 h-4 text-gray-500" />
            </div>

            <!-- Messages in Group -->
            <div class="flex flex-col min-w-0 flex-1" :class="group.isMe ? 'items-end' : 'items-start'">
              <!-- Sender Name inside the group (only for the first message) -->
              <span v-if="group.sender" class="text-[11px] font-bold mb-1 px-1"
                :class="group.isMe ? 'text-blue-600' : 'text-gray-500'">
                {{ group.sender }}
              </span>

              <div class="flex flex-col space-y-1 w-full" :class="group.isMe ? 'items-end' : 'items-start'">
                <div v-for="(msg, mIdx) in group.messages" :key="mIdx"
                  class="px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[85%] break-words relative" :class="[
                    group.isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-100',
                    group.isMe
                      ? (mIdx === group.messages.length - 1 ? 'rounded-br-none' : '')
                      : (mIdx === group.messages.length - 1 ? 'rounded-bl-none' : '')
                  ]">
                  <span v-if="msg.type === 'system'" class="italic text-gray-500">{{ msg.content }}</span>
                  <span v-else>{{ msg.content }}</span>
                  <!-- Spacer for the timestamp to prevent overlap -->
                  <span class="inline-block w-8"></span>

                  <span class="absolute right-2.5 bottom-1.5 text-[9px] leading-none opacity-70"
                    :class="group.isMe ? 'text-blue-100' : 'text-gray-400'">
                    {{ formatTime(msg.timestamp) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-100 shrink-0">
          <div class="flex items-end space-x-3">
            <div class="flex-1 relative">
              <textarea v-model="newMessage" rows="1" @input="adjustTextarea" @keydown.enter.prevent="handleSend"
                ref="textareaRef" :disabled="!isConnected"
                :placeholder="isConnected ? t('chat.placeholder', '发送消息到游戏内...') : t('chat.connecting-tip', '正在连接中...')"
                class="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none py-3 px-4 text-sm transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"></textarea>
            </div>
            <button @click="handleSend"
              class="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
              :disabled="!newMessage.trim() || !isConnected">
              <Send class="w-5 h-5" />
            </button>
          </div>
          <p class="mt-2 text-[10px] text-gray-400 text-center">
            {{ t('chat.tip', '消息将实时同步至 Minecraft 服务器聊天栏') }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Gamepad2, Send, Settings } from 'lucide-vue-next';
import NavBar from '../components/NavBar.vue';
import UserAvatar from '../components/UserAvatar.vue';
import { useAuthStore } from '../stores/auth';
import { useChatStore } from '../stores/chat';
import type { MessageGroup } from '../types/chat';

const { t } = useI18n();
const authStore = useAuthStore();
const chatStore = useChatStore();
const newMessage = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const messagesAreaRef = ref<HTMLDivElement | null>(null);
const isConnected = ref(false);
const isReconnecting = ref(false);

const groupedMessages = computed(() => {
  const groups: MessageGroup[] = [];
  const currentUsername = authStore.user?.minecraftUsername || authStore.user?.username;

  chatStore.messages.forEach((msg) => {
    const prevGroup = groups[groups.length - 1];
    const isMe = msg.sender === currentUsername;
    const type = msg.sender ? 'chat' : 'system';

    // Logic to determine if we should start a new group
    const shouldStartNewGroup =
      !prevGroup ||
      prevGroup.sender !== msg.sender ||
      type === 'system' ||
      (prevGroup.messages[0] && !prevGroup.sender) || // Previous was system
      (msg.timestamp - (prevGroup.messages[prevGroup.messages.length - 1]?.timestamp ?? 0)) > 5 * 60 * 1000;

    if (shouldStartNewGroup) {
      groups.push({
        sender: msg.sender,
        isMe: isMe,
        timestamp: msg.timestamp,
        messages: [{ ...msg, isMe, type } as any] // Cast to any to include temporary UI properties
      });
    } else {
      prevGroup.messages.push({ ...msg, isMe, type } as any);
    }
  });
  return groups;
});

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesAreaRef.value) {
    messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight;
  }
};

const connectWebSocket = () => {
  if (socket) {
    socket.close();
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const token = authStore.token;

  if (!token) {
    return;
  }

  // Use fully qualified URL for the WebSocket connection
  const url = `${protocol}//${window.location.host}/ws/minecraft/chat?token=${token}`;
  socket = new WebSocket(url);

  socket.onopen = () => {
    isConnected.value = true;
    isReconnecting.value = false;
    scrollToBottom();
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Backend returns ChatMessageResponse: { id, name, message, timestamp }
      chatStore.addMessage({
        id: data.id,
        sender: data.name,
        content: data.message,
        timestamp: data.timestamp
      });
      scrollToBottom();
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  };

  socket.onclose = () => {
    isConnected.value = false;
    if (!isReconnecting.value) {
      scrollToBottom();
      startReconnecting();
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    socket?.close();
  };
};

const startReconnecting = () => {
  if (isReconnecting.value) return;
  isReconnecting.value = true;

  reconnectTimer = window.setInterval(() => {
    if (!isConnected.value) {
      connectWebSocket();
    } else {
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
    }
  }, 5000);
};

onMounted(async () => {
  await chatStore.loadMessages();
  connectWebSocket();
  scrollToBottom();
});

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
  }
});

const adjustTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px';
  }
};

const handleSend = () => {
  if (!newMessage.value.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;

  const chatMessage = {
    name: authStore.user?.minecraftUsername || authStore.user?.username || 'WebUser',
    message: newMessage.value,
    timestamp: Date.now()
  };

  socket.send(JSON.stringify(chatMessage));

  // We don't add to chatStore here because the server will broadcast it back to us
  // This ensures we only have one copy of the message with the correct backend ID

  newMessage.value = '';
  if (textareaRef.value) textareaRef.value.style.height = 'auto';
  scrollToBottom();
};
</script>