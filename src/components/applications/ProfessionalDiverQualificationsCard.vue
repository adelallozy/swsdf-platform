<template>
  <div class="w-100">
    <div
      v-for="qualification in applicationStore.qualifications"
      class="card bg-light-primary rounded-3 mb-7"
    >
      <div class="card-header border-0 pt-5">
        <!--begin::Title-->
        <h3 class="card-title fw-bolder text-dark">
          {{ translate('Certificate details') }}
        </h3>
        <!--end::Title-->

        <div class="card-toolbar text-end">
          <!-- Edit button -->
          <a
            v-if="canEdit"
            @click.prevent="editQualification(qualification.id)"
            href="#"
            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
          >
            <!-- End of Edit button -->
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/art/art005.svg" />
            </span>
          </a>

          <a
            v-if="canEdit"
            @click.prevent="deleteQualification(qualification.id)"
            href="#"
            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
          >
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/general/gen027.svg" />
            </span>
          </a>
        </div>
      </div>
      <!--end::Heading-->

      <div class="card-body row pt-0">
        <div class="col-6">
          <p>
            <span class="text-gray-400 fw-bold">
              {{ translate('Qualification title') }}
            </span>
            <br />
            <span class="text-gray-700 fw-bold">{{ qualification.title }}</span>
          </p>
        </div>

        <div class="col-6">
          <p>
            <span class="text-gray-400 fw-bold">
              {{ translate('Diving Organization') }} :
            </span>
            <br />
            <span class="text-gray-700 fw-bold">
              {{ qualification.specialty }}
            </span>
          </p>
        </div>

        <div class="col-6">
          <p>
            <span class="text-gray-400 fw-bold">
              {{ translate('Diving Organization') }} :
            </span>
            <br />
            <span class="text-gray-700 fw-bold">
              {{ qualification.issuing_organization }}
            </span>
          </p>
        </div>

        <div class="col-6">
          <p>
            <span class="text-gray-400 fw-bold">
              {{ translate('Membership Number') }}
            </span>
            <br />
            <span class="text-gray-700 fw-bold">
              {{ qualification.credential_id }}
            </span>
          </p>
        </div>

        <div class="col-6">
          <p>
            <span class="text-gray-400 fw-bold">
              {{ translate('Membership Copy') }}
            </span>
            <br />
            <span class="text-gray-700 fw-bold">
              <a :href="'/' + qualification.certificate_copy_link">
                {{ translate('View') }}
              </a>
            </span>
          </p>
        </div>

        <div class="col-12">
          <h4 class="text-gray-400">{{ translate('Specialties') }} :</h4>
          <div class="row">
            <div
              v-for="skill in qualification.skills"
              class="col-12 flex-column"
            >
              <div class="fs-6 d-flex justify-content-between mt-4">
                <div class="fw-semibold">
                  {{ skill.title }}
                </div>
                <div class="d-flex fw-bold">
                  <a
                    v-if="canEdit"
                    @click.prevent="deleteSkill(skill.id)"
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

            <div v-if="canEdit">
              <div class="fs-6 d-flex justify-content-between my-4">
                <div class="fw-semibold">
                  <a
                    class="btn btn-light-primary btn-sm"
                    href="#"
                    @click.prevent="addSkill(qualification.id)"
                  >
                  <span class="svg-icon svg-icon-3">
                    <inline-svg src="/platform/media/icons/duotune/abstract/abs011.svg" />
                  </span>
                  &nbsp;&nbsp;

                    {{ translate('Add Speciality') }}
                  </a>
                </div>
                <div class="d-flex fw-bold">
                  <!--begin::Svg Icon | path: icons/duotune/arrows/arr006.svg-->
                  <span class="svg-icon svg-icon-3 me-1 svg-icon-danger"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="canEdit" class="card bg-light-primary rounded-3 mb-7">
      <div class="card-body border-0 py-3">
        <!--begin::Title-->
        <a @click="addQualification" class="fw-bolder text-dark btn btn-light-primary btn-sm">
          <span class="svg-icon svg-icon-3">
            <inline-svg src="/platform/media/icons/duotune/abstract/abs011.svg" />
          </span>
          &nbsp;&nbsp;
          {{ translate('Add Qualification') }}
        </a>
        <!--end::Title-->
      </div>
    </div>
  </div>
</template>

<script>
import { defineProps, computed , ref} from 'vue' 

import httpService from '@/core/services/HttpService.js'
import { useI18n } from 'vue-i18n'

import { useApplicationStore } from "@/store/application";
export default { 
  emits: ['editQualification', 'addQualification', 'addSkill'],
  name: 'ProfessionalDiverQualificationCard',

  setup(props, { emit }) {
    
    const isPosting = ref(false) ;
    const canSubmit = ref(false);

    const applicationStore = useApplicationStore();  
    if ( !applicationStore.qualifications ||  !applicationStore.qualifications.length ) {
        applicationStore.activeAction = 'EDIT'; 
        emit('addQualification');
    }
    const { t, te } = useI18n(); 

    const canEdit = (() => {
        return applicationStore.application.applicant_permission == 'Edit'
      })();

    function deleteQualification(qid) {
      
      isPosting.value = true ;
      canSubmit.value = false;

      httpService
        .delete('professional-divers-applications/delete-qualification/' + qid)
        .then((responseData) => {
          if (
            responseData.status == 'Success' ||
            responseData.status == 'success'
          ) {
            applicationStore.application = responseData.application
            applicationStore.qualifications = responseData.qualifications

            emit('submitComplete') ;
          }
        })
        .catch((error) => {
          // store.commit('SET_ERRORS', [error.message])
        })
        .finally(function(){
          isPosting.value = false ;
          canSubmit.value = true;
        })
    }

    function deleteSkill(sid) {
      
      isPosting.value = true ;
      canSubmit.value = false;
      httpService
        .delete('professional-divers-applications/delete-skill/' + sid)
        .then((responseData) => {
          if (
            responseData.status == 'Success' ||
            responseData.status == 'success'
          ) { 
            applicationStore.application = responseData.application ;
            applicationStore.qualifications = responseData.qualifications ; 

          }
        })
        .catch((error) => {
          // store.commit('SET_ERRORS', [error.message])
        })
        .finally(function(){
          isPosting.value = false ;
          canSubmit.value = true;
        })
    }

    function editQualification(qid) {
        if (!canEdit) { return; }
        applicationStore.moveTo('Professional Diver Memberships');
        applicationStore.activeAction = 'EDIT'; 
        emit('editQualification', qid)
    }

    function addQualification() {
        if (!canEdit) { return; }
        applicationStore.moveTo('Professional Diver Memberships');
        applicationStore.activeAction = 'EDIT'; 
        emit('addQualification')
    }

    function addSkill(qid) {
        if (!canEdit) { return; }
        applicationStore.moveTo('Professional Diver Memberships');
        applicationStore.activeAction = 'EDIT'; 
        emit('addSkill', qid)
    }

    const translate = (text) => {
      if (te(text)) {
        return t(text)
      } else {
        return text
      }
    }

    return {
      t,
      translate,
      applicationStore,
      addQualification,
      canEdit,
      editQualification,
      deleteQualification,
      addSkill,
      deleteSkill,
    }
  },
}
</script>
