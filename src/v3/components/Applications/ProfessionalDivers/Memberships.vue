<template>
  <div class="tw-w-full tw-space-y-6">
    <!-- Header -->
    <div class="tw-flex tw-items-center tw-justify-between">
      <h3 class="tw-text-foreground tw-font-bold tw-text-2xl tw-flex tw-items-center tw-gap-2">
        {{ t('International Memberships') }}
        <span class="tw-text-sm tw-font-medium tw-bg-gray-100 tw-text-gray-700 tw-rounded-full tw-px-2 tw-py-0.5">
          {{ futureCount }}
        </span>
      </h3>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="tw-grid md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
      <Skeleton height="15rem" class="tw-rounded-2xl" v-for="n in 6" :key="n" />
    </div>

    <!-- List -->
    <div v-else class="tw-grid md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
      <!-- Membership Cards -->
      <Card v-for="m in memberships" :key="m.id" class="tw-rounded-2xl tw-shadow-sm hover:tw-shadow-md tw-transition tw-h-full">
        <!-- Title only (equal weight) -->
        <template #title>
          <div class="tw-flex tw-items-center tw-justify-between">
            <span class="tw-font-semibold">{{ m?.title || '-' }}</span>
          </div>
        </template>

        <!-- Equal-weight fields -->
        <template #content>
          <div class="tw-grid tw-gap-y-3 tw-pt-1">
            <div class="tw-flex tw-items-start tw-gap-3">
              <i class="pi pi-users tw-mt-0.5"></i>
              <div>
                <span class="tw-text-sm tw-text-gray-500  tw-me-2">{{ t('Diving Organization') }}:</span>
                <span class="tw-ml-1 tw-font-medium">{{ m?.organization || '-' }}</span>
              </div>
            </div>

            <div class="tw-flex tw-items-start tw-gap-3">
              <i class="pi pi-hashtag tw-mt-0.5"></i>
              <div>
                <span class="tw-text-sm tw-text-gray-500 tw-me-2 ">{{ t('Membership Number') }}:</span>
                <span class="tw-ml-1 tw-font-medium">{{ m?.membership_number || '-' }}</span>
              </div>
            </div>

            <div class="tw-flex tw-items-start tw-gap-3" v-if="m?.diving_type">
              <i class="pi pi-compass tw-mt-0.5"></i>
              <div>
                <span class="tw-text-sm tw-text-gray-500 tw-me-2 ">{{ t('Diving Type') }}:</span>
                <span class="tw-ml-1 tw-font-medium">{{ m.diving_type }}</span>
              </div>
            </div>

            <div v-if="m?.membership_link" class="tw-flex tw-items-center tw-gap-2 tw-pt-1">
              <a :href="m.membership_link" target="_blank" class="p-button p-button-text p-button-sm tw-text-sm tw-inline-flex tw-items-center tw-gap-2" v-tooltip.bottom="t('Open membership link')" :title="t('Open membership link')">
                <i class="pi pi-external-link"></i>
                <span>{{ t('Membership Copy') }}</span>
              </a>
            </div>
          </div>
        </template>

        <!-- Footer: status + strict actions -->
        <template #footer>
          <div class="tw-flex tw-items-center tw-justify-between tw-pt-2">
            <div class="tw-flex tw-items-center tw-gap-2">
              <Tag :value="displayStatus(m).label" :severity="displayStatus(m).severity" class="tw-capitalize" />
            </div>
            <div class="tw-flex tw-items-center tw-gap-2">
              <!-- Delete only when new_status === 'Verified' -->
              <Button
                v-if="canShowRemove(m)"
                size="small"
                severity="danger"
                outlined
                icon="pi pi-trash"
                :label="t('Remove')"
                :loading="removeLoading && itemToDelete?.id === m.id"
                @click="askRemove(m)"
              />
              <!-- Restore only when new_status === 'Canceled' -->
              <Button
                v-if="canShowRestore(m)"
                size="small"
                severity="success"
                outlined
                icon="pi pi-undo"
                :label="t('Restore')"
                :loading="restoreLoading && itemToRestore?.id === m.id"
                @click="restoreDelete(m.id)"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Add Membership Card (concise title + emphasized requirement) -->
      <Card v-if="canModifyApplication" class="tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-gray-300 hover:tw-shadow-md tw-transition tw-cursor-pointer" @click="$router.push({ name: 'add-professional-diver-international-qualification', params: { id: $route.params.id } })">
        <template #content>
          <div class="tw-text-center tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full">
            <div class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 tw-rounded-full tw-mb-4">
              <i class="pi pi-plus tw-text-2xl"></i>
            </div>
            <h4 class="tw-font-semibold tw-text-lg">{{ t('Add International Membership') }}</h4>

            <div v-if="futureCount === 0" class="tw-mt-4 tw-w-full tw-flex  tw-flex-col  tw-items-center tw-gap-3  tw-text-red-700  tw-rounded-xl tw-px-3 tw-py-3">
              <i class="pi pi-exclamation-triangle tw-text-2xl"></i>
              <span class="tw-font-bold tw-text-base md:tw-text-lg">{{ t('At least one international membership is required') }}</span>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Confirm + Toast -->
    <ConfirmDialog group="memberships" appendTo="body" :closable="false" :draggable="false" :reject-class="'tw-bg-white tw-text-gray-700 tw-border tw-border-gray-300'" />
 
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import ConfirmDialog from 'primevue/confirmdialog'; 

