<template>
  <div ref="mapEl" class="map-canvas map-canvas-root">
    <div v-if="mapError" class="map-error-banner">{{ mapError }}</div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';

const props = defineProps({
  gyms: { type: Array, required: true },
  selectedGymId: { type: String, default: null },
  onPinClick: { type: Function, required: true },
  favoriteGymIds: { type: Array, required: true },
  routePath: { type: Array, default: () => [] },
});
const emit = defineEmits(['map-ready']);

const mapEl = ref(null);
const mapError = ref('');
const mapInstance = ref(null);
const markers = ref([]);
const routePolyline = ref(null);
const routeStartMarker = ref(null);
const routeGoalMarker = ref(null);
const relayoutRafId = ref(0);
const resizeObserver = ref(null);
const lastContainerSize = ref({ width: 0, height: 0 });

const BASE_CENTER = { lat: 37.5133, lng: 126.9289 };
const DESKTOP_BREAKPOINT = 768;
const DETAIL_PANEL_WIDTH_PX = 390;
const TARGET_SELECTION_ZOOM = 17;
const DEFAULT_CONTROL_OPTIONS = {
  mapTypeControl: false,
  scaleControl: false,
  logoControl: true,
  mapDataControl: false,
  zoomControl: false,
};

const toLatLng = (gym) => {
  const lat = Number(gym.latitude ?? gym.lat ?? gym.y);
  const lng = Number(gym.longitude ?? gym.lng ?? gym.x);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { lat, lng };
  }

  const px = Number.parseFloat(String(gym.coords?.x ?? '50').replace('%', ''));
  const py = Number.parseFloat(String(gym.coords?.y ?? '50').replace('%', ''));
  const x = Number.isFinite(px) ? px : 50;
  const y = Number.isFinite(py) ? py : 50;
  return {
    lat: BASE_CENTER.lat + (50 - y) * 0.0008,
    lng: BASE_CENTER.lng + (x - 50) * 0.0012,
  };
};

const CATEGORY_ICON_META = [
  {
    key: '헬스장',
    color: '#0068ff',
    match: ['헬스', '휘트니스', 'fitness', 'dumbbell'],
    material: 'fitness_center',
  },
  {
    key: 'PT',
    color: '#ff4b4b',
    match: ['pt', 'personal', 'trainer', 'user'],
    material: 'person',
  },
  {
    key: '요가',
    color: '#00c73c',
    match: ['요가', 'yoga', 'target'],
    material: 'self_improvement',
  },
  {
    key: '필라테스',
    color: '#9b59b6',
    match: ['필라테스', 'pilates', 'info'],
    material: 'accessibility_new',
  },
  {
    key: '골프',
    color: '#f1c40f',
    match: ['골프', 'golf', 'trophy'],
    material: 'golf_course',
  },
  {
    key: '수영',
    color: '#3498db',
    match: ['수영', 'swim', 'waves', 'pool', 'plane'],
    material: 'pool',
  },
  {
    key: '크로스핏',
    color: '#e67e22',
    match: ['크로스핏', 'crossfit', 'flame'],
    material: 'local_fire_department',
  },
  {
    key: '클라이밍',
    color: '#8e44ad',
    match: ['클라이밍', 'climbing', 'mountain'],
    material: 'terrain',
  },
  {
    key: '복싱',
    color: '#e74c3c',
    match: ['복싱', 'boxing', 'zap'],
    material: 'sports_martial_arts',
  },
  {
    key: '테니스',
    color: '#2ecc71',
    match: ['테니스', 'tennis', 'circledot'],
    material: 'sports_tennis',
  },
  {
    key: '배드민턴',
    color: '#1abc9c',
    match: ['배드민턴', 'badminton', 'wind'],
    material: 'sports_tennis',
  },
];

