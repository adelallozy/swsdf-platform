<template>
  <!--begin::Dashboard-->
  <div class="row">
    <div class="card-p mt-n20 position-relative" style="padding-left :0 !important; padding-right:0 !important;">
      <!--begin::Row-->
      <div class="row m-0">
        <div class="col bg-light-warning px-6 py-8 rounded-2 me-7 mb-7">
          <span class="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
            <inline-svg src="/platform/media/icons/duotune/abstract/abs027.svg" />
          </span>

          <a href="/user-applications" class="text-warning fw-bold fs-6">{{ t('My applications') }} </a>
        </div>
        <div class="col bg-light-primary px-6 py-8 rounded-2 me-7  mb-7">
          <span class="svg-icon svg-icon-3x svg-icon-primary d-block my-2">
            <inline-svg src="/platform/media/icons/duotune/arrows/arr075.svg" />
          </span>
          <a href="/professional-diver-license-application/new-application" class="text-primary fw-bold fs-6">{{ t('Professional Diver New License Application') }}</a>
        </div>
        <div class="col bg-light-success px-6 py-8 rounded-2 mb-7">
          <span class="svg-icon svg-icon-3x svg-icon-success d-block my-2">
            <inline-svg src="/platform/media/icons/duotune/arrows/arr075.svg" />
          </span>
          <a href="/users/documents" class="text-success fw-bold fs-6">{{ t('My Documents') }}</a>
        </div>
      </div>
      <!--end::Row-->
      <!--begin::Row-->

      <!--end::Row-->
    </div>
  </div>
  <!--end::Dashboard-->
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { setCurrentPageTitle } from "@/core/helpers/breadcrumb";


import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ApiService from "@/core/services/ApiService";

export default defineComponent({
  name: "main-dashboard",
  components: {},
  setup() {
    
    const router    = useRouter();
    const { t, te } = useI18n ();

    console.log("DashBoard ");

    ApiService.setHeader();
        ApiService.responseIntercept (null , 
            (error) => {   
                if (!error.response){  
                    
                    return Promise.reject(error);
                } 
                if ( error.response.status === 404  ) {
                    router.push({ name: '404' }); 
                }
                
                return Promise.reject(error);
            }
        );

    onMounted(() => {
      setCurrentPageTitle(t("Workspace"));
    });
    
    return {
      t,
    } ; 

  },
});
</script>
