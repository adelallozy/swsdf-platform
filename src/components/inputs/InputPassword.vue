<template>
  <div>
    <VeeField v-model="value" :name="name" v-slot="{ field, meta }">
      <div
        class="input_wrapper"
        :class="{
          error: !meta.valid && meta.touched,
        }"
      >
        <label
          :for="label"
          class="label"
          :class="value ? 'label_active' : ''"
          >{{ label ? $t(`labels.${label}`) : $t(`labels.${name}`) }}</label
        >
        <div class="tw-relative">
          <input
            v-bind="field"
            autocomplete="off"
            :placeholder="
              placeholder ? placeholder : $t('labels.enterYourPassword')
            "
            :type="!showPassword ? 'password' : 'text'"
          />

          <span
            class="far tw-absolute tw-top-1/2 tw-end-3 -tw-translate-y-1/2"
            :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
            @click.stop="showPassword = !showPassword"
          >
          </span>
        </div>
        <VeeErrorMessage
          v-if="!meta.valid && meta.touched"
          :name="name"
          as="div"
          class="tw-text-red-500 tw-text-sm"
        />
      </div>
    </VeeField>
  </div>
</template>

<script>
export default {
  props: ["modelValue", "name", "label", "placeholder"],
  emits: ["update:modelValue"],
  data() {
    return {
      showPassword: false,
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
