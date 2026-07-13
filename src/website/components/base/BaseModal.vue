<template>
  <div
    class="base-modal tw-px-3 tw-bg-[#00000083] tw-flex tw-items-center tw-justify-center tw-fixed tw-top-0 tw-left-0 tw-w-screen tw-h-screen tw-z-50"
    @click="close"
  >
    <div
      class="base-modal-content tw-min-w-[200px] tw-max-w-[700px] tw-max-h-[500px] tw-overflow-y-auto tw-p-5 tw-rounded-2xl tw-bg-white"
      @click.stop
    >
      <button type="button" @click="emit('close')">
        <i class="fas fa-times"></i>
      </button>
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  persist: {
    required: false,
    default: false,
  },
});

const emit = defineEmits(["close"]);

function close() {
  if (props.persist) return;

  emit("close");
}
</script>

<style lang="scss" scoped>
.base-modal {
  .base-modal-content {
    box-shadow: 0px 7px 58px 0px #b1b1b11a;
  }
}
</style>
