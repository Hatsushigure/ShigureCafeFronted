<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
            安全设置
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8 space-y-8">
          <!-- Password Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-50">
            <BaseCard title="密码修改" subtitle="为了您的账户安全，建议定期更换密码。">
              <form @submit.prevent="handleChangePassword" class="space-y-6 max-w-lg">
                <BaseInput
                  v-model="passwordForm.oldPassword"
                  label="当前密码"
                  type="password"
                  required
                />
                <BaseInput
                  v-model="passwordForm.newPassword"
                  label="新密码"
                  type="password"
                  required
                />
                <BaseInput
                  v-model="confirmPassword"
                  label="确认新密码"
                  type="password"
                  required
                />
                <div class="flex items-center justify-end">
                  <BaseButton
                    type="submit"
                    :loading="passwordLoading"
                    label="修改密码"
                    loading-text="修改中..."
                    full-width
                  />
                </div>
              </form>
            </BaseCard>
          </div>

          <!-- Email Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-100">
            <BaseCard title="邮箱管理" subtitle="管理您的绑定邮箱，用于找回密码与安全通知。">
              <div class="flex items-center justify-between">
                <div>
                  <dt class="text-sm font-medium text-gray-500">当前绑定邮箱</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">{{ auth.user?.email }}</dd>
                </div>
                <BaseButton variant="secondary" @click="showEmailModal = true" label="更换邮箱" />
              </div>
            </BaseCard>
          </div>

          <!-- Email 2FA Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-150">
            <BaseCard title="邮箱双重验证" subtitle="开启后，登录时需提供发送至邮箱的验证码。">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div :class="[auth.user?.email2faEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                    {{ auth.user?.email2faEnabled ? '已开启' : '未开启' }}
                  </div>
                  <span class="text-sm text-gray-600">邮箱验证状态</span>
                </div>
                <BaseButton 
                  @click="handleToggleEmail2FA" 
                  :disabled="toggleEmailLoading"
                  :variant="auth.user?.email2faEnabled ? 'danger' : 'secondary'"
                  :label="auth.user?.email2faEnabled ? '关闭邮箱验证' : '开启邮箱验证'"
                  :loading="toggleEmailLoading"
                />
              </div>
            </BaseCard>
          </div>

          <!-- TOTP 2FA Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-200">
            <BaseCard title="身份验证器 (TOTP)" subtitle="开启后，登录时需提供身份验证器应用生成的代码。">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div :class="[auth.user?.totpEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                    {{ auth.user?.totpEnabled ? '已开启' : '未开启' }}
                  </div>
                  <span class="text-sm text-gray-600">验证器状态</span>
                </div>
                <BaseButton 
                  @click="handle2FAAction" 
                  :disabled="toggleLoading"
                  :variant="auth.user?.totpEnabled ? 'danger' : 'secondary'"
                  :label="auth.user?.totpEnabled ? '关闭身份验证器' : '开启身份验证器'"
                  :loading="toggleLoading"
                />
              </div>
            </BaseCard>
          </div>
        </div>
      </main>
    </div>

    <!-- TOTP Setup Modal -->
    <Modal :show="showTotpModal" title="开启双重验证 (TOTP)" @close="showTotpModal = false">
      <div class="space-y-6">
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            1. 使用您的身份验证器 (如 Google Authenticator) 扫描下方二维码：
          </p>
          <div class="flex justify-center p-4 bg-white border border-gray-100 rounded-2xl">
            <qrcode-vue :value="totpSetupData.uri" :size="200" level="H" />
          </div>
          <div class="space-y-2">
            <p class="text-xs text-gray-500 text-center">无法扫描二维码？您可以手动输入密钥：</p>
            <div class="flex items-center justify-center space-x-2">
              <code class="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">{{ totpSetupData.secret }}</code>
            </div>
          </div>
        </div>

        <div class="space-y-4 border-t border-gray-100 pt-6">
          <p class="text-sm text-gray-600">
            2. 请输入身份验证器生成的代码进行确认：
          </p>
          <DigitInput v-model="totpConfirmCode" />
        </div>
      </div>
      <template #footer>
        <BaseButton
          @click="handleConfirmTotp"
          :disabled="totpConfirmCode.length < 6"
          :loading="totpLoading"
          label="验证并开启"
          loading-text="正在验证..."
        />
        <BaseButton variant="outline" @click="showTotpModal = false" label="取消" />
      </template>
    </Modal>

    <!-- Email Update Modal -->
    <Modal :show="showEmailModal" title="修改绑定邮箱" @close="showEmailModal = false">
      <div class="space-y-4">
        <BaseInput
          v-model="newEmailForm.newEmail"
          label="新邮箱地址"
          type="email"
          placeholder="请输入新邮箱"
          show-button
        >
          <template #button>
            <BaseButton
              variant="secondary"
              @click="sendCode"
              :disabled="sending || countdown > 0"
              :loading="sending"
              loading-text="发送中..."
              :label="countdown > 0 ? `${countdown}s` : '获取验证码'"
              class="w-32"
            />
          </template>
        </BaseInput>
        <BaseInput
          v-model="newEmailForm.verificationCode"
          label="验证码"
          placeholder="请输入验证码"
        />
      </div>
      <template #footer>
        <BaseButton
          @click="handleUpdateEmail"
          :loading="emailLoading"
          label="保存修改"
          loading-text="保存中..."
        />
        <BaseButton variant="outline" @click="showEmailModal = false" label="取消" />
      </template>
    </Modal>

    <!-- Email 2FA Activation Modal -->
    <Modal :show="showEmail2FAModal" title="开启邮箱双重验证" @close="showEmail2FAModal = false">
      <div class="space-y-6">
        <p class="text-sm text-gray-600">
          验证码已发送至您的邮箱：<span class="font-semibold text-gray-900">{{ auth.user?.email }}</span>。请输入 6 位动态验证码：
        </p>
        <DigitInput v-model="email2FAConfirmCode" />
        <div class="flex justify-center">
            <button @click="sendEmail2FACode" :disabled="sending2FA || countdown2FA > 0" class="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors">
                {{ countdown2FA > 0 ? `${countdown2FA}s 后可重新获取` : (sending2FA ? '发送中...' : '重新获取验证码') }}
            </button>
        </div>
      </div>
      <template #footer>
        <BaseButton
          @click="confirmToggleEmail2FA"
          :disabled="email2FAConfirmCode.length < 6"
          :loading="toggleEmailLoading"
          label="验证并开启"
          loading-text="正在验证..."
        />
        <BaseButton variant="outline" @click="showEmail2FAModal = false" label="取消" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import QrcodeVue from 'qrcode.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import Modal from '../components/Modal.vue';
