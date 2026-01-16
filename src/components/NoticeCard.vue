<template>
  <BaseCard 
    @click="$emit('click')" 
    hoverable 
    :body-class="compact ? 'p-6' : 'p-6'"
    :border="notice.pinned ? 'border-2 border-orange-300 bg-orange-50/30 ring-2 ring-orange-100/50' : 'border-gray-100'"
    class="h-full"
  >
    <div class="flex items-start" :class="compact ? 'space-x-4' : 'space-x-6'">
      <div class="flex-shrink-0">
        <span class="inline-flex items-center justify-center rounded-full"
          :class="[
            notice.pinned ? 'bg-orange-100' : 'bg-blue-100',
            compact ? 'h-10 w-10' : 'h-12 w-12'
          ]">
          <component :is="notice.pinned ? Megaphone : Bell" 
            :class="[notice.pinned ? 'text-orange-600' : 'text-blue-600', compact ? 'h-5 w-5' : 'h-6 w-6']" 
          />
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <div class="flex items-center flex-1 min-w-0">
            <h4 class="font-bold text-gray-900 break-words" :class="compact ? 'text-lg' : 'text-xl'">
              {{ notice.title }}
            </h4>
            <span v-if="notice.pinned"
              class="ml-2 flex-shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
              {{ t('notices.pinned') }}
            </span>
          </div>
          <span class="text-gray-400 ml-4 flex-shrink-0" :class="compact ? 'text-xs' : 'text-sm'">
            {{ formatDateTime(notice.createdAt) }}
          </span>
        </div>
        
        <div 
          :class="[
            'mt-2 prose prose-slate max-w-none text-gray-600 line-clamp-3 overflow-hidden break-words',
            compact ? 'prose-sm' : ''
          ]"
          v-html="renderMarkdown(notice.content)"
        ></div>

        <!-- Reaction Summary -->
        <div v-if="reactions.length > 0"
          :class="['flex flex-wrap items-center gap-1.5', compact ? 'mt-2' : 'mt-3']">
          <span v-for="reaction in reactions.slice(0, 5)"
            :key="reaction.type"
            class="inline-flex items-center space-x-1 font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
            :class="compact ? 'text-[9px]' : 'text-[10px]'">
            <span>{{ getEmoji(reaction.type) }}</span>
            <span>{{ reaction.count }}</span>
          </span>
          <span v-if="reactions.length > 5"
            class="text-[10px] text-gray-400">...</span>
        </div>

        <div :class="['flex items-center justify-between border-t border-gray-50', compact ? 'mt-4 pt-3' : 'mt-6 pt-4']">
          <div class="flex items-center text-gray-500" :class="compact ? 'text-xs' : 'text-sm'">
            <UserAvatar :name="authorProfile?.nickname || notice.authorUsername" :src="authorProfile?.avatarUrl" :size="compact ? 'xs' : 'sm'" class="mr-2" />
            <span class="font-medium text-gray-900 mr-2">{{ authorProfile?.nickname || notice.authorUsername }}</span>
            <span v-if="notice.updatedAt !== notice.createdAt" class="italic">
              {{ t('notices.edited', { time: formatDateTime(notice.updatedAt) }) }}
            </span>
          </div>
          <div class="flex items-center" :class="compact ? 'space-x-3' : 'space-x-4'">
            <template v-if="isAdmin">
              <button @click.stop="$emit('edit', notice)"
                class="font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center"
                :class="compact ? 'text-xs' : 'text-sm'">
                <Edit2 class="h-4 w-4 mr-1" />
                <span :class="compact ? 'hidden sm:inline' : ''">{{ t('notices.edit') }}</span>
              </button>
              <button v-if="!compact" @click.stop="$emit('delete', notice)"
                class="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center">
                <Trash2 class="h-4 w-4 mr-1" />
                <span>{{ t('notices.delete') }}</span>
              </button>
            </template>
            <button @click.stop="$emit('read', notice)"
              class="font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center"
              :class="compact ? 'text-xs' : 'text-sm'">
              {{ t('notices.read-full') }}
              <ChevronRight class="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Megaphone, Bell, Edit2, Trash2, ChevronRight } from 'lucide-vue-next';
import BaseCard from './BaseCard.vue';
import UserAvatar from './UserAvatar.vue';
import { formatDateTime } from '../utils/formatters';
import { renderMarkdown } from '../utils/markdown';
import { useNoticeStore } from '../stores/notice';
import type { Notice } from '../types/notice';
import { useSystemStore } from '../stores/system';
import { useUserStore } from '../stores/user';

interface Props {
  notice: Notice;
  compact?: boolean;
  isAdmin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  isAdmin: false
});

defineEmits(['click', 'edit', 'delete', 'read']);

const { t } = useI18n();
const noticeStore = useNoticeStore();
const systemStore = useSystemStore();
const userStore = useUserStore();

const reactions = computed(() => noticeStore.getReactions(props.notice.id));
const getEmoji = (type: string) => systemStore.reactionMap[type] || '❓';

const authorProfile = computed(() => userStore.profiles[props.notice.authorUsername]);

const fetchAuthorProfile = () => {
  if (props.notice.authorUsername) {
    userStore.fetchProfile(props.notice.authorUsername);
  }
};

onMounted(fetchAuthorProfile);
watch(() => props.notice.authorUsername, fetchAuthorProfile);
</script>
