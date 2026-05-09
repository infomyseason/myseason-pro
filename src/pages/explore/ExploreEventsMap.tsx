import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import type { MockRaceDetail } from "../../data"
import { EUROPE_FLAG_BY_CODE } from "../../data/europeanCountries"
import { SPORT_STYLES, sportKeyFromLabel } from "../../components/sportTokens"
import { formatRaceDateLabel } from "./exploreFilters"
import { getRaceMapCoordinates } from "./exploreRaceCoordinates"

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function escapeImgSrc(url: string): string {
  return url.replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function photoMarkerIcon(race: MockRaceDetail): L.DivIcon {
  const src = escapeImgSrc(race.image)
  return L.divIcon({
    className: "explore-map-photo-marker-wrap",
    html: `<div class="explore-map-photo-marker" aria-hidden="true"><img src="${src}" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -48],
  })
}

function FitMapToMarkers({ positions }: { positions: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0) {
      map.setView([54.5, 15.5], 4)
      return
    }
    if (positions.length === 1) {
      map.setView(positions[0], 9)
      return
    }
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [52, 52], maxZoom: 8 })
  }, [map, positions])

  return null
}

export function ExploreEventsMap({ races }: { races: MockRaceDetail[] }) {
  const plotted = useMemo(() => {
    return races
      .map((race) => {
        const pos = getRaceMapCoordinates(race)
        if (!pos) return null
        return {
          race,
          position: [pos.lat, pos.lng] as [number, number],
        }
      })
      .filter((row): row is { race: MockRaceDetail; position: [number, number] } => row !== null)
  }, [races])

  const positions = useMemo(() => plotted.map((p) => p.position), [plotted])

  return (
    <div className="explore-leaflet-shell relative mb-8 h-[min(52vh,420px)] min-h-[280px] overflow-hidden rounded-3xl border border-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <MapContainer
        center={[54.5, 15.5]}
        zoom={4}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom
        worldCopyJump
        className="z-0 h-full w-full bg-[#090b10]"
        attributionControl
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        <ZoomControl position="topright" />
        <FitMapToMarkers positions={positions} />

        {plotted.map(({ race, position }) => {
          const sk = sportKeyFromLabel(race.sport)
          const sport = SPORT_STYLES[sk]
          const flag = EUROPE_FLAG_BY_CODE[race.countryCode] ?? "🏁"

          return (
            <Marker key={race.id} position={position} icon={photoMarkerIcon(race)}>
              <Popup maxWidth={280}>
                <div className="explore-map-popup-inner space-y-2 text-[13px] text-foreground">
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <img src={race.image} alt="" className="h-[88px] w-full object-cover" />
                  </div>
                  <span
                    className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white"
                    style={{ backgroundColor: sport.hex }}
                  >
                    {sport.emoji} {sport.label}
                  </span>
                  <h3 className="text-[15px] font-black leading-snug tracking-tight">{race.title}</h3>
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{flag}</span>
                    <span>
                      {race.city}, {race.country}
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-primary/95">{formatRaceDateLabel(race.date)}</p>
                  <Link
                    to={`/race/${race.id}`}
                    className="mt-1 inline-flex w-full justify-center rounded-lg bg-primary py-2 text-center text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    View event
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-4 z-[400] flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white/85 backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden="true" />
        Europe · scroll to zoom · {plotted.length} {plotted.length === 1 ? "event" : "events"}
      </div>

      {plotted.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-[300] flex items-center justify-center bg-background/55 backdrop-blur-[2px]">
          <p className="rounded-xl border border-border/45 bg-secondary/80 px-4 py-2 text-sm font-semibold text-muted-foreground">
            No mappable events in this list.
          </p>
        </div>
      ) : null}
    </div>
  )
}
