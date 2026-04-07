"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 12px;
      height: 12px;
      background: #111827;
      border: 2px solid #ffffff;
      border-radius: 999px;
      box-shadow: 0 0 0 2px rgba(17,24,39,0.10);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

function MapControls({ lat, lng, mode, setMode }) {
  const map = useMap();

  const googleMapsUrl = useMemo(() => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }, [lat, lng]);

  const buttonBase = {
    height: "30px",
    minWidth: "30px",
    padding: "0 10px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.72)",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(4px)",
    color: "#111827",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "Inter, sans-serif",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap"
  };

  const activeModeStyle = {
    background: "#111827",
    color: "#ffffff",
    border: "1px solid #111827"
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        justifyContent: "flex-end",
        maxWidth: "calc(100% - 20px)"
      }}
    >
      <button
        onClick={() => map.zoomOut()}
        style={{
          ...buttonBase,
          width: "30px",
          padding: 0,
          fontSize: "16px"
        }}
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>

      <button
        onClick={() => map.zoomIn()}
        style={{
          ...buttonBase,
          width: "30px",
          padding: 0,
          fontSize: "16px"
        }}
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>

      <button
        onClick={() => setMode("map")}
        style={{
          ...buttonBase,
          ...(mode === "map" ? activeModeStyle : {})
        }}
        aria-label="Vista mappa"
        title="Vista mappa"
      >
        Mappa
      </button>

      <button
        onClick={() => setMode("satellite")}
        style={{
          ...buttonBase,
          ...(mode === "satellite" ? activeModeStyle : {})
        }}
        aria-label="Vista satellitare"
        title="Vista satellitare"
      >
        Satellite
      </button>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBase,
          textDecoration: "none"
        }}
        aria-label="Apri in Google Maps"
        title="Apri in Google Maps"
      >
        Google Maps
      </a>
    </div>
  );
}

export default function LocationMap({ lat, lng }) {
  const [mode, setMode] = useState("satellite");

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  const tileUrl =
    mode === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution =
    mode === "satellite"
      ? '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      : "&copy; OpenStreetMap contributors";

  return (
    <div
      style={{
        marginTop: "12px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        position: "relative"
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={false}
        attributionControl={true}
        style={{
          width: "100%",
          height: "240px"
        }}
      >
        <TileLayer attribution={attribution} url={tileUrl} />
        <Marker position={[lat, lng]} icon={markerIcon} />
        <MapControls lat={lat} lng={lng} mode={mode} setMode={setMode} />
      </MapContainer>
    </div>
  );
}