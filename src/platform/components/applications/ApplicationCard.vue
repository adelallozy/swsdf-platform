<template>
  <!--begin::Mixed Widget 3-->

  <div
    class="tw-border tw-border-solid tw-bg-white tw-p-5 tw-rounded-xl hover:tw-border-primary tw-transition tw-duration-300"
  >
    <div
      class="tw-flex tw-gap-x-2 tw-gap-y-1 tw-flex-wrap tw-justify-between tw-mb-5"
    >
      <h3
        class="tw-font-bold tw-flex tw-text-lg tw-items-center tw-gap-2 tw-justify-between"
      >
        {{ $t("application", { name: $t(application.purpose) }) }}
      </h3>
      <div>
 
 
        <router-link
          :to="{
            name: 'application-home',
            params: {
              id: application.id,
            },
          }"
          class="tw-text-foreground tw-font-bold tw-text-sm"
        >
          {{ $t("actions.view") }}
          <i class="far fa-eye tw-ms-1"></i>
        </router-link>
 
      </div>
    </div>

    <div
      class="tw-grid sm:tw-grid-cols-2 md:tw-grid-cols-1 lg:tw-grid-cols-2 tw-border-solid tw-mt-3 tw-gap-3 tw-rounded-md"
    >
      <div class="tw-flex tw-gap-3">
        <h4 class="tw-text-secondary tw-font-medium">
          {{ $t("Application number") + " :" }}
        </h4>
        <p class="tw-text-secondary tw-font-bold">
          {{ application.id }}
        </p>
      </div>
      <div class="tw-flex tw-gap-3">
        <h4 class="tw-text-secondary tw-font-medium">
          {{ $t("applications.status") + " :" }}
        </h4>
        <p
          class="tw-text-secondary tw-font-bold status"
          :class="setClass(application.status)"
        >
          {{ $t(application.status) }}
        </p>
      </div>
      <div class="tw-flex tw-gap-3" v-if="application.created_on">
        <h4 class="tw-text-secondary tw-font-medium">
          {{ $t("created_at") + " :" }}
        </h4>
        <p class="tw-text-secondary tw-font-bold">
          {{ application.created_on }}
        </p>
      </div>
      <div class="tw-flex tw-gap-3" v-if="application.submitted_at">
        <h4 class="tw-text-secondary tw-font-medium">
          {{ $t("submitted_at") + " :" }}
        </h4>
        <p class="tw-text-secondary tw-font-bold">
          {{ application.submitted_at }}
        </p>
      </div>

      <div 
        v-if="
            typeof application.last_quotation != undefined &&
            application.last_quotation != null &&
            ['Invoice Created', 'Confirmed', 'Invoice expired', 'Cancelled','Paid'].includes(
              application.last_quotation.status
            )
          "
        class="tw-flex tw-gap-3" 
        >
        <h4 class="tw-text-secondary tw-font-medium">
          {{ $t("Invoice") + " :" }}
        </h4>
        <p class="tw-text-secondary tw-font-bold">
          <RouterLink
            v-if = "['Confirmed' , 'Invoice Created' ,'Invoice expired','Cancelled' ,'Paid'].includes( application.last_quotation?.status) "
            :to="{ name: 'quotation-view', params: { id: application.last_quotation.id } }"
            class="tw-btn tw-px-3  tw-bg-[#12B3470A] tw-text-[#12B347]  tw-rounded-lg tw-mt-2" >
            {{ $t('View Invoice') }}  
          </RouterLink>
        </p>
      </div>


    </div>
    <div class="tw-flex tw-justify-end tw-items-center tw-mt-1" v-if="false">
      <!-- <div class="fs-7 text-muted fw-bold">{{ $t("Actions") }}</div> -->

      <div class="tw-flex tw-items-center">
        <div class="tw-text-lg tw-font-bold">
          <a
            v-if="
              ['edit', 'Edit'].includes(application.applicant_permission) &&
              ['Professional Divers Licenses', 'Professional Divers'].includes(
                application.target
              )
            "
            :href="
              '/applications/professional-diver-license-application/' +
              application.id
            "
            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 py-1"
          >
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/art/art005.svg" />
            </span>
            {{ $t("Edit") }}
          </a>
          <a
            v-if="
              application.applicant_permission == 'edit' &&
              ['Register as a practitioner', 'Jetski Participation'].includess(
                application.purpose
              ) &&
              !!application.target_id
            "
            :href="
              '/competitions/jetski-participation-application/' +
              application.target_id
            "
            class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 py-1"
          >
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/art/art005.svg" />
            </span>
            {{ $t("Edit") }}
          </a>

          <button
            v-if="
              application.stage === 'draft' &&
              [
                'Professional Divers Licenses',
                'Professional Divers',
                'Competitions',
              ].includes(application.target)
            "
            v-on:click.prevent="removeApplication(application.id)"
            class="btn btn-bg-light btn-active-color-primary btn-sm me-4"
          >
            <span class="svg-icon svg-icon-3">
              <inline-svg
                class="tw-text-red-500 tw-text-sm"
                src="/platform/media/icons/duotune/general/gen027.svg"
              />
            </span>
            {{ $t("delete") }}
          </button>

          <router-link
            v-if="
              ['draft', 'applicant_revision'].includes(application.stage) &&
              ['Professional Divers Licenses', 'Professional Divers'].includes(
                application.target
              )
            "
            :to="{
              name: 'professional-diver-license-application',
              params: { id: application.id },
            }"
            class="btn btn-bg-light btn-active-color-primary btn-sm py-1"
          >
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/art/art005.svg" />
            </span>
            {{ $t("Edit") }}
          </router-link>

          <router-link
            v-if="
              ['draft', 'applicant_revision'].includes(application.stage) &&
              ['Competitions', 'Events'].includes(application.target)
            "
            :to="{
              name: 'updateCompetitionRegistration',
              params: { id: application.id },
            }"
            class="btn btn-bg-light btn-active-color-primary btn-sm py-1"
          >
            <span class="svg-icon svg-icon-3">
              <inline-svg src="/platform/media/icons/duotune/art/art005.svg" />
            </span>
            {{ $t("Edit") }}
          </router-link>

          <router-link
            v-if="
              'sport-fishing-competition-team-registration' == application.purpose
            "
            :to="{
              name: 'fishingTeamRegistrationReview',
              params: { id: application.id },
            }"
            class="btn btn-bg-light btn-active-color-primary btn-sm py-1"
          >
            {{ $t("Review") }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="card-body pt-0 d-flex flex-column" v-if="false">
      <div class="row mt-8">
        <div class="timeline-label timeline-label-column">
          <template
            v-if="application.actions && application.actions.length > 0"
          >
            <div
              v-for="(action, i) in application.actions"
              :key="i"
              class="timeline-item"
            >
              <div class="timeline-badge">
                <i
                  class="fa fa-genderless fs-3rem"
                  :class="{
                    'text-warning':
                      ['Done', 'Completed'].includes(action.status) &&
                      ['Return to applicant', 'Return To Applicant'].includes(
                        action.action_key
                      ),

                    ' text-primary':
                      ['Done', 'Completed'].includes(action.status) &&
                      ['Submit', 'Resubmit'].includes(action.action_key),

                    // issuing invoice

                    'text-primary':
                      ['Done', 'Completed'].includes(action.status) &&
                      ['Issuing invoice'].includes(action.action_key),

                    'text-success':
                      ['Done', 'Completed'].includes(action.status) &&
                      [
                        'Approval',
                        'Approvement',
                        'Payment Confirm',
                        'Payment confirm',
                      ].includes(action.action_key),

                    'text-muted': action.status == 'Canceled',
                  }"
                ></i>
              </div>
              <!--end::Badge-->

              <!--begin::Text-->
              <div class="fw-mormal timeline-content text-muted ps-3">
                <p class="text-bold mb-0">
                  {{ action.action_key ? $t(action.action_key) : '-' }} <br /><span>{{
                    action.created_at
                  }}</span>
                </p>
                <p v-if="action.description">{{ action.description }}</p>
              </div>
              <!--end::Text-->
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  application: {
    required: true,
  },
});
const emit = defineEmits(["removeApplication"]);
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function actionClass(action) {
  const actionKey = action?.action_key;

  if (
    ["Done", "Completed"].includes(action.status) &&
    ["Return to Applicant"].includes(actionKey)
  ) {
    return "text-warning";
  }

  if (
    ["Done", "Completed"].includes(action.status) &&
    ["Submit", "Resubmit"].includes(actionKey)
  ) {
    return " text-primary";
  }

  if (
    ["Done", "Completed"].includes(action.status) &&
    ["Issuing invoice"].includes(actionKey)
  ) {
    return "text-primary";
  }

  if (
    ["Done", "Completed"].includes(action.status) &&
    ["Approval", "Approvement", "Payment Confirm", "Payment confirm"].includes(
      actionKey
    )
  ) {
    return "text-success";
  }

  return "text-muted";
}
function setClass(name) {
  return name.split(" ").join("_");
}

function removeApplication(id) {
  emit("removeApplication", id);
}
</script>

<style lang="scss">
p.status {
  @apply tw-font-semibold tw-rounded-md;
  &.Draft,
  &.Incomplete,
  &.In_progress {
    @apply tw-bg-[#FF99000A] tw-text-[#FF9900];
  }
  &.Approved,
  &.Submitted,
  &.Completed,
  &.Resubmitted,
  &.Invoice_Issued {
    @apply tw-bg-[#12B3470A] tw-text-[#12B347];
  }
  &.Returned,
  &.Returned_to_applicant,
  &.Returned_To_Applicant {
    @apply tw-bg-[#b312120A] tw-text-[#b31212];
  }
}
</style>
