<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";

import AppButton from "@/v3/components/ui/AppButton.vue";
import MasterForm from "@/v3/components/Forms/MasterForm.vue";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import {
  ERROR_TYPES,
  apiDelete,
  apiPost,
} from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_ADMIN_CANCEL,
  DIVING_CENTERS_ADMIN_CREATE_PROFILE,
  DIVING_CENTERS_ADMIN_RESTORE,
  DIVING_CENTERS_ADMIN_UPDATE_PROFILE,
} from "@/v3/config/apiEndpoints.js";
import {
  makeDiveCenterAdministratorSchema,
  normalizeDiveCenterAdministratorInitialValues,
  serializeDiveCenterAdministratorFormData,
} from "@/v3/schema/applications/diveCenterAdministrator.js";

const WEB_URL = import.meta.env.VITE_WEB_BASE_URL || "";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();

const store = useApplicationStore();
const { setHeading } = usePageHeading();
const { success: notifySuccess, error: notifyError } = useNotification();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();

const mfRef = ref(null);
const currentRoles = ref([]);
const schema = ref(
  makeDiveCenterAdministratorSchema({
    isManagerSelected: () => currentRoles.value.includes("Manager"),
  })
);
const schemaKey = ref(0);
const initialValues = ref(
  normalizeDiveCenterAdministratorInitialValues({}, WEB_URL)
);
const formIsValid = ref(false);
const formVisible = ref(false);
const editingAdministratorId = ref(null);

const appId = Number(route.params.appId) || Number(route.params.id) || null;
const initializing = computed(() =>
  isLoadingKey("dive-center-administrators-edit-initializing")
);
const saving = computed(() =>
  isLoadingKey("dive-center-administrators-edit-saving")
);
const canSubmit = computed(() => formIsValid.value);
const administrators = computed(() =>
  Array.isArray(store.payload.center_administrators.value)
    ? store.payload.center_administrators.value
    : []
);

const sortedAdministrators = computed(() =>
  [...administrators.value].sort((left, right) => {
    const leftOwner = Array.isArray(left?.roles) && left.roles.includes("Owner");
    const rightOwner =
      Array.isArray(right?.roles) && right.roles.includes("Owner");

    if (leftOwner !== rightOwner) {
      return leftOwner ? -1 : 1;
    }

    return String(left?.name_en || left?.name_ar || "").localeCompare(
      String(right?.name_en || right?.name_ar || "")
    );
  })
);

function statusText(administrator) {
  if (String(administrator?.new_status || "") === "Canceled") {
    return t("Cancellation will be processed after the application is approved");
  }

  if (String(administrator?.status || "") !== "Approved") {
    return t("Activation will be processed after the application is approved");
  }

  return t("Approved");
}

function statusClass(administrator) {
  if (String(administrator?.new_status || "") === "Canceled") {
    return "tw-bg-amber-50 tw-text-amber-700";
  }

  if (String(administrator?.status || "") !== "Approved") {
    return "tw-bg-blue-50 tw-text-blue-700";
  }

  return "tw-bg-green-50 tw-text-green-700";
}

function fileUrl(path) {
  const normalizedPath = String(path || "").trim();
  if (!normalizedPath) {
    return "";
  }

  if (/^https?:\/\//.test(normalizedPath)) {
    return normalizedPath;
  }

  return `${WEB_URL}${normalizedPath}`;
}

