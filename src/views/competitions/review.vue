<template>
  <!--begin::Stepper-->
  <div
    class="stepper stepper-pills stepper-column d-flex flex-row flex-row-fluid"
    id="kt_create_account_stepper"
    ref="verticalWizardRef"
  >
    <!--begin::Content-->
    <div  class="d-flex mx-auto flex-center bg-white rounded">
      <!--begin::Form-->
      <form
        class="py-20 w-100 w-xl-700px px-9"
        novalidate="novalidate"
        id="kt_create_account_form"
      >
        <!--begin::Step 1-->
        <!--begin::Applicant profile Wrapper-->
   
        <!--end::Applicant profile Wrapper-->

   

        <!--begin::Actions-->
        <div class="d-flex flex-stack pt-10"  >
          <!--begin::Wrapper-->
          <div class="mr-2">
            <button
              type="button"
              class="btn btn-lg btn-light-primary me-3"
               
              @click="previousStep"
            >
              {{ translate('Previous') }}
              <span class="svg-icon svg-icon-3 ms-2 me-0">
                <inline-svg
                  src="/platform/media/icons/duotune/arrows/arr063.svg"
                  v-if="lang == 'ar'"
                />
                <inline-svg
                  src="/platform/media/icons/duotune/arrows/arr064.svg"
                  v-else
                />
              </span>
            </button>
          </div>
          <!--end::Wrapper-->

          <!--begin::Wrapper-->
          <div  >
             
            <button
               
              type="button"
              class="btn btn-lg btn-primary me-3"
              @click="submitApplication(2205)"
            >
              <span class="indicator-label">
                {{ translate('Submit') }}
                <span class="svg-icon svg-icon-3 ms-2 me-0">
                  <inline-svg
                    src="/platform/media/icons/duotune/arrows/arr064.svg"
                  />
                </span>
              </span>
              <span class="indicator-progress">
                {{ translate('Please wait') }}...
                <span
                  class="spinner-border spinner-border-sm align-middle ms-2"
                ></span>
              </span>
            </button>
          </div>
          <!--end::Wrapper-->
        </div>
        <!--end::Actions-->
      </form>
      <!--end::Form-->
    </div>
    <!--end::Content-->
  </div>
  <!--end::Stepper-->
</template>
<script>
  
  
import { ref,  computed, onMounted } from 'vue'
  
import initiateCommonPlugins from "@/core/plugins/CommonPlugins.js";

 
export default {
  name: 'Application',
  components: {
 
  },

  props: {
    id: {
      type: String,
    },
    stepTitle: {
      type: String,
      required: false,
    },
  },

  setup(props, context) {
    const {  router, translate }  = initiateCommonPlugins(); 
 
    const editMode = ref(false)
    const lang = computed(() => localStorage.getItem('locale')) 
    let competitionId = parseInt(props.id)

    if ( Number.isNaN(competitionId)) {
      router.push({ name: '404' })
    }

    
 
 
 
 
    onMounted(() => {
      //newParticipationApplication(competitionId);
    })

    return {
      translate,
      lang
 
    }
  },
}
</script>
