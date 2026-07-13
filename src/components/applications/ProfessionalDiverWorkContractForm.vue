<template>
  <div class="w-100">
    <div
      class="row pb-5"
       
    >
      <div class="col" v-if=" applicationStore.workContracts.length > 0">
        <BackButton @clicked="closeForm" ></BackButton>
      </div>
    </div>
    

    <!--begin::Title Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        for="work_contract_dive_center_id"
      >
        <span class="required">{{ translate('Dive Center') }}</span>
      </label>
      <select
        id="dive_center_id"
        name="dive_center_id"
        class="form-control form-control-solid"
        v-model="formData.dive_center_id"
        placeholder="{{translate('Dive Center')}}"
        :class="{ 'is-invalid': !!formErrors.dive_center_id }"
        @change="validateInput('dive_center_id')"
      >
        <option value="" disabled>{{ translate('Select Dive Center') }}</option>
        <option
          v-for="diveCenter in applicationStore.licensedDiveCenters"
          :key="diveCenter.id + '-' + diveCenter.name"
          :label="diveCenter.name"
          :value="diveCenter.id"
        ></option>
      </select>

      <div v-if="formErrors.dive_center_id" class="invalid-feedback">
        {{ formErrors.dive_center_id }}
      </div>
      <!--end::Col-->
    </div>
    <!--end::Title Input group-->

    <!--begin::Skill Copy file Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="required fs-6 fw-bold form-label mb-2"
        for="work_contract_copy_file"
      >
        {{ translate('Work Contract Copy') }}:
      </label>
      <!--end::Label-->

      <!--begin::Input wrapper-->
      <div class="position-relative">
        <!--begin::Input-->
        <input
          type="file"
          name="work_contract_copy_file"
          id="work_contract_copy_file"
          v-on:change="setInputFile"
          @blur="validateInput('work_contract_copy_file')"
          class="form-control form-control-solid"
          :class="{ 'is-invalid': !!formErrors.work_contract_copy_file }"
          :placeholder= "t('Work Contract Copy')"
        />

        <div
          v-if="!!formErrors.work_contract_copy_file"
          class="invalid-feedback"
        >
          {{ formErrors.work_contract_copy_file }}
        </div>

        <!--end::Input-->
      </div>
      <!--end::Input wrapper-->
    </div>
    <!--end::skill Copy file Input group-->

    <!-- Input separator  -->
  </div>

  <!--begin::Form Action buttons -->
  <div>
    <FormActionsButtons
      @submitForm="submitFormData()"
      :loadIndicator="isPosting"
      :enabled="canSubmit"
    ></FormActionsButtons>
  </div>
  <!--end:: Form Action Buttons -->
</template>

<script>
import { reactive, ref, computed, onMounted } from 'vue'
import { object, string, date, mixed } from 'yup'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
 
import httpService from '@/core/services/HttpService.js'

import FormActionsButtons from '@/components/applications/FormActionsButtons.vue'

import { useApplicationStore } from "@/store/application";
import BackButton from '@/components/FormsElements/ButtonBack.vue'; 

import ApiService from "@/core/services/ApiService";

export default {
    components: {
        BackButton,
        FormActionsButtons,
    },

    emits: ['submitCompleted', 'formClosed'],
    props: ['application'],

    setup(props, { emit }) {
        
        const isPosting = ref(false) ;
        const canSubmit = ref(false);
        const canCancel =  () => applicationStore.workContracts &&  useApplicationStore.workContracts.length ;
    
        const applicationStore = useApplicationStore(); 
        const { t, te } = useI18n();
        const store = useStore();
        const application = props.application;
    

        const formData = reactive({
            dive_center_id: '',
            work_contract_copy_file: null ,
        });
    
        const formErrors = reactive({})
        const formSchema = object().shape({
        dive_center_id: string().required('field required'),
        work_contract_copy_file: mixed()
            .required('field required') // .required('File is required')
            .test('fileSize', 'File Size must be less than 2MB', function (file) {
                if (!file || file.size == undefined) {
                    return true
                }
                return file.size < 1024 * 1024 * 2
            })
            .test(
                'fileType',
                'File Size must be in format of PDF or Image',
                function (file) {
                    if (!file || file.type == undefined) {
                    return true
                    }
                    return (
                    file.type == 'application/pdf' || file.type.startsWith('image/')
                    )
                },
            ),
        })

        function validateInput(propertyName) {
        formSchema
            .validateAt(propertyName, formData)
            .then(() => {
                delete formErrors[propertyName]  ;
                
                canSubmit.value= true;
            })
            .catch((err) => {
                formErrors[propertyName] = err.message
                return false;
            })

        // emit('formDataUpdated', {...formData});
        }

        const submitFormData = async () => {
            isPosting.value = true ;
            canSubmit.value= false;

            try {
                let validationResult = await formSchema.validate(formData, {
                abortEarly: false,
                })
            } catch (err) {
                if (!!err.inner) {
                err.inner.forEach((error) => {
                    formErrors[error.path] = error.message
                })
                } else {
                // console.log(err);
                }
                
                isPosting.value = false ;
                return ;
            }

            clearErrors()

            httpService
                .postAsFormData(
                    'professional-divers-applications/register-work-contract/' +
                    applicationStore.application.id,
                    formData,
                )
                .then((responseData) => {
                    if (responseData.status == 'Data Validation Failed') {
                        Object.assign(formErrors, responseData.errors)
                        for (let fieldName in responseData.errors) {
                            for (let err in errors[fieldName]) {
                                formErrors[fieldName] = errors[fieldName][err]
                            }
                        }
                        return responseData.errors
                    }

                    if (
                        responseData.status == 'Success' ||
                        responseData.status == 'success'
                    ) {

                        applicationStore.application = responseData.application ;
                        applicationStore.workContracts = responseData.work_contracts ; 


                        // store.commit('SET_APPLICATION', responseData.application)
                        emit('submitCompleted')
                        // store.commit( 'MOVE_TO_NEXT_STEP' ) ;
                    }
                })

                .catch((error) => {
                // store.commit('SET_ERRORS', [error.message])
                })
                .finally(()=>{ 
                    
                    isPosting.value = false ;
                    canSubmit.value= true;
                    // isPosting.value = false ;   
                });
        }

        function closeForm() {
            emit('formClosed')
        }

        function setInputFile(event) {
            if (event.target.files.length < 1) {
                formData[event.target.name] = null;
                validateInput(event.target.name);
                return;

            }

            formData[event.target.name] = event.target.files[0];
            validateInput(event.target.name);
            canSubmit.value= true;
        }

        const clearErrors = () => {
            Object.keys(formErrors).forEach((key) => delete formErrors[key])
        }

        onMounted(() => { 
            applicationStore.fetchDiveCentersList() ;  
        });

        const translate = (text) => {
            if (te(text)) {
                return t(text)
            } else {
                return text
            }
        }

        return {
            t,
            canCancel,
            isPosting,
            canSubmit,
            translate,
            formData,
            formErrors,
            formSchema, 
            setInputFile,
            setInputFile,
            submitFormData,
            validateInput, 
            closeForm,
            applicationStore
        }
    },
}
</script>
