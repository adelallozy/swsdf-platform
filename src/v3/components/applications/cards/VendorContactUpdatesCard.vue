<script setup>
import { computed, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { apiDelete, apiPost } from "@/v3/services/httpClient.js";
import {
  VENDORS_APPS_DEACTIVATE_CONTACT_UPDATE,
  VENDORS_APPS_REACTIVATE_CONTACT_UPDATE,
  VENDORS_APPS_DELETE_CONTACT_UPDATE,
} from "@/v3/config/apiEndpoints.js";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useNotification } from "@/v3/composables/useNotification.js";

const store = useApplicationStore();
const router = useRouter();
const { t, locale } = useI18n();
const { withLoading, isLoadingKey } = useLoading();
const { capture } = useErrorHandler();
const { success, error: notifyError } = useNotification();

const application = computed(() => store.application.value);
const canEdit = computed(() => store.canModifyApplication.value);
const contacts = computed(
  () => store.payload.vendor_contact_updates.value || []
);

const lc = (value) => (value || "").toLowerCase();
const isIncomplete = (contact) => !contact.completed_at;
const isNewAdd = (contact) =>
  lc(contact.status) === "unverified" && isIncomplete(contact);
const isExistingActive = (contact) =>
  lc(contact.status) === "active" &&
  lc(contact.new_status) === "active" &&
  isIncomplete(contact);
const isPendingDeactivate = (contact) =>
  lc(contact.new_status) === "inactive" && isIncomplete(contact);

const validationErrors = computed(() => {
  const errors = [];
  if (!contacts.value.some((contact) => lc(contact.new_status) === "active")) {
    errors.push(t("At least one contact person is required"));
  }
  return errors;
});

function displayStatus(contact) {
  const newStatus = lc(contact.new_status);
  const status = lc(contact.status);
  if (newStatus === "inactive" && status === "active") {
    return {
      label: t("Deactivation will be completed after application approval"),
      severity: "warn",
    };
  }
  if (status === "inactive") {
    return { label: t("Inactive"), severity: "danger" };
  }
  if (status === "unverified") {
    return { label: t("Unverified"), severity: "warn" };
  }
  if (status === "active") {
    return { label: t("Active"), severity: "success" };
  }
  return { label: "", severity: "info" };
}

function statusClass(contact) {
  const severity = displayStatus(contact).severity;
  if (severity === "warn") {
    return "tw-bg-amber-50 tw-text-amber-700";
  }
  if (severity === "success") {
    return "tw-bg-emerald-50 tw-text-emerald-700";
  }
  if (severity === "danger") {
    return "tw-bg-slate-100 tw-text-slate-600";
  }
  return "tw-bg-blue-50 tw-text-blue-700";
}

function addContact() {
  router.push({
    name: "vendor-contact-update-add",
    params: { locale: locale.value, appId: application.value.id },
  });
}

async function reload() {
  await store.loadApplication(application.value.id, {
    withPayload: true,
    forceReload: true,
  });
}

async function removeAction(contact) {
  const key = `vendor-contact-update-delete-${contact.id}`;
  try {
    await withLoading(key, () =>
      apiDelete(
        `${VENDORS_APPS_DELETE_CONTACT_UPDATE}${application.value.id}/${contact.id}`
      )
    );
    await reload();
    success(t("Contact removed"));
  } catch (error) {
    capture(error, {
      context: "VendorContactUpdatesCard.removeAction",
      fallback: "Failed to remove contact",
    });
    notifyError(t("Failed to remove contact"));
  }
}

async function deactivateContact(contact) {
  const key = `vendor-contact-update-deactivate-${contact.contact_id}`;
  try {
    await withLoading(key, () =>
      apiPost(
        `${VENDORS_APPS_DEACTIVATE_CONTACT_UPDATE}${application.value.id}/${contact.contact_id}`
      )
    );
    await reload();
  } catch (error) {
    capture(error, {
      context: "VendorContactUpdatesCard.deactivateContact",
      fallback: "Failed to request contact deactivation",
    });
    notifyError(t("Failed to request contact deactivation"));
  }
}

async function reactivateContact(contact) {
  const key = `vendor-contact-update-reactivate-${contact.contact_id}`;
  try {
    await withLoading(key, () =>
      apiPost(
        `${VENDORS_APPS_REACTIVATE_CONTACT_UPDATE}${application.value.id}/${contact.contact_id}`
      )
    );
    await reload();
    success(t("Deactivation cancelled"));
  } catch (error) {
    capture(error, {
      context: "VendorContactUpdatesCard.reactivateContact",
      fallback: "Failed to cancel contact deactivation",
    });
    notifyError(t("Failed to cancel contact deactivation"));
  }
}

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError("vendor_contact_updates", errors);
    } else {
      store.deleteStepError("vendor_contact_updates");
    }
  },
  { immediate: true }
);

