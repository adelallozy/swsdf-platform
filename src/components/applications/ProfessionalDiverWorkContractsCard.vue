<template>
  <div class="w-100">
    <div class="card bg-light-primary rounded-3 mb-7">
      <div class="card-header border-0 pt-5">
        <!--begin::Title-->
        <h3 class="card-title fw-bolder text-dark">
          {{ t( 'Add Work Contracts') }}
        </h3>
        <!--end::Title-->

        <div class="card-toolbar text-end"></div>
      </div>
      <!--end::Heading-->

      <div class="card-body row pt-0">
        <div class="col-12">
          <div class="row">
                <div
                    v-for="contract in applicationStore.registrationWorkContracts"
                    class="col-12 flex-column"
                >
                    <div class="fs-6 d-flex justify-content-between mt-4">
                        <div class="fw-semibold">
                        {{ contract.dive_center.name }}
                        </div>
                        <div class="d-flex fw-bold">
                        <a
                            mx-4
                            :href="`/${contract.contract_copy_link}`"
                            target="_blank"
                            v-if ="contract.contract_copy_link"
                            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                        >
                            <span class="svg-icon svg-icon-3">
                            <inline-svg
                                src="/platform/media/icons/duotune/communication/com008.svg"
                            />
                            </span>
                        </a>

                        <a
                            v-if="canEdit"
                            @click.prevent="deleteWorkContract(contract.id)"
                            href="#"
                            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                        >
                            <span class="svg-icon svg-icon-3">
                            <inline-svg
                                src="/platform/media/icons/duotune/general/gen027.svg"
                            />
                            </span>
                        </a>
                        </div>
                    </div>
                    <div class="separator separator-dashed"></div>
                </div>
                <div class="fs-6 d-flex justify-content-between mt-4">
                <div class="fw-semibold" v-if="canEdit && applicationStore.canRegisterContract ">

                    <a
                    @click.prevent="registerWorkContract"
                    class="card-title fw-bolder text-dark btn btn-light-primary btn-sm"
                    >                
                    <span class="svg-icon svg-icon-3">
                        <inline-svg src="/platform/media/icons/duotune/abstract/abs011.svg" />
                    </span>
                    &nbsp;
                    {{t('Add Work Contract') }}
                    </a>
                    <div class="d-flex fw-bold"></div>
                </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  </div>

<br/>
    <div class="w-100" v-if ="applicationStore.removedWorkContractsCount">
        <div class="card bg-light-danger rounded-3 mb-7">
        <div class="card-header border-0 pt-5">
            <!--begin::Title-->
            <h3 class="card-title fw-bolder text-dark">
            {{ t('Delete Work Contracts') }}
            </h3>
            <!--end::Title-->

            <div class="card-toolbar text-end"></div>
        </div>
        <!--end::Heading-->

        <div class="card-body row pt-0">
            <div class="col-12">
            <div class="row">
                <div
                v-for="contract in applicationStore.removedWorkContracts"
                class="col-12 flex-column"
                >
                <div class="fs-6 d-flex justify-content-between mt-4">
                    <div class="fw-semibold">
                    {{ contract.dive_center.name }}
                    </div>
                    <div class="d-flex fw-bold">

                    <a
                        v-if="canEdit"
                        @click.prevent="restoreWorkContract(contract.id)"
                        href="#"
                        class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                    >
                        <span class="svg-icon svg-icon-3">
                        <inline-svg
                            src="/platform/media/icons/fontawesome/rotate-left-solid.svg" 
                        />
                        </span>
                    </a>
                    </div>
                </div>
                
                </div>
            
            </div>
    
            </div>
        </div>
        </div>
    </div>

</template>

<script>
import { defineProps, computed } from 'vue'
import { useStore } from 'vuex'
import ApiService from "@/core/services/ApiService"; 
import { useI18n } from 'vue-i18n';

import { useApplicationStore } from "@/store/application";

const RESTORE_WORK_CONTRACT_URL = import.meta.env.VITE_RESTORE_PROFESSIONAL_DIVER_WORK_CONTRACT;

const DELETE_WORK_CONTRACT_URL = import.meta.env.VITE_DELETE_PROFESSIONAL_DIVER_WORK_CONTRACT;
export default { 
  emits: ['enableEditMode'],
  name: 'ProfessionalDiverWorkContractsCard',

  setup(props, { emit }) {
    
    const applicationStore = useApplicationStore();  
    
    if ( null == applicationStore.workContracts || !applicationStore.workContracts.length ) {
      emit('enableEditMode');
    }

    const store = useStore()
    const { t, te } = useI18n();
    const canEdit =  (applicationStore.application.applicant_permission == 'Edit') ;

    function deleteWorkContract(cid) {
        ApiService.post( DELETE_WORK_CONTRACT_URL + cid  )
            .then(response => {
                if( response.data.workContracts != undefined ){
                    applicationStore.workContracts= response.data.workContracts; 
                }

                if( response.data.application != undefined ){
                    applicationStore.application= response.data.application; 
                }

                
                
                if ( null == applicationStore.workContracts || !applicationStore.workContracts.length ) {
                emit('enableEditMode');
                }
            })
            .catch((error) => {
                console.log(error); 
            })
            .finally() ;
        
    }

    function restoreWorkContract(cid){
        ApiService.post( RESTORE_WORK_CONTRACT_URL + cid  )
            .then(response => {
                if( response.data.workContracts != undefined ){
                    applicationStore.workContracts= response.data.workContracts; 
                }

                if( response.data.application != undefined ){
                    applicationStore.application= response.data.application; 
                }
            })
            .catch((error) => {
                console.log(error); 
            })
            .finally() ;

         
    }

    function registerWorkContract() {
        applicationStore.moveTo('Professional Diver Work Contracts');
        applicationStore.activeAction = 'EDIT'; 
        emit('enableEditMode')
    }

 
    return { t, canEdit, applicationStore, registerWorkContract, deleteWorkContract, restoreWorkContract }
  },
}
</script>
