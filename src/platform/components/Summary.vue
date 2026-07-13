<template>
  <div>
    <base-card1 class="tw-mb-3">
      <div class="tw-flex tw-justify-between tw-gap-3 tw-flex-wrap tw-mb-4">
        <h3
          class="tw-flex tw-gap-2 tw-justify-between tw-items-center tw-text-foreground tw-font-medium tw-flex-wrap"
        >
          <span class="lg:!tw-text-xl tw-font-bold">
            {{ $t("application", { name: $t(application.purpose) }) }}
          </span>
        </h3>
        <application-action-card
          @resume-application="emit('resume-application')"
          :can-submit="canSubmit"
          :application="application"
        />
      </div>

      <div class="">
        <ul class="item-details tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3">
          <li class="sm:tw-col-span-2 lg:tw-col-span-3 !tw-mb-4" v-if="event">
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("Competition") + " :" }}
            </div>
            <div class="text !tw-font-bold">
              {{ event.title }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("Application number") + " :" }}
            </div>
            <div class="text">
              {{ application.id }}
            </div>
          </li>

          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/document-text.svg"
                alt="icon"
              />
              {{ $t("professional_divers.status") + " :" }}
            </div>
            <div class="text">
              {{ $t(application.status) }}
            </div>
          </li>

          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/calendar.svg"
                alt="icon"
              />
              {{ t("created_at") }}
            </div>
            <div class="text">
              {{ new Date(application.created_at).toLocaleDateString("en-CA") }}
            </div>
          </li>
          <li v-if="application.submitted_at">
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/calendar.svg"
                alt="icon"
              />
              {{ t("submitted_at") }}
            </div>
            <div class="text">
              {{
                new Date(application.submitted_at).toLocaleDateString("en-CA")
              }}
            </div>
          </li>
        </ul>
      </div>
    </base-card1>
  </div>

  <div v-if="application.stage == 'applicant_revision'">
    <base-card1 v-if="applicationNotes?.notes" class="tw-mb-3 tw-bg-yellow-50">
      <div class="tw-flex tw-justify-between tw-gap-3 tw-flex-wrap tw-mb-4">
        <h3
          class="tw-flex tw-gap-2 tw-text-red-700 tw-text-bolder tw-justify-between tw-items-center tw-text-foreground tw-font-medium tw-flex-wrap"
        >
          <span class="lg:!tw-text-xl tw-font-bold">
            {{ $t("Notes") }}
          </span>
        </h3>
      </div>

      <div class="tw-text-red-700" v-html="applicationNotes?.notes"></div>
    </base-card1>
  </div>
</template>

<script setup>
import ApplicationActionCard from "./ApplicationActionCard.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  application: {
    required: true,
  },
  applicationNotes: {
    reuqired: true,
  },
  event: {
    required: false,
  },
  canSubmit: {
    required: false,
    default: true,
  },
});
const emit = defineEmits(["resume-application"]);
function setStatus(date) {
  let status = {
    class: "",
    name: "",
  };
  let months;
  const dateNow = new Date();
  const licenseDate = new Date(date);
  months = (licenseDate.getFullYear() - dateNow.getFullYear()) * 12;
  months -= dateNow.getMonth();
  months += licenseDate.getMonth();

  if (dateNow.getTime() > licenseDate.getTime())
    return (status = {
      class: "tw-text-red-500",
      name: t("expired"),
      renew: true,
    });

  if (months <= 3)
    return (status = {
      class: "tw-text-[#FFB302]",
      name: t("valid"),
      renew: true,
    });

  return (status = {
    class: "tw-text-green",
    name: t("valid"),
    renew: false,
  });
}
</script>

<style src="@/assets/sass/centerProfile.scss" lang="scss"></style>
