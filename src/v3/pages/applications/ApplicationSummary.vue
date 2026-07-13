<!-- VERSION: 2.4.0 -->
<!-- FILE: src/v3/pages/applications/ApplicationSummary.vue -->
<!-- Dynamic component renderer with application actions -->

<template>
  <div class="tw-pt-8 tw-px-4 tw-pb-16">
    <!-- Loading --> 
    <div v-if="isLoading" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true" />
    </div>

    <!-- Error -->
    <Message
      v-else-if="!application"
      severity="warn"
      variant="simple"
      :closable="false"
      class="tw-max-w-3xl tw-mx-auto"
    >
      {{ t('Application not found') }}
    </Message>

    <!-- Summary -->
    <section v-else class="tw-max-w-5xl tw-mx-auto tw-space-y-8">
      
      <!-- Dynamic Components from Layout -->
      <component 
        v-for="comp in layoutComponents" 
        :is="comp.component"
        :key="comp.name"
      />

      <!-- Progress & Actions Combined -->
      <div v-if="showActions" class="tw-space-y-6">
        <!-- Progress Section -->
        <div v-if="canModifyApplication">          
          <!-- Progress Bar -->
          <!-- All Complete Message -->
          <div v-if="canSubmit" class="tw-mt-4">
            <div class="tw-flex tw-items-center tw-gap-2 tw-p-3 tw-bg-green-50 tw-rounded-lg">
              <span class="tw-text-sm tw-font-medium tw-text-green-700">
                {{ t('All requirements completed. Ready to submit!') }}
              </span>
              <i class="pi pi-check-circle tw-text-green-600" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
          <!-- Stage Info -->
          <div class="tw-text-sm tw-text-slate-600">
    
          </div>
          
          <div class="tw-flex tw-gap-3">
            <!-- Delete Button -->
            <button
              v-if="canDeleteApplication"
              type="button"
              :disabled="isLoadingKey('application-deleting')"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-slate-600 hover:tw-text-red-600 tw-transition disabled:tw-opacity-50"
              @click="confirmDelete"
            >
              {{ t('Delete') }}
              <i v-if="!isLoadingKey('application-deleting')" class="pi pi-trash" aria-hidden="true"></i>
              <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            </button>

            <!-- Next Button -->
            <button
              v-if="canModifyApplication && !canSubmit"
              type="button"
              :disabled="store.isLoadingKey('application')"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-text-primary tw-bg-primary/10 hover:tw-bg-primary/20 tw-rounded-lg tw-transition disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              @click="handleNext"
            >
              {{ t('Next') }}
              <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" aria-hidden="true"></i>
            </button>

            <!-- Submit Button -->
            <button
              v-if="canModifyApplication && canSubmit"
              type="button"
              :disabled="isLoadingKey('application-submitting')"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-text-white tw-bg-primary hover:tw-bg-primary-dark tw-rounded-lg tw-transition disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              @click="handleSubmit"
            >
              {{ isLoadingKey('application-submitting') ? t('Submitting...') : submitButtonLabel }}
              <i v-if="!isLoadingKey('application-submitting')" class="pi pi-send" aria-hidden="true"></i>
              <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            </button>

            <!-- Recall Button -->
            <button
              v-else-if="canRecallApplication"
              type="button"
              :disabled="isLoadingKey('application-recalling')"
              class="tw-inline-flex tw-items-center tw-gap-2 tw-px-6 tw-py-3 tw-text-base tw-font-medium tw-text-primary tw-bg-primary/10 hover:tw-bg-primary/20 tw-rounded-lg tw-transition disabled:tw-opacity-50"
              @click="handleRecall"
            >
              {{ isLoadingKey('application-recalling') ? t('Recalling...') : t('Recall Application') }}
              <i
                v-if="!isLoadingKey('application-recalling')"
                :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"
                aria-hidden="true"
              ></i>
              <i v-else class="pi pi-spinner tw-animate-spin" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { defineAsyncComponent, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import Message from 'primevue/message';

import { useLoading } from '@/v3/composables/useLoading.js';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import {
  getSummaryLayout,
  getBlockingSteps,
  resolveApplicationDisplayName,
  resolveConfiguredApplicationType
} from '@/v3/config/application-config.js';
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js';
import { useNotification } from '@/v3/composables/useNotification.js';
import usePageHeading from '@/v3/composables/layout/usePageHeading';
import {
  getConflictApplicationId,
  isApplicantRevisionStage
} from '@/v3/utils/applicationWorkflow.js';

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT REGISTRY (Dynamic Imports with Lazy Loading)
// ────────────────────────────────────────────────────────────────────────────
// <ActionsTrackingCard />  /v3/components/applications/cards/ActionsTrackingCard.vue
const COMPONENT_REGISTRY = {
  // Application Info
  'ApplicationInfoCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/ApplicationInfoCard.vue')
  ),

  'ActionsTrackingCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/ActionsTrackingCard.vue')
  ),

  'ApplicantPersonalPhotoCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/ApplicantPersonalPhotoCard.vue')
  ),
  
  // Sport Fishing Competition
  'EventInfoCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/EventInfoCard.vue')
  ),
  'SFTeamCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/SFTeamCard.vue')
  ),
  'SFParticipantsCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/SFParticipantsCard.vue')
  ),
  'ApplicantProfileCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/ApplicantProfileCard.vue')
  ),
  'PDLicenseInformationCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/PDLicenseInformationCard.vue')
  ),
  
  // Athlete Registration
  'SportSelectionCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/SportSelectionCard.vue')
  ),

  // 'AthletePortraitCard': defineAsyncComponent(() => 
  //   import('@/v3/components/applications/cards/AthletePortraitCard.vue')
  // ),
  
  // Diving Center
  'DivingCenterProfileCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/DivingCenterProfileCard.vue')
  ),
  'DivingCenterActivitiesCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/DivingCenterActivitiesCard.vue')
  ),
  'DivingCenterInternationalMembershipsCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/DivingCenterInternationalMembershipsCard.vue')
  ),
  'DivingCenterAdministratorsCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/DivingCenterAdministratorsCard.vue')
  ),
  'ActiveFilesCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/ActiveFilesCard.vue')
  ),
  
  // Jetski Competition
  // 'SportParticipation': defineAsyncComponent(() => 
  //   import('@/v3/components/applications/cards/SportParticipation.vue')
  // ),
  // 'ProfileDetails': defineAsyncComponent(() => 
  //   import('@/v3/components/applications/cards/ProfileDetails.vue')
  // ),
  
  // Diver Profiles
  // 'DiverProfile': defineAsyncComponent(() => 
  //   import('@/v3/components/applications/cards/DiverProfile.vue')
  // ),
  // 'ProfessionalDiverProfile': defineAsyncComponent(() =>
  //   import('@/v3/components/applications/cards/ProfessionalDiverProfile.vue')
  //   ),
  
  'PDMembershipsCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/PDMembershipsCard.vue')
    ),
  
  'PDWorkContractsCard': defineAsyncComponent(() =>
    import('@/v3/components/applications/cards/PDWorkContractsCard.vue')
    ),
  
  // Shared Components
  'FilesCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/FilesCard.vue')
  ),
  'ApplicationFeesCard': defineAsyncComponent(() => 
    import('@/v3/components/applications/cards/ApplicationFeesCard.vue')
  ),
  // 'ActionsTrackingCard': defineAsyncComponent(() => 
  //   import('@/v3/components/applications/cards/ActionsTrackingCard.vue')
  //   ),
  // 'WaiverCard': defineAsyncComponent(() => 
  //   import('@/v3/components/applications/cards/WaiverCard.vue')
  //   ),
};

