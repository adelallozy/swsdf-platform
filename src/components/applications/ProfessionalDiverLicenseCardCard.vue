<template>
  <div class="w-100" v-if="applicationStore.licenseCard">
    <div class="card bg-light-primary rounded-3 mb-7">
      <div class="card-header border-0 pt-5">
        <!--begin::Title-->
        <h3 class="card-title fw-bolder text-dark">
          {{ t('License Card') }}
        </h3>
        <!--end::Title-->

        <div class="card-toolbar text-end">
          <!-- Edit button -->
          <a
            v-if="canEdit"
            @click.prevent="changeLicenseCard()"
            href="#"
            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
          >
            <!-- End of Edit button -->
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/art/art005.svg" />
            </span>
          </a>
        </div>
      </div>
      <!--end::Heading-->
      <!-- START OF: card-body  -->
      <div class="card-body row pt-0">
        <div class="card-body row pt-0">
          <div class="col-6">
            <p>
              <span class="text-gray-400 fw-bold">
                {{ t('Card Preview') }}
              </span>
              <br />
              <span  v-html="previewImageSvg"></span> 

            
              <br />
              <span class="text-gray-700 fw-bold">
                {{ t(cardDesigns[applicationStore.licenseCard.card_design_id])}}
              </span>
            </p>
          </div>
        </div>
        <div class="col-12">
          <h4 class="card-title fw-bold text-dark">
            {{ t('Delivery address') }}
          </h4>
        </div>
        <div class="card-body row pt-0">
 
          <div class="col-6">
            <p>
              <span class="text-gray-400 fw-bold">{{ t('City') }}</span>
              <br />
              <span class="text-gray-700 fw-bold">
                {{ applicationStore.licenseCard  .city_name }}
              </span>
            </p>
          </div>

          <div class="col-6">
            <p>
              <span class="text-gray-400 fw-bold">
                {{ t('Address') }}
              </span>
              <br />
              <span class="text-gray-700 fw-bold">
                {{
                  applicationStore.licenseCard  .shipping_address
                }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <!-- END OF : card-body  -->
    </div>
  </div>
</template>

<script>

import ApiService from "@/core/services/ApiService";
import { defineProps, computed ,ref ,watchEffect} from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import { useApplicationStore } from "@/store/application"; 
import { textlicenseCardSVG } from '@/core/services/LicenseCardServices.js'
const API_BASE_URL = import.meta.env.VITE_APP_API_URL ;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const LICENSE_CARED_SVG = import.meta.env.VITE_LICENSE_CARD_SVG
const LICENSE_CARD_IMG = import.meta.env.VITE_LICENSE_CARD_IMG
export default {
  props: [ ],
  emits: ['enableEditMode'],
  name: 'ProfessionalDiverWorkContractsCard',

  setup(props, { emit }) { 
 
    const rawCard = ref('');
    const photoImageUrl = ref('');

    const previewImageSvg = ref('');
    const applicationStore = useApplicationStore();  
    if ( null == applicationStore.licenseCard   ) {
      emit('enableEditMode');
    }
    
    const cardDesigns ={
      0 : "Digital Copy" ,
      1 : "Hard Copy"
    };

    const { t, te } = useI18n();
    const canEdit =  (() => { return applicationStore.application.applicant_permission == 'Edit' })();
    

    fetch( '/'+LICENSE_CARED_SVG )
    .then( response =>  response.blob() )
    .then( file => file.text())
    .then(rawText => { rawCard.value = rawText }); 

    function changeLicenseCard() {
        if (!canEdit) { return; }
        applicationStore.moveTo('Professional Diver License Card');
        applicationStore.activeAction = 'EDIT'; 
        
        emit('enableEditMode')
    }
    watchEffect(() => {

      // 
      if ( rawCard.value   ) { 
        rawCard.value = rawCard.value.replace(/{{NAME_ARABIC}}/gm  , applicationStore.applicantProfile.name_ar );
        rawCard.value = rawCard.value.replace(/{{NAME_ENGLISH}}/gm , applicationStore.applicantProfile.name_en );
        rawCard.value = rawCard.value.replace(/inkscape:label="photograph"/gm   , `xlink:href="${BASE_URL}${applicationStore.applicantPortrait.portrait_link}"`   );
        rawCard.value = rawCard.value.replace(/inkscape:label="background"/gm   , `xlink:href="${BASE_URL}${LICENSE_CARD_IMG}"`   );
        
        previewImageSvg.value = rawCard.value; 
      }
    });



    return { t, canEdit,applicationStore,  changeLicenseCard, cardDesigns ,previewImageSvg }
  },
}
</script>
