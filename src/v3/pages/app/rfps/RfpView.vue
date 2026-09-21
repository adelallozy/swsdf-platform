<!--
    Page: src/v3/pages/app/rfps/RfpView.vue
    Vendor RFP detail: header band with the deadline, a quiet facts card,
    request documents as file cards, and the NDA as an attachments-style
    section: the current signed copy renders as an uploaded-file card with
    its signer evidence, a dashed required-file card while it is missing,
    and an inline signer form. The officer's acceptance (accept_nda) is the
    gate: until then only the NDA and open documents are downloadable; after
    acceptance the NDA disappears and gated documents unlock. The same gate
    reveals the offer section — the single offer surface where uploaded
    offer files are grouped per document type, missing required slots link
    to the upload page, and the offer is submitted for a receipt number or
    recalled back to draft while the window is open. A closed window leaves
    the record readable with no write controls.
-->
<template>
  <div class="tw-container tw-px-4 tw-py-8">
    <!-- Loading -->
    <div v-if="isLoading" class="tw-flex tw-justify-center tw-py-16">
      <ProgressSpinner />
    </div>

    <!-- Error -->
    <Message v-else-if="loadFailed" severity="error" :closable="false" class="tw-mx-auto tw-max-w-3xl">
      <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
        <span>{{ t("Failed to load RFP") }}</span>
        <button type="button" class="tw-font-semibold tw-text-primary" @click="load">
          {{ t("Retry") }}
        </button>
      </div>
    </Message>

    <section v-else-if="rfp" class="rfp-page tw-mx-auto tw-max-w-5xl tw-space-y-6">
      <!-- Back link, above everything -->
      <RouterLink :to="{ name: 'vendor-rfps' }" class="rfp-back">
        <i :class="backIcon" aria-hidden="true"></i>
        <span>{{ t("All requests") }}</span>
      </RouterLink>

      <!-- Header band: reference, participation state, deadline -->
      <header class="rfp-hero">
        <div class="rfp-hero__main">
          <h2 class="rfp-hero__reference">{{ rfp.reference || "—" }}</h2>
          <span :class="['rfp-pill', statusTheme.class]">
            <i :class="statusTheme.icon" aria-hidden="true"></i>
            {{ candidateStatusLabel(candidate?.status) }}
          </span>
        </div>
        <div v-if="rfp.closes_at" :class="['rfp-deadline', deadlineTheme.class]">
          <span class="rfp-deadline__label">{{ t("Submission window closes") }}</span>
          <strong class="rfp-deadline__date">{{ formatDateTime(rfp.closes_at) }}</strong>
          <span v-if="deadlineTheme.note" class="rfp-deadline__note">{{ deadlineTheme.note }}</span>
        </div>
      </header>

      <!-- Offer: the accepted candidate's single offer surface. Offers are
           the point of the whole request, so this section leads the page. -->
      <div v-if="candidate?.status === 'accept_nda' && offer" class="rfp-section">
        <div class="rfp-section__head">
          <h3 class="rfp-section__title">{{ t("Your offer") }}</h3>
          <span :class="['rfp-pill', offerStateTheme.class]">
            <i :class="offerStateTheme.icon" aria-hidden="true"></i>
            {{ t(offerStateTheme.label) }}
          </span>
        </div>

        <!-- Emphasized offer panel: everything about the offer in one block -->
        <div :class="['rfp-offer-panel', `rfp-offer-panel--${offerState || 'draft'}`]">
          <!-- Receipt strip: the submission on record -->
          <div v-if="offer.receipt_number" class="rfp-offer-receipt">
            <div class="rfp-offer-receipt__item">
              <span class="rfp-offer-receipt__label">{{ t("Receipt number") }}</span>
              <strong class="rfp-offer-receipt__number">{{ offer.receipt_number }}</strong>
            </div>
            <div v-if="offer.submitted_at" class="rfp-offer-receipt__item">
              <span class="rfp-offer-receipt__label">{{ t("Submitted") }}</span>
              <strong>{{ formatDateTime(offer.submitted_at) }}</strong>
            </div>
            <div v-if="offer.recalled_at" class="rfp-offer-receipt__item">
              <span class="rfp-offer-receipt__label">{{ t("Recalled on") }}</span>
              <strong>{{ formatDateTime(offer.recalled_at) }}</strong>
            </div>
          </div>

          <!-- Always on: the offer stays private until it is submitted -->
          <div class="rfp-notice rfp-notice--waiting" role="status">
            <i class="pi pi-eye-slash" aria-hidden="true"></i>
            <p>{{ t("The federation cannot view your offer until you submit it.") }}</p>
          </div>

          <!-- Closed window: readable record, no write controls -->
          <div v-if="!offerWindowOpen" class="rfp-notice rfp-notice--waiting" role="status">
            <i class="pi pi-lock" aria-hidden="true"></i>
            <p>{{ t("The submission window has closed. Your offer record stays available below.") }}</p>
          </div>

          <!-- Submitted, security validation still running -->
          <div
            v-else-if="offerState === 'pending_security_validation'"
            class="rfp-notice rfp-notice--waiting"
            role="status"
          >
            <i class="pi pi-shield" aria-hidden="true"></i>
            <p>{{ t("Your offer was received and is pending security validation.") }}</p>
          </div>

          <!-- Offer files: the applications-style card grid — missing required
               slots, uploaded files, and the catch-all add-file card -->
          <div
            class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-4"
          >
            <!-- Required slot still missing its document -->
            <RouterLink
              v-for="group in missingRequiredGroups"
              :key="'missing-' + group.key"
              :to="offerUploadRoute(String(group.slotId))"
              class="tw-border-2 tw-border-dashed tw-border-red-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-cursor-pointer hover:tw-shadow-md tw-transition tw-no-underline"
            >
              <div
                class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-red-100 tw-rounded-full tw-mb-4"
              >
                <i class="pi pi-exclamation-triangle tw-text-2xl tw-text-red-600" aria-hidden="true"></i>
              </div>
              <h4 class="tw-font-semibold tw-text-lg tw-text-foreground tw-text-center">
                {{ t("Upload File") }}
              </h4>
              <div class="tw-mt-3 tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-1">
                <span class="tw-text-red-700 tw-font-medium tw-text-sm tw-text-center file-name-clamp">
                  {{ group.name }}
                </span>
                <span
                  class="tw-inline-flex tw-items-center tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-red-100 tw-text-red-700 tw-text-xs tw-font-bold"
                >
                  {{ t("Required Document") }}
                </span>
              </div>
            </RouterLink>

            <!-- Uploaded offer files -->
            <div
              v-for="file in offerFileCards"
              :key="file.id"
              class="tw-border tw-border-gray-200 tw-rounded-xl tw-p-4 tw-shadow-sm tw-transition-all tw-duration-200 hover:tw-shadow-md"
            >
              <div class="tw-flex tw-flex-col tw-h-full">
                <div
                  class="tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-mx-auto tw-bg-blue-50 tw-rounded-lg tw-mb-3"
                >
                  <i class="pi pi-file tw-text-2xl tw-text-blue-600" aria-hidden="true"></i>
                </div>
                <div class="tw-flex-1">
                  <h4
                    class="tw-font-semibold tw-text-gray-800 tw-text-sm file-name-clamp tw-mb-1"
                    :title="file.label"
                  >
                    {{ file.label }}
                  </h4>
                  <p v-if="file.uploaded_at" class="tw-text-xs tw-text-gray-500 tw-mb-2">
                    {{ formatDateTime(file.uploaded_at) }}
                  </p>
                  <span :class="['rfp-offer-file__status', offerFileStatus(file).class]">
                    <i :class="offerFileStatus(file).icon" aria-hidden="true"></i>
                    {{ t(offerFileStatus(file).label) }}
                  </span>
                </div>
                <div class="tw-flex tw-gap-2 tw-mt-3">
                  <button
                    type="button"
                    class="tw-flex-1 tw-py-2 tw-bg-gray-50 hover:tw-bg-gray-100 tw-rounded-md tw-text-sm tw-text-gray-700 tw-flex tw-items-center tw-justify-center tw-gap-1 tw-transition-colors"
                    :disabled="!offerFileDownloadable(file) || downloadingFileId === file.id"
                    @click="downloadOfferFile(file)"
                  >
                    <i class="pi pi-download tw-text-xs" aria-hidden="true"></i>
                    <span>{{ t("Download") }}</span>
                  </button>
                  <button
                    v-if="canRemoveOfferFile(file)"
                    type="button"
                    class="tw-py-2 tw-px-3 tw-bg-red-50 hover:tw-bg-red-100 tw-rounded-md tw-text-sm tw-text-red-600 tw-flex tw-items-center tw-justify-center tw-transition-colors"
                    :disabled="removingOfferFileId === file.id"
                    :aria-label="t('Remove file')"
                    @click="removeOfferFile(file)"
                  >
                    <i
                      :class="removingOfferFileId === file.id ? 'pi pi-spinner tw-animate-spin' : 'pi pi-trash'"
                      aria-hidden="true"
                    ></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Catch-all add-file card: opens the upload page's "Other" type -->
            <RouterLink
              v-if="canWriteOffer"
              :to="offerUploadRoute('other')"
              class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-2xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-cursor-pointer hover:tw-shadow-md tw-transition tw-no-underline"
            >
              <div
                class="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-blue-100 tw-rounded-full tw-mb-4"
              >
                <i class="pi pi-plus tw-text-2xl tw-text-blue-600" aria-hidden="true"></i>
              </div>
              <h4 class="tw-font-semibold tw-text-lg tw-text-foreground">
                {{ t("Add File") }}
              </h4>
            </RouterLink>
          </div>

          <!-- Submit: draft + open window; the API's can_submit gates the button -->
          <div v-if="canWriteOffer" class="rfp-card rfp-offer-action">
            <div class="rfp-offer-action__copy">
              <h4 class="rfp-offer-action__title">{{ t("Submit your offer") }}</h4>
            </div>
            <button
              type="button"
              class="rfp-btn rfp-btn--primary"
              :disabled="!offerCanSubmit || submittingOffer"
              @click="confirmSubmitOffer"
            >
              <i
                :class="submittingOffer ? 'pi pi-spinner tw-animate-spin' : 'pi pi-send'"
                aria-hidden="true"
              ></i>
              {{ submittingOffer ? t("Submitting...") : t("Submit offer") }}
            </button>
          </div>

          <!-- Recall: submitted and the window is still open -->
          <div v-else-if="offerRecallable" class="rfp-card rfp-offer-action">
            <div class="rfp-offer-action__copy">
              <h4 class="rfp-offer-action__title">{{ t("Recall your offer") }}</h4>
            </div>
            <button
              type="button"
              class="rfp-btn rfp-btn--primary"
              :disabled="recallingOffer"
              @click="confirmRecallOffer"
            >
              <i
                :class="recallingOffer ? 'pi pi-spinner tw-animate-spin' : 'pi pi-replay'"
                aria-hidden="true"
              ></i>
              {{ t("Recall offer") }}
            </button>
          </div>
        </div>
      </div>

      <!-- About: facts + the locale's description + services -->
      <div v-if="rfp.opens_at || aboutDescription.text || services.length" class="rfp-section">
        <h3 class="rfp-section__title">{{ t("About this request") }}</h3>
        <div class="rfp-card">
          <dl v-if="rfp.opens_at || rfp.closes_at" class="rfp-facts">
            <div v-if="rfp.opens_at" class="rfp-facts__item">
              <dt>{{ t("Opens") }}</dt>
              <dd>{{ formatDateTime(rfp.opens_at) }}</dd>
            </div>
            <div v-if="rfp.closes_at" class="rfp-facts__item">
              <dt>{{ t("Closes") }}</dt>
              <dd>{{ formatDateTime(rfp.closes_at) }}</dd>
            </div>
          </dl>

          <p v-if="aboutDescription.text" :dir="aboutDescription.dir" class="rfp-description">
            {{ aboutDescription.text }}
          </p>

          <ul v-if="services.length" class="rfp-services">
            <li v-for="service in services" :key="service?.id" class="rfp-services__chip">
              {{ serviceLabel(service) }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Request documents: one file card per document -->
      <div v-if="documents.length" class="rfp-section">
        <h3 class="rfp-section__title">{{ t("Request documents") }}</h3>
        <p v-if="documentsHint" class="rfp-section__desc">{{ documentsHint }}</p>
        <ul class="rfp-files">
          <li v-for="document in documents" :key="document?.id" class="rfp-file">
            <i class="pi pi-file-pdf rfp-file__icon" aria-hidden="true"></i>
            <span class="rfp-file__name">{{ document?.display_name || "—" }}</span>
            <span
              v-if="document?.access !== 'nda'"
              :class="['rfp-badge', accessTheme(document?.access).class]"
            >
              {{ accessLabel(document?.access) }}
            </span>
            <button
              type="button"
              class="rfp-file__download"
              :disabled="!attachmentReady(document)"
              @click="downloadDocument(document)"
            >
              <i class="pi pi-download" aria-hidden="true"></i>
              {{ t("Download") }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Required files: one card per required file type (today: the NDA) -->
      <div v-if="candidate" class="rfp-section">
        <h3 class="rfp-section__title">{{ t("Non-Disclosure Agreement") }}</h3>

        <!-- Accepted: quiet success, gated documents are open -->
        <div v-if="candidate?.status === 'accept_nda'" class="rfp-notice rfp-notice--done" role="status">
          <i class="pi pi-check-circle" aria-hidden="true"></i>
          <p>{{ t("Your NDA has been accepted. You can now access the gated documents.") }}</p>
        </div>

        <!-- Not accepted yet: notice + file cards sit directly in the
             section — no outer card, the cards speak for themselves. -->
        <template v-else>
          <!-- Awaiting officer review -->
          <div
            v-if="candidate?.status === 'nda_uploaded' && !pendingRejection"
            class="rfp-notice rfp-notice--waiting"
            role="status"
          >
            <i class="pi pi-clock" aria-hidden="true"></i>
            <p>{{ t("Your signed NDA is awaiting review. You can re-upload a corrected copy until it is reviewed.") }}</p>
          </div>

          <!-- Officer rejection: the note explains what to fix -->
          <div
            v-if="pendingRejection"
            class="rfp-notice rfp-notice--rejected"
            role="status"
          >
            <i class="pi pi-times-circle" aria-hidden="true"></i>
            <p>{{ pendingRejection }}</p>
          </div>

          <ul class="rfp-files rfp-files--nda">
            <template v-for="entry in requiredFiles" :key="entry.type">
              <!-- File on file: type name, upload date, actions -->
              <li v-if="fileOnFile(entry)" class="rfp-file rfp-file--signed">
                <i class="pi pi-file-pdf rfp-file__icon" aria-hidden="true"></i>
                <div class="rfp-file__meta">
                  <strong class="rfp-file__name">{{ fileTypeName(entry) }}</strong>
                  <span v-if="entry.file?.uploaded_at" class="rfp-file__sub">
                    {{ formatDateTime(entry.file.uploaded_at) }}
                  </span>
                </div>
                <div class="rfp-file__buttons">
                  <button
                    v-if="canReplaceRejectedNda(entry)"
                    type="button"
                    class="rfp-file__download"
                    @click="goToUpload(entry)"
                  >
                    <i class="pi pi-upload" aria-hidden="true"></i>
                    {{ t("Upload signed NDA") }}
                  </button>
                  <button
                    type="button"
                    class="rfp-file__download"
                    :disabled="!entry.attachmentId || removingType === entry.type"
                    @click="downloadRequiredFile(entry)"
                  >
                    <i class="pi pi-download" aria-hidden="true"></i>
                    {{ t("Download") }}
                  </button>
                  <button
                    v-if="canRemove(entry)"
                    type="button"
                    class="rfp-file__remove"
                    :disabled="removingType === entry.type"
                    @click="removeFile(entry)"
                  >
                    <i class="pi pi-trash" aria-hidden="true"></i>
                    {{ t("Remove file") }}
                  </button>
                </div>
              </li>

              <!-- Missing required file -->
              <li v-else class="rfp-file rfp-file--missing">
                <div class="rfp-file__icon-wrap">
                  <i class="pi pi-file-pdf rfp-file__icon rfp-file__icon--dashed" aria-hidden="true"></i>
                  <span class="rfp-badge rfp-badge--required">{{ t("Required") }}</span>
                </div>
                <div class="rfp-file__meta">
                  <strong class="rfp-file__name">{{ fileTypeName(entry) }}</strong>
                  <span class="rfp-file__sub">{{ t("Upload the signed copy") }}</span>
                </div>
                <button
                  type="button"
                  class="rfp-file__download"
                  @click="goToUpload(entry)"
                >
                  <i class="pi pi-upload" aria-hidden="true"></i>
                  {{ t("Upload signed NDA") }}
                </button>
              </li>
            </template>
          </ul>
        </template>
      </div>

    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import {
  RFPS_VIEW,
  RFPS_OFFER_REMOVE_FILE,
  RFPS_OFFER_SUBMIT,
  RFPS_OFFER_RECALL,
} from "@/v3/config/apiEndpoints.js";
import { RFP_REQUIRED_FILES } from "@/v3/config/rfp-required-files.js";
import { apiGet, apiPost } from "@/v3/services/httpClient.js";
import { useFastUpload } from "@/v3/composables/useFastUpload.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { capture } = useErrorHandler();
const { isLoading, withLoading } = useLoading();
const { error: notifyError, success: notifySuccess } = useNotification();
const { setHeading } = usePageHeading();
const { downloadRfpDocument, downloadAttachedFile, downloadOfferFile: downloadVendorOfferFile } = useFastUpload();
const confirm = useConfirm();

const CANDIDATE_STATUS_LABELS = {
  invited: "Invited",
  nda_uploaded: "NDA uploaded",
  accept_nda: "NDA accepted"
};

const STATUS_THEMES = {
  invited: { class: "rfp-pill--invited", icon: "pi pi-envelope" },
  nda_uploaded: { class: "rfp-pill--review", icon: "pi pi-clock" },
  accept_nda: { class: "rfp-pill--accepted", icon: "pi pi-verify" }
};

// Offer-file assignment statuses mapped to literal English phrases — raw
// state codes are never rendered or passed to t().
const OFFER_FILE_STATUS_THEMES = {
  pending: { label: "Security check in progress", class: "rfp-offer-file__status--pending", icon: "pi pi-clock" },
  active: { label: "Ready", class: "rfp-offer-file__status--ready", icon: "pi pi-check-circle" },
  locked: { label: "Ready", class: "rfp-offer-file__status--ready", icon: "pi pi-lock" },
  failed: { label: "Security check failed", class: "rfp-offer-file__status--failed", icon: "pi pi-times-circle" },
  deleting: { label: "Being removed", class: "rfp-offer-file__status--muted", icon: "pi pi-spinner" },
  deleted: { label: "Being removed", class: "rfp-offer-file__status--muted", icon: "pi pi-trash" }
};
const OFFER_FILE_STATUS_FALLBACK = { label: "Processing", class: "rfp-offer-file__status--muted", icon: "pi pi-clock" };

const rfpId = computed(() => (route.params.id ? Number(route.params.id) : null));

const loadFailed = ref(false);
const rfp = ref(null);
const candidate = ref(null);
const candidateFiles = ref({});
const offer = ref(null);
const offerRequiredDocuments = ref([]);
const documents = ref([]);
const documentAttachments = ref({});
const removingType = ref("");
const downloadingFileId = ref(null);
const removingOfferFileId = ref(null);
const submittingOffer = ref(false);
const recallingOffer = ref(false);

const services = computed(() =>
  (Array.isArray(rfp.value?.rfp_services) ? rfp.value.rfp_services : [])
    .map((row) => row?.vendor_service || row)
    .filter(Boolean)
);

const isArabic = computed(() => String(locale.value || "").startsWith("ar"));
const backIcon = computed(() => (isArabic.value ? "pi pi-arrow-right" : "pi pi-arrow-left"));

// ─── Offer section state ─────────────────────────────────────────────

const offerState = computed(() => String(offer.value?.state || ""));

// Offer-state pill on the section head: the offer leads the page, so its
// state rides the title.
const OFFER_STATE_THEMES = {
  draft: { label: "Draft in progress", icon: "pi-pencil", class: "rfp-pill--review" },
  pending_security_validation: {
    label: "Pending security validation",
    icon: "pi-shield",
    class: "rfp-pill--review",
  },
  submitted: { label: "Submitted", icon: "pi-check-circle", class: "rfp-pill--accepted" },
};
const offerStateTheme = computed(
  () => OFFER_STATE_THEMES[offerState.value] ?? OFFER_STATE_THEMES.draft
);

/** The offer's own deadline decides whether files may still change. */
const offerWindowOpen = computed(() => {
  const status = String(offer.value?.deadline?.status || "");
  if (!["scheduled", "open"].includes(status)) return false;
  const closes = offer.value?.deadline?.closes_at
    ? Date.parse(offer.value.deadline.closes_at)
    : NaN;
  return !Number.isNaN(closes) && closes > Date.now();
});

/** Write controls exist only for a draft offer inside the window. */
const canWriteOffer = computed(() => offerWindowOpen.value && offerState.value === "draft");

const offerCanSubmit = computed(() => offer.value?.can_submit === true);

const offerRecallable = computed(
  () =>
    offerWindowOpen.value &&
    ["submitted", "pending_security_validation"].includes(offerState.value)
);

/**
 * Offer files grouped per document type: one group per
 * offer_required_documents slot (sorted by sort_order), then the catch-all
 * "Other" group for rows without a required document. Files always render
 * under the slot named by their required_document_id.
 */
const offerFileGroups = computed(() => {
  const files = Array.isArray(offer.value?.files) ? offer.value.files : [];
  const groups = offerRequiredDocuments.value
    .slice()
    .sort((a, b) => (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0))
    .map((slot) => ({
      key: `slot-${slot.id}`,
      isOther: false,
      slotId: slot.id,
      name: slot.name || "",
      required: !!slot.required,
      files: files.filter(
        (file) => Number(file.required_document_id) === Number(slot.id)
      )
    }));
  const otherFiles = files.filter((file) => file.required_document_id == null);
  if (otherFiles.length) {
    groups.push({
      key: "other",
      isOther: true,
      slotId: null,
      name: "",
      required: false,
      files: otherFiles
    });
  }
  return groups;
});

/** A group renders when it has files or is a required slot still missing its document. */
const visibleOfferGroups = computed(() =>
  offerFileGroups.value.filter((group) => group.files.length > 0 || group.required)
);

/** Required slots with no file yet: each renders a missing-required upload card. */
const missingRequiredGroups = computed(() =>
  visibleOfferGroups.value.filter((group) => group.required && group.files.length === 0)
);

/** Flat card list: every uploaded file labeled with its document-type group. */
const offerFileCards = computed(() =>
  visibleOfferGroups.value.flatMap((group) =>
    group.files.map((file) => ({
      ...file,
      label: group.isOther ? t("Other") : group.name
    }))
  )
);

/** The upload page preselects the slot (or the "Other" type) from the query. */
function offerUploadRoute(type) {
  return {
    name: "vendor-rfp-upload",
    params: { id: rfpId.value },
    query: { requiredFile: type }
  };
}

function offerFileStatus(file) {
  return (
    OFFER_FILE_STATUS_THEMES[String(file?.assignment_status || "")] ??
    OFFER_FILE_STATUS_FALLBACK
  );
}

function offerFileDownloadable(file) {
  return ["active", "locked"].includes(String(file?.assignment_status || ""));
}

function canRemoveOfferFile(file) {
  return (
    canWriteOffer.value &&
    ["pending", "active", "failed"].includes(String(file?.assignment_status || ""))
  );
}

async function downloadOfferFile(file) {
  if (!file?.id || downloadingFileId.value !== null) return;
  downloadingFileId.value = file.id;
  try {
    await downloadVendorOfferFile(rfpId.value, file.id);
  } catch (error) {
    capture(error, { context: "RfpView.downloadOfferFile", fallback: "Download failed" });
    notifyError(error?.message || t("Download failed"));
  } finally {
    downloadingFileId.value = null;
  }
}

/** Remove one draft offer file row, then re-read canonical state. */
async function removeOfferFile(file) {
  if (!rfpId.value || removingOfferFileId.value !== null || !file?.id) return;
  removingOfferFileId.value = file.id;
  try {
    const endpoint = RFPS_OFFER_REMOVE_FILE
      .replace("{id}", rfpId.value)
      .replace("{fileRowId}", file.id);
    await apiPost(endpoint, {});
    notifySuccess(t("File removed"));
    await load();
  } catch (error) {
    if (error?.name === "CONFLICT_ERROR" || error?.name === "VALIDATION_ERROR" || error?.name === "HTTP_ERROR") {
      notifyError(error?.message || t("Failed to remove the file"));
      return;
    }
    capture(error, { context: "RfpView.removeOfferFile", fallback: "Failed to remove the file" });
    notifyError(t("Failed to remove the file"));
  } finally {
    removingOfferFileId.value = null;
  }
}

function confirmSubmitOffer() {
  confirm.require({
    message: t("Submitting sends your offer to the federation. You can recall it any time before the deadline. Submit now?"),
    header: t("Submit offer"),
    icon: "pi pi-send",
    acceptLabel: t("Submit now"),
    rejectLabel: t("Cancel"),
    accept: () => submitOffer()
  });
}

/** Seal the draft: submit for a receipt number, then re-read state. */
async function submitOffer() {
  if (!rfpId.value || submittingOffer.value) return;
  submittingOffer.value = true;
  try {
    const endpoint = RFPS_OFFER_SUBMIT.replace("{id}", rfpId.value);
    await apiPost(endpoint, {});
    notifySuccess(t("Offer submitted"));
    await load();
  } catch (error) {
    if (error?.name === "CONFLICT_ERROR" || error?.name === "VALIDATION_ERROR" || error?.name === "HTTP_ERROR") {
      notifyError(error?.message || t("Failed to submit the offer"));
      return;
    }
    capture(error, { context: "RfpView.submitOffer", fallback: "Failed to submit the offer" });
    notifyError(t("Failed to submit the offer"));
  } finally {
    submittingOffer.value = false;
  }
}

function confirmRecallOffer() {
  confirm.require({
    message: t("Recalling returns your offer to draft. The federation cannot view it until you submit it again. Recall now?"),
    header: t("Recall offer"),
    icon: "pi pi-replay",
    acceptLabel: t("Recall now"),
    rejectLabel: t("Cancel"),
    accept: () => recallOffer()
  });
}

/** Return the submitted offer to draft, then re-read state. */
async function recallOffer() {
  if (!rfpId.value || recallingOffer.value) return;
  recallingOffer.value = true;
  try {
    const endpoint = RFPS_OFFER_RECALL.replace("{id}", rfpId.value);
    await apiPost(endpoint, {});
    notifySuccess(t("Your offer has been recalled and returned to draft."));
    await load();
  } catch (error) {
    if (error?.name === "CONFLICT_ERROR" || error?.name === "VALIDATION_ERROR" || error?.name === "HTTP_ERROR") {
      notifyError(error?.message || t("Failed to recall the offer"));
      return;
    }
    capture(error, { context: "RfpView.recallOffer", fallback: "Failed to recall the offer" });
    notifyError(t("Failed to recall the offer"));
  } finally {
    recallingOffer.value = false;
  }
}

const statusTheme = computed(
  () => STATUS_THEMES[String(candidate.value?.status || "")] ?? STATUS_THEMES.invited
);

/** True when a candidate file is on file. */
function fileOnFile(entry) {
  return !!entry?.file;
}

/** Display name of a required-file list entry. */
function fileTypeName(entry) {
  return t(entry?.label || "");
}

/** A rejected NDA remains as audit history and is replaced by a new upload. */
function canReplaceRejectedNda(entry) {
  return entry?.type === "nda" && entry?.file?.status === "rejected";
}

/** A pending file may be removed; rejected and accepted NDA files remain history. */
function canRemove(entry) {
  return (
    !!entry?.file &&
    !["accepted", "rejected"].includes(entry.file.status) &&
    !!entry.removeEndpoint
  );
}

/**
 * The required-file list for the current candidate state. Each entry merges
 * its catalog copy with the file currently on file (if any) and its
 * attached-file id from the candidate_files payload, keyed by file type.
 */
const requiredFiles = computed(() => {
  const status = String(candidate.value?.status || "");
  const filesByType = candidateFiles.value || {};
  return RFP_REQUIRED_FILES.filter((def) => def.visible(status)).map((def) => {
    const { visible, ...copy } = def;
    return {
      ...copy,
      file: filesByType[def.type]?.file || null,
      attachmentId: filesByType[def.type]?.attachment_id || null
    };
  });
});

/** The officer's rejection note across the current list, prefixed for the vendor. */
const pendingRejection = computed(() => {
  for (const entry of requiredFiles.value) {
    const reason = entry?.file?.status === "rejected" ? entry?.file?.rejection_reason : "";
    if (reason) return t("Officer note") + ": " + reason;
  }
  return "";
});

/** Only the locale's description is shown; the other language stays out of the page. */
const aboutDescription = computed(() => {
  const data = rfp.value || {};
  if (isArabic.value) {
    return {
      text: data.description_ar || data.description_en || "",
      dir: data.description_ar ? "rtl" : "ltr"
    };
  }
  return {
    text: data.description_en || data.description_ar || "",
    dir: data.description_en ? "ltr" : "rtl"
  };
});

/** Days until the submission window closes (null when unknown/past). */
const daysToClose = computed(() => {
  const closes = rfp.value?.closes_at ? Date.parse(rfp.value.closes_at) : NaN;
  if (Number.isNaN(closes)) return null;
  return Math.ceil((closes - Date.now()) / 86400000);
});

const deadlineTheme = computed(() => {
  const days = daysToClose.value;
  if (days === null) return { class: "rfp-deadline--calm", note: "" };
  if (days < 0) return { class: "rfp-deadline--past", note: t("The submission window has closed") };
  if (days <= 3) {
    return { class: "rfp-deadline--soon", note: t("Less than {n} days left", { n: Math.max(days, 1) }) };
  }
  return { class: "rfp-deadline--calm", note: t("{n} days left", { n: days }) };
});

const documentsHint = computed(() => {
  if (candidate.value?.status === "accept_nda") return "";
  const hasGated = documents.value.some((document) => document?.access === "gated");
  if (!hasGated) return "";
  return t("The other documents will be available after your NDA is accepted");
});

function candidateStatusLabel(value) {
  const label = CANDIDATE_STATUS_LABELS[String(value || "")];
  return label ? t(label) : String(value || "");
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "—");
  return new Intl.DateTimeFormat(isArabic.value ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Riyadh"
  }).format(date);
}

