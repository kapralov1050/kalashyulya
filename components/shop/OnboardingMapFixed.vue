<template>
    <div class="onboarding-map__map">
        <YandexMap v-if="isYandexMapReadyToInit" v-model="map" :settings="mapSettings">
            <YandexMapListener
                :settings="{
                    onActionStart,
                    onActionEnd,
                }"
            />
            <YandexMapDefaultSchemeLayer :settings="mapDefaultSchemeLayerSettings" />
            <YandexMapDefaultFeaturesLayer />
            <YandexMapClusterer
                :key="`clusterer-${zoom}-${coordinates[0]}-${coordinates[1]}`"
                v-model="clusterer"
                :grid-size="gridSize"
                zoom-on-cluster-click
            >
                <template v-for="point in points" :key="point.id">
                    <YandexMapMarker
                        v-if="point.address.longitude && point.address.latitude"
                        :settings="{
                            coordinates: [point.address.longitude, point.address.latitude],
                            zIndex: isPointSelected(point) ? 1 : 0,
                        }"
                    >
                        <div
                            class="map-pin"
                            :class="{
                                'map-pin--rocket-select': isPointSelected(point),
                                'map-pin--rocket': !isPointSelected(point) && zoom > minPlaceZoom,
                                'map-pin--cluster': !isPointSelected(point) && zoom <= minPlaceZoom,
                            }"
                            @click="openMarker(point)"
                        >
                            <div class="map-pin__icon-wrap">
                                <span v-if="isPointSelected(point)" class="map-pin__icon" />
                                <span v-else-if="zoom > minPlaceZoom" class="map-pin__icon" />
                                <span v-else class="map-pin__icon" />
                            </div>
                            <div v-if="isPointSelected(point)" class="map-pin__content">
                                <p class="map-pin__label">
                                    {{ printLocale('onboarding_delivery_point_default_name_line_1') }}
                                    {{ printLocale('onboarding_delivery_point_default_name_line_2') }}
                                </p>
                            </div>
                        </div>
                    </YandexMapMarker>
                </template>
                <template #cluster="{}">
                    <div class="map-pin map-pin--cluster">
                        <div class="map-pin__icon-wrap">
                            <span class="map-pin__icon" />
                        </div>
                    </div>
                </template>
            </YandexMapClusterer>
            <YandexMapFeature v-for="feature of props.features" :key="feature.id" :settings="feature" />
        </YandexMap>
    </div>
    <div
        v-if="!selectedPlace || isDrag"
        class="map-pin map-pin--default"
        :class="{
            _moving: isDrag,
        }"
    >
        <div class="map-pin__icon-wrap">
            <span class="map-pin__icon" />
        </div>
    </div>
    <div class="onboarding-map__controls">
        <RxButton
            data-test="current-position-button"
            :mods="['size-md', 'primary', 'equal', 'icon-40']"
            aria-label="Где я?"
            @click="emit('onCurrentPosition')"
        >
            <template #icon-right>
                <SvgUse class="btn__icon" href="40-locationNavigation" size="40" />
            </template>
        </RxButton>
    </div>
    <PointsSlider ref="pointsSliderRef" :points="points" :inert="!isActivePoint" @close="emit('closePoints')" />
</template>

<script setup lang="ts">
import {storeToRefs} from 'pinia';
import Swiper from 'swiper';
import {computed, nextTick, onBeforeUnmount, ref, shallowRef, watch, useTemplateRef} from 'vue';
import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    isYandexMapReadyToInit,
    YandexMapDefaultFeaturesLayer,
    YandexMapMarker,
    YandexMapFeature,
    YandexMapListener,
    YandexMapClusterer,
} from 'vue-yandex-maps';
import type {YMapClusterer} from '@yandex/ymaps3-clusterer';
import type {
    BehaviorMapEventHandler,
    BehaviorType,
    LngLat,
    YMap,
    YMapDefaultSchemeLayerProps,
    YMapFeatureProps,
} from '@yandex/ymaps3-types';
import type {YMapCameraRequest, YMapProps} from '@yandex/ymaps3-types/imperative/YMap';
import 'swiper/css';
import PointsSlider from '@authentication/components/PointsSlider.vue';
import {type DeliveryPlace, useApplicationsStore} from '@authentication/stores/useApplicationsStore';
import {MeetingType} from '@authentication/types/Application';
import {searchCityFromString} from '@authentication/utils/address';
import RxButton from '@common/components/RxButton.vue';
import SvgUse from '@common/components/SvgUse.vue';
import {useGeoCoordinates} from '@common/composables/useGeoCoordinates';
import {useLocales} from '@common/composables/useLocales';

