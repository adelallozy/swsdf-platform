<!-- src/v3/components/shared/ConfirmDialog.vue -->
<template>
  <ConfirmDialog>
    <template #message="slotProps">
      <div class="tw-flex tw-items-start tw-gap-4" :dir="dir">
        <!-- Icon -->
        <div 
          class="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center"
          :class="getIconContainerClass(slotProps.message.severity)"
        >
          <i 
            :class="slotProps.message.icon || getDefaultIcon(slotProps.message.severity)"
            class="tw-text-2xl"
          ></i>
        </div>

        <!-- Content -->
        <div class="tw-flex-1" :class="dir === 'rtl' ? 'tw-text-right' : 'tw-text-left'">

          <!-- Message -->
          <p class="tw-text-gray-700 tw-leading-relaxed">
            {{ slotProps.message.message }}
          </p>
        </div>
      </div>
    </template>

    <template #footer="slotProps">
      <div 
        class="tw-flex tw-gap-3 tw-pt-4"
        :class="dir === 'rtl' ? 'tw-flex-row-reverse' : 'tw-flex-row'"
      >
        <!-- Reject Button -->
        <Button
          v-if="!slotProps.message.rejectProps?.hidden"
          :label="slotProps.message.rejectLabel || $t('Cancel')"
          severity="secondary"
          outlined
          @click="slotProps.onReject"
          :disabled="slotProps.message.rejectProps?.disabled"
          class="tw-flex-1 tw-py-2.5"
        />

        <!-- Accept Button -->
        <Button
          :label="slotProps.message.acceptLabel || $t('Confirm')"
          :severity="getSeverity(slotProps.message.severity)"
          @click="slotProps.onAccept"
          :disabled="slotProps.message.acceptProps?.disabled"
          class="tw-flex-1 tw-py-2.5"
        />
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';

const { locale } = useI18n();

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ────────────────────────────────────────────────────────────────────────────

const dir = computed(() => {
  return locale.value === 'ar' ? 'rtl' : 'ltr';
});

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

function getIconContainerClass(severity) {
  const severityMap = {
    success: 'tw-bg-green-100 tw-text-green-600',
    info: 'tw-bg-blue-100 tw-text-blue-600',
    warn: 'tw-bg-yellow-100 tw-text-yellow-600',
    error: 'tw-bg-red-100 tw-text-red-600',
    danger: 'tw-bg-red-100 tw-text-red-600',
    secondary: 'tw-bg-gray-100 tw-text-gray-600'
  };

  return severityMap[severity] || 'tw-bg-blue-100 tw-text-blue-600';
}

function getDefaultIcon(severity) {
  const iconMap = {
    success: 'pi pi-check-circle',
    info: 'pi pi-info-circle',
    warn: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
    danger: 'pi pi-exclamation-triangle',
    secondary: 'pi pi-question-circle'
  };

  return iconMap[severity] || 'pi pi-exclamation-triangle';
}

function getSeverity(severity) {
  // Map confirm dialog severity to button severity
  const severityMap = {
    success: 'success',
    info: 'info',
    warn: 'warn',
    error: 'danger',
    danger: 'danger',
    secondary: 'secondary'
  };

  return severityMap[severity] || 'primary';
}
</script>

<style>
/* Global styles for ConfirmDialog */
.p-confirmdialog {
  @apply tw-rounded-xl tw-shadow-xl;
  max-width: 90vw;
  width: 450px;
}

.p-confirmdialog .p-dialog-header {
  @apply tw-border-b tw-border-gray-200 tw-pb-0;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.p-confirmdialog .p-dialog-content {
  @apply tw-p-6;
}

.p-confirmdialog .p-dialog-footer {
  @apply tw-border-t tw-border-gray-200 tw-pt-0;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* RTL Support */
.p-confirmdialog[dir="rtl"] .p-dialog-header-icons {
  @apply tw-order-first;
}

/* Animation */
.p-confirmdialog-enter-active,
.p-confirmdialog-leave-active {
  transition: all 0.2s ease;
}

.p-confirmdialog-enter-from,
.p-confirmdialog-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .p-confirmdialog {
    width: 95vw;
    margin: 1rem;
  }
  
  .p-confirmdialog .p-dialog-header,
  .p-confirmdialog .p-dialog-content,
  .p-confirmdialog .p-dialog-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>