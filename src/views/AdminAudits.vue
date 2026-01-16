<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <AdminPageHeader :title="$t('admin-audit.title')" v-model="searchQuery" :loading="adminAuditStore.loading"
        :search-placeholder="$t('admin-audit.search-placeholder')" @refresh="fetchAudits(0, true)" />

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8">
          <div class="px-4 sm:px-0">
            <BaseCard body-class="p-0 overflow-hidden" class="animate-slide-up animate-delay-100">
              <transition name="fade-slide" mode="out-in">
                <div
                  :key="filteredAudits.length > 0 ? `audits-${adminAuditStore.pagination.currentPage}-${searchQuery}-${adminAuditStore.fetchCount}` : (adminAuditStore.loading ? 'loading' : 'empty')"
                  class="min-h-[300px] flex flex-col">
                  <!-- Loading State (only if no cache) -->
                  <div v-if="adminAuditStore.loading && adminAuditStore.audits.length === 0"
                    class="flex-1 flex justify-center items-center text-gray-400">
                    <Loader2 class="h-8 w-8 animate-spin" />
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="filteredAudits.length === 0"
                    class="flex-1 text-center text-gray-500 flex flex-col items-center justify-center">
                    <ClipboardList class="h-12 w-12 text-gray-300 mb-3" />
                    <p>{{ searchQuery ? $t('admin-audit.no-results') : $t('admin-audit.no-audits') }}</p>
                  </div>

                  <!-- Audits Table -->
                  <div v-else class="relative flex-1 flex flex-col">
                    <!-- Loading overlay for refresh -->
                    <div v-if="adminAuditStore.loading"
                      class="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-300">
                      <Loader2 class="h-8 w-8 animate-spin text-indigo-500" />
                    </div>

                    <CustomScrollContainer class="flex-1">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50/50">
                          <tr>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                $t('admin-audit.user') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                $t('admin-audit.email') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                $t('admin-audit.audit-code') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                $t('admin-audit.status') }}</th>
                            <th scope="col"
                              class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{
                                $t('admin-audit.actions') }}</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                          <tr v-for="audit in filteredAudits" :key="audit.auditCode"
                            class="hover:bg-gray-50/80 transition-colors duration-150">
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <UserAvatar :name="audit.nickname || audit.username" :src="audit.avatarUrl" size="sm" class="mr-3" />
                                <div>
                                  <div class="text-sm font-medium text-gray-900"
                                    :title="audit.nickname || audit.username">{{ truncateText(audit.nickname ||
                                      audit.username) }}</div>
                                  <div class="text-xs text-gray-400" :title="'@' + audit.username">@{{
                                    truncateText(audit.username) }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :title="audit.email">
                              {{ truncateText(audit.email) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span
                                class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono"
                                :title="audit.auditCode">
                                {{ audit.auditCode }}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <StatusBadge :status="audit.status" :is-expired="audit.isExpired" />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <button v-if="!audit.isExpired && audit.status !== 'ACTIVE'"
                                @click="confirmApprove(audit)"
                                class="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-1.5 rounded-md transition-colors"
                                :title="$t('admin-audit.approve')">
                                <CheckCircle class="h-4 w-4" />
                              </button>
                              <button v-if="!audit.isExpired && audit.status !== 'ACTIVE' && audit.status !== 'BANNED'"
                                @click="confirmBan(audit)"
                                class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                                :title="$t('admin-audit.ban')">
                                <Ban class="h-4 w-4" />
                              </button>
                              <span v-else class="text-gray-400 text-xs italic">
                                {{ $t('admin-audit.no-action-needed') }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </CustomScrollContainer>
                  </div>
                </div>
              </Transition>

              <!-- Pagination -->
              <Pagination v-if="filteredAudits.length > 0"
                :current-page="searchQuery ? 0 : adminAuditStore.pagination.currentPage"
                :total-pages="searchQuery ? Math.ceil(filteredAudits.length / adminAuditStore.pagination.pageSize) : adminAuditStore.pagination.totalPages"
                :total-elements="searchQuery ? filteredAudits.length : adminAuditStore.pagination.totalElements"
                :page-size="adminAuditStore.pagination.pageSize" @page-change="handlePageChange"
                class="bg-gray-50/50 border-t border-gray-100" />
            </BaseCard>
          </div>
        </div>
      </main>
    </div>

    <!-- Approve Confirmation Modal -->
    <Modal :show="showApproveModal" :title="$t('admin-audit.approve-title')" @close="showApproveModal = false">
      <div class="sm:flex sm:items-center">
        <div
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
          <CheckCircle class="h-6 w-6 text-green-600" />
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <div class="mt-2">
            <i18n-t keypath="admin-audit.approve-confirm" tag="p" class="text-sm text-gray-500">
              <template #name>
                <span class="font-bold text-gray-900">{{ selectedAudit?.nickname || selectedAudit?.username }}</span>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="handleApprove" :label="$t('admin-audit.confirm-approve')" />
        <BaseButton variant="outline" @click="showApproveModal = false" :label="$t('common.cancel')" />
      </template>
    </Modal>

    <!-- Ban Confirmation Modal -->
    <Modal :show="showBanModal" :title="$t('admin-audit.ban-title')" @close="showBanModal = false">
      <div class="sm:flex sm:items-center">
        <div
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <Ban class="h-6 w-6 text-red-600" />
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <div class="mt-2">
            <i18n-t keypath="admin-audit.ban-confirm" tag="p" class="text-sm text-gray-500">
              <template #name>
                <span class="font-bold text-gray-900">{{ selectedAudit?.nickname || selectedAudit?.username }}</span>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="danger" @click="handleBan" :label="$t('admin-audit.confirm-ban')" />
        <BaseButton variant="outline" @click="showBanModal = false" :label="$t('common.cancel')" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../api';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseButton from '../components/BaseButton.vue';
import Modal from '../components/Modal.vue';
import Pagination from '../components/Pagination.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import UserAvatar from '../components/UserAvatar.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { useToastStore } from '../stores/toast';
import { useAdminAuditStore } from '../stores/adminAudit';
import CustomScrollContainer from '../components/CustomScrollContainer.vue';
import { Loader2, ClipboardList, CheckCircle, Ban } from 'lucide-vue-next';
import { truncateText } from '../utils/formatters';

interface Audit {
  username: string;
  nickname: string;
  email: string;
  status: string;
  avatarUrl?: string;
  auditCode: string;
  isExpired: boolean;
}

const { t } = useI18n();
const adminAuditStore = useAdminAuditStore();
const searchQuery = ref('');
const toast = useToastStore();

const showApproveModal = ref(false);
const showBanModal = ref(false);
const selectedAudit = ref<Audit | null>(null);

const filteredAudits = computed(() => {
  const audits = adminAuditStore.audits;
  if (!searchQuery.value) return audits;
  const q = searchQuery.value.toLowerCase();
  return audits.filter(audit =>
    audit.auditCode.toLowerCase().includes(q) ||
    audit.username.toLowerCase().includes(q) ||
    audit.nickname?.toLowerCase().includes(q) ||
    audit.email.toLowerCase().includes(q)
  );
});


const fetchAudits = async (page?: number, force: boolean = false) => {
  const targetPage = typeof page === 'number' ? page : adminAuditStore.pagination.currentPage;
  try {
    await adminAuditStore.fetchAudits(targetPage, 10, force);
  } catch (error: any) {
    toast.error(t('admin-audit.messages.fetch-failed'), error.message);
  }
};

const handlePageChange = (page: number) => {
  const isPageChange = page !== adminAuditStore.pagination.currentPage;
  if (isPageChange) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  fetchAudits(page);
};

const confirmApprove = (audit: Audit) => {
  selectedAudit.value = audit;
  showApproveModal.value = true;
};

const handleApprove = async () => {
  if (!selectedAudit.value) return;
  try {
    await api.patch(`/registrations/${selectedAudit.value.auditCode}`);
    toast.success(t('admin-audit.messages.approve-success'));
    showApproveModal.value = false;
    await fetchAudits();
  } catch (error: any) {
    toast.error(t('admin-audit.messages.action-error'), error.message);
  }
};

const confirmBan = (audit: Audit) => {
  selectedAudit.value = audit;
  showBanModal.value = true;
};

const handleBan = async () => {
  if (!selectedAudit.value) return;
  try {
    await api.delete(`/registrations/${selectedAudit.value.auditCode}`);
    toast.success(t('admin-audit.messages.ban-success'));
    showBanModal.value = false;
    await fetchAudits();
  } catch (error: any) {
    toast.error(t('admin-audit.messages.action-error'), error.message);
  }
};

onMounted(() => {
  fetchAudits();
});
</script>
