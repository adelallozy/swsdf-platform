<template>
  <loader v-if="loading" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { QUOTATIONS_UPDATE_PAYMENT } from "@/v3/config/apiEndpoints.js";
import { apiGet } from "@/v3/services/httpClient.js";

const loading = ref(true);
const route = useRoute();
const router = useRouter();
const { locale } = useI18n();

onMounted(async () => {
  const id = route.params.id;
  if (!id) {
    await router.replace({
      name: "applications-index",
      params: { locale: locale.value },
    });
    return;
  }

  try {
    const res = await apiGet(`${QUOTATIONS_UPDATE_PAYMENT}${id}`);
    const q = res?.quotation;

    const status = String(q?.status || "").toLowerCase();
    const isPaid =
      status === "paid" || Boolean(q?.invoice_id) || Boolean(q?.paid_at);

    if (isPaid) {
      await router.replace({
        name: "applications-index",
        params: { locale: locale.value },
      });
    } else {
      await router.replace({
        name: "invoice-review",
        params: { id, locale: locale.value },
      });
    }
  } catch {
    await router.replace({
      name: "applications-index",
      params: { locale: locale.value },
    });
  } finally {
    loading.value = false;
  }
});
</script>