/** A required-file card action opens the upload page for that file type. */
function goToUpload(entry) {
  router.push({
    name: "vendor-rfp-upload",
    params: { id: rfpId.value },
    query: { requiredFile: entry?.type }
  });
}

function serviceLabel(service) {
  return (
    (isArabic.value ? service?.name_ar : service?.name_en) ||
    service?.name_en ||
    service?.name_ar ||
    "—"
  );
}

function accessLabel(value) {
  if (String(value || "") === "nda") return t("NDA");
  return String(value || "") === "open" ? t("Open") : t("Gated");
}

function accessTheme(value) {
  const access = String(value || "");
  if (access === "nda") return { class: "rfp-badge--nda" };
  if (access === "open") return { class: "rfp-badge--open" };
  return { class: "rfp-badge--gated" };
}

function attachmentReady(document) {
  const attachment = documentAttachments.value?.[document?.file_id];
  return !!attachment?.id && attachment?.status === "active";
}

async function downloadDocument(document) {
  try {
    await downloadRfpDocument(rfpId.value, document?.id);
  } catch (error) {
    capture(error, { context: "RfpView.downloadDocument", fallback: "Download failed" });
    notifyError(error?.message || t("Download failed"));
  }
}

/** Download a required file's on-file copy via the attached-file download flow. */
async function downloadRequiredFile(entry) {
  try {
    await downloadAttachedFile(entry?.attachmentId);
  } catch (error) {
    capture(error, { context: "RfpView.downloadRequiredFile", fallback: "Download failed" });
    notifyError(error?.message || t("Download failed"));
  }
}

