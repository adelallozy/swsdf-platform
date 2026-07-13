<template>
  <div class="tw-space-y-6 tw-bg-white"  >
 
 
    <loader v-if="loading" />
    <template v-else>
      <div v-if="diverContracts	 && diverContracts.length" class="tw-space-y-3">
        <base-card1>
          <h3
            class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
          >
            {{ $t("Work Contracts") }}
          </h3>
        </base-card1>
        <div v-for="contract in diverContracts" :key="contract.id">
        
          <base-card1 class="tw-relative tw-overflow-hidden">
   
 
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
         
              <li v-if="contract?.start_date ">
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
                    v-if="
                      contract.purpose == 'Review' ||
                      contract.purpose == 'Registration'
                    "
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                  <button
                    class="tw-text-green"
                    type="button"
                    @click="restoreDelete(contract.id)"
                    v-else
                    :disabled="removeLoading"
                  >
                    <i class="fa-solid fa-rotate-left"></i>
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
        </div>
        <div class="tw-flex tw-items-center tw-gap-2 !tw-mt-11 tw-justify-end">
          <router-link
            v-if="diverContracts.length < 3"
            class="base-btn-white tw-py-2 tw-rounded-lg"
            :to="{
              name: 'add-professional-diver-contract',
              params: { id: route.params.id },
            }"
            >{{ $t("Add a cooperation contract") }}</router-link
          >
          <router-link
            class="base-btn tw-py-2 tw-rounded-lg"
            :to="{
              name: 'application-home',
              params: { id: route.params.id },
            }"
            >{{ $t("Next") }}</router-link
          >
        </div>
      </div>
      <base-card1 :title="$t('Add a cooperation contract')" v-else>
        <WorkContractForm
          :back="false"
          :btn-loading="btnLoading"
          @submit="onSubmit"
        />
      </base-card1>
    </template>
  </div>
</template>
<script setup>
import WorkContractForm from "@/platform/components/applications/professional-diver/WorkContractForm.vue";
import BaseModal from "@/website/components/base/BaseModal.vue";
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const REGISTER_WORK_CONTRACT = import.meta.env
  .VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REGISTER;
const DELETE_WORK_CONTRACT = import.meta.env
  .VITE_DELETE_PROFESSIONAL_DIVER_WORK_CONTRACT;
const RESTORE_WORK_CONTRACT = import.meta.env
  .VITE_RESTORE_PROFESSIONAL_DIVER_WORK_CONTRACT;
const PICK_RELATIVES = import.meta.env.VITE_PROFESSIONAL_DIVERS_PICK_RELATIVES; 
import { toast } from "vue3-toastify";
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
const loading = ref(true);
const router = useRouter();
const route = useRoute();
const removeLoading = ref(false);
const btnLoading = ref(false);
const openModal = ref(false);
const diverContracts = ref(null);
const itemToDelete = ref(null); 
 

console.log(REGISTER_WORK_CONTRACT);

function onSubmit(values) {
  btnLoading.value = true;
  const frmData = new FormData();
  frmData.append("dive_center_id", values.center);
  frmData.append("work_contract_copy_file", values.contract);
  if (values.end_date) frmData.append("end_date", values.end_date);
  if (values.start_date) frmData.append("start_date", values.start_date);

  axios
    .post(REGISTER_WORK_CONTRACT + route.params.id, frmData)
    .then(() => {
      router.push({
        name: "application-home",
        params: { id: route.params.id },
      });
      getData();
      btnLoading.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.response.data.message);
    });
}
function getData() {
  loading.value = true;
  axios.get(PICK_RELATIVES + route.params.id).then((res) => {
    if (res.data.diverContracts)
      diverContracts	.value = res.data.diverContracts;

    loading.value = false;
  });
}
// restore-work-contract
function confirmDelete(id) {
  removeLoading.value = true;
  axios
    .post(DELETE_WORK_CONTRACT + id)
    .then((res) => {
      diverContracts	.value = res.data.diverContracts	;
      removeLoading.value = false;
      itemToDelete.value = null;
      openModal.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.response.data.message);
    });
}
function restoreDelete(id) {
  removeLoading.value = true;
  axios
    .post(RESTORE_WORK_CONTRACT + id)
    .then((res) => {
      diverContracts	.value = res.data.diverContracts	;
      removeLoading.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.response.data.message);
    });
}

onMounted(() => getData());
</script>
<style src="@/assets/sass/centerProfile.scss" lang="scss">
.top_tag {
  @apply tw-absolute tw-top-0 tw-end-0;
}
</style>
<style lang="scss">

</style>
