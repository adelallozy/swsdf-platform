<!-- src/v3/components/Forms/RadioTiles.vue -->
<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
    id: { type: String, default: 'radio-tiles' },
    modelValue: { type: [String, Number, Boolean, Array, null], default: '' },
    /**
     * options: Array of:
     *  - { value: any, label?: string, labelKey?: string, disabled?: boolean }
     *  - or simple values: 'scheduled'
     */
    options: { type: Array, required: true },
    name: { type: String, default: '' }, // falls back to id
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

const normalized = computed(() =>
    (props.options || []).map((o, i) => {
        if (typeof o === 'object' && o !== null)
            return {
                value: o.value,
                label: o.label ?? String(o.value),
                labelKey: o.labelKey,
                disabled: !!o.disabled,
                idx: i
            };
        return { value: o, label: String(o), labelKey: undefined, disabled: false, idx: i };
    })
);

const groupId = computed(() => props.name || props.id || 'radio-tiles');

function isSelected(val) {
    return props.multiple
        ? Array.isArray(props.modelValue) && props.modelValue.includes(val)
        : props.modelValue === val;
}

function select(val, optDisabled) {
    if (props.disabled || optDisabled) return;

    const nextValue = props.multiple
        ? Array.isArray(props.modelValue)
            ? props.modelValue.includes(val)
                ? props.modelValue.filter((item) => item !== val)
                : [...props.modelValue, val]
            : [val]
        : val;

    emit('update:modelValue', nextValue);
    emit('change', nextValue);
}

function onFocusOut(e) {
    // Bubble a blur so your form master can validate on blur
    emit('blur', e);
}

/** Keyboard navigation (Arrow keys) for accessibility */
const groupRef = ref(null);
function onKeydown(e) {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    if (props.multiple) return;
    e.preventDefault();

    const items = normalized.value.filter((o) => !(props.disabled || o.disabled));
    if (!items.length) return;

    const curIdx = items.findIndex((o) => o.value === props.modelValue);
    let nextIdx = curIdx;

    if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = items.length - 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (curIdx + 1 + items.length) % items.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (curIdx - 1 + items.length) % items.length;

    const next = items[nextIdx];
    if (next) {
        emit('update:modelValue', next.value);
        emit('change', next.value);
    }
}

onMounted(() => {
    // Nothing required; placeholder if you want auto-focus later
});
</script>

<template>
    <div
        class="options-row"
        :role="multiple ? 'group' : 'radiogroup'"
        :aria-disabled="disabled ? 'true' : 'false'"
        :aria-required="required ? 'true' : 'false'"
        :aria-invalid="invalid ? 'true' : 'false'"
        :tabindex="disabled ? -1 : 0"
        ref="groupRef"
        @keydown="onKeydown"
        @focusout="onFocusOut"
    >
        <label
            v-for="opt in normalized"
            :key="`${groupId}-${String(opt.value)}`"
            class="option tw-font-semibold"
            :class="{
                'option--active': isSelected(opt.value),
                'option--disabled': disabled || opt.disabled,
                'option--invalid': invalid
            }"
        >
            <!-- Native radio for a11y; visually hidden -->
            <input
                class="tw-sr-only"
                :type="multiple ? 'checkbox' : 'radio'"
                :name="groupId"
                :id="`${groupId}-${String(opt.value)}`"
                :value="opt.value"
                :checked="isSelected(opt.value)"
                :disabled="disabled || opt.disabled"
                :required="required"
                tabindex="-1"
                @change="select(opt.value, opt.disabled)"
                @blur="emit('blur', $event)"
            />

            <!-- State icon (PrimeIcons) -->
            <i
                v-if="isSelected(opt.value)"
                class="pi pi-check-circle tw-text-current tw-text-base"
                aria-hidden="true"
            />
            <i v-else class="pi pi-circle tw-text-slate-400 dark:tw-text-slate-500 tw-text-base" aria-hidden="true" />

            <!-- Visible label (translate labelKey if provided) -->
            <span class="option-label">
                {{ opt.labelKey ? $t(opt.labelKey) : $t(opt.label) }}
            </span>
        </label>
    </div>
</template>

<style scoped>
/* Row: horizontal, wraps; spacing via logical margins to be RTL/LTR-safe */
.options-row {
    display: flex;
    flex-wrap: wrap;
}

/* Each option tile — no borders, nice spacing & padding */
.option {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem; /* space between icon & label */
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    margin-inline-end: 0.75rem; /* logical spacing (RTL/LTR safe) */
    margin-block-end: 0.75rem;
    cursor: pointer;
    transition: background-color 150ms ease, color 150ms ease;
    color: inherit;
    user-select: none;
}

.option:hover {
    background-color: rgba(15, 23, 42, 0.04); /* slate-900 @ 4% */
}
:global(html.dark) .option:hover {
    background-color: rgba(15, 23, 42, 0.35);
}

/* Selected: tint background + brand text/icon */
.option.option--active {
    background-color: #0a5ea80d; /* ~6% brand */
    color: #0a5ea8; /* brand color for text + icon */
}
:global(html.dark) .option.option--active {
    background-color: #0a5ea81a;
    /* keep same brand color, or use teal accent if you prefer:
  color: #4fe1ee;
  */
}

/* Disabled visual */
.option.option--disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Optional invalid emphasis (if you want to style invalid group) */
.option.option--invalid.option--active {
    /* example: slightly stronger bg when invalid & selected */
    background-color: rgba(220, 38, 38, 0.08); /* red-600 @ 8% */
}
</style>
