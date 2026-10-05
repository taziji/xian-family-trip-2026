'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { days, mapStops } from './itinerary.mjs';

type Stop = (typeof mapStops)[number];
type StopWithDayOrder = Stop & { orderByDay?: Record<string, number> };
type MapInstance = {
  fitBounds: (bounds: [number, number][], options?: Record<string, unknown>) => void;
  invalidateSize: () => void;
  remove: () => void;
  setView: (center: [number, number], zoom: number, options?: Record<string, unknown>) => void;
};
type Marker = {
  addTo: (layer: LayerGroup) => Marker;
  bindPopup: (content: string) => Marker;
  openPopup: () => void;
};
type LayerGroup = { addTo: (map: MapInstance) => LayerGroup; clearLayers: () => void };
type LeafletApi = {
  map: (element: HTMLElement, options?: Record<string, unknown>) => MapInstance;
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: MapInstance) => void };
  featureGroup: (layers: Marker[]) => LayerGroup;
  marker: (position: [number, number], options: { icon: unknown }) => Marker;
  divIcon: (options: Record<string, unknown>) => unknown;
};
type WindowWithLeaflet = Window & { L?: LeafletApi };

const palette: Record<string, string> = { arrival: 'sand', beilin: 'ink', museum: 'jade', qin: 'clay', food: 'persimmon', departure: 'mist' };

