<template>
  <div class="map-controls-root">
    <div class="map-controls-stack">
      <UiIconButton
        class="map-controls-btn"
        variant="surface"
        :active="showFavoritesOnly"
        aria-label="찜한 헬스장만 표시"
        @click="toggleFavoritesOnly"
      >
        <Star :size="20" />
      </UiIconButton>

      <UiIconButton
        class="map-controls-btn"
        variant="surface"
        :active="isCurrentLocationCentered"
        :disabled="isLocating"
        aria-label="현재 위치로 이동"
        @click="moveToCurrentLocation"
      >
        <LocateFixed :size="20" />
      </UiIconButton>

      <div class="map-controls-zoom">
        <button class="map-controls-zoom-btn map-controls-zoom-btn-top" aria-label="확대" @click="zoomIn">
          <Plus :size="20" class="u-text-666" />
        </button>
        <button class="map-controls-zoom-btn map-controls-zoom-btn-bottom" aria-label="축소" @click="zoomOut">
          <Minus :size="20" class="u-text-666" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { LocateFixed, Plus, Minus, Star } from 'lucide-vue-next';
import UiIconButton from '@/components/ui/UiIconButton.vue';

const props = defineProps({
  mapInstance: { type: Object, default: null },
  showFavoritesOnly: { type: Boolean, default: false },
});
const emit = defineEmits(['toggle-favorites-only']);

const zoomLevel = ref(14);
const minZoom = ref(8);
const maxZoom = ref(18);
const isLocating = ref(false);
const isCurrentLocationCentered = ref(false);
const mapListeners = ref([]);
const locationMarker = ref(null);
const currentLocation = ref(null);
const DESKTOP_BREAKPOINT = 768;
const TARGET_SELECTION_ZOOM = 17;

const thumbTop = computed(() => {
  const range = maxZoom.value - minZoom.value;
  if (range <= 0) return '50%';
  const ratio = (zoomLevel.value - minZoom.value) / range;
  const inverted = 1 - Math.min(1, Math.max(0, ratio));
  return `${10 + inverted * 80}%`;
});

