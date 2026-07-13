<template>
  <VeeField :type="type" :name="name" v-slot="{ field, meta }">
    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label :for="id" class="label" v-if="label">{{ label }}</label>
      <div class="tw-flex-1">
        <Calendar
          class="tw-w-full"
          dateFormat="yy-mm-dd"
          :id="id"
          v-bind="field"
          v-model="field.value"
          :placeholder="placeholder"
        />
        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          :name="name"
          as="div"
          class="tw-text-red-500 tw-text-sm"
        />
      </div>

      <!-- <input :id="id" v-bind="field" :placeholder="placeholder" /> -->
    </div>
  </VeeField>
</template>

<script setup>
import Calendar from "primevue/calendar";
// const modelValue = ref(null);
// const { errorMessage, value } = useField("value", validateField);
// function validateField(value) {
//   console.log(value);
//   if (!value) {
//     return "Date is required.";
//   }

//   return true;
// }

onMounted(() => {
  if (props.value) {
    console.log(new Date(props.value));
  }
});

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
  value: {
    required: false,
  },
  placeholder: {
    required: true,
  },
  type: {
    required: false,
    default: "text",
  },
});
</script>

<style></style>
