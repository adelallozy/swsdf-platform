<template>
	<base-card>
		<VeeForm
		v-slot="{ meta }"
		@submit="onSubmit"
		:validation-schema="schema"
		:initial-values="initialValues"
		>
		<div class="tw-mb-3 tw-space-y-7 tw-mx-auto tw-max-w-[992px]">
			<div class="tw-grid tw-gap-11 md:tw-grid-cols-2 tw-items-end">
			
				
			<base-select
				v-if="diveCenters?.length"
				:loading="divingLoader"
				:options="diveCenters"
				id="center"
				name="center"
				:label="$t('Diving Center')" 
				v-model:itemValue="initialValues.center"
			/> 
			<BaseDate
				v-model:itemValue="initialValues.start_date"
				id="start_date"
				name="start_date"
				:label="t('Contract Start Date')" 
				:placeholder=" ''"
			/>
			<BaseDate
				v-model:itemValue="initialValues.end_date"
				id="end_date"
				name="end_date"
				:label="t('Contract End Date')" 

				:placeholder=" ''"
			/>

			<UploadFile
				id="contract"
				name="contract"
				:label="$t('Work Contract Copy')"
				:placeholder="$t('Work Contract Copy')"
				accept="image/jpeg,image/jpg,image/gif,image/png,application/pdf,image/x-eps"
				v-model:image="initialValues.contract"
			/>
			</div>
			<div class="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-justify-end">
			<router-link
				v-if="back"
				:to="{
				name: 'application-home',
				params: {
					id: $route.params.id,
				},
				}"
				class="tw-w-fit base-btn-white btn-danger tw-rounded-lg"
			>
				{{ $t("Cancel") }}
			</router-link>
			<input-button
				:loading="btnLoading"
				type="submit"
				class="base-btn tw-py-2 tw-rounded-lg"
				name="save"
				:meta="meta"
			/>
			</div>
		</div>
		</VeeForm>
	</base-card>
</template>

<script setup>
const LICENSED_DIVE_CENTERS = import.meta.env.VITE_LICENSED_DIVE_CENTERS;  
import BaseSelect from "@/website/components/inputs/BaseSelect.vue";
import BaseDate from "@/website/components/inputs/BaseDate.vue";

import UploadFile from "@/website/components/inputs/UploadFile.vue";
import axios from "axios";
import { reactive, ref, onMounted } from "vue";
import * as yup from "yup";
 
import { useI18n } from "vue-i18n";

const { locale } = useI18n();




const REGISTER_WORK_CONTRACT = import.meta.env
  .VITE_APPLICATIONS_PROFESSIONAL_DIVERS_CONTRACTS_REGISTER;

defineProps({
	back: {
		required: false,
		default: true,
	},
});

import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const diveCenters = ref([]);
const divingLoader = ref(false);
 
const btnLoading = ref(false);
const initialValues = reactive({
	contract: null,
	center: {},
	start_date: null,
	end_date: null,
	preview: null,
});

const schema = yup.object().shape({
  center: yup
    .mixed()
    .required(t("isRequired", { name: t("Work Contract Copy") })),
  contract: yup
    .mixed()
    .required(t("isRequired", { name: t("labels.file") }))
    .test("fileSize", t("File Size must be less than 2MB"), function (file) {
      if (file == null) {
        return true;
      }
      return file.size < 1024 * 1024 * 2;
    })
    .test(
      "fileType",
      t("File must be in format of PDF or Image"),
      function (file) {
        if (file == null) {
          return true;
        }
        return file.type == "application/pdf" || file.type.startsWith("image/");
      }
    ),
});

function getDivingCenters() {
  divingLoader.value = true;
  axios.get(LICENSED_DIVE_CENTERS).then((res) => {
    diveCenters.value = res.data.diveCenters.map((center)=> ({
      id : center.id,
      name : (locale.value == 'ar') ? center.name_ar : center.name_en 
    }))		;
    divingLoader.value = false;
  });
}


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
      btnLoading.value = false;
    })
    .catch((err) => {
      btnLoading.value = false;

      toast.error(err.message);
    });
}

// VITE_LICENSED_DIVE_CENTERS

onMounted(() => {
  getDivingCenters();
  window.scrollTo({
    top: 0,
  });
});
</script>

<style lang="scss"></style>
