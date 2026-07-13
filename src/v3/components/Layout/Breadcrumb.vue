<template>
    <div class="tw-flex tw-flex-row tw-w-full tw-justify-start tw-items-center tw-mx-auto tw-bg-transparent tw-px-1">
        <Breadcrumb :model="crumbs" :home="homeItem" class="tw-bg-transparent">
            <template #item="{ item }">
                <a v-if="item.url" :href="item.url">{{ item.label }}</a>
                <router-link v-else-if="!item.isLast" :to="item.route">{{ $t(item.name) }}</router-link>
                <span v-else>{{ $t(item.name) }}</span>
            </template>
        </Breadcrumb>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { useI18n } from 'vue-i18n';
    import Breadcrumb from 'primevue/breadcrumb';
    import useBreadcrumb from '@/v3/composables/layout/useBreadcrumb.js';

    const { t, locale } = useI18n();
    const { crumbs, externalHome } = useBreadcrumb();

    const homeItem = computed(() => ({
        label: t('Home'),
        url: `${externalHome}/${locale.value}`,
    }));
</script>

<style scoped >
.p-breadcrumb{
    border-bottom: none ;
    padding-left: 0 !important;
    padding-right: 0 !important;
    background-color: none;
}

</style>

 