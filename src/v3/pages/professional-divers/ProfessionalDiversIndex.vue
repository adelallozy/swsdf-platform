<!-- src/v3/pages/professionals/ProfessionalDiversIndex.vue -->
<template>
  <div class="apps-card">
    <!-- Header -->
    <div class="apps-card__header tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4">
      <div class="tw-flex tw-flex-col">
        <h3 class="tw-text-lg tw-font-semibold">
          {{ $t('Professional Divers') }}
        </h3>
        <div class="tw-mt-2 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
          <!-- Total count -->
          <span v-if="total>0" class="tw-inline-block tw-rounded-full tw-bg-emerald-100 tw-text-emerald-800 dark:tw-bg-emerald-900/40 dark:tw-text-emerald-300 tw-text-xs tw-font-semibold tw-px-3 tw-py-1">
            {{ total }} {{ $t('Professional') }}
          </span>
          <!-- Active filter chips -->
          <template v-for="chip in activeChips" :key="chip.key">
            <span class="tw-inline-block tw-rounded-full tw-bg-sky-100 tw-text-sky-800 dark:tw-bg-sky-900/40 dark:tw-text-sky-300 tw-text-xs tw-font-semibold tw-px-3 tw-py-1">
              {{ $t(chip.label) }}: {{ chip.valueLabel }}
            </span>
          </template>
        </div>
      </div>

      <!-- Tools: Search + Filters -->
      <div class="tw-flex tw-items-center tw-gap-2">
        <!-- Search input -->
        <input
          type="text"
          v-model="local.search"
          class="tw-h-9 tw-w-56 tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-3 tw-text-sm tw-outline-none"
          :placeholder="$t('Search')"
          @keyup.enter="applySearch"
        />
        <!-- search_by -->
        <select
          v-model="local.search_by"
          class="tw-h-9 tw-w-40 tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-2 tw-text-sm"
        >
          <option value="name">{{ $t('Name') }}</option>
          <option value="identity">{{ $t('Identity Number') }}</option>
          <option value="license">{{ $t('License Number') }}</option>
          <option value="membership">{{ $t('Membership Number') }}</option>
        </select>
        <button class="tw-h-9 tw-rounded-md tw-bg-primary-600 tw-px-3 tw-text-sm tw-text-white" @click="applySearch">
          {{ $t('Search') }}
        </button>

        <!-- Divider -->
        <div class="tw-w-px tw-h-6 tw-bg-slate-300 dark:tw-bg-slate-700 tw-mx-1"></div>

        <!-- Filters Popover trigger -->
        <button class="tw-h-9 tw-rounded-md tw-border tw-border-sky-300 dark:tw-border-sky-700 tw-px-3 tw-text-sm"
                @click="toggleFilters">
          {{ $t('Filter') }}
        </button>

        <!-- Clear / Reset -->
        <button class="tw-h-9 tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-px-3 tw-text-sm"
                @click="clearFilters">
          {{ $t('Reset') }}
        </button>

        <!-- Popover -->
        <Popover ref="filtersPopover" class="tw-min-w-[280px] tw-max-w-[92vw]">
          <div class="tw-p-4 tw-space-y-3">
            <div class="tw-text-sm tw-font-semibold">{{ $t('Filter Options') }}</div>
            <!-- Rank -->
            <div>
              <label class="tw-text-sm tw-font-medium">{{ $t('Level') }}</label>
              <select v-model="local.rank"
                      class="tw-mt-1 tw-w-full tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-2 tw-py-1 tw-text-sm">
                <option value="">{{ $t('All') }}</option>
                <option value="Dive Master">{{ $t('Divemaster') }}</option>
                <option value="Assistant Instructor">{{ $t('Assistant Instructor') }}</option>
                <option value="Instructor">{{ $t('Instructor') }}</option>
                <option value="Instructor Trainer">{{ $t('Instructor Trainer') }}</option>
                <option value="Course Director">{{ $t('Course Director') }}</option>
              </select>
            </div>
            <!-- Status -->
            <div>
              <label class="tw-text-sm tw-font-medium">{{ $t('Status') }}</label>
              <select v-model="local.status"
                      class="tw-mt-1 tw-w-full tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-2 tw-py-1 tw-text-sm">
                <option value="">{{ $t('All') }}</option>
                <option value="Valid">{{ $t('Valid') }}</option>
                <option value="Expired">{{ $t('Expired') }}</option>
                <option value="Suspended">{{ $t('Suspended') }}</option>
                <option value="Temporarily Suspended">{{ $t('Temporarily Suspended') }}</option>
                <option value="UNKNOWN">{{ $t('UNKNOWN') }}</option>
              </select>
            </div>
            <!-- Gender -->
            <div>
              <label class="tw-text-sm tw-font-medium">{{ $t('Gender') }}</label>
              <select v-model="local.gender"
                      class="tw-mt-1 tw-w-full tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-2 tw-py-1 tw-text-sm">
                <option value="">{{ $t('All') }}</option>
                <option value="Male">{{ $t('Male') }}</option>
                <option value="Female">{{ $t('Female') }}</option>
              </select>
            </div>
            <!-- Region -->
            <div v-if="regions.length">
              <label class="tw-text-sm tw-font-medium">{{ $t('Region') }}</label>
              <select v-model="local.region_id"
                      class="tw-mt-1 tw-w-full tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-2 tw-py-1 tw-text-sm">
                <option value="">{{ $t('All') }}</option>
                <option v-for="r in regions" :key="r.id" :value="String(r.id)">{{ r.name }}</option>
              </select>
            </div>
            <!-- City -->
            <div v-if="cities.length">
              <label class="tw-text-sm tw-font-medium">{{ $t('City') }}</label>
              <select v-model="local.city_id"
                      class="tw-mt-1 tw-w-full tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white dark:tw-bg-slate-900 tw-px-2 tw-py-1 tw-text-sm">
                <option value="">{{ $t('All') }}</option>
                <option v-for="c in narrowedCities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
              </select>
            </div>

            <div class="tw-pt-2 tw-flex tw-justify-end tw-gap-2">
              <button class="tw-h-9 tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-px-3 tw-text-sm"
                      @click="onFiltersReset">
                {{ $t('Reset') }}
              </button>
              <button class="tw-h-9 tw-rounded-md tw-bg-primary-600 tw-px-3 tw-text-sm tw-text-white"
                      @click="applyFilters">
                {{ $t('Apply') }}
              </button>
            </div>
          </div>
        </Popover>
      </div>
    </div>

    <!-- Table -->
    <div class="apps-table tw-px-5 tw-py-4">
      <DataTable
        :value="rows"
        dataKey="id"
        :loading="isLoading"
        :lazy="true"
        :totalRecords="total"
        :rowHover="true"
        :stripedRows="true"
        sortMode="single"
        :sortField="uiSortField"
        :sortOrder="sortDir === 'asc' ? 1 : -1"
        @sort="onSort"
        class="p-datatable-modern tw-w-full p-striped"
        :emptyMessage="$t('No data found')"
      >
        <Column field="id" header="License #" sortable></Column>
        <Column field="identity_number" :header="$t('ID Number')" sortable></Column>
        <Column :field="nameSortKey" :header="$t('Name')" sortable>
          <template #body="{ data }">
            {{ displayName(data) }}
          </template>
        </Column>
        <Column field="rank" :header="$t('Level')" sortable>
          <template #body="{ data }">
            <span v-if="data.rank">{{ $t(data.rank) }}</span>
          </template>
        </Column>
        <Column field="gender" :header="$t('Gender')" sortable>
          <template #body="{ data }">
            <span v-if="data.gender">{{ $t(data.gender) }}</span>
          </template>
        </Column>
        <Column field="nationality" :header="$t('Nationality')" sortable></Column>
        <Column field="mobile" :header="$t('Mobile')"></Column>
        <Column :field="citySortKey" :header="$t('City')" sortable>
          <template #body="{ data }">
            {{ displayCity(data) }}
          </template>
        </Column>
        <Column field="expiry_on" :header="$t('Expiry On')" sortable>
          <template #body="{ data }">
            <span :class="expiryBadgeClass(data.status)" class="tw-inline-block tw-rounded-full tw-px-2 tw-py-1 tw-text-xs tw-font-semibold">
              {{ toDateOnly(data.expiry_on) }}
            </span>
          </template>
        </Column>
        <Column field="status" :header="$t('Status')" sortable>
          <template #body="{ data }">
            <span :class="statusBadgeClass(data.status)" class="tw-inline-block tw-rounded-full tw-px-2 tw-py-1 tw-text-xs tw-font-semibold">
              {{ $t(data.status || '') }}
            </span>
          </template>
        </Column>
        <Column :header="$t('View')">
          <template #body="{ data }">
            <RouterLink
              class="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-w-8 tw-h-8"
              :to="{ name:'professional-divers-review', params:{ id: data.id } }"
              aria-label="View"
            >
              ➜
            </RouterLink>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Footer / Paginator -->
    <div class="apps-card__footer tw-px-5 tw-py-3">
      <Paginator
        v-if="pageCount>1"
        :rows="perPage"
        :first="(page-1)*perPage"
        :totalRecords="total"
        :rowsPerPageOptions="[10,20,50,100]"
        @page="onPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator from 'primevue/paginator'