function loadLeaflet() {
  return new Promise<LeafletApi>((resolve, reject) => {
    const leafletWindow = window as WindowWithLeaflet;
    if (leafletWindow.L) return resolve(leafletWindow.L);

    if (!document.querySelector('link[data-trip-leaflet]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      stylesheet.dataset.tripLeaflet = 'true';
      document.head.appendChild(stylesheet);
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-trip-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => leafletWindow.L ? resolve(leafletWindow.L) : reject(new Error('地图资源未能初始化')),{once:true});
      existing.addEventListener('error', () => reject(new Error('地图资源加载失败，请检查网络后重试')), {once:true});
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.dataset.tripLeaflet = 'true';
    script.onload = () => leafletWindow.L ? resolve(leafletWindow.L) : reject(new Error('地图资源未能初始化'));
    script.onerror = () => reject(new Error('地图资源加载失败，请检查网络后重试'));
    document.head.appendChild(script);
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

export default function ItineraryMap() {
  const [activeDay, setActiveDay] = useState('all');
  const [mapApi, setMapApi] = useState<LeafletApi | null>(null);
  const [mapError, setMapError] = useState('');
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapInstance | null>(null);
  const markerGroup = useRef<LayerGroup | null>(null);
  const markerRefs = useRef(new Map<string, Marker>());

  const visibleStops = useMemo(() => activeDay === 'all' ? mapStops : mapStops.filter((stop) => stop.dayIds.includes(activeDay)), [activeDay]);
  const sortedStops = useMemo(() => [...visibleStops].sort((a, b) => {
    if (activeDay !== 'all') return ((a as StopWithDayOrder).orderByDay?.[activeDay] ?? a.order) - ((b as StopWithDayOrder).orderByDay?.[activeDay] ?? b.order);
    const dayA = days.findIndex((day) => day.id === a.dayIds[0]);
    const dayB = days.findIndex((day) => day.id === b.dayIds[0]);
    return dayA - dayB || a.order - b.order;
  }), [activeDay, visibleStops]);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((api) => { if (!cancelled) setMapApi(api); }).catch((error: Error) => { if (!cancelled) setMapError(error.message); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapApi || !mapElement.current || mapInstance.current) return;
    const map = mapApi.map(mapElement.current, { scrollWheelZoom: false, zoomControl: true });
    const markersOnMap = markerRefs.current;
    mapInstance.current = map;
    mapApi.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    markerGroup.current = mapApi.featureGroup([]).addTo(map);
    return () => { map.remove(); mapInstance.current = null; markerGroup.current = null; markersOnMap.clear(); };
  }, [mapApi]);

  useEffect(() => {
    if (!mapApi || !mapInstance.current || !markerGroup.current) return;
    const map = mapInstance.current;
    const group = markerGroup.current;
    group.clearLayers();
    markerRefs.current.clear();
    const markers = visibleStops.map((stop) => {
      const stopDayId = activeDay === 'all' ? stop.dayIds[0] : activeDay;
      const dayIndex = days.findIndex((day) => day.id === stopDayId);
      const dayCode = days[dayIndex]?.date.slice(-2) ?? '';
      const order = (stop as StopWithDayOrder).orderByDay?.[activeDay] ?? stop.order;
      const label = activeDay === 'all' ? (stop.id === 'hotel' ? '住' : `${dayCode}·${stop.order}`) : (stop.id === 'hotel' ? '住' : String(order));
      const icon = mapApi.divIcon({
        className: 'trip-leaflet-icon',
        html: `<span class="trip-map-marker ${palette[stop.dayIds[0]] ?? 'ink'}">${label}</span>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -19]
      });
      const navigationUrl = `https://uri.amap.com/navigation?to=${stop.lng},${stop.lat},${encodeURIComponent(stop.name)}&mode=car&coordinate=wgs84&callnative=0`;
      const popup = `<div class="map-popup"><small>${escapeHtml(stop.category)}</small><strong>${escapeHtml(stop.name)}</strong><a href="${navigationUrl}" target="_blank" rel="noreferrer">导航到这里 ↗</a></div>`;
      const marker = mapApi.marker([stop.lat, stop.lng], { icon }).bindPopup(popup).addTo(group);
      markerRefs.current.set(stop.id, marker);
      return [stop.lat, stop.lng] as [number, number];
    });
    map.invalidateSize();
    if (markers.length === 1) map.setView(markers[0], 15, { animate: true });
    else if (markers.length) map.fitBounds(markers, { padding: [36, 36], maxZoom: activeDay === 'all' ? 11 : 15, animate: true });
  }, [activeDay, mapApi, visibleStops]);

  const focusStop = (stop: Stop) => {
    mapInstance.current?.setView([stop.lat, stop.lng], 16, { animate: true });
    markerRefs.current.get(stop.id)?.openPopup();
  };

  return <section className="map-section" id="map">
    <div className="section-heading"><p className="eyebrow">THE MAP</p><h2>把长安，放到地图上</h2><p>按日期筛选地点；点地图标记或下方地名，可查看位置并一键导航。</p></div>
    <div className="map-day-tabs" role="group" aria-label="筛选地图日期">
      <button className={activeDay === 'all' ? 'active' : ''} aria-pressed={activeDay === 'all'} onClick={() => setActiveDay('all')}>全程</button>
      {days.filter((day) => day.id !== 'departure').map((day) => <button key={day.id} className={activeDay === day.id ? 'active' : ''} aria-pressed={activeDay === day.id} onClick={() => setActiveDay(day.id)}><span>{day.date}</span><small>{day.weekday}</small></button>)}
    </div>
    <div className="map-frame">
      <div ref={mapElement} className="leaflet-map" role="application" aria-label="西安行程互动地图" />
      {!mapApi && !mapError && <div className="map-loading">正在载入地图…</div>}
      {mapError && <div className="map-loading map-error">{mapError}<br/><a href={`https://uri.amap.com/search?query=${encodeURIComponent('西安永宁门大景城堡酒店')}`} target="_blank" rel="noreferrer">在高德地图打开行程地点 ↗</a></div>}
    </div>
    <div className="map-location-list" aria-live="polite">
      {sortedStops.map((stop) => {
        const day = days.find((item) => item.id === stop.dayIds[0]);
        return <button key={stop.id} onClick={() => focusStop(stop)}><span className={`map-list-dot ${palette[stop.dayIds[0]] ?? 'ink'}`}>{stop.id === 'hotel' ? '住' : activeDay === 'all' ? (day?.date.slice(-2) ?? '') : (stop as StopWithDayOrder).orderByDay?.[activeDay] ?? stop.order}</span><span><strong>{stop.name}</strong><small>{stop.category}{activeDay === 'all' && day ? ` · ${day.date}` : ''}</small></span><span className="map-list-arrow">↗</span></button>;
      })}
    </div>
    <p className="map-note">地图点位为行程定位参考；具体入口、交通和开放信息请以景区当天公告为准。</p>
  </section>;
}