interface Props {
    /** Геообъекты: полигоны, ломаные линии, многоугольники */
    features?: YMapFeatureProps[];
    points?: DeliveryPlace[];
    isActivePoint: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    update: [
        value: {
            coordinates: LngLat;
            locationType: 'city' | 'address';
            meetingType: MeetingType;
            isMarkerMapSet?: boolean;
        },
    ];
    setPoint: [value: DeliveryPlace | null];
    onOpenMarker: [value: {id: string; name: string; coordinates: LngLat}];
    onOpenDetails: [value: {id: string; name: string; coordinates: LngLat}];
    closePoints: [];
    onCurrentPosition: [];
    dragStart: [];
}>();

const {calculateDistance} = useGeoCoordinates();
const {printLocale} = useLocales();
const applicationsStore = useApplicationsStore();
const {currentLongitude, currentLatitude, city} = storeToRefs(applicationsStore);
const pointsSliderRef = useTemplateRef('pointsSliderRef');
const map = shallowRef<YMap | null | undefined>(null);

/** Минимальный зум на котором отображается точка доставки */
const minPlaceZoom = 14;
/** Задержка при изменение геопозиции */
const duration = 0;

const zoom = ref(15);
const isDrag = ref(false);
const selectedPlace = ref<DeliveryPlace | null>(null);
const gridSize = 8;
const clusterer = shallowRef<YMapClusterer | null>(null);
const pointsSlider = ref<InstanceType<typeof Swiper> | null>(null);
const activeSlideHeight = ref(0);

const coordinates = computed<LngLat>(() => [
    parseFloat(currentLongitude.value.toString()),
    parseFloat(currentLatitude.value.toString()),
]);

const camera = ref<YMapCameraRequest>({
    duration,
});

const mapDefaultSchemeLayerSettings = computed<YMapDefaultSchemeLayerProps>(() => {
    return {
        customization: [
            {
                tags: {
                    any: ['landscape', 'admin', 'land', 'transit'],
                },
                elements: 'geometry',
                stylers: [
                    {
                        color: '#D5DDE4',
                        opacity: 0,
                    },
                ],
            },
        ],
    };
});

/** Задает смещения центра карты, нужно для корректной работы центрального маркера, чтобы центр карт считался от 2/3 */
const marginBottom = computed(() => {
    const iconSize = 40;
    return document.body.getBoundingClientRect().height / 3 - iconSize;
});

const isPinchZoom = ref(false);

// FIX #1: behaviors вынесены в константу — isPinchZoom больше не является
// зависимостью mapSettings, поэтому его изменение не отправляет location в карту
const baseBehaviors: BehaviorType[] = [
    'magnifier',
    'oneFingerZoom',
    'panTilt',
    'pinchZoom',
    'scrollZoom',
    'dblClick',
    'mouseTilt',
    'drag',
];

const mapSettings = computed<YMapProps>(() => {
    return {
        location: {center: coordinates.value, zoom: zoom.value, duration, easing: 'ease-out'},
        zoomRange: {min: 5, max: 17},
        camera: camera.value,
        margin: [0, 0, marginBottom.value, 0],
        showScaleInCopyrights: false,
        copyrightsPosition: 'top right',
        zoomStrategy: 'zoomToCenter',
        behaviors: baseBehaviors,
    };
});

// FIX #1: изменение behaviors при pinch идёт через map.update() без location
watch(isPinchZoom, (value) => {
    if (!map.value) return;
    map.value.update({
        behaviors: value ? baseBehaviors.filter((b) => b !== 'drag') : baseBehaviors,
    });
});

function onActionStart(event: Parameters<BehaviorMapEventHandler>[0]) {
    applicationsStore.abortCheckDelivery();
    if (event.type === 'pinchZoom' || event.type === 'scrollZoom') {
        isPinchZoom.value = true;
    }
    if (event.type === 'drag') {
        emit('dragStart');
        isDrag.value = true;
    }
}

function onActionEnd(event: Parameters<BehaviorMapEventHandler>[0]) {
    const zoomEvents = ['scrollZoom', 'pinchZoom', 'dblClick'];
    const isZoomEvent = zoomEvents.includes(event.type);
    const hasZoomChanged = isZoomEvent && event.location.zoom !== zoom.value;
    isPinchZoom.value = false;
    if (isZoomEvent && hasZoomChanged) {
        zoom.value = event.location.zoom;
        setCoordinates(event.location.center);
        emit('update', {
            coordinates: event.location.center,
            locationType: 'address',
            meetingType: selectedPlace.value ? MeetingType.Point : MeetingType.Courier,
        });
    }
    // FIX #3: не обновляем координаты если drag сработал во время pinch-жеста
    if (event.type === 'drag' && !isPinchZoom.value) {
        isDrag.value = false;
        emit('setPoint', null);
        selectedPlace.value = null;
        setCoordinates(event.location.center);
        emit('update', {
            coordinates: event.location.center,
            locationType: 'address',
            meetingType: MeetingType.Courier,
            isMarkerMapSet: true,
        });
    }
}

