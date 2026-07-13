<script setup>
import { computed, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";

import { useLoading } from "@/v3/composables/useLoading.js";
import { useApplicationStore } from "@/v3/composables/application/useApplicationStore.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import { apiDelete, apiPost } from "@/v3/services/httpClient.js";
import { requiresDiveCenterInternationalMembership } from "@/v3/schema/applications/diveCenterActivities.js";
import { buildFileUrl } from "@/v3/utils/fileUrl.js";
import {
  DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP,
  DIVING_CENTERS_APPS_REMOVE_INTERNATIONAL_MEMBERSHIP,
} from "@/v3/config/apiEndpoints.js";

const { t, locale } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const { withLoading, isLoadingKey } = useLoading();
const { capture } = useErrorHandler();
const { error: notifyError } = useNotification();
const store = useApplicationStore();

const application = computed(() => store.application.value);
const canEdit = computed(() => store.canModifyApplication.value);
const centerProfile = computed(() => store.payload.center_profile.value);
const activeMemberships = computed(
  () => store.payload.active_international_memberships.value || []
);
const applicationMemberships = computed(
  () => store.payload.application_international_memberships.value || []
);
const requiresMembership = computed(() =>
  requiresDiveCenterInternationalMembership(
    centerProfile.value?.diving_activities || []
  )
);
const REQUIRED_FILES_SOURCE = "international_memberships";

function extractDivingTypes(value) {
  if (Array.isArray(value)) {
    return value
      .map((part) => String(part || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .trim()
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function membershipKey(membership) {
  const divingType = extractDivingTypes(membership?.diving_type).sort().join("|");

  return [
    membership?.organization || "",
    membership?.number || "",
    divingType,
  ].join("|");
}

const memberships = computed(() => {
  const activeMap = new Map();
  const pendingMap = new Map();

  activeMemberships.value.forEach((membership) => {
    activeMap.set(membershipKey(membership), membership);
  });

  applicationMemberships.value.forEach((membership) => {
    pendingMap.set(membershipKey(membership), membership);
  });

  const keys = new Set([...activeMap.keys(), ...pendingMap.keys()]);
  const rows = [];

  keys.forEach((key) => {
    const active = activeMap.get(key) || null;
    const pending = pendingMap.get(key) || null;

    if (pending) {
      const isPendingTermination = pending.action === "terminate" && !!active;

      rows.push({
        ...(active || {}),
        ...pending,
        certificate_url:
          pending.certificate_url || active?.certificate_url || null,
        expiry_date: pending.expiry_date || active?.expiry_date || null,
        active_id: active?.id || null,
        pending_id: pending.id,
        mode: isPendingTermination ? "pending_terminate" : "unverified",
      });

      return;
    }

    if (active) {
      rows.push({
        ...active,
        active_id: active.id,
        pending_id: null,
        mode: "active",
      });
    }
  });

  return rows.sort((a, b) => {
    const orgCompare = String(a.organization || "").localeCompare(
      String(b.organization || "")
    );

    if (orgCompare !== 0) {
      return orgCompare;
    }

    return String(a.number || "").localeCompare(String(b.number || ""));
  });
});

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isMembershipExpired(expiryDate) {
  const normalizedDate = String(expiryDate || "").trim();

  if (!normalizedDate) {
    return false;
  }

  return normalizedDate < getTodayDateString();
}

const hasValidMembershipForRequirement = computed(() =>
  memberships.value.some(
    (membership) =>
      membership.mode !== "pending_terminate" &&
      !isMembershipExpired(membership.expiry_date)
  )
);

const hasMemberships = computed(() => memberships.value.length > 0);
const showEmptyStateMessage = computed(
  () => !hasMemberships.value && !canEdit.value
);
const visibleComponent = computed(
  () =>
    canEdit.value ||
    hasMemberships.value ||
    showEmptyStateMessage.value ||
    isLoadingKey("application")
);

const validationErrors = computed(() => {
  if (!canEdit.value) {
    return [];
  }

  const errors = [];

  if (
    canEdit.value &&
    requiresMembership.value &&
    !hasValidMembershipForRequirement.value
  ) {
    errors.push(
      t("International memberships are required for the selected training activities")
    );
  }

  memberships.value
    .filter(
      (membership) =>
        membership.mode === "unverified" && membership.status === "Unverified"
    )
    .forEach((membership, index) => {
      const membershipLabel = `${t("Membership")} ${index + 1}`;

      if (!String(membership.organization || "").trim()) {
        errors.push(
          `${membershipLabel}: ${t("isRequired", { name: t("Organization") })}`
        );
      }

      if (!String(membership.number || "").trim()) {
        errors.push(
          `${membershipLabel}: ${t("isRequired", { name: t("Membership Number") })}`
        );
      }

      if (extractDivingTypes(membership.diving_type).length === 0) {
        errors.push(
          `${membershipLabel}: ${t("isRequired", { name: t("Diving Type") })}`
        );
      }

      if (!String(membership.expiry_date || "").trim()) {
        errors.push(
          `${membershipLabel}: ${t("isRequired", { name: t("Expiry Date") })}`
        );
      }
    });

  return errors;
});

const membershipRequiredFiles = computed(() => {
  const files = [];

  memberships.value.forEach((membership) => {
    if (
      membership.mode !== "unverified" ||
      membership.status !== "Unverified" ||
      membership.action !== "register"
    ) {
      return;
    }

    const organization = String(membership.organization || "").trim();
    if (!organization) {
      return;
    }

    files.push(`${organization} Membership Certificate`);
  });

  return Array.from(new Set(files));
});

watch(
  validationErrors,
  (errors) => {
    if (errors.length > 0) {
      store.setStepError("international_memberships", errors);
    } else {
      store.deleteStepError("international_memberships");
    }
  },
  { immediate: true }
);

watch(
  membershipRequiredFiles,
  (files) => {
    store.setRuntimeRequiredFiles(REQUIRED_FILES_SOURCE, files);
  },
  { immediate: true }
);

function statusText(membership) {
  if (membership.mode === "pending_terminate") {
    if (isMembershipCancellationCompleted(membership)) {
      return t("Membership cancellation completed");
    }

    return t("Cancellation will be processed after the application is approved");
  }

  if (membership.mode === "unverified") {
    if (isMembershipCancellationCompleted(membership)) {
      return t("Membership cancellation completed");
    }

    if (isMembershipAdditionCompleted(membership)) {
      return t("Membership addition completed");
    }

    return t("Activation will be processed after the application is approved");
  }

  return t("Active");
}

function membershipAction(membership) {
  return String(membership?.action || "").toLowerCase();
}

function isMembershipAdditionCompleted(membership) {
  return (
    membershipAction(membership) === "register" &&
    Boolean(membership?.approved_at)
  );
}

function isMembershipCancellationCompleted(membership) {
  return membershipAction(membership) === "terminate" && Boolean(membership?.inactive_at);
}

function isMembershipChangeCompleted(membership) {
  return (
    isMembershipAdditionCompleted(membership) ||
    isMembershipCancellationCompleted(membership)
  );
}

function statusClass(membership) {
  if (isMembershipChangeCompleted(membership)) {
    return "tw-bg-green-50 tw-text-green-700";
  }

  if (membership.mode === "active") {
    return "tw-bg-green-50 tw-text-green-700";
  }

  return "tw-bg-amber-50 tw-text-amber-700";
}

function statusIcon(membership) {
  if (isMembershipChangeCompleted(membership)) {
    return "pi pi-check-circle";
  }

  if (membership.mode === "active") {
    return "pi pi-check-circle";
  }

  return "pi pi-clock";
}

function certificateUrl(path) {
  return buildFileUrl(path);
}

function canShowCancel(membership) {
  return canEdit.value && membership.mode === "active";
}

function canShowRemovePending(membership) {
  return (
    canEdit.value &&
    membership.mode === "unverified" &&
    membership.status === "Unverified"
  );
}

function canShowRestore(membership) {
  return (
    canEdit.value &&
    membership.mode === "pending_terminate" &&
    !isMembershipExpired(membership.expiry_date)
  );
}

function formatDivingType(value) {
  const parts = extractDivingTypes(value);

  if (!parts.length) {
    return "-";
  }

  return parts.map((part) => t(part)).join(" / ");
}

function navigateToAddMembership() {
  router.push({
    name: "dive-center-international-membership-add",
    params: {
      appId: application.value?.id,
      locale: locale.value,
    },
  });
}

async function reloadApplication() {
  await store.loadApplication(application.value.id, {
    withPayload: true,
    forceReload: true,
  });
}

async function handleCancelMembership(membership) {
  return withLoading(
    `dive-center-membership-canceling-${membership.active_id}`,
    async () => {
      try {
        const payload = {
          action: "terminate",
          organization: membership.organization || "",
          number: membership.number || "",
          diving_type: membership.diving_type || "",
          expiry_date: membership.expiry_date || "",
        };

        await apiPost(
          DIVING_CENTERS_APPS_ADD_INTERNATIONAL_MEMBERSHIP +
            application.value.id,
          payload,
          {
            context: "DivingCenterInternationalMembershipsCard.handleCancelMembership",
          }
        );

        await reloadApplication();
      } catch (err) {
        capture(err, {
          fallback: "Failed to remove membership",
          context:
            "DivingCenterInternationalMembershipsCard.handleCancelMembership",
          meta: {
            appId: application.value?.id,
            membershipId: membership.active_id,
          },
        });
        notifyError(t("Please try again"));
      }
    }
  );
}

async function handleRemovePendingMembership(membership) {
  return withLoading(
    `dive-center-membership-removing-${membership.pending_id}`,
    async () => {
      try {
        await apiDelete(
          DIVING_CENTERS_APPS_REMOVE_INTERNATIONAL_MEMBERSHIP +
            membership.pending_id,
          {
            context:
              "DivingCenterInternationalMembershipsCard.handleRemovePendingMembership",
          }
        );

        await reloadApplication();
      } catch (err) {
        capture(err, {
          fallback: "Failed to remove membership",
          context:
            "DivingCenterInternationalMembershipsCard.handleRemovePendingMembership",
          meta: {
            appId: application.value?.id,
            membershipId: membership.pending_id,
          },
        });
        notifyError(t("Please try again"));
      }
    }
  );
}

function showCancelConfirmation(membership) {
  confirm.require({
    group: "dive-center-memberships",
    message: `${membership?.organization ? `"${membership.organization}" - ` : ""}${t("Remove this membership?")}`,
    header: t("Confirm"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("Confirm"),
    rejectLabel: t("Cancel"),
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await handleCancelMembership(membership);
      } finally {
        confirm.close();
      }
    },
    reject: () => confirm.close(),
  });
}

function showRemovePendingConfirmation(membership) {
  confirm.require({
    group: "dive-center-memberships",
    message: `${membership?.organization ? `"${membership.organization}" - ` : ""}${t("Remove this membership?")}`,
    header: t("Confirm"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("Remove"),
    rejectLabel: t("Cancel"),
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await handleRemovePendingMembership(membership);
      } finally {
        confirm.close();
      }
    },
    reject: () => confirm.close(),
  });
}

async function handleRestoreMembership(membership) {
  await handleRemovePendingMembership(membership);
}

watch(
  canEdit,
  (editable) => {
    if (editable) {
      store.registerStepPrimaryAction(
        "international_memberships",
        navigateToAddMembership
      );
      return;
    }

    store.unregisterStepPrimaryAction("international_memberships");
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  store.unregisterStepPrimaryAction("international_memberships");
  store.deleteStepError("international_memberships");
  store.deleteRuntimeRequiredFiles(REQUIRED_FILES_SOURCE);
});
</script>

<template>
  <div v-if="visibleComponent" class="tw-space-y-8" data-step-id="international_memberships">
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2">
      <i class="pi pi-globe tw-text-primary" aria-hidden="true"></i>
      <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
        {{ t("International Memberships") }}
      </span>
    </div>

    <div v-if="validationErrors.length > 0" class="tw-space-y-2">
      <div
        v-for="(error, index) in validationErrors"
        :key="'membership-error-' + index"
        class="tw-p-3 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg"
      >
        <div class="tw-flex tw-gap-2">
          <i
            class="pi pi-exclamation-triangle tw-text-amber-600 tw-mt-0.5"
            aria-hidden="true"
          ></i>
          <p class="tw-text-sm tw-text-amber-900">{{ error }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="
        canEdit &&
        requiresMembership &&
        !hasValidMembershipForRequirement
      "
      class="tw-grid tw-grid-cols-1 tw-gap-4"
    >
      <button
        type="button"
        class="tw-border-2 tw-border-dashed tw-border-red-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center hover:tw-shadow-md tw-transition"
        @click="navigateToAddMembership"
      >
        <div class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-red-100 tw-rounded-full tw-mb-4">
          <i class="pi pi-exclamation-triangle tw-text-2xl tw-text-red-600" aria-hidden="true"></i>
        </div>
        <h4 class="tw-font-semibold tw-text-lg tw-text-foreground">
          {{ t("Add Membership") }}
        </h4>
        <div class="tw-mt-3 tw-text-red-700 tw-font-medium tw-text-sm">
          {{ t("International memberships are required for the selected training activities") }}
        </div>
      </button>
    </div>

    <div v-if="showEmptyStateMessage" class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-text-center tw-py-8 tw-text-slate-500">
        <i class="pi pi-globe tw-text-4xl tw-text-slate-300 tw-mb-3" aria-hidden="true"></i>
        <p>{{ t("No international memberships added yet") }}</p>
      </div>
    </div>

    <div
      v-for="(membership, index) in memberships"
      :key="membership.mode + '-' + (membership.pending_id || membership.active_id || membership.id)"
      class="tw-mb-2"
    >
      <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-globe tw-text-primary" aria-hidden="true"></i>
          <span class="tw-font-bold tw-text-slate-700 tw-text-xl">
            {{ t("Membership") }} {{ index + 1 }}
          </span>

          <div
            :class="statusClass(membership)"
            class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full"
          >
            <i :class="statusIcon(membership)" aria-hidden="true"></i>
            <span>{{ statusText(membership) }}</span>
          </div>
        </div>

        <div class="tw-flex tw-items-center tw-gap-2">
          <button
            v-if="canShowCancel(membership)"
            type="button"
            :disabled="isLoadingKey(`dive-center-membership-canceling-${membership.active_id}`)"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
            @click="showCancelConfirmation(membership)"
          >
            <i
              :class="isLoadingKey(`dive-center-membership-canceling-${membership.active_id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
              aria-hidden="true"
            ></i>
          </button>

          <button
            v-if="canShowRemovePending(membership)"
            type="button"
            :disabled="isLoadingKey(`dive-center-membership-removing-${membership.pending_id}`)"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
            @click="showRemovePendingConfirmation(membership)"
          >
            <i
              :class="isLoadingKey(`dive-center-membership-removing-${membership.pending_id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
              aria-hidden="true"
            ></i>
          </button>

          <button
            v-if="canShowRestore(membership)"
            type="button"
            :disabled="isLoadingKey(`dive-center-membership-removing-${membership.pending_id}`)"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-green-600 tw-transition disabled:tw-opacity-50"
            @click="handleRestoreMembership(membership)"
          >
            <i
              :class="isLoadingKey(`dive-center-membership-removing-${membership.pending_id}`) ? 'pi pi-spinner tw-animate-spin' : 'pi pi-undo'"
              aria-hidden="true"
            ></i>
            <span>{{ t("Restore") }}</span>
          </button>
        </div>
      </div>

      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
        <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
          <div>
            <div class="tw-text-sm tw-text-slate-500">{{ t("Organization") }}</div>
            <div class="tw-font-medium tw-text-slate-800">
              {{ membership.organization || "-" }}
            </div>
          </div>

          <div>
            <div class="tw-text-sm tw-text-slate-500">{{ t("Membership Number") }}</div>
            <div class="tw-font-medium tw-text-slate-800">
              {{ membership.number || "-" }}
            </div>
          </div>

            <div v-if="membership.diving_type">
              <div class="tw-text-sm tw-text-slate-500">{{ t("Diving Type") }}</div>
              <div class="tw-font-medium tw-text-slate-800">
              {{ formatDivingType(membership.diving_type) }}
              </div>
            </div>

          <div v-if="membership.expiry_date">
            <div class="tw-text-sm tw-text-slate-500">{{ t("Expiry Date") }}</div>
            <div class="tw-font-medium tw-text-slate-800">
              {{ membership.expiry_date }}
            </div>
          </div>

          <div v-if="membership.certificate_url" class="sm:tw-col-span-2">
            <div class="tw-text-sm tw-text-slate-500">{{ t("Certificate") }}</div>
            <a
              :href="certificateUrl(membership.certificate_url)"
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

    <div
      v-if="
        canEdit &&
        !(requiresMembership && !hasValidMembershipForRequirement)
      "
    >
      <button
        type="button"
        class="tw-block tw-w-full tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 hover:tw-border-primary hover:tw-bg-blue-50 tw-shadow-sm tw-p-8 tw-transition"
        @click="navigateToAddMembership"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
          <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-slate-100 hover:tw-bg-blue-100 tw-flex tw-items-center tw-justify-center tw-transition">
            <i class="pi pi-plus tw-text-xl tw-text-slate-600 hover:tw-text-primary tw-transition" aria-hidden="true"></i>
          </div>
          <span class="tw-text-slate-600 hover:tw-text-primary tw-font-medium tw-transition">
            {{ t("Add Membership") }}
          </span>
        </div>
      </button>
    </div>

    <ConfirmDialog
      group="dive-center-memberships"
      appendTo="body"
      :closable="false"
      :draggable="false"
      :reject-class="'tw-bg-white tw-text-gray-700 tw-border tw-border-gray-300'"
    />
  </div>
</template>