// ────────────────────────────────────────────────────────────────────────────
// COMPOSABLES
// ────────────────────────────────────────────────────────────────────────────

const { t, te, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const { isLoadingKey } = useLoading();
const store = useApplicationStore();
const { capture } = useErrorHandler();
const { error: notifyError, warn: notifyWarn } = useNotification();

const { setHeading } = usePageHeading();
// ────────────────────────────────────────────────────────────────────────────
// COMPUTED - Application Data
// ────────────────────────────────────────────────────────────────────────────

const application = computed(() => store.application.value);
const applicationType = computed(() => {
  // application.purpose is deprecated in new v3 work. Keep it only as a
  // fallback while older flows and configs are still being migrated.
  return resolveConfiguredApplicationType(application.value?.flow, application.value?.purpose);
});

const isLoading = computed(() => {
  return store.isLoadingKey('application');
});

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED - Dynamic Layout
// ────────────────────────────────────────────────────────────────────────────

const layoutComponents = computed(() => {
  if (!applicationType.value) {
    return [];
  }

  const layout = getSummaryLayout(applicationType.value);
  
  if (!layout || layout.length === 0) {
    console.warn(`ApplicationSummary: No layout found for type "${applicationType.value}"`);
    return [];
  }

  return layout
    .map(componentName => {
      const component = COMPONENT_REGISTRY[componentName];
      
      if (!component) {
        console.warn(`ApplicationSummary: Component "${componentName}" not found in registry`);
        return null;
      }
      
      return {
        name: componentName,
        component
      };
    })
    .filter(Boolean);
});

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED - Progress & Validation
// ────────────────────────────────────────────────────────────────────────────

const blockingSteps = computed(() => {
  if (!applicationType.value) return [];
  return getBlockingSteps(applicationType.value);
});

const totalStepsCount = computed(() => {
  return blockingSteps.value.length;
});

const completedStepsCount = computed(() => {
  const invalidCount = Object.keys(store.stepsValidationErrors.value).length;
  return Math.max(0, totalStepsCount.value - invalidCount);
});

const canSubmit = computed(() => {
  return store.canSubmitApplication.value;
});

const canModifyApplication = computed(() => store.canModifyApplication.value);
const canDeleteApplication = computed(() => store.canDeleteApplication.value);
const canRecallApplication = computed(() => store.canRecallApplication.value);

const showActions = computed(() => {
  return canModifyApplication.value || canRecallApplication.value;
});

const isRtl = computed(() => locale.value === 'ar');
const submitButtonLabel = computed(() => {
  return isApplicantRevisionStage(application.value?.stage)
    ? t('Resubmit Application')
    : t('Submit Application');
});

const nextIncompleteStepId = computed(() => store.nextIncompleteStepId.value);

// ────────────────────────────────────────────────────────────────────────────
// ACTIONS - Submit / Recall / Delete
// ────────────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!canSubmit.value) {
    notifyWarn(t('Please complete all required steps before submitting.'));
    return;
  }
  
  try {
    await store.submitApplication(application.value.id);
    
    router.push({ 
      name: 'user-applications',
      params: { locale: locale.value }
    });
  } catch (err) {
    if (err?.status === 409) {
      const conflictApplicationId = getConflictApplicationId(err);

      if (conflictApplicationId) {
        notifyError(t('You already have another Application'));
        router.replace({
          name: 'app-summary',
          params: { appId: conflictApplicationId, locale: locale.value }
        });
        return;
      }
    }

    capture(err, {
      context: 'ApplicationSummary.handleSubmit',
      fallback: t('Failed to submit application. Please try again.'),
      meta: { applicationId: application.value.id }
    });
    notifyError(t('Failed to submit application. Please try again.'));
  }
}

