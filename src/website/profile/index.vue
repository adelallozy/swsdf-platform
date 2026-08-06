<template>
  <div>
    <div
      class="tw-grid sm:tw-grid-cols-2 tw-items-start tw-gap-5 lg:tw-grid-cols-3 tw-my-11"
    >
      <base-card1>
        <router-link
          :to="{ name: 'diving-center-membership', params: { locale } }"
          class="tw-text-center tw-space-y-3 tw-py-11 tw-block"
        >
          <img
            width="100"
            height="100"
            src="@/assets/images/diving-center.svg"
            alt="direct"
            class="tw-mx-auto"
          />

          <p class="tw-font-bold tw-text-foreground tw-text-xl">
            {{ t("Dive Centers") }}
          </p>
        </router-link>
      </base-card1>
      <base-card1>
        <router-link
          :to="{ name: 'vendor-profile', params: { locale } }"
          class="tw-text-center tw-space-y-3 tw-py-11 tw-block"
        >
          <div
            class="tw-mx-auto tw-flex tw-h-[100px] tw-w-[100px] tw-items-center tw-justify-center tw-rounded-3xl tw-bg-primary/10"
          >
            <i
              class="pi pi-briefcase tw-text-4xl tw-text-primary"
              aria-hidden="true"
            ></i>
          </div>
          <p class="tw-font-bold tw-text-foreground tw-text-xl">
            {{ t("Vendors") }}
          </p>
        </router-link>
      </base-card1>
      <base-card1>
        <router-link
          :to="{ name: 'user-applications' }"
          class="tw-text-center tw-space-y-3 tw-py-11 tw-block"
        >
          <img
            width="100"
            height="100"
            src="@/assets/images/applications.svg"
            alt="direct"
            class="tw-mx-auto tw-w-[100px] object-fit-contain"
          />
          <p class="tw-font-bold tw-text-foreground tw-text-xl">
            {{ t("Applications") }}
          </p>
        </router-link>
      </base-card1>
      <base-card1>
        <router-link
          :to="{
            name: 'professional-diver-license',
            params: { locale },
          }"
          class="tw-text-center tw-space-y-3 tw-py-11 tw-block"
        >
          <img
            width="100"
            height="100"
            src="@/assets/images/profissional-diving.svg"
            alt="direct"
            class="tw-mx-auto tw-w-[100px] object-fit-contain"
          />
          <p class="tw-font-bold tw-text-foreground tw-text-xl">
            {{ t("Professional Diver License") }}
          </p>
        </router-link>
      </base-card1>
      <base-card1>
        <router-link
          :to="{
            name: 'athlete-profile',
            params: { locale },
          }"
          class="tw-text-center tw-space-y-3 tw-py-11 tw-block"
        >
          <img
            width="100"
            height="100"
            src="@/assets/images/profissional-diving.svg"
            alt="direct"
            class="tw-mx-auto tw-w-[100px] object-fit-contain"
          />
          <p class="tw-font-bold tw-text-foreground tw-text-xl">
            {{ t("Athlete Registration") }}
          </p>
        </router-link>
      </base-card1>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
</script>
