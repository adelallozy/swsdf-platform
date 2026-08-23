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
  DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP,
  DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS,
} from "@/v3/config/apiEndpoints.js";
import { makeDiveCenterInternationalMembershipSchema } from "@/v3/schema/applications/diveCenterInternationalMembership.js";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const store = useApplicationStore();
const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
const schema = ref(makeDiveCenterInternationalMembershipSchema([]));
const schemaKey = ref(0);
const formIsValid = ref(false);
const organizations = ref([]);

const appId = Number(route.params.appId) || Number(route.params.id) || null;
const initializing = computed(() =>
  isLoadingKey("dive-center-membership-add-initializing")
);
const saving = computed(() =>
  isLoadingKey("dive-center-membership-add-saving")
);
const canSubmit = computed(() => formIsValid.value);
const application = computed(() => store.application.value);
const canModifyApplication = computed(() => store.canModifyApplication.value);

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

function buildOrganizationOptions(response) {
  const rawOrganizations = response?.divingOrganizations || {};

  return Object.values(rawOrganizations)
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim())
    .filter((value, index, array) => array.indexOf(value) === index)
    .map((value) => ({
      label: value,
      value,
    }));
}

async function initialize() {
  try {
    if (!appId) {
      notifyError(t("Application ID is missing"));
      return;
    }

    const [membershipOptionsResponse] = await Promise.all([
      apiGet(DIVING_CENTERS_APPS_GET_MEMBERSHIP_OPTIONS),
      store.loadApplication(appId, { withPayload: false }),
    ]);

    organizations.value = buildOrganizationOptions(membershipOptionsResponse);
    schema.value = makeDiveCenterInternationalMembershipSchema(
      organizations.value
    );
    schemaKey.value += 1;

    if (!application.value) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (!canModifyApplication.value) {
      notifyError(t("Application cannot be modified"));
      router.replace({
        name: "app-summary",
        params: { appId, locale: locale.value },
      });
      return;
    }

    setHeading({
      title: "Add International Membership",
      visible: true,
    });
  } catch (error) {
    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "AddInternationalMembership.initialize",
      fallback: "Failed to load membership form",
      meta: { appId },
    });
    notifyError(t("Failed to load application"));
    router.replace({
      name: "applications-index",
      params: { locale: locale.value },
    });
  }
}

async function onSubmit({ formData }) {
  try {
    await withLoading("dive-center-membership-add-saving", async () => {
      await apiPost(
        DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP + appId,
        {
          organization: formData.organization,
          number: formData.number,
          diving_type: formData.diving_type,
          expiry_date: formData.expiry_date,
        }
      );
    });

    await store.loadApplication(appId, {
      withPayload: true,
      forceReload: true,
    });

    notifySuccess(t("Membership added successfully"));
    router.push({
      name: "app-summary",
      params: { appId, locale: locale.value },
    });
  } catch (error) {
    if (error?.name === ERROR_TYPES.VALIDATION || error?.status === 422) {
      const validationErrors =
        error.validationErrors || error.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(validationErrors);
      return;
    }

    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (error?.status === 409) {
      const validationErrors = error?.payload?.errors || {};
      mfRef.value?.applyServerErrors?.(validationErrors);
      return;
    }

    if (error?.status >= 500) {
      router.replace({ name: "server-error", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "AddInternationalMembership.onSubmit",
      fallback: "Failed to add membership",
      meta: { appId },
    });
    notifyError(t("Failed to add membership"));
  }
}

onMounted(async () => {
  await withLoading("dive-center-membership-add-initializing", initialize);
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
          {{ t("Add International Membership") }}
        </h1>
      </div>

      <MasterForm
        :key="schemaKey"
        ref="mfRef"
        :schema="schema"
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
          <span v-if="!saving">{{ t("Add Membership") }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <span class="lds-dual-ring"></span>{{ t("Saving") }}
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>
