<template>
    <!--begin::Mixed Widget 3-->
    <div   class="card mb-4">
       <!--begin::Beader-->
       <div class="card-header border-0 py-5">
      <h3 class="card-title align-items-start flex-column">
            <span  class="card-label fw-bolder fs-3 mb-1">{{ competition.title}}</span>
      </h3>

      <div class="card-toolbar">
        <!--begin::Menu-->
 
 
        <router-link   
            v-if=" competition.sport ==  'Sport Fishing' && competition.stage == 'Registration'  "
            :to="{'name' : 'fishingTeamNewRegistration', 'params' : {id :competition.id }}" 
            class="btn  btn-bg-light btn-active-color-primary btn-sm py-1 "
                
        >  {{ t('Register') }}
        </router-link>
        <router-link  
            v-else-if=" competition.stage == 'Registration'  "
            :to="{'name' : 'newCompetitionRegistration', 'params' : {id :competition.id }}" 
            class="btn  btn-bg-light btn-active-color-primary btn-sm py-1 "
                
        >  {{ t('Register') }}
        </router-link>
        <!--end::Menu-->
      </div>
    </div>
    <!--end::Header-->

        <!--begin::Body-->
        <div class="card-body pt-0 d-flex flex-column">
            <!--begin::Row-->
            <div class="row g-0">
 
                <!--begin::Col-->
                <div class=" col-sm col-xs-6 mr-8">
                    <!--begin::Label-->
                    <div class="fs-7 text-muted fw-bold">{{ t('Starts On') }}</div>
                    <!--end::Label-->

                    <!--begin::Stat-->
                    <div class="d-flex align-items-center">
                        <div class="fs-4 fw-bolder">{{  competition.starts_on  }}</div>
                        <!-- <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                        <inline-svg src="/platform/media/icons/duotune/arrows/arr066.svg" />
                        </span> -->
                    </div>
                    <!--end::Stat-->
                </div>
                <!--end::Col-->

            
                <!--begin::Col-->
                <div class=" col-sm col-xs-6 mr-8">
                    <!--begin::Label-->
                    <div class="fs-7 text-muted fw-bold">{{ t('Ends On') }}</div>
                    <!--end::Label-->

                    <!--begin::Stat-->
                    <div class="d-flex align-items-center">
                        <div class="fs-4 fw-bolder">{{  competition.ends_on  }}</div>
                        <!-- <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                        <inline-svg src="/platform/media/icons/duotune/arrows/arr066.svg" />
                        </span> -->
                    </div>
                    <!--end::Stat-->
                </div>
                <!--end::Col-->

                           
                <!--begin::Col-->
                <div
                    v-if=" !!competition.registration_ends_on  " 
                    class=" col-sm col-xs-6 mr-8">
                    <!--begin::Label-->
                    <div class="fs-7 text-muted fw-bold">{{ t('Registration Ends On') }}</div>
                    <!--end::Label-->

                    <!--begin::Stat-->
                    <div class="d-flex align-items-center">
                        <div class="fs-4 fw-bolder">{{  competition.registration_ends_on  }}</div>
                        <!-- <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                        <inline-svg src="/platform/media/icons/duotune/arrows/arr066.svg" />
                        </span> -->
                    </div>
                    <!--end::Stat-->
                </div>
                <!--end::Col-->

                <!--begin::Col-->
                <div class=" col-sm col-xs-6 mr-8" v-if="competition.city_name" >
                    <!--begin::Label-->
                    <div class="fs-7 text-muted fw-bold">{{ t('City') }}</div>
                    <!--end::Label-->

                    <!--begin::Stat-->
                    <div class="d-flex align-items-center">
                        <div 
                            
                            class="fs-4 fw-bolder" >{{ t(competition.city_name) }}</div>
                        <!-- <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                            <inline-svg src="/platform/media/icons/duotune/arrows/arr066.svg" />
                        </span> -->
                    </div>
                    <!--end::Stat-->
                </div>
                <!--end::Col-->
                                <!--begin::Col-->
                <div class=" col-sm col-xs-6 mr-8"  v-if="competition.racing_categories" >
                    <!--begin::Label-->
                    <div class="fs-7 text-muted fw-bold">{{ t('Racing Categories') }}</div>
                    <!--end::Label-->

                    <!--begin::Stat-->
                    <div class="d-flex align-items-center">
                        <div 
                             
                            class="fs-4 fw-bolder" >{{  competition.racing_categories  }}</div>
                        <!-- <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                            <inline-svg src="/platform/media/icons/duotune/arrows/arr066.svg" />
                        </span> -->
                    </div>
                    <!--end::Stat-->
                </div>
                <!--end::Col-->

 
            </div>
            <div class="row g-0">
 
 <!--begin::Col-->
<div 
    v-if="competition.subject == 'Competition'"
    class=" col-sm col-xs-6 mt-8 mr-8">
    <!--begin::Label-->
    <div class="fs-7 text-muted fw-bold">{{ t('Medical Examination Form') }}</div>
    <!--end::Label-->

    <!--begin::Stat-->
    <div class="d-flex align-items-center">
        <div class="fs-4 fw-bolder"> 
            <a
                v-if=" ['Freediving' , 'Free Diving' ].includes (competition.sport) "
                href="https://swsdf.sa/documents/freediving-medical-mxamination.pdf" target="_blank"> {{ t('Download') }} </a>
            <a
                v-else-if="  competition.sport == 'Jetski' "
                href="https://swsdf.sa/documents/jetski-medical-assessment.pdf" target="_blank"> {{ t('Download') }} </a>
            <a
                v-else-if="  competition.sport == 'Sport Fishing' "
                href="https://swsdf.sa/documents/sport-fishing-medical-assessmen.pdf" target="_blank"> {{ t('Download') }} </a>

        </div>

    </div>
    <!--end::Stat-->
</div>
 <!--end::Col-->

 
 
 


</div>
        </div>
        <!--end::Body-->

    </div>
    <!--end::Mixed Widget 3-->
</template>
  
<script lang="ts">
    import { defineComponent, ref } from "vue";
    import { useI18n } from 'vue-i18n'; 
    
    import { useUserStore } from "@/store/user.js";
    
    export default defineComponent({
        name: "competition-card",
        components: { 
        },
        props: {
    
            competition: Object  
        },
        emits: ['subscribe'] , 
        setup( props , { emit } ) {
            const { t  } = useI18n();
            const userStore = useUserStore() ;
    
        return {  
            t, 
            userStore, 
        };
        },
    });
  
</script>
  