const resolveCategoryIconMeta = (gym) => {
  const typeText = String(gym.type || '').toLowerCase();
  const iconType = String(gym.iconType || '').toLowerCase();
  return (
    CATEGORY_ICON_META.find(({ match }) => match.some((key) => typeText.includes(key) || iconType.includes(key)))
    || CATEGORY_ICON_META[0]
  );
};

const markerIcon = (gym, selected) => {
  const isFavorite = props.favoriteGymIds.includes(gym.id);
  const categoryIcon = resolveCategoryIconMeta(gym);
  const baseColor = categoryIcon.color;
  const markerSize = selected ? 34 : 30;
  const pinTail = selected ? 10 : 8;
  const iconSize = selected ? 16 : 14;
  const shadow = isFavorite
    ? '0 4px 12px rgba(15,23,42,0.24), 0 0 0 3px rgba(22,163,74,0.16)'
    : '0 3px 10px rgba(15,23,42,0.20)';

  return {
    content: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:${markerSize}px;height:${markerSize}px;border-radius:9999px;
          border:2px solid ${baseColor};
          background:#ffffff;
          display:flex;align-items:center;justify-content:center;
          box-shadow:${shadow};
        ">
          <span class="material-symbols-rounded" style="
            font-size:${iconSize}px;
            color:${baseColor};
            line-height:1;
            font-variation-settings:'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 24;
          ">${categoryIcon.material}</span>
        </div>
        <div style="
          width:0;height:0;
          border-left:${pinTail / 2}px solid transparent;
          border-right:${pinTail / 2}px solid transparent;
          border-top:${pinTail}px solid ${baseColor};
          margin-top:-1px;
        "></div>
      </div>
    `,
    anchor: new window.naver.maps.Point(Math.round(markerSize / 2), markerSize + pinTail - 1),
  };
};

const clearMarkers = () => {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
};

const drawMarkers = () => {
  if (!mapInstance.value || !window.naver?.maps) return;
  clearMarkers();

  props.gyms.forEach((gym) => {
    const pos = toLatLng(gym);
    const marker = new window.naver.maps.Marker({
      map: mapInstance.value,
      position: new window.naver.maps.LatLng(pos.lat, pos.lng),
      title: gym.name,
      icon: markerIcon(gym, props.selectedGymId === gym.id),
    });

    window.naver.maps.Event.addListener(marker, 'click', () => {
      props.onPinClick(gym.id);
    });

    markers.value.push(marker);
  });
};

const clearRouteOverlay = () => {
  if (routePolyline.value) {
    routePolyline.value.setMap(null);
    routePolyline.value = null;
  }
  if (routeStartMarker.value) {
    routeStartMarker.value.setMap(null);
    routeStartMarker.value = null;
  }
  if (routeGoalMarker.value) {
    routeGoalMarker.value.setMap(null);
    routeGoalMarker.value = null;
  }
};

const fitRouteBounds = (routePoints) => {
  const map = mapInstance.value;
  if (!map || !window.naver?.maps || routePoints.length < 2) return;

  const bounds = new window.naver.maps.LatLngBounds();
  routePoints.forEach((point) => {
    bounds.extend(new window.naver.maps.LatLng(point.lat, point.lng));
  });

  map.fitBounds(bounds);
  if (isDesktopViewport() && typeof map.panBy === 'function') {
    map.panBy(-Math.round(DETAIL_PANEL_WIDTH_PX / 2), 0);
  }
};

const drawRouteOverlay = () => {
  if (!mapInstance.value || !window.naver?.maps) return;
  clearRouteOverlay();

  const routePoints = Array.isArray(props.routePath)
    ? props.routePath.filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lng))
    : [];
  if (routePoints.length < 2) return;

  const path = routePoints.map((point) => new window.naver.maps.LatLng(point.lat, point.lng));
  routePolyline.value = new window.naver.maps.Polyline({
    map: mapInstance.value,
    path,
    strokeColor: '#0068ff',
    strokeWeight: 6,
    strokeOpacity: 0.9,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    clickable: false,
    zIndex: 100,
  });

  const start = routePoints[0];
  const goal = routePoints[routePoints.length - 1];
  routeStartMarker.value = new window.naver.maps.Circle({
    map: mapInstance.value,
    center: new window.naver.maps.LatLng(start.lat, start.lng),
    radius: 8,
    strokeColor: '#ffffff',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#22c55e',
    fillOpacity: 1,
    zIndex: 110,
  });
  routeGoalMarker.value = new window.naver.maps.Circle({
    map: mapInstance.value,
    center: new window.naver.maps.LatLng(goal.lat, goal.lng),
    radius: 9,
    strokeColor: '#ffffff',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#ef4444',
    fillOpacity: 1,
    zIndex: 110,
  });

  fitRouteBounds(routePoints);
};

const isDesktopViewport = () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getLatLng = (latLng) => {
  if (!latLng) return null;
  if (typeof latLng.lat === 'function' && typeof latLng.lng === 'function') {
    return { lat: Number(latLng.lat()), lng: Number(latLng.lng()) };
  }
  return { lat: Number(latLng.y), lng: Number(latLng.x) };
};

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

const getShiftedCenterForDesktop = (targetLatLng, zoomForCalculation) => {
  const target = getLatLng(targetLatLng);
  if (!target || !Number.isFinite(zoomForCalculation)) {
    return null;
  }
  const world = latLngToWorld(target.lat, target.lng, zoomForCalculation);
  const shifted = worldToLatLng(world.x - DETAIL_PANEL_WIDTH_PX / 2, world.y, zoomForCalculation);
  return new window.naver.maps.LatLng(shifted.lat, shifted.lng);
};

const panToAdjustedCenter = (map, targetLatLng, zoomForCalculation = Number(map?.getZoom?.())) => {
  if (isDesktopViewport()) {
    const shiftedCenter = getShiftedCenterForDesktop(targetLatLng, zoomForCalculation);
    if (shiftedCenter) {
      map.panTo(shiftedCenter);
      return;
    }
    if (typeof map.panBy === 'function') {
      map.panBy(-Math.round(DETAIL_PANEL_WIDTH_PX / 2), 0);
      return;
    }
  }
  map.panTo(targetLatLng);
};

const animateCameraToTarget = (map, targetLatLng) => {
  if (!map) return;
  const currentZoomRaw = Number(map.getZoom?.());
  const min = Number(map.getOptions?.('minZoom'));
  const max = Number(map.getOptions?.('maxZoom'));
  const minZoom = Number.isFinite(min) ? min : 8;
  const maxZoom = Number.isFinite(max) ? max : 18;
  const currentZoom = Number.isFinite(currentZoomRaw) ? currentZoomRaw : TARGET_SELECTION_ZOOM;
  const nextZoom = isDesktopViewport()
    ? clamp(Math.max(currentZoom, TARGET_SELECTION_ZOOM), minZoom, maxZoom)
    : currentZoom;

  const adjustedCenter = isDesktopViewport()
    ? getShiftedCenterForDesktop(targetLatLng, nextZoom) || targetLatLng
    : targetLatLng;
  if (typeof map.morph === 'function') {
    map.morph(adjustedCenter, nextZoom);
    return;
  }

  panToAdjustedCenter(map, targetLatLng, nextZoom);
  if (isDesktopViewport() && typeof map.setZoom === 'function' && nextZoom !== currentZoom) {
    map.setZoom(nextZoom, true);
  }
};

const moveToSelectedGym = () => {
  if (!mapInstance.value || !props.selectedGymId) return;
  const selected = props.gyms.find((gym) => gym.id === props.selectedGymId);
  if (!selected) return;
  const map = mapInstance.value;
  const pos = toLatLng(selected);
  const targetLatLng = new window.naver.maps.LatLng(pos.lat, pos.lng);
  animateCameraToTarget(map, targetLatLng);
};

const relayoutMap = () => {
  const map = mapInstance.value;
  if (!map || !window.naver?.maps) return;
  if (window.naver.maps.Event?.trigger) {
    window.naver.maps.Event.trigger(map, 'resize');
  }
};

const scheduleRelayoutMap = () => {
  if (relayoutRafId.value) cancelAnimationFrame(relayoutRafId.value);
  relayoutRafId.value = requestAnimationFrame(() => {
    relayoutRafId.value = 0;
    relayoutMap();
  });
};

const handleWindowResize = () => {
  scheduleRelayoutMap();
};

const checkContainerSize = () => {
  if (!mapEl.value) return;
  const width = Math.round(mapEl.value.clientWidth || 0);
  const height = Math.round(mapEl.value.clientHeight || 0);
  if (width <= 0 || height <= 0) return;

  if (lastContainerSize.value.width === width && lastContainerSize.value.height === height) {
    return;
  }

  lastContainerSize.value = { width, height };
  scheduleRelayoutMap();
};

const loadMapSdk = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    if (window.naver?.maps) {
      resolve();
      return;
    }
    const clientId =
      import.meta.env.VUE_APP_NAVER_MAP_KEY_ID ||
      import.meta.env.VUE_APP_NAVER_MAP_CLIENT_ID ||
      import.meta.env.VITE_NAVER_MAP_KEY_ID ||
      import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      reject(new Error('NAVER map client id is missing (VUE_APP_* or VITE_*)'));
      return;
    }
    const existing = document.querySelector('script[data-naver-map-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Naver Map SDK load failed')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.naverMapSdk = 'true';
    const query = new URLSearchParams({ ncpKeyId: clientId });
    const submodules = import.meta.env.VUE_APP_NAVER_MAP_SUBMODULES || import.meta.env.VITE_NAVER_MAP_SUBMODULES;
    if (submodules) {
      query.set('submodules', submodules);
    }
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${query.toString()}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Naver Map SDK load failed'));
    document.head.appendChild(script);
  });

onMounted(async () => {
  try {
    await loadMapSdk();
    mapInstance.value = new window.naver.maps.Map(mapEl.value, {
      center: new window.naver.maps.LatLng(BASE_CENTER.lat, BASE_CENTER.lng),
      zoom: 14,
      minZoom: 8,
      maxZoom: 18,
      tileTransition: true,
      ...DEFAULT_CONTROL_OPTIONS,
    });
    emit('map-ready', mapInstance.value);
    drawMarkers();
    drawRouteOverlay();
    moveToSelectedGym();
    await nextTick();
    checkContainerSize();
    scheduleRelayoutMap();
    if (typeof ResizeObserver !== 'undefined' && mapEl.value) {
      resizeObserver.value = new ResizeObserver(() => {
        checkContainerSize();
      });
      resizeObserver.value.observe(mapEl.value);
    }
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);
  } catch (error) {
    mapError.value = error.message || '네이버 지도 로딩 실패';
    console.error(error);
  }
});

onBeforeUnmount(() => {
  if (relayoutRafId.value) {
    cancelAnimationFrame(relayoutRafId.value);
    relayoutRafId.value = 0;
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('orientationchange', handleWindowResize);
  clearMarkers();
  clearRouteOverlay();
  mapInstance.value = null;
});

watch(
  () => props.gyms,
  () => {
    drawMarkers();
    moveToSelectedGym();
  },
  { deep: true },
);

watch(
  () => props.selectedGymId,
  () => {
    drawMarkers();
    if (!props.routePath?.length) {
      moveToSelectedGym();
    }
    checkContainerSize();
    scheduleRelayoutMap();
  },
);

watch(
  () => props.favoriteGymIds,
  () => {
    drawMarkers();
  },
  { deep: true },
);

watch(
  () => props.routePath,
  () => {
    drawRouteOverlay();
  },
  { deep: true },
);
</script>
