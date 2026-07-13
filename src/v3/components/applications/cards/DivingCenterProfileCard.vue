<template>
  <div v-if="visibleComponent" data-step-id="center_profile">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-building tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">{{ t("Center Details") }}</span>
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

    <div v-if="centerProfile" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <div v-if="centerProfile.name_ar">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Center Name") }} {{ t("inArabic") }}</div>
          <div class="tw-font-medium">{{ centerProfile.name_ar }}</div>
        </div>

        <div v-if="centerProfile.name_en">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Center Name") }} {{ t("inEnglish") }}</div>
          <div class="tw-font-medium">{{ centerProfile.name_en }}</div>
        </div>

        <div v-if="centerProfile.cr_number">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Commercial Record") }}</div>
          <div class="tw-font-medium">{{ centerProfile.cr_number }}</div>
        </div>

        <div v-if="centerProfile.cr_expiry_on">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Commercial Record Expiration") }}</div>
          <div class="tw-font-medium">{{ centerProfile.cr_expiry_on }}</div>
        </div>

        <div v-if="centerProfile.email">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Email") }}</div>
          <div class="tw-font-medium">{{ centerProfile.email }}</div>
        </div>

        <div v-if="centerProfile.telephone">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Phone") }}</div>
          <div class="tw-font-medium">{{ centerProfile.telephone }}</div>
        </div>

        <div v-if="centerProfile.city_name">
          <div class="tw-text-xs tw-text-slate-500">{{ t("City") }}</div>
          <div class="tw-font-medium">{{ centerProfile.city_name }}</div>
        </div>

        <div v-if="centerProfile.region_name">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Region") }}</div>
          <div class="tw-font-medium">{{ centerProfile.region_name }}</div>
        </div>

        <div v-if="centerProfile.address" class="sm:tw-col-span-2">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Address") }}</div>
          <div class="tw-font-medium">{{ centerProfile.address }}</div>
        </div>

        <div v-if="centerProfile.website" class="sm:tw-col-span-2">
          <div class="tw-text-xs tw-text-slate-500">{{ t("Website") }}</div>
          <div class="tw-font-medium">{{ centerProfile.website }}</div>
        </div>
      </div>
    </div>

    <div v-else class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-text-center tw-py-8 tw-text-slate-500">
        <i class="pi pi-building tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p>{{ t("Diving center profile is not available yet.") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";

const { t, locale } = useI18n();
const router = useRouter();
const store = useApplicationStore();

const application = computed(() => store.application.value);
const centerProfile = computed(() => store.payload.center_profile.value);
const canEdit = computed(() => store.canModifyApplication.value);

const visibleComponent = computed(() => {
  if (canEdit.value) {
    return true;
  }

  return !!centerProfile.value;
});

const editRoute = computed(() => ({
  name: "dive-center-profile-edit",
  params: {
    appId: application.value?.id,
    locale: locale.value,
  },
}));

const validationErrors = computed(() => {
  const errors = [];

  if (!canEdit.value) {
    return errors;
  }

  if (!centerProfile.value) {
    errors.push("Diving center profile is required.");
  }

  return errors;
});

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError("center_profile", errors);
    } else {
      store.deleteStepError("center_profile");
    }
  },
  { immediate: true }
);

function editCenterProfile() {
  router.push(editRoute.value);
}

watch(
  canEdit,
  (editable) => {
    if (editable) {
      store.registerStepPrimaryAction("center_profile", editCenterProfile);
      return;
    }

    store.unregisterStepPrimaryAction("center_profile");
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction("center_profile");
  store.deleteStepError("center_profile");
});
</script>
