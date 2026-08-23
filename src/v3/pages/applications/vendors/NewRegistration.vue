<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AppButton from "@/v3/components/ui/AppButton.vue";
import MasterForm from "@/v3/components/Forms/MasterForm.vue";

import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { ERROR_TYPES, apiGet, apiPost } from "@/v3/services/httpClient.js";

import {
  GET_REGIONS_CITIES,
  VENDORS_APPS_CREATE_REGISTRATION,
  VENDORS_APPS_GET_REGISTRATION_OPTIONS,
} from "@/v3/config/apiEndpoints.js";
import {
  makeVendorProfileSchema,
  serializeVendorProfile,
} from "@/v3/schema/applications/vendorProfile.js";
import {
  getConflictApplicationId,
  getConflictApplicationNotice,
} from "@/v3/utils/applicationWorkflow.js";

const { t, locale } = useI18n();
const router = useRouter();

const { setHeading } = usePageHeading();
const {
  success: notifySuccess,
  info: notifyInfo,
  error: notifyError,
} = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();
const store = useApplicationStore();

const mfRef = ref(null);
const schema = ref(makeVendorProfileSchema());
const formOptions = ref({
  region_id: [],
  city_id: [],
  services: [],
});
const initialValues = ref({});

const regions = ref([]);
const cities = ref([]);

const initializing = computed(() =>
  isLoadingKey("vendor-registration-initializing")
);
const saving = computed(() => isLoadingKey("vendor-registration-saving"));
const submitting = ref(false);
const formIsValid = ref(false);
const canSubmit = computed(() => formIsValid.value);

function onValidity({ isValid }) {
  formIsValid.value = isValid;
}

function submitProgrammatically() {
  if (saving.value || submitting.value) {
    return;
  }

  const isValid = mfRef.value?.validateForm?.();
  if (!isValid) {
    mfRef.value?.showErrors?.();
    return;
  }

  mfRef.value?.submitForm?.();
}

function filterCitiesByRegion(regionId) {
  const normalizedRegionId = Number(regionId);

  if (!normalizedRegionId) {
    formOptions.value.city_id = cities.value.map((city) => ({
      label: city.name,
      value: city.id,
      region_id: city.region_id,
    }));
    return;
  }

  formOptions.value.city_id = cities.value
    .filter((city) => Number(city.region_id) === normalizedRegionId)
    .map((city) => ({
      label: city.name,
      value: city.id,
      region_id: city.region_id,
    }));
}

function onFieldChange({ key, value }) {
  if (key !== "region_id") {
    return;
  }

  mfRef.value?.setFieldValue?.("city_id", null);
  filterCitiesByRegion(value);
}

async function loadRegistrationOptions() {
  try {
    const response = await apiGet(VENDORS_APPS_GET_REGISTRATION_OPTIONS);
    const services = Array.isArray(response?.services) ? response.services : [];

    const displayField = locale.value === "ar" ? "name_ar" : "name_en";

    formOptions.value.services = services.map((service) => ({
      id: service.id,
      name: service[displayField],
    }));
  } catch (error) {
    // The options endpoint may not be deployed yet. Render the form without
    // services rather than blocking the whole page; submission will be blocked
    // by validation until services are available.
    formOptions.value.services = [];
    capture(error, {
      context: "VendorNewRegistration.loadRegistrationOptions",
      fallback: "Failed to load vendor services",
      meta: {},
    });
  }
}

async function initialize() {
  try {
    const addressResponse = await apiGet(GET_REGIONS_CITIES);

    regions.value = Array.isArray(addressResponse?.regions)
      ? addressResponse.regions
      : [];
    cities.value = Array.isArray(addressResponse?.cities)
      ? addressResponse.cities
      : [];

    formOptions.value.region_id = regions.value.map((region) => ({
      label: region.name,
      value: region.id,
    }));
    filterCitiesByRegion(null);

    await loadRegistrationOptions();

    setHeading({
      title: "Vendor Registration",
      visible: true,
    });
  } catch (error) {
    capture(error, {
      context: "VendorNewRegistration.initialize",
      fallback: "Failed to initialize form",
      meta: {},
    });
    notifyError(t("Failed to load form"));
    router.replace({ name: "AppRoot" });
  }
}

async function onSubmit({ formData }) {
  if (saving.value || submitting.value) {
    return;
  }

  submitting.value = true;

  try {
    await withLoading("vendor-registration-saving", async () => {
      const payload = {
        vendor_profile: serializeVendorProfile(formData),
      };
      const response = await apiPost(
        VENDORS_APPS_CREATE_REGISTRATION,
        payload
      );

      const applicationId = response?.application?.id;
      if (!applicationId) {
        throw new Error("Application ID not returned from server");
      }

      await store.loadApplication(applicationId, {
        withPayload: true,
        applicationType: "Vendor Registration",
        forceReload: true,
      });

      notifySuccess(t("Application created successfully"));
      router.push({
        name: "vendor-contact-update-add",
        params: { appId: applicationId, locale: locale.value },
      });
    });
  } catch (error) {
    const validationErrors =
      error.validationErrors || error.payload?.errors || {};
    const hasFieldErrors = Object.keys(validationErrors).length > 0;

    if (
      error?.name === ERROR_TYPES.VALIDATION ||
      error?.status === 422 ||
      (error?.status === 409 && hasFieldErrors)
    ) {
      mfRef.value?.applyServerErrors?.(validationErrors);
      notifyError(t("Please fix the validation errors"));
      return;
    }

    if (error?.status === 409) {
      const applicationId = getConflictApplicationId(error);
      notifyInfo(t(getConflictApplicationNotice(error)), { life: 7000 });

      if (applicationId) {
        router.replace({
          name: "app-summary",
          params: { appId: applicationId, locale: locale.value },
        });
      } else {
        router.replace({
          name: "applications-index",
          params: { locale: locale.value },
        });
      }
      return;
    }

    capture(error, {
      context: "VendorNewRegistration.onSubmit",
      fallback: "Failed to create application",
      meta: {},
    });
    notifyError(t("Failed to create application"));
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await withLoading("vendor-registration-initializing", initialize);
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
          {{ t("Register a Vendor") }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{ t("Enter your company information to register as a vendor") }}
        </p>
      </div>

      <MasterForm
        ref="mfRef"
        :schema="schema"
        :formOptions="formOptions"
        :initialValues="initialValues"
        @submit="onSubmit"
        @validity="onValidity"
        @field-change="onFieldChange"
      />

      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
        <router-link
          :to="{ name: 'applications-index', params: { locale } }"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
        >
          <span>{{ t("Cancel") }}</span>
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
        </router-link>

        <AppButton
          variant="primary"
          icon="pi pi-check"
          :disabled="saving || submitting || !canSubmit"
          @click="submitProgrammatically"
        >
          <span v-if="!saving">{{ t("Next") }}</span>
          <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
            <span class="lds-dual-ring"></span>{{ t("Saving") }}
          </span>
        </AppButton>
      </div>
    </section>
  </div>
</template>
