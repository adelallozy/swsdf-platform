<template>
  <base-card1 v-if="participant">
    <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
      <h3
        class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
      >
        {{ participant.athlete_name }}
      </h3>
      <button
        v-if="['draft', 'applicant_revision'].includes(stage)"
        type="button"
        class="tw-w-fit tw-rounded-lg btn-danger"
        :disabled="btnLoading"
        @click="openModal = true"
      >
        {{ $t("Remove Athlete") }}
      </button>
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
              <button
                type="button"
                class="tw-w-fit tw-rounded-lg btn-danger"
                :loading="btnLoading"
                @click="removeApplication"
              >
                {{ $t("Remove Athlete") }}
              </button>
            </div>
          </div>
        </MainModal>
      </Teleport>
    </div>

    <div class="tw-py-4">
      <ul class="item-details tw-grid md:tw-grid-cols-2">
        <li>
          <div class="name">
            <!-- <img
              width="16"
              height="16"
              src="@/assets/images/icons/professional/tag-user.svg"
              alt="icon"
            /> -->
            {{ $t("divingCenter") + " :" }}
          </div>
          <div class="text">{{ participant.diving_center_name }}</div>
        </li>
        <li>
          <div class="name">
            <!-- <img
              width="16"
              height="16"
              src="@/assets/images/icons/professional/tag-user.svg"
              alt="icon"
            /> -->
            {{ $t("Personal Best") + " :" }}
          </div>
          <div class="text">{{ participant.personal_best }}</div>
        </li>
        <li>
          <div class="name">
            <!-- <img
              width="16"
              height="16"
              src="@/assets/images/icons/professional/global.svg"
              alt="icon"
            /> -->
            {{ $t("Announced Performance") }}:
          </div>
          <div class="text">
            {{ participant.announced_performance }}
          </div>
        </li>
        <li>
          <div class="name">
            <!-- <img
              width="16"
              height="16"
              src="@/assets/images/icons/professional/profile-remove.svg"
              alt="icon"
            /> -->
            {{ $t("Discipline") }}:
          </div>
          <div class="text">
            {{ participant.discipline }}
          </div>
        </li>
      </ul>
    </div>
  </base-card1>
</template>

<script setup>
const DELETE_PARTICIPANT = import.meta.env
  .VITE_COMPITION_DELETE_FREEDIVING_PARTICIPANT;
import MainModal from "@/website/components/MainModal.vue";
import { ref } from "vue";
import axios from "axios";

const props = defineProps({
  participant: {
    required: true,
  },
  stage: {
    required: true,
  },
});

const emit = defineEmits(["deleted"]);

const successModal = ref(false);
const btnLoading = ref(false);
const openModal = ref(false);
function removeApplication() {
  btnLoading.value = true;

  axios
    .delete(DELETE_PARTICIPANT + props.participant.id)
    .then((res) => {
      btnLoading.value = false;
      emit("deleted");
      openModal.value = false;
      setTimeout(() => (successModal.value = false), 3000);
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(t("cantRemoveApplication"));
    });
}
</script>

<style lang="scss">
span.status {
  @apply tw-font-semibold tw-rounded-md tw-py-2 tw-px-3;
  &.Draft,
  &.Incomplete {
    @apply tw-bg-[#FF99000A] tw-text-[#FF9900];
  }
  &.Submitted {
    @apply tw-bg-[#12B3470A] tw-text-[#12B347];
  }
  &.Returned {
    @apply tw-bg-[#b312120A] tw-text-[#b31212];
  }
}
</style>