function resetForm(administrator = null) {
  editingAdministratorId.value = administrator?.id || null;
  initialValues.value = normalizeDiveCenterAdministratorInitialValues(
    administrator || {},
    WEB_URL
  );
  currentRoles.value = Array.isArray(initialValues.value.roles)
    ? [...initialValues.value.roles]
    : [];
  schemaKey.value += 1;
  formIsValid.value = false;
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

function startAddAdministrator() {
  resetForm(null);
  formVisible.value = true;
}

function startEditAdministrator(administrator) {
  resetForm(administrator);
  formVisible.value = true;
}

function closeForm() {
  formVisible.value = false;
  resetForm(null);
}

async function reloadAdministrators() {
  await store.loadApplication(appId, {
    withPayload: true,
    payloadKeys: ["center_administrators"],
    forceReload: true,
  });
}

async function initialize() {
  try {
    if (!appId) {
      notifyError(t("Application ID is missing"));
      return;
    }

    const currentApplication = store.application.value;
    const appLoaded = Number(currentApplication?.id) === appId;
    const administratorsLoaded = store.isPayloadKeyLoaded("center_administrators");

    if (!appLoaded || !administratorsLoaded) {
      await store.loadApplication(appId, {
        withPayload: true,
        payloadKeys: ["center_administrators"],
        forceReload: !administratorsLoaded,
      });
    }

    if (!store.application.value) {
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

    setHeading({
      title: "Update Administrators",
      visible: true,
    });

    if (administrators.value.length === 0) {
      startAddAdministrator();
    }
  } catch (error) {
    if (error?.status === 404) {
      router.replace({ name: "error-404", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "UpdateAdministrators.initialize",
      fallback: "Failed to load administrators",
      meta: { appId },
    });
    notifyError(t("Failed to load administrators"));
    router.replace({
      name: "applications-index",
      params: { locale: locale.value },
    });
  }
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

async function onSubmit({ formData }) {
  try {
    await withLoading("dive-center-administrators-edit-saving", async () => {
      const payload = serializeDiveCenterAdministratorFormData(formData);
      const endpoint = editingAdministratorId.value
        ? DIVING_CENTERS_ADMIN_UPDATE_PROFILE + editingAdministratorId.value
        : DIVING_CENTERS_ADMIN_CREATE_PROFILE + appId;

      await apiPost(endpoint, payload, {
        context: "UpdateAdministrators.onSubmit",
      });
    });

    await reloadAdministrators();
    notifySuccess(t("Administrator updated successfully"));
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

    if (error?.status >= 500) {
      router.replace({ name: "server-error", params: { locale: locale.value } });
      return;
    }

    capture(error, {
      context: "UpdateAdministrators.onSubmit",
      fallback: "Failed to save administrator",
      meta: { appId, editingAdministratorId: editingAdministratorId.value },
    });
    notifyError(t("Failed to save administrator"));
  }
}

async function handleCancelAdministrator(administrator) {
  return withLoading(`dive-center-administrator-cancel-${administrator.id}`, async () => {
    try {
      await apiDelete(DIVING_CENTERS_ADMIN_CANCEL + administrator.id, {
        context: "UpdateAdministrators.handleCancelAdministrator",
      });

      await reloadAdministrators();
      notifySuccess(t("Administrator updated successfully"));
      router.push({
        name: "app-summary",
        params: { appId, locale: locale.value },
      });
    } catch (error) {
      if (error?.status === 404) {
        router.replace({ name: "error-404", params: { locale: locale.value } });
        return;
      }

      capture(error, {
        context: "UpdateAdministrators.handleCancelAdministrator",
        fallback: "Failed to update administrator",
        meta: { appId, administratorId: administrator.id },
      });
      notifyError(t("Failed to update administrator"));
    }
  });
}

async function handleRestoreAdministrator(administrator) {
  return withLoading(`dive-center-administrator-restore-${administrator.id}`, async () => {
    try {
      await apiPost(
        DIVING_CENTERS_ADMIN_RESTORE + administrator.id,
        {},
        {
          context: "UpdateAdministrators.handleRestoreAdministrator",
        }
      );

      await reloadAdministrators();
      notifySuccess(t("Administrator updated successfully"));
      router.push({
        name: "app-summary",
        params: { appId, locale: locale.value },
      });
    } catch (error) {
      if (error?.status === 404) {
        router.replace({ name: "error-404", params: { locale: locale.value } });
        return;
      }

      capture(error, {
        context: "UpdateAdministrators.handleRestoreAdministrator",
        fallback: "Failed to update administrator",
        meta: { appId, administratorId: administrator.id },
      });
      notifyError(t("Failed to update administrator"));
    }
  });
}

function confirmCancelAdministrator(administrator) {
  confirm.require({
    group: "dive-center-administrators",
    message: `${administrator?.name_en || administrator?.name_ar || ""} ${t("will be canceled after the application is approved")}`,
    header: t("Confirm"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("Confirm"),
    rejectLabel: t("Cancel"),
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await handleCancelAdministrator(administrator);
      } finally {
        confirm.close();
      }
    },
    reject: () => confirm.close(),
  });
}

onMounted(async () => {
  await withLoading("dive-center-administrators-edit-initializing", initialize);
});
</script>

<template>
  <div class="tw-pt-10 tw-pb-24 tw-px-4">
    <div v-if="initializing" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true"></i>
    </div>

    <section
      v-else
      class="tw-max-w-5xl tw-mx-auto tw-space-y-6"
    >
      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6">
        <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4">
          <div>
            <h1 class="tw-text-2xl tw-font-bold tw-text-slate-800">
              {{ t("Update Administrators") }}
            </h1>
            <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
              {{ t("Add or update owner and manager administrators for this application") }}
            </p>
          </div>

          <div class="tw-flex tw-items-center tw-gap-3">
            <RouterLink
              :to="{ name: 'app-summary', params: { appId, locale } }"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
            >
              <i class="pi pi-arrow-left" aria-hidden="true"></i>
              <span>{{ t("Back") }}</span>
            </RouterLink>

            <AppButton
              variant="secondary"
              icon="pi pi-plus"
              @click="startAddAdministrator"
            >
              {{ t("Add Administrator") }}
            </AppButton>
          </div>
        </div>
      </div>

      <div
        v-for="administrator in sortedAdministrators"
        :key="administrator.id"
        class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
      >
        <div class="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-4">
          <div>
            <div class="tw-font-semibold tw-text-slate-800">
              {{ administrator.name_en || administrator.name_ar || "-" }}
            </div>
            <div class="tw-text-sm tw-text-slate-500">
              {{ administrator.name_ar || "-" }}
            </div>
          </div>

          <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
            <div
              :class="statusClass(administrator)"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-medium"
            >
              {{ statusText(administrator) }}
            </div>

            <button
              v-if="String(administrator.new_status || '') !== 'Canceled'"
              type="button"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
              @click="startEditAdministrator(administrator)"
            >
              <i class="pi pi-pencil" aria-hidden="true"></i>
              <span>{{ t("Edit") }}</span>
            </button>

            <button
              v-if="String(administrator.new_status || '') !== 'Canceled'"
              type="button"
              :disabled="isLoadingKey(`dive-center-administrator-cancel-${administrator.id}`)"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
              @click="confirmCancelAdministrator(administrator)"
            >
              <i
                :class="isLoadingKey(`dive-center-administrator-cancel-${administrator.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
                aria-hidden="true"
              ></i>
              <span>{{ t("Cancel") }}</span>
            </button>

            <button
              v-else
              type="button"
              :disabled="isLoadingKey(`dive-center-administrator-restore-${administrator.id}`)"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-green-600 tw-transition disabled:tw-opacity-50"
              @click="handleRestoreAdministrator(administrator)"
            >
              <i
                :class="isLoadingKey(`dive-center-administrator-restore-${administrator.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-undo'"
                aria-hidden="true"
              ></i>
              <span>{{ t("Restore") }}</span>
            </button>
          </div>
        </div>

        <div class="tw-mt-4 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
          <div>
            <div class="tw-text-xs tw-text-slate-500">{{ t("Administrator Role") }}</div>
            <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
              <span
                v-for="role in administrator.roles || []"
                :key="role"
                class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-px-3 tw-py-1 tw-text-sm tw-text-slate-700"
              >
                {{ t(role) }}
              </span>
            </div>
          </div>

          <div v-if="administrator.identity_number">
            <div class="tw-text-xs tw-text-slate-500">{{ t("Identity Number") }}</div>
            <div class="tw-font-medium">{{ administrator.identity_number }}</div>
          </div>

          <div v-if="administrator.mobile">
            <div class="tw-text-xs tw-text-slate-500">{{ t("Phone") }}</div>
            <div class="tw-font-medium">{{ administrator.mobile }}</div>
          </div>

          <div v-if="administrator.email">
            <div class="tw-text-xs tw-text-slate-500">{{ t("Email") }}</div>
            <div class="tw-font-medium">{{ administrator.email }}</div>
          </div>

          <div
            v-if="Array.isArray(administrator.languages) && administrator.languages.length > 0"
            class="sm:tw-col-span-2"
          >
            <div class="tw-text-xs tw-text-slate-500">{{ t("Languages") }}</div>
            <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
              <span
                v-for="language in administrator.languages"
                :key="language"
                class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-blue-50 tw-px-3 tw-py-1 tw-text-sm tw-text-blue-700"
              >
                {{ language }}
              </span>
            </div>
          </div>

          <div v-if="administrator.identity_link">
            <div class="tw-text-xs tw-text-slate-500">{{ t("Identity Copy") }}</div>
            <a
              :href="fileUrl(administrator.identity_link)"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-text-primary hover:tw-underline"
            >
              <i class="pi pi-external-link" aria-hidden="true"></i>
              <span>{{ t("View") }}</span>
            </a>
          </div>

          <div v-if="administrator.cv_link && (administrator.roles || []).includes('Manager')">
            <div class="tw-text-xs tw-text-slate-500">{{ t("CV") }}</div>
            <a
              :href="fileUrl(administrator.cv_link)"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-text-primary hover:tw-underline"
            >
              <i class="pi pi-external-link" aria-hidden="true"></i>
              <span>{{ t("View") }}</span>
            </a>
          </div>
        </div>
      </div>

      <section
        v-if="formVisible"
        class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-[0_8px_30px_rgba(3,87,150,.06)] tw-p-4 sm:tw-p-6 md:tw-p-8"
      >
        <div class="tw-mb-6">
          <h2 class="tw-text-xl tw-font-bold tw-text-slate-800">
            {{ editingAdministratorId ? t("Update Administrator") : t("Add Administrator") }}
          </h2>
          <p class="tw-text-sm tw-text-slate-600 tw-mt-1">
            {{ t("Provide the administrator details exactly as they should appear on the application") }}
          </p>
        </div>

        <MasterForm
          :key="schemaKey"
          ref="mfRef"
          :schema="schema"
          :initialValues="initialValues"
          @submit="onSubmit"
          @validity="onValidity"
          @field-change="onFieldChange"
        />

        <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-4 tw-items-center">
          <button
            type="button"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-600 hover:tw-text-slate-900 tw-transition tw-font-medium"
            @click="closeForm"
          >
            {{ t("Cancel") }}
          </button>

          <AppButton
            variant="primary"
            icon="pi pi-check"
            :disabled="saving || !canSubmit"
            @click="submitProgrammatically"
          >
            <span v-if="!saving">
              {{ editingAdministratorId ? t("Save Changes") : t("Add Administrator") }}
            </span>
            <span v-else class="tw-inline-flex tw-items-center tw-gap-2">
              <span class="lds-dual-ring"></span>{{ t("Saving") }}
            </span>
          </AppButton>
        </div>
      </section>

      <ConfirmDialog
        group="dive-center-administrators"
        appendTo="body"
        :closable="false"
        :draggable="false"
        :reject-class="'tw-bg-white tw-text-gray-700 tw-border tw-border-gray-300'"
      />
    </section>
  </div>
</template>
