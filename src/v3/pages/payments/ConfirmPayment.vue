<template>
    <loader v-if="loading" />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { apiGet } from '@/v3/services/httpClient.js'
  

  /* ENV */
  const CHECK_ENDPOINT   = import.meta.env.VITE_QUOTATIONS_CHECK_PAYMENT   // e.g. "/admins-api/quotations/check-payment/"

 
  const loading = ref(true)
  const route   = useRoute()
  const router  = useRouter()
  const { locale } = useI18n()
  onMounted(async () => {
    const id = route.params.id
    if (!id) {
      // fallback if route is malformed
      await router.replace({ name: 'user-applications' })
      return
    }
  
    try {
      // 1) Hit the new payment-check endpoint with the quotation id
      await apiGet(`${CHECK_ENDPOINT}${id}`)
  
      // 2) (Optional) Pull fresh quotation if you need local state; safe to skip if you only redirect
      // const res = await apiGet(`${PICK_ENDPOINT}${id}`)
      // const q   = res?.quotation
  
      // 3) Redirect to invoice-review by QUOTATION id (as requested)
      await router.replace({ name: 'invoice-review', params: { id , locale:locale.value } })
    } catch (e) {
      // Minimal failure path → still send user to review page for manual refresh
      await router.replace({ name: 'invoice-review', params: { id: route.params.id ,locale:locale.value } })
    } finally {
      loading.value = false
    }
  })


  onMounted(async () => {
  const id = route.params.id
  if (!id) {
    await router.replace({ name: 'applications-index', params: { locale: locale.value } })
    return
  }

  try {
    // 1) trigger payment status reconciliation on backend
    const res =  await apiGet(`${CHECK_ENDPOINT}${id}`)
 
    const q   = res?.quotation

    const status = String(q?.status || '').toLowerCase()
    const isPaid =
      status === 'paid' || Boolean(q?.invoice_id) || Boolean(q?.paid_at)

    if (isPaid) {
      // go to "my-application" when paid
      await router.replace({ name: 'applications-index', params: { locale: locale.value } })
    } else {
      // otherwise, stay in the review flow
      await router.replace({ name: 'invoice-review', params: { id, locale: locale.value } })
    }
  } catch {
    // if anything fails, send to review so the user can retry
      await router.replace({ name: 'applications-index', params: { locale: locale.value } })
  } finally {
    loading.value = false
  }
})


  </script>
  