"use client";

import { useEffect, useMemo, useState } from "react";
import GraphView from "../components/GraphView";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

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

  const controlStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 300,
  fontFamily: "var(--font-inter)",
  color: "#111827",
  background: "#ffffff",
  boxSizing: "border-box",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none"
};

const filterSectionTitleStyle = {
  fontSize: "12px",
  fontWeight: 500,
  fontFamily: "var(--font-inter)",
  letterSpacing: "0.02em",
  color: "#6b7280",
  textTransform: "uppercase"
};

const selectWrapperStyle = {
  position: "relative"
};

const selectArrowStyle = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  fontSize: "12px",
  color: "#6b7280"
};

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
          padding: "18px 20px 16px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
          flexShrink: 0
        }}
      >
        <h1
  style={{
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    fontFamily: "var(--font-grotesk)",
    letterSpacing: "-0.04em",
    lineHeight: 1,
    color: "#111827",
    textTransform: "uppercase"
  }}
>
  Dark South
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
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-grotesk)",
              letterSpacing: "-0.01em",
              color: "#374151",
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
              fontFamily: "var(--font-grotesk)",
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
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px"
    }}
  >
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

    <button
      onClick={() => setModalType("legend")}
      style={{
        border: "1px solid #d1d5db",
        background: "#ffffff",
        borderRadius: "12px",
        width: "42px",
        height: "42px",
        cursor: "pointer",
        fontSize: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-grotesk)",
        color: "#111827"
      }}
      aria-label="Apri legenda"
      title="Apri legenda"
    >
      +
    </button>

    <button
      onClick={() => setModalType("info")}
      style={{
        border: "1px solid #d1d5db",
        background: "#ffffff",
        borderRadius: "12px",
        width: "42px",
        height: "42px",
        cursor: "pointer",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-grotesk)",
        fontWeight: 600,
        color: "#111827"
      }}
      aria-label="Apri informazioni sul progetto"
      title="Apri informazioni sul progetto"
    >
      i
    </button>
  </div>
)}
    </div>

    <div
  style={{
    opacity: filtersOpen ? 1 : 0,
    pointerEvents: filtersOpen ? "auto" : "none",
    transition: "opacity 0.18s ease",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  }}
>
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <label
      htmlFor="search"
      style={{
        fontSize: "14px",
        fontWeight: 500,
        fontFamily: "var(--font-grotesk)",
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
      style={controlStyle}
    />

    <button
  onClick={resetControls}
  style={{
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "var(--font-inter)",
    textAlign: "center",
    transition: "all 0.2s ease"
  }}
>
  Reset filtri
</button>
  </div>

  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <strong style={filterSectionTitleStyle}>Eventi</strong>

    <div style={selectWrapperStyle}>
      <select
        value={eventSubcategory}
        onChange={(e) => {
          setEventSubcategory(e.target.value);
          setEventDetail("");
        }}
        style={controlStyle}
      >
        <option value="">Tutte</option>
        {eventSubcategories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span style={selectArrowStyle}>▾</span>
    </div>

    <div style={selectWrapperStyle}>
      <select
        value={eventDetail}
        onChange={(e) => setEventDetail(e.target.value)}
        disabled={!eventSubcategory}
        style={controlStyle}
      >
        <option value="">Tutte</option>
        {eventDetails.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span style={selectArrowStyle}>▾</span>
    </div>
  </div>

  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <strong style={filterSectionTitleStyle}>Luoghi</strong>

    <div style={selectWrapperStyle}>
      <select
        value={placeCategory}
        onChange={(e) => setPlaceCategory(e.target.value)}
        style={controlStyle}
      >
        <option value="">Tutte</option>
        {placeCategories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span style={selectArrowStyle}>▾</span>
    </div>
  </div>

  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <strong style={filterSectionTitleStyle}>Tipo di traccia</strong>

    <div style={selectWrapperStyle}>
      <select
        value={traceCategory}
        onChange={(e) => {
          setTraceCategory(e.target.value);
          setTraceSubcategory("");
        }}
        style={controlStyle}
      >
        <option value="">Tutte</option>
        {traceCategories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span style={selectArrowStyle}>▾</span>
    </div>

    <div style={selectWrapperStyle}>
      <select
        value={traceSubcategory}
        onChange={(e) => setTraceSubcategory(e.target.value)}
        disabled={!traceCategory}
        style={controlStyle}
      >
        <option value="">Tutte</option>
        {traceSubcategories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span style={selectArrowStyle}>▾</span>
    </div>
  </div>

  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <strong style={filterSectionTitleStyle}>Comunità</strong>

    <div style={selectWrapperStyle}>
      <select
        value={communitySubcategory}
        onChange={(e) => setCommunitySubcategory(e.target.value)}
        style={controlStyle}
      >
        <option value="">Tutte</option>
        {communityOptions.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span style={selectArrowStyle}>▾</span>
    </div>
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

{modalType && (
  <div
    onClick={() => setModalType(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(17, 24, 39, 0.30)",
      backdropFilter: "blur(3px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "24px"
    }}
  >
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    width: "min(1200px, 94vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    padding: "15px",
    position: "relative"
  }}
>
      <button
        onClick={() => setModalType(null)}
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          border: "none",
          background: "rgba(255,255,255,0.9)",
          cursor: "pointer",
          fontSize: "22px",
          lineHeight: 1,
          color: "#6b7280",
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        aria-label="Chiudi"
        title="Chiudi"
      >
        ✕
      </button>

      {modalType === "legend" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <img
            src="/images/legenda.png"
            alt="Legenda"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      )}

      {modalType === "info" && (
        <div
          style={{
            fontFamily: "var(--font-inter)",
            color: "#111827"
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "var(--font-grotesk)"
            }}
          >
            Informazioni sul progetto
          </h2>

          <p style={{ margin: "0 0 14px 0", fontSize: "15px", lineHeight: 1.7 }}>
            Da inserire
          </p>

          <p style={{ margin: "0 0 14px 0", fontSize: "15px", lineHeight: 1.7 }}>
            info prog
          </p>

          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7 }}>
            info prog
          </p>
        </div>
      )}
    </div>
  </div>
)}
    </main>
  );
}