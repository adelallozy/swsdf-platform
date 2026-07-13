<template>
  <VeeField :name="name" v-slot="{ meta }">
    <div class="input_wrapper" :class="{ error: !meta.valid && meta.touched }">
      <label :for="id" class="label" v-if="label">{{ label }}</label>
      <div>
        <div class="with_icon">
          <img v-if="icon" :src="`/icons/${icon}`" alt="icon" />
          <VueMultiselect
            :id="id"
            v-model="selectedValue"
            :options="options"
            :multiple="multiple"
            :searchable="true"
            :loading="loading"
            :show-labels="true"
            :track-by="name"
            label="name"
            :return-object="true"
            :close-on-select="true"
            :placeholder="placeholder"
            @select="updateValue"
            @remove="updateValue"
          />
        </div>
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
import "vue-multiselect/dist/vue-multiselect.css";
import VueMultiselect from "vue-multiselect";
import { useField } from "vee-validate";
import { ref , watch} from "vue";

const props = defineProps({
  itemValue: {
    required: true,
  },
  id: {
    required: true,
  },
  name: {
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
}); 

console.log(props.name);
const inputField = useField(props.name);
const selectedValue = ref(props.itemValue);

 
watch([() => props.itemValue, () => props.options], ([newItemValue, newOptions]) => {
  const found = newOptions.find((el) => el.id === newItemValue);
  if (found || !newItemValue) {
    selectedValue.value = found ? found: null;
    inputField.setValue(found ? found.id : newItemValue);
  }}
);

watch(
  () => props.itemValue,
  () => {
    if (props.multiple) {
      if (props.itemValue) {
        inputField.setValue(props.itemValue);
        selectedValue.value = props.itemValue;
      }
    } else {
      if (!props.itemValue) {
        inputField.setValue(props.itemValue);
        selectedValue.value = props.itemValue;
      }
    }
  },
  {
    immediate: true,
  }
);
 
const emit = defineEmits(["update:itemValue", "change"]);

const updateValue = (event) => {
  if (props.multiple) {
    emit("change", selectedValue.value);
    emit("update:itemValue", selectedValue.value);
    inputField.setValue(selectedValue.value);
  } else {
    emit("change", event.id);

    inputField.setValue(event.id);
    emit("update:itemValue", event.id);
  }
};

watch(
  () => props.options,
  () => {
    if (props.itemValue && props.options.length) {
      const found = props.options.find((el) => el.id == props.itemValue);
      if (found) {
        // console.log(found);
        selectedValue.value = found;
        // inputField.setValue(selectedValue.value);
        // emit("update:itemValue", selectedValue.value);
      }
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss">
.multiselect__tags {
  padding: 12px !important;
  @apply tw-flex tw-items-center;

  .multiselect__tag {
    @apply tw-m-0 tw-bg-primary;
  }

  .multiselect__tag-icon::after {
    @apply tw-text-white;
  }

  .multiselect__tags-wrap {
    @apply tw-flex tw-gap-1 tw-flex-wrap;
  }

  input {
    min-height: auto !important;
  }
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

  .p-dropdown-label,
  .p-multiselect-label {
    // padding-inline-start: 2rem !important;
  }
}
</style>
