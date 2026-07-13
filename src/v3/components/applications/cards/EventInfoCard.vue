<!-- VERSION: 2.1.0 -->
<!-- FILE: src/v3/components/applications/cards/EventInfoCard.vue -->
<!-- Self-contained card that reads from centralized store -->

<template>
  <div v-if="event">
    <!-- Heading (outside the card, bold) -->
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2 tw-text-slate-800 tw-text-xl tw-font-bold">
      <i class="pi pi-trophy" aria-hidden="true" />
      <span>{{ $t('Competition') }}</span>
    </div>
    
    <!-- Card -->
    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <!-- Competition Title -->
        <div v-if="title">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Competition') }}</div>
          <div class="tw-font-medium">{{ title }}</div>
        </div>

        <!-- Competition Dates -->
        <div v-if="event.starts_at || event.starts_on || event.ends_at || event.ends_on">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Competition Dates') }}</div>
          <div class="tw-font-medium">
            <span v-if="event.starts_at || event.starts_on">
              {{ toYmd(event.starts_at || event.starts_on) }}
            </span>
            <span v-if="(event.starts_at || event.starts_on) && (event.ends_at || event.ends_on)"> — </span>
            <span v-if="event.ends_at || event.ends_on">
              {{ toYmd(event.ends_at || event.ends_on) }}
            </span>
          </div>
        </div>

        <!-- Registration Window -->
        <div v-if="event.registration_starts_on || event.registration_ends_on">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Registration Window') }}</div>
          <div class="tw-font-medium">
            <span v-if="event.registration_starts_on">
              {{ toYmd(event.registration_starts_on) }}
            </span>
            <span v-if="event.registration_starts_on && event.registration_ends_on"> — </span>
            <span v-if="event.registration_ends_on">
              {{ toYmd(event.registration_ends_on) }}
            </span>
          </div>
        </div>

        <!-- Sport -->
        <div v-if="event.sport">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Sport') }}</div>
          <div class="tw-font-medium">{{ $t(event.sport) }}</div>
        </div>

        <!-- Location (City / Region) -->
        <div v-if="locationText">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Location') }}</div>
          <div class="tw-font-medium">{{ locationText }}</div>
        </div>

        <!-- Venue -->
        <div v-if="venue">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Venue') }}</div>
          <div class="tw-font-medium">{{ venue }}</div>
        </div>

        <!-- Racing Categories (pills) -->
        <div v-if="categories.length" class="sm:tw-col-span-2 lg:tw-col-span-3">
          <div class="tw-text-sm tw-text-slate-500">{{ $t('Racing Categories') }}</div>
          <ul class="tw-mt-1 tw-flex tw-flex-wrap tw-gap-2">
            <li
              v-for="(c, idx) in categories"
              :key="idx"
              class="tw-inline-flex tw-items-center tw-rounded-full tw-bg-slate-100 tw-text-slate-700 tw-px-3 tw-py-1 tw-text-xs"
            >
              {{ c }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="isLoadingKey('event')">
    <div class="tw-mb-2 tw-flex tw-items-center tw-gap-2 tw-text-slate-800 tw-text-xl tw-font-bold">
      <i class="pi pi-trophy" aria-hidden="true" />
      <span>{{ $t('Competition') }}</span>
    </div>
    <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm tw-p-5">
      <div class="tw-flex tw-justify-center tw-py-8">
        <i class="pi pi-spinner tw-animate-spin tw-text-2xl tw-text-slate-400" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useApplicationStore } from '@/v3/composables/application/useApplicationStore.js';
import { useLoading } from '@/v3/composables/useLoading.js';
import { toYmd } from '@/v3/utils/dates.js';

// ────────────────────────────────────────────────────────────────────────────
// NO PROPS - Everything from store
// ────────────────────────────────────────────────────────────────────────────

const store = useApplicationStore();
const { isLoadingKey } = useLoading();

// ────────────────────────────────────────────────────────────────────────────
// DATA FROM STORE
// ────────────────────────────────────────────────────────────────────────────

const event = computed(() => store.payload.event.value);

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

function firstNonEmpty(...vals) {
  return vals.find(v => !!(typeof v === 'string' ? v.trim() : v)) || '';
}

function cleanArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(v => String(v || '').trim()).filter(Boolean);
}

function unique(arr) {
  const set = new Set();
  arr.forEach(v => { if (v) set.add(v); });
  return Array.from(set);
}

// ────────────────────────────────────────────────────────────────────────────
// COMPUTED PROPERTIES
// ────────────────────────────────────────────────────────────────────────────

const title = computed(() => {
  if (!event.value) return '';
  return firstNonEmpty(event.value.title, event.value.title_en, event.value.title_ar);
});

const locationText = computed(() => {
  if (!event.value) return '';
  const city = (event.value.city_name || '').trim();
  const region = (event.value.region_name || '').trim();
  return [city, region].filter(Boolean).join(' — ');
});

const venue = computed(() => {
  if (!event.value) return '';
  return (event.value.venue || '').trim();
});

const categories = computed(() => {
  if (!event.value) return [];
  const rawCats = cleanArray(event.value.racing_categories || event.value.races);
  return unique(rawCats);
});
</script>

<!--
VERSION: 2.1.0

CHANGES IN v2.1.0:
==================
- Removed event prop (now reads from store.payload.event)
- Changed to computed properties instead of plain vars
- Added loading state
- Added imports for store and loading
- Component is now completely self-contained (zero props)

ARCHITECTURE NOTES:
===================
- NO PROPS - Everything from store
- Reads from: store.payload.event
- This is a display-only card (no validation)
- Loading key: 'event' (managed by store)

LOADING KEYS:
=============
- event (managed by store via loadEntity)

USAGE:
======
<EventInfoCard />

No props needed! Component gets everything from store.
-->