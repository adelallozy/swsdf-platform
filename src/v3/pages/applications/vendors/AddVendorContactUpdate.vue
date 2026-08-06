<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import AppButton from "@/v3/components/ui/AppButton.vue";
import MasterForm from "@/v3/components/Forms/MasterForm.vue";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import { apiPost } from "@/v3/services/httpClient.js";
import { VENDORS_APPS_ADD_CONTACT_UPDATE } from "@/v3/config/apiEndpoints.js";
import {
  makeVendorContactSchema,
  serializeVendorContact,
} from "@/v3/schema/applications/vendorContact.js";

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const store = useApplicationStore();
const { withLoading, isLoadingKey } = useLoading();
const { capture } = useErrorHandler();
const { success, error: notifyError } = useNotification();
const { setHeading } = usePageHeading();
const formRef = ref(null);
const schema = ref(makeVendorContactSchema());
const valid = ref(false);
const appId = Number(route.params.appId);

async function initialize() {
  await store.loadApplication(appId, { withPayload: true, forceReload: true });
  if (
    store.application.value?.target !== "Vendors" ||
    !store.canModifyApplication.value
  ) {
    router.replace({
      name: "app-summary",
      params: { locale: locale.value, appId },
    });
    return;
  }

  setHeading({ title: "Add Contact", visible: true });
}

async function submit({ formData }) {
  try {
    await withLoading("vendor-contact-update-saving", () =>
      apiPost(
        `${VENDORS_APPS_ADD_CONTACT_UPDATE}${appId}`,
        serializeVendorContact(formData)
      )
    );
    success(t("Contact saved"));
    router.push({
      name: "app-summary",
      params: { locale: locale.value, appId },
    });
  } catch (error) {
    if (error?.status === 422) {
      formRef.value?.applyServerErrors?.(
        error.validationErrors || error.payload?.errors || {}
      );
      return;
    }
    capture(error, {
      context: "AddVendorContactUpdate.submit",
      fallback: "Failed to save contact",
    });
    notifyError(t("Failed to save contact"));
  }
}

function onValidity({ isValid }) {
  valid.value = isValid;
}

onMounted(() => withLoading("vendor-contact-update-loading", initialize));
</script>

<template>
  <div class="tw-px-4 tw-py-10">
    <div
      v-if="isLoadingKey('vendor-contact-update-loading')"
      class="tw-flex tw-justify-center tw-py-16"
    >
      <i
        class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary"
        aria-hidden="true"
      ></i>
    </div>
    <section
      v-else
      class="tw-mx-auto tw-max-w-3xl tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5 sm:tw-p-8"
    >
      <MasterForm
        ref="formRef"
        :schema="schema"
        @submit="submit"
        @validity="onValidity"
      />
      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-3">
        <AppButton variant="secondary" @click="router.back()">{{
          t("Cancel")
        }}</AppButton>
        <AppButton
          :disabled="!valid || isLoadingKey('vendor-contact-update-saving')"
          @click="formRef?.submitForm?.()"
        >
          {{ t("Add Contact") }}
        </AppButton>
      </div>
    </section>
  </div>
</template>
