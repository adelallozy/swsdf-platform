<template>
  <!--begin::Wrapper-->
  <div class="w-100">
    <!--begin::Heading-->
    <div class="pb-10 pb-lg-15">
      <!--begin::Title-->
      <h2 class="fw-bolder text-dark">{{ translate('Applicant Address') }}</h2>
      <!--end::Title-->

      <!--begin::Notice-->
      <div class="text-gray-400 fw-bold fs-6">
        {{
          translate('The address of the applicant for shipping license card')
        }}

        <!-- <a href="#" class="text-primary fw-bolder">Help Page</a>. -->
      </div>
      <!--end::Notice-->
    </div>
    <!--end::Heading-->

    <div class="w-100">
      <!--begin::Input group-->
      <div class="row mb-5">
        <!--begin::Col-->
        <div class="col-md-6 fv-row">
          <!--begin::Label-->
          <label
            class="required fs-6 fw-bold form-label mb-2"
            for="address_region"
          >
            {{ translate('Region') }}
          </label>
          <!--end::Label-->
          <select
            name="address_region-id"
            class="form-control form-control-solid"
            id="address_region"
            v-model="formData.region_id"
          >
            <option value="" disabled>{{ translate('Region') }}</option>
            <option
              v-for="region in regions"
              :key="region.id"
              :label="region.name"
              :value="region.id"
            >
              {{ region.name }}
            </option>
          </select>
        </div>
        <!--begin::Col-->
        <div class="col-md-6 fv-row">
          <!--begin::Label-->
          <label
            class="required fs-6 fw-bold form-label mb-2"
            for="address_city"
          >
            {{ translate('City') }}
          </label>
          <!--end::Label-->
          <select
            name="address_city_id"
            class="form-control form-control-solid"
            placeholder="Month"
            v-model="formData.city_id"
            id="address_city"
          >
            <option value="" disabled>{{ translate('City') }}</option>
            <option
              v-for="city in cities"
              :key="city.id"
              :label="city.name"
              :value="city.id"
            >
              {{ city.name }}
            </option>
          </select>
        </div>
        <!--end::Col-->
      </div>
      <!--end::Input group-->

      <!--begin::National Identity number Input group-->
      <div class="d-flex flex-column mb-7 fv-row">
        <!--begin::Label-->
        <label
          class="required fs-6 fw-bold form-label mb-2"
          for="address_string"
        >
          {{ translate('Address') }}
        </label>
        <!--end::Label-->

        <!--begin::Input wrapper-->
        <div class="position-relative">
          <!--begin::Input-->
          <input
            type="text"
            name="address"
            id="address_string"
            v-model="formData.address"
            @blur="validate('address')"
            class="form-control form-control-solid"
            :placeholder="translate('Building number, street , district')"
          />

          <!--end::Input-->
        </div>
        <!--end::Input wrapper-->
      </div>
      <!--end::National Identity number  Input group-->
    </div>
  </div>
  <!--end::Wrapper-->
</template>

<script>
import { reactive } from 'vue'
import { object, string, date } from 'yup'
import { useI18n } from 'vue-i18n'
export default {
  setup() {
    let regions = [
      { id: 1, name: 'Riyadh' },
      { id: 2, name: 'Makkah' },
      { id: 3, name: 'Almadina' },
    ]
    let cities = [
      { id: 342, name: 'Riyadh' },
      { id: 345, name: 'Jeddah' },
      { id: 346, name: 'Aldammam' },
      { id: 347, name: 'yanbua' },
    ]
    const formData = reactive({
      region_id: '',
      city_id: '',
      address: '',
      mobile: '',
    })

    const formErrors = reactive({})
    const formSchema = object().shape({
      region_id: string().required().min(8).max(120),
      city_id: string().required().min(8),
      address: string().required().min(10),
      mobile: string().required().min(9).max(10),
    })
    const { t, te } = useI18n()
    const submitForm = () => {}

    function translate(text) {
      if (te(text)) {
        return t(text)
      } else {
        return text
      }
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

    return {
      formData,
      translate,
      formErrors,
      validate,
      submitForm,
      cities,
      regions,
    }
  },
}
</script>
