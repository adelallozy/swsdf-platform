
# Entity Index Grid Kickoff

Last updated: 2026-05-13

Reference implementation for a filterable, localized card-grid index page. Adapt per entity type by changing the endpoint, card component, and field accessors.

---

## Component: EntityIndexGrid.vue

**Location:** `src/v3/pages/_kickoffs/EntityIndexGrid.vue`

### Features

* Locale-aware name search with debounce
* City and Status dropdowns (PrimeVue) with `showClear`
* Manual URL sync (query as source of truth) + watchers for back/forward
* Summary chips ("Showing …; Status …; City …; Name …")
* Reveal-on-scroll directive
* RTL alignment via `filterAlignClass`

### How to adapt

* Change `endpoint` to your entity API.
* Replace `<EntityCard>` with your domain card (e.g., `<DivingCenterCard>`).
* Adjust name/city/status/expiry field accessors in the helpers below.

---

## Key Code Patterns

### Imports

```js
import Breadcrumb from '@/v3/components/Layout/Breadcrumb.vue'
import PageHeading from '@/v3/components/Layout/PageHeading.vue'
import EntityCard from '@/v3/components/pieces/EntityCard.vue'
import { apiGet } from '@/v3/services/httpClient.js'
import { joinBase } from '@/v3/utils/url.js'
import { truncate } from '@/v3/utils/text.js'
```

### Filter State (URL-synced)

```js
const nameQuery = ref((route.query.name || '').toString())
const cityFilter = ref((route.query.city || '').toString() || null)
const statusFilter = ref(normalizeStatus(route.query.status))

// Debounce name input
let nameDebounce
function onNameInput() {
  clearTimeout(nameDebounce)
  nameDebounce = setTimeout(() => { nameQuery.value = nameInput.value }, 250)
}

// Sync state -> URL
watch([nameQuery, cityFilter, statusFilter, () => locale.value], syncQueryToUrl, { immediate: true })
```

### Localized Field Accessors

```js
function getDisplayName(row) {
  if (locale.value === 'ar') return row.name_ar || row.name || row.name_en || ''
  return row.name_en || row.name || row.name_ar || ''
}
function getCityForLocale(row) {
  return locale.value === 'ar'
    ? (row.city_name_ar || row.city_name || row.city_name_en || '')
    : (row.city_name_en || row.city_name || row.city_name_ar || '')
}
```

### Reveal-on-Scroll Directive

```js
const vReveal = {
  mounted(el) {
    el.classList.add('reveal-item')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add('is-visible')
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.12 })
    obs.observe(el)
    el._revealObs = obs
  },
  unmounted(el) {
    el._revealObs?.disconnect?.()
    delete el._revealObs
  }
}
```

---

## QA Checklist

* [ ] Header spacing `tw-pt-[110px]` is correct.
* [ ] Breadcrumb + PageHeading render; dynamic titles set via `usePageHeading`.
* [ ] Filters use pill style, `showClear`, and RTL alignment via `filterAlignClass`.
* [ ] URL reflects filters; back/forward repopulates controls.
* [ ] Debounce >= 200-250ms; no double fetches.
* [ ] Empty/error/loader states appear correctly.
* [ ] PrimeVue controls are consistent height (44px).
* [ ] No Arabic literals in code.
* [ ] Reveal observer disconnects on unmount.

* **EntityIndexGrid.vue**:

  * Added **locale-aware** name search with **debounce**.
  * Added **City** and **Status** dropdowns (PrimeVue) with `showClear`.
  * **Manual URL sync** (query as source of truth) + watchers for back/forward.
  * **Summary chips** (“Showing …; Status …; City …; Name …”).
  * **Reveal-on-scroll** directive (local, cleans up observers).
  * Pill height & radius normalized for PrimeVue controls (`:deep()` rules).
  * RTL alignment via `filterAlignClass`.
  * Sorting example: **valid first, then earliest expiry** (can be swapped out per module).
* **i18n keys**: added keys your component uses.
* **Style snippets**: global pill height + reveal animation added in the component’s `<style scoped>`.
* **Notes in comments** show where to plug module specifics (e.g., how to derive `status`/`expiry`/`city`).

Everything else (Entity View, Grouped Tables, base blocks, utils, services) remains compatible — only light polish where helpful.

---

# 1) Services & utils (unchanged API, small polish)

## `/src/v3/services/httpClient.js`

```js
import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  ERROR_TYPES,
} from '@/v3/services/httpClient.js';
```

Do not copy or reimplement the HTTP client in a feature. The canonical service
attaches the current Bearer JWT, sends locale and JSON headers, supports
`FormData`, and normalizes 401/409/422/HTTP errors. Every 401 is processed by
centralized `signOut('unauthorized')`; page catch blocks return silently and do
not show another toast or redirect. See
[HTTP Client Reference](../v3/reference/http-client.md).

