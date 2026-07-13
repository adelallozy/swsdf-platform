<template>
  <div>
    <base-card1 v-if="rank">
      <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
        <h3
          class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
        >
          {{ $t("License Informations") }}
        </h3>

        <router-link
          v-if="['draft', 'applicant_revision'].includes(stage)"
          :to="{
            name: 'professional-diver-application-license-informations',
            params: {
              id: $route.params.id,
            },
          }"
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

      <div class="tw-py-2">
        <ul class="item-details">
          <li>
            <div class="name">{{ $t("professional_divers.rank") }}:</div>
            <div class="text" v-if="rank.rank">
              {{ $t("professional_divers." + rank.rank) }}
            </div>
          </li>
          <li>
            <div class="name">{{ $t("Card Design") }}:</div>
            <div class="text" v-if="rank.card_design_id">
              {{
                $t(rank.card_design_id == "0" ? "Only Digital" : "Hard Copy")
              }}
            </div>
          </li>
        </ul>
      </div>
    </base-card1>

    <base-card1>
      <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
        <h3
          class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
        >
          {{ $t("Personal Picture") }}
        </h3>

        <router-link
          :to="{
            name: 'update-user-picture',
            params: { id: $route.params.id },
          }"
          v-if="['draft', 'applicant_revision'].includes(stage)"
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
      <div v-if="userPicture" class="tw-mt-2 tw-w-fit">
        <img
          width="250"
          height="250"
          class="tw-w-[240px] tw-h-[270px] tw-object-fill tw-rounded-md"
          :src="WEB_URL + userPicture.link"
          :alt="profile[`name_${$i18n.locale}`]"
        />
      </div>
    </base-card1>
    <base-card1>
      <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
        <h3
          class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
        >
          {{ $t("profiles.personal_information") }}
        </h3>

        <router-link
          :to="{
            name: 'update-user-profile',
            params: {
              id: $route.params.id,
            },
          }"
          v-if="['draft', 'applicant_revision'].includes(stage)"
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

      <div class="tw-py-4">
        <ul class="item-details tw-grid md:tw-grid-cols-2">
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/tag-user.svg"
                alt="icon"
              />
              {{ $t("profiles.name_ar") + " :" }}
            </div>
            <div class="text">{{ profile?.name_ar }}</div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/tag-user.svg"
                alt="icon"
              />
              {{ $t("profiles.name_en") + " :" }}
            </div>
            <div class="text">{{ profile?.name_en }}</div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/global.svg"
                alt="icon"
              />
              {{ $t("profiles.nationality") }}:
            </div>
            <div class="text">
              {{ profile?.nationality }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/profile-remove.svg"
                alt="icon"
              />
              {{ $t("profiles.gender") }}:
            </div>
            <div class="text">
              {{ profile?.gender }}
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
              {{ $t("profiles.birthdate") }}:
            </div>
            <div class="text">
              {{ profile?.birthdate }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/card.svg"
                alt="icon"
              />
              {{ $t('Identity Number') }}:
            </div>
            <div class="text">
              {{ profile?.identity_number }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/location.svg"
                alt="icon"
              />
              {{ $t("addresses.region") }}:
            </div>
            <div class="text">
              {{ profile?.region_name }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/call.svg"
                alt="icon"
              />
              {{ $t("labels.phoneNumber") }}:
            </div>
            <div class="text">
              {{ profile?.mobile ?? "" }}
            </div>
          </li>

          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/location.svg"
                alt="icon"
              />
              {{ $t("labels.city") }}:
            </div>
            <div class="text">
              {{ profile?.city_name }}
            </div>
          </li>
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/location.svg"
                alt="icon"
              />
              {{ $t("labels.address") }}:
            </div>
            <div class="text">
              {{ profile?.address }}
            </div>
          </li>
        </ul>
      </div>
    </base-card1>
  </div>
</template>

<script setup>
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;

import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineProps({
  profile: {
    required: true,
  },
  userPicture: {
    required: true,
  },
  stage: {
    required: false,
  },
  rank: {
    required: false,
  },
});
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
