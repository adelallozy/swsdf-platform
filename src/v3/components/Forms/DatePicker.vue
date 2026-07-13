<!-- src/v3/components/Forms/DatePicker.vue -->
<template>
    <DatePicker
        v-model="dateValue"
        @date-select="updateDate"
        @show="onPanelShow"
        @hide="onPanelHide"
        @focus="onInputFocus"
        @blur="onInputBlur"
        @input="onInput"
        dateFormat="dd-mm-yy"
    />
</template>

<script setup>
import { computed, ref } from 'vue';
import DatePicker from 'primevue/datepicker';

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
        validator: (value) => {
            // Validate format as "dd-mm-yyyy"
            return /^\d{4}-\d{2}-\d{2}$/.test(value) || value === "";
        },
    }
});
const emit = defineEmits(["update:modelValue", "blur", "focus"]);

// Track panel state to prevent premature validation
const isPanelOpen = ref(false);
const isInputFocused = ref(false); // Track if input field has focus (not panel)

function onPanelShow() {
    isPanelOpen.value = true;
}

function onPanelHide() {
    isPanelOpen.value = false;
    // If panel closes and input was focused, emit blur to trigger validation
    if (isInputFocused.value) {
        emit("blur", { originalEvent: null, value: props.modelValue });
        isInputFocused.value = false;
    }
    // Emit focus event to keep focus inside the component
    emit("focus", { originalEvent: null, value: props.modelValue });
}

function onInputFocus() {
    isInputFocused.value = true;
}

function onInputBlur() {
    // Only emit blur if panel is not open
    // If panel is open, focus has moved to panel, not actual blur
    if (!isPanelOpen.value) {
        emit("blur", { originalEvent: null, value: props.modelValue });
        isInputFocused.value = false;
    }
}

function updateDate(newDate) {
    if (!isNaN(newDate.getTime())) {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        const formattedValue = `${year}-${month}-${day}`;
        emit("update:modelValue", formattedValue);
    } else {
        emit("update:modelValue", "");
    }
}

function onInput(event) {
    // Handle manual input from the date picker
    const inputValue = event?.target?.value;
    if (!inputValue) {
        emit("update:modelValue", "");
        return;
    }
    
    // Try to parse the input date (format is dd-mm-yy based on dateFormat prop)
    const parts = inputValue.split('-');
    if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        
        // Only process if all parts are valid numbers
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return;
        }
        
        // Only accept 4-digit years (no auto-completion)
        if (year < 1000 || year > 9999) {
            return;
        }
        
        // Validate the date is complete and within reasonable range
        if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 1900 && year <= 2100) {
            // Verify it's a valid date (e.g., not Feb 30)
            const testDate = new Date(year, month - 1, day);
            if (testDate.getFullYear() === year && testDate.getMonth() === month - 1 && testDate.getDate() === day) {
                const formattedValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                emit("update:modelValue", formattedValue);
            }
        }
    }
}

const dateValue = computed({
    get() {
        if (!props.modelValue) return null;
        const [ year, month, day] = props.modelValue.split("-");
        // Create date with local timezone to avoid UTC conversion issues
        // Note: Date constructor expects month as 0-11, so we subtract 1 from the parsed month
        return new Date(year, month - 1, day);
    },
    set(value) {
        // This setter is called when the user types directly into the input
        if (!value) {
            emit("update:modelValue", "");
            return;
        }
        
        if (!isNaN(value.getTime())) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const day = String(value.getDate()).padStart(2, '0');
            const formattedValue = `${year}-${month}-${day}`;
            emit("update:modelValue", formattedValue);
        } else {
            emit("update:modelValue", "");
        }
    }
});

// Expose panel state for MasterForm to prevent premature validation
defineExpose({
    isPanelOpen
});
</script>