## `/src/v3/utils/url.js`

```js
export function joinBase(base, path) {
  if (!path) return '';
  if (!base) return path;
  return `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}
```

## `/src/v3/utils/text.js`

```js
export function normalizeDigits(input = '') {
  return String(input).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}
export function truncate(str = '', max = 90) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
export function formatPhone10(s = '') {
  const digits = String(s || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 9 ? `0${digits}` : digits;
}
```

---

# 2) Base blocks (unchanged, ready)

`BaseSection.vue`, `BaseCard.vue`, `EmptyState.vue`, `ErrorState.vue`, `InlineSkeleton.vue`, and `EntityCard.vue` are unchanged from your working set; keep them as-is.

---

# 3) Entity View kickoff (kept; standard rules applied)

`/src/v3/pages/_kickoffs/EntityViewPage.vue`
*(Same as your first kickoff; uses `Breadcrumb`, `PageHeading`, `ProgressSpinner`, `Dialog`, `.image_bg` background; calls `usePageHeading().setHeading` after fetch; gallery and preview dialog included. No changes required for this merge.)*

---

# 4) Grouped Tables kickoff (kept; tokenized DataTable styles)

`/src/v3/pages/_kickoffs/EntityIndexGroupedTable.vue`
*(Same structure; includes token-friendly `:deep()` table polish, optional page background; aligns with Universal standards.)*

---

# 5) **UPDATED** Card Grid Index kickoff (now includes Centers Index features)

## `/src/v3/pages/_kickoffs/EntityIndexGrid.vue`

```vue
<template>
  <div class="tw-pt-[110px] tw-min-h-[300px] tw-bg-white tw-pb-24 image_bg">
    <div class="tw-container">
      <Breadcrumb />
      <PageHeading />

      <!-- FILTERS (no box/background/border) -->
      <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-3 tw-mb-5" :class="filterAlignClass">
        <!-- Name (locale-aware) -->
        <div class="tw-flex tw-flex-col">
          <label for="name" class="tw-text-[11px] tw-text-muted tw-mb-1">{{ $t('Center name') }}</label>
          <div class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              id="name"
              v-model.trim="nameInput"
              :placeholder="$t('Search by name...')"
              class="tw-rounded-full tw-h-11 tw-w-[240px] md:tw-w-[320px]"
              @input="onNameInput"
            />
          </div>
        </div>

        <!-- City select (localized options built from items) -->
        <div class="tw-flex tw-flex-col">
          <label class="tw-text-[11px] tw-text-muted tw-mb-1">{{ $t('City') }}</label>
          <Dropdown
            v-model="cityFilter"
            :options="cityOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('Select city')"
            showClear
            class="tw-rounded-full tw-h-11 tw-min-w-[200px]"
            panelClass="tw-rounded-xl"
          />
        </div>

        <!-- Status select (valid/invalid buckets example; adjust per module) -->
        <div class="tw-flex tw-flex-col">
          <label class="tw-text-[11px] tw-text-muted tw-mb-1">{{ $t('Status') }}</label>
          <Dropdown
            v-model="statusFilter"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('Select status')"
            showClear
            class="tw-rounded-full tw-h-11 tw-min-w-[180px]"
            panelClass="tw-rounded-xl"
          />
        </div>

        <!-- Clear -->
        <Button type="button" text class="tw-h-11 tw-rounded-full" @click="clearFilters">
          <i class="pi pi-filter-slash tw-mx-2" />
          {{ $t('Clear filters') }}
        </Button>
      </div>

      <!-- Tiny summary -->
      <div v-if="!loading" class="tw-text-sm tw-text-muted tw-mb-5">
        {{ $t('Showing') }} {{ filteredAndSorted.length }} {{ $t('centers') }}
        <span v-if="statusFilter">• {{ $t('Status') }}: {{ statusFilterLabel }}</span>
        <span v-if="cityFilter">• {{ $t('City') }}: {{ cityLabel }}</span>
        <span v-if="nameQuery">• {{ $t('Name') }}: “{{ nameQuery }}”</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="tw-flex tw-justify-center tw-items-center tw-py-16">
        <ProgressSpinner strokeWidth="4" />
      </div>

      <!-- Grid (max 3 cols) -->
      <div v-else class="tw-grid tw-gap-4 md:tw-grid-cols-2 xl:tw-grid-cols-3">
        <!-- For Diving Centers, swap EntityCard with your <DivingCenterCard :divingCenter="it" /> -->
        <div v-for="it in filteredAndSorted" :key="it.id" v-reveal class="reveal-item">
          <EntityCard
            :title="localize(it,'name')"
            :subtitle="truncate(it.description, 120)"
            :thumb="it.thumbnail ? joinBase(WEBURL, it.thumbnail) : ''"
            @click="$router.push({ name: viewRoute, params: { id: it.id, slug: it.slug } })"
          >
            <template #badge>
              <span v-if="it.badge" class="tw-text-[11px] tw-font-semibold tw-px-2 tw-py-1 tw-rounded-full tw-bg-slate-50 tw-border tw-border-divider">
                {{ it.badge }}
              </span>
            </template>
            <template #chips>
              <span v-for="tag in (it.tags || [])" :key="tag" class="tw-text-xs tw-px-2 tw-py-1 tw-rounded-full tw-bg-slate-50 tw-border tw-border-divider">
                {{ tag }}
              </span>
            </template>
          </EntityCard>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!loading && filteredAndSorted.length === 0" class="tw-text-center tw-text-muted tw-py-16">
        {{ $t('No centers found') }}
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Drop-in grid kickoff — now includes:
 * - Locale-aware search with debounce
 * - City & Status filters (PrimeVue) with showClear
 * - Manual URL sync (query is source of truth)
 * - Summary chips
 * - Reveal-on-scroll directive (cleans up)
 * - RTL alignment via filterAlignClass
 *
 * To adapt to another entity type:
 * - Replace endpoint
 * - Map localized name/city/status/expiry in the helpers below
 * - Optionally replace EntityCard with your domain card
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/v3/components/Layout/Breadcrumb.vue'
import PageHeading from '@/v3/components/Layout/PageHeading.vue'
import ProgressSpinner from 'primevue/progressspinner'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import EntityCard from '@/v3/components/pieces/EntityCard.vue'
import { apiGet } from '@/v3/services/httpClient.js'
import { joinBase } from '@/v3/utils/url.js'
import { truncate } from '@/v3/utils/text.js'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()

// ENV endpoint — change per module
const endpoint = import.meta.env.VITE_DIVING_CENTERS_INDEX || '/entities'

// For assets joining (thumbnails, etc.)
const WEBURL = import.meta.env.VITE_WEB_BASE_URL || '/'

// Route name for detail navigation (adjust per module)
const viewRoute = 'entity-view'

// Data
const loading = ref(true)
const items = ref([])

// URL-synced state
const nameQuery = ref((route.query.name || '').toString())
const cityFilter = ref((route.query.city || '').toString() || null)
const statusFilter = ref(normalizeStatus(route.query.status))

// Local input (debounced -> nameQuery)
const nameInput = ref(nameQuery.value)

// Align: left in Arabic, right in English
const filterAlignClass = computed(() => (locale.value === 'ar' ? 'tw-justify-start' : 'tw-justify-end'))

// Status options (bucket example; adjust labels or buckets per module)
const statusOptions = [
  { label: t('Valid'), value: 'valid' },
  { label: t('Invalid'), value: 'invalid' },
]
const statusFilterLabel = computed(() => statusOptions.find(o => o.value === statusFilter.value)?.label || '')

// --- Helpers you should tailor per entity type ---

function normalizeStatus(s) {
  const v = (s || '').toString().trim().toLowerCase()
  if (v === 'valid') return 'valid'
  if (v === 'invalid') return 'invalid'
  return null
}

// Convert row status -> bucket (e.g., treat expired/pending as invalid)
function rowStatusBucket(row) {
  const raw = (row.membership_status || row.status || '').toString().toLowerCase()
  return raw === 'valid' ? 'valid' : 'invalid'
}

// Parse expiry for stable sorting (earliest first)
function parseExpiry(dateStr) {
  if (!dateStr) return new Date('9999-12-31')
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date('9999-12-31') : d
}

// Localized name/city accessors (override per module if your field names differ)
function getDisplayName(row) {
  if (locale.value === 'ar') return row.name_ar || row.name || row.name_en || ''
  return row.name_en || row.name || row.name_ar || ''
}
function getCityForLocale(row) {
  return locale.value === 'ar'
    ? (row.city_name_ar || row.city_name || row.city_name_en || '')
    : (row.city_name_en || row.city_name || row.city_name_ar || '')
}

// City options (unique, localized, from loaded items)
const cityOptions = computed(() => {
  const set = new Set()
  items.value.forEach(r => {
    const c = getCityForLocale(r)
    if (c) set.add(c)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ label: v, value: v }))
})
const cityLabel = computed(() => cityOptions.value.find(o => o.value === cityFilter.value)?.label || '')

