<template>
  <div class="w-100">
    <div
      class="row pb-5"
    >
      <div class="col">
        <BackButton @clicked="closeForm" ></BackButton>
      </div>
    </div>

    <!--begin::Title Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        for="skill_title"
      >
        <span class="required">{{ t('Speciality') }}</span>
      </label>
      <!--end::Label-->
      <input
        id="skill_title"
        type="text"
        name="title"
        v-model="formData.title"
        @blur="validateInput('title')"
        class="form-control form-control-solid"
        placeholder="Skill title"
        :class="{ 'is-invalid': !!formErrors.title }"
      />
      <div v-if="!!formErrors.title" class="invalid-feedback">
          {{ formErrors.title }}
        </div>
    </div>
    <!--end::Title Input group-->

    <!--begin::Skill Copy file Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="required fs-6 fw-bold form-label mb-2"
        for="skill_form_skill_copy"
      >
        {{ t('Certificate Copy') }} :
      </label>
      <!--end::Label-->

      <!--begin::Input wrapper-->
      <div class="position-relative">
        <!--begin::Input-->
        <input
          type="file"
          name="certificate_copy_file"
          id="skill_form_skill_copy"
          v-on:change="setInputFile"
          @blur="validateInput('certificate_copy_file')"
          class="form-control form-control-solid"
          :class="{ 'is-invalid': !!formErrors.certificate_copy_file }"
          placeholder="t('Certificate Copy')"
        />

        <div v-if="formErrors.certificate_copy_file" class="invalid-feedback">
          {{ formErrors.certificate_copy_file }}
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
import { reactive, ref, computed, onMounted } from 'vue';
import { object, string, date, mixed } from 'yup';
import { useI18n } from 'vue-i18n'; 

import JWTService from '@/core/services/JWTService.js'
import httpService from '@/core/services/HttpService.js'

import FormActionsButtons from '@/components/applications/FormActionsButtons.vue'
import BackButton from '@/components/FormsElements/ButtonBack.vue'; 

import { useApplicationStore } from "@/store/application";
export default {
  components: {
    BackButton,  
    FormActionsButtons,
  },

  emits: ['submitComplete', 'formClosed'],
  props: ['skillFormEntity'],

  setup(props, { emit }) {
    
    const isPosting = ref(false) ;
    const canSubmit = ref(false);

    const applicationStore = useApplicationStore(); 
    const { t, te } = useI18n() 
    const application = applicationStore.application;

 
    const canEdit =  (()=> {return applicationStore.application.applicant_permission == 'Edit'})() ;
    const formData = reactive({
      id: null,
      title: '',
      qualification_id: '',
      application_id: '',
      certificate_copy_file:null ,
    }) 
    const formErrors = reactive({})
    const formSchema = object().shape({
      title: string().required(t('Data required')),
      certificate_copy_file: mixed()
      
        .required(t('Required file')) // .required('File is required')
        .test('fileSize', 'File Size must be less than 1MB', function (file) {
          if (null == file || file.size == undefined) {
            return true ;
          }else {
            return file.size < 1024 * 1024
          }
        })
        .test(
          'fileType',
          'File Size must be in format of PDF or Image',
          function (file) {
            if (null == file || file.type == undefined) {
              return true   ; 
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
          formErrors[propertyName] = '';
          canSubmit.value= true;
        })
        .catch((err) => {
          formErrors[propertyName] = err.message;
          
          canSubmit.value= false;
          return false
        })

      // emit('formDataUpdated', {...formData});
    }

    const submitFormData = async () => {
      
      isPosting.value = true ;
      canSubmit.value= false;

      if (!canEdit) {
        return
      }
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
        canSubmit.value= true;
        return false
      }

      clearErrors()

      httpService
        .postAsFormData(
          'professional-divers-applications/register-skill/' +
          applicationStore.application.id,
          formData,
        )
        .then((responseData) => {
          if (responseData.status == 'Data Validation Failed') {
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
            
            isPosting.value = false ;
            applicationStore.application = responseData.application ;
            applicationStore.qualifications = responseData.qualifications ; 

            // store.commit('SET_APPLICATION', responseData.application)
            emit('submitComplete')
            // store.commit( 'MOVE_TO_NEXT_STEP' ) ;
          }
        })

        .catch((error) => {
          // store.commit('SET_ERRORS', [error.message])
        })
        .finally(()=>{ 
          canSubmit.value= true;
          // isPosting.value = false ;   
        });

    }

    function setInputFile(event) {
      if (event.target.files.length < 1) {
        formData[event.target.name] = null
      }

      formData[event.target.name] = event.target.files[0]
    }

    const clearErrors = () => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
    }

    function assignSkill({ id, title, qualification_id, application_id }) {
      Object.assign(formData, { id, title, qualification_id, application_id })
    }

    onMounted(() => {
      console.log(props.skillFormEntity)
      assignSkill(props.skillFormEntity)
    })

 
  

    function closeForm() {
      emit('formClosed')
    }

    return {
      t,
      isPosting,
      canSubmit,
      formData,
      formErrors, 
      formSchema,
      setInputFile,
      setInputFile,
      submitFormData,
      validateInput,
      closeForm,
    }
  },
}
</script>