/** Remove the pending signed NDA copy via the NDA remove endpoint. */
async function removeFile(entry) {
  if (!rfpId.value || removingType.value || !entry?.file?.file_id || !entry?.removeEndpoint) return;
  removingType.value = entry.type;
  try {
    const endpoint = entry.removeEndpoint.replace("{id}", rfpId.value);
    await apiPost(endpoint, { file_id: entry.file.file_id });
    notifySuccess(t("File removed"));
    await load();
  } catch (error) {
    if (error?.name === "CONFLICT_ERROR" || error?.name === "VALIDATION_ERROR" || error?.name === "HTTP_ERROR") {
      notifyError(error?.message || t("Failed to remove the file"));
      return;
    }
    capture(error, { context: "RfpView.removeFile", fallback: "Failed to remove the file" });
    notifyError(t("Failed to remove the file"));
  } finally {
    removingType.value = "";
  }
}

async function load() {
  loadFailed.value = false;
  try {
    await withLoading("vendor-rfp", async () => {
      const endpoint = RFPS_VIEW.replace("{id}", rfpId.value);
      const res = await apiGet(endpoint);
      rfp.value = res?.rfp || null;
      candidate.value = res?.candidate || null;
      candidateFiles.value = res?.candidate_files ?? {};
      offer.value = res?.offer ?? null;
      offerRequiredDocuments.value = res?.offer_required_documents ?? [];
      documents.value = Array.isArray(res?.documents) ? res.documents : [];
      documentAttachments.value = res?.document_attachments ?? {};
    });
  } catch (error) {
    loadFailed.value = true;
    rfp.value = null;
    capture(error, { context: "RfpView.load", fallback: "Failed to load RFP" });
    notifyError(t("Failed to load RFP"));
  }
}

