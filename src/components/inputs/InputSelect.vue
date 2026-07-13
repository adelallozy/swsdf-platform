<template>
  <VeeField :type="type" :name="name" v-slot="{ field, meta }">
    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label :for="id" class="label" v-if="label">{{ label }}</label>
      <div class="flex-1">
        <Dropdown
          :loading="loading"
          v-bind="field"
          :options="statics"
          v-model="selectedValue"
          optionLabel="name"
          optionValue="id"
          :placeholder="placeholder"
          showClear
          dataKey="id"
          v-if="!multiple"
          :filter="true"
        />

        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          :name="name"
          as="div"
          class="text-red-500"
        />
      </div>
      <!-- <input :id="id" v-bind="field" :placeholder="placeholder" /> -->
    </div>
  </VeeField>
</template>

<script setup>
import Dropdown from "primevue/dropdown";
const selectedValue = ref(null);
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
  loading: {
    required: false,
  },
  statics: {
    required: true,
  },

  type: {
    required: false,
    default: "text",
  },
  updateValue: {
    required: false,
  },
});

onMounted(() =>
  props.updateValue ? (selectedValue.value = props.updateValue) : ""
);
</script>

<style></style>
