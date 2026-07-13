<template>
  <div v-if="visibleComponent" data-step-id="diving_activities">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-list-check tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
          {{ t("Diving Activities") }}
        </span>
      </div>

      <RouterLink
        v-if="canEdit && centerProfile"
        :to="editRoute"
        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
      >
        <i class="pi pi-pencil" aria-hidden="true"></i>
        {{ t("Edit") }}
      </RouterLink>
    </div>

    <div v-if="validationErrors.length > 0" class="tw-mb-3">
      <div
        v-for="(error, index) in validationErrors"
        :key="index"
        class="tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg tw-mb-2"
      >
        <div class="tw-flex tw-gap-2">
          <i
            class="pi pi-exclamation-triangle tw-text-amber-600 tw-mt-0.5"
            aria-hidden="true"
          ></i>
          <p class="tw-text-sm tw-text-amber-900">{{ error }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="centerProfile && hasActivities"
      class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
    >
      <div class="tw-space-y-5">
        <div v-if="primaryActivities.length > 0">
          <div class="tw-mb-2 tw-text-xs tw-text-slate-500">
            {{ t("Main Diving Activities") }}
          </div>
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <span
              v-for="activity in primaryActivities"
              :key="activity"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-primary/10 tw-px-3 tw-py-1 tw-text-sm tw-text-primary"
            >
              {{ t(activity) }}
            </span>
          </div>
        </div>

        <div v-if="ancillaryActivities.length > 0">
          <div class="tw-mb-2 tw-text-xs tw-text-slate-500">
            {{ t("Ancillary Diving Activities") }}
          </div>
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <span
              v-for="activity in ancillaryActivities"
              :key="activity"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-px-3 tw-py-1 tw-text-sm tw-text-slate-700"
            >
              {{ t(activity) }}
            </span>
          </div>
        </div>

        <div v-if="unclassifiedActivities.length > 0">
          <div class="tw-mb-2 tw-text-xs tw-text-slate-500">
            {{ t("Additional saved activities") }}
          </div>
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <span
              v-for="activity in unclassifiedActivities"
              :key="activity"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-amber-50 tw-border tw-border-amber-200 tw-px-3 tw-py-1 tw-text-sm tw-text-amber-800"
            >
              {{ t(activity) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
    >
      <div class="tw-text-center tw-py-8 tw-text-slate-500">
        <i class="pi pi-list-check tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p v-if="centerProfile">{{ t("No diving activities selected yet") }}</p>
        <p v-else>{{ t("Complete the center profile before editing diving activities") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import {
  getDefaultDiveCenterActivityGroups,
  partitionDiveCenterActivities,
} from "@/v3/schema/applications/diveCenterActivities.js";

const { t, locale } = useI18n();
const router = useRouter();
const store = useApplicationStore();

const application = computed(() => store.application.value);
const centerProfile = computed(() => store.payload.center_profile.value);
const canEdit = computed(() => store.canModifyApplication.value);
const activityGroups = getDefaultDiveCenterActivityGroups();

const activityPartition = computed(() =>
  partitionDiveCenterActivities(
    centerProfile.value?.diving_activities || [],
    activityGroups
  )
);

const primaryActivities = computed(
  () => activityPartition.value.primaryActivities
);
const ancillaryActivities = computed(
  () => activityPartition.value.ancillaryActivities
);
const unclassifiedActivities = computed(
  () => activityPartition.value.unclassifiedActivities
);
const hasActivities = computed(
  () =>
    primaryActivities.value.length > 0 ||
    ancillaryActivities.value.length > 0 ||
    unclassifiedActivities.value.length > 0
);

const visibleComponent = computed(() => {
  if (canEdit.value) {
    return true;
  }

  return hasActivities.value;
});

const editRoute = computed(() => ({
  name: "dive-center-activities-edit",
  params: {
    appId: application.value?.id,
    locale: locale.value,
  },
}));

const validationErrors = computed(() => {
  if (!canEdit.value || !centerProfile.value) {
    return [];
  }

  const errors = [];

  if (primaryActivities.value.length === 0) {
    errors.push(t("At least one main diving activity is required"));
  }

  if (ancillaryActivities.value.length === 0) {
    errors.push(t("At least one ancillary diving activity is required"));
  }

  return errors;
});

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError("diving_activities", errors);
    } else {
      store.deleteStepError("diving_activities");
    }
  },
  { immediate: true }
);

function editActivities() {
  if (!centerProfile.value) {
    router.push({
      name: "dive-center-profile-edit",
      params: {
        appId: application.value?.id,
        locale: locale.value,
      },
    });
    return;
  }

  router.push(editRoute.value);
}

watch(
  canEdit,
  (editable) => {
    if (editable) {
      store.registerStepPrimaryAction("diving_activities", editActivities);
      return;
    }

    store.unregisterStepPrimaryAction("diving_activities");
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction("diving_activities");
  store.deleteStepError("diving_activities");
});
</script>
