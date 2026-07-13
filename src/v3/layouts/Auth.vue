<template>
  <div class="auth_layout image_bg" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="tw-container tw-py-7 tw-max-w-[600px] tw-min-h-[100vh] tw-flex tw-flex-col tw-flex-wrap ">
      <!-- Header -->
      <header class="xl:tw-ps-5 tw-mb-5">
        <nav class="tw-flex tw-items-center tw-justify-between tw-border-0">
          <div class="logo">
            <RouterLink :to="`/${currentLocale}`" class="tw-flex tw-items-end">
              <img src="/swsdf-color-symbol.png" alt="SWSDF symbol" style="width:72px" />
              <img src="/swsdf-color-name.png" alt="SWSDF" style="width:240px;height:36px;margin-inline:6px" />
            </RouterLink>
          </div>

          <div class="language">
            <Button
              type="button"
              severity="secondary"
              text
              size="small"
              :label="langLabel"
              @click="changeLang"
              :aria-label="t('Toggle language')"
              :icon="isRtl ? 'pi pi-globe' : 'pi pi-globe'"
              iconPos="right"
            />
          </div>
        </nav>
      </header>

      <!-- Main -->
      <section class="tw-pt-4 xl:tw-ps-5 tw-flex-1 tw-flex tw-items-center tw-justify-center">
        <div class="tw-w-full">
          <RouterView />
        </div>
      </section>
    </div> 
  </div>

</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'


const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()

const isRtl = computed(() => locale.value === 'ar')
const currentLocale = computed(() => (locale.value === 'en' ? 'en' : 'ar'))
const langLabel = computed(() => (locale.value === 'ar' ? 'English' : 'العربية'))

async function changeLang() {
  const next = locale.value === 'ar' ? 'en' : 'ar'
  localStorage.setItem('locale', next)
  locale.value = next

  const localizedPath = String(route.path || '').replace(
    /^\/(ar|en)(?=\/|$)/,
    `/${next}`
  )

  if (localizedPath && localizedPath !== route.path) {
    await router.replace({
      path: localizedPath,
      query: route.query,
      hash: route.hash
    })
    return
  }

  if (
    route.name &&
    (route.params?.locale ||
      route.matched?.some((record) => record.path.includes(':locale')))
  ) {
    try {
      await router.replace({
        name: route.name,
        params: {
          ...route.params,
          locale: next
        },
        query: route.query,
        hash: route.hash
      })
      return
    } catch (error) {
      // fallback to reload for non-localized routes
    }
  }

  location.reload()
}
</script>

<style lang="scss">
.auth_layout {
  /* Optional: subtle page background that follows Aura theme surfaces */
  background: var(--p-surface-0);
  color: var(--p-text-color);


}
.image_bg {
  background: url("@/v3/assets/images/98e873ce-023a-42fb-a682-1da9ad0de9dc.png");
  background-size: cover;
  background-position: center center;
  position: relative;


}
</style>
