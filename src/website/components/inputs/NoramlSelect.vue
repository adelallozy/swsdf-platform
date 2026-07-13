<template>
  <div
    class="single-select card w-full flex justify-content-center overflow-hidden"
  >
    <div class="input_wrapper w-full">
      <label v-if="label" :for="id" class="label">{{ label }}</label>

      <div>
        <div class="with_icon">
          <img v-if="icon" :src="`/icons/${icon}`" alt="icon" />
          <VueMultiselect
            :id="id"
            v-model="selectedValue"
            :options="options"
            :multiple="false"
            :searchable="true"
            :loading="loading"
            :show-labels="false"
            track-by="id"
            label="name"
            :return-object="false"
            :close-on-select="true"
            :placeholder="placeholder"
            @select="updateValue"
          ></VueMultiselect>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import "vue-multiselect/dist/vue-multiselect.css";
import VueMultiselect from "vue-multiselect";
import { ref, watch } from "vue";

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: null,
  },
  label: {
    required: false,
  },
  options: {
    type: Object,
    required: true,
    default: null,
  },

  loading: {
    required: false,
  },
  placeholder: {
    required: false,
  },

  id: {
    type: String,
    required: true,
    default: null,
  },
});
const items = ref([]);

const selectedValue = ref(null);

watch(
  () => props.options,
  () => (items.value = props.options),
  {
    deep: true,
    immediate: true,
  }
);
const emit = defineEmits(["change"]);

function updateValue(e) {
  emit("change", e.id);
  selectedValue.value = null;
}
</script>

<style lang="scss">
.multiselect__tags {
  padding: 12px !important;
  padding-inline-end: 14px !important;
  @apply tw-flex tw-items-center;
}
.multiselect__single {
  margin-bottom: 0 !important;
}
.multiselect__option--selected.multiselect__option--highlight,
.multiselect__option--highlight {
  @apply tw-bg-primary tw-text-white;
}
.multiselect__select {
  height: auto !important;

  width: auto !important;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 !important;
  left: unset !important;
  right: unset !important;
  inset-inline-end: 1rem !important;

  &::before {
    @apply tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-m-0;
  }
}
.multiselect__input {
  @apply tw-mb-0;
  padding: 0 !important;
}
.multiselect--active .multiselect__select {
  transform: rotate(0) !important;
}
.multiselect--active .multiselect__select::before {
  transform: rotate(180deg) !important;
}
.multiselect__placeholder {
  @apply tw-mb-0;
}

.p-input-icon-left {
  i {
    z-index: 10;
  }
  .p-dropdown,
  .p-multiselect {
    width: 200px;
  }
}
</style>
