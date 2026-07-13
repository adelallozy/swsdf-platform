<template>
  <base-card1>
    <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
      <h3
        class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
      >
        {{ $t("racer_information") }}
      </h3>

      <router-link
        :to="{
          name: 'update-jetsky-competition-application',
          params: {
            id: $route.params.id,
            event: application.target_id,
          },
        }"
        v-if="['draft', 'applicant_revision'].includes(application?.stage)"
        class="tw-text-foreground tw-flex tw-items-center tw-gap-2 tw-font-semibold"
      >
        {{ $t("Edit") }}
        <img
          width="20"
          height="20"
          src="@/assets/images/icons/professional/edit-2.svg"
          alt="icon"
        />
      </router-link>
    </div>
    <!-- :label="$t('Racer Number')"
   :label="$t('Work leave')"
   :label="$t('Racing categories')" -->

    <div class="tw-py-4" v-if="event">
      <ul class="item-details tw-grid lg:tw-grid-cols-2">
        <li v-if="userProfile">
          <div class="name">
            <img
              width="16"
              height="16"
              src="@/assets/images/icons/name.png"
              alt="icon"
            />
            {{ $t("Racer Name") }}:
          </div>
          <div class="text">{{ userProfile.name }}</div>
        </li>
        <li>
          <div class="name">
            <img
              width="16"
              height="16"
              src="@/assets/images/icons/name.png"
              alt="icon"
            />
            {{ $t("Racer Number") }}:
          </div>
          <div class="text">{{ event.racer_number }}</div>
        </li>
        <li>
          <div class="name">
            <img
              width="16"
              height="16"
              src="@/assets/images/icons/cr.png"
              alt="icon"
            />
            {{ $t("Work leave") }}:
          </div>
          <div class="text">{{ event.work_leave }}</div>
        </li>
        <li>
          <div class="name">
            <img
              width="16"
              height="16"
              src="@/assets/images/icons/cr.png"
              alt="icon"
            />
            {{ $t("Racing categories") }}:
          </div>
          <div class="tw-flex tw-w-full tw-gap-2 tw-items-center tw-flex-wrap">
            <p
              v-for="(race, index) in event.races"
              :key="index"
              class="tw-text-foreground !tw-mb-0 tw-text-sm tw-font-medium tw-p-2 tw-rounded-md tw-shadow"
            >
              {{ race }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </base-card1>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineProps({
  event: {
    required: true,
  },
  application: {
    required: false,
  },
  userProfile: {
    required: false,
  },
});
</script>
