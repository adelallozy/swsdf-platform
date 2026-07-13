<template>
  <div class="w-100">
    <div
      class="row pb-5"
      v-if=" canCancel && !isPosting "
    >
      <div class="col">
        <BackButton @clicked="closeForm" ></BackButton>
      </div>
    </div>


    <!--begin::Card Design Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        for="qualification_specialty"
      >
        <span class="required">{{ t('Card Design') }}</span>
      </label>
      <!--end::Label-->
      <div class="row" :class="{ 'is-invalid': !!formErrors.card_design_id }">
        <!--begin::Col-->
        <div class="col">
          <!--begin::Option-->
          <input
            type="radio"
            class="btn-check"
            name="card_design_id"
            value="0"
            v-model="formData.card_design_id"
            @change="validateInput('card_design_id')"
            id="card_design_id_0"
          />
          <label
            class="btn btn-outline btn-outline-dashed btn-outline-default d-flex flex-column align-items-center"
            for="card_design_id_0"
          >
            <!--begin::Info-->
            
            <span class="svg-icon svg-icon-5x  ">
              <inline-svg
                src="/platform/media/applications/svgs/id-card-identity-0.svg"
              />
            </span><br/>
            <span>{{ t('Only Digital') }}</span>
            <!--end::Info-->
          </label>
          <!--end::Option-->
        </div>
        <!--end::Col-->

        <!--begin::Col-->
        <div class="col">
          <!--begin::Option-->

          <input
            type="radio"
            class="btn-check"
            name="card_design_id"
            value="1"
            v-model="formData.card_design_id"
            
            @change="validateInput('card_design_id')"
            id="card_design_id_1"
          />
          <label
            class="btn btn-outline btn-outline-dashed btn-outline-default d-flex flex-column align-items-center"
            for="card_design_id_1"
          >
            <!--begin::Info-->
            
            <span class="svg-icon svg-icon-5x  ">
              <inline-svg
                src="/platform/media/applications/svgs/id-card-identity-1.svg"
              />
            </span><br/>
            <span>{{ t('With a Hard Copy') }}</span>
            <!--end::Info-->
          </label>
          <!--end::Option-->
        </div>
        <!--end::Col-->

        <!--begin::Col-->
        <!-- <div class="col"> 
          <input
            type="radio"
            class="btn-check"
            name="design_id"
            value="2"
            v-model="formData.card_design_id"
            id="card_design_id_2"
            
            @change="validateInput('card_design_id')"
          />
          <label
            class="btn btn-outline btn-outline-dashed btn-outline-default d-flex align-items-center"
            for="card_design_id_2"
          > 
            <span class="svg-icon svg-icon-5x me-5">
              <inline-svg
                src="/platform/media/applications/svgs/id-card-identity-2.svg"
              />
            </span> 
          </label> 
        </div> -->
        <!--end::Col-->
      </div>

      <div v-if="!!formErrors.card_design_id" class="invalid-feedback">
        {{ formErrors.card_design_id }}
      </div>
    </div>

    <!--begin::City  Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        for="region_id"
      >
        <span class="required">{{ t('Region') }}</span>
      </label>
      <select
        id="region_id"
        name="region_id"
        class="form-control form-control-solid"
        v-model="formData.region_id"
        :placeholder="t('Region')"
        :class="{ 'is-invalid': !!formErrors.region_id }"
      >
        <option
          v-for="region in regions"
          :key="region.id + '-' + region.name"
          :label="region.name"
          :value="region.id"
        ></option>
      </select>
      <div v-if="formErrors.region_id" class="invalid-feedback">
        {{ formErrors.region_id }}
      </div>

      <!--end::Col-->
    </div>
    <!--end::City Input group-->

    <!--begin::City  Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        for="address_city_name"
      >
        <span class="required">{{ t('City') }}</span>
      </label>
      <input
              type="text"
              name="city_name"
              id="address_city_name"
              v-model="formData.city_name"
              @blur="validateInput('city_name')"
              class="form-control form-control-solid"
              :class="{ 'is-invalid': !!formErrors.city_name }"
              :placeholder="t('City')"
            />
 
      <div v-if="formErrors.city_name" class="invalid-feedback">
        {{ formErrors.city_name }}
      </div>

      <!--end::Col-->
    </div>
    <!--end::City Input group-->

    <!--begin::License card shipping address  Input group-->
    <div class="d-flex flex-column mb-7 fv-row">
      <!--begin::Label-->
      <label
        class="d-flex align-items-center fs-6 fw-bold form-label mb-2"
        for="license_card_shipping_address"
      >
        <span class="required">{{ t('Delivery address') }}</span>
      </label>
      <textarea
        id="license_card_shipping_address"
        name="shipping_address"
        class="form-control form-control-solid"
        @blur="validateInput('shipping_address')"
        v-model="formData.shipping_address"
        :placeholder="t('License card shipping address')"
      ></textarea>

      <!--end::Col-->
    </div>
    <!--end::License card shipping address Input group-->

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
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { object, string, date, mixed } from 'yup'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
 
