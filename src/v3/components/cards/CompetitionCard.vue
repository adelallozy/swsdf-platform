<!-- Component: src/v3/components/cards/CompetitionCard.vue -->
<!-- Token: 2025-10-31T19:20:00+03:00 -->
<template>
  <router-link
    :to="{ name: viewRoute, params: { id: competition.id, slug: competition.slug } }"
    class="tw-block tw-h-full"
  >
    <article
      class="competition-card tw-h-full tw-flex tw-flex-col xl:tw-flex-row xl:tw-items-stretch tw-bg-white tw-rounded-xl tw-shadow-md tw-overflow-hidden tw-transition hover:tw-shadow-lg"
      :class="accentClass"
    >
      <!-- Media rail -->
      <div
        class="tw-relative tw-w-full tw-h-[200px] xl:tw-w-[320px] xl:tw-h-auto tw-flex-shrink-0 tw-bg-white tw-border-b xl:tw-border-b-0 xl:tw-border-r tw-border-slate-100"
      >
        <!-- Badge -->
        <div 
          class="tw-absolute tw-top-3 tw-z-10" 
          :class="locale === 'ar' ? 'tw-right-3' : 'tw-left-3'"
        >
          <span
            class="tw-inline-flex tw-items-center tw-gap-2 tw-text-xs tw-font-bold tw-px-3 tw-py-1.5 tw-rounded-md tw-shadow-sm"
            :class="badgeClass"
          >
            <i :class="badgeIcon" class="tw-text-xs" />
            {{ $t(badgeLabel) }}
          </span>
        </div>

        <!-- Image -->
        <img
          v-if="competition.logo_link"
          :src="getImageUrl(competition.logo_link)"
          :alt="competition.title"
          class="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-contain tw-p-4"
          width="640"
          height="360"
          loading="lazy"
        />

        <!-- Placeholder -->
        <div 
          v-else 
          class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
        >
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-slate-400">
            <i class="pi pi-trophy tw-text-4xl" />
            <span class="tw-text-xs tw-font-medium">{{ $t('No image') }}</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="tw-flex-1 tw-flex tw-flex-col tw-p-6 tw-gap-4">
        <!-- Meta pills -->
        <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
          <span 
            v-if="competition.city_name" 
            class="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-primary tw-text-xs tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded tw-bg-primary/5  "
          >
            <i class="pi pi-map-marker tw-text-[11px]" />
            {{ competition.city_name }}
          </span>
          <span 
            v-if="competition.sport" 
            class="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-slate-700 tw-text-xs tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded tw-bg-slate-100"
          >
            <i class="pi pi-trophy tw-text-[11px]" />
            {{ $t(competition.sport) }}
          </span>
          <span 
            v-if="competition.venue" 
            class="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-slate-600 tw-text-xs tw-font-medium tw-px-2.5 tw-py-1 tw-rounded tw-bg-slate-50  "
          >
            <i class="pi pi-building tw-text-[11px]" />
            {{ competition.venue }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="tw-text-lg md:tw-text-xl tw-font-bold tw-text-foreground tw-leading-snug tw-line-clamp-2 hover:tw-text-primary tw-transition-colors">
          {{ competition.title }}
        </h3>

        <!-- Racing categories -->
        <div 
          v-if="competition.racing_categories?.length" 
          class="tw-flex tw-gap-2 tw-flex-wrap"
        >
          <span
            v-for="(race, idx) in visibleCategories"
            :key="idx"
            class="tw-text-[11px] tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded tw-bg-slate-50 tw-border tw-border-slate-200"
          >
            {{ race }}
          </span>
          <span
            v-if="competition.racing_categories.length > 3"
            class="tw-text-[11px] tw-font-semibold tw-px-2.5 tw-py-1 tw-rounded tw-bg-primary/10 tw-text-primary tw-border tw-border-primary/20"
          >
            +{{ competition.racing_categories.length - 3 }}
          </span>
        </div>

        <div class="tw-flex-1" />

        <!-- Event dates: ALWAYS visible -->
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-pt-2">
          <div class="tw-flex tw-items-center tw-gap-3">
            <div class="tw-w-9 tw-h-9 tw-rounded tw-bg-blue-50 tw-flex tw-items-center tw-justify-center tw-text-blue-600  ">
              <i class="pi pi-calendar-plus tw-text-sm" />
            </div>
            <div>
              <div class="tw-text-[11px] tw-font-semibold tw-text-slate-500 tw-uppercase">
                {{ $t('Start Date') }}
              </div>
              <div class="tw-text-sm tw-font-bold tw-text-slate-900">
                {{ formatDate(competition.starts_on) }}
              </div>
            </div>
          </div>
          
          <div class="tw-flex tw-items-center tw-gap-3">
            <div class="tw-w-9 tw-h-9 tw-rounded tw-bg-violet-50 tw-flex tw-items-center tw-justify-center tw-text-violet-600  ">
              <i class="pi pi-calendar-minus tw-text-sm" />
            </div>
            <div>
              <div class="tw-text-[11px] tw-font-semibold tw-text-slate-500 tw-uppercase">
                {{ $t('End Date') }}
              </div>
              <div class="tw-text-sm tw-font-bold tw-text-slate-900">
                {{ formatDate(competition.ends_on) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Registration period (only if upcoming & dates exist) -->
        <div
          v-if="isUpcoming && (competition.registration_starts_on || competition.registration_ends_on)"
          class="tw-pt-3  tw-grid tw-grid-cols-2 tw-gap-4"
        >
          <div class="tw-flex tw-items-center tw-gap-3">
            <div class="tw-w-9 tw-h-9 tw-rounded tw-bg-emerald-50 tw-flex tw-items-center tw-justify-center tw-text-emerald-600  ">
              <i class="pi pi-arrow-right tw-text-sm" />
            </div>
            <div>
              <div class="tw-text-[11px] tw-font-semibold tw-text-emerald-600 tw-uppercase">
                {{ $t('Opens') }}
              </div>
              <div class="tw-text-sm tw-font-bold tw-text-emerald-900">
                {{ formatDate(competition.registration_starts_on) || '—' }}
              </div>
            </div>
          </div>
          
          <div class="tw-flex tw-items-center tw-gap-3">
            <div class="tw-w-9 tw-h-9 tw-rounded tw-bg-rose-50 tw-flex tw-items-center tw-justify-center tw-text-rose-600  ">
              <i class="pi pi-times tw-text-sm" />
            </div>
            <div>
              <div class="tw-text-[11px] tw-font-semibold tw-text-rose-600 tw-uppercase">
                {{ $t('Closes') }}
              </div>
              <div class="tw-text-sm tw-font-bold tw-text-rose-900">
                {{ formatDate(competition.registration_ends_on) || '—' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Finished indicator -->
        <div 
          v-if="isFinished && !hasApprovedResults" 
          class="tw-mt-2 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-semibold tw-text-slate-500"
        >
          <i class="pi pi-check-circle tw-text-base" />
          {{ $t('Event Completed') }}
        </div>

        <!-- CTA -->
        <div class="tw-pt-2">
          <span
            v-if="hasApprovedResults"
            class="cta-link tw-inline-flex tw-items-center tw-gap-2 tw-text-indigo-700 hover:tw-text-indigo-900 tw-font-semibold"
          >
            <i class="pi pi-chart-bar" />
            {{ $t('View Results') }}
            <i class="fas" :class="locale === 'en' ? 'fa-angle-right' : 'fa-angle-left'" />
          </span>
          <span
            v-else-if="normalizedStage === 'registration'"
            class="cta-link tw-inline-flex tw-items-center tw-gap-2 tw-text-emerald-700 hover:tw-text-emerald-900 tw-font-semibold"
          >
            <i class="pi pi-user-plus" />
            {{ $t('Register Now') }}
            <i class="fas" :class="locale === 'en' ? 'fa-angle-right' : 'fa-angle-left'" />
          </span>
          <span
            v-else
            class="cta-link tw-inline-flex tw-items-center tw-gap-2 tw-text-slate-700 hover:tw-text-slate-900 tw-font-semibold"
          >
            <i class="pi pi-info-circle" />
            {{ $t('View Details') }}
            <i class="fas" :class="locale === 'en' ? 'fa-angle-right' : 'fa-angle-left'" />
          </span>
        </div>
      </div>
    </article>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  competition: { 
    type: Object, 
    required: true, 
    validator: (v) => v.id && v.title 
  },
  viewRoute: { 
    type: String, 
    required: true 
  }
});

const { locale } = useI18n();
const WEBURL = import.meta.env.VITE_WEB_BASE_URL || '/';

function getImageUrl(link) {
  if (!link) return '';
  if (link.startsWith('http://') || link.startsWith('https://')) return link;
  const cleanLink = link.startsWith('/') ? link.slice(1) : link;
  const cleanBase = WEBURL.endsWith('/') ? WEBURL.slice(0, -1) : WEBURL;
  return `${cleanBase}/${cleanLink}`;
}

const normalizedStage = computed(() => {
  const raw = String(props.competition?.stage || '').trim().toLowerCase();
  if (raw.startsWith('result')) return 'results';
  if (raw.startsWith('registr')) return 'registration';
  return 'other';
});

const isUpcoming = computed(() => {
  const s = props.competition?.starts_on ? new Date(props.competition.starts_on) : null;
  return !!(s && s > new Date());
});

const isFinished = computed(() => {
  const e = props.competition?.ends_on ? new Date(props.competition.ends_on) : null;
  return !!(e && e < new Date());
});

const hasApprovedResults = computed(() => {
  const rs = String(props.competition?.results_status || '').trim().toLowerCase();
  return rs === 'approved' || rs === 'published';
});

const badgeLabel = computed(() => {
  if (hasApprovedResults.value) return 'Results';
  if (isFinished.value) return 'Finished';
  if (normalizedStage.value === 'registration') return 'Registration';
  return 'Upcoming';
});

const badgeIcon = computed(() => {
  if (hasApprovedResults.value) return 'pi pi-chart-bar';
  if (isFinished.value) return 'pi pi-check-circle';
  if (normalizedStage.value === 'registration') return 'pi pi-calendar-plus';
  return 'pi pi-calendar';
});

const accentClass = computed(() => {
  if (hasApprovedResults.value) return 'tw-border-l-4 tw-border-indigo-500';
  if (isFinished.value) return 'tw-border-l-4 tw-border-slate-400';
  if (normalizedStage.value === 'registration') return 'tw-border-l-4 tw-border-emerald-500';
  return 'tw-border-l-4 tw-border-blue-500';
});

const badgeClass = computed(() => {
  if (hasApprovedResults.value) return 'tw-bg-indigo-600 tw-text-white';
  if (isFinished.value) return 'tw-bg-slate-600 tw-text-white';
  if (normalizedStage.value === 'registration') return 'tw-bg-emerald-600 tw-text-white';
  return 'tw-bg-blue-600 tw-text-white';
});

const visibleCategories = computed(() => (props.competition?.racing_categories || []).slice(0, 3));

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(
      locale.value === 'ar' ? 'ar-EG' : 'en-EG',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  } catch { 
    return value; 
  }
}
</script>

<style scoped>
.competition-card { 
  transition: box-shadow .2s ease, transform .2s ease; 
}

.competition-card:hover { 
  transform: translateY(-2px); 
}

.tw-line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
</style>