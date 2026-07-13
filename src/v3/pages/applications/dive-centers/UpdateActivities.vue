<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AppButton from "@/v3/components/ui/AppButton.vue";
import MasterForm from "@/v3/components/Forms/MasterForm.vue";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { ERROR_TYPES, apiGet, apiPost } from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS,
  DIVING_CENTERS_APPS_UPDATE_PROFILE,
} from "@/v3/config/apiEndpoints.js";
import {
  extractDiveCenterActivityGroups,
  getDiveCenterActivitiesInitialValues,
  makeDiveCenterActivitiesSchema,
  serializeDiveCenterActivities,
} from "@/v3/schema/applications/diveCenterActivities.js";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const store = useApplicationStore();
const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
const schema = ref(makeDiveCenterActivitiesSchema());
const formOptions = ref({
  primary_diving_activities: [],
  ancillary_diving_activities: [],
});
const initialValues = ref({});
const unclassifiedActivities = ref([]);
const formIsValid = ref(false);

const appId = Number(route.params.appId) || Number(route.params.id) || null;
const initializing = computed(() =>
  isLoadingKey("dive-center-activities-edit-initializing")
);
const saving = computed(() =>
  isLoadingKey("dive-center-activities-edit-saving")
);
const canSubmit = computed(() => formIsValid.value);

function onValidity({ isValid }) {
  formIsValid.value = isValid;
}

function submitProgrammatically() {
  if (saving.value) {
    return;
  }

  const isValid = mfRef.value?.validateForm?.();
  if (!isValid) {
    mfRef.value?.showErrors?.();
    return;
  }

  mfRef.value?.submitForm?.();
}

async function initialize() {
  try {
    if (!appId) {
      notifyError(t("Application ID is missing"));
      return;
    }

    const currentApplication = store.application.value;
    const appLoaded = Number(currentApplication?.id) === appId;
    const centerProfileLoaded = store.isPayloadKeyLoaded("center_profile");

    const requests = [apiGet(DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS)];

    if (!appLoaded || !centerProfileLoaded) {
      requests.push(
        store.loadApplication(appId, {
          withPayload: true,
          payloadKeys: ["center_profile"],
          forceReload: !centerProfileLoaded,
        })
      );
    }

    const [membershipOptionsResponse] = await Promise.all(requests);
    const activityGroups =
      extractDiveCenterActivityGroups(membershipOptionsResponse);

    formOptions.value.primary_diving_activities = activityGroups.primaryOptions;
    formOptions.value.ancillary_diving_activities =
      activityGroups.ancillaryOptions;

    if (!store.application.value) {
      notifyError(t("Application not found"));
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (!store.canModifyApplication.value) {
      notifyError(t("This application cannot be modified in its current stage"));
      router.replace({
        name: "app-summary",
        params: { appId, locale: locale.value },
      });
      return;
    }

    const centerProfile = store.payload.center_profile.value;
    if (!centerProfile) {
      notifyError(
        t("Center profile must be completed before editing diving activities")
      );
      router.replace({
        name: "dive-center-profile-edit",
        params: { appId, locale: locale.value },
      });
      return;
    }

    const initialActivityValues = getDiveCenterActivitiesInitialValues(
      centerProfile.diving_activities,
      activityGroups
    );

    initialValues.value = initialActivityValues.formData;
    unclassifiedActivities.value = initialActivityValues.unclassifiedActivities;

    setHeading({
      title: t("Update Diving Activities"),
      visible: true,
    });
  } catch (error) {
    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "UpdateDiveCenterActivities.initialize",
      fallback: "Failed to load diving activities",
      meta: { appId },
    });
    notifyError(t("Failed to load diving activities"));
    router.replace({ name: "applications-index", params: { locale: locale.value } });
  }
}

async function onSubmit({ formData }) {
  try {
    await withLoading("dive-center-activities-edit-saving", async () => {
      const payload = serializeDiveCenterActivities(formData);
      await apiPost(DIVING_CENTERS_APPS_UPDATE_PROFILE + appId, payload);
    });

    notifySuccess(t("Diving activities updated successfully"));
    router.push({
      name: "app-summary",
      params: { appId, locale: locale.value },
    });
  } catch (error) {
    if (error?.name === ERROR_TYPES.VALIDATION || error?.status === 422) {
      const validationErrors =
        error.validationErrors || error.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(validationErrors);
      notifyError(t("Please fix the validation errors"));
      return;
    }

    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (error?.status === 409) {
      notifyError(
        error?.payload?.message || error?.message || t("Failed to save diving activities")
      );
      return;
    }

    if (error?.status >= 500) {
      router.replace({ name: "server-error", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "UpdateDiveCenterActivities.onSubmit",
      fallback: "Failed to save diving activities",
      meta: { appId, formData },
    });
    notifyError(t("Failed to save diving activities"));
  }
}

onMounted(async () => {
  await withLoading("dive-center-activities-edit-initializing", initialize);
});
</script>

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
      <i
        class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary"
        aria-hidden="true"
      ></i>
    </div>

    <section
      v-else
      class="tw-max-w-3xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
    >
      <div class="tw-mb-6">
        <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
          {{ t("Update Diving Activities") }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t("Select at least one main activity and one ancillary activity for this application") }}
        </p>
      </div>

      <div
        v-if="unclassifiedActivities.length > 0"
        class="tw-mb-5 tw-rounded-xl tw-border tw-border-amber-200 tw-bg-amber-50 tw-p-4"
      >
        <div class="tw-text-sm tw-font-semibold tw-text-amber-800">
          {{ t("Additional saved activities") }}
        </div>
        <p class="tw-mt-1 tw-text-sm tw-text-amber-700">
          {{ t("These activities are not part of the current selectable catalog and will be removed when you save this selection") }}
        </p>
        <div class="tw-mt-3 tw-flex tw-flex-wrap tw-gap-2">
          <span
            v-for="activity in unclassifiedActivities"
            :key="activity"
            class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-white tw-px-3 tw-py-1 tw-text-sm tw-text-amber-800 tw-border tw-border-amber-200"
          >
            {{ t(activity) }}
          </span>
        </div>
      </div>

      <MasterForm
        ref="mfRef"
        :schema="schema"
        :formOptions="formOptions"
        :initialValues="initialValues"
        @submit="onSubmit"
        @validity="onValidity"
      />

      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <router-link
          :to="{ name: 'app-summary', params: { appId, locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ t("Cancel") }}</span>
        </router-link>

        <AppButton
          variant="primary"
          icon="pi pi-check"
          :disabled="saving || !canSubmit"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t("Save") }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <i class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            <span>{{ t("Saving") }}</span>
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>
