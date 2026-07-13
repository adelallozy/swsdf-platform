<script setup>
/**
 * LicenseInformationForm — v3 Component
 * - Collects license information (rank, card design) for professional diver applications
 * - Uses MasterForm with schema-driven approach
 * - Follows v3 architecture patterns
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MasterForm from '@/v3/components/Forms/MasterForm.vue';

import { pipe, string, picklist, union, number } from 'valibot';

// ============================================================================
// SCHEMA BUILDER
// ============================================================================

/**
 * Build schema for license information form
 * - Rank selection: radioTiles (Divemaster, Snorkel Guide, Assistant Instructor, EFR Instructor, Instructor, Instructor Trainer)
 * - Card design selection: radioTiles (Only Digital, Hard Copy)
 */
function makeLicenseInformationSchema() {
  return {
    // Rank Selection
    rank: {
      type: 'radioTiles',
      label: 'Professional Diver Rank',
      value: '',
      required: true,
      options: [
        {
          label: 'Divemaster',
          value: 'Divemaster',
          icon: 'pi-certificate'
        },
        {
          label: 'Snorkel Guide',
          value: 'Snorkel Guide',
          icon: 'pi-book'
        },
        {
          label: 'Assistant Instructor',
          value: 'Assistant Instructor',
          icon: 'pi-user'
        },
        {
          label: 'EFR Instructor',
          value: 'EFR Instructor',
          icon: 'pi-user-plus'
        },
        {
          'label': 'Instructor',
          value: 'Instructor',
          icon: 'pi-users'
        },
        {
          label: 'Instructor Trainer',
          value: 'Instructor Trainer',
          icon: 'pi-users'
        }
      ],
      validation: pipe(
        string('Professional Diver Rank is required'),
        picklist(['Divemaster', 'Snorkel Guide', 'Assistant Instructor', 'EFR Instructor', 'Instructor', 'Instructor Trainer'], 'Select a valid rank')
      )
    },
    // Card Design Selection
    card_design_id: {
      type: 'radioTiles',
      label: 'Card Design',
      value: '',
      required: true,
      options: [
        {
          label: 'Only Digital',
          value: 0,
          icon: 'pi-mobile'
        },
        {
          label: 'Hard Copy',
          value: 1,
          icon: 'pi-id-card'
        }
      ],
      validation: pipe(
        union([string('Card Design is required'), number('Card Design is required')]),
        picklist([0, 1, '0', '1'], 'Select a valid card design')
      )
    }
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

const props = defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
  back: {
    type: Object,
    required: false,
    default: null
  },
  initialValues: {
    type: Object,
    required: false,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'validity']);

const { t } = useI18n();

const mfRef = ref(null);

function handleSubmit({ formData }) {
  emit('submit', { formData });
}

function onValidity({ isValid }) {
  emit('validity', { isValid });
}

// Expose MasterForm methods to parent component
defineExpose({
  validateForm: () => mfRef.value?.validateForm?.(),
  submitForm: () => mfRef.value?.submitForm?.(),
  showErrors: () => mfRef.value?.showErrors?.(),
  hideErrors: () => mfRef.value?.hideErrors?.(),
  applyServerErrors: (errors) => mfRef.value?.applyServerErrors?.(errors),
  getFormData: () => mfRef.value?.getFormData?.()
});
</script>

<template>
  <base-card
    title="License Informations"
    desc="Level based on your highest diving qualification"
  >
    <div v-if="loading" class="tw-flex tw-justify-center tw-py-16">
      <i class="pi pi-spinner tw-animate-spin tw-text-3xl tw-text-primary" aria-hidden="true"></i>
    </div>
    <MasterForm
      v-else
      ref="mfRef"
      :schema="makeLicenseInformationSchema()"
      :initialValues="initialValues"
      @submit="handleSubmit"
      @validity="onValidity"
    >
      <div class="tw-flex tw-mt-11 tw-gap-1 tw-justify-end tw-items-center">
        <router-link
          v-if="back"
          :to="back"
          class="base-btn-white tw-rounded-lg"
        >
          {{ t('Previous') }}
        </router-link>
        <button
          type="submit"
          :disabled="loading"
          class="base-btn tw-rounded-lg"
        >
          {{ t('Next') }}
        </button>
      </div>
    </MasterForm>
  </base-card>
</template>