import Popover from 'primevue/popover'

import { apiGet } from '@/v3/services/httpClient.js'
import { useErrorHandler } from '@/v3/composables/useErrorHandler.js'
import { useNotification } from '@/v3/composables/useNotification.js'

const route = useRoute()
const router = useRouter()
const { capture } = useErrorHandler()
const { error: notifyError } = useNotification()
const ENDPOINT = import.meta.env.VITE_PROFESSIONAL_DIVERS_INDEX

// canonical route state
const page    = computed(()=> Math.max(1, parseInt(route.query?.page, 10) || 1))
const perPage = computed(()=> Math.max(1, parseInt(route.query?.per_page, 10) || 20))
const sortBy  = computed(()=> String(route.query?.sort_by || 'id'))
const sortDir = computed(()=> (String(route.query?.sort_dir || 'desc') === 'asc' ? 'asc' : 'desc'))

// locale-aware sort fields
const isAr = computed(()=> String($i18n?.locale || 'ar').toLowerCase().startsWith('ar'))
const nameSortKey = computed(()=> isAr.value ? 'name_ar' : 'name_en')
const citySortKey = computed(()=> isAr.value ? 'city_name_ar' : 'city_name_en')
const uiSortField = computed(()=> {
  // map UI "Name" column to name_ar/en, "City" to city_ar/en, otherwise passthrough
  if (sortBy.value === 'name' || sortBy.value === 'name_ar' || sortBy.value === 'name_en') return nameSortKey.value
  if (sortBy.value === 'city' || sortBy.value === 'city_name_ar' || sortBy.value === 'city_name_en') return citySortKey.value
  return sortBy.value
})