import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import { useApplicationStore } from '@/v3/composables/useApplicationStore';
import { useMemberships } from '@/v3/composables/application/pro-divers/useMemberships.js';

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const { application, canModifyApplication } = useApplicationStore();
const { memberships, loading, loadMemberships, deleteMembership, restoreMembership } = useMemberships(application.value?.id);

const removeLoading = ref(false);
const restoreLoading = ref(false);
const itemToDelete = ref(null);
const itemToRestore = ref(null);

const lc = (s) => (s || '').toLowerCase();

// What counts as existing after approval (for futureCount)
function countsAsExisting(m) {
  const ns = lc(m?.new_status);
  if (ns) return ['verified', 'approved', 'active'].includes(ns);
  return ['verified', 'approved', 'active'].includes(lc(m?.status));
}
const futureCount = computed(() => (memberships?.value || []).filter(countsAsExisting).length);

// Strict button rules
function canShowRemove(m) { return canModifyApplication.value && lc(m?.new_status) === 'verified'; }
function canShowRestore(m) { return canModifyApplication.value && lc(m?.new_status) === 'canceled'; }

// Footer status mapping (UPDATED: show Canceled when current OR new status is Canceled)
function displayStatus(m) {
  const ns = lc(m?.new_status);
  const cs = lc(m?.status);
  if (ns === 'canceled' || cs === 'canceled') return { label: t('Canceled'), severity: 'danger' };
  if (cs === 'unverified') return { label: t('Unverified'), severity: 'warn' };
  if ((cs === 'verified') && (!ns || ns === 'verified')) return { label: t('Verified'), severity: 'success' };
  // Fallbacks
  if (ns) return { label: t(capitalize(ns)), severity: statusSeverity(ns) };
  return { label: t(capitalize(cs || 'Unknown')), severity: statusSeverity(cs) };
}

function statusSeverity(status) {
  const s = lc(status);
  if (s === 'verified' || s === 'approved' || s === 'active') return 'success';
  if (s === 'unverified' || s === 'pending' || s === 'under review') return 'warn';
  if (s === 'canceled' || s === 'rejected' || s === 'deleted') return 'danger';
  return 'info';
}

function capitalize(x) { return x ? x.charAt(0).toUpperCase() + x.slice(1) : x; }

function askRemove(m) {
  confirm.require({
    group: 'memberships',
    message: `${m?.title ? `"${m.title}" – ` : ''}${t('Remove this membership?')}`,
    header: t('Confirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('Remove'),
    rejectLabel: t('Cancel'),
    acceptClass: 'p-button-danger',
    accept: async () => { try { await confirmDelete(m.id, m); } finally { confirm.close(); } },
    reject: () => confirm.close()
  });
}
 
async function confirmDelete(id, m) {
  try {
    itemToDelete.value = m;
    removeLoading.value = true;
    await deleteMembership(id);
    toast.add({ severity: 'success', summary: t('Removed'), detail: t('Membership removed successfully.'), life: 2500 });
    await loadMemberships();
  } catch (err) {
    const msg = err?.response?.data?.message || t('Failed to remove membership.');
    toast.add({ severity: 'error', summary: t('Error'), detail: msg, life: 4000 });
  } finally {
    removeLoading.value = false;
    itemToDelete.value = null;
  }
}

async function restoreDelete(id, m) {
  try {
    itemToRestore.value = m;
    restoreLoading.value = true; 
    
    await restoreMembership(id);
   
    toast.add({ severity: 'success', summary: t('Restored'), detail: t('Membership restored successfully.'), life: 2500 });
    await loadMemberships();
  } catch (err) {
    const msg = err?.response?.data?.message || t('Failed to restore membership.');
    toast.add({ severity: 'error', summary: t('Error'), detail: msg, life: 4000 });
  } finally {
    restoreLoading.value = false;
    itemToRestore.value = null;
  }
}

onMounted(() => {
  if (application.value?.id) {
    loadMemberships();
  }
});
</script>

 