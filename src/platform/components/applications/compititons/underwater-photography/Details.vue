<!-- website/src/platform/components/applications/compititons/underwater-photography/Details.vue -->
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
            name: 'update-underwater-participation-competition-application',
            params: {
                id: $route.params.id,
                participantId: application.target_id,
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

        <div class="tw-py-4" v-if="participant">
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
                src="@/assets/images/icons/cr.png"
                alt="icon"
                />
                {{ $t("Racing categories") }}:
            </div>
            <div class="tw-flex   tw-gap-2 tw-items-center tw-flex-wrap">
                <p
                v-for="(type, index) in participant.lens_type"
                :key="index"
                class="tw-text-foreground !tw-mb-0 tw-text-sm tw-font-medium tw-p-2 tw-rounded-md tw-shadow"
                >
                {{ type }}
                </p>
            </div>
            </li>
            <li>
            <div class="name">
                <img
                width="16"
                height="16"
                src="@/assets/images/icons/cr.png"
                alt="icon"
                />
                {{ $t("Send Work Leave To") }}:
            </div>
            <div class="text">{{ participant.diver_work_leave }}</div>
        </li> 
        <br /> 

            <li>
            <div class="name">
                <img
                width="16"
                height="16"
                src="@/assets/images/icons/name.png"
                alt="icon"
                />
                {{ $t("Buddy Name") }}: 
            </div>
            <div class="text">{{ participant.body_name }}</div>
            </li>
            <li>
            <div class="name">
                <img
                width="16"
                height="16"
                src="@/assets/images/icons/cr.png"
                alt="icon"
                />
                {{ $t("Buddy Identity Number") }}:
            </div>
            <div class="text">{{ participant.body_identity_number }}</div>
            </li>
        <li>
            <div class="name">
                <img
                width="16"
                height="16"
                src="@/assets/images/icons/cr.png"
                alt="icon"
                />
                {{ $t("Buddy Mobile Number") }}:
            </div>
            <div class="text">{{ participant.body_mobile_number }}</div>
        </li>
        <li>
            <div class="name">
                <img
                width="16"
                height="16"
                src="@/assets/images/icons/cr.png"
                alt="icon"
                />
                {{ $t("Send Work Leave To") }}:
            </div>
            <div class="text">{{ participant.body_work_leave }}</div>
        </li>
        </ul>
        </div>
    </base-card1>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineProps({
    participant: {
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
