<!-- src/platform/components/applications/ApplicationActionCard.vue -->
<template>
  <div
    class="tw-flex tw-items-center tw-flex-wrap tw-gap-2 tw-w-fit tw-ms-auto"
    v-if="
      application.stage == 'Data Entry' ||
      application.stage == 'review'
    "
  >
    <input-button
      v-if="canSubmit"
      type="button"
      class="tw-w-fit tw-rounded-lg tw-py-1 base-btn tw-ms-auto"
      :name="
        application.status == 'Submitted' ? 'recallRequest' : 'applyRequest'
      "
      :loading="btnLoading"
      @click="submit"
    />
    <input-button
      v-else
      type="button"
      class="tw-w-fit tw-rounded-lg tw-py-1 base-btn tw-ms-auto"
      name="resumeApplication"
      @click="emit('resume-application')"
    />

    <input-button
      type="button"
      class="tw-w-fit tw-rounded-lg tw-py-1 btn-danger"
      v-if="application.stage == 'Data Entry'"
      :loading="btnLoading"
      name="removeRequest"
      @click="openModal = true"
    />
    <Teleport to="body">
      <MainModal v-if="openModal" @close="openModal = false">
        <div
          @click.stop
          class="tw-bg-white tw-w-full tw-max-w-[400px] tw-p-3 tw-rounded-xl"
        >
          <h4 class="tw-text-center tw-font-bold tw-text-lg tw-mt-4">
            {{ $t("HEADERS.areYouSureToConfirm") }}
          </h4>

          <div
            class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mt-5"
          >
            <button
              type="button"
              class="capitalize base-btn-white tw-py-2 tw-rounded-md"
              @click="openModal = false"
            >
              {{ $t("Cancel") }}
            </button>
            <input-button
              type="button"
              class="tw-w-fit tw-rounded-lg btn-danger"
              v-if="application.stage == 'Data Entry'"
              :loading="btnLoading"
              name="removeRequest"
              @click="removeApplication"
            />
          </div>
        </div>
      </MainModal>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  application: {
    required: true,
  },
  canSubmit: {
    required: false,
    default: true,
  },
});

const emit = defineEmits(["resume-application"]);
 
const VITE_DIVING_CENTERS_APPS_DELETE = import.meta.env
  .VITE_DIVING_CENTERS_APPS_DELETE;
const VITE_DIVING_CENTERS_APPS_SUBMIT = import.meta.env
  .VITE_DIVING_CENTERS_APPS_SUBMIT;
const VITE_DIVING_CENTERS_APPS_RECALL = import.meta.env
  .VITE_DIVING_CENTERS_APPS_RECALL;
import { toast } from "vue3-toastify";
import axios from "axios";
import MainModal from "@/website/components/MainModal.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";

const globalVariable = getCurrentInstance();
const emitter = globalVariable.appContext.config.globalProperties.emitter;
const router = useRouter();
const route = useRoute();

const btnLoading = ref(false);
const openModal = ref(false);
const { t } = useI18n();

function submit() {
  btnLoading.value = true;

  let url;
  if (props.application.stage == "Data Entry") {
    url = VITE_DIVING_CENTERS_APPS_SUBMIT + route.params.id;
  } else {
    url = VITE_DIVING_CENTERS_APPS_RECALL + route.params.id;
  }

  axios
    .post(url)
    .then((res) => {
      btnLoading.value = false;
      if (props.application.stage == "Data Entry") {
        router.push({
          name: `user-applications`,
        });
      } else {
        router.push({
          name: "application-home",
          params: {
            id: res.data.application.id,
          },
        });
      }

      emitter.emit("getApplication");
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.response.data.message);
    });
}
function removeApplication() {
  btnLoading.value = true;

  axios
    .delete(VITE_DIVING_CENTERS_APPS_DELETE + route.params.id)
    .then((res) => {
      btnLoading.value = false;
      router.push({
        name: `user-applications`,
      });

      openModal.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(t("cantRemoveApplication"));
    });
}
</script>

<style></style>
