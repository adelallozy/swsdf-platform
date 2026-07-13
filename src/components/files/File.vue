<template>
  <div class="tw-w-full" v-if="href">
    <!--begin::Card-->
    <div class="card h-100">
      <!--begin::Card body-->
      <div
        class="card-body d-flex justify-content-center text-center flex-column p-8"
      >
        <!--begin::Name-->
        <a
          :href="'/' + href"
          target="_blank"
          class="text-gray-800 text-hover-primary d-flex flex-column"
        >
          <!--begin::Image-->
          <div class="symbol symbol-60px mb-6">
            <img :src="`/platform/media/svg/files/${fileType}.svg`" alt="" />
          </div>
          <!--end::Image-->

          <!--begin::Title-->
          <div class="fs-5 fw-bolder mb-2">
            {{ fileTitle }}
          </div>
          <!--end::Title-->
        </a>
        <!--end::Name-->

        <!--begin::Description-->
        <div class="fs-7 fw-bold text-gray-400 mt-auto">
          {{ createdAt }}
        </div>
        <!--end::Description-->
      </div>
      <!--end::Card body-->
    </div>
    <!--end::Card-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "file-card",
  props: {
    fileTitle: String,

    createdAt: String,

    fileType: String,

    classes: String,

    href: String,
  },
  components: {},
});
</script>
