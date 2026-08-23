<!-- src/v3/pages/applications/ApplicationFileUpload.vue -->
<template>
  <div class="tw-max-w-4xl tw-mx-auto tw-p-6">
    <!-- Loading Application State -->
    <div v-if="isLoadingApplication" class="tw-text-center tw-py-12">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p class="tw-mt-4 tw-text-gray-600">{{ $t('Loading application...') }}</p>
    </div>

    <!-- Content -->
    <div v-else class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-6">
      <!-- Header -->
      <div class="tw-mb-6">
        <h2 class="tw-text-2xl tw-font-bold tw-text-foreground tw-mb-2">
          {{ $t('Upload New File') }}
        </h2>
        <p class="tw-text-gray-600">
          {{ $t('Please upload all required files') }}
        </p>
      </div>

      <!-- Required Files List -->
      <div v-if="requiredFilesList.length > 0" class="tw-mb-6 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
        <h4 class="tw-font-semibold tw-text-red-800 tw-mb-3 tw-flex tw-items-center tw-gap-2">
          <i class="pi pi-exclamation-triangle"></i>
          {{ $t('Required Files') }}
        </h4>
        <ul class="tw-space-y-2 tw-ps-3">
          <li
            v-for="fileName in requiredFilesList"
            :key="fileName"
            class="tw-text-red-700 tw-font-medium tw-flex tw-items-center tw-gap-2"
          >
            <span class="tw-text-red-500">●</span>
            <span>{{ $t(fileName) }}</span>
          </li>
        </ul>
      </div>

      <!-- Upload Form -->
      <MasterForm
        v-if="application && filesReady"
        :key="formKey"
        ref="formRef"
        :schema="formSchema"
        @submit="handleSubmit"
        @validity="handleValidity"
      />

      <!-- Loading Files State -->
      <div v-else-if="isLoadingKey('files-fetching')" class="tw-text-center tw-py-8">
        <ProgressSpinner style="width: 40px; height: 40px" />
        <p class="tw-mt-3 tw-text-gray-600">{{ $t('Loading files...') }}</p>
      </div>

      <!-- Actions -->
      <div class="tw-flex tw-gap-2 tw-items-center tw-justify-end tw-mt-5">
        <router-link
          :to="backRoute"
          class="tw-px-4 tw-py-2 tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg tw-no-underline tw-transition-colors tw-font-medium"
        >
          {{ $t("Cancel") }}
        </router-link>
        <button
          type="button"
          @click="submitForm"
          :disabled="isLoadingKey('file-uploading') || !isFormValid || !filesReady"
          class="tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-min-w-[100px] disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-transition-colors tw-font-medium"
        >
          <ProgressSpinner 
            v-if="isLoadingKey('file-uploading')" 
            style="width: 20px; height: 20px" 
            class="tw-inline-block"
          />
          <span v-else>{{ $t("Upload") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { string, pipe, minLength, custom } from 'valibot';
import ProgressSpinner from 'primevue/progressspinner';
import MasterForm from '@/v3/components/Forms/MasterForm.vue';
import { useApplicationFiles } from '@/v3/composables/application/useApplicationFiles';
import { useApplicationStore } from '@/v3/composables/useApplicationStore';
import { useErrorHandler } from '@/v3/composables/useErrorHandler';
import { useLoading } from '@/v3/composables/useLoading';
import usePageHeading from '@/v3/composables/layout/usePageHeading';
import { useToast } from 'primevue/usetoast';
import { resolveConfiguredApplicationType } from '@/v3/config/application-config.js';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { capture } = useErrorHandler();
const { isLoadingKey } = useLoading();
const { setHeading } = usePageHeading();
const toast = useToast();

const { application, loadApplication } = useApplicationStore();

const formRef = ref(null);
const isFormValid = ref(false);
const isLoadingApplication = ref(false);
const formKey = ref(0);
const filesReady = ref(false);
const configuredApplicationType = computed(() => {
  // application.purpose is deprecated in new v3 work. Keep it only as a
  // compatibility fallback while older upload flows still migrate to flow.
  return resolveConfiguredApplicationType(application.value?.flow, application.value?.purpose);
});

// Files composable - initialized after application loads
let filesComposable = null;
const files = ref([]);
const missingRequiredFiles = ref([]);
const acceptedFiles = ref([]);

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────────────
console.log(application.value?.id);
const backRoute = computed(() => ({
			name: "application-home",
			params: {
				id: application.value?.id,
			},
		}));

const requiredFilesList = computed(() => {
  return missingRequiredFiles.value.filter(name => name !== 'Other');
});

// Available file types: prioritize missing required files, fallback to accepted files
const availableFileTypes = computed(() => {
  const filesList = missingRequiredFiles.value.length > 0 
    ? missingRequiredFiles.value 
    : acceptedFiles.value;
  
  return filesList;
});

// ────────────────────────────────────────────────────────────────────────────
// FORM SCHEMA
// ────────────────────────────────────────────────────────────────────────────

const formSchema = computed(() => {
  const preselectedType = route.query.requiredFile;
  
  return {
    type: {
      type: 'select',
      label: 'File Type',
      placeholder: 'Choose file type',
      value: preselectedType || '',
      options: availableFileTypes.value,
      required: true,
      validation: pipe(
        string(),
        minLength(1, 'File Type is required')
      )
    },
    file: {
      type: 'file',
      label: 'File',
      placeholder: 'Choose a file or drag it here',
      value: null,
      required: true,
      attrs: {
        accept: 'image/png,image/webp,image/jpeg,application/pdf',
        maxSize: 2 * 1024 * 1024, // 2MB
        description: t('Accepted formats: PNG, WEBP, JPEG, PDF')
      },
      validation: pipe(
        custom((value) => value instanceof File, 'File is required'),
        custom(
          (value) => value && value.size <= 2 * 1024 * 1024,
          'File size must be less than 2MB'
        ),
        custom(
          (value) => {
            if (!value) return false;
            const type = value.type;
            return type === 'application/pdf' || type.startsWith('image/');
          },
          'File must be in format of PDF or Image'
        )
      )
    },
    expire_date: {
      type: 'DatePicker',
      label: 'Expire Date',
      placeholder: 'Enter expiry date',
      value: null,
      required: false,
      attrs: {
        minDate: new Date(Date.now() + 86400000) // Tomorrow
      }
    }
  };
});

// ────────────────────────────────────────────────────────────────────────────
// METHODS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Initialize files composable after application loads
 */
async function initializeFilesComposable() {
  if (!configuredApplicationType.value) {
    console.error('Cannot initialize files composable: configured application type is missing');
    return;
  }

  try {
    // Create files composable with application data
    filesComposable = useApplicationFiles(
      route.params.id,
      configuredApplicationType.value
    );

    // Load files
    await filesComposable.loadFiles();

    // Update reactive refs
    files.value = filesComposable.files.value;
    missingRequiredFiles.value = filesComposable.missingRequiredFiles.value;
    acceptedFiles.value = filesComposable.acceptedFiles.value;

    // Mark files as ready
    filesReady.value = true;
    
    // Force form re-render with new data
    formKey.value++;
  } catch (err) {
    capture(err, {
        context: 'ApplicationFileUpload.initializeFilesComposable',
        fallback: 'Failed to initialize files',
        meta: { 
          applicationId: route.params.id,
          applicationType: configuredApplicationType.value
        }
    });
  }
}

function handleValidity({ isValid }) {
  isFormValid.value = isValid;
}

function submitForm() {
  if (formRef.value) {
    formRef.value.submitForm();
  }
}

async function handleSubmit({ formData }) {
  if (!filesComposable) {
    toast.add({
      severity: 'error',
      summary: t('Error'),
      detail: t('Unable to upload file. Please try again.'),
      life: 3000
    });
    return;
  }

  try {
    await filesComposable.uploadFile(formData);

    toast.add({
      severity: 'success',
      summary: t('Success'),
      detail: t('File uploaded successfully'),
      life: 3000
    });

    router.push(backRoute.value);
  } catch (err) {
    capture(err, {
      context: 'ApplicationFileUpload.handleSubmit',
      fallback: 'Failed to upload file. Please try again.',
      meta: {
        applicationId: route.params.id,
        fileType: formData.type
      }
    });

    // Apply server errors if 422
    if (err.status === 422 && err.errors && formRef.value) {
      formRef.value.applyServerErrors(err.errors);
    } else {
      // Show generic error toast
      toast.add({
        severity: 'error',
        summary: t('Error'),
        detail: t('Failed to upload file. Please try again.'),
        life: 3000
      });
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ────────────────────────────────────────────────────────────────────────────

onMounted(async () => {
  setHeading({
    title: 'Upload New File',
    visible: true
  });
		console.log('route.params.id' , route.params.id)

  // Load application if it's null (page refresh case)
  if (!application.value) {
    isLoadingApplication.value = true;
    try {
      await loadApplication(route.params.id);
    } catch (err) {
      capture(err, {
        context: 'ApplicationFileUpload.onMounted',
        fallback: 'Failed to load application',
        meta: { applicationId: route.params.id }
      });
      
      // Redirect back if application fails to load
      toast.add({
        severity: 'error',
        summary: t('Error'),
        detail: t('Failed to load application'),
        life: 3000
      });
      
      router.push({
        name: 'applications-list',
        params: { locale: route.params.locale }
      });
      return;
    } finally {
      isLoadingApplication.value = false;
    }
  }

  // Initialize files composable after application is loaded
  await initializeFilesComposable();
});
</script>

<!--
USAGE:
======
Route: /:locale/platform/applications/:appId/file-upload
Query params: ?requiredFile=TeamLicense (optional, pre-selects file type)

FEATURES:
=========
- Loads application first if null (page refresh)
- Then resolves configured application type from flow first and purpose fallback second
- Form only renders when both application and files are ready
- Select options update reactively after files load
- Shows missing required files prominently
- Smart file type dropdown (required files first, then accepted)
- Success toast and redirect after upload
- Error handling with server validation

LOADING STATES:
===============
- Application loading: Shows spinner
- Files loading: Shows spinner
- File uploading: Button shows spinner and is disabled

ROUTE NAME:
===========
Uses 'app-summary' for back navigation
-->


 
 
