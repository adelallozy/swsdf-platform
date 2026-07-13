<template>
  <div class="tw-space-y-4">
    <base-card1>
      <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
        <h3
          class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
        >
          {{ $t("Professional Diver Memberships") }}
        </h3>

        <router-link
          v-if="['draft', 'applicant_revision'].includes(stage)"
          class="tw-py-2 tw-px-4 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-text-foreground"
          :to="{
            name: 'add-professional-diver-international-qualification',
            params: {
              id: $route.params.id,
            },
          }"
        > 
          {{ $t("Add") }}
   
        </router-link>
      </div>
      <base-card1
        class="tw-relative tw-mb-2 tw-border tw-border-dashed !tw-shadow-none !tw-bg-[#02579605] tw-overflow-hidden"
        v-for="membership in memberships"
        :key="membership.id"
      >
 
        <div class="tw-flex tw-gap-3 tw-items-center tw-justify-end" v-if="['draft', 'applicant_revision'].includes(stage)">
          <button
            class="tw-text-red-500"
            type="button"
            @click="
              itemToDelete = membership;
              openModal = true;
            "
            v-if="
              membership.new_status == 'Verified'
            "
          >
          {{ $t('Remove') }}
            <i class="fa-solid fa-trash"></i>
          </button>
          <button
            class="tw-text-green"
            type="button"
            @click="restoreDelete(membership.id)"
            v-else-if="
              membership.new_status == 'Canceled'
            "
            :disabled="removeLoading"
          >
          {{ $t('Restore') }}
            <i class="fa-solid fa-rotate-left"></i>
          </button>
 
        </div>
        <Teleport to="body">
                <BaseModal
                  v-if="openModal && itemToDelete?.id == membership.id"
                  @close="openModal = false"
                >
                  <div class="tw-min-w-[300px] tw-text-center">
                    <i
                      class="fas fa-trash tw-text-red-500 tw-text-3xl tw-mb-5"
                    ></i>
                    <h3
                      class="tw-text-center tw-text-foreground tw-font-bold tw-text-lg"
                    >
                      {{ $t("areYouSureToDelete") }}
                    </h3>
                    <p class="tw-text-red-500 tw-text-center">
                      {{ $t("byDoingThatYouCantBack") }}
                    </p>
                    <input-button
                      :loading="removeLoading"
                      type="button"
                      class="base-btn tw-mx-auto tw-mt-5 tw-bg-red-500 tw-border-red-500 hover:tw-text-red-500 hover:tw-border-red-500"
                      name="delete"
                      @click="confirmDelete(membership.id)"
                    />
                  </div>
                </BaseModal>
              </Teleport>

        <ul class="item-details tw-grid md:tw-grid-cols-2">
 
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/card.svg"
                alt="icon"
              />
              {{ $t("Diving type") + " :" }}
            </div>
            <div class="text" v-if="membership?.diving_type">
              {{ membership?.diving_type }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/card.svg"
                alt="icon"
              />
              {{ $t("Professional Level") + " :" }}
            </div>
            <div class="text" v-if="membership?.title">
              {{ t(membership?.title) }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("Diving Organization") + " :" }}
            </div>
            <div class="text" v-if="membership?.organization">
              {{ membership?.organization }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("Membership Number") + " :" }}
            </div>
            <div class="text" v-if="membership?.membership_number	">
              {{ membership.membership_number	 }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("Status") + " :" }}
            </div>
            <div class="text tw-text-red-600" v-if="'Canceled' == membership?.new_status">
              <span class="tw-font-bold tw-text-red-600">{{ $t('Canceled') }}</span>
            </div>
            <div class="text" v-else-if="'Verified'==membership?.status">
              <span class="tw-font-bold tw-text-green tw-bg-green-300">{{ $t('Verified') }}</span>
            </div>
            <div class="text" v-else-if=" membership?.status">
              {{ $t(membership.status) }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("Membership Copy") + " :" }}
            </div>
            <div class="text" v-if="membership?.membership_link">
              <a
                class="tw-text-primary tw-mx-3"
                :href="`${WEB_URL}${membership?.membership_link}`"
                target="_blank"
              >
                <i class="fas fa-eye"></i>
              </a>
            </div>
          </li>
        </ul>
      </base-card1>
    </base-card1>
  </div>
</template>

<script setup>

import BaseModal from "@/website/components/base/BaseModal.vue";
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const CANCEL_MEMBERSHIP = import.meta.env.VITE_PROFESSIONAL_DIVER_CANCEL_MEMBERSHIP;
const RESTORE_WORK_MEMBERSHIP = import.meta.env.VITE_PROFESSIONAL_DIVER_REACTIVATE_MEMBERSHIP;


import axios from "axios";
import { toast } from "vue3-toastify";

import { ref } from "vue";
import { useI18n } from "vue-i18n";

const removeLoading = ref(false);

const btnLoading = ref(false);
const openModal = ref(false);
  
const itemToDelete = ref(null);

const { t } = useI18n();
defineProps({
  memberships: {
    required: false,
  },
  stage: {
    required: false,
  },
});
const emit = defineEmits(["update"]);

function confirmDelete(id) {
  console.log('delete ' + id);


  removeLoading.value = true;
  axios
    .delete(CANCEL_MEMBERSHIP + id)
    .then((res) => {
		location.reload();
		removeLoading.value = false; 
		openModal.value = false;
    })
    .catch((err) => {
		btnLoading.value = false;
		removeLoading.value = false;
		toast.error(err.response.data.message);
    });
}

function restoreDelete(id) {
  removeLoading.value = true;
  axios
    .get(RESTORE_WORK_MEMBERSHIP + id)
    .then((res) => { 
		location.reload();
		removeLoading.value = false;
    })
    .catch((err) => {
		btnLoading.value = false;
		toast.error(err.response.data.message);
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
.top_tag {
  @apply tw-absolute tw-top-0 tw-end-0 tw-p-2 tw-rounded-es-xl tw-font-semibold tw-text-sm tw-border tw-text-white;
  &.Remove {
    @apply tw-bg-red-500;
  }
  &.Pending {
    @apply tw-bg-red-500;
  }
  &.Review {
    @apply tw-bg-green-600;
  }
  &.Approved {
    @apply tw-bg-green-600;
  }
  &.Registration {
    @apply tw-bg-primary;
  }
  &.Unverified {
    @apply tw-bg-primary;
  }

}
</style>
