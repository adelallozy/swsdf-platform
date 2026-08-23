<!-- FILE: src/v3/components/applications/cards/ApplicationWaiver.vue -->
<!-- Single per-application waiver acknowledgement card. Renders the localized -->
<!-- waiver text from APPLICATION_WAIVERS (frontend config) based on the active -->
<!-- locale and blocks submit until the applicant checks the agreement box. -->
<!-- Uses the store step-error mechanism (step id: "waiver"). -->

<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { getApplicationConfig, getApplicationWaiver } from "@/v3/config/application-config.js";

const { locale } = useI18n();
const store = useApplicationStore();

const STEP_ID = "waiver";

// ────────────────────────────────────────────────────────────────────
// WAIVER TEXT
// ────────────────────────────────────────────────────────────────────

const applicationType = computed(() => store.applicationType?.value);
const waiverId = computed(() => {
  if (!applicationType.value) return null;
  const config = getApplicationConfig(applicationType.value);
  return config?.waiverId || null;
});

const waiverConfig = computed(() => getApplicationWaiver(waiverId.value));

const waiverText = computed(() => {
  if (!waiverConfig.value) return "";
  const lang = (locale.value || "en").toString().toLowerCase();
  return waiverConfig.value[lang] || waiverConfig.value.en || "";
});

const hasWaiver = computed(() => !!waiverConfig.value);

// ────────────────────────────────────────────────────────────────────
// AGREEMENT STATE
// ────────────────────────────────────────────────────────────────────

const agreed = ref(false);

const canEdit = computed(() => store.canModifyApplication?.value || false);

// ────────────────────────────────────────────────────────────────────
// VALIDATION (blocks submit via store step errors)
// ────────────────────────────────────────────────────────────────────

const validationErrors = computed(() => {
  if (!hasWaiver.value || !canEdit.value) return [];
  if (!agreed.value) {
    return [waiverText.value || "You must accept the waiver before submission."];
  }
  return [];
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

onBeforeUnmount(() => {
  store.deleteStepError(STEP_ID);
});
</script>

<template>
  <div v-if="hasWaiver" class="tw-space-y-3" data-step-id="waiver">
    <!-- Header -->
    <div class="tw-mb-1 tw-flex tw-items-center tw-gap-2">
      <i class="pi pi-shield tw-text-primary" aria-hidden="true"></i>
      <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
        {{ $t("Waiver & Acknowledgement") }}
      </span>
    </div>

    <!-- Waiver card -->
    <div
      class="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-2xl tw-p-5"
    >
      <p class="tw-text-sm tw-text-amber-900 tw-leading-relaxed tw-mb-4">
        {{ waiverText }}
      </p>

      <label
        v-if="canEdit"
        class="tw-flex tw-items-start tw-gap-3 tw-cursor-pointer"
      >
        <input
          v-model="agreed"
          type="checkbox"
          class="tw-mt-1 tw-h-5 tw-w-5 tw-rounded tw-border-amber-400 tw-text-primary focus:tw-ring-primary"
        />
        <span class="tw-text-sm tw-text-amber-900 tw-font-medium">
          {{ $t("I have read and agree to the above waiver") }}
        </span>
      </label>

      <!-- Read-only accepted indicator (non-editable stage) -->
      <div
        v-else-if="agreed"
        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-text-sm tw-font-medium tw-rounded-full tw-bg-emerald-50 tw-text-emerald-700"
      >
        <i class="pi pi-check-circle" aria-hidden="true"></i>
        {{ $t("Accepted") }}
      </div>
    </div>
  </div>
</template>