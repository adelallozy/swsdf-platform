<template>
  <div v-if="visibleComponent" data-step-id="vendor_profile">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-building tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t("Vendor Details") }}</span>
      </div>

      <RouterLink
        v-if="canEdit"
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
          <i class="pi pi-exclamation-triangle tw-text-amber-600 tw-mt-0.5" aria-hidden="true"></i>
          <p class="tw-text-sm tw-text-amber-900">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-if="vendorProfile" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <div v-if="vendorProfile.name_ar">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Company Name") }} {{ t("inArabic") }}</div>
          <div class="tw-font-medium" dir="rtl">{{ vendorProfile.name_ar }}</div>
        </div>

        <div v-if="vendorProfile.name_en">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Company Name") }} {{ t("inEnglish") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.name_en }}</div>
        </div>

        <div v-if="vendorProfile.unified_number">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Unified Number") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.unified_number }}</div>
        </div>

        <div v-if="vendorProfile.cr_number">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Commercial Registration Number") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.cr_number }}</div>
        </div>

        <div v-if="vendorProfile.cr_expiry_date">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Commercial Registration Expiry Date") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.cr_expiry_date }}</div>
        </div>

        <div v-if="vendorProfile.vat_tin">
          <div class="tw-text-xs tw-text-slate-500">{{ t("VAT Registration Number") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.vat_tin }}</div>
        </div>

        <div v-if="vendorProfile.city_name">
          <div class="tw-text-xs tw-text-slate-500">{{ t("City") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.city_name }}</div>
        </div>

        <div v-if="vendorProfile.region_name">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Region") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.region_name }}</div>
        </div>

        <div v-if="vendorProfile.postal_code">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Postal Code") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.postal_code }}</div>
        </div>

        <div v-if="vendorProfile.email">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Email") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.email }}</div>
        </div>

        <div v-if="vendorProfile.telephone">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Phone") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.telephone }}</div>
        </div>

        <div v-if="vendorProfile.address" class="sm:tw-col-span-2">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Address") }}</div>
          <div class="tw-font-medium">{{ vendorProfile.address }}</div>
        </div>

        <div v-if="vendorProfile.website" class="sm:tw-col-span-2">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Website") }}</div>
          <div class="tw-font-medium">
            <a
              :href="websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-text-primary hover:tw-underline"
            >{{ vendorProfile.website }}</a>
          </div>
        </div>

        <div v-if="serviceLabels.length > 0" class="sm:tw-col-span-2 lg:tw-col-span-3">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Services") }}</div>
          <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
            <span
              v-for="label in serviceLabels"
              :key="label"
              class="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-bg-primary/10 tw-text-primary tw-text-sm"
            >{{ label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-text-center tw-py-8 tw-text-slate-500">
        <i class="pi pi-building tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p>{{ t("Vendor profile is not available yet.") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";

const { t, locale } = useI18n();
const store = useApplicationStore();

const application = computed(() => store.application.value);
const canEdit = computed(() => store.canModifyApplication.value);
const vendorProfile = computed(() => store.payload.vendor_profile.value);

const editRoute = computed(() => ({
  name: "vendor-profile-edit",
  params: {
    appId: application.value?.id,
    locale: locale.value,
  },
}));

const websiteUrl = computed(() => {
  const website = vendorProfile.value?.website?.trim();
  if (!website) {
    return "";
  }

  return website.includes("://") ? website : `https://${website}`;
});

const visibleComponent = computed(() => {
  if (canEdit.value) {
    return true;
  }

  return !!vendorProfile.value;
});

const serviceLabels = computed(() => {
  const services = vendorProfile.value?.services;

  if (!Array.isArray(services) || services.length === 0) {
    return [];
  }

  const displayField = locale.value === "ar" ? "name_ar" : "name_en";

  return services
    .map((service) => {
      if (service && typeof service === "object") {
        return service[displayField] || service.name_en || null;
      }

      return null;
    })
    .filter((label) => typeof label === "string" && label.length > 0);
});

const validationErrors = computed(() => {
  const errors = [];

  if (!canEdit.value) {
    return errors;
  }

  if (!vendorProfile.value) {
    errors.push("Vendor profile is required.");
  }

  return errors;
});

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError("vendor_profile", errors);
    } else {
      store.deleteStepError("vendor_profile");
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.deleteStepError("vendor_profile");
});
</script>
