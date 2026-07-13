<template>
  <!--begin::Documents toolbar-->
  <div class="d-flex flex-wrap flex-stack mb-6">
    <!--begin::Title-->
    <h3 class="fw-bolder my-2">
      {{t('My Documents')}}
      <!-- <span class="fs-6 text-gray-400 fw-bold ms-1">100+ resources</span> -->
    </h3>
    <!--end::Title-->

    <!--begin::Controls-->
    <div class="d-flex my-2">
      <!--begin::Search-->
 
      <!--end::Search-->


    </div>
    <!--end::Controls-->
  </div>
  <!--end::Documents toolbar-->

  

  <div v-if="userDocuments.length"  class="row g-6 g-xl-9 mb-6 mb-xl-9">
    <KTFile
        
      v-for=" doc in userDocuments" 
      
      :file-title=" t(doc.name)"
      :file-type="doc.type" 
      :href="doc.link"
    ></KTFile>
 
 
  </div>

  <div v-else>
    <p>{{ t('No Files') }}</p>
  </div>

</template>

<script lang="ts">
import { defineComponent, onMounted ,ref} from "vue";
import KTFolder from "@/components/files/Folder.vue";
import KTFile from "@/components/files/File.vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/breadcrumb";


import { useI18n } from 'vue-i18n'
// import { useUserStore } from "@/store/user.js";

import UserService from '@/core/services/UserService.js'

export default defineComponent({
  name: "profile-documents",
  components: {
    KTFolder,
    KTFile,
  },
  setup() {
    const { t } = useI18n();
    // const userStore = useUserStore(); 
    // const user = userStore.getUser ();
    const userDocuments = ref([]);

    UserService.getDocuments()
      .then((response)=>{
        if (  typeof response.data.documents != undefined ){
          userDocuments.value = response.data.documents; 
        }
      })
      .catch((e)=>{

      })
      .finally(()=>{

      });

    onMounted(() => {
      setCurrentPageBreadcrumbs(t("Documents"), [ t("Account"),  ]);
    });

    return {
      t,
      userDocuments
      // user ,
      // avatar ,
      // profilesTypes
    }

  },
});
</script>
