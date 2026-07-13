<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "WizardStepTitle",
  components: [],
  props: {
    order: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    desc: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      default: "", // current | completed | pending
    },
  },
  setup() {},
});
</script>

<template>
  <div class="stepper-item current">
    <!--begin::Line-->
    <div class="stepper-line w-40px"></div>
    <!--end::Line-->

    <!--begin::Icon-->
    <div class="stepper-icon w-40px h-40px">
      <i class="stepper-check fas fa-check"></i>
      <span class="stepper-number">{{ order }}</span>
    </div>
    <!--end::Icon-->

    <!--begin::Label-->
    <div class="stepper-label">
      <h3 class="stepper-title">{{ title }}</h3>
      <div class="stepper-desc fw-bold">{{ desc }}</div>
    </div>
    <!--end::Label-->
  </div>
</template>
