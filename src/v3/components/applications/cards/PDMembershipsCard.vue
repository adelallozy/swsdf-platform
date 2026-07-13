<!-- FILE: src/v3/components/applications/cards/PDMembershipsCard.vue -->
<!-- VERSION: 1.0.1 -->
<!-- LAST UPDATED: 2026-02-02 -->
<!-- NEW COMPONENT - Following SFParticipantsCard pattern -->

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';

import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { usePDApplicationsApi } from '@/v3/composables/application/usePDApplicationsApi.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { useNotification } from '@/v3/composables/useNotification.js';

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

// ────────────────────────────────────────────────────────────────────
// DATA - Read from store
// ────────────────────────────────────────────────────────────────────

const memberships = computed(() => store.payload.pd_memberships.value || []);
const canEdit = computed(() => store.canModifyApplication.value);
const showMainHeader = computed(() => {
    return !(memberships.value.length === 0 && !canEdit.value && !isLoadingKey('pd_memberships'));
});

// ────────────────────────────────────────────────────────────────────
// VALIDATION CONFIG
// ────────────────────────────────────────────────────────────────────

const MIN_MEMBERSHIPS = 1;

// ────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────

// Add button: canEdit (no max limit for memberships)
const canShowAdd = computed(() => {
    return canEdit.value;
});

// Individual membership status helpers for inline tags
function membershipStatusClass(membership) {
    const status = displayStatus(membership).severity;
    if (status === 'warn') return 'tw-bg-amber-50 tw-text-amber-700';
    if (status === 'success') return 'tw-bg-green-50 tw-text-green-700';
    if (status === 'danger') return 'tw-bg-red-50 tw-text-red-700';
    if (status === 'info') return 'tw-bg-blue-50 tw-text-blue-700';
    return '';
}

function membershipStatusIcon(membership) {
    const status = displayStatus(membership).severity;
    if (status === 'warn') return 'pi pi-clock';
    if (status === 'success') return 'pi pi-check-circle';
    if (status === 'danger') return 'pi pi-times-circle';
    if (status === 'info') return 'pi pi-info-circle';
    return '';
}

// ────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
    const errors = [];
    const verifiedCount = memberships.value.filter(m => lc(m?.new_status) === 'verified').length;

    if (verifiedCount < MIN_MEMBERSHIPS) {
        errors.push(
            t('At least one international membership is required')
        );
    }

    return errors;
});

// Watch validation and sync with store
watch(
    validationErrors,
    (errors) => {
        if (errors.length > 0) {
            store.setStepError('pd_memberships', errors);
        } else {
            store.deleteStepError('pd_memberships');
        }
    },
    { immediate: true }
);

// ────────────────────────────────────────────────────────────────────
// BUTTON VISIBILITY RULES
// ────────────────────────────────────────────────────────────────────

/**
 * Determines if delete button should be shown for a membership.
 * Only shows when canEdit is true AND membership is verified.
 *
 * @param {Object} membership - The membership object
 * @returns {boolean} True if delete button should be shown
 */
function canShowRemove(membership) {
    return canEdit.value && lc(membership?.new_status) === 'verified';
}

/**
 * Determines if restore button should be shown for a membership.
 * Only shows when canEdit is true AND membership was verified and now canceled.
 *
 * @param {Object} membership - The membership object
 * @returns {boolean} True if restore button should be shown
 */
function canShowRestore(membership) {
    const newStatus = lc(membership?.new_status);
    const currentStatus = lc(membership?.status);
    return canEdit.value && newStatus === 'canceled' && currentStatus === 'verified';
}

// ────────────────────────────────────────────────────────────────────
// STATUS DISPLAY HELPERS
// ────────────────────────────────────────────────────────────────────

/**
 * Returns display status for a membership with label and severity.
 * Priority: Canceled > Unverified > Verified > Fallback
 *
 * @param {Object} membership - The membership object
 * @returns {{label: string, severity: string}} Status object with label and severity
 */
