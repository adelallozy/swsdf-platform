<template>
  <div
    class="input_wrapper"
    :class="{
      error: invalid,
      'tw-opacity-60': disabled,
    }"
  >
    <input
      ref="searchInput"
      type="text"
      class="p-inputtext p-component tw-mb-3 tw-w-full"
      :placeholder="placeholder || t('Search for a place')"
      :disabled="disabled"
      :aria-invalid="invalid ? 'true' : 'false'"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />

    <div
      ref="mapElement"
      class="tw-overflow-hidden tw-rounded-xl tw-border tw-border-slate-200"
      :class="{ 'tw-border-red-500': invalid }"
      :style="{ width: '100%', height: mapHeight }"
    />

    <input
      :id="id"
      :value="modelValue || ''"
      type="text"
      readonly
      class="p-inputtext p-component tw-mt-3 tw-w-full"
      :placeholder="t('Location coordinates will appear here')"
      :disabled="disabled"
      :aria-invalid="invalid ? 'true' : 'false'"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </div>
</template>

<script setup>
import { Loader } from '@googlemaps/js-api-loader';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const DEFAULT_CENTER = { lat: 24.713552, lng: 46.675297 };
const GMAP_KEY = import.meta.env.VITE_GMAP_KEY || import.meta.env.VITE_GMAP_API;

let mapsPromise;

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  attrs: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus']);
const { t } = useI18n();

const mapElement = ref(null);
const searchInput = ref(null);
const mapInstance = ref(null);
const markerInstance = ref(null);
const autocompleteInstance = ref(null);

const mapHeight = computed(() => props.attrs?.height || '320px');
const mapZoom = computed(() => props.attrs?.zoom || 12);

function formatCoordinates(lat, lng) {
  return `${Number(lat).toFixed(7)},${Number(lng).toFixed(7)}`;
}

function parseCoordinates(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const [lat, lng] = value.split(',').map((part) => Number(part.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

async function loadMaps() {
  if (window.google?.maps?.importLibrary) {
    return window.google.maps;
  }

  if (!mapsPromise) {
    const loader = new Loader({
      apiKey: GMAP_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    mapsPromise = loader.load().then(() => window.google.maps);
  }

  return mapsPromise;
}

function emitValue(position) {
  const value = formatCoordinates(position.lat, position.lng);
  emit('update:modelValue', value);
  emit('input', value);
  emit('change', value);
}

function updateMarker(position, shouldEmit = false) {
  if (!mapInstance.value || !markerInstance.value) {
    return;
  }

  markerInstance.value.setPosition(position);
  mapInstance.value.setCenter(position);

  if (shouldEmit) {
    emitValue(position);
  }
}

async function initMap() {
  if (!mapElement.value || !searchInput.value || !GMAP_KEY) {
    return;
  }

  const maps = await loadMaps();
  const position = parseCoordinates(props.modelValue) || DEFAULT_CENTER;

  mapInstance.value = new maps.Map(mapElement.value, {
    center: position,
    zoom: mapZoom.value,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    ...(props.attrs?.mapOptions || {}),
  });

  markerInstance.value = new maps.Marker({
    map: mapInstance.value,
    position,
    draggable: !props.disabled,
  });

  markerInstance.value.addListener('dragend', (event) => {
    const lat = event?.latLng?.lat?.();
    const lng = event?.latLng?.lng?.();
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    updateMarker({ lat, lng }, true);
  });

  autocompleteInstance.value = new maps.places.Autocomplete(searchInput.value, {
    componentRestrictions: props.attrs?.country ? { country: props.attrs.country } : undefined,
    fields: ['geometry', 'formatted_address'],
  });

  autocompleteInstance.value.addListener('place_changed', () => {
    const place = autocompleteInstance.value.getPlace();
    const lat = place?.geometry?.location?.lat?.();
    const lng = place?.geometry?.location?.lng?.();
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    updateMarker({ lat, lng }, true);
  });
}

onMounted(() => {
  initMap();
});

watch(
  () => props.modelValue,
  (value) => {
    const position = parseCoordinates(value);
    if (position) {
      updateMarker(position, false);
    }
  }
);

watch(
  () => props.disabled,
  (value) => {
    if (markerInstance.value) {
      markerInstance.value.setDraggable(!value);
    }
    if (searchInput.value) {
      searchInput.value.disabled = value;
    }
  }
);
</script>
