<template>
  <div class="tw-container tw-px-4 tw-py-8">
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="tw-flex tw-justify-center tw-py-16"
    >
      <ProgressSpinner />
    </div>

    <!-- Error -->
    <Message
      v-else-if="loadFailed"
      severity="error"
      :closable="false"
      class="tw-mx-auto tw-max-w-3xl"
    >
      <div
        class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3"
      >
        <span>{{ t("Failed to load vendors") }}</span>
        <button
          type="button"
          class="tw-font-semibold tw-text-primary"
          @click="loadVendorState"
        >
          {{ t("Retry") }}
        </button>
      </div>
    </Message>

    <!-- State 1: Approved vendor — show full profile inline -->
    <section
      v-else-if="profile"
      class="tw-mx-auto tw-max-w-6xl tw-space-y-8"
    >
      <div
        class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4"
      >
        <div
          class="tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-slate-600"
        >
          <span>
            {{ t("Vendor ID") }}: <strong>{{ vendorRootId }}</strong>
          </span>
          <span
            class="tw-rounded-full tw-bg-emerald-50 tw-px-3 tw-py-1 tw-font-semibold tw-text-emerald-700"
          >
            {{ t("Active") }}
          </span>
        </div>
        <button
          type="button"
          :disabled="isLoadingKey('vendor-profile-update-creating')"
          class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-bg-primary tw-px-5 tw-py-2.5 tw-font-semibold tw-text-white disabled:tw-opacity-50"
          @click="startProfileUpdate"
        >
          <i
            :class="
              isLoadingKey('vendor-profile-update-creating')
                ? 'pi pi-spinner tw-animate-spin'
                : 'pi pi-pencil'
            "
            aria-hidden="true"
          />
          {{ t("Update Profile") }}
        </button>
      </div>

      <section v-if="openRfps.length">
        <div class="tw-mb-3 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
          <h2 class="tw-text-xl tw-font-bold tw-text-slate-800">
            {{ t("Requests for Proposal") }}
          </h2>
          <span
            class="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-emerald-50 tw-px-3 tw-py-1 tw-text-sm tw-font-semibold tw-text-emerald-700"
          >
            <span class="tw-h-2 tw-w-2 tw-rounded-full tw-bg-emerald-500" aria-hidden="true" />
            {{ openRfps.length }} {{ t("Open") }}
          </span>
        </div>

        <div class="tw-grid tw-gap-4 md:tw-grid-cols-2">
          <RouterLink
            v-for="rfp in openRfps"
            :key="rfp.id"
            :to="{ name: 'vendor-rfp-view', params: { id: rfp.id } }"
            class="group tw-flex tw-min-h-40 tw-flex-col tw-justify-between tw-rounded-2xl tw-border tw-border-cyan-200 tw-bg-gradient-to-br tw-from-cyan-50 tw-to-white tw-p-5 tw-no-underline tw-shadow-sm tw-transition hover:-tw-translate-y-0.5 hover:tw-border-cyan-400 hover:tw-shadow-md focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-primary"
          >
            <div>
              <div class="tw-flex tw-items-start tw-justify-between tw-gap-4">
                <strong class="tw-text-lg tw-font-extrabold tw-text-slate-900" dir="ltr">
                  {{ rfp.reference || "—" }}
                </strong>
                <span class="tw-rounded-full tw-bg-emerald-100 tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-emerald-700">
                  {{ t("Open") }}
                </span>
              </div>
              <p
                v-if="rfpDescription(rfp)"
                class="tw-mt-3 tw-line-clamp-2 tw-text-sm tw-leading-6 tw-text-slate-600"
              >
                {{ rfpDescription(rfp) }}
              </p>
            </div>

            <div class="tw-mt-5 tw-flex tw-items-end tw-justify-between tw-gap-4 tw-border-t tw-border-cyan-100 tw-pt-4">
              <div>
                <span class="tw-block tw-text-xs tw-font-medium tw-text-slate-500">
                  {{ t("Closes") }}
                </span>
                <strong class="tw-text-sm tw-text-slate-800">
                  {{ formatDateTime(rfp.closes_at) }}
                </strong>
              </div>
              <i
                :class="[
                  'pi tw-text-sm tw-text-primary tw-transition-transform group-hover:tw-translate-x-1 rtl:group-hover:-tw-translate-x-1',
                  isRTL ? 'pi-arrow-left' : 'pi-arrow-right',
                ]"
                aria-hidden="true"
              />
            </div>
          </RouterLink>
        </div>

        <RouterLink
          :to="{ name: 'vendor-rfps' }"
          class="tw-mt-4 tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold !tw-text-primary tw-no-underline hover:tw-underline"
        >
          {{ t("All requests") }}
          <i :class="['pi tw-text-xs', isRTL ? 'pi-arrow-left' : 'pi-arrow-right']" aria-hidden="true" />
        </RouterLink>
      </section>

      <section>
        <h2 class="tw-mb-3 tw-text-xl tw-font-bold tw-text-slate-800">
          {{ t("Vendor Details") }}
        </h2>
        <div
          class="tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5"
        >
          <dl class="tw-grid tw-gap-5 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
            <div
              v-for="field in profileFields"
              :key="field.label"
              class="tw-space-y-1"
            >
              <dt class="tw-text-xs tw-font-medium tw-text-slate-500">
                {{ t(field.label) }}
              </dt>
              <dd class="tw-break-words tw-font-medium tw-text-slate-800">
                {{ field.value || "-" }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 class="tw-mb-3 tw-text-xl tw-font-bold tw-text-slate-800">
          {{ t("Services") }}
        </h2>
        <div
          class="tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5"
        >
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <span
              v-for="service in services"
              :key="service.id"
              class="tw-rounded-full tw-bg-primary/10 tw-px-3 tw-py-1 tw-text-sm tw-font-medium tw-text-primary"
            >
              {{ serviceName(service) }}
            </span>
            <span v-if="!services.length" class="tw-text-sm tw-text-slate-500">
              -
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 class="tw-mb-3 tw-text-xl tw-font-bold tw-text-slate-800">
          {{ t("Contact Persons") }}
        </h2>
        <div v-if="contacts.length" class="tw-space-y-5">
          <article v-for="(contact, index) in contacts" :key="contact.id">
            <h3 class="tw-mb-2 tw-font-bold tw-text-slate-700">
              {{ t("Contact") }} {{ index + 1 }}
            </h3>
            <div
              class="tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5"
            >
              <dl class="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
                <div
                  v-for="field in contactFields(contact)"
                  :key="field.label"
                  class="tw-space-y-1"
                >
                  <dt class="tw-text-xs tw-text-slate-500">
                    {{ t(field.label) }}
                  </dt>
                  <dd class="tw-break-words tw-font-medium tw-text-slate-800">
                    {{ field.value || "-" }}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
        <div
          v-else
          class="tw-rounded-2xl tw-border tw-border-slate-200 tw-bg-white tw-p-5 tw-text-sm tw-text-slate-500"
        >
          {{ t("No contact persons found") }}
        </div>
      </section>

      <section v-if="files.length">
        <h2 class="tw-mb-3 tw-text-xl tw-font-bold tw-text-slate-800">
          {{ t("Documents") }}
        </h2>
        <div
          class="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4"
        >
          <UploadedFileCard v-for="file in files" :key="file.id" :file="file" />
        </div>
      </section>
    </section>

    <!-- State 2: Open registration — link to application -->
    <div
      v-else-if="openRegistration"
      class="tw-mx-auto tw-max-w-2xl"
    >
      <div
        class="tw-rounded-3xl tw-border tw-border-amber-200 tw-bg-amber-50 tw-p-8 tw-text-center"
      >
        <div
          class="tw-mx-auto tw-mb-5 tw-flex tw-h-16 tw-w-16 tw-items-center tw-justify-center tw-rounded-full tw-bg-amber-100"
        >
          <i class="pi pi-clock tw-text-3xl tw-text-amber-600" aria-hidden="true" />
        </div>
        <h2 class="tw-text-xl tw-font-bold tw-text-slate-900">
          {{ t("Your vendor registration is not approved yet") }}
        </h2>
        <p class="tw-mx-auto tw-mt-3 tw-max-w-md tw-text-sm tw-text-slate-600">
          {{ t("Track your application to review its status or provide requested information.") }}
        </p>
        <RouterLink
          :to="{
            name: 'app-summary',
            params: { locale, appId: openRegistration.id },
          }"
          class="tw-mt-6 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-border tw-border-primary tw-bg-white tw-px-5 tw-py-2.5 tw-text-sm tw-font-semibold !tw-text-primary tw-no-underline tw-transition hover:tw-bg-primary hover:!tw-text-white"
        >
          <i class="pi pi-file-edit tw-text-xs" />
          <span>{{ t("Track your application") }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- State 3: No vendor and no registration — apply CTA -->
    <div
      v-else
      class="tw-mx-auto tw-max-w-2xl"
    >
      <div
        class="tw-rounded-3xl tw-border tw-border-dashed tw-border-slate-300 tw-bg-slate-50 tw-p-8 tw-text-center"
      >
        <div
          class="tw-mx-auto tw-mb-5 tw-flex tw-h-16 tw-w-16 tw-items-center tw-justify-center tw-rounded-full tw-bg-primary/10"
        >
          <i class="pi pi-building tw-text-3xl tw-text-primary" aria-hidden="true" />
        </div>
        <h2 class="tw-text-xl tw-font-bold tw-text-slate-900">
          {{ t("Become an approved vendor") }}
        </h2>
        <p class="tw-mx-auto tw-mt-3 tw-max-w-md tw-text-sm tw-text-slate-600">
          {{ t("Submit a vendor registration application. Once approved, your vendor profile will appear here.") }}
        </p>
        <RouterLink
          :to="{ name: 'vendor-registration' }"
          class="tw-mt-6 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-xl tw-bg-primary tw-px-5 tw-py-2.5 tw-text-sm tw-font-semibold !tw-text-white tw-no-underline tw-transition hover:tw-opacity-90"
        >
          <i class="pi pi-file-edit !tw-text-white" />
          <span class="!tw-text-white">{{ t("Apply to become a vendor") }}</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import UploadedFileCard from "@/v3/components/applications/UploadedFileCard.vue";
import {
  RFPS_INDEX,
  VENDORS_INDEX,
  VENDORS_PICK,
  VENDORS_APPS_CREATE_PROFILE_UPDATE,
} from "@/v3/config/apiEndpoints.js";
import { apiGet, apiPost } from "@/v3/services/httpClient.js";
import { useLoading } from "@/v3/composables/useLoading.js";
import { useErrorHandler } from "@/v3/composables/useErrorHandler.js";
import { useNotification } from "@/v3/composables/useNotification.js";
import usePageHeading from "@/v3/composables/layout/usePageHeading.js";
import {
  getConflictApplicationId,
  getConflictApplicationNotice,
} from "@/v3/utils/applicationWorkflow.js";

const router = useRouter();
const { t, locale } = useI18n();
const { withLoading, isLoadingKey } = useLoading();
const { capture } = useErrorHandler();
const { error: notifyError, warn } = useNotification();
const { setHeading } = usePageHeading();

const profile = ref(null);
const contacts = ref([]);
const services = ref([]);
const files = ref([]);
const openRegistration = ref(null);
const loadFailed = ref(false);
const isLoading = ref(true);
const vendorRootId = ref(null);
const openRfps = ref([]);

const isRTL = computed(() => locale.value === "ar");

function isCurrentlyOpenRfp(rfp) {
  if (String(rfp?.status || "") !== "open") return false;
  const closesAt = new Date(rfp?.closes_at);
  return !Number.isNaN(closesAt.getTime()) && closesAt.getTime() > Date.now();
}

function rfpDescription(rfp) {
  return isRTL.value
    ? rfp?.description_ar || rfp?.description_en || ""
    : rfp?.description_en || rfp?.description_ar || "";
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(isRTL.value ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

const profileFields = computed(() => [
  { label: "Company Name (Arabic)", value: profile.value?.name_ar },
  { label: "Company Name (English)", value: profile.value?.name_en },
  { label: "Unified Number", value: profile.value?.unified_number },
  { label: "Commercial Registration Number", value: profile.value?.cr_number },
  {
    label: "Commercial Registration Expiry Date",
    value: profile.value?.cr_expiry_date,
  },
  { label: "VAT Registration Number", value: profile.value?.vat_tin },
  { label: "Region", value: profile.value?.region_name },
  { label: "City", value: profile.value?.city_name },
  { label: "Postal Code", value: profile.value?.postal_code },
  { label: "Address", value: profile.value?.address },
  { label: "Email", value: profile.value?.email },
  { label: "Phone", value: profile.value?.telephone },
  { label: "Website", value: profile.value?.website },
]);

function contactFields(contact) {
  return [
    { label: "Name", value: contact?.name },
    { label: "Position", value: contact?.position },
    { label: "Email", value: contact?.email },
    { label: "Mobile Number", value: contact?.mobile },
  ];
}

function serviceName(service) {
  return isRTL.value
    ? service?.name_ar || service?.name_en
    : service?.name_en || service?.name_ar;
}

function isNonterminalStage(stage) {
  const terminal = [
    "approved",
    "rejected",
    "canceled",
    "cancelled",
    "archived",
    "closed",
    "completed",
  ];
  return !terminal.includes(String(stage || "").toLowerCase());
}

function findOpenVendorRegistration(applications) {
  if (!Array.isArray(applications)) return null;
  return (
    applications.find(
      (app) =>
        app?.flow === "Vendors" &&
        app?.purpose === "Vendor Registration" &&
        isNonterminalStage(app?.stage)
    ) || null
  );
}

async function loadVendorState() {
  isLoading.value = true;
  loadFailed.value = false;
  profile.value = null;
  contacts.value = [];
  services.value = [];
  files.value = [];
  openRegistration.value = null;
  vendorRootId.value = null;
  openRfps.value = [];

  try {
    const vendorResponse = await apiGet(VENDORS_INDEX, {
      context: "VendorsIndex.loadVendorState",
    });
    const vendors = Array.isArray(vendorResponse?.vendors)
      ? vendorResponse.vendors
      : [];

    if (vendors.length > 0) {
      const vendor = vendors[0];
      vendorRootId.value = vendor.root_id;

      const detailResponse = await withLoading("vendor-profile-loading", () =>
        apiGet(`${VENDORS_PICK}${vendor.root_id}`, {
          context: "VendorsIndex.loadVendorState",
        })
      );
      profile.value = detailResponse?.vendor_profile || null;
      contacts.value = Array.isArray(detailResponse?.vendor_contacts)
        ? detailResponse.vendor_contacts
        : [];
      services.value = Array.isArray(detailResponse?.selected_services)
        ? detailResponse.selected_services
        : [];
      files.value = Array.isArray(detailResponse?.files)
        ? detailResponse.files
        : [];

      try {
        const rfpResponse = await apiGet(RFPS_INDEX, {
          context: "VendorProfile.loadOpenRfps",
        });
        openRfps.value = (Array.isArray(rfpResponse?.rfps) ? rfpResponse.rfps : [])
          .filter(isCurrentlyOpenRfp);
      } catch (error) {
        capture(error, {
          context: "VendorProfile.loadOpenRfps",
          fallback: "Failed to load RFPs",
        });
      }

      const vendorName = isRTL.value
        ? profile.value?.name_ar || profile.value?.name_en
        : profile.value?.name_en || profile.value?.name_ar;
      setHeading({ title: vendorName || "Vendor Profile", visible: true });
      return;
    }

    setHeading({ title: "Vendor Profile", visible: true });

    const appsResponse = await apiGet("applications/get-user-applications", {
      context: "VendorsIndex.loadVendorState",
    });
    const applications = appsResponse?.applications ?? [];
    openRegistration.value = findOpenVendorRegistration(applications);
  } catch (error) {
    setHeading({ title: "Vendor Profile", visible: true });
    capture(error, {
      context: "VendorsIndex.loadVendorState",
      fallback: "Failed to load vendors",
    });
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function startProfileUpdate() {
  try {
    const response = await withLoading("vendor-profile-update-creating", () =>
      apiPost(`${VENDORS_APPS_CREATE_PROFILE_UPDATE}${vendorRootId.value}`)
    );
    if (response?.application?.id) {
      router.push({
        name: "app-summary",
        params: { locale: locale.value, appId: response.application.id },
      });
    }
  } catch (error) {
    const applicationId = getConflictApplicationId(error);
    if (error?.status === 409 && applicationId) {
      warn(t(getConflictApplicationNotice(error)));
      router.push({
        name: "app-summary",
        params: { locale: locale.value, appId: applicationId },
      });
      return;
    }
    capture(error, {
      context: "VendorsIndex.startProfileUpdate",
      fallback: "Failed to create profile update application",
    });
    notifyError(t("Failed to create profile update application"));
  }
}

onMounted(() => {
  setHeading({ title: "Vendor Profile", visible: true });
  loadVendorState();
});
</script>
