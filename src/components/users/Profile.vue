<template>
  <!--begin::Navbar-->
  <div class="card mb-5 mb-xxl-8">
    <div class="card-body pt-9 pb-0">
      <!--begin::Details-->
      <div class="d-flex flex-wrap flex-sm-nowrap mb-3">
        <!--begin: Pic-->
        <div class="me-7 mb-4">
          <div
            class="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative"
          >
          <img v-if="userStore.profilePhotoLink" alt="Logo" :src=" BASE_URL + userStore.profilePhotoLink" />
          <img v-else  alt="Logo" src="/platform/media/avatars/man.png" />
          </div>
        </div>
        <!--end::Pic-->

        <!--begin::Info-->
        <div class="flex-grow-1">
          <!--begin::Title-->
          <div
            class="d-flex justify-content-between align-items-start flex-wrap mb-2"
          >
            <!--begin::User-->
            <div class="d-flex flex-column">
              <!--begin::Name-->
              <div class="d-flex align-items-center mb-2">
                <a
                  href="#"
                  class="text-gray-800 text-hover-primary fs-2 fw-bolder me-1"
                  >{{ user.alias }}</a
                >
                <a v-if=" false " href="#" >
                  <span class="svg-icon svg-icon-1 svg-icon-primary">
                    <inline-svg src="/platform/media/icons/duotune/general/gen026.svg" />
                  </span>
                </a>
              </div>
              <!--end::Name-->

              <!--begin::Info-->
              <div class="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                <a
                  href="#"
                  class="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2"
                >
                  <span class="svg-icon svg-icon-4 me-1">
                    <inline-svg
                      src="/platform/media/icons/duotune/communication/com006.svg"
                    />
                  </span>
                  {{ profilesTypes }}
                </a>
 
                <a
                  href="#"
                  class="d-flex align-items-center text-gray-400 text-hover-primary mb-2"
                >
                  <span class="svg-icon svg-icon-4 me-1">
                    <inline-svg
                      src="/platform/media/icons/duotune/communication/com011.svg"
                    />
                  </span>
                  {{ user.email }}
                </a>
              </div>
              <!--end::Info-->
            </div>
            <!--end::User-->

            <!--begin::Actions-->
            <div class="d-flex my-4">
 
            </div>
            <!--end::Actions-->
          </div>
          <!--end::Title-->

          <!--begin::Stats-->
          <div class="d-flex flex-wrap flex-stack">
            <!--begin::Wrapper-->
            <div class="d-flex flex-column flex-grow-1 pe-8">
              <!--begin::Stats-->
              <div class="d-flex flex-wrap">
 
              </div>
              <!--end::Stats-->
            </div>
            <!--end::Wrapper-->

            <!--begin::Progress-->
            <div
              class="d-flex align-items-center w-200px w-sm-300px flex-column mt-3"
            >
 
            </div>
            <!--end::Progress-->
          </div>
          <!--end::Stats-->
        </div>
        <!--end::Info-->
      </div>
      <!--end::Details-->

      <!--begin::Navs-->
      <div class="d-flex overflow-auto h-55px">
        <ul
          class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap"
        >
          <!--begin::Nav item-->
            <li class="nav-item">
                <router-link
                to="/users/overview"
                class="nav-link text-active-primary me-6"
                active-class="active"
                >{{ t('Overview') }}</router-link>
            </li>
          <!--end::Nav item-->
 
            <!--begin::Nav item-->
            <li class="nav-item">
                <router-link
                    class="nav-link text-active-primary me-6"
                    to="/users/documents"
                    active-class="active"
                >
                {{ t('Documents') }}
                </router-link>
            </li>
            <!--end::Nav item-->

           
          <!--begin::Nav item-->
            <li class="nav-item">
                <router-link
                    class="nav-link text-active-primary me-6"
                    to="/users/professional-diver"
                    active-class="active"
                >
                {{ t('Professional Diver') }}
                </router-link>
            </li>
            <!--end::Nav item--> 
        </ul>
      </div>
      <!--begin::Navs-->
    </div>
  </div>
  <!--end::Navbar-->
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent ,ref} from "vue";
import Dropdown3 from "@/components/dropdown/Dropdown3.vue";
import { useI18n } from 'vue-i18n'
import { useUserStore } from "@/store/user.js";

const BASE_URL = import.meta.env.VITE_BASE_URL; 

export default defineComponent({
  name: "profile-layout",
  components: {
    Dropdown3,
  },
  setup (){
    const { t } = useI18n();
    const userStore = useUserStore(); 
    const user = userStore.getUser (); 
    const profilesTypes = ref('');

 

    return {
      t,
      
      BASE_URL,
      user ,
      userStore ,
      profilesTypes
    }
  }
});
</script>
