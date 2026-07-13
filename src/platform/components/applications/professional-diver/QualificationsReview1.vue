<template>
  <base-card1>
    <div class="tw-py-4 tw-flex tw-justify-between tw-items-center">
      <h3
        class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
      >
        {{ $t("International Memberships") }}
      </h3>

      <router-link
        v-if="['draft', 'applicant_revision'].includes(stage)"
        class="tw-py-2 tw-px-4 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-text-foreground"
        :to="{
          name: 'add-professional-diver-international-qualifications',
          params: {
            id: $route.params.id,
          },
        }"
      >
        {{ $t("actions.edit") }}
        <img
          tw-bg-emerald-100
          width="20"
          height="20"
          src="@/assets/images/icons/professional/edit-2.svg"
          alt="icon"
        />
      </router-link>
      <!-- <a
        v-if="['draft', 'applicant_revision'].includes(stage)"
        class="tw-py-2 tw-px-4 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-text-foreground tw-bg-border"
        href="/professional-divers-applications/professional-diver-memberships-update"
      >
        {{ $t("actions.edit") }}
        <img
          tw-bg-emerald-100
          width="20"
          height="20"
          src="@/assets/images/icons/professional/edit-2.svg"
          alt="icon"
        />
      </a> -->
    </div>
    <base-card1
      class="tw-border tw-border-line tw-mb-3 last:tw-mb-0"
      v-for="qualification in qualifications"
      :key="qualification.id"
    >
      <div class="tw-my-3 tw-pb-2 tw-border-b last:tw-border-0">
        <ul class="item-details tw-grid md:tw-grid-cols-2">
          <li>
            <div class="name">
              <img
                width="16"
                height="16"
                src="@/assets/images/icons/professional/card.svg"
                alt="icon"
              />
              {{ $t("Diving type") + " :" }}
            </div>
            <div class="text" v-if="qualification?.speciality">
              {{ t(qualification?.speciality) }}
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
              {{ $t("Qualification Level") + " :" }}
            </div>
            <div class="text">
              {{ t(qualification?.title) }}
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
              {{ $t("Diving Organization") + " :" }}
            </div>
            <div class="text">
              {{ t(qualification?.issuing_organization) }}
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
              {{ $t("labels.membershipNumber") + " :" }}
            </div>
            <div class="text">
              {{ t(qualification?.credential_id) }}
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
              {{ $t("Membership Copy") + " :" }}
            </div>
            <div class="text" v-if="qualification?.certificate_copy_link">
              <a
                class="tw-text-primary tw-mx-3"
                :href="`${WEB_URL}${qualification?.certificate_copy_link}`"
                target="_blank"
              >
                <i class="fas fa-eye"></i>
              </a>
            </div>
          </li>
        </ul>
      </div>
    </base-card1>
  </base-card1>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
const emit = defineEmits(["update"]);
const WEB_URL = import.meta.env.VITE_WEB_BASE_URL;
const props = defineProps({
  qualifications: {
    required: true,
  },
  stage: {
    required: false,
  },
});

const { t } = useI18n();
</script>

<style lang="scss"></style>
