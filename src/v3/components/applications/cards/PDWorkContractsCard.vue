<!-- FILE: src/v3/components/applications/cards/PDWorkContractsCard.vue -->
<!-- VERSION: 1.0.0 -->
<!-- LAST UPDATED: 2026-02-02 -->
<!-- NEW COMPONENT - Following PDMembershipsCard pattern -->

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';

import { useLoading } from '@/v3/composables/useLoading.js';
import { usePDApplicationsApi } from '@/v3/composables/application/usePDApplicationsApi.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import { getMaxContracts, getMinContracts } from '@/v3/config/professional-divers-config.js';

const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;

// ────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────

const { t, locale } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const { capture } = useErrorHandler();
const { error: notifyError } = useNotification();
const { isLoadingKey } = useLoading();
const store = useApplicationStore();
const api = usePDApplicationsApi();

// ────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (Must be defined before computed properties)
// ────────────────────────────────────────────────────────────────────

/**
 * Helper function for case-insensitive string comparison
 */
const lc = (s) => (s || '').toLowerCase();

/**
 * Capitalizes first letter of a string.
 *
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

// ────────────────────────────────────────────────────────────────────
// DATA - Read from store
// ────────────────────────────────────────────────────────────────────

const contracts = computed(() => store.payload?.pd_contracts?.value || []);
const canEdit = computed(() => store.canModifyApplication.value);
const showEmptyState = computed(() => {
    return !canEdit.value && !isLoadingKey('pd_contracts') && contracts.value.length === 0;
});
const visibleComponent = computed(() => {
    return canEdit.value || isLoadingKey('pd_contracts') || contracts.value.length > 0 || showEmptyState.value;
});
const showMainHeader = computed(() => {
    return !showEmptyState.value;
});

// Configuration (from dedicated config file)
const MAX_CONTRACTS = getMaxContracts();
const MIN_CONTRACTS = getMinContracts();

// ────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────

const isBelowMinimum = computed(() => {
    return contracts.value.length < MIN_CONTRACTS;
});

// Individual contract status helpers for inline tags
function membershipStatusClass(contract) {
    const status = displayStatus(contract).severity;
    if (status === 'warn') return 'tw-bg-amber-50 tw-text-amber-700';
    if (status === 'success') return 'tw-bg-green-50 tw-text-green-700';
    if (status === 'danger') return 'tw-bg-red-50 tw-text-red-700';
    if (status === 'info') return 'tw-bg-blue-50 tw-text-blue-700';
    return '';
}

function membershipStatusIcon(contract) {
    const status = displayStatus(contract).severity;
    if (status === 'warn') return 'pi pi-clock';
    if (status === 'success') return 'pi pi-check-circle';
    if (status === 'danger') return 'pi pi-times-circle';
    if (status === 'info') return 'pi pi-info-circle';
    return '';
}

// ────────────────────────────────────────────────────────────────────
// BUTTON VISIBILITY RULES
// ────────────────────────────────────────────────────────────────────

/**
 * Determines if delete button should be shown for a contract.
 * Only shows when canEdit is true AND contract is proposed active (new_status === 'approved').
 * "active" is the canonical UI term for the backend "approved" status value.
 *
 * @param {Object} contract - The contract object
 * @returns {boolean} True if delete button should be shown
 */
function canShowDelete(contract) {
    return canEdit.value && lc(contract?.new_status) === 'approved';
}

/**
 * Determines if restore button should be shown for a contract.
 * Only shows when canEdit is true AND contract was active (status === 'approved')
 * and is now proposed for cancellation (new_status === 'inactive').
 *
 * @param {Object} contract - The contract object
 * @returns {boolean} True if restore button should be shown
 */
function canShowRestore(contract) {
    const newStatus = lc(contract?.new_status);
    const currentStatus = lc(contract?.status);
    return canEdit.value && newStatus === 'inactive' && currentStatus === 'approved';
}

