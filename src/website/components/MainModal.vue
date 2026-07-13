<template>
  <div
    class="tw-fixed tw-top-0 tw-left-0 tw-bg-[#00000071] tw-flex-col tw-gap-3 tw-w-screen tw-h-screen tw-z-50 tw-flex tw-justify-center tw-items-center"
    @click="closeModal"
  >
    <button
      v-if="closeBtn"
      class="tw-text-gray-200 tw-font-medium tw-text-4xl"
      type="button"
      @click="$emit('close')"
    >
      <i class="fas fa-times"></i>
    </button>
    <slot @click.stop />
  </div>
</template>

<script setup>
const props = defineProps({
  closeBtn: {
    required: false,
    default: true,
  },
  presist: {
    required: false,
    default: false,
  },
});

const emit = defineEmits(["close"]);

function closeModal() {
  if (props.presist) return;
  emit("close");
}
</script>

<style></style>
