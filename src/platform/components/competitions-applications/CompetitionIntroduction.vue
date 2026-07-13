<template>

    <div class="w-100"  >
      <div class="card     mb-7">
        <div class="card-header border-0 pt-5">
            <h3 class="card-title fw-bolder text-dark">
                {{ t('Terms') }}
            </h3>
        </div>
        <!--end::Heading-->
  
        <div class="card-body row pt-0">
            <div class="col" v-html="applicationStore.competition.terms"> </div>
        </div>
        <div class="d-flex flex-stack pt-10"   >
            <!--begin::Wrapper-->
                <div  > </div>
            <!--end::Wrapper-->

            <!--begin::Wrapper-->
                <div v-if="applicationStore.canApply" > <NextButton @click= "closeIntroduction" ></NextButton> </div>
            <!--end::Wrapper-->
        </div>
      </div>
    </div>
  </template>
  
<script>
    import { defineProps, onMounted, computed } from 'vue'
    import { useI18n    } from 'vue-i18n';  
    
    
    import NextButton from '@/components/FormsElements/NextButton.vue';

    import { useApplicationStore } from "@/platform/store/competitionRegistrationApplication";
    
    export default {
        props: [  ],
        emits: ['editClicked'],
        name: 'competitions-terms',
        components : {
            NextButton,
        },
    
        setup(props, { emit }) {
            const { t, te } = useI18n (); 

            const applicationStore  = useApplicationStore(); 

            if(applicationStore.isNew ){
                applicationStore.isEditing = true ;
            }

            if(applicationStore.application == null || applicationStore.application == undefined ){
                applicationStore.isEditing = true ;
            }

            if(applicationStore.athlete == null || applicationStore.athlete == undefined ){
                applicationStore.isEditing = true ;
            }

            const isSubmitted = computed(()=>{
                if(applicationStore.application == null) { return false ; }

                return applicationStore.application.status == 'Submitted' || applicationStore.application.status == 'Resubmitted' ; 
            });

            function startEdit() {  applicationStore.isEditing = true ; }
            const canEdit = computed(()=>{ 
                if(applicationStore.application == null ) { return false ; }
                return applicationStore.application.stage == 'Data Verification' || ['draft', 'applicant_revision'].includes(applicationStore.application.stage)  });

            function closeIntroduction(){
                applicationStore.introduction = false ;  
            }
 
            return {  
                t ,
                isSubmitted, 
                canEdit,  
                startEdit, 
                applicationStore ,
                closeIntroduction
            }
        },
    }
</script>
  
