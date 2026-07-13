<script setup>
import { computed, onBeforeUnmount, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";

import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { apiDelete, apiPost } from "@/v3/services/httpClient.js";
import {
  DIVING_CENTERS_ADMIN_CANCEL,
  DIVING_CENTERS_ADMIN_RESTORE,
} from "@/v3/config/apiEndpoints.js";
import { buildFileUrl } from "@/v3/utils/fileUrl.js";

const { t, locale } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useApplicationStore();
const { capture } = useErrorHandler();
const { withLoading, isLoadingKey } = useLoading();
const { error: notifyError } = useNotification();

const application = computed(() => store.application.value);
const canEdit = computed(() => store.canModifyApplication.value);
const administrators = computed(() =>
  Array.isArray(store.payload.center_administrators.value)
    ? store.payload.center_administrators.value
    : []
);

const visibleAdministrators = computed(() =>
  administrators.value.filter(
    (administrator) => String(administrator?.new_status || "") !== "Canceled"
  )
);

const hasOwner = computed(() =>
  visibleAdministrators.value.some((administrator) =>
    Array.isArray(administrator?.roles)
      ? administrator.roles.includes("Owner")
      : false
  )
);

const hasManager = computed(() =>
  visibleAdministrators.value.some((administrator) =>
    Array.isArray(administrator?.roles)
      ? administrator.roles.includes("Manager")
      : false
  )
);

const visibleComponent = computed(() => {
  if (canEdit.value) {
    return true;
  }

  return administrators.value.length > 0;
});

const addRoute = computed(() => ({
  name: "dive-center-administrator-add",
  params: {
    appId: application.value?.id,
    locale: locale.value,
  },
}));

const validationErrors = computed(() => {
  if (!canEdit.value) {
    return [];
  }

  const errors = [];

  if (!hasOwner.value) {
    errors.push(t("At least one owner administrator is required"));
  }

  if (!hasManager.value) {
    errors.push(t("At least one manager administrator is required"));
  }

  return errors;
});

function normalizedStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function isPendingCancellation(administrator) {
  return normalizedStatus(administrator?.new_status) === "canceled";
}

function isActiveAdministrator(administrator) {
  return (
    normalizedStatus(administrator?.status) === "approved" &&
    !isPendingCancellation(administrator)
  );
}

function canShowEdit(administrator) {
  return canEdit.value && !isPendingCancellation(administrator);
}

function canShowRemove(administrator) {
  return canEdit.value && Boolean(administrator?.id) && !isPendingCancellation(administrator);
}

function canShowRestore(administrator) {
  return canEdit.value && Boolean(administrator?.id) && isPendingCancellation(administrator);
}

function sortWeight(administrator) {
  if (isActiveAdministrator(administrator)) {
    return 0;
  }

  if (isPendingCancellation(administrator)) {
    return 2;
  }

  return 1;
}

const sortedAdministrators = computed(() =>
  [...administrators.value].sort((left, right) => {
    const leftWeight = sortWeight(left);
    const rightWeight = sortWeight(right);

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

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
  if (isPendingCancellation(administrator)) {
    return t("Cancellation will be processed after the application is approved");
  }

  if (isActiveAdministrator(administrator)) {
    return t("Active");
  }

  if (normalizedStatus(administrator?.status) !== "approved") {
    return t("Activation will be processed after the application is approved");
  }

  return t("Active");
}

function statusClass(administrator) {
  if (isPendingCancellation(administrator)) {
    return "tw-bg-amber-50 tw-text-amber-700";
  }

  if (!isActiveAdministrator(administrator)) {
    return "tw-bg-blue-50 tw-text-blue-700";
  }

  return "tw-bg-green-50 tw-text-green-700";
}

function fileUrl(path) {
  return buildFileUrl(path);
}

async function reloadApplication() {
  if (!application.value?.id) {
    return;
  }

  await store.loadApplication(application.value.id, {
    withPayload: true,
    forceReload: true,
  });
}

async function handleRemoveAdministrator(administrator) {
  return withLoading(
    `dive-center-administrator-removing-${administrator.id}`,
    async () => {
      try {
        await apiDelete(DIVING_CENTERS_ADMIN_CANCEL + administrator.id, {
          context: "DivingCenterAdministratorsCard.handleRemoveAdministrator",
        });

        await reloadApplication();
      } catch (error) {
        capture(error, {
          context: "DivingCenterAdministratorsCard.handleRemoveAdministrator",
          fallback: "Failed to update administrator",
          meta: {
            appId: application.value?.id,
            administratorId: administrator.id,
          },
        });
        notifyError(t("Please try again"));
      }
    }
  );
}

async function handleRestoreAdministrator(administrator) {
  return withLoading(
    `dive-center-administrator-restoring-${administrator.id}`,
    async () => {
      try {
        await apiPost(
          DIVING_CENTERS_ADMIN_RESTORE + administrator.id,
          {},
          {
            context: "DivingCenterAdministratorsCard.handleRestoreAdministrator",
          }
        );

        await reloadApplication();
      } catch (error) {
        capture(error, {
          context: "DivingCenterAdministratorsCard.handleRestoreAdministrator",
          fallback: "Failed to update administrator",
          meta: {
            appId: application.value?.id,
            administratorId: administrator.id,
          },
        });
        notifyError(t("Please try again"));
      }
    }
  );
}

function showRemoveAdministratorConfirmation(administrator) {
  confirm.require({
    group: "dive-center-administrators-summary",
    message: `${
      administrator?.name_en || administrator?.name_ar
        ? `"${administrator.name_en || administrator.name_ar}" - `
        : ""
    }${t("Remove this administrator?")}`,
    header: t("Confirm"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("Remove"),
    rejectLabel: t("Cancel"),
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await handleRemoveAdministrator(administrator);
      } finally {
        confirm.close();
      }
    },
    reject: () => confirm.close(),
  });
}

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError("center_administrators", errors);
    } else {
      store.deleteStepError("center_administrators");
    }
  },
  { immediate: true }
);

