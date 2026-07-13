<template>
  <AutoComplete
    ref="autoCompleteRef"
    :modelValue="normalizedValue"
    :inputId="id"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :suggestions="[]"
    :multiple="true"
    :typeahead="false"
    :dropdown="false"
    :forceSelection="false"
    class="tw-w-full"
    v-bind="componentAttrs"
    @update:modelValue="handleModelUpdate"
    @focus="emit('focus', $event)"
    @blur="handleBlur"
    @keydown.capture="onKeydownCapture"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  id: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  attrs: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus']);

const autoCompleteRef = ref(null);

const addOnBlur = computed(() => props.attrs?.addOnBlur !== false);
const allowDuplicate = computed(() => props.attrs?.allowDuplicate === true);
const separator = computed(() => props.attrs?.separator || ',');

const componentAttrs = computed(() => {
  const raw = props.attrs && typeof props.attrs === 'object' ? { ...props.attrs } : {};

  delete raw.addOnBlur;
  delete raw.allowDuplicate;
  delete raw.separator;
  delete raw.multiple;
  delete raw.typeahead;
  delete raw.dropdown;
  delete raw.forceSelection;

  return raw;
});

const normalizedValue = computed(() =>
  normalizeTags(props.modelValue, { allowDuplicate: allowDuplicate.value })
);

function normalizeTags(values, { allowDuplicate: canDuplicate = false } = {}) {
  const items = Array.isArray(values) ? values : [];
  const normalized = items
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  if (canDuplicate) {
    return normalized;
  }

  return Array.from(new Set(normalized));
}

function arraysEqual(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function getInputElement() {
  return autoCompleteRef.value?.$refs?.focusInput || null;
}

function clearInput() {
  const input = getInputElement();
  if (input) {
    input.value = '';
  }
}

function parseTokens(rawValue) {
  const raw = String(rawValue || '').trim();

  if (!raw) {
    return [];
  }

  let parts = [raw];

  if (separator.value instanceof RegExp) {
    parts = raw.split(separator.value);
  } else if (typeof separator.value === 'string' && separator.value.length > 0) {
    parts = raw.split(separator.value);
  }

  return parts
    .flatMap((part) => String(part || '').split('\n'))
    .map((part) => part.trim())
    .filter(Boolean);
}

function emitValue(nextValue) {
  const normalized = normalizeTags(nextValue, {
    allowDuplicate: allowDuplicate.value,
  });

  if (arraysEqual(normalized, normalizedValue.value)) {
    return;
  }

  emit('update:modelValue', normalized);
  emit('change', normalized);
}

function commitPendingValue() {
  const input = getInputElement();
  const tokens = parseTokens(input?.value || '');

  if (!tokens.length) {
    clearInput();
    return false;
  }

  emitValue([...(normalizedValue.value || []), ...tokens]);
  clearInput();

  return true;
}

function handleModelUpdate(nextValue) {
  emitValue(nextValue);
}

function handleBlur(event) {
  if (addOnBlur.value) {
    commitPendingValue();
  }

  emit('blur', event);
}

function isSeparatorKey(event) {
  if (separator.value instanceof RegExp) {
    return separator.value.test(event.key);
  }

  return typeof separator.value === 'string' && separator.value === event.key;
}

function onKeydownCapture(event) {
  if (props.disabled) {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const isCommitKey =
    event.key === 'Enter' ||
    event.key === 'NumpadEnter' ||
    isSeparatorKey(event);

  if (!isCommitKey || !target.value.trim()) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  commitPendingValue();
}
</script>