onMounted(() => {
  setHeading({ title: "Request for Proposal", visible: true });
  load();
});
</script>

<style scoped>
@import url("./rfp-shared.css");

/* Card-grid file names clamp to keep cards even. */
.file-name-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Offer-file security status chip (assignment_status → literal phrase). */
.rfp-offer-file__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0.15rem 0.6rem;
  font-size: 0.6875rem;
  font-weight: 700;
  white-space: nowrap;
}
.rfp-offer-file__status--pending {
  border-color: #fde68a;
  background: #fffbeb;
  color: #b45309;
}
.rfp-offer-file__status--ready {
  border-color: #a7f3d0;
  background: #ecfdf5;
  color: #047857;
}
.rfp-offer-file__status--failed {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}
.rfp-offer-file__status--muted {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #64748b;
}

/* Section head: title with the offer-state pill on the far side. */
.rfp-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* Offer panel: the emphasized container that leads the page. A logical
   inline-start accent carries the state color; it mirrors naturally in RTL. */
.rfp-offer-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #dce8f0;
  border-inline-start-width: 4px;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 45, 76, 0.08);
  padding: 1.25rem 1.5rem;
}
.rfp-offer-panel--draft {
  border-inline-start-color: #0a5ea8;
  background: #f7fbff;
}
.rfp-offer-panel--pending_security_validation {
  border-inline-start-color: #d97706;
  background: #fffdf5;
}
.rfp-offer-panel--submitted {
  border-inline-start-color: #059669;
  background: #f6fefb;
}

/* Receipt summary — the submission on record. */
.rfp-offer-receipt {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  border: 1px solid #a7f3d0;
  border-radius: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: #f6fefb;
}
.rfp-offer-receipt__item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.rfp-offer-receipt__label {
  color: #047857;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.rfp-offer-receipt__item strong {
  color: #062f50;
  font-size: 1rem;
  font-weight: 800;
}
.rfp-offer-receipt__number {
  direction: ltr;
  unicode-bidi: isolate;
  letter-spacing: 0.04em;
}

/* Submit / recall action cards: copy on one side, action on the other. */
.rfp-offer-action {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-color: #badbff;
  box-shadow: 0 6px 22px rgba(3, 87, 150, 0.08);
}
.rfp-offer-action__copy {
  flex: 1 1 20rem;
}
.rfp-offer-action__title {
  margin: 0;
  color: #062f50;
  font-size: 1.05rem;
  font-weight: 800;
}

@media (max-width: 640px) {
  .rfp-offer-action {
    flex-direction: column;
    align-items: stretch;
  }
  .rfp-offer-action .rfp-btn {
    justify-content: center;
  }
}
</style>