import DigitInput from '../components/DigitInput.vue';
import api from '../api';

const auth = useAuthStore();
const toastStore = useToastStore();

// Password Logic
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
});
const confirmPassword = ref('');
const passwordLoading = ref(false);

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== confirmPassword.value) {
    toastStore.error('错误', '两次输入的新密码不一致');
    return;
  }

  if (!auth.user?.username) return;

  passwordLoading.value = true;
  try {
    await api.put(`/users/${auth.user.username}/password`, passwordForm.value);
    toastStore.success('修改成功', '您的密码已成功更新，下次登录请使用新密码。');
    // Clear form
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    confirmPassword.value = '';
  } catch (e: any) {
    toastStore.error('修改失败', e.message || '旧密码错误或系统异常');
  } finally {
    passwordLoading.value = false;
  }
};

// Email Logic
const showEmailModal = ref(false);
const newEmailForm = ref({ newEmail: '', verificationCode: '' });
const emailLoading = ref(false);
const sending = ref(false);
const countdown = ref(0);
const toggleLoading = ref(false);
const toggleEmailLoading = ref(false);

// 2FA TOTP Logic
const showTotpModal = ref(false);
const totpLoading = ref(false);
const totpSetupData = ref({ secret: '', uri: '' });
const totpConfirmCode = ref('');

// Email 2FA Activation Logic
const showEmail2FAModal = ref(false);
const sending2FA = ref(false);
const countdown2FA = ref(0);
const email2FAConfirmCode = ref('');

