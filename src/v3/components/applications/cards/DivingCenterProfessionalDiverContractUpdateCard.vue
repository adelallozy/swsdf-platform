<!-- FILE: src/v3/components/applications/cards/DivingCenterProfessionalDiverContractUpdateCard.vue -->
<!-- Lists ALL active contracts for the dive center, split into two sections: -->
<!-- 1. Contracts selected for cancellation (always expanded, with Restore) -->
<!-- 2. Active contracts (collapsed, shows 1 by default, "Show all" to expand) -->

<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { apiPost } from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_APPS_ADD_CONTRACT_CANCELLATION,
  DIVING_CENTERS_APPS_REMOVE_CONTRACT_CANCELLATION,
} from "@/v3/config/apiEndpoints.js";

const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;

const { t } = useI18n();
const { withLoading, isLoadingKey } = useLoading();
const { error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const store = useApplicationStore();

const STEP_ID = "pd_contracts";

// ────────────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────────────

const contracts = computed(
  () => store.payload?.center_active_contracts?.value || []
);
const isLoadingContracts = computed(() => isLoadingKey(STEP_ID));
const canEdit = computed(() => store.canModifyApplication.value);
const appId = computed(() => store.application.value?.id);

// Split contracts into two groups
const selectedContracts = computed(() =>
  contracts.value.filter((c) => !!c?.update_id)
);
const activeContracts = computed(() =>
  contracts.value.filter((c) => !c?.update_id)
);

// Collapse state for the active section
const showAllActive = ref(false);
const COLLAPSED_COUNT = 1;
const visibleActiveContracts = computed(() =>
  showAllActive.value
    ? activeContracts.value
    : activeContracts.value.slice(0, COLLAPSED_COUNT)
);

// ────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ────────────────────────────────────────────────────────────────────

const lc = (v) => (v || "").toString().toLowerCase();

function statusBadge(c) {
    const current = lc(c?.status);
    const newStatus = lc(c?.new_status);

    if (newStatus === "inactive" && ["approved", "active"].includes(current)) {
        return {
            label: t("Cancellation will be completed after application approval"),
            cls: "tw-bg-amber-50 tw-text-amber-700",
            icon: "pi pi-clock",
        };
    }

    if (["approved", "active"].includes(current)) {
        return {
            label: t("Active"),
            cls: "tw-bg-green-50 tw-text-green-700",
            icon: "pi pi-check-circle",
        };
    }

    if (current === "inactive") {
        return {
            label: t("Inactive"),
            cls: "tw-bg-red-50 tw-text-red-700",
            icon: "pi pi-times-circle",
        };
    }

    return {
        label: c?.status ? t(c.status) : t("Unknown"),
        cls: "tw-bg-slate-100 tw-text-slate-600",
        icon: "pi pi-info-circle",
    };
}

// ────────────────────────────────────────────────────────────────────
// VALIDATION
// ────────────────────────────────────────────────────────────────────

const selectedCount = computed(() => selectedContracts.value.length);

const validationErrors = computed(() => {
    const errors = [];
    if (canEdit.value && selectedCount.value === 0) {
        errors.push(t("Select at least one contract to cancel"));
    }
    return errors;
});

watch(
    validationErrors,
    (errors) => {
        if (errors.length > 0) {
            store.setStepError(STEP_ID, errors);
        } else {
            store.deleteStepError(STEP_ID);
        }
    },
    { immediate: true }
);

// ────────────────────────────────────────────────────────────────────
// ACTIONS
// ────────────────────────────────────────────────────────────────────

async function addCancellation(c) {
    try {
        await withLoading(`dc-contract-${c.id}`, async () => {
            await apiPost(
                DIVING_CENTERS_APPS_ADD_CONTRACT_CANCELLATION +
                    appId.value +
                    "/" +
                    c.id
            );
        });
        await store.reloadApplicationPayload();
    } catch (err) {
        if (err?.status === 401) return;
        capture(err, {
            context: "DivingCenterContractUpdateCard.addCancellation",
        });
        notifyError(t("Failed to add contract cancellation"));
    }
}

async function removeCancellation(c) {
    try {
        await withLoading(`dc-contract-${c.id}`, async () => {
            await apiPost(
                DIVING_CENTERS_APPS_REMOVE_CONTRACT_CANCELLATION + c.update_id
            );
        });
        await store.reloadApplicationPayload();
    } catch (err) {
        if (err?.status === 401) return;
        capture(err, {
            context: "DivingCenterContractUpdateCard.removeCancellation",
        });
        notifyError(t("Failed to remove contract cancellation"));
    }
}

onBeforeUnmount(() => {
    store.deleteStepError(STEP_ID);
});
</script>

<template>
    <div class="tw-space-y-8" data-step-id="pd_contracts">
        <!-- Header -->
        <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
            <i class="pi pi-briefcase tw-text-primary" aria-hidden="true"></i>
            <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                {{ t("Work Contracts") }}
            </span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingContracts" class="tw-mb-2">
            <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-flex tw-justify-center tw-py-8">
                    <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
                    <span class="tw-sr-only">{{ t("Loading") }}</span>
                </div>
            </div>
        </div>

        <template v-else>
            <!-- Validation warning -->
            <div
                v-if="canEdit && validationErrors.length > 0"
                class="tw-mb-3 tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg"
            >
                <div class="tw-flex tw-gap-2">
                    <i class="pi pi-info-circle tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
                    <p class="tw-text-sm tw-text-amber-900">
                        {{ t("Select at least one contract to cancel") }}
                    </p>
                </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- SECTION 1: Contracts selected for cancellation (always expanded) -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div v-if="selectedContracts.length > 0" class="tw-mb-6">
                <div class="tw-mb-3 tw-flex tw-items-center tw-gap-2">
                    <i class="pi pi-times-circle tw-text-red-500" aria-hidden="true"></i>
                    <span class="tw-font-bold tw-text-slate-700 tw-text-lg">
                        {{ t("Contracts to cancel") }}
                        <span class="tw-text-sm tw-font-normal tw-text-slate-500">
                            ({{ selectedContracts.length }})
                        </span>
                    </span>
                </div>

                <div
                    v-for="(contract, index) in selectedContracts"
                    :key="contract.id"
                    class="tw-mb-2"
                >
                    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
                        <div class="tw-flex tw-items-center tw-gap-2">
                            <i class="pi pi-file tw-text-primary" aria-hidden="true"></i>
                            <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                                {{ t("Contract") }} {{ index + 1 }}
                            </span>
                            <div
                                :class="statusBadge(contract).cls"
                                class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
                            >
                                <i :class="statusBadge(contract).icon" aria-hidden="true"></i>
                                <span>{{ statusBadge(contract).label }}</span>
                            </div>
                        </div>

                        <button
                            v-if="canEdit"
                            type="button"
                            :disabled="isLoadingKey(`dc-contract-${contract.id}`)"
                            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-green-600 tw-transition disabled:tw-opacity-50"
                            :aria-label="t('Restore')"
                            @click="removeCancellation(contract)"
                        >
                            <i
                                :class="isLoadingKey(`dc-contract-${contract.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-undo'"
                                aria-hidden="true"
                            ></i>
                            <span>{{ t("Restore") }}</span>
                        </button>
                    </div>

                    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                        <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                            <div v-if="contract.diver_name">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Name") }}</div>
                                <div class="tw-font-medium tw-text-slate-800">{{ contract.diver_name }}</div>
                            </div>
                            <div v-if="contract.diver_rank">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Rank") }}</div>
                                <div class="tw-font-medium tw-text-slate-800">{{ t(contract.diver_rank) }}</div>
                            </div>
                            <div v-if="contract.center_name">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Dive Center") }}</div>
                                <div class="tw-font-medium tw-text-slate-800">{{ contract.center_name }}</div>
                            </div>
                            <div v-if="contract.start_date">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Contract Start") }}</div>
                                <div class="tw-font-medium tw-text-slate-700">{{ contract.start_date }}</div>
                            </div>
                            <div v-if="contract.end_date">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Contract End") }}</div>
                                <div class="tw-font-medium tw-text-slate-700">{{ contract.end_date }}</div>
                            </div>
                            <div v-if="contract.contract_copy_link" class="sm:tw-col-span-2">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Copy of contract") }}</div>
                                <a
                                    :href="`${WEB_URL}${contract.contract_copy_link}`"
                                    target="_blank"
                                    class="p-button p-button-text p-button-sm tw-text-sm tw-inline-flex tw-items-center tw-gap-2"
                                    v-tooltip.bottom="t('Open contract copy')"
                                    :title="t('Open contract copy')"
                                >
                                    <i class="pi pi-external-link"></i>
                                    <span>{{ t("View Contract Copy") }}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- SECTION 2: Active contracts (collapsed, show all on click) -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div v-if="activeContracts.length > 0">
                <div class="tw-mb-3 tw-flex tw-items-center tw-gap-2">
                    <i class="pi pi-check-circle tw-text-green-500" aria-hidden="true"></i>
                    <span class="tw-font-bold tw-text-slate-700 tw-text-lg">
                        {{ t("Active contracts") }}
                        <span class="tw-text-sm tw-font-normal tw-text-slate-500">
                            ({{ activeContracts.length }})
                        </span>
                    </span>
                </div>

                <div
                    v-for="(contract, index) in visibleActiveContracts"
                    :key="contract.id"
                    class="tw-mb-2"
                >
                    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
                        <div class="tw-flex tw-items-center tw-gap-2">
                            <i class="pi pi-file tw-text-primary" aria-hidden="true"></i>
                            <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
                                {{ t("Contract") }} {{ index + 1 }}
                            </span>
                            <div
                                :class="statusBadge(contract).cls"
                                class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
                            >
                                <i :class="statusBadge(contract).icon" aria-hidden="true"></i>
                                <span>{{ statusBadge(contract).label }}</span>
                            </div>
                        </div>

                        <button
                            v-if="canEdit"
                            type="button"
                            :disabled="isLoadingKey(`dc-contract-${contract.id}`)"
                            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
                            :aria-label="t('Cancel this contract')"
                            @click="addCancellation(contract)"
                        >
                            <i
                                :class="isLoadingKey(`dc-contract-${contract.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-times'"
                                aria-hidden="true"
                            ></i>
                            <span>{{ t("Cancel this contract") }}</span>
                        </button>
                    </div>

                    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                        <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                            <div v-if="contract.diver_name">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Name") }}</div>
                                <div class="tw-font-medium tw-text-slate-800">{{ contract.diver_name }}</div>
                            </div>
                            <div v-if="contract.diver_rank">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Rank") }}</div>
                                <div class="tw-font-medium tw-text-slate-800">{{ t(contract.diver_rank) }}</div>
                            </div>
                            <div v-if="contract.center_name">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Dive Center") }}</div>
                                <div class="tw-font-medium tw-text-slate-800">{{ contract.center_name }}</div>
                            </div>
                            <div v-if="contract.start_date">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Contract Start") }}</div>
                                <div class="tw-font-medium tw-text-slate-700">{{ contract.start_date }}</div>
                            </div>
                            <div v-if="contract.end_date">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Contract End") }}</div>
                                <div class="tw-font-medium tw-text-slate-700">{{ contract.end_date }}</div>
                            </div>
                            <div v-if="contract.contract_copy_link" class="sm:tw-col-span-2">
                                <div class="tw-text-sm tw-text-slate-500">{{ t("Copy of contract") }}</div>
                                <a
                                    :href="`${WEB_URL}${contract.contract_copy_link}`"
                                    target="_blank"
                                    class="p-button p-button-text p-button-sm tw-text-sm tw-inline-flex tw-items-center tw-gap-2"
                                    v-tooltip.bottom="t('Open contract copy')"
                                    :title="t('Open contract copy')"
                                >
                                    <i class="pi pi-external-link"></i>
                                    <span>{{ t("View Contract Copy") }}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Show all / Show less toggle -->
                <div
                    v-if="activeContracts.length > COLLAPSED_COUNT"
                    class="tw-mt-3 tw-flex tw-justify-center"
                >
                    <button
                        type="button"
                        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/5 tw-border tw-border-slate-200 hover:tw-border-primary tw-rounded-lg tw-transition"
                        @click="showAllActive = !showAllActive"
                    >
                        <i
                            :class="showAllActive ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                            aria-hidden="true"
                        ></i>
                        <span>
                            {{ showAllActive
                                ? t("Show less")
                                : t("Show all") + ` (${activeContracts.length})`
                            }}
                        </span>
                    </button>
                </div>
            </div>

            <!-- Empty state -->
            <div v-if="contracts.length === 0" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
                <div class="tw-text-center tw-py-8">
                    <i class="pi pi-briefcase tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
                    <p class="tw-text-slate-500">{{ t("No active contracts found") }}</p>
                </div>
            </div>
        </template>
    </div>
</template>