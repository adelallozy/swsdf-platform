<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AppButton from "@/v3/components/ui/AppButton.vue";
import MasterForm from "@/v3/components/Forms/MasterForm.vue";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { ERROR_TYPES, apiPost } from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_ADMIN_CREATE_PROFILE,
  DIVING_CENTERS_ADMIN_UPDATE_PROFILE,
} from "@/v3/config/apiEndpoints.js";
import {
  makeDiveCenterAdministratorSchema,
  normalizeDiveCenterAdministratorInitialValues,
  serializeDiveCenterAdministratorFormData,
} from "@/v3/schema/applications/diveCenterAdministrator.js";

const WEB_URL = import.meta.env.VITE_WEB_BASE_URL || "";

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const store = useApplicationStore();
const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
const currentRoles = ref([]);
const initialValues = ref(
  normalizeDiveCenterAdministratorInitialValues({}, WEB_URL)
);
const formIsValid = ref(false);

const schema = makeDiveCenterAdministratorSchema({
  isManagerSelected: () => currentRoles.value.includes("Manager"),
});

const appId = computed(() => Number(route.params.appId) || null);
const profileId = computed(() => Number(route.params.profileId) || null);
const isEdit = computed(() => !!profileId.value);

const initializing = computed(() =>
  isLoadingKey("dive-center-administrator-upsert-initializing")
);
const saving = computed(() =>
  isLoadingKey("dive-center-administrator-upsert-saving")
);
const pageTitle = computed(() =>
  isEdit.value ? t("Update Administrator") : t("Add Administrator")
);
const submitLabel = computed(() =>
  isEdit.value ? t("Save Changes") : t("Add Administrator")
);
const canSubmit = computed(() => formIsValid.value && !saving.value);

function summaryRoute() {
  return {
    name: "app-summary",
    params: {
      appId: appId.value,
      locale: locale.value,
    },
  };
}

function resetForm(administrator = {}) {
  initialValues.value = normalizeDiveCenterAdministratorInitialValues(
    administrator,
    WEB_URL
  );
  currentRoles.value = Array.isArray(initialValues.value.roles)
    ? [...initialValues.value.roles]
    : [];
  formIsValid.value = false;
  mfRef.value?.hideErrors?.();
}

function onValidity({ isValid }) {
  formIsValid.value = isValid;
}

function onFieldChange({ key, value }) {
  if (key !== "roles") {
    return;
  }

  currentRoles.value = Array.isArray(value) ? [...value] : [];
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
  resetForm({});

  try {
    if (!appId.value) {
      notifyError(t("Application ID is missing"));
      return;
    }

    await store.loadApplication(appId.value, {
      withPayload: isEdit.value,
      payloadKeys: isEdit.value ? ["center_administrators"] : null,
      forceReload: isEdit.value,
    });

    if (!store.application.value) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (!store.canModifyApplication.value) {
      notifyError(t("This application cannot be modified in its current stage"));
      router.replace(summaryRoute());
      return;
    }

    if (isEdit.value) {
      const administrators = Array.isArray(
        store.payload.center_administrators.value
      )
        ? store.payload.center_administrators.value
        : [];

      const administrator = administrators.find(
        (item) => Number(item?.id) === profileId.value
      );

      if (!administrator) {
        notifyError(t("Administrator not found"));
        router.replace(summaryRoute());
        return;
      }

      resetForm(administrator);
    }

    setHeading({
      title: pageTitle.value,
      visible: true,
    });
  } catch (error) {
    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "AdministratorUpsert.initialize",
      fallback: "Failed to load administrator form",
      meta: {
        appId: appId.value,
        profileId: profileId.value,
      },
    });
    notifyError(t("Failed to load administrator form"));
    router.replace({
      name: "applications-index",
      params: { locale: locale.value },
    });
  }
}

async function onSubmit({ formData }) {
  if (saving.value) {
    return;
  }

  try {
    await withLoading("dive-center-administrator-upsert-saving", async () => {
      const payload = serializeDiveCenterAdministratorFormData(formData);
      const endpoint = isEdit.value
        ? DIVING_CENTERS_ADMIN_UPDATE_PROFILE + profileId.value
        : DIVING_CENTERS_ADMIN_CREATE_PROFILE + appId.value;

      await apiPost(endpoint, payload, {
        context: "AdministratorUpsert.onSubmit",
      });
    });

    await store.loadApplication(appId.value, {
      withPayload: true,
      forceReload: true,
    });

    notifySuccess(t("Administrator saved successfully"));
    router.push(summaryRoute());
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

    if (error?.status >= 500) {
      router.replace({ name: "server-error", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "AdministratorUpsert.onSubmit",
      fallback: "Failed to save administrator",
      meta: {
        appId: appId.value,
        profileId: profileId.value,
        isEdit: isEdit.value,
      },
    });
    notifyError(t("Failed to save administrator"));
  }
}

watch(
  () => [route.params.appId, route.params.profileId],
  async () => {
    await withLoading(
      "dive-center-administrator-upsert-initializing",
      initialize
    );
  },
  { immediate: true }
);
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
          {{ pageTitle }}
        </h1>
      </div>

      <MasterForm
        ref="mfRef"
        :schema="schema"
        :initialValues="initialValues"
        @submit="onSubmit"
        @validity="onValidity"
        @field-change="onFieldChange"
      />

      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <router-link
          :to="summaryRoute()"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ t("Cancel") }}</span>
        </router-link>

        <AppButton
          variant="primary"
          icon="pi pi-check"
          :disabled="!canSubmit"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ submitLabel }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <span class="lds-dual-ring"></span>{{ t("Saving") }}
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>