// TODO Можно будет избавиться от метода в будущем, если мы переехали на store
const shouldApplyDynamicOffset = ref(false);
const isUpdatingFromUserAction = ref(false);

async function setCoordinates(location: LngLat, isDynamicLatOffset?: boolean) {
    shouldApplyDynamicOffset.value = isDynamicLatOffset ?? false;
    isUpdatingFromUserAction.value = true;
    applicationsStore.setCurrentCoordinates(location);
    if (isDynamicLatOffset) {
        updateMap({
            center: location,
            isDynamicLatOffset: true,
        });
        shouldApplyDynamicOffset.value = false;
    }
    await nextTick(() => {
        isUpdatingFromUserAction.value = false;
    });
}

function updateMap(params: {center?: LngLat; zoom?: number; isDynamicLatOffset?: boolean}) {
    if (!map.value) {
        return;
    }
    const newCenter: [number, number] = [
        params.center?.[0] ?? map.value.center[0],
        params.center?.[1] ?? map.value.center[1],
    ];
    const newZoom = params.zoom ?? map.value.zoom;
    map.value.update({
        location: {
            center: [
                newCenter[0],
                newCenter[1] -
                    ((params.isDynamicLatOffset && getDynamicLatOffset(newZoom, window.innerHeight, 100)) || 0),
            ],
            zoom: newZoom,
            duration: 200,
            easing: 'ease-out',
        },
    });
}

/**
 * Возвращает смещение для lat (в градусах), если экран маленький.
 * @param zoomValue - Текущий зум карты (1-20).
 * @param screenHeight - Высота окна браузера (в пикселях).
 * @param modalHeight - Высота модалки/блокирующей области (в пикселях).
 * @param threshold - Минимальная высота экрана, при которой смещение не нужно (по умолчанию 950px).
 * @returns Число, которое нужно вычесть из lat (или 0, если экран большой).
 */
function getDynamicLatOffset(zoomValue: number, screenHeight: number, modalHeight: number, threshold = 950) {
    if (screenHeight >= threshold) {
        return 0;
    }
    const degreesPerPixel = 180 / (256 * Math.pow(2, zoomValue));
    const offsetPixels = modalHeight + screenHeight * 0.1;
    return offsetPixels * degreesPerPixel;
}

function setSelectedPlace(point: DeliveryPlace | null) {
    selectedPlace.value = point;
}

async function openMarker(point: DeliveryPlace) {
    setSelectedPlace(point);
    setActiveSlide();
    if (point.address.latitude && point.address.longitude) {
        emit('onOpenMarker', {
            id: point.id,
            name: point.name,
            coordinates: [point.address.longitude, point.address.latitude],
        });
        emit('update', {
            coordinates: [point.address.longitude, point.address.latitude],
            locationType: 'address',
            meetingType: MeetingType.Point,
        });
        await nextTick();
        updateMap({
            center: [point.address.longitude, point.address.latitude],
            isDynamicLatOffset: shouldApplyDynamicOffset.value,
        });
    }
    emit('setPoint', point);
    shouldApplyDynamicOffset.value = false;
}

function updateSlideHeights(swiper: Swiper) {
    const slideHeights: Record<string, number | undefined> = {};
    const slideOffsets: Record<string, number | undefined> = {};
    if (pointsSliderRef.value) {
        swiper.slides.forEach((item) => {
            const pointId = item.getAttribute('data-point-id');
            if (pointId) {
                slideHeights[pointId] = item.clientHeight;
                slideOffsets[pointId] = 0;
            }
        });
        pointsSliderRef.value.setSlideHeights(slideHeights);
        pointsSliderRef.value.setSlideOffsets(slideOffsets);
    }
}