// local form (mirrors route.query)
const local = reactive({
  search: String(route.query?.search || ''),
  search_by: String(route.query?.search_by || 'name'),
  rank: String(route.query?.rank || ''),
  status: String(route.query?.status || ''),
  gender: String(route.query?.gender || ''),
  region_id: String(route.query?.region_id || ''),
  city_id: String(route.query?.city_id || ''),
})

// data
const rows = ref([])
const total = ref(0)
const pageCount = ref(1)
const regions = ref([]) // [{id,name}]
const cities = ref([])  // [{id,region_id,name}]
const isLoading = ref(false)
let aborter = null
onBeforeUnmount(()=> aborter?.abort?.())

// popover
const filtersPopover = ref()
function toggleFilters(e){ filtersPopover.value?.toggle(e) }
function onFiltersReset(){
  local.rank=''; local.status=''; local.gender=''; local.region_id=''; local.city_id=''
}
function applyFilters(){
  updateRoute({
    rank: local.rank || null,
    status: local.status || null,
    gender: local.gender || null,
    region_id: local.region_id || null,
    city_id: local.city_id || null,
  }, { resetPage: true })
  nextTick(()=> filtersPopover.value?.hide())
}
function clearFilters(){
  onFiltersReset()
  local.search = ''
  local.search_by = 'name'
  updateRoute({
    search: null, search_by: 'name',
    rank: null, status: null, gender: null, region_id: null, city_id: null,
  }, { resetPage: true })
}

