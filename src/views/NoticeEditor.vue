<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button @click="$router.back()" class="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
              <ArrowLeft class="h-6 w-6" />
            </button>
            <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
              {{ isEdit ? t('notices.editor.edit-title') : t('notices.editor.create-title') }}
            </h1>
          </div>
          <div class="flex space-x-3">
            <BaseButton @click="saveNotice" :loading="saving" class="animate-slide-up animate-delay-50">
              <Save class="h-4 w-4 mr-2" />
              {{ t('notices.editor.save') }}
            </BaseButton>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-100">
            <div v-if="loading" class="bg-white shadow rounded-2xl p-12 flex justify-center items-center text-gray-400">
              <Loader2 class="h-8 w-8 animate-spin" />
            </div>
            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Editor Side -->
              <div class="space-y-6">
                <BaseCard body-class="p-6">
                  <div class="space-y-4">
                    <BaseInput v-model="form.title" :label="t('notices.editor.title-label')"
                      :placeholder="t('notices.editor.title-placeholder')" />
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('notices.editor.content-label')
                        }}</label>
                      <textarea v-model="form.content" rows="15"
                        class="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 font-mono focus:outline-none focus:border-indigo-500 sm:text-sm"
                        :placeholder="t('notices.editor.content-placeholder')"></textarea>
                    </div>
                    <div
                      class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-gray-100/50">
                      <div class="flex items-center space-x-3">
                        <div class="p-2 bg-orange-100 rounded-lg">
                          <ArrowUpToLine class="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <span class="block text-sm font-bold text-gray-900">{{ t('notices.editor.pinned-label')
                            }}</span>
                        </div>
                      </div>
                      <button @click="form.pinned = !form.pinned" type="button"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                        :class="form.pinned ? 'bg-orange-500' : 'bg-gray-200'">
                        <span
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          :class="form.pinned ? 'translate-x-5' : 'translate-x-0'"></span>
                      </button>
                    </div>

                    <div
                      class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-gray-100/50">
                      <div class="flex items-center space-x-3">
                        <div class="p-2 bg-indigo-100 rounded-lg">
                          <Mail class="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <span class="block text-sm font-bold text-gray-900">{{ t('notices.editor.send-email-label')
                            }}</span>
                          <span class="block text-xs text-gray-500">{{ t('notices.editor.send-email-hint') }}</span>
                        </div>
                      </div>
                      <button @click="form.sendEmail = !form.sendEmail" type="button"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                        :class="form.sendEmail ? 'bg-indigo-500' : 'bg-gray-200'">
                        <span
                          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          :class="form.sendEmail ? 'translate-x-5' : 'translate-x-0'"></span>
                      </button>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <!-- Preview Side -->
              <div class="space-y-6">
                <div class="flex items-center justify-between mb-2">
                  <h2 class="text-lg font-bold text-gray-900">{{ t('notices.editor.preview') }}</h2>
                </div>
                <BaseCard body-class="p-8 prose prose-indigo max-w-none min-h-[400px] break-words">
                  <h1 v-if="form.title">{{ form.title }}</h1>
                  <div v-if="!form.content" class="text-gray-400 italic text-center py-20">
                    {{ t('notices.editor.preview-placeholder') }}
                  </div>
                  <div v-else v-html="renderMarkdown(form.content)"></div>
                </BaseCard>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import BaseInput from '../components/BaseInput.vue';
import { useNoticeStore } from '../stores/notice';
import { useToastStore } from '../stores/toast';
import { ArrowLeft, Save, Loader2, ArrowUpToLine, Mail, Info } from 'lucide-vue-next';
import { renderMarkdown } from '../utils/markdown';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const noticeStore = useNoticeStore();

const id = computed(() => route.params.id as string);
const isEdit = computed(() => !!id.value && id.value !== 'new');

const loading = ref(false);
const saving = ref(false);

const form = ref({
  title: '',
  content: '',
  pinned: false,
  sendEmail: false
});

const fetchNotice = async () => {
  if (!isEdit.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const data = await noticeStore.fetchNoticeById(Number(id.value));
    form.value.title = data.title;
    form.value.content = data.content;
    form.value.pinned = data.pinned;
  } catch (error: any) {
    toast.error(t('notices.editor.messages.fetch-failed'), error.message);
    router.push('/notices');
  } finally {
    loading.value = false;
  }
};

const saveNotice = async () => {
  if (!form.value.title || !form.value.content) {
    toast.error(t('notices.editor.messages.validation-error'));
    return;
  }

  saving.value = true;
  try {
    const payload = {
      title: form.value.title,
      content: form.value.content,
      pinned: form.value.pinned
    };

    if (isEdit.value) {
      await noticeStore.updateNotice(Number(id.value), payload);
      toast.success(t('notices.editor.messages.update-success'));
    } else {
      await noticeStore.createNotice(payload);
      toast.success(t('notices.editor.messages.create-success'));
    }

    if (form.value.sendEmail) {
      try {
        await noticeStore.sendEmailNotification(form.value.title, form.value.content);
        toast.success(t('notices.editor.messages.email-queued'));
      } catch (error) {
        // Error is already toasted by store
      }
    }

    // Redirect logic: use redirect query param if available, otherwise default to /notices
    const redirectPath = route.query.redirect as string;
    if (redirectPath) {
      router.replace(redirectPath);
    } else {
      router.push('/notices');
    }
  } catch (error: any) {
    toast.error(t('notices.editor.messages.save-failed'), error.message);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchNotice();
});
</script>