async function handleNext() {
  const stepId = nextIncompleteStepId.value;
  if (!stepId) return;

  const action = store.getStepPrimaryAction(stepId);
  if (typeof action === 'function') {
    action();
    return;
  }

  await nextTick();
  const el = document.querySelector(`[data-step-id="${stepId}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handleRecall() {
  confirm.require({
    message: t('Recall this application back to draft?'),
    header: t('Confirm Recall'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('Yes, Recall'),
    rejectLabel: t('Cancel'),
    accept: async () => {
      try {
        await store.recallApplication(application.value.id);
      } catch (err) {
        capture(err, {
          context: 'ApplicationSummary.handleRecall',
          fallback: t('Failed to recall application. Please try again.'),
          meta: { applicationId: application.value.id }
        });
        notifyError(t('Failed to recall application. Please try again.'));
      }
    }
  });
}

function confirmDelete() {
  confirm.require({
    message: t('This will permanently delete your application. This action cannot be undone.'),
    header: t('Delete Application?'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('Delete'),
    rejectLabel: t('Cancel'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteApplication(application.value.id);
        
        router.push({ 
          name: 'user-applications',
          params: { locale: locale.value }
        });
      } catch (err) {
        capture(err, {
          context: 'ApplicationSummary.confirmDelete',
          fallback: t('Failed to delete application. Please try again.'),
          meta: { applicationId: application.value.id }
        });
        notifyError(t('Failed to delete application. Please try again.'));
      }
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// LIFECYCLE - Load Application (Unified loading with payload)
// ────────────────────────────────────────────────────────────────────────────

onMounted(async () => {
  const appId = route.params.appId || route.params.id;
  
  if (!appId) {
    console.error('[ApplicationSummary] No application ID in route params');
    return;
  }
  
  try {
    // Unified loading: Load application with payload in single call
    await store.loadApplication(appId, {
      withPayload: true,
      // payloadKeys will be fetched from config automatically
    });
    
    // Optional: Load additional data if needed (backward compatibility)
    // await store.loadApplicationData();
    
    // console.log('[ApplicationSummary] All data loaded successfully');
    
  } catch (err) {
    if (err?.status === 404) {
      router.replace({
        name: 'error-404',
        params: {
          locale: locale.value,
          redirect: route.fullPath
        }
      });
    } else {
      capture(err, {
        context: 'ApplicationSummary.onMounted',
        fallback: 'Failed to load application data',
        meta: { applicationId: appId }
      });
    }
  }
  
  const headingTitle = resolveApplicationDisplayName(
    application.value?.flow,
    application.value?.purpose
  );
  const resolvedHeadingTitle =
    headingTitle && te(headingTitle) ? t(headingTitle) : headingTitle || '';

  setHeading({
    title: resolvedHeadingTitle,
    visible: true
  });
});

onBeforeUnmount(() => {
  // Cleanup: Clear all step errors
  store.clearAllStepErrors();
});
</script>

<!--
VERSION: 2.4.1

CHANGES IN v2.4.1:
==================
- Resolves summary layout and blocking steps from configured application type
- Keeps application.purpose only as a legacy fallback through resolveConfiguredApplicationType()
- Removes outdated two-step loading note

CHANGES IN v2.4.0:
==================
- Uses store.submitApplication() with actual API call
- Uses store.recallApplication() with actual API call  
- Uses store.deleteApplication() with actual API call
- Removed withLoading wrapper (store handles loading internally)
- Clear separation of concerns

LOADING PROCESS:
================
1. Mount with appId from route params
2. Load application metadata and payload in one call (store.loadApplication)
3. Resolve configured type from flow first, purpose fallback second
4. Render dynamic components based on layout config

FEATURES:
=========
- Dynamic component rendering based on config
- Progress tracking with visual progress bar
- Submit or resubmit application (draft or applicant revision stage)
- Recall application (Data Verification stage)
- Delete application (draft stage)
- Validation warnings
- Loading states managed by store
-->
