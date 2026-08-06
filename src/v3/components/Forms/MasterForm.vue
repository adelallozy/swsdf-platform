<template>
  <form @submit.prevent="submitForm">
    <!-- Error summary -->
    <Message
      v-if="showSummary && hasErrors"
      class="tw-mb-4"
      severity="danger"
      variant="simple"
      :closable="false"
    >
      <div class="tw-flex tw-items-start tw-gap-2">
        <i class="pi pi-exclamation-triangle tw-mt-0.5"></i>
        <div>
          <div class="tw-font-semibold">
            {{
              hasSummaryErrors
                ? ($t('Please fix the following errors') || 'Please fix the following errors:')
                : ($t('Please check the highlighted fields below') || 'Please check the highlighted fields below.')
            }}
          </div>
          <ul v-if="hasSummaryErrors" class="tw-list-disc tw-ps-5 tw-mt-1">
            <li v-for="(m, i) in summaryMessages" :key="i">{{ formatMsg(m) }}</li>
          </ul>
        </div>
      </div>
    </Message>

    <!-- Fields -->
    <div
      v-for="(input, key) in schemaData"
      :key="key"
      class="tw-flex-auto tw-w-100 tw-flex-col tw-mb-5 input_wrapper"
      :class="{ error: !!err(key) }"
    >
      <label :id="`${key}-label`" class="tw-block tw-font-semibold tw-mb-1" size="large" :for="key">
        {{ resolveText(input.label) }}
        <i v-if="input.required" class="pi pi-asterisk" style="font-variant-position: super; font-size: .7rem"></i>
      </label>
  
      <!-- Autocomplete component (string arrays, no optionLabel/optionValue) -->
      <component
        v-if="input.type === 'autocomplete'"
        :is="fieldComponents[input.type]"
        :id="key"
        v-model="formData[key]"
        :placeholder="resolveText(input.placeholder)"
        :suggestions="input.filteredOptions ?? getFieldOptions(key)"
        :dropdown="input.attrs?.dropdown ?? true"
        :completeOnFocus="input.attrs?.completeOnFocus ?? false"
        :forceSelection="input.attrs?.forceSelection ?? false"
        class="tw-w-full pv-field"
        :attrs="resolveComponentAttrs(input.attrs)"
        :invalid="!!err(key)"
        :aria-invalid="!!err(key)"
        :aria-labelledby="`${key}-label`"
        :required="!!input.required"
        @blur="onFieldBlur(key)"
        @change="onFieldChange(key)"
        @complete="(event) => onAutocompleteComplete(key, event)"
      />
  
      <!-- Select, multiselect, radioTiles components (object arrays with optionLabel/optionValue) -->
      <component
        v-else-if="input.type === 'select' || input.type === 'multiselect' || input.type === 'radioTiles'"
        :is="fieldComponents[input.type]"
        :id="key"
        v-model="formData[key]"
        :placeholder="resolveText(input.placeholder)"
        :options="getFieldOptions(key)"
        :optionLabel="getOptionLabel"
        :optionValue="getOptionValue"
        class="tw-w-full pv-field"
        v-bind="resolveComponentAttrs(input.attrs)"
        :attrs="resolveComponentAttrs(input.attrs)"
        :invalid="!!err(key)"
        :aria-invalid="!!err(key)"
        :aria-labelledby="`${key}-label`"
        :required="!!input.required"
        @blur="onFieldBlur(key)"
        @change="onFieldChange(key)"
      />

      <!-- Other field types -->
      <component
        v-else-if="usePasswordComponent(input)"
        :is="fieldComponents[getFieldComponentType(input)]"
        :inputId="key"
        v-model="formData[key]"
        class="tw-w-full pv-field"
        v-bind="resolvePasswordComponentProps(input)"
        :invalid="!!err(key)"
        :aria-invalid="!!err(key)"
        @blur="onFieldBlur(key)"
        @input="onFieldInput(key)"
        @change="onFieldChange(key)"
      />

      <!-- Other field types -->
      <component
        v-else
        :is="fieldComponents[input.type]"
        :id="key"
        v-model="formData[key]"
        :placeholder="resolveText(input.placeholder)"
        :options="input.options"
        class="tw-w-full pv-field"
        v-bind="resolveComponentAttrs(input.attrs)"
        :attrs="resolveComponentAttrs(input.attrs)"
        :invalid="!!err(key)"
        :aria-invalid="!!err(key)"
        @blur="onFieldBlur(key)"
        @input="onFieldInput(key)"
        @change="onFieldChange(key)"
        @validationError="onValidationError(key, $event)"
      />
  
      <Message
        v-if="err(key)"
        class="p-error"
        size="small"
        severity="danger"
        variant="simple"
        :closable="false"
      >
        {{ formatMsg(err(key)) }}
      </Message>
    </div>
  
    <!-- Keep a native submit for a11y -->
    <button type="submit" class="tw-hidden">submit</button>
  </form>
