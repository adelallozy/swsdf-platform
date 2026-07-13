<template>
	<Suspense>
		<template #default>
			<router-view />
		</template>
		<template #fallback>
			<div>Loading...</div>
		</template>
	</Suspense>
    <ConfirmDialog />
    <ToastNotifier />
</template>

<script setup>

import ToastNotifier from "@/v3/components/ToastNotifier.vue";
import ConfirmDialog from '@/v3/components/shared/ConfirmDialog.vue'; 

import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router'
import { bus, AUTH_SIGNOUT } from '@/v3/lib/bus.js'


import { initAuth } from '@/v3/composables/useAuth.js'

const { locale } = useI18n();
const router = useRouter();

const routeNeedsAuth = (route) => {
    if (!route) return false;

    if (route.meta?.auth || route.meta?.requiresAuth) {
        return true;
    }

    return route.matched?.some(
        (record) => record.meta?.auth || record.meta?.requiresAuth
    );
};

function goSignIn() {
    const currentRoute = router.currentRoute.value
    if (!currentRoute) return

    const needsAuth = routeNeedsAuth(currentRoute)
    if (!needsAuth || currentRoute?.name === 'sign-in') return

    const routeLocale = currentRoute?.params?.locale
    const resolvedLocale =
        routeLocale === 'ar' || routeLocale === 'en'
            ? routeLocale
            : (locale.value === 'en' ? 'en' : 'ar')

    router.replace({
        name: 'sign-in',
        params: { locale: resolvedLocale },
        query: { redirect: currentRoute.fullPath }
    })
}
initAuth(); 
onMounted(() => {
	bus.on(AUTH_SIGNOUT, goSignIn);
	setLangDir(locale.value);
});

watch(locale, (newLocale) => {
  	setLangDir(newLocale);
});

function setLangDir(lang) {
	const dir = lang === "ar" ? "rtl" : "ltr";
	document.documentElement.lang = lang;
	document.documentElement.dir = dir;
	document.body?.removeAttribute("dir");
}
</script>

<style lang="scss">
	@use "assets/sass/swsdf-style";
</style>
