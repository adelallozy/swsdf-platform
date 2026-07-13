<template>

<base-card1 class="tw-mb-5">
    <div class="tw-py-4 tw-flex tw-justify-between tw-items-center ">
        <h3
            class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-bold tw-text-2xl"
        >
        {{ item.name }}
        </h3> 
        <div class="tw-flex">
  
            <button 
                v-if="setStatus(item.membership_expiry_on).renew"
                    type="button" 
                    class="tw-w-fit base-btn tw-py-2 tw-rounded-lg tw-mt-5   tw-px-4   tw-flex tw-items-center tw-gap-2 tw-text-foreground"

                    @click="renew"
                    :loading="btnLoading"
                >
                {{ $t("Renew") }}
         
            </button>

            <button 
                v-else
                type="button"
                @click="updateInformation"
                class="tw-py-2 tw-px-4 tw-rounded-xl tw-flex tw-items-center tw-gap-2 tw-text-foreground"
                >
                {{ $t("Update information") }}
                <img
                    width="20"
                    height="20"
                    src="@/assets/images/icons/professional/edit-2.svg"
                    alt="icon"
                />
            </button>
        </div>
    </div>
    <div class="tw-py-4 ">
    <ul class="item-details tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3">
        <li>
        <div class="name">
            <img
            width="16"
            height="16"
            src="@/assets/images/icons/professional/document-text.svg"
            alt="icon"
            />
            {{ $t("Membership number")  }} : 
        </div>
        <div class="text">
            {{ item.id }}
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
            
            {{ $t("Status" ) }} 
        </div>
        <div class="" :class="setStatus(item.membership_expiry_on).class">{{   $t(item.membership_status) }}
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
            {{ $t("Expiry date")  }} : 
        </div>
        <div class="text">
            {{ item.membership_expiry_on }}
        </div>
        </li>

        <template
            v-for="certificate in certificates"
            >

            <li>
                <div class="name" 
                    v-if="certificate.name">
                    <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/professional/user.svg"
                    alt="icon"
                    />
                    {{ $t(certificate.name) }}:
                </div> 

                <div  
                    
                    class="text" v-if="certificate.path" >
                    <a
                        class="tw-text-primary tw-ms-2"
                        :href="WWW_ROOT + certificate.path"
                        target="_blank"
                    >
                    <i class="fas fa-eye"></i> {{ $t("View") }}
                    </a>
                </div>
            </li>
        </template>
    </ul>
    </div>
</base-card1>

    <base-card1 class="tw-mb-5 ">
        <div
            class="tw-py-4 tw-flex tw-justify-between tw-items-center  tw-border-line"
        >
            <h3
                class="tw-text-foreground tw-flex tw-gap-2 tw-items-center tw-font-semibold tw-text-xl"
                >
                <img
                    width="24"
                    height="24"
                    src="@/assets/images/icons/building.png"
                    alt="icon"
                />
                {{ $t("centerDetails") }}
            </h3>
        </div>
        <!-- v-else-if="
                $route.query.step == 'apply' ||
                (data && !['draft', 'applicant_revision'].includes(data.application.stage))
            " -->
        <div class="tw-py-4">
            <ul class="item-details tw-grid lg:tw-grid-cols-2">
            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/name.png"
                    alt="icon"
                />
                {{ $t(`labels.centerName`)  }}:  
                </div>
                <div class="text">{{ item?.name}}</div>
            </li>

            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/email.png"
                    alt="icon"
                />
                {{ $t("labels.commercialRecord") }}:
                </div>
                <div class="text">
                {{ item?.cr_number }}
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
                {{ $t("labels.commercialRecordExpiration") }}:
                </div>
                <div class="text">
                {{ item?.cr_expiry_on }}
                </div>
            </li>
            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/email.png"
                    alt="icon"
                />
                {{ $t("labels.email") }}:
                </div>
                <div class="text">{{ item?.email }}</div>
            </li>
            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/phone.png"
                    alt="icon"
                />
                {{ $t("labels.phone") }}:
                </div>
                <div class="text">
                {{ item?.telephone }}
                </div>
            </li>
            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/flag.png"
                    alt="icon"
                />
                {{ $t("labels.city") }}:
                </div>
                <div class="text">
                {{ item?.city_name }}
                </div>
            </li>
            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/flag.png"
                    alt="icon"
                />
                {{ $t("labels.address") }}:
                </div>
                <div class="text">{{ item?.address }}</div>
            </li>
            <li>
                <div class="name">
                <img
                    width="16"
                    height="16"
                    src="@/assets/images/icons/flag.png"
                    alt="icon"
                />
                {{ $t("labels.website") }}:
                </div>
                <div class="text">{{ item?.website }}</div>
            </li>
            </ul>
        </div>
    </base-card1>
</template>

<script setup>

const WWW_ROOT = import.meta.env.VITE_WEB_BASE_URL;

const NEW_UPDATE = import.meta.env.VITE_DIVING_CENTERS_APPS_NEW_UPDATE;
const VITE_DIVING_CENTERS_APPS_RENEW = import.meta.env .VITE_DIVING_CENTERS_APPS_RENEW;

import axios from "axios";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
defineProps({
    item: {
        required: true,
    },
    certificates: {
        required:false
    }
});

const btnLoading = ref(false);

const emit = defineEmits(["update"]);


function setStatus(date) {
    let status = {
        class: "",
        name: "",
        renew: false
    };
    
    if (!date) {
        status.class = "tw-text-red-500";
        status.name = t("expired");
        status.renew = true;
        return status;
    }
    
    const dateNow = new Date();
    const licenseDate = new Date(date);
    
    // If expired
    if (dateNow.getTime() > licenseDate.getTime()) {
        return {
            class: "tw-text-red-500",
            name: t("expired"),
            renew: true
        };
    }
    
    // Calculate days difference
    const timeDiff = licenseDate.getTime() - dateNow.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // If less than or equal to 90 days, show renew button
    if (daysDiff <= 90) {
        return {
            class: "tw-text-[#FFB302]",
            name: t("valid"),
            renew: true
        };
    }
    
    // Valid for more than 90 days
    return {
        class: "tw-text-green",
        name: t("valid"),
        renew: false
    };
}


function renew() {
  btnLoading.value = true;
  axios
    .post(VITE_DIVING_CENTERS_APPS_RENEW + route.params.id)
    .then((res) => {
        btnLoading.value = false;
      router.push({
        name: "app-summary",
        params: {
          appId: res.data.application.id,
          locale: route.params.locale || "ar",
        },
            // path: `/workspace/applications/${res.data.application.id}/diving-centers-membership`,
            // query: {
            //   step: "step2",
            // },
        });
    })
    .catch(() => (btnLoading.value = false));
}

function updateInformation (){
    btnLoading.value = true;
  axios
    .post(NEW_UPDATE + route.params.id)
    .then((res) => {
        btnLoading.value = false;
      router.push({
        name: "app-summary",
        params: {
          appId: res.data.application.id,
          locale: route.params.locale || "ar",
        },
      });
    })
    .catch(() => (btnLoading.value = false)); 
}
</script>

<style lang="scss"></style>
