<template>
  <!--begin::Wrapper-->
  <div class="w-100">
    <!--begin::Heading-->
    <div class="pb-10 pb-lg-15">
      <!--begin::Title-->
      <h2 class="fw-bolder text-dark">Applicant information</h2>
      <!--end::Title-->

      <!--begin::Notice-->
      <div class="text-gray-400 fw-bold fs-6">
        The information of the applicant as National Identity Or Iqama
        <!-- <a href="#" class="text-primary fw-bolder">Help Page</a>. -->
      </div>
      <!--end::Notice-->
    </div>
    <!--end::Heading-->

    <div class="w-100">
      <!--begin::Input group-->
      <div class="d-flex flex-column mb-7 fv-row">
        <!--begin::Label-->
        <label
          for="identity_name_ar"
          class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        >
          <span class="required">Full name "Arabic"</span>
        </label>
        <!--end::Label-->
        <input
          type="text"
          name="name_ar"
          id="identity_name_ar"
          v-model="formData.name_ar"
          @blur="validate('name_ar')"
          class="form-control form-control-solid"
          :class="{ 'is-invalid': !!formErrors.name_ar }"
          placeholder="Your full name in Arabic"
        />

        <div v-if="!!formErrors.name_ar" class="invalid-feedback">
          {{ formErrors.name_ar }}
        </div>
      </div>
      <!--end::Input group-->
    </div>
  </div>
  <!--end::Wrapper-->
</template>

<script>
import { reactive, computed, toRaw, onMounted, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { object, string, date } from 'yup' 
import httpService from '@/core/services/HttpService.js'

export default {
  setup() {
    const store = useStore()
    const application = computed(() => {
      return store.getters.application
    })
    const applicationId = computed(() => {
      return store.getters.application.id
    })

    const applicantIdentity = computed(() => {
      return store.getters.application
    })

    const formData = reactive({
      imageFile: '',
    })

    const formErrors = reactive({})
    const formSchema = object().shape({
        imageFile: string().required(),
    })

    watchEffect(() => {})

    const submitData = async () => {
      try {
        let result = await formSchema.validate(formData, { abortEarly: false })
      } catch (err) {
        err.inner.forEach((error) => {
          formErrors[error.path] = error.message
        })
        return false
      }

      clearErrors()
      httpService
        .post(
          'applications/update-applicant-profile/' + application.value.id,
          { body: JSON.stringify({ ...formData }) },
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

          store.commit('SET_APPLICANT_PROFILE', responseData.applicant_profile)
          store.commit('MOVE_TO_NEXT_STEP')
        })

        .catch((error) => {
          store.commit('SET_ERRORS', [error.message])
        })

      // store.dispatch('submitApplicantProfile' ,  {    } );
    }

    const validate = (property) => {
      formSchema
        .validateAt(property, formData)
        .then(() => {
          formErrors[property] = ''
        })
        .catch((err) => {
          formErrors[property] = err.message
        })
    }

    const clearErrors = () => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
    }

    onMounted(() => {
      Object.assign(formData, store.getters.applicantPicture)
    })

    return {
      application,
      applicationId,
      formData,
      formErrors,
      validate,
      submitData,
    }
  },
}
</script>
