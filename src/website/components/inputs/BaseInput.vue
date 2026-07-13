<template>
  <VeeField :type="type" :name="name" v-slot="{ field, meta }">
    <div
      class="input_wrapper"
      :class="{
        error: !meta.valid && meta.touched,
      }"
    >
      <label
        :for="label"
        class="label !tw-flex tw-gap-2 tw-capitalize tw-items-center"
      >
        <img v-if="labelIcon" :src="`/icons/${labelIcon}`" alt="icon" />
        {{ label }}</label
      >
      <div :class="icon ? 'with_icon' : ''">
        <img v-if="icon" :src="`/icons/${icon}`" alt="icon" />

        <textarea
          v-if="type == 'textarea'"
          :id="id"
          v-bind="field"
          :placeholder="placeholder"
        ></textarea>

        <input
          v-else
          :type="type"
          :id="id"
          v-bind="field"
          :placeholder="placeholder"
          @input="$emit('update:value', $event.target.value)"
        />
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
  icon: {
    required: false,
  },
  placeholder: {
    required: true,
  },
  labelIcon: {
    required: false,
  },
  value: {
    required: false,
  },
  type: {
    required: false,
    default: "text",
  },
});
</script>

<style></style>
