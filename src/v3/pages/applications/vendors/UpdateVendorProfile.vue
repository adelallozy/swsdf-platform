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
  GET_REGIONS_CITIES,
  VENDORS_APPS_GET_REGISTRATION_OPTIONS,
  VENDORS_APPS_UPDATE_PROFILE,
} from "@/v3/config/apiEndpoints.js";
import {
  makeVendorProfileSchema,
  serializeVendorProfile,
} from "@/v3/schema/applications/vendorProfile.js";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const store = useApplicationStore();
const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

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
const services = ref([]);
const formIsValid = ref(false);

const appId = Number(route.params.appId) || Number(route.params.id) || null;
const initializing = computed(() =>
  isLoadingKey("vendor-profile-edit-initializing")
);
const saving = computed(() => isLoadingKey("vendor-profile-edit-saving"));
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

function resolveRegionIdFromProfile(profile) {
  const cityId = profile?.city_id;
  if (!cityId) {
    return null;
  }

  const city = cities.value.find((c) => Number(c.id) === Number(cityId));
  return city ? city.region_id : null;
}

async function loadServices() {
  try {
    const response = await apiGet(VENDORS_APPS_GET_REGISTRATION_OPTIONS);
    const serviceList = Array.isArray(response?.services)
      ? response.services
      : [];

    services.value = serviceList;

    const displayField = locale.value === "ar" ? "name_ar" : "name_en";

    formOptions.value.services = serviceList.map((service) => ({
      id: service.id,
      name: service[displayField],
    }));
  } catch (error) {
    formOptions.value.services = [];
    capture(error, {
      context: "UpdateVendorProfile.loadServices",
      fallback: "Failed to load vendor services",
      meta: {},
    });
  }
}

async function initialize() {
  try {
    if (!appId) {
      notifyError(t("Application ID is missing"));
      return;
    }

    const currentApplication = store.application.value;
    const appLoaded = Number(currentApplication?.id) === appId;
    const vendorProfileLoaded = store.isPayloadKeyLoaded("vendor_profile");

    const requests = [apiGet(GET_REGIONS_CITIES), loadServices()];

    if (!appLoaded || !vendorProfileLoaded) {
      requests.push(
        store.loadApplication(appId, {
          withPayload: true,
          payloadKeys: ["vendor_profile"],
          forceReload: !vendorProfileLoaded,
        })
      );
    }

    const [addressResponse] = await Promise.all(requests);

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

    if (!store.application.value) {
      notifyError(t("Application not found"));
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (!store.canModifyApplication.value) {
      notifyError(
        t("This application cannot be modified in its current stage")
      );
      router.replace({
        name: "app-summary",
        params: { appId, locale: locale.value },
      });
      return;
    }

    const vendorProfile = store.payload.vendor_profile.value;

    if (vendorProfile) {
      initialValues.value = serializeVendorProfile(vendorProfile);
      const regionId = resolveRegionIdFromProfile(vendorProfile);
      if (regionId) {
        mfRef.value?.setFieldValue?.("region_id", regionId);
        filterCitiesByRegion(regionId);
      }
    } else {
      initialValues.value = serializeVendorProfile({});
    }

    setHeading({
      title: t("Update Vendor Profile"),
      visible: true,
    });
  } catch (error) {
    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "UpdateVendorProfile.initialize",
      fallback: "Failed to load vendor profile",
      meta: { appId },
    });
    notifyError(t("Failed to load vendor profile"));
    router.replace({
      name: "app-summary",
      params: { appId, locale: locale.value },
    });
  }
}

async function onSubmit({ formData }) {
  try {
    await withLoading("vendor-profile-edit-saving", async () => {
      const payload = {
        vendor_profile: serializeVendorProfile(formData),
      };
      await apiPost(VENDORS_APPS_UPDATE_PROFILE + appId, payload);
    });

    notifySuccess(t("Vendor profile saved successfully"));
    router.push({
      name: "app-summary",
      params: { appId, locale: locale.value },
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

    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    if (error?.status === 403) {
      notifyError(
        t("This application cannot be modified in its current stage")
      );
      return;
    }

    capture(error, {
      context: "UpdateVendorProfile.onSubmit",
      fallback: "Failed to save vendor profile",
      meta: { appId, formData },
    });
    notifyError(t("Failed to save vendor profile"));
  }
}

onMounted(async () => {
  await withLoading("vendor-profile-edit-initializing", initialize);
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
          {{ t("Update Vendor Profile") }}
        </h1>
        <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
          {{
            t("Review and update the vendor information for this application")
          }}
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
