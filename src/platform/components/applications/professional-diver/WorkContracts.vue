<template>

  <div class="tw-space-y-4">
    <base-card1>
      <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
        <h3
          class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
        >
          {{ $t("Work Contracts") }}
        </h3> 
 
        <router-link
            v-if="activeCount < 3 && ['draft', 'applicant_revision'].includes(stage)"
            class="base-btn-white tw-py-2 tw-rounded-lg"
            :to="{
              name: 'add-professional-diver-contract',
              params: { id: $route.params.id  },
            }"
            >{{ $t("Add a cooperation contract") }}</router-link
          >
          
      </div>
      <base-card1
        class="tw-relative tw-mb-2 tw-border tw-border-dashed !tw-shadow-none !tw-bg-[#02579605] tw-overflow-hidden"
        v-for="contract in diverContracts"
        :key="contract.id"
      >
         
      <div class="tw-flex tw-gap-3 tw-items-center tw-justify-end" v-if="['draft', 'applicant_revision'].includes(stage)">
          <button
            class="tw-text-red-500"
            type="button"
            @click="
              itemToDelete = contract;
              openModal = true;
            "
            v-if="
              contract.new_status == 'Approved'  
            "
          >
            {{ $t('Cancel') }}
            <i class="fa-solid fa-trash"></i>
          </button>
          <button
            class="tw-text-green"
            type="button"
            @click="restoreDelete(contract.id)"
            v-else
            :disabled="removeLoading"
          >
          {{ $t('Restore') }}
            <i class="fa-solid fa-rotate-left"></i>
          </button>

        </div>
        <Teleport to="body">
          <BaseModal
            v-if="openModal && itemToDelete?.id == contract.id"
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
                @click="confirmDelete(contract.id)"
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
                  {{ $t("Dive Center") + " :" }}
                </div>
                <div class="text">{{ contract?.center_name }}</div>
              </li>
         
              <li v-if="contract?.new_status ">
                <div class="name">
                  <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/professional/calendar.svg"
                    alt="icon"
                  />
                  {{ $t("Status") + " :" }} 
                </div>
                <div v-if=" 'Approved'== contract?.new_status && 'Approved'== contract?.status   " class="text">{{ $t('Approved')  }}</div>
                <div v-if=" 'Approved'== contract?.new_status && 'Unverified'== contract?.status   " class="text">{{ $t('Under Review')  }}</div>
                <div v-if=" 'Inactive'== contract?.new_status && 'Approved'== contract?.status   " class="text">{{ $t('Pending Deletion')  }}</div>

                <div v-if="  'Inactive'== contract?.status   " class="text">{{ $t('Canceled')  }}</div>
              </li>
              <li v-if="contract?.start_date ">
                <div class="name">
                  <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/professional/calendar.svg"
                    alt="icon"
                  />
                  {{ $t("Contract Start") + " :" }}
                </div>
                <div class="text">{{ contract?.start_date }}</div>
              </li>
              <li v-if="contract?.end_date ">
                <div class="name">
                  <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/professional/calendar.svg"
                    alt="icon"
                  />
                  {{ $t("Contract End") + " :" }}
                </div>
                <div class="text">{{ contract?.end_date }}</div>
              </li>
              <li>
                <div class="name">
                  <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/professional/document-text.svg"
                    alt="icon"
                  />
                  {{ $t("Copy of contract") + " :" }}
                </div>
                <div class="text" v-if="contract?.contract_copy_link">
                  <a
                    class="tw-text-primary tw-mx-3"
                    :href="`${WEB_URL}${contract?.contract_copy_link}`"
                    target="_blank"
                  >
                    <i class="fas fa-eye"></i>
                  </a>
                  <button
                    class="tw-text-red-500"
                    type="button"
                    @click="
                      itemToDelete = contract;
                      openModal = true;
                    "
                    v-if="['draft', 'applicant_revision'].includes(stage)"
              
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
  
                  <Teleport to="body">
                    <BaseModal
                      v-if="openModal && itemToDelete?.id == contract.id"
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
                          @click="confirmDelete(contract.id)"
                        />
                      </div>
                    </BaseModal>
                  </Teleport>
                </div>
              </li>

        </ul>
      </base-card1>
    </base-card1>
  </div>
</template>

<script setup>
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const CANCEL_DIVER_CONTRACT = import.meta.env.VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_CANCEL;
const REACTIVE_DIVER_CONTRACT = import.meta.env.VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REACTIVE;

import { ref } from "vue"; 
import axios from "axios";
import { toast } from "vue3-toastify";
import BaseModal from "@/website/components/base/BaseModal.vue";


const activeCount = ref(0);

const removeLoading = ref(false);
const btnLoading = ref(false);
const openModal = ref(false); 
const itemToDelete = ref(null); 

const props = defineProps({
  diverContracts: {
    required: false,
  },
  stage: {
    required: false,
  },
});
const emit = defineEmits(["update"]);
// restore-work-contract
function confirmDelete(id) {
  removeLoading.value = true;
  axios
    .post(CANCEL_DIVER_CONTRACT + id)
    .then((res) => {
      // diverContracts	.value = res.data.diverContracts	;
      document.location.reload();
      removeLoading.value = false;
      itemToDelete.value = null;
      openModal.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;
      itemToDelete.value = null;
      openModal.value = false;
      btnLoading.value = false;
      removeLoading.value = false;
 
      toast.error(err.message);
    });
}

function restoreDelete(id) {
  removeLoading.value = true;
  axios
    .post( REACTIVE_DIVER_CONTRACT + id)
    .then((res) => {
      // diverContracts	.value = res.data.diverContracts		;
      document.location.reload(); 
    })
    .catch((err) => {
      btnLoading.value = false;
      removeLoading.value = false;
      toast.error(err.message);
    });
}

function countActive(){
  if(!props.diverContracts) {
    activeCount.value = 0 ;
    return ;
  }

  props.diverContracts.forEach(contract => {
    if(contract.new_status == 'Approved'){
      activeCount.value ++ ;
    }
  });
}

countActive ();
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
  &.Review {
    @apply tw-bg-green-600;
  }
  &.Registration {
    @apply tw-bg-primary;
  }
}
</style>
