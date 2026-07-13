<template>
  <Card class="tw-h-full tw-rounded-2xl tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-bg-gradient-to-br tw-from-slate-50 tw-via-white tw-to-slate-100
               tw-border tw-border-slate-200">
    <template #content>
      <!-- Put gradient on an inner wrapper so it always shows -->
      <div
        class="tw-rounded-2xl tw-px-8 tw-py-2 tw-gap-6 tw-flex tw-flex-col tw-items-center tw-text-center"
      >
        <!-- If you really want brand colors, swap slate-* with primary-* after adding to tailwind.config.js -->

        <!-- Icon circle (real bigger icon + no line-height squash) -->
        <div class="tw-rounded-full tw-w-36 tw-h-36 tw-flex tw-items-center tw-justify-center tw-bg-white tw-shadow-inner">
          <i :class="['pi', iconClass, 'tw-text-[7rem]', 'tw-leading-none',]" class="tw-text-[6rem]"   aria-hidden="true"></i>
        </div>

        <!-- Title -->
        <h3 class="tw-text-xl tw-font-semibold tw-leading-snug tw-line-clamp-2 tw-text-slate-800" :title="title">
          {{ title }}
        </h3>

        <!-- Meta row -->
        <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2">
          <Tag
            :value="type.toUpperCase()"
            :severity="severity"
            class="tw-text-xs tw-font-medium tw-px-3 tw-py-1 tw-rounded-full"
          />
          <slot name="meta" />
        </div>

        <!-- Actions -->
        <div class="tw-flex tw-gap-3 tw-mt-2 tw-w-full tw-justify-center">
          <!-- Use PrimeVue Button to avoid theme overrides on <a> -->
          <Button
            :label="$t('Open')"
            icon="pi pi-external-link" 
            class="tw-rounded-xl tw-rounded-xl tw-border-slate-300 tw-text-slate-700 hover:tw-bg-slate-100  "
            @click="openInNewTab(href)"
          />
          <a
            :href="href"
            download
            class="p-button p-button-outlined tw-rounded-xl tw-border-slate-300 tw-text-slate-700 hover:tw-bg-slate-100"
          >
            <span class="p-button-icon pi pi-download"></span>
            <span class="p-button-label"> {{ $t('Download') }} </span>
          </a>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  type:  { type: String, default: 'file' },
  href:  { type: String, required: true }
});

const openInNewTab = (url) => window.open(url, '_blank', 'noopener');

const iconClass = computed(() => {
  const t = props.type?.toLowerCase();
  switch (t) {
    case 'pdf':   return 'pi-file-pdf tw-text-red-500';
    case 'doc':
    case 'docx':  return 'pi-file-word tw-text-blue-500';
    case 'xls':
    case 'xlsx':  return 'pi-file-excel tw-text-emerald-500';
    case 'ppt':
    case 'pptx':  return 'pi-file-ppt tw-text-orange-500';
    case 'image': return 'pi-image tw-text-indigo-500';
    case 'link':  return 'pi-link tw-text-sky-500';
    default:      return 'pi-file tw-text-slate-500';
  }
});

const severity = computed(() => {
  const t = props.type?.toLowerCase();
  if (t === 'pdf') return 'danger';
  if (t === 'xls' || t === 'xlsx') return 'success';
  if (t === 'doc' || t === 'docx') return 'info';
  if (t === 'ppt' || t === 'pptx') return 'warn';
  return null;
});
</script>

<style scoped>
.tw-line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; 
  overflow: hidden;
}
</style>