// Filter + sort: valid first, then by earliest expiry
const filteredAndSorted = computed(() => {
  const nameQ = nameQuery.value.trim().toLowerCase()
  const cityQ = (cityFilter.value || '').toString()
  const stQ = statusFilter.value

  return items.value
    .map(r => ({
      ...r,
      _status: rowStatusBucket(r),
      _expiry: parseExpiry(r.membership_expiry || r.expiry_on || r.expires_on),
      _name: getDisplayName(r).toLowerCase(),
      _city: getCityForLocale(r),
    }))
    .filter(r => {
      if (stQ && r._status !== stQ) return false
      if (cityQ && r._city !== cityQ) return false
      if (nameQ && !r._name.includes(nameQ)) return false
      return true
    })
    .sort((a, b) => {
      if (a._status !== b._status) return a._status === 'valid' ? -1 : 1
      return a._expiry - b._expiry
    })
})

// Load data
async function loadData() {
  loading.value = true
  try {
    const res = await apiGet(endpoint)
    // Accept either flat array or { data: { ... } } shapes and the “diveCenters” alias
    items.value = res?.items || res?.diveCenters || res?.data?.items || res?.data?.diveCenters || []
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

// Debounce name input
let nameDebounce
function onNameInput() {
  clearTimeout(nameDebounce)
  nameDebounce = setTimeout(() => { nameQuery.value = nameInput.value }, 250)
}

// Sync state -> URL (manual, explicit)
function syncQueryToUrl() {
  const q = {
    ...(nameQuery.value ? { name: nameQuery.value } : {}),
    ...(cityFilter.value ? { city: cityFilter.value } : {}),
    ...(statusFilter.value ? { status: statusFilter.value } : {}),
  }
  router.replace({ query: q }).catch(() => {})
}
watch([nameQuery, cityFilter, statusFilter, () => locale.value], syncQueryToUrl, { immediate: true })

// Keep in sync with browser nav
watch(
  () => route.query,
  (q) => {
    const nextName = (q.name || '').toString()
    const nextCity = (q.city || '').toString() || null
    const nextStatus = normalizeStatus(q.status)

    if (nextName !== nameQuery.value) {
      nameQuery.value = nextName
      nameInput.value = nextName
    }
    if (nextCity !== cityFilter.value) {
      cityFilter.value = nextCity
    }
    if (nextStatus !== statusFilter.value) {
      statusFilter.value = nextStatus
    }
  }
)

// Clear
function clearFilters() {
  nameInput.value = ''
  nameQuery.value = ''
  cityFilter.value = null
  statusFilter.value = null
  syncQueryToUrl()
}

// Reveal-on-scroll directive (local)
const vReveal = {
  mounted(el) {
    el.classList.add('reveal-item')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add('is-visible')
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.12 })
    obs.observe(el)
    el._revealObs = obs
  },
  unmounted(el) {
    el._revealObs?.disconnect?.()
    delete el._revealObs
  }
}