function displayStatus(membership) {
    const newStatus = lc(membership?.new_status);
    const currentStatus = lc(membership?.status);
    
    // Canceled (Pending Deletion) - Enhanced UX message
    if (newStatus === 'canceled' && currentStatus === 'verified') {
        return { label: t('Cancellation will be completed after application approval'), severity: 'warn' };
    }
    
    // Canceled (Inactive)
    if (newStatus === 'canceled' || currentStatus === 'canceled') {
        return { label: t('Canceled'), severity: 'danger' };
    }
    
    // Unverified status
    if (currentStatus === 'unverified') {
        return { label: t('Unverified'), severity: 'warn' };
    }
    
    // Verified status (only if not canceled and either verified or no new status)
    if (currentStatus === 'verified' && (!newStatus || newStatus === 'verified')) {
        return { label: t('Verified'), severity: 'success' };
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
    if (['canceled', 'rejected', 'deleted'].includes(s)) {
        return 'danger';
    }
    return 'info';
}

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
// ACTION HANDLERS
// ────────────────────────────────────────────────────────────────────

/**
 * Shows a confirmation dialog before deleting a membership.
 *
 * @param {Object} membership - The membership object to delete
 */
function showDeleteConfirmation(membership) {
    confirm.require({
        group: 'memberships',
        message: `${membership?.title ? `"${membership.title}" – ` : ''}${t('Remove this membership?')}`,
        header: t('Confirm'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('Remove'),
        rejectLabel: t('Cancel'),
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await handleDeleteMembership(membership.id);
            } finally {
                confirm.close();
            }
        },
        reject: () => confirm.close()
    });
}

/**
 * Handles delete membership operation.
 *
 * @param {number} membershipId - The ID of membership to delete
 */
async function handleDeleteMembership(updateId) {
    try {
        await api.deleteMembership(updateId);
    } catch (err) {
        capture(err, {
            fallback: 'Failed to remove membership',
            context: 'PDMembershipsCard.handleDeleteMembership',
            meta: {
                appId: store.application.value.id,
                updateId
            }
        });
        notifyError(t('Failed to remove membership. Please try again.'));
    }
}

/**
 * Handles restore membership operation.
 *
 * @param {number} membershipId - The ID of membership to restore
 */
async function handleRestoreMembership(updateId) {
    try {
        await api.restoreMembership(updateId);
    } catch (err) {
        capture(err, {
            fallback: 'Failed to restore membership',
            context: 'PDMembershipsCard.handleRestoreMembership',
            meta: {
                appId: store.application.value.id,
                updateId
            }
        });
        notifyError(t('Failed to restore membership. Please try again.'));
    }
}

/**
 * Navigates to add membership page.
 */
function navigateToAddMembership() {
    router.push({
        name: 'pd-membership-add',
        params: {
            appId: store.application.value.id,
            locale: locale.value
        }
    });
}

store.registerStepPrimaryAction('pd_memberships', navigateToAddMembership);

// ────────────────────────────────────────────────────────────────────
// CLEANUP
// ────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
    store.unregisterStepPrimaryAction('pd_memberships');
    store.deleteStepError('pd_memberships');
});
</script>

