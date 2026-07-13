<template>
  <base-card class="tw-bg-white">
    <div
      class=" tw-bg-whitetw-flex tw-justify-between tw-flex-wrap tw-gap-x-3 tw-gap-y-2 tw-items-center"
    >
      <h3 class="tw-text-foreground tw-font-bold tw-text-xl tw-mb-1">
        {{ $t("Attached Files") }}
      </h3> 
      <router-link
        v-if="['draft', 'applicant_revision'].includes(application?.stage)"
        :to="{ name: 'add-new-file' }"
        class="base-btn-white tw-rounded-lg tw-py-2 tw-ms-auto"
      >
        {{ $t("Add File") }}
      </router-link>
    </div>
    <div> 
 
      <ul
        class="tw-space-y-2 tw-ps-3 tw-mb-2"
        v-if="application?.requirements?.files"
      >
        <template
          v-for="(value, key) of application.requirements.files"
          :key="key"
        >
          <li
            v-if="!setRequiredFiles(key)  && value == 'Required' "
            :class="value == 'Required' ? 'tw-text-red-500' : ''"
            class="tw-font-bold tw-flex tw-items-center tw-gap-2"
          >
            <span v-if="value == 'Required'">*</span>
            <span> {{ $t(key) }} </span>
          </li>
        </template>
      </ul>

      <ul class="tw-space-y-2 tw-ps-3" v-if="populatedEntities?.files">
        <template v-for="file in populatedEntities?.files" :key="file.id">
          <li class="tw-font-bold tw-flex tw-items-center tw-gap-2">
            <span> {{ $t(file.caption) }} </span>

            <div class="tw-flex tw-gap-x-5 tw-items-center">
              <a
                class="tw-text-primary tw-ms-2"
                :href="`${WEB_URL}${file.link}`"
                target="_blank"
              >
                <i class="fas fa-eye"></i>
              </a>
              <button
                class="tw-text-red-500"
                type="button"
                @click="
                  itemToDelete = file;
                  openModal = true;
                "
              >
                <i class="fa-solid fa-trash"></i>
              </button>
              <Teleport to="body">
                <BaseModal
                  v-if="openModal && itemToDelete.id == file.id"
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
                      :loading="btnLoading"
                      type="button"
                      class="base-btn tw-mx-auto tw-mt-5 tw-bg-red-500 tw-border-red-500 hover:tw-text-red-500 hover:tw-border-red-500"
                      name="delete"
                      @click="confirmDelete(file.id)"
                    />
                  </div>
                </BaseModal>
              </Teleport>
            </div>
          </li>
        </template>
      </ul>


    </div>
  </base-card>
</template>

<script setup>
import axios from "axios";
import { toRef, watch, ref, getCurrentInstance } from "vue";
import BaseModal from "@/website/components/base/BaseModal.vue";
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const REMOVE_FILE = import.meta.env.VITE_APPLICATION_REMOVE_FILE;
const itemToDelete = ref(null);
const globalVariable = getCurrentInstance();
const emitter = globalVariable.appContext.config.globalProperties.emitter;
 

	import { useApplicationStore } from "@/v3/composables/useApplicationStore";
	const appStore = useApplicationStore();
	const {
		application,
    populatedEntities, 
	} = appStore;

 
 

const openModal = ref(false);
const btnLoading = ref(false);
function confirmDelete(id) {
  btnLoading.value = true;
  axios
    .delete(REMOVE_FILE + id)
    .then(() => {
      btnLoading.value = false;
      itemToDelete.value = null;
      openModal.value = false;
      emitter.emit("getApplication");
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.response.data.message);
    });
}

function setRequiredFiles(name) {
  if (!populatedEntities?.files?.length    ) {
    return ;
  }

  return populatedEntities?.files?.some((el) => el.caption == name);
}
 

const emit = defineEmits(["submit"]);
 
</script>
