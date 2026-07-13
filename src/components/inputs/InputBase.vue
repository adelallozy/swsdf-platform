<template>
  <VeeField :type="type" :name="name" v-slot="{ field, meta }" :rules="rules">
    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label :for="id" class="label" v-if="label">{{ label }}</label>
      <div class="tw-flex-1">
        <input
          class="tw-appearance-none"
          :id="id"
          v-bind="field"
          :type="type"
          :placeholder="placeholder"
        />
        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          :name="name"
          as="div"
          class="tw-text-red-500 tw-text-sm"
        />
      </div>
    </div>
  </VeeField>
</template>

<script setup>
const props = defineProps({
  id: {
    required: true,
  },
  name: {
    required: true,
  },
  rules: {
    required: false,
  },

  label: {
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