<template>
    <div class="tw-space-y-8" data-step-id="pd_memberships">
        <!-- Header -->
        <div v-if="showMainHeader" class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-2">
                <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
                <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                    {{ $t('International Memberships') }}
                </span>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingKey('pd_memberships')" class="tw-mb-2">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
                <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                    {{ $t('International Memberships') }}
                </span>
            </div>
            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-flex tw-justify-center tw-py-8">
                    <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!isLoadingKey('pd_memberships') && memberships.length === 0 && !canEdit">
            <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
                <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                    {{ $t('International Memberships') }}
                </span>
            </div>
            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-text-center tw-py-8">
                    <i class="pi pi-users tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
                    <p class="tw-text-slate-500">{{ $t('No memberships registered') }}</p>
                </div>
            </div>
        </div>

        <!-- Minimum Warning -->
        <div
            v-if="canEdit && !isLoadingKey('pd_memberships') && validationErrors.length > 0"
            class="tw-mb-3 tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg"
        >
            <div class="tw-flex tw-gap-2">
                <i class="pi pi-info-circle tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
                <p class="tw-text-sm tw-text-amber-900">
                    {{ $t("At least one international membership is required") }}
                </p>
            </div>
        </div>

        <!-- Membership Cards -->
        <div
            v-for="(membership, index) in memberships"
            :key="membership.id"
            class="tw-mb-2"
        >
            <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-items-center tw-gap-2">
                    <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
                    <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                        {{ $t('Membership') }} {{ index + 1 }}
                    </span>
                    
                    <!-- Status indicator for this membership -->
                    <div
                        v-if="displayStatus(membership).label"
                        :class="membershipStatusClass(membership)"
                        class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
                    >
                        <i :class="membershipStatusIcon(membership)" aria-hidden="true"></i>
                        <span>{{ displayStatus(membership).label }}</span>
                    </div>
                </div>

                <!-- Delete Button (when membership is verified) -->
                <button
                    v-if="canShowRemove(membership)"
                    type="button"
                    :disabled="isLoadingKey(`pd_membership-deleting-${membership.id}`)"
                    class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
                    :aria-label="$t('Remove membership') + ': ' + (membership.title || membership.membership_number)"
                    @click="showDeleteConfirmation(membership)"
                >
                    <i
                        :class="isLoadingKey(`pd_membership-deleting-${membership.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
                        aria-hidden="true"
                    ></i>
                </button>

                <!-- Restore Button (when membership is canceled) -->
                <button
                    v-if="canShowRestore(membership)"
                    type="button"
                    :disabled="isLoadingKey(`pd_membership-restoring-${membership.id}`)"
                    class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-green-600 tw-transition disabled:tw-opacity-50"
                    :aria-label="$t('Restore membership')"
                    @click="handleRestoreMembership(membership.id)"
                >
                    <i
                        :class="isLoadingKey(`pd_membership-restoring-${membership.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-undo'"
                        aria-hidden="true"
                    ></i>
                    <span>{{ $t('Restore') }}</span>
                </button>
            </div>

            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                    <div class="">
                        <div class="tw-text-sm tw-text-slate-500">{{ $t('Diving Organization') }}</div>
                        <div class="tw-font-medium tw-text-slate-800">
                            {{ membership?.organization || '-' }}
                        </div>
                    </div>

                    <div>
                        <div class="tw-text-sm tw-text-slate-500">{{ $t('Qualification Level') }}</div>
                        <div class="tw-font-medium tw-text-slate-800">
                            {{ membership?.title || '-' }}
                        </div>
                    </div>

                    <div>
                        <div class="tw-text-sm tw-text-slate-500">{{ $t('Membership Number') }}</div>
                        <div class="tw-font-medium tw-text-slate-700">
                            {{ membership?.membership_number || '-' }}
                        </div>
                    </div>

                    <div v-if="membership?.diving_type">
                        <div class="tw-text-sm tw-text-slate-500">{{ $t('Diving Type') }}</div>
                        <div class="tw-font-medium tw-text-slate-700">
                            {{ membership.diving_type }}
                        </div>
                    </div>

                    <div v-if="membership?.membership_link" class="sm:tw-col-span-2">
                        <div class="tw-text-sm tw-text-slate-500">{{ $t('Membership Copy') }}</div>
                        <a
                            :href="`${WEB_URL}${membership.membership_link}`"
                            target="_blank"
                            class="p-button p-button-text p-button-sm tw-text-sm tw-inline-flex tw-items-center tw-gap-2"
                            v-tooltip.bottom="$t('Open membership link')"
                            :title="$t('Open membership link')"
                        >
                            <i class="pi pi-external-link"></i>
                            <span>{{ $t('Membership Copy') }}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Membership -->
        <div v-if="canShowAdd && !isLoadingKey('pd_memberships')">
            <!-- Add Button -->
            <button
                type="button"
                class="tw-block tw-w-full tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 hover:tw-border-primary hover:tw-bg-blue-50 tw-shadow-sm tw-p-8 tw-transition"
                @click="navigateToAddMembership"
            >
                <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
                    
                    <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-slate-100 hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center tw-transition">
                        <i class="pi pi-plus tw-text-xl tw-text-slate-600 hover:tw-text-primary tw-transition" aria-hidden="true"></i>
                    </div>
                    <span class="tw-text-slate-600 hover:tw-text-primary tw-font-medium tw-transition">
                        {{ $t('Add International Membership') }}
                    </span>
                </div>
            </button>
        </div>

        <!-- Confirm Dialog -->
        <ConfirmDialog group="memberships" appendTo="body" :closable="false" :draggable="false" :reject-class="'tw-bg-white tw-text-gray-700 tw-border tw-border-gray-300'" />
    </div>
</template>

<!--
VERSION: 1.0.1

ARCHITECTURE NOTES:
=================
- NO PROPS - Completely self-contained
- Reads from: store.payload.pd_memberships
- Edit permission: store.canModifyApplication (based on stage)
- Validates: Min 1 membership
- Reports: setStepError('pd_memberships', errors) / deleteStepError('pd_memberships')
- Step identifier: 'pd_memberships'
- Loading key: 'pd_memberships'

LOADING KEYS:
============
- pd_memberships (managed by store via loadEntity)
- pd_membership-deleting-{id} (granular delete loading)
- pd_membership-restoring-{id} (granular restore loading)

VALIDATION RULES:
===============
- Minimum 1 membership required

NAVIGATION:
=========
- Add button → pd-membership-add route (NEW V3 route)
- Passes appId and locale as route params
- Only visible when canEdit is true (based on application stage)

STATUS DISPLAY:
=============
- Unverified: warn (yellow)
- Verified: success (green)
- Approved: success (green)
- Canceled: danger (red)

USAGE:
=====
<PDMembershipsCard />

No props needed! Component gets everything from store.
-->
