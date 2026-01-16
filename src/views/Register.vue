<template>
  <AuthLayout :title="registrationSuccess ? $t('auth.register.success-title') : $t('auth.register.title')"
    :subtitle="registrationSuccess ? '' : $t('auth.register.subtitle')">
    <!-- Success View -->
    <div v-if="registrationSuccess" class="text-center space-y-6">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 animate-float">
        <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="text-left bg-white/60 p-6 rounded-xl border border-blue-100 shadow-sm">
        <p class="text-sm font-medium text-gray-700 mb-3">{{ $t('auth.register.audit-code-label') }}</p>
        <div
          class="flex items-center justify-between bg-blue-50/50 p-4 rounded-lg border border-blue-200 group hover:border-blue-300 transition-colors cursor-text">
          <code
            class="text-xl font-mono font-bold text-blue-700 select-all tracking-wider break-all mr-2">{{ auditCode }}</code>
          <button @click="copyAuditCode"
            class="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-500 hover:text-blue-700 active:scale-95 flex-shrink-0"
            :title="$t('auth.register.copy-audit-code')">
            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-3 leading-relaxed">
          {{ $t('auth.register.audit-code-hint') }}
        </p>
      </div>
      <BaseButton :label="$t('auth.register.back-to-login')" @click="router.push('/login')" full-width />
    </div>

    <!-- Registration Form -->
    <div v-else>
      <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <BaseInput id="username" v-model="form.username" :label="$t('auth.register.username-label')"
            :placeholder="$t('auth.register.username-placeholder')" required />

          <BaseInput id="nickname" v-model="form.nickname" :label="$t('auth.register.nickname-label')"
            :placeholder="$t('auth.register.nickname-placeholder')" />

          <BaseInput id="email" v-model.trim="form.email" :label="$t('auth.register.email-label')" type="email"
            :placeholder="$t('auth.register.email-placeholder')" required show-button>
            <template #button>
              <VerificationCodeButton :email="form.email" type="REGISTER" class="w-32" />
            </template>
          </BaseInput>

          <BaseInput id="verificationCode" v-model="form.verificationCode"
            :label="$t('auth.register.verification-code-label')"
            :placeholder="$t('auth.register.verification-code-placeholder')" autocomplete="one-time-code" required />

          <BaseInput id="password" v-model="form.password" :label="$t('auth.register.password-label')" type="password"
            :placeholder="$t('auth.register.password-placeholder')" required />

          <BaseInput id="confirmPassword" v-model="form.confirmPassword"
            :label="$t('auth.register.confirm-password-label')" type="password"
            :placeholder="$t('auth.register.confirm-password-placeholder')" required />
        </div>

        <BaseButton type="submit" :loading="loading" :loading-text="$t('auth.register.submitting')"
          :label="$t('auth.register.register-button')" full-width class="mt-6" />
      </form>
      <div class="text-center text-sm mt-6">
        <router-link to="/login" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
          {{ $t('auth.register.already-have-account') }}
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../api';
import { useToastStore } from '../stores/toast';
import { copyToClipboard } from '../utils/clipboard';
import AuthLayout from '../components/AuthLayout.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import VerificationCodeButton from '../components/VerificationCodeButton.vue';

const router = useRouter();
const toastStore = useToastStore();
const { t } = useI18n();
const form = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: ''
});

const loading = ref(false);
const registrationSuccess = ref(false);
const auditCode = ref('');
const copied = ref(false);

const copyAuditCode = async () => {
  const success = await copyToClipboard(auditCode.value);
  if (success) {
    copied.value = true;
    toastStore.success(t('auth.register.messages.copy-success'), t('auth.register.messages.copy-success-detail'));
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } else {
    toastStore.error(t('auth.register.messages.copy-failed'), t('auth.register.messages.copy-failed-detail'));
  }
};

const handleRegister = async () => {
  const usernameRegex = /^[a-zA-Z0-9-_]{3,50}$/;
  if (!usernameRegex.test(form.username)) {
    toastStore.error(t('auth.register.messages.register-failed'), t('auth.register.messages.invalid-username'));
    return;
  }

  if (form.password !== form.confirmPassword) {
    toastStore.error(t('auth.register.messages.register-failed'), t('auth.register.messages.password-mismatch'));
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...registerData } = form;
    const response: any = await api.post('/registrations', registerData);
    auditCode.value = response.auditCode;
    registrationSuccess.value = true;
    toastStore.success(t('auth.register.messages.submit-success'), t('auth.register.messages.save-audit-code'));
  } catch (e: any) {
    toastStore.error(t('auth.register.messages.register-failed'), e.message || t('auth.register.messages.check-info'));
  } finally {
    loading.value = false;
  }
};
</script>