function administratorEditRoute(administrator) {
  return {
    name: "dive-center-administrator-edit",
    params: {
      appId: application.value?.id,
      profileId: administrator?.id,
      locale: locale.value,
    },
  };
}

function navigateToAddAdministrator() {
  router.push(addRoute.value);
}

watch(
  canEdit,
  (editable) => {
    if (editable) {
      store.registerStepPrimaryAction(
        "center_administrators",
        navigateToAddAdministrator
      );
      return;
    }

    store.unregisterStepPrimaryAction("center_administrators");
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction("center_administrators");
  store.deleteStepError("center_administrators");
});
</script>

<template>
  <div v-if="visibleComponent" data-step-id="center_administrators">
    <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-users tw-text-primary" aria-hidden="true"></i>
        <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
          {{ t("Administrators") }}
        </span>
      </div>
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

    <div v-if="sortedAdministrators.length > 0" class="tw-space-y-4">
      <div
        v-for="(administrator, index) in sortedAdministrators"
        :key="administrator.id"
        class="tw-mb-2"
      >
        <div class="tw-mb-2 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
          <div class="tw-flex tw-items-center tw-gap-2">
            <i class="pi pi-user tw-text-primary" aria-hidden="true"></i>
            <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
              {{ t("Administrator") }} {{ index + 1 }}
            </span>
          </div>

          <div class="tw-flex tw-items-center tw-gap-2">
            <RouterLink
              v-if="canShowEdit(administrator)"
              :to="administratorEditRoute(administrator)"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-primary/10 tw-rounded-lg tw-transition"
            >
              <i class="pi pi-pencil" aria-hidden="true"></i>
              {{ t("Edit") }}
            </RouterLink>

            <button
              v-if="canShowRemove(administrator)"
              type="button"
              :disabled="isLoadingKey(`dive-center-administrator-removing-${administrator.id}`)"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-rounded-lg tw-transition disabled:tw-opacity-50"
              @click="showRemoveAdministratorConfirmation(administrator)"
            >
              <i
                :class="isLoadingKey(`dive-center-administrator-removing-${administrator.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
                aria-hidden="true"
              ></i>
              <span>{{ t("Remove") }}</span>
            </button>

            <button
              v-if="canShowRestore(administrator)"
              type="button"
              :disabled="isLoadingKey(`dive-center-administrator-restoring-${administrator.id}`)"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-green-600 tw-rounded-lg tw-transition disabled:tw-opacity-50"
              @click="handleRestoreAdministrator(administrator)"
            >
              <i
                :class="isLoadingKey(`dive-center-administrator-restoring-${administrator.id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-undo'"
                aria-hidden="true"
              ></i>
              <span>{{ t("Restore") }}</span>
            </button>

            <div
              :class="statusClass(administrator)"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-medium"
            >
              {{ statusText(administrator) }}
            </div>
          </div>
        </div>

        <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
          <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
            <div v-if="administrator.name_ar">
              <div class="tw-text-sm tw-text-slate-500">{{ t("Full Name (Arabic)") }}</div>
              <div class="tw-font-medium tw-text-slate-800">{{ administrator.name_ar }}</div>
            </div>

            <div v-if="administrator.name_en">
              <div class="tw-text-sm tw-text-slate-500">{{ t("Full Name (English)") }}</div>
              <div class="tw-font-medium tw-text-slate-800">{{ administrator.name_en }}</div>
            </div>

            <div>
              <div class="tw-text-sm tw-text-slate-500">{{ t("Administrator Role") }}</div>
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
              <div class="tw-text-sm tw-text-slate-500">{{ t("Identity Number") }}</div>
              <div class="tw-font-medium tw-text-slate-800">{{ administrator.identity_number }}</div>
            </div>

            <div v-if="administrator.mobile">
              <div class="tw-text-sm tw-text-slate-500">{{ t("Phone") }}</div>
              <div class="tw-font-medium tw-text-slate-800">{{ administrator.mobile }}</div>
            </div>

            <div v-if="administrator.email">
              <div class="tw-text-sm tw-text-slate-500">{{ t("Email") }}</div>
              <div class="tw-font-medium tw-text-slate-800">{{ administrator.email }}</div>
            </div>

            <div
              v-if="Array.isArray(administrator.languages) && administrator.languages.length > 0"
              class="sm:tw-col-span-2"
            >
              <div class="tw-text-sm tw-text-slate-500">{{ t("Languages") }}</div>
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
              <div class="tw-text-sm tw-text-slate-500">{{ t("Identity Copy") }}</div>
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

            <div
              v-if="administrator.cv_link && (administrator.roles || []).includes('Manager')"
            >
              <div class="tw-text-sm tw-text-slate-500">{{ t("CV") }}</div>
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
      </div>
    </div>

    <div v-if="canEdit" class="tw-space-y-3">
      <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-user-plus tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
            {{
              sortedAdministrators.length === 0
                ? t("Add Administrator")
                : t("Add Another Administrator")
            }}
          </span>
        </div>
      </div>

      <RouterLink
        :to="addRoute"
        class="tw-block tw-w-full tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 hover:tw-border-primary hover:tw-bg-blue-50 tw-shadow-sm tw-p-8 tw-transition"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
          <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-slate-100 hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center tw-transition">
            <i class="pi pi-plus tw-text-xl tw-text-slate-600 hover:tw-text-primary tw-transition" aria-hidden="true"></i>
          </div>
          <span class="tw-text-slate-600 hover:tw-text-primary tw-font-medium tw-transition">
            {{
              sortedAdministrators.length === 0
                ? t("Add Administrator")
                : t("Add Another Administrator")
            }}
          </span>
        </div>
      </RouterLink>
    </div>

    <div
      v-else-if="sortedAdministrators.length === 0"
      class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5"
    >
      <div class="tw-text-center tw-py-8 tw-text-slate-500">
        <i class="pi pi-users tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p>{{ t("No administrators added yet") }}</p>
      </div>
    </div>

    <ConfirmDialog
      group="dive-center-administrators-summary"
      appendTo="body"
      :closable="false"
      :draggable="false"
      :reject-class="'tw-bg-white tw-text-gray-700 tw-border tw-border-gray-300'"
    />
  </div>
</template>