</template>

<script setup>
import Message from 'primevue/message'
import { safeParse } from 'valibot'
import { reactive, shallowReactive, onMounted, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
  
/* i18n */
const { te, t } = useI18n()
  
/* Props & Emits */
const props = defineProps({
  schema: { type: Object, required: true },
  formOptions: { type: Object, default: () => ({}) },
  initialValues: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['submit', 'validity', 'field-change'])
  
/* State */
const fieldComponents = shallowReactive({})
const vErrors = reactive({})
const schemaData = reactive({ ...props.schema })
const showSummary = ref(false)
const formData = reactive({}) // Track current user input to prevent premature validation
  
/* Lazy-load inputs */
const loadFieldComponent = async (type) => {
  if (fieldComponents[type]) return
  const loaders = {
    text: () => import('primevue/inputtext'),
    number: () => import('primevue/inputtext'),
    email: () => import('primevue/inputtext'),
    password: () => import('primevue/inputtext'),
    passwordMasked: () => import('primevue/password'),
    textarea: () => import('primevue/textarea'),
    select: () => import('primevue/select'),
    multiselect: () => import('primevue/multiselect'),
    autocomplete: () => import('primevue/autocomplete'),
    DatePicker: () => import('@/v3/components/Forms/DatePicker.vue'),
    LocationPicker: () => import('@/v3/components/Forms/LocationPicker.vue'),
    radioTiles: () => import('@/v3/components/Forms/RadioTiles.vue'),
    TagsInput: () => import('@/v3/components/Forms/TagsInput.vue'),
    file: () => import('@/v3/components/Forms/FileUploader.vue'),
    PhotoInput: () => import('@/v3/components/Forms/PhotoInput.vue'),
  }
  const loader = loaders[type]
  if (!loader) return
  fieldComponents[type] = (await loader()).default
}

/* Helper to get options for a field */
function getFieldOptions(key) {
  // Priority: formOptions (dynamic) > schema options (static)
  return props.formOptions?.[key] || schemaData[key]?.options || []
}
  
/* Select component helpers */
function getOptionLabel(option) {
  try {
    // If option is a string, translate it
    if (typeof option === 'string') {
      return t(option);
    }
    // If option is an object with 'name' property
    if (option && typeof option === 'object' && option.name) {
      return t(option.name);
    }
    // If option is an object with 'label' property
    if (option && typeof option === 'object' && option.label) {
      return t(option.label);
    }
    return option
  } catch (error) {
    // If translation fails, return the original value
    console.warn('Translation error for option:', option, error)
    return typeof option === 'string' ? option : (option?.label || option?.name || String(option))
  }
}
  
function getOptionValue(option) {
  // If option is a string, return as-is
  if (typeof option === 'string') {
    return option
  }
  // If option is an object with 'id' property
  if (option && typeof option === 'object' && option.id) {
    return option.id
  }
  // If option is an object with 'value' property
  if (option && typeof option === 'object' && option.value) {
    return option.value
  }
  return option
}
  
/* Messaging helpers */
function resolveText(value) {
  if (!value) return ''
  if (typeof value !== 'string') return String(value)
  try {
    return t(value)
  } catch (error) {
    // If translation fails, return the original value
    console.warn('Translation error for key:', value, error)
    return value
  }
}

function formatMsg(msg) {
  if (!msg) return ''
  if (typeof msg !== 'string') return String(msg)
  return resolveText(msg)
}
  
function resolveComponentAttrs(attrs) {
  if (!attrs || typeof attrs !== 'object') {
    return undefined
  }
  const raw = attrs.attrs && typeof attrs.attrs === 'object' ? attrs.attrs : attrs
  const resolved = { ...raw }
  if (resolved.placeholder) {
    resolved.placeholder = resolveText(resolved.placeholder)
  }
  return resolved
}

function usePasswordComponent(input) {
  return input?.type === 'password' && !!input?.componentProps?.toggleMask
}

function getFieldComponentType(input) {
  return usePasswordComponent(input) ? 'passwordMasked' : input?.type
}

function resolvePasswordComponentProps(input) {
  const attrs = resolveComponentAttrs(input?.attrs)
  const componentProps =
    input?.componentProps && typeof input.componentProps === 'object'
      ? { ...input.componentProps }
      : {}
  const inputProps = { ...(attrs || {}) }

  delete inputProps.placeholder
  delete inputProps.type

  inputProps.class = ['tw-w-full', inputProps.class].filter(Boolean).join(' ')

  return {
    ...componentProps,
    placeholder: resolveText(input?.placeholder || input?.attrs?.placeholder),
    inputProps,
  }
}

function err(key) {
  return vErrors[key] || ''
}
  
/* Validation: a field */
function validate(key) {
  delete vErrors[key]
  const fieldSchema = schemaData[key]?.validation
  
  if (!fieldSchema) return
  
  const value = formData[key]
  try {
    const { success, issues } = safeParse(fieldSchema, value, { abortPipeEarly: true })
    if (!success && Array.isArray(issues)) {
      issues.forEach((i) => (vErrors[key] = i.message))
    }
  } catch (err) {
    vErrors[key] = 'Invalid value'
  }
}
  
/* Validation: the whole form */
function validateForm() {
  let ok = true
  for (const key in schemaData) {
    delete vErrors[key]
    const fieldSchema = schemaData[key]?.validation
    
    if (!fieldSchema) continue
  
    const value = formData[key]
    try {
      const { success, issues } = safeParse(fieldSchema, value, { abortPipeEarly: true })
      if (!success) {
        if (Array.isArray(issues)) {
          issues.forEach((i) => (vErrors[key] = i.message))
        } else {
          vErrors[key] = 'Invalid value'
        }
        ok = false
      }
    } catch (err) {
      vErrors[key] = 'Invalid value'
      ok = false
    }
  }
  return ok
}
  
/* Field events */
function onFieldBlur(key) {
  validate(key)
  emitValidity()
}
function onFieldInput(key) {
  // Only validate on input if there's already an error OR if value has changed from initial value
  // This prevents premature validation errors for required fields like DatePicker
  const currentValue = formData[key]
  
  // Resolve initial value from initialValues prop or schema default
  const initialValue = props.initialValues?.[key] ?? schemaData[key]?.value
  const hasChanged = currentValue !== initialValue
  
  if (vErrors[key] || hasChanged) {
    validate(key)
    emitValidity()
  }
}
function onFieldChange(key) {
  // Validate on change (value is already updated via v-model binding)
  validate(key)
  emitValidity()
  emit('field-change', { key, value: formData[key] })
}
function onValidationError(key, errorMessage) {
  // Handle validation errors from child components (e.g., FileUploader)
  if (errorMessage) {
    vErrors[key] = errorMessage
    emitValidity()
  } else {
    delete vErrors[key]
    emitValidity()
  }
}
  
/* Autocomplete handler */
function onAutocompleteComplete(key, event) {
  const input = schemaData[key]
  // Use getFieldOptions helper to support formOptions
  const options = getFieldOptions(key)
  if (!input) return
  
  const query = event.query?.toLowerCase() || ''
  
  if (!query) {
    // When dropdown is clicked with empty query, show all options
    input.filteredOptions = [...options]
    return
  }
  
  // Filter options based on query
  input.filteredOptions = options.filter(option => {
    const optionText = typeof option === 'string' ? option : String(option)
    return optionText.toLowerCase().includes(query)
  })
}
  
/* Submit */
async function submitForm() {
  showSummary.value = true
  const ok = validateForm()
  emitValidity()
  if (!ok) return
  emit('submit', { formData: getFormData() })
}
  
/* Data extraction */
function getFormData() {
  const out = {}
  for (const k in formData) out[k] = formData[k]
  return out
}

function setFieldValue(key, value) {
  if (key in formData) {
    formData[key] = value
  }
}
  
/* Server errors (422) */
function applyServerErrors(errorsObj = {}) {
  for (const [k, v] of Object.entries(errorsObj)) {
    const msg = Array.isArray(v) ? v[0] : v
    if (msg) vErrors[k] = msg
  }
  showSummary.value = true
  emitValidity()
}
  
/* Summary + validity */
const hasErrors = computed(() => Object.keys(vErrors).length > 0)
const summaryMessages = computed(() => {
  const set = new Set()
  Object.entries(vErrors).forEach(([key, msg]) => {
    if (!msg) return
    // Field errors are already shown under each input; only show non-field errors here.
    if (key in schemaData) return
    set.add(msg)
  })
  return Array.from(set)
})
const hasSummaryErrors = computed(() => summaryMessages.value.length > 0)
function emitValidity() {
  emit('validity', { isValid: Object.keys(vErrors).length === 0, errors: { ...vErrors } })
}
  
/* Lifecycle */
onMounted(() => {
  Object.keys(schemaData).forEach((k) => loadFieldComponent(getFieldComponentType(schemaData[k])))
  // Initialize formData with priority: initialValues > schema default > null
  Object.keys(schemaData).forEach((k) => {
    const initialValue = props.initialValues?.[k] ?? schemaData[k]?.value ?? null
    formData[k] = initialValue
  })
})

/* Watchers */
watch(() => props.initialValues, (newValues) => {
  if (newValues) {
    Object.keys(newValues).forEach(k => {
      // Only set if field exists in schema
      if (schemaData[k]) {
        formData[k] = newValues[k]
      }
    })
  }
}, { deep: true })
  
/* Public API for parent */
defineExpose({
  submitForm,
  validateForm,
  getFormData,
  setFieldValue,
  getErrors: () => ({ ...vErrors }),
  applyServerErrors,
  showErrors: () => { showSummary.value = true },
  hideErrors: () => { showSummary.value = false }
})
</script>

<style scoped>
.pv-field :deep(.p-inputtext),
.pv-field :deep(.p-password),
.pv-field :deep(.p-password-input),
.pv-field :deep(.p-select-label),
.pv-field :deep(.p-multiselect-label),
.pv-field :deep(.p-datepicker-input) {
  padding-inline: 12px;
}
  
.pv-field :deep(.p-inputtext.p-invalid),
.pv-field :deep(.p-password.p-invalid .p-password-input),
.pv-field :deep(.p-select.p-invalid),
.pv-field :deep(.p-multiselect.p-invalid),
.pv-field :deep(.p-autocomplete.p-invalid),
.pv-field :deep(.p-datepicker.p-invalid) {
  border-color: #ef4444 !important;
}

.pv-field :deep(.p-password) {
  display: flex;
  width: 100%;
}

.pv-field :deep(.p-password-input) {
  width: 100%;
}
  
/* Autocomplete styling - match Select component appearance */
.pv-field :deep(.p-autocomplete) {
  display: flex;
  width: 100%;
}
  
.pv-field :deep(.p-autocomplete-input) {
  width: 100%;
  padding-right: 36px;
}
  
.pv-field :deep(.p-autocomplete-dropdown) {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-left: 1px solid #e5e7eb;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}
  
.pv-field :deep(.p-autocomplete-dropdown:hover) {
  color: #374151;
  background-color: #f9fafb;
}
  
.pv-field :deep(.p-autocomplete-dropdown:focus) {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.5);
}
  
.pv-field :deep(.p-autocomplete-dropdown .pi-chevron-down) {
  font-size: 0.875rem;
}
  
/* RTL support for autocomplete dropdown */
[dir="rtl"] .pv-field :deep(.p-autocomplete-input) {
  padding-right: 12px;
  padding-left: 36px;
}
  
[dir="rtl"] .pv-field :deep(.p-autocomplete-dropdown) {
  right: auto;
  left: 0;
  border-left: none;
  border-right: 1px solid #e5e7eb;
}
  
/* Autocomplete dropdown panel visibility */
.pv-field :deep(.p-autocomplete-panel) {
  display: block !important;
  position: absolute;
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
}
  
.pv-field :deep(.p-autocomplete-list) {
  list-style: none;
  padding: 0;
  margin: 0;
}
  
.pv-field :deep(.p-autocomplete-option) {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}
  
.pv-field :deep(.p-autocomplete-option:hover) {
  background-color: #f3f4f6;
}
  
.pv-field :deep(.p-autocomplete-option.p-highlight) {
  background-color: #3b82f6;
  color: white;
}
  
/* RTL support for autocomplete panel */
[dir="rtl"] .pv-field :deep(.p-autocomplete-panel) {
  right: 0;
  left: auto;
}
</style>