store.registerStepPrimaryAction("vendor_contact_updates", addContact);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction("vendor_contact_updates");
  store.deleteStepError("vendor_contact_updates");
});
</script>

<template>
  <section class="tw-space-y-6" data-step-id="vendor_contact_updates">
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
      <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
      <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
        {{ t("Contact Persons") }}
      </span>
    </div>

    <div
      v-if="canEdit && validationErrors.length > 0"
      class="tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg"
    >
      <div class="tw-flex tw-gap-2">
        <i
          class="pi pi-info-circle tw-text-amber-600 tw-mt-0.5"
          aria-hidden="true"
        ></i>
        <p class="tw-text-sm tw-text-amber-900">
          {{ t("At least one contact person is required") }}
        </p>
      </div>
    </div>

    <article
      v-for="contact in contacts"
      :key="contact.id"
      class="tw-space-y-2"
    >
      <div
        class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3"
      >
        <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
          <h3 class="tw-font-bold tw-text-slate-700">{{ contact.name }}</h3>
          <span
            v-if="displayStatus(contact).label"
            class="tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold"
            :class="statusClass(contact)"
          >
            {{ displayStatus(contact).label }}
          </span>
        </div>

        <div
          v-if="canEdit && isIncomplete(contact)"
          class="tw-flex tw-flex-wrap tw-gap-2"
        >
          <button
            v-if="isNewAdd(contact)"
            type="button"
            :disabled="isLoadingKey(`vendor-contact-update-delete-${contact.id}`)"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
            @click="removeAction(contact)"
          >
            <i
              :class="
                isLoadingKey(`vendor-contact-update-delete-${contact.id}`)
                  ? 'pi pi-spinner tw-animate-spin'
                  : 'pi pi-trash'
              "
              aria-hidden="true"
            ></i>
            <span>{{ t("Remove") }}</span>
          </button>

          <button
            v-else-if="isExistingActive(contact)"
            type="button"
            :disabled="isLoadingKey(`vendor-contact-update-deactivate-${contact.contact_id}`)"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-red-600 hover:tw-text-red-700 tw-transition disabled:tw-opacity-50"
            @click="deactivateContact(contact)"
          >
            <i
              :class="
                isLoadingKey(`vendor-contact-update-deactivate-${contact.contact_id}`)
                  ? 'pi pi-spinner tw-animate-spin'
                  : 'pi pi-power-off'
              "
              aria-hidden="true"
            ></i>
            <span>{{ t("Deactivate") }}</span>
          </button>

          <button
            v-else-if="isPendingDeactivate(contact)"
            type="button"
            :disabled="isLoadingKey(`vendor-contact-update-reactivate-${contact.contact_id}`)"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-slate-800 tw-transition disabled:tw-opacity-50"
            @click="reactivateContact(contact)"
          >
            <i
              :class="
                isLoadingKey(`vendor-contact-update-reactivate-${contact.contact_id}`)
                  ? 'pi pi-spinner tw-animate-spin'
                  : 'pi pi-undo'
              "
              aria-hidden="true"
            ></i>
            <span>{{ t("Cancel deactivation") }}</span>
          </button>
        </div>
      </div>

      <div
        class="tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5"
      >
        <dl class="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
          <div v-for="field in ['position', 'email', 'mobile']" :key="field">
            <dt class="tw-text-xs tw-text-slate-500">
              {{
                t(
                  field === "mobile"
                    ? "Mobile Number"
                    : field[0].toUpperCase() + field.slice(1)
                )
              }}
            </dt>
            <dd class="tw-break-words tw-font-medium">
              {{ contact[field] || "-" }}
            </dd>
          </div>
        </dl>
      </div>
    </article>

    <div
      v-if="contacts.length === 0 && !canEdit"
      class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
    >
      <div class="tw-text-center tw-py-8">
        <i
          class="pi pi-users tw-text-4xl tw-text-slate-300 tw-mb-3"
          aria-hidden="true"
        ></i>
        <p class="tw-text-slate-500">{{ t("No contacts added yet") }}</p>
      </div>
    </div>

    <div v-if="canEdit">
      <button
        type="button"
        class="tw-block tw-w-full tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 hover:tw-border-primary hover:tw-bg-blue-50 tw-shadow-sm tw-p-8 tw-transition"
        @click="addContact"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
          <div
            class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-slate-100 hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center tw-transition"
          >
            <i
              class="pi pi-plus tw-text-xl tw-text-slate-600 hover:tw-text-primary tw-transition"
              aria-hidden="true"
            ></i>
          </div>
          <span
            class="tw-text-slate-600 hover:tw-text-primary tw-font-medium tw-transition"
          >
            {{ t("Add Contact") }}
          </span>
        </div>
      </button>
    </div>
  </section>
</template>
