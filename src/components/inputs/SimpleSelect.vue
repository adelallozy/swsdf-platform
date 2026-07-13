<template>
  <Menu
    as="div"
    class="tw-relative tw-inline-block tw-bg-white tw-text-left tw-w-full tw-border tw-rounded-lg"
    v-slot="{ open }"
  >
    <MenuButton class="tw-w-full tw-px-2 tw-py-3" :id="id">
      <div
        class="tw-flex tw-justify-between tw-items-center tw-text-sm tw-gap-2"
        :class="
          selectedItem ? 'tw-font-bold tw-text-foreground' : 'tw-text-muted-strong'
        "
      >
        {{
          selectedItem
            ? simpleArray
              ? selectedItem
              : selectedItem[optionLable]
            : placeholder
        }}

        <i
          class="fa-solid tw-text-lg"
          :class="open ? 'fa-angle-up' : 'fa-angle-down'"
        ></i>
      </div>
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="tw-absolute tw-max-h-[200px] tw-z-[24444] tw-overflow-y-auto tw-w-full tw-origin-top-right tw-divide-y tw-divide-gray-100 tw-rounded-2xl tw-bg-white tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-focus:outline-none"
        :class="
          $i18n.locale == 'ar'
            ? 'tw-right-0 tw-rounded-se-none'
            : ' tw-rounded-ss-none  tw-left-0'
        "
      >
        <MenuItem
          as="div"
          class="tw-text-start"
          v-for="(item, index) in allOptions"
          :key="index"
        >
          <button
            type="button"
            @click="selectItem(item)"
            class="tw-text-start tw-py-4 tw-px-5 tw-gap-2 tw-w-full"
          >
            {{ simpleArray ? item : item[optionLable] }}
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
const props = defineProps({
  options: {
    required: true,
    type: Object,
  },
  placeholder: {
    required: false,
  },
  modalValue: {
    required: true,
  },
  simpleArray: {
    required: false,
    default: false,
  },
  optionLable: {
    required: false,
    default: "name",
  },
  id: {
    required: false,
    type: String,
  },
});

const allOptions = ref([]);

const selectedItem = ref(null);

const emit = defineEmits(["update:modalValue", "change"]);

function selectItem(item) {
  emit("update:modalValue", item);
  emit("change", item);

  selectedItem.value = item;
}

watch(
  () => props.modalValue,
  () => {
    selectedItem.value = props.modalValue;
  },
  {
    deep: true,
    immediate: true,
  }
);

watch(
  () => props.options,
  () => {
    allOptions.value = props.options;
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>

<style></style>
