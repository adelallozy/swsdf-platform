<template>
  <!--begin::Mixed Widget 3-->
  <div class="tw-border tw-border-solid tw-bg-white tw-p-3 tw-rounded-xl">
    <h2
      class="tw-font-bold tw-flex tw-items-center tw-gap-2 tw-justify-between"
    >
      {{ t(application.purpose) }}
      <span class="status" :class="application.status">{{
        t(application.status)
      }}</span>
    </h2>
    <h3 class="tw-font-bold">
      {{ t("No.") }}
      <span class="tw-font-bold tw-text-lg">: {{ application.id }}</span>
    </h3>
    <div
      class="tw-border tw-flex tw-border-solid tw-p-4 tw-mt-3 tw-flex-wrap tw-gap-3 tw-rounded-md"
    >
      <div>
        {{ t("created_at") }}

        <div class="tw-flex tw-items-center tw-gap-1 tw-justify-start tw-mt-3">
          <img
            width="20"
            height="20"
            src="@/assets/images/icons/calender.svg"
            alt="calender"
          />

          <span
            class="tw-text-sm tw-font-semibold"
            v-if="application.created_at"
            >{{
              new Date(application.created_at).toLocaleTimeString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}</span
          >
        </div>
      </div>
      <div>
        {{ t("submitted_at") }}

        <div class="tw-flex tw-items-center tw-gap-1 tw-justify-start tw-mt-3">
          <img
            width="20"
            height="20"
            src="@/assets/images/icons/calender.svg"
            alt="calender"
          />

          <span
            class="tw-text-sm tw-font-semibold"
            v-if="application.submitted_at"
            >{{
              new Date(application.submitted_at).toLocaleTimeString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}</span
          >
        </div>
      </div>
    </div>
    <div class="tw-flex tw-justify-end tw-items-center tw-mt-1">
      <!-- <div class="fs-7 text-muted fw-bold">{{ t("Actions") }}</div> -->

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
            {{ t("Edit") }}
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
            {{ t("Edit") }}
          </a>

          <a
            v-if="
              typeof application.last_quotation != undefined &&
              application.last_quotation != null &&
              ['Invoice Created', 'Confirmed', 'Invoice expired'].includes(
                application.last_quotation.status
              )
            "
            :href="'/quotations/pay-invoice/' + application.last_quotation.id"
            class="btn btn-bg-light btn-active-color-primary btn-sm me-1"
          >
            {{ t("Pay invoice") }}
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
            {{ t("delete") }}
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
            {{ t("Edit") }}
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
            {{ t("Edit") }}
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
            {{ t("Review") }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="card-body pt-0 d-flex flex-column">
      <div class="row mt-8" v-if="false">
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
                  {{ action.action_key ? t(action.action_key) : '-' }} <br /><span>{{
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

function removeApplication(id) {
  emit("removeApplication", id);
}
</script>

<style lang="scss">
span.status {
  @apply tw-font-semibold tw-rounded-md tw-py-2 tw-px-3;
  &.Draft,
  &.Incomplete {
    @apply tw-bg-[#FF99000A] tw-text-[#FF9900];
  }
  &.Submitted {
    @apply tw-bg-[#12B3470A] tw-text-[#12B347];
  }
  &.Returned {
    @apply tw-bg-[#b312120A] tw-text-[#b31212];
  }
}
</style>