import httpService from '@/core/services/HttpService.js'

import FormActionsButtons from '@/components/applications/FormActionsButtons.vue'
import BackButton from '@/components/FormsElements/ButtonBack.vue'; 

import { useApplicationStore } from "@/store/application";

export default {
  components: {
    FormActionsButtons,
    BackButton
  },

  emits: ['formClosed', 'submitCompleted'],

  setup(props, { emit }) {
    const isPosting = ref(false) ;
    const canSubmit = ref(false);
    const canCancel =  () => null != applicationStore.licenseCard ;

    const applicationStore = useApplicationStore(); 
    const { t, te } = useI18n();
    const store = useStore();
    const application = applicationStore.application;

    const diveCenters = computed(() => {
      return store.getters.getLicensedDiveCenters
    })
 
    const cities = computed(() => {
      return store.getters.getRegionCitiesList
    })
    const regions = computed(() => {
      return store.getters.getRegionsList
    })

    const formData = reactive({
      card_printing: 0,
      card_design_id: 0,
      region_id: 2,
      city_name: '' ,
      district_id: null ,
      street_name: '' ,
      zip_code: null ,
      shipping_address: '' ,
    })

    const formErrors = reactive({}) ;

    const formSchema = object().shape({
      card_printing: string(),
      card_design_id : string() ,
      region_id: string(),
      city_name: string(),
      street_name: string(),
      shipping_address: string(),
    })
    
    function validateInput(propertyName) {
      formSchema
        .validateAt(propertyName, formData)
        .then(() => {
          delete formErrors[propertyName]  ;
          canSubmit.value= true;
        })
        .catch((err) => {
          formErrors[propertyName] = err.message;
          canSubmit.value= false ;
          return false
        })
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
        return false
      }

      clearErrors()

      httpService
        .postAsFormData(
          'professional-divers-applications/updateLicenseCard/' +
            application.id,
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

            
            applicationStore.application = responseData.application ;
            applicationStore.licenseCard = responseData.license_card; 

            // store.commit('SET_APPLICATION', responseData.application)
            emit('submitCompleted') 
            // store.commit( 'MOVE_TO_NEXT_STEP' ) ;
          }
        })

        .catch((error) => {
          store.commit('SET_ERRORS', [error.message]) 
        })
        .finally(()=>{ 
          
          isPosting.value = false ;
          canSubmit.value= true;
          // isPosting.value = false ;   
        });
    }

    function updateCitiesList(e) {
      store.dispatch('getRegionCitiesList', e.target.value)
    }

    function closeForm() {
      emit('formClosed')
    }

    function setInputFile(event) {
      if (event.target.files.length < 1) {
        formData[event.target.name] = null
      }

      formData[event.target.name] = event.target.files[0];

    }

    const clearErrors = () => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
    }
    function assignLicenseCard({
      card_design_id,
      region_id,
      city_name,
      shipping_address,
    }) {
      Object.assign(formData, { card_design_id, region_id, city_name, shipping_address  })
    }

    onMounted(() => {
      if (applicationStore.licenseCard != null) {
        assignLicenseCard(applicationStore.licenseCard)
      }
    })

    onMounted(() => {
      store.dispatch('getRegionsList')
      store.dispatch('getRegionCitiesList', formData.region_id)
    })

 

    return {
      t,
      isPosting,
      canSubmit,
      canCancel, 
      formData,
      formErrors,
      formSchema,
      cities, 
      regions,
      submitFormData,
      validateInput,
      closeForm,
      updateCitiesList,
    }
  },
}
</script>
