"use client";

import { useEffect, useMemo, useState } from "react";
import GraphView from "../components/GraphView";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [eventSubcategory, setEventSubcategory] = useState("");
  const [eventDetail, setEventDetail] = useState("");

  const [placeCategory, setPlaceCategory] = useState("");

  const [traceCategory, setTraceCategory] = useState("");
  const [traceSubcategory, setTraceSubcategory] = useState("");

  const [communitySubcategory, setCommunitySubcategory] = useState("");

  useEffect(() => {
    fetch("/data/graph.json")
      .then((res) => res.json())
      .then((data) => {
        const nodes = data.nodes.map((n) => ({ data: n }));
        const edges = data.edges.map((e, i) => ({
          data: { id: "e" + i, ...e }
        }));
        setElements([...nodes, ...edges]);
      });
  }, []);

  const nodesOnly = useMemo(() => {
    return elements.filter((el) => !el.data.source).map((el) => el.data);
  }, [elements]);

  const eventSubcategories = useMemo(() => {
    return [...new Set(nodesOnly.map((n) => n.eventSubcategory).filter(Boolean))].sort();
  }, [nodesOnly]);

  const eventDetails = useMemo(() => {
    return [
      ...new Set(
        nodesOnly
          .filter((n) => !eventSubcategory || n.eventSubcategory === eventSubcategory)
          .map((n) => n.eventDetail)
          .filter(Boolean)
      )
    ].sort();
  }, [nodesOnly, eventSubcategory]);

  const placeCategories = useMemo(() => {
    return [...new Set(nodesOnly.map((n) => n.placeCategory).filter(Boolean))].sort();
  }, [nodesOnly]);

  const traceCategories = useMemo(() => {
    return [
      ...new Set(
        nodesOnly
          .map((n) => n.traceCategory)
          .filter((value) => value && value !== "Tracce")
      )
    ].sort();
  }, [nodesOnly]);

  const traceSubcategories = useMemo(() => {
    return [
      ...new Set(
        nodesOnly
          .filter((n) => !traceCategory || n.traceCategory === traceCategory)
          .map((n) => n.traceSubcategory)
          .filter(Boolean)
      )
    ].sort();
  }, [nodesOnly, traceCategory]);

  const communityOptions = useMemo(() => {
    return [
      ...new Set(nodesOnly.map((n) => n.communitySubcategory).filter(Boolean))
    ].sort();
  }, [nodesOnly]);

  function resetControls() {
    setSearchTerm("");

    setEventSubcategory("");
    setEventDetail("");

    setPlaceCategory("");

    setTraceCategory("");
    setTraceSubcategory("");

    setCommunitySubcategory("");
  }

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
          flexShrink: 0
        }}
      >
        <h1
  style={{
    margin: 0,
    fontSize: "32px",
    fontWeight: 600,
    fontFamily: "Poppins, sans-serif",
    color: "#111827"
  }}
>
  DARK SOUTH
</h1>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0
        }}
      >
<div
  style={{
    width: filtersOpen ? "280px" : "48px",
    borderRight: "1px solid #e5e7eb",
    background: "#ffffff",
    overflow: "hidden",
    flexShrink: 0,
    transition: "width 0.28s ease"
  }}