// chips (human labels)
const activeChips = computed(()=>{
  const q = route.query || {}
  const labelMap = {
    search: 'Search',
    search_by: 'Search by',
    rank: 'Level',
    status: 'Status',
    gender: 'Gender',
    region_id: 'Region',
    city_id: 'City'
  }
  const valueMap = {
    search_by: (v)=> ({name:$t('Name'),identity:$t('Identity Number'),license:$t('License Number'),membership:$t('Membership Number')}[String(v)] || String(v)),
    rank: (v)=> $t(v),
    status: (v)=> $t(v),
    gender: (v)=> $t(v),
    region_id: (v)=> regions.value.find(r=> String(r.id)===String(v))?.name || String(v),
    city_id: (v)=> cities.value.find(c=> String(c.id)===String(v))?.name || String(v),
    default: (v)=> String(v)
  }
  const keys = ['search','search_by','rank','status','gender','region_id','city_id']
  return keys
    .filter(k => q[k]!=null && String(q[k]).trim()!=='')
    .map(k => ({
      key: k,
      label: labelMap[k] || k,
      valueLabel: (valueMap[k]||valueMap.default)(q[k])
    }))
})

// city narrowing by selected region
const narrowedCities = computed(()=>{
  if (!local.region_id) return cities.value
  return cities.value.filter(c => String(c.region_id) === String(local.region_id))
})

