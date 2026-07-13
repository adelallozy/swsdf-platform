<template>
    <div class="w-100" v-if=" applicationStore.applicantPortrait ">
      <div class="card bg-light-primary rounded-3 mb-7">
        <div class="card-header border-0 pt-5">
          <!--begin::Title-->
          <h3 class="card-title fw-bolder text-dark">
            {{ t('Disclaimer') }}
          </h3>
          <!--end::Title-->
  
          <div class="card-toolbar text-end">
  
          </div>
        </div>
        <!--end::Heading-->
        <!-- START OF: card-body  -->
        <div class="card-body row pt-0">
            <div class="card-body row pt-0">
                <ol>
                    <li>{{ t("Submission of the application does not mean its acceptance") }}.</li>
                    <li>{{ t('I declare that I have read the regulation and all the rules of diving issued by the Federation') }}.</li>
                    <li>{{ t('I undertake to abide by all regulations and instructions issued by the Federation and any amendment or addition thereto in the future') }}</li>
                    <li>{{ t('I confirm that all data entered are correct') }}</li> 
                </ol>
            </div> 
        </div>
        <!-- END OF : card-body  -->
      </div>
    </div>
</template>
  
<script>

    import { defineProps, computed } from 'vue'
    import { useStore } from 'vuex'
    import { useI18n } from 'vue-i18n'

    import { useApplicationStore } from "@/store/application";

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    export default {

        name: 'ProfessionalDiverApplicationDisclaimer',

        setup(props, { emit }) {

            const applicationStore = useApplicationStore(); 
            const { t } = useI18n(); 
            
            return { t,   applicationStore , BASE_URL}
        },
    }
</script>
  