>
  <div
    style={{
      height: "100%",
      padding: filtersOpen ? "16px" : "16px 10px",
      boxSizing: "border-box",
      transition: "padding 0.28s ease"
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: filtersOpen ? "space-between" : "center",
        marginBottom: filtersOpen ? "16px" : "0",
        transition: "all 0.28s ease"
      }}
    >
      {filtersOpen ? (
        <>
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "Poppins, sans-serif",
              color: "#111827",
              opacity: filtersOpen ? 1 : 0,
              transition: "opacity 0.2s ease"
            }}
           >
             Filtri
          </h2>

          <button
            onClick={() => setFiltersOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              borderRadius: "10px",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "18px",
              fontFamily: "Poppins, sans-serif",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Chiudi filtri"
            title="Chiudi filtri"
          >
            ‹
          </button>
        </>
      ) : (
        <button
          onClick={() => setFiltersOpen(true)}
          style={{
            border: "1px solid #d1d5db",
            background: "#ffffff",
            borderRadius: "12px",
            width: "42px",
            height: "42px",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label="Apri filtri"
          title="Apri filtri"
        >
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="11"
      cy="11"
      r="6.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 16L21 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</button>
      )}
    </div>

    <div
      style={{
        opacity: filtersOpen ? 1 : 0,
        pointerEvents: filtersOpen ? "auto" : "none",
        transition: "opacity 0.18s ease",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label
          htmlFor="search"
          style={{
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: "Poppins, sans-serif",
          color: "#111827"
        }}
      >
        Cerca
      </label>
        

        <input
          id="search"
          type="text"
          placeholder="Scrivi una parola chiave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827",
            boxSizing: "border-box"
          }}
        />

        <button
          onClick={resetControls}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: "10px",
            background: "#111827",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            textAlign: "center"
          }}
        >
          Reset filtri
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <strong
          style={{
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Poppins, sans-serif",
            color: "#111827"
          }}
        >
          Eventi
        </strong>

        <select
          value={eventSubcategory}
          onChange={(e) => {
            setEventSubcategory(e.target.value);
            setEventDetail("");
          }}
          style={{
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827"
          }}
        >
          <option value="">Tutte</option>
          {eventSubcategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={eventDetail}
          onChange={(e) => setEventDetail(e.target.value)}
          disabled={!eventSubcategory}
          style={{
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827",
          }}
        >
          <option value="">Tutte</option>
          {eventDetails.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <strong
          style={{
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Poppins, sans-serif",
            color: "#111827"
          }}
        >
          Luoghi
        </strong>

        <select
          value={placeCategory}
          onChange={(e) => setPlaceCategory(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827"
          }}
        >
          <option value="">Tutte</option>
          {placeCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <strong
          style={{
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Poppins, sans-serif",
            color: "#111827"
          }}
        >
          Tipo di traccia
        </strong>

        <select
          value={traceCategory}
          onChange={(e) => {
            setTraceCategory(e.target.value);
            setTraceSubcategory("");
          }}
          style={{
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827"
          }}
        >
          <option value="">Tutte</option>
          {traceCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={traceSubcategory}
          onChange={(e) => setTraceSubcategory(e.target.value)}
          disabled={!traceCategory}
          style={{
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827"
          }}
        >
          <option value="">Tutte</option>
          {traceSubcategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <strong
          style={{
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Poppins, sans-serif",
            color: "#111827"
          }}
        >
          Comunità
        </strong>

        <select
          value={communitySubcategory}
          onChange={(e) => setCommunitySubcategory(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#111827"
          }}
        >
          <option value="">Tutte</option>
          {communityOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
</div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0
          }}
        >
          <GraphView
            elements={elements}
            onNodeSelect={setSelected}
            searchTerm={searchTerm}
            eventSubcategory={eventSubcategory}
            eventDetail={eventDetail}
            placeCategory={placeCategory}
            traceCategory={traceCategory}
            traceSubcategory={traceSubcategory}
            communitySubcategory={communitySubcategory}
          />
        </div>

<div
  style={{
    width: selected ? "640px" : "0px",
    borderLeft: selected ? "1px solid #e5e7eb" : "none",
    overflow: "hidden",
    background: "#ffffff",
    flexShrink: 0,
    transition: "width 0.35s ease"
  }}
>
  <div
  style={{
    opacity: selected ? 1 : 0,
    transition: "opacity 0.25s ease",
    height: "100%",
    overflowY: "auto"
  }}
>
    <Sidebar node={selected} onClose={() => setSelected(null)} />
  </div>
</div>
      </div>
    </main>
  );
}