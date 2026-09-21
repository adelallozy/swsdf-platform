<!--
	Page: src/v3/pages/app/rfps/RfpsIndex.vue
	Vendor RFP list: the requests for proposal the vendor has been invited
	to (candidate rows past `match`), one card per request with the
	vendor's own lifecycle state and the submission deadline.
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
        <span>{{ t("Failed to load RFPs") }}</span>
        <button type="button" class="tw-font-semibold tw-text-primary" @click="load">
          {{ t("Retry") }}
        </button>
      </div>
    </Message>

    <section v-else class="rfps-index tw-mx-auto tw-max-w-5xl">
      <p v-if="rows.length" class="rfps-count">
        <strong>{{ rows.length }}</strong> {{ t("requests awaiting your action") }}
      </p>

      <!-- Empty state: an invitation to act -->
      <div v-if="!rows.length" class="rfps-empty">
        <i class="pi pi-inbox rfps-empty__icon" aria-hidden="true"></i>
        <h2 class="rfps-empty__title">{{ t("No RFP invitations yet") }}</h2>
        <p class="rfps-empty__text">
          {{ t("When the federation invites you to a request for proposal, it will appear here.") }}
        </p>
      </div>

      <!-- RFP cards -->
      <ul v-else class="rfps-list">
        <li v-for="row in rows" :key="row.rfp?.id">
          <RouterLink :to="{ name: 'vendor-rfp-view', params: { id: row.rfp?.id } }" class="rfp-row">
            <div class="rfp-row__main">
              <div class="rfp-row__topline">
                <span class="rfp-row__reference">{{ row.rfp?.reference || "—" }}</span>
                <span :class="['rfp-pill', statusTheme(row.candidate?.status).class]">
                  <i :class="statusTheme(row.candidate?.status).icon" aria-hidden="true"></i>
                  {{ candidateStatusLabel(row.candidate?.status) }}
                </span>
              </div>
              <p v-if="rfpDescription(row.rfp)" class="rfp-row__description">
                {{ rfpDescription(row.rfp) }}
              </p>
            </div>
            <div class="rfp-row__side">
              <span class="rfp-row__closes-label">{{ t("Closes") }}</span>
              <span class="rfp-row__closes-date">{{ formatDateTime(row.rfp?.closes_at) }}</span>
              <i :class="['rfp-row__chevron', chevronIcon]" aria-hidden="true"></i>
            </div>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { RFPS_INDEX } from "@/v3/config/apiEndpoints.js";
import { apiGet } from "@/v3/services/httpClient.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";

const { t, locale } = useI18n();
const { capture } = useErrorHandler();
const { isLoading, withLoading } = useLoading();
const { error: notifyError } = useNotification();
const { setHeading } = usePageHeading();

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

const loadFailed = ref(false);
const rfps = ref([]);
const candidates = ref([]);

const isArabic = computed(() => String(locale.value || "").startsWith("ar"));
const chevronIcon = computed(() => (isArabic.value ? "pi pi-chevron-left" : "pi pi-chevron-right"));

const rows = computed(() => {
  const byId = new Map(rfps.value.map((rfp) => [Number(rfp?.id), rfp]));
  return candidates.value
    .map((candidate) => ({
      candidate,
      rfp: byId.get(Number(candidate?.rfp_id))
    }))
    .filter((row) => row.rfp);
});

function statusTheme(value) {
  return STATUS_THEMES[String(value || "")] ?? STATUS_THEMES.invited;
}

function candidateStatusLabel(value) {
  const label = CANDIDATE_STATUS_LABELS[String(value || "")];
  return label ? t(label) : String(value || "");
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(isArabic.value ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Riyadh"
  }).format(date);
}

function rfpDescription(rfp) {
  return (
    (isArabic.value ? rfp?.description_ar : rfp?.description_en) ||
    rfp?.description_en ||
    rfp?.description_ar ||
    ""
  );
}

async function load() {
  loadFailed.value = false;
  try {
    await withLoading("vendor-rfps", async () => {
      const res = await apiGet(RFPS_INDEX);
      rfps.value = Array.isArray(res?.rfps) ? res.rfps : [];
      candidates.value = Array.isArray(res?.candidates) ? res.candidates : [];
    });
  } catch (error) {
    loadFailed.value = true;
    capture(error, { context: "RfpsIndex.load", fallback: "Failed to load RFPs" });
    notifyError(t("Failed to load RFPs"));
  }
}

onMounted(() => {
  setHeading({ title: t("Requests for Proposal"), visible: true });
  load();
});
</script>

<style scoped>
.rfps-count {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.25rem;
  color: #36566e;
  font-size: 0.9rem;
}
.rfps-count::before {
  content: "";
  width: 2rem;
  height: 0.25rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #16b8c8;
}
.rfps-count strong {
  color: #062f50;
  font-weight: 800;
}

.rfps-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 4rem 1.5rem;
  border: 1px dashed #dce8f0;
  border-radius: 1rem;
  background: #ffffff;
  text-align: center;
}
.rfps-empty__icon {
  color: #8ac2ff;
  font-size: 2.25rem;
}
.rfps-empty__title {
  margin: 0;
  color: #062f50;
  font-size: 1.125rem;
  font-weight: 800;
}
.rfps-empty__text {
  margin: 0;
  max-width: 26rem;
  color: #697e95;
  font-size: 0.875rem;
  line-height: 1.7;
}

.rfps-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rfp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #dce8f0;
  border-radius: 1rem;
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(15, 45, 76, 0.08);
  text-decoration: none;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}
.rfp-row:hover {
  border-color: #8ac2ff;
  box-shadow: 0 14px 34px rgba(15, 45, 76, 0.12);
  transform: translateY(-1px);
}
.rfp-row:focus-visible {
  outline: 3px solid rgba(69, 213, 223, 0.55);
  outline-offset: 3px;
}

.rfp-row__main {
  display: flex;
  flex: 1 1 18rem;
  flex-direction: column;
  gap: 0.5rem;
}
.rfp-row__topline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.rfp-row__reference {
  color: #062f50;
  font-size: 1.15rem;
  font-weight: 800;
  direction: ltr;
  unicode-bidi: isolate;
}
.rfp-row__description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: #697e95;
  font-size: 0.875rem;
  line-height: 1.7;
}

.rfp-row__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.25rem;
  padding-inline-start: 1rem;
  border-inline-start: 1px solid #eef3f7;
}
.rfp-row__closes-label {
  color: #94a3b8;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.rfp-row__closes-date {
  color: #062f50;
  font-weight: 800;
  font-size: 0.9rem;
}
.rfp-row__chevron {
  color: #8ac2ff;
  margin-top: 0.35rem;
}

.rfp-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.rfp-pill--invited {
  border-color: #badbff;
  background: #f0f7ff;
  color: #035796;
}
.rfp-pill--review {
  border-color: #fde68a;
  background: #fffbeb;
  color: #b45309;
}
.rfp-pill--accepted {
  border-color: #a7f3d0;
  background: #ecfdf5;
  color: #047857;
}

@media (max-width: 640px) {
  .rfp-row__side {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    border-inline-start: none;
    border-top: 1px solid #eef3f7;
    padding-inline-start: 0;
    padding-top: 0.75rem;
  }
  .rfp-row__chevron {
    margin-top: 0;
  }
}
</style>