const sendEmail2FACode = async () => {
    if (!auth.user?.email) return;
    sending2FA.value = true;
    try {
        await api.post('/auth/verification-codes', { email: auth.user.email, type: '2FA' });
        toastStore.success('发送成功', '验证码已发送至您的邮箱。');
        countdown2FA.value = 60;
        const timer = setInterval(() => {
            countdown2FA.value--;
            if (countdown2FA.value <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    } catch (e: any) {
        toastStore.error('发送失败', e.message || '系统异常');
    } finally {
        sending2FA.value = false;
    }
};

const handleToggleEmail2FA = async () => {
  if (auth.user?.email2faEnabled) {
    // Disable is direct
    toggleEmailLoading.value = true;
    try {
      await auth.toggleTwoFactor(false);
      toastStore.success('关闭成功', '邮箱双重验证已关闭。');
    } catch (e: any) {
      toastStore.error('操作失败', e.message || '系统异常');
    } finally {
      toggleEmailLoading.value = false;
    }
  } else {
    // Enable requires verification
    email2FAConfirmCode.value = '';
    showEmail2FAModal.value = true;
    sendEmail2FACode();
  }
};

const confirmToggleEmail2FA = async () => {
  if (email2FAConfirmCode.value.length !== 6) {
    toastStore.error('错误', '请输入 6 位数字验证码');
    return;
  }

  toggleEmailLoading.value = true;
  try {
    await auth.toggleTwoFactor(true, email2FAConfirmCode.value);
    toastStore.success('开启成功', '邮箱双重验证已开启。');
    showEmail2FAModal.value = false;
  } catch (e: any) {
    toastStore.error('验证失败', e.message || '验证码错误，请重试');
  } finally {
    toggleEmailLoading.value = false;
  }
};

const handle2FAAction = async () => {
  if (auth.user?.totpEnabled) {
    // Disable 2FA
    toggleLoading.value = true;
    try {
      await api.delete(`/users/${auth.user.username}/2fa/totp`);
      toastStore.success('关闭成功', '身份验证器已成功关闭。');
      await auth.fetchCurrentUser();
    } catch (e: any) {
      toastStore.error('操作失败', e.message || '系统异常');
    } finally {
      toggleLoading.value = false;
    }
  } else {
    // Start Setup TOTP
    toggleLoading.value = true;
    try {
      const data = await api.get<any>(`/users/${auth.user?.username}/2fa/totp/setup`);
      totpSetupData.value = data;
      showTotpModal.value = true;
      totpConfirmCode.value = '';
    } catch (e: any) {
      toastStore.error('初始化失败', e.message || '无法获取 TOTP 配置');
    } finally {
      toggleLoading.value = false;
    }
  }
};

const handleConfirmTotp = async () => {
  if (totpConfirmCode.value.length !== 6) {
    toastStore.error('错误', '请输入 6 位数字验证码');
    return;
  }

  totpLoading.value = true;
  try {
    await api.post(`/users/${auth.user?.username}/2fa/totp/confirm`, {
      secret: totpSetupData.value.secret,
      code: totpConfirmCode.value
    });
    toastStore.success('开启成功', '身份验证器已成功开启。');
    showTotpModal.value = false;
    await auth.fetchCurrentUser();
  } catch (e: any) {
    toastStore.error('验证失败', e.message || '验证码错误，请重试');
  } finally {
    totpLoading.value = false;
  }
};

const sendCode = async () => {
    if (!newEmailForm.value.newEmail) {
        toastStore.error('发送失败', '请输入新邮箱地址');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailForm.value.newEmail)) {
        toastStore.error('发送失败', '请输入有效的邮箱地址');
        return;
    }

    sending.value = true;
    
    try {
        await api.post('/auth/verification-codes', { email: newEmailForm.value.newEmail, type: 'UPDATE_EMAIL' });
        
        sending.value = false;
        toastStore.success('发送成功', '验证码已发送至您的邮箱，请注意查收。');
        countdown.value = 60;
        const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    } catch (e: any) {
        toastStore.error('发送失败', e.message || '请求失败，请稍后重试');
        sending.value = false;
    } 
};

const handleUpdateEmail = async () => {
    if (!auth.user?.username) return;
    emailLoading.value = true;
    try {
        await api.put(`/users/${auth.user.username}/email`, newEmailForm.value);
        toastStore.success('修改成功', '您的邮箱已成功更新。');
        showEmailModal.value = false;
        await auth.fetchCurrentUser(); // Refresh user data
    } catch (e: any) {
        toastStore.error('修改失败', e.message || '请检查您的验证码是否正确');
    } finally {
        emailLoading.value = false;
    }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});
</script>