function initSwiperMapPin() {
    pointsSlider.value = new Swiper('[data-map-pin-slider]', {
        slidesPerView: 1,
        wrapperClass: 'onboarding-map__info-wrapper',
        slideClass: 'onboarding-map__info-slide',
        grabCursor: true,
        centeredSlides: true,
        spaceBetween: 30,
        loop: true,
        autoHeight: true,
        on: {
            init: (swiper) => {
                updateSlideHeights(swiper);
                document.fonts.onloadingdone = () => {
                    updateSlideHeights(swiper);
                };
            },
            resize: (swiper) => {
                activeSlideHeight.value = swiper.height;
            },
            touchStart: (_, event) => {
                if (selectedPlace.value?.id) {
                    pointsSliderRef.value?.handlePointerStart(selectedPlace.value?.id, event);
                }
            },
            touchMoveOpposite: (_, event) => {
                if (selectedPlace.value?.id) {
                    pointsSliderRef.value?.handlePointerMove(selectedPlace.value?.id, event);
                }
            },
            touchMove: (_, event) => {
                if (selectedPlace.value?.id) {
                    pointsSliderRef.value?.handlePointerMove(selectedPlace.value?.id, event);
                }
            },
            touchEnd: () => {
                if (selectedPlace.value?.id) {
                    pointsSliderRef.value?.handlePointerEnd(selectedPlace.value?.id);
                }
            },
        },
    });
    if (selectedPlace.value) {
        emit('onOpenDetails', {
            id: selectedPlace.value.id,
            name: selectedPlace.value.name,
            coordinates: [selectedPlace.value.address.longitude ?? 0, selectedPlace.value.address.latitude ?? 0],
        });
    }
    let debounceTimer: ReturnType<typeof setTimeout>;
    pointsSlider.value.on('touchEnd', (event) => {
        if (isNaN(event.realIndex)) {
            return;
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (props.points && selectedPlace.value?.id) {
                const currentSlide = document.querySelector('.onboarding-map__info-slider .swiper-slide-active');
                if (!currentSlide) {
                    return;
                }
                const pointId = currentSlide.getAttribute('data-point-id');
                selectedPlace.value = props.points.find((point) => point.id === pointId) ?? null;
                emit('setPoint', selectedPlace.value);
            }
        }, 100);
    });
}

function findLiIndexByDataPointId(id: string) {
    const listItems = Array.from(document.querySelectorAll('.onboarding-map__info-wrapper li[data-point-id]'));
    return listItems.findIndex((li) => li.getAttribute('data-point-id') === id);
}

function setZoom(newVal: number) {
    zoom.value = newVal;
}

function setActiveSlide() {
    if (props.points?.length && selectedPlace.value?.id) {
        const currentPoint = props.points?.find((_point) => _point.id === selectedPlace.value?.id);
        if (currentPoint) {
            const index = findLiIndexByDataPointId(currentPoint.id);
            if (index > -1) {
                pointsSlider.value?.slideTo(index);
            }
        }
    }
}

function searchPoint() {
    const minPoint = findNearestPoint(coordinates.value);
    if (minPoint) {
        city.value = searchCityFromString(minPoint.address.address);
        openMarker(minPoint);
    }
}

function isPointSelected(point: DeliveryPlace) {
    return point.id === selectedPlace.value?.id;
}

function findNearestPoint(location: LngLat) {
    if (!props.points) {
        return false;
    }
    let minPoint: DeliveryPlace | null = null;
    let minPointDistance: number | null = null;
    for (const point of props.points) {
        if (!point.address.latitude || !point.address.longitude) {
            continue;
        }
        const pointLocation: LngLat = [point.address.longitude, point.address.latitude];
        const distance = calculateDistance(location, pointLocation);
        if (!minPoint || (typeof minPointDistance === 'number' && minPointDistance > distance)) {
            minPoint = point;
            minPointDistance = distance;
        }
    }
    if (minPoint && minPoint.address.latitude && minPoint.address.longitude) {
        applicationsStore.setCurrentCoordinates([minPoint.address.longitude, minPoint.address.latitude]);
        return minPoint;
    }
}

watch(
    () => props.isActivePoint,
    async (value) => {
        if (value && pointsSlider.value) {
            await nextTick();
            updateSlideHeights(pointsSlider.value);
        }
    },
    {immediate: true},
);

watch(
    () => props.points,
    async () => {
        await nextTick();
        initSwiperMapPin();
        await nextTick();
        setActiveSlide();
    },
    {immediate: true},
);

watch(
    coordinates,
    async (newCoords) => {
        if (map.value && !isUpdatingFromUserAction.value) {
            await nextTick();
            updateMap({center: newCoords, isDynamicLatOffset: shouldApplyDynamicOffset.value});
            shouldApplyDynamicOffset.value = false;
        }
    },
    {immediate: true},
);

onBeforeUnmount(() => {
    map.value?.destroy();
});

defineExpose({setCoordinates, searchPoint, setSelectedPlace, activeSlideHeight, map, updateMap, setZoom});
</script>

<style>
.ymaps3x0--main-engine-container,
.ymaps3--main-engine-container {
    filter: grayscale(1);
}
.ymaps3x0--default-marker__icon-box,
.ymaps3--default-marker__icon {
    filter: brightness(0%);
}
</style>