// Add button: canEdit AND activeCount < MAX_CONTRACTS
// activeCount counts contracts proposed as active (new_status === 'approved')
const canShowAdd = computed(() => {
    const activeCount = contracts.value.filter(c => lc(c?.new_status) === 'approved').length;
    return canEdit.value && activeCount < MAX_CONTRACTS;
});

// ────────────────────────────────────────────────────────────────────
// STATUS DISPLAY HELPERS
// ────────────────────────────────────────────────────────────────────

/**
 * Returns display status for a contract with label and severity.
 * Priority: Pending Cancel > Inactive > Unverified > Active
 * "active" is the canonical UI term for the backend "approved" status value.
 *
 * @param {Object} contract - The contract object
 * @returns {{label: string, severity: string}} Status object with label and severity
 */
function displayStatus(contract) {
    const newStatus = lc(contract?.new_status);
    const currentStatus = lc(contract?.status);
    
    // Pending Cancel: currently active, proposed for cancellation
    if (newStatus === 'inactive' && currentStatus === 'approved') {
        return { label: t('Cancellation will be completed after application approval'), severity: 'warn' };
    }
    
    // Inactive
    if (currentStatus === 'inactive') {
        return { label: t('Inactive'), severity: 'danger' };
    }
    
    // Unverified: newly added, proposed active but awaiting admin review
    if (newStatus === 'approved' && currentStatus === 'unverified') {
        return { label: t('Unverified'), severity: 'warn' };
    }
    
    // Active: proposed active and already active
    if (newStatus === 'approved' && currentStatus === 'approved') {
        return { label: t('Active'), severity: 'success' };
    }
    
    // Fallback: use new_status if available
    if (newStatus) {
        return { label: t(capitalize(newStatus)), severity: getStatusSeverity(newStatus) };
    }
    
    // Final fallback: use current status
    return { label: t(capitalize(currentStatus || 'Unknown')), severity: getStatusSeverity(currentStatus) };
}

/**
 * Maps a status string to a severity level for UI styling.
 *
 * @param {string} status - The status string
 * @returns {string} The severity level: 'success', 'warn', 'danger', or 'info'
 */
function getStatusSeverity(status) {
    const s = lc(status);
    if (['verified', 'approved', 'active'].includes(s)) {
        return 'success';
    }
    if (['unverified', 'pending', 'under review'].includes(s)) {
        return 'warn';
    }
    if (['canceled', 'rejected', 'deleted', 'inactive'].includes(s)) {
        return 'danger';
    }
    return 'info';
}

// ────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
    const errors = [];
    // Count contracts proposed as active (new_status === 'approved').
    // A currently unverified contract proposed as active satisfies this; admin review promotes it.
    const activeCount = contracts.value.filter(c => lc(c?.new_status) === 'approved').length;

    if (activeCount < MIN_CONTRACTS) {
        errors.push(
            t('At least one work contract is required')
        );
    }

    return errors;
});

// Watch validation and sync with store
watch(
    validationErrors,
    (errors) => {
        if (errors.length > 0) {
            store.setStepError('pd_contracts', errors);
        } else {
            store.deleteStepError('pd_contracts');
        }
    },
    { immediate: true }
);

// ────────────────────────────────────────────────────────────────────
// ACTION HANDLERS
// ────────────────────────────────────────────────────────────────────

/**
 * Shows a confirmation dialog before deleting a contract.
 *
 * @param {Object} contract - The contract object to delete
 */
function showDeleteConfirmation(contract) {
    confirm.require({
        group: 'contracts',
        message: `${contract?.center_name ? `"${contract.center_name}" – ` : ''}${t('Remove this contract?')}`,
        header: t('Confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('Remove'),
        rejectLabel: t('Cancel'),
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await handleDeleteContract(contract.id);
            } finally {
                confirm.close();
            }
        },
        reject: () => confirm.close()
    });
}

/**
 * Handles delete contract operation.
 *
 * @param {number} contractId - The ID of contract to delete
 */