const getLatLng = (latLng) => {
  if (!latLng) return null;
  if (typeof latLng.lat === 'function' && typeof latLng.lng === 'function') {
    return { lat: Number(latLng.lat()), lng: Number(latLng.lng()) };
  }
  return { lat: Number(latLng.y), lng: Number(latLng.x) };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const latLngToWorld = (lat, lng, zoom) => {
  const tileScale = 256 * (2 ** zoom);
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const x = ((lng + 180) / 360) * tileScale;
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * tileScale;
  return { x, y };
};

const worldToLatLng = (x, y, zoom) => {
  const tileScale = 256 * (2 ** zoom);
  const lng = (x / tileScale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / tileScale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
};

const isDesktopViewport = () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;

const getDesktopPanelCoveredWidth = () => {
  if (!isDesktopViewport() || typeof document === 'undefined') return 0;
  const panelRoot = document.querySelector('.search-panel-root');
  if (!panelRoot) return 0;
  const mapRoot = document.querySelector('.map-canvas-root');
  if (!mapRoot) return 0;

  const mapRect = mapRoot.getBoundingClientRect();
  const rootRect = panelRoot.getBoundingClientRect();
  const rootCovered = Math.max(0, Math.min(mapRect.right, rootRect.right) - Math.max(mapRect.left, rootRect.left));
  if (rootCovered <= 0) return 0;

  let rightMost = Math.min(mapRect.right, rootRect.right);
  const hasSelection = panelRoot.classList.contains('search-panel-has-selection');
  if (hasSelection) {
    const detailPane = panelRoot.querySelector('.search-panel-detail-pane');
    if (detailPane) {
      const detailRect = detailPane.getBoundingClientRect();
      const detailCovered = Math.max(0, Math.min(mapRect.right, detailRect.right) - Math.max(mapRect.left, detailRect.left));
      if (detailCovered > 0) {
        rightMost = Math.max(rightMost, Math.min(mapRect.right, detailRect.right));
      }
    }
  }

  return Math.max(0, rightMost - mapRect.left);
};

const getShiftedCenterForDesktop = (
  map,
  targetLatLng,
  coveredWidth = getDesktopPanelCoveredWidth(),
  zoomForCalculation = Number(map?.getZoom?.()),
) => {
  if (!Number.isFinite(coveredWidth) || coveredWidth <= 0) {
    return targetLatLng;
  }

  const target = getLatLng(targetLatLng);
  if (!target || !Number.isFinite(zoomForCalculation)) {
    return null;
  }

  const world = latLngToWorld(target.lat, target.lng, zoomForCalculation);
  const shifted = worldToLatLng(world.x - coveredWidth / 2, world.y, zoomForCalculation);
  return new window.naver.maps.LatLng(shifted.lat, shifted.lng);
};

const getAdjustedCenterForViewport = (map, targetLatLng, zoomForCalculation = Number(map?.getZoom?.())) => {
  if (!isDesktopViewport()) return targetLatLng;
  const coveredWidth = getDesktopPanelCoveredWidth();
  return getShiftedCenterForDesktop(map, targetLatLng, coveredWidth, zoomForCalculation) || targetLatLng;
};

const panToAdjustedCenter = (map, targetLatLng, zoomForCalculation = Number(map?.getZoom?.())) => {
  const coveredWidth = getDesktopPanelCoveredWidth();
  const adjustedCenter = getAdjustedCenterForViewport(map, targetLatLng, zoomForCalculation);
  if (
    isDesktopViewport()
    && coveredWidth > 0
    && !getShiftedCenterForDesktop(map, targetLatLng, coveredWidth, zoomForCalculation)
    && typeof map.panBy === 'function'
  ) {
    map.panBy(-Math.round(coveredWidth / 2), 0);
    return;
  }
  map.panTo(adjustedCenter);
};

const animateCameraToTarget = (map, targetLatLng) => {
  if (!map) return;
  const currentZoomRaw = Number(map.getZoom?.());
  const min = Number.isFinite(minZoom.value) ? minZoom.value : 8;
  const max = Number.isFinite(maxZoom.value) ? maxZoom.value : 18;
  const currentZoom = Number.isFinite(currentZoomRaw) ? currentZoomRaw : TARGET_SELECTION_ZOOM;
  const nextZoom = clamp(Math.max(currentZoom, TARGET_SELECTION_ZOOM), min, max);

  const adjustedCenter = getAdjustedCenterForViewport(map, targetLatLng, nextZoom);
  if (typeof map.morph === 'function') {
    map.morph(adjustedCenter, nextZoom);
    return;
  }

  panToAdjustedCenter(map, targetLatLng, nextZoom);
  if (typeof map.getZoom === 'function' && typeof map.setZoom === 'function' && nextZoom !== currentZoom) {
    map.setZoom(nextZoom, true);
  }
};

const syncMapState = (map) => {
  if (!map) return;
  const current = Number(map.getZoom());
  const mapMin = Number(map.getOptions('minZoom'));
  const mapMax = Number(map.getOptions('maxZoom'));
  minZoom.value = Number.isFinite(mapMin) ? mapMin : minZoom.value;
  maxZoom.value = Number.isFinite(mapMax) ? mapMax : maxZoom.value;
  zoomLevel.value = Number.isFinite(current) ? current : zoomLevel.value;

  if (!currentLocation.value) {
    isCurrentLocationCentered.value = false;
    return;
  }

  const center = getLatLng(map.getCenter());
  if (!center) {
    isCurrentLocationCentered.value = false;
    return;
  }
  const centerTolerance = 0.00001;
  const targetLatLng = new window.naver.maps.LatLng(currentLocation.value.lat, currentLocation.value.lng);
  const zoomForCenterCheck = Number(map.getZoom?.());
  const adjustedCenter = getAdjustedCenterForViewport(map, targetLatLng, zoomForCenterCheck);
  const adjustedLatLng = getLatLng(adjustedCenter);
  let expectedCenter = currentLocation.value;
  if (adjustedLatLng) {
    expectedCenter = adjustedLatLng;
  } else if (!isDesktopViewport()) {
    expectedCenter = currentLocation.value;
  }

  const latDiff = Math.abs(center.lat - expectedCenter.lat);
  const lngDiff = Math.abs(center.lng - expectedCenter.lng);
  isCurrentLocationCentered.value = latDiff <= centerTolerance && lngDiff <= centerTolerance;
};

const clearMapListeners = () => {
  if (!window.naver?.maps?.Event) return;
  mapListeners.value.forEach((listener) => {
    window.naver.maps.Event.removeListener(listener);
  });
  mapListeners.value = [];
};

const addMapListener = (map, eventName) => {
  if (!window.naver?.maps?.Event) return;
  const listener = window.naver.maps.Event.addListener(map, eventName, () => {
    syncMapState(map);
  });
  mapListeners.value.push(listener);
};

const updateCurrentLocation = (lat, lng) => {
  currentLocation.value = { lat: Number(lat), lng: Number(lng) };
  if (props.mapInstance) {
    syncMapState(props.mapInstance);
  }
};

const zoomIn = () => {
  if (!props.mapInstance) return;
  const currentZoom = props.mapInstance.getZoom();
  props.mapInstance.setZoom(Math.min(maxZoom.value, currentZoom + 1), true);
};

const zoomOut = () => {
  if (!props.mapInstance) return;
  const currentZoom = props.mapInstance.getZoom();
  props.mapInstance.setZoom(Math.max(minZoom.value, currentZoom - 1), true);
};

const moveToCurrentLocation = () => {
  if (!props.mapInstance || !navigator.geolocation || !window.naver?.maps) return;
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const map = props.mapInstance;
      const position = new window.naver.maps.LatLng(coords.latitude, coords.longitude);
      animateCameraToTarget(map, position);

      updateCurrentLocation(coords.latitude, coords.longitude);
      if (!locationMarker.value) {
        locationMarker.value = new window.naver.maps.Marker({
          map,
          position,
          icon: {
            content:
              '<div style="width:16px;height:16px;border-radius:9999px;background:#3b82f6;border:3px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>',
            anchor: new window.naver.maps.Point(8, 8),
          },
        });
      } else {
        locationMarker.value.setPosition(position);
        locationMarker.value.setMap(map);
      }
      isLocating.value = false;
    },
    () => {
      isLocating.value = false;
      window.alert('현재 위치를 가져올 수 없습니다. 브라우저 위치 권한을 확인해주세요.');
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
};

const toggleFavoritesOnly = () => {
  emit('toggle-favorites-only');
};

watch(
  () => props.mapInstance,
  (map) => {
    clearMapListeners();
    if (!map || !window.naver?.maps?.Event) return;
    syncMapState(map);
    addMapListener(map, 'zoom_changed');
    addMapListener(map, 'center_changed');
    addMapListener(map, 'idle');
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearMapListeners();
  if (locationMarker.value) {
    locationMarker.value.setMap(null);
    locationMarker.value = null;
  }
});
</script>
