import React, { useCallback, useMemo, useRef, useState } from 'react'
import { BriefcaseBusiness, GraduationCap, LocateFixed, Minus, Plus, Zap } from 'lucide-react'

const HOME_COORDS = { lat: 15.4909, lng: 73.8278 }
const MIN_ZOOM = 1
const MAX_ZOOM = 2.2
const ZOOM_STEP = 0.4
const DEFAULT_ZOOM = 1.15
const markerIcon = { College: GraduationCap, Job: BriefcaseBusiness, Internship: Zap }
const markerClass = { College: 'marker-college', Job: 'marker-job', Internship: 'marker-internship' }

function getBounds(items) {
  const lats = [HOME_COORDS.lat, ...items.map((item) => item.coordinates?.lat).filter(Boolean)]
  const lngs = [HOME_COORDS.lng, ...items.map((item) => item.coordinates?.lng).filter(Boolean)]
  const pad = 0.018
  return { minLat: Math.min(...lats) - pad, maxLat: Math.max(...lats) + pad, minLng: Math.min(...lngs) - pad, maxLng: Math.max(...lngs) + pad }
}

function project(coordinates, bounds, index) {
  if (!coordinates) return { left: `${18 + (index * 19) % 68}%`, top: `${18 + (index * 23) % 60}%` }
  const latSpan = bounds.maxLat - bounds.minLat || 1
  const lngSpan = bounds.maxLng - bounds.minLng || 1
  return { left: `${8 + ((coordinates.lng - bounds.minLng) / lngSpan) * 82}%`, top: `${10 + (1 - (coordinates.lat - bounds.minLat) / latSpan) * 74}%` }
}

export default function MapCanvas({ items = [], profile, onSelect, selectedId, zoomable = false }) {
  const bounds = useMemo(() => getBounds(items), [items])
  const home = useMemo(() => project(HOME_COORDS, bounds, -1), [bounds])
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const viewportRef = useRef(null)
  const clampPan = useCallback((x, y, currentZoom) => {
    const maxOffset = (currentZoom - 1) * 190
    return { x: Math.max(-maxOffset, Math.min(maxOffset, x)), y: Math.max(-maxOffset, Math.min(maxOffset, y)) }
  }, [])
  const zoomTo = (next) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(next.toFixed(2))))
    setZoom(clamped)
    setPan((current) => clampPan(current.x, current.y, clamped))
  }
  const recenter = () => { setZoom(DEFAULT_ZOOM); setPan({ x: 0, y: 0 }) }
  const handlePointerDown = (event) => {
    if (!zoomable || zoom <= MIN_ZOOM || event.target.closest('.large-marker, .map-zoom-controls')) return
    drag.current = { active: true, moved: false, startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y }
    viewportRef.current?.setPointerCapture?.(event.pointerId)
  }
  const handlePointerMove = (event) => {
    if (!drag.current.active) return
    const dx = event.clientX - drag.current.startX
    const dy = event.clientY - drag.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true
    setPan(clampPan(drag.current.originX + dx, drag.current.originY + dy, zoom))
  }
  const canPan = zoomable && zoom > MIN_ZOOM
  return <>
    <div className={`map-viewport ${zoomable ? 'is-zoomable' : ''} ${canPan ? 'is-pannable' : ''}`} ref={viewportRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => { drag.current.active = false }} onPointerLeave={() => { drag.current.active = false }} onPointerCancel={() => { drag.current.active = false }}>
      <div className="map-scene" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        <div className="large-map">
          <span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" />
          <span className="map-area-label area-panaji">PANAJI</span><span className="map-area-label area-porvorim">PORVORIM</span>
          {items.map((item, index) => {
            const Icon = markerIcon[item.type] || GraduationCap
            const selected = selectedId === item.id
            return <button key={item.id} type="button" className={`large-marker ${markerClass[item.type] || ''} ${selected ? 'selected' : ''}`} style={project(item.coordinates, bounds, index)} onClick={() => !drag.current.moved && onSelect?.(item)} aria-label={`${item.type}: ${item.title || item.name}`} aria-pressed={selected}><Icon size={14} strokeWidth={2.4} /></button>
          })}
          <div className="home-marker" style={{ left: home.left, top: home.top }} aria-hidden="true"><span className="home-marker-pulse" /><span className="home-marker-dot" /></div>
        </div>
      </div>
      <div className="you-are-here"><span /> {profile?.location || 'Panaji, Goa'}</div>
    </div>
    {zoomable && <div className="map-zoom-controls" role="group" aria-label="Map zoom controls"><button type="button" onClick={() => zoomTo(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in"><Plus size={16} /></button><button type="button" onClick={() => zoomTo(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out"><Minus size={16} /></button><button type="button" onClick={recenter} aria-label="Recenter map"><LocateFixed size={15} /></button></div>}
  </>
}