async function handleDeleteContract(contractId) {
    try {
        await api.deleteContract(contractId);
    } catch (err) {
        capture(err, {
            fallback: 'Failed to remove work contract',
            context: 'PDWorkContractsCard.handleDeleteContract',
            meta: {
                appId: store.application.value.id,
                contractId
            }
        });
        notifyError(t('Failed to remove work contract. Please try again.'));
    }
}

/**
 * Handles restore contract operation.
 *
 * @param {number} contractId - The ID of contract to restore
 */
async function handleRestoreContract(contractId) {
    try {
        await api.restoreContract(contractId);
    } catch (err) {
        capture(err, {
            fallback: 'Failed to restore work contract',
            context: 'PDWorkContractsCard.handleRestoreContract',
            meta: {
                appId: store.application.value.id,
                contractId
            }
        });
        notifyError(t('Failed to restore work contract. Please try again.'));
    }
}

/**
 * Navigates to add contract page.
 */
function navigateToAddContract() {
    router.push({
        name: 'pd-contract-add',
        params: {
            appId: store.application.value.id,
            locale: locale.value
        }
    });
}

store.registerStepPrimaryAction('pd_contracts', navigateToAddContract);

// ────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
    store.unregisterStepPrimaryAction('pd_contracts');
    store.deleteStepError('pd_contracts');
});
</script>

