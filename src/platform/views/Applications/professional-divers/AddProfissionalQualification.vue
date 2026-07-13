<template>
  <div class="tw-space-y-6">
 
    <loader v-if="loading" />

    <template v-else>
      <div
        v-if="qualifications && qualifications.length && !canEdit"
        class="tw-space-y-3"
      >
        <base-card1>
          <h3
            class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
          >
            {{ $t("International Memberships") }}
          </h3>
        </base-card1>
        <div v-for="qualification in qualifications" :key="qualification.id">
          <base-card1>
            <div class="tw-mb-5 tw-flex tw-items-center tw-justify-between">
              <h3 class="tw-text-foreground tw-text-xl tw-font-medium">
                {{ $t("Certificate details") }}
              </h3>
              <div class="tw-flex tw-gap-3 tw-items-center tw-justify-between">
                <button
                  class="tw-text-red-500"
                  type="button"
                  @click="
                    itemToDelete = qualification;
                    openModal = true;
                  "
                  v-if="
                    qualification.status == 'Approved' ||
                    qualification.status == 'Unverified'
                  "
                >
                {{ $t('Remove') }}
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button
                  class="tw-text-green"
                  type="button"
                  @click="restoreDelete(qualification.id)"
                  v-else
                  :disabled="removeLoading"
                >
                {{ $t('Restore') }}
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
  
              </div>
              <Teleport to="body">
                <BaseModal
                  v-if="openModal && itemToDelete?.id == qualification.id"
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
                      @click="confirmDelete(qualification.id)"
                    />
                  </div>
                </BaseModal>
              </Teleport>
            </div>
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
                <div class="text" v-if="qualification?.speciality">
                  {{  qualification?.speciality  }}
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
                  {{ $t("Qualification Level") + " :" }}
                </div>
                <div class="text">
                  {{  qualification?.rank }}
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
                <div class="text">
                  {{ qualification?. organization }}
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
                  {{ $t("labels.membershipNumber") + " :" }}
                </div>
                <div class="text">
                  {{ qualification.number }}
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
                <div class="text" v-if="qualification?.certificate_link">
                  <a
                    class="tw-text-primary tw-mx-3"
                    :href="`${WEB_URL}${qualification?.certificate_link}`"
                    target="_blank"
                  >
                    <i class="fas fa-eye"></i>
                  </a>
                </div>
              </li>
            </ul>
          </base-card1>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2 !tw-mt-11 tw-justify-end">
          <router-link
            class="base-btn-white tw-py-2 tw-rounded-lg"
            :to="{
              name: 'add-professional-diver-international-qualification',
              params: { id: route.params.id },
            }"
            >{{ $t("Add new qualification") }}</router-link
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

      <base-card1
        :title="
          $route.name != 'add-professional-diver-international-qualifications'
            ? $t('Add new qualification')
            : ''
        "
        v-if="!qualifications || !qualifications.length || canEdit"
      >
        <QualificationsForm
          :qualification="qualificationToEdit"
          :btn-loading="btnLoading"
          @submit="onSubmit"
          @close="canEdit = false"
        />
      </base-card1>
    </template>
  </div>
</template>
<script setup>
import QualificationsForm from "@/platform/components/applications/professional-diver/MembershipForm.vue";
import BaseModal from "@/website/components/base/BaseModal.vue";
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const NEW_MEMBERSHIP = import.meta.env.VITE_PROFESSIONAL_DIVER_NEW_MEMBERSHIP;
const PICK_RELATIVES = import.meta.env.VITE_PROFESSIONAL_DIVERS_PICK_RELATIVES;
const DELETE_QUALIFICATION = import.meta.env.VITE_PROFESSIONAL_DIVERS_DELETE_QUALIFICATION;
const RESTORE_WORK_QUALIFICATION = import.meta.env.VITE_RESTORE_PROFESSIONAL_DIVER_QUALIFICATION;
import { useI18n } from "vue-i18n";
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
const qualifications = ref(null);
const itemToDelete = ref(null);
const canEdit = ref(false);
const { t, locale } = useI18n();
const qualificationToEdit = ref(null);
function openEdit(qualification) {
  qualificationToEdit.value = qualification;
  canEdit.value = true;
}


function onSubmit(values) {
  btnLoading.value = true;

  const frmData = new FormData();
  if (values.id) frmData.append("id", values.id);
  frmData.append("title", values.title);
  frmData.append("specialty", values.diving_type);
  frmData.append("credential_id", values.membership_number);
  frmData.append("issuing_organization", values.organization);
  frmData.append("certificate_copy_file", values.membership_copy);
  
  axios
    .post(NEW_MEMBERSHIP + route.params.id, frmData)
    .then(() => {
      router.push({
        name: "application-home",
        params: { id: route.params.id },
      }); 
      btnLoading.value = false;
      canEdit.value = false;
    })
    .catch((err) => {
      console.log(err);
      btnLoading.value = false;

      toast.error(err.response?.data?.message);
    });
}
function getData() {
  loading.value = true;
  axios.get(PICK_RELATIVES + route.params.id).then((res) => {
    if (res.data.qualifications) qualifications.value = res.data.qualifications;

    loading.value = false;
  });
}

function confirmDelete(id) {
  removeLoading.value = true;
  axios
    .delete(DELETE_QUALIFICATION + id)
    .then((res) => {
      router.push({
        name : 'professional-diver-application-review',
        id : route.params.id
      })
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
    .get(RESTORE_WORK_QUALIFICATION + id)
    .then((res) => { 
      router.push({
        name : 'professional-diver-application-review',
        id : route.params.id
      })
      removeLoading.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.response.data.message);
    });
}

onMounted(() => getData());
</script>
<style src="@/assets/sass/centerProfile.scss" lang="scss"></style>
