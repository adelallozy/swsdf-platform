<template>
  <VeeField :name="name" v-slot="{ field, meta }">
    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label :for="id" class="label" v-if="label">{{ label }}</label>
      <div :class="icon ? 'with_icon' : ''">
        <VueDatePicker
          v-model="date"
          :enable-time-picker="false"
          :max-date="maxDate"
          :min-date="minDate"
          no-today
          :time-picker="timePicker"
          :model-type="
            timePicker ? (is24 ? 'hh:mm' : 'hh:mm aa') : 'yyyy-MM-dd'
          "
          :id="id"
          :placeholder="placeholder"
          auto-apply
          :month-picker="monthPicker"
          v-bind="field"
          @clear="
            date = '';
            updateValue();
          "
          :is-24="is24"
        >
        </VueDatePicker>
      </div>

      <VeeErrorMessage
        v-if="!meta.valid && meta.touched"
        :name="name"
        as="div"
        class="tw-text-red-500 tw-text-sm"
      />
    </div>
  </VeeField>
</template>

<script setup>
import { useField } from "vee-validate";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  id: {
    required: true,
  },
  name: {
    required: true,
  },

  label: {
    required: false,
  },
  placeholder: {
    required: true,
  },
  is24: {
    required: false,
  },
  itemValue: {
    required: true,
  },
  icon: {
    required: false,
  },
  timePicker: {
    required: false,
    default: false,
  },
  maxDate: {
    required: false,
  },
  minDate: {
    required: false,
  },
  monthPicker: {
    required: false,
  },
});

const fieldValue = useField(props.name);

const date = ref("");
onMounted(() => {
  if (props.itemValue) {
    date.value = props.itemValue;
  }
});

const emit = defineEmits(["update:itemValue", "change"]);

const updateValue = (event) => {
  fieldValue.setValue(date.value);
  emit("update:itemValue", date.value ?? "");

  emit("change", date.value ?? "");
};

watch(
  () => date.value,
  (value) => {
    let formattedDate = "";

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    formattedDate = `${year}-${month}-${day}`;

    updateValue(formattedDate);
  }
);
</script>

<style lang="scss">
.p-calendar.p-component.p-inputwrapper {
  width: 100%;
  input {
    border: none !important;
    box-shadow: none !important;
    background-color: transparent !important;
    padding-inline-start: 0.95rem !important;
    padding-inline-end: 1.6rem !important;
    z-index: 10;
  }
}
.dp__icon.dp__input_icon {
  display: none;
}
.dp__input {
  border: 0 !important;

  @apply tw-py-0 tw-ps-0 tw-pe-7;
}
.dp__clear_icon {
  left: unset;
  right: unset;

  inset-inline-end: 1rem;
}
.dp__input_wrap {
  @apply tw-border   tw-rounded-lg;
  &:has(input:focus) {
    @apply tw-border-primary;
  }
}
</style>