// helpers
function toDateOnly(v){
  if(!v) return ''
  const s=String(v)
  const m=s.match(/\b\d{4}-\d{2}-\d{2}\b/); if(m) return m[0]
  if(s.includes('T')) return s.split('T')[0]
  const d=new Date(s); if(isNaN(d)) return s
  const mm=String(d.getMonth()+1).padStart(2,'0')
  const dd=String(d.getDate()).padStart(2,'0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
function displayName(r){
  if (isAr.value) return r.name_ar || r.name || r.name_en || ''
  return r.name_en || r.name || r.name_ar || ''
}
function displayCity(r){
  if (isAr.value) return r.city_name_ar || r.city_name || ''
  return r.city_name_en || r.city_name || ''
}
function statusBadgeClass(status){
  const s=String(status||'').toLowerCase()
  if (s==='valid') return 'tw-bg-emerald-100 tw-text-emerald-800 dark:tw-bg-emerald-900/40 dark:tw-text-emerald-300'
  if (s==='expired') return 'tw-bg-rose-100 tw-text-rose-800 dark:tw-bg-rose-900/40 dark:tw-text-rose-300'
  if (s==='suspended' || s==='temporarily suspended' || s==='unknown') return 'tw-bg-amber-100 tw-text-amber-800 dark:tw-bg-amber-900/40 dark:tw-text-amber-300'
  return 'tw-bg-slate-100 tw-text-slate-700 dark:tw-bg-slate-800/60 dark:tw-text-slate-300'
}
function expiryBadgeClass(status){
  return statusBadgeClass(status)
}

// query + routing
function cleanQuery(obj){
  const out={}
  for (const [k,v] of Object.entries(obj||{})){
    if (v==null) continue
    const s=String(v).trim()
    if (!s || s==='null' || s==='undefined') continue
    out[k]=s
  }
  return out
}
function buildFetchQuery(){
  const q = cleanQuery(route.query||{})
  return cleanQuery({
    page: q.page || 1,
    per_page: q.per_page || 20,
    sort_by: q.sort_by || 'id',
    sort_dir: q.sort_dir || 'desc',
    search: q.search,
    search_by: q.search_by || 'name',
    rank: q.rank,
    status: q.status,
    gender: q.gender,
    region_id: q.region_id,
    city_id: q.city_id
  })
}
function updateRoute(next, { resetPage=false }={}){
  const merged = { ...cleanQuery(route.query||{}), ...next }
  if (resetPage) merged.page = 1
  const cleaned = cleanQuery(merged)
  cleaned.sort_by  = cleaned.sort_by  || sortBy.value
  cleaned.sort_dir = cleaned.sort_dir || sortDir.value
  cleaned.per_page = cleaned.per_page || perPage.value
  cleaned.page     = cleaned.page     || page.value
  router.replace({ params:{...route.params}, query: cleaned })
}

// actions
function applySearch(){
  updateRoute({ search: local.search || null, search_by: local.search_by || 'name' }, { resetPage: true })
}
function onSort(e){
  // map UI fields to server sort_by
  let field = e.sortField
  if (field === nameSortKey.value) field = field // already ar/en key
  if (field === citySortKey.value) field = field
  updateRoute({ sort_by: field, sort_dir: e.sortOrder===1 ? 'asc' : 'desc' }, { resetPage:true })
}
function onPage(e){
  updateRoute({ per_page: Math.max(1, Number(e.rows)||10), page: e.page+1 })
}

// fetch
async function fetchRows(){
  if (!ENDPOINT) return
  aborter?.abort?.()
  aborter = new AbortController()
  isLoading.value = true
  try{
    const qp = new URLSearchParams(buildFetchQuery()).toString()
    const data = await apiGet(`${ENDPOINT}?${qp}`, { signal: aborter.signal })

    const list = Array.isArray(data?.professionalDivers) ? data.professionalDivers
                : Array.isArray(data) ? data : []
    rows.value = list

    // options: try filteringOptions if provided, else derive from rows
    if (Array.isArray(data?.filteringOptions?.regions)) {
      regions.value = data.filteringOptions.regions.map(r => ({ id: r.id, name: r.name_ar || r.name_en || r.name }))
    } else {
      // derive from rows
      const m = new Map()
      for (const r of list){
        const id = r.region_id
        if (!id) continue
        const name = isAr.value ? (r.region_name_ar || r.region_name) : (r.region_name_en || r.region_name)
        if (!m.has(id)) m.set(id, { id, name: name || String(id) })
      }
      regions.value = Array.from(m.values())
    }
    if (Array.isArray(data?.filteringOptions?.cities)) {
      cities.value = data.filteringOptions.cities.map(c => ({ id: c.id, region_id: c.region_id, name: c.name_ar || c.name_en || c.name }))
    } else {
      const m = new Map()
      for (const r of list){
        const id = r.city_id
        if (!id) continue
        const name = isAr.value ? (r.city_name_ar || r.city_name) : (r.city_name_en || r.city_name)
        if (!m.has(id)) m.set(id, { id, region_id: r.region_id, name: name || String(id) })
      }
      cities.value = Array.from(m.values())
    }

    // paginator
    const p = data?.paginator || {}
    const limitFromPaginate = Number(data?.paginate?.limit || 0)
    total.value     = Number(p.count ?? list.length ?? 0)
    const rowsPer   = Number(p.perPage || limitFromPaginate || perPage.value)
    pageCount.value = Number(p.pageCount ?? Math.max(1, Math.ceil(total.value / rowsPer)))
  }catch(err){
    if (err?.name==='AbortError') return
    capture(err, { fallback:'Failed to load professional divers', context:'ProfessionalDiversIndex.fetch', meta:{ routeQuery: route.query } })
    notifyError('Failed to load professional divers.', { summary:'Load Failure', life:3000 })
  }finally{
    isLoading.value=false
  }
}

// sync route → local & fetch
watch(() => route.query, (q)=>{
  local.search     = String(q?.search || '')
  local.search_by  = String(q?.search_by || 'name')
  local.rank       = String(q?.rank || '')
  local.status     = String(q?.status || '')
  local.gender     = String(q?.gender || '')
  local.region_id  = String(q?.region_id || '')
  local.city_id    = String(q?.city_id || '')
  // clear invalid city when region changes
  if (local.city_id && local.region_id){
    const ok = narrowedCities.value.some(c => String(c.id)===String(local.city_id))
    if (!ok) local.city_id = ''
  }
  fetchRows()
}, { immediate:true })

</script>
