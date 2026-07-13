<!-- /src/v3/components/GeneralPagination.vue -->
<template>
  <div v-if="pageCount > 1" class="Pagination">
    <v-pagination
      v-model="localPage"
      :pages="pageCount"
      :range-size="0"
      :hide-first-button="true"
      :hide-last-button="true"
      :aria-label="ariaLabel"
      @update:modelValue="onChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VPagination from '@hennge/vue3-pagination'

const props = defineProps({
  // Expect shape { page, pageCount }; do NOT mutate it
  pagination: { type: Object, required: true },
  // Optional: scroll to top on page change
  scrollOnChange: { type: Boolean, default: true },
  // Optional: selector to scroll into view; falls back to window
  scrollTarget: { type: String, default: '' },
  // Optional ARIA label for screen readers
  label: { type: String, default: 'Pagination' }
})

const route = useRoute()
const router = useRouter()

// Derive current page from URL first, else from props
const currentPage = computed(() => {
  const q = Number(route.query.page || props.pagination?.page || 1)
  return Number.isFinite(q) && q > 0 ? q : 1
})

const pageCount = computed(() => {
  const c = Number(props.pagination?.pageCount || 0)
  return Number.isFinite(c) && c > 0 ? c : 0
})

// Local model for <v-pagination> (kept in sync with URL)
const localPage = ref(currentPage.value)
watch(currentPage, (p) => { localPage.value = p }, { immediate: true })

const ariaLabel = computed(() => props.label)

// Push new page to URL; keep other params; remove page=1 for clean URLs
async function onChange(newPage) {
  const q = { ...route.query }
  if (Number(newPage) === 1) {
    delete q.page
  } else {
    q.page = String(newPage)
  }

  // Avoid redundant navigation warnings
  router.replace({ query: q }).catch(() => {})

  if (!props.scrollOnChange) return

  await nextTick()
  if (props.scrollTarget) {
    const el = document.querySelector(props.scrollTarget)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss">
/* Container */
.Pagination {
  @apply tw-flex tw-justify-center tw-my-7 tw-z-10;
}

/* Base items */
.Pagination li {
  @apply tw-me-1 last:tw-me-1;
}

/* Buttons */
.Pagination li button {
  @apply tw-p-5 tw-border tw-flex tw-items-center tw-justify-center tw-w-5 tw-h-5 tw-rounded-md tw-text-primary tw-font-bold;
}

/* Prev/Next controls */
.Pagination li.PaginationControl {
  @apply tw-w-[42px] tw-border tw-rounded-md tw-flex tw-items-center tw-justify-center;
}
.Pagination li.PaginationControl svg {
  @apply tw-w-6;
}

/* Ellipsis */
.Pagination li:has(.DotsHolder) {
  @apply tw-flex tw-items-center;
}
.Pagination li:has(.DotsHolder) svg {
  @apply tw-w-[15px];
}
.Pagination li:has(.DotsHolder) svg path {
  @apply tw-fill-primary;
}

/* Active page */
.Pagination li button.Page.Page-active {
  @apply tw-text-white;
  background-color: #025796 !important;
}

/* RTL arrow flip */
:root[dir='rtl'] .Pagination li.PaginationControl svg {
  transform: rotate(180deg);
}
</style>