<template>
    <div v-if="visibleComponent" class="tw-space-y-8" data-step-id="pd_contracts">
        <!-- Header -->
        <div v-if="showMainHeader" class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-2">
                <i class="pi pi-briefcase tw-text-primary" aria-hidden="true"></i>
                <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                    {{ t('Work Contracts') }}
                </span>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingKey('pd_contracts')" class="tw-mb-2">
            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-flex tw-justify-center tw-py-8">
                    <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
                </div>
            </div>
        </div>
        <!-- Empty State -->
        <div v-else-if="showEmptyState">
            <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <i class="pi pi-briefcase tw-text-primary" aria-hidden="true"></i>
                <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                    {{ t('Work Contracts') }}
                </span>
            </div>
            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-text-center tw-py-8">
                    <i class="pi pi-briefcase tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
                    <p class="tw-text-slate-500">{{ t('No work contracts registered') }}</p>
                </div>
            </div>
        </div>

        <template v-else>
            <!-- Minimum Warning -->
            <div
                v-if="canEdit && !isLoadingKey('pd_contracts') && validationErrors.length > 0"
                class="tw-mb-3 tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg"
            >
                <div class="tw-flex tw-gap-2">
                    <i class="pi pi-info-circle tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
                    <p class="tw-text-sm tw-text-amber-900">
                        {{ t('At least one work contract is required') }}
                    </p>
                </div>
            </div>

            <!-- Contract Cards -->
            <div
                v-for="(contract, index) in contracts"
                :key="contract.id"
                class="tw-mb-2"
            >
                <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
                    <div class="tw-flex tw-items-center tw-gap-2">
                        <i class="pi pi-file tw-text-primary" aria-hidden="true"></i>
                        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                            {{ t('Contract') }} {{ index + 1 }}
                        </span>
                        
                        <!-- Status indicator for this contract -->
                        <div
                            v-if="displayStatus(contract).label"
                            :class="membershipStatusClass(contract)"
                            class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
                        >
                            <i :class="membershipStatusIcon(contract)" aria-hidden="true"></i>
                            <span>{{ displayStatus(contract).label }}</span>
                        </div>
                    </div>

                    <!-- Delete Button -->
                    <button
                        v-if="canShowDelete(contract)"
                        type="button"
                        :disabled="isLoadingKey(`pd_contract-deleting-${contract.id}`)"
                        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
                        @click="showDeleteConfirmation(contract)"
                    >
                        <i
                            :class="isLoadingKey(`pd_contract-deleting-${contract.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
                            aria-hidden="true"
                        ></i>
                    </button>

                    <!-- Restore Button -->
                    <button
                        v-if="canShowRestore(contract)"
                        type="button"
                        :disabled="isLoadingKey(`pd_contract-restoring-${contract.id}`)"
                        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-green-600 tw-transition disabled:tw-opacity-50"
                        @click="handleRestoreContract(contract.id)"
                    >
                        <i
                            :class="isLoadingKey(`pd_contract-restoring-${contract.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-undo'"
                            aria-hidden="true"
                        ></i>
                        <span>{{ t('Restore') }}</span>
                    </button>
                </div>

                <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                    <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                        <div>
                            <div class="tw-text-sm tw-text-slate-500">{{ t('Dive Center') }}</div>
                            <div class="tw-font-medium tw-text-slate-800">
                                {{ contract?.center_name || '-' }}
                            </div>
                        </div>

                        <div v-if="contract?.start_date">
                            <div class="tw-text-sm tw-text-slate-500">{{ t('Contract Start') }}</div>
                            <div class="tw-font-medium tw-text-slate-700">
                                {{ contract.start_date }}
                            </div>
                        </div>

                        <div v-if="contract?.end_date">
                            <div class="tw-text-sm tw-text-slate-500">{{ t('Contract End') }}</div>
                            <div class="tw-font-medium tw-text-slate-700">
                                {{ contract.end_date }}
                            </div>
                        </div>

                        <div v-if="contract?.contract_copy_link" class="sm:tw-col-span-2">
                            <div class="tw-text-sm tw-text-slate-500">{{ t('Copy of contract') }}</div>
                            <a
                                :href="`${WEB_URL}${contract.contract_copy_link}`"
                                target="_blank"
                                class="p-button p-button-text p-button-sm tw-text-sm tw-inline-flex tw-items-center tw-gap-2"
                                v-tooltip.bottom="t('Open contract copy')"
                                :title="t('Open contract copy')"
                            >
                                <i class="pi pi-external-link"></i>
                                <span>{{ t('View Contract Copy') }}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Contract Button -->
            <div v-if="canShowAdd && !isLoadingKey('pd_contracts')">
                <button
                    type="button"
                    class="tw-block tw-w-full tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 hover:tw-border-primary hover:tw-bg-blue-50 tw-shadow-sm tw-p-8 tw-transition"
                    @click="navigateToAddContract"
                >
                    <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
                        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-slate-100 hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center tw-transition">
                            <i class="pi pi-plus tw-text-xl tw-text-slate-600 hover:tw-text-primary tw-transition" aria-hidden="true"></i>
                        </div>
                        <span class="tw-text-slate-600 hover:tw-text-primary tw-font-medium tw-transition">
                            {{ t('Add Work Contract') }}
                        </span>
                    </div>
                </button>
            </div>
        </template>

        <!-- Confirm Dialog -->
        <ConfirmDialog group="contracts" appendTo="body" :closable="false" :draggable="false" />
    </div>
</template>

<!--
VERSION: 1.0.0

ARCHITECTURE NOTES:
================
- NO PROPS - Completely self-contained
- Reads from: store.payload.pd_contracts
- Edit permission: store.canModifyApplication (based on stage)
- Validates: Min 1 contract
- Reports: setStepError('pd_contracts', errors) / deleteStepError('pd_contracts')
- Step identifier: 'pd_contracts'
- Loading key: 'pd_contracts'

LOADING KEYS:
===========
- pd_contracts (managed by store via loadEntity)
- pd_contract-deleting-{id} (granular delete loading)
- pd_contract-restoring-{id} (granular restore loading)

VALIDATION RULES:
==============
- Minimum 1 contract required

NAVIGATION:
==========
- Add button → pd-contract-add route (NEW V3 route)
- Passes appId and locale as route params
- Only visible when canEdit is true (based on application stage)

STATUS DISPLAY:
============
- Unverified: warn (yellow) — newly added, proposed active, awaiting admin review
- Active: success (green) — proposed active and already active (backend "approved")
- Cancellation pending: warn (yellow) — currently active, proposed for cancellation
- Inactive: danger (red)

USAGE:
======
<PDWorkContractsCard />

No props needed! Component gets everything from store.
-->
