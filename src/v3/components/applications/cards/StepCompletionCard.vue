<!-- FILE: src/v3/components/applications/cards/StepCompletionCard.vue -->
<template>
  <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-6">
    <!-- Header -->
    <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
      <h3 class="tw-text-lg tw-font-semibold tw-text-slate-900">
        {{ $t('Application Progress') }}
      </h3>
      <span class="tw-text-sm tw-font-medium tw-text-slate-600">
        {{ completedCount }} / {{ totalCount }} {{ $t('completed') }}
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="tw-mb-6" aria-label="Progress" :aria-valuenow="progressPercentage" aria-valuemin="0" aria-valuemax="100">
      <div class="tw-w-full tw-bg-slate-100 tw-rounded-full tw-h-3 tw-overflow-hidden" role="progressbar">
        <div
          class="tw-h-full tw-bg-primary tw-transition-all tw-duration-500"
          :style="{ width: String(progressPercentage) + '%' }"
        ></div>
      </div>
      <p class="tw-text-xs tw-text-slate-500 tw-mt-2 tw-text-right">
        {{ progressPercentage }}% {{ $t('complete') }}
      </p>
    </div>

    <!-- Steps -->
    <div class="tw-space-y-3">
      <div
        v-for="(step, index) in steps"
        :key="step?.id || index"
        v-if="step"
        class="tw-flex tw-items-start tw-gap-3 tw-p-3 tw-rounded-lg tw-transition"
        :class="step.completed ? 'tw-bg-green-50' : 'tw-bg-slate-50'"
      >
        <!-- Icon -->
        <div class="tw-flex-shrink-0 tw-mt-0.5" aria-hidden="true">
          <i
            v-if="step.completed"
            class="pi pi-check-circle tw-text-green-600 tw-text-xl"
          ></i>
          <i
            v-else
            class="pi pi-circle tw-text-slate-400 tw-text-xl"
          ></i>
        </div>

        <!-- Content -->
        <div class="tw-flex-1">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-1">
            <span
              class="tw-font-medium"
              :class="step.completed ? 'tw-text-green-900' : 'tw-text-slate-700'"
            >
              {{ $t(step.label) }}
            </span>

            <!-- Required Badge -->
            <span
              v-if="step.blocking"
              class="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium tw-bg-red-100 tw-text-red-800"
            >
              {{ $t('Required') }}
            </span>
          </div>

          <!-- Status Text -->
          <p
            class="tw-text-sm"
            :class="step.completed ? 'tw-text-green-700' : 'tw-text-slate-500'"
          >
            {{ step.completed ? $t('Completed') : $t('Incomplete') }}
          </p>
        </div>
      </div>
    </div>

    <!-- All Complete Message -->
    <div
      v-if="completedCount === totalCount && totalCount > 0"
      class="tw-mt-4 tw-p-4 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg"
      role="status"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <i class="pi pi-check-circle tw-text-green-600 tw-text-xl" aria-hidden="true"></i>
        <span class="tw-text-sm tw-font-medium tw-text-green-700">
          {{ $t('All steps completed! You can now submit your application.') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  steps: {
    type: Array,
    required: true,
    default: () => []
  },
  completedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  progressPercentage: {
    type: Number,
    default: 0
  }
})
</script>