onMounted(loadData)
</script>

<style scoped>
/* Reveal animation */
.reveal-item { opacity: 0; transform: translateY(14px); transition: opacity 420ms ease, transform 420ms ease; }
.reveal-item.is-visible { opacity: 1; transform: none; }

/* PrimeVue controls as pills & consistent height (44px = tw-h-11) */
:deep(.p-inputtext),
:deep(.p-dropdown) { border-radius: 9999px; }
:deep(.p-dropdown) { height: 2.75rem; display: inline-flex; align-items: center; }
:deep(.p-dropdown .p-inputtext) { height: 2.75rem; }
:deep(.p-inputtext) { height: 2.75rem; }

/* Optional ambient background */
.image_bg::before{
  content:''; position:fixed; inset:0;
  background:url("@/v3/assets/images/dive-site-bg-2025-08-27.webp") center/cover fixed no-repeat;
  opacity:.3; z-index:0;
}
</style>
```

### How to adapt this grid to **Diving Centers**

* Keep `endpoint = VITE_DIVING_CENTERS_INDEX`.
* Replace `<EntityCard>` with your `<DivingCenterCard :divingCenter="it" />`.
* The name/city/status/expiry helpers already point to `membership_status`, `membership_expiry`, and `city_name_[ar|en]`. Adjust if your API differs.

---

# 6) QA checklist (baked-in from Universal)

* [ ] Header spacing `tw-pt-[110px]` is correct.
* [ ] Breadcrumb + PageHeading render; dynamic titles set on view pages via `usePageHeading`.
* [ ] Filters use pill style, `showClear`, and RTL alignment via `filterAlignClass`.
* [ ] URL reflects filters; back/forward repopulates controls.
* [ ] Debounce ≥ 200–250ms; no double fetches.
* [ ] Empty/error/loader states appear correctly.
* [ ] PrimeVue controls are consistent height (44px).
* [ ] No Arabic literals in code.
* [ ] Images use `loading="lazy"`; large media avoided in lists.
* [ ] Reveal observer disconnects on unmount.
