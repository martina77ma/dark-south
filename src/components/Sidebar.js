"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Sidebar({ node, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsLightboxOpen(false);
  }, [node]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    }

    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  if (!node) return null;

  const hasImages = Array.isArray(node.images) && node.images.length > 0;
  const hasMultipleImages = hasImages && node.images.length > 1;

  const titleStyle = {
    margin: 0,
    fontSize: "26px",
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1.15,
    paddingRight: "12px",
    fontFamily: "Inter, sans-serif"
  };

  const descriptionStyle = {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#1f2937",
    fontFamily: "Inter, sans-serif"
  };

  const sectionWrapStyle = {
    marginBottom: "22px"
  };

  const sectionTitleStyle = {
    fontSize: "13px",
    fontWeight: 700,
    color: "#6b7280",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    margin: 0,
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
    fontFamily: "Inter, sans-serif"
  };

  const primaryValueStyle = {
    margin: "12px 0 6px 0",
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#111827",
    fontWeight: 600,
    fontFamily: "Inter, sans-serif"
  };

  const secondaryValueStyle = {
    margin: "0 0 4px 0",
    fontSize: "15px",
    lineHeight: 1.5,
    color: "#374151",
    fontFamily: "Inter, sans-serif"
  };

  const keywordsWrapStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  };

  const keywordStyle = {
    fontSize: "12px",
    color: "#6b7280",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    padding: "4px 8px",
    fontFamily: "Inter, sans-serif"
  };

  function showPrevImage() {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? node.images.length - 1 : prev - 1
    );
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) =>
      prev === node.images.length - 1 ? 0 : prev + 1
    );
  }

  const lightbox =
    mounted && isLightboxOpen && hasImages
      ? createPortal(
          <div
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.86)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px"
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  border: "none",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: "999px",
                  width: "42px",
                  height: "42px",
                  cursor: "pointer",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2
                }}
                aria-label="Chiudi immagine"
                title="Chiudi immagine"
              >
                ✕
              </button>

              {hasMultipleImages && (
                <button
                  onClick={showPrevImage}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: "999px",
                    width: "46px",
                    height: "46px",
                    cursor: "pointer",
                    fontSize: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2
                  }}
                  aria-label="Immagine precedente"
                  title="Immagine precedente"
                >
                  ‹
                </button>
              )}

              <img
                src={node.images[currentImageIndex]}
                alt={`${node.label} ${currentImageIndex + 1}`}
                style={{
                  maxWidth: "min(92vw, 1400px)",
                  maxHeight: "88vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "12px",
                  display: "block",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.35)"
                }}
              />

              {hasMultipleImages && (
                <button
                  onClick={showNextImage}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: "999px",
                    width: "46px",
                    height: "46px",
                    cursor: "pointer",
                    fontSize: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2
                  }}
                  aria-label="Immagine successiva"
                  title="Immagine successiva"
                >
                  ›
                </button>
              )}

              {hasMultipleImages && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "8px",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(6px)",
                    padding: "8px 12px",
                    borderRadius: "999px"
                  }}
                >
                  {node.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "999px",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        background:
                          index === currentImageIndex
                            ? "#ffffff"
                            : "rgba(255,255,255,0.4)"
                      }}
                      aria-label={`Vai all'immagine ${index + 1}`}
                      title={`Vai all'immagine ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div style={{ padding: 0, height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 2
          }}
        >
          <h2 style={titleStyle}>{node.label}</h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f3f4f6",
              borderRadius: "10px",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
            aria-label="Chiudi"
            title="Chiudi"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {hasImages && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "14px",
                  overflow: "hidden",
                  background: "#f3f4f6"
                }}
              >
                <img
                  src={node.images[currentImageIndex]}
                  alt={`${node.label} ${currentImageIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block"
                  }}
                />

                <button
                  onClick={() => setIsLightboxOpen(true)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    border: "none",
                    background: "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "999px",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px"
                  }}
                  aria-label="Ingrandisci immagine"
                  title="Ingrandisci immagine"
                >
                  ⤢
                </button>

                {hasMultipleImages && (
                  <>
                    <button
                      onClick={showPrevImage}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "10px",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "rgba(255,255,255,0.72)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "999px",
                        width: "34px",
                        height: "34px",
                        cursor: "pointer",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      aria-label="Immagine precedente"
                      title="Immagine precedente"
                    >
                      ‹
                    </button>

                    <button
                      onClick={showNextImage}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "10px",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "rgba(255,255,255,0.72)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "999px",
                        width: "34px",
                        height: "34px",
                        cursor: "pointer",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      aria-label="Immagine successiva"
                      title="Immagine successiva"
                    >
                      ›
                    </button>

                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: "6px",
                        background: "rgba(17,24,39,0.45)",
                        padding: "6px 10px",
                        borderRadius: "999px"
                      }}
                    >
                      {node.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "999px",
                            border: "none",
                            cursor: "pointer",
                            background:
                              index === currentImageIndex
                                ? "#ffffff"
                                : "rgba(255,255,255,0.45)",
                            padding: 0
                          }}
                          aria-label={`Vai all'immagine ${index + 1}`}
                          title={`Vai all'immagine ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {node.description && (
            <div style={{ marginBottom: "28px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  lineHeight: 1.7,
                  color: "#1f2937",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                {node.description}
              </p>
            </div>
          )}

          {node.tutela && (
  <div
    style={{
      marginTop: "20px",
      marginBottom: "1",
      paddingTop: "16px",
      borderTop: "1px solid #e5e7eb"
    }}
  >
    <h3
      style={{
        margin: "0 0 6px 0",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "var(--font-inter)",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        color: "#6b7280"
      }}
    >
      Tutela
    </h3>

    <p
      style={{
        margin: 0,
        fontSize: "15px",
        lineHeight: 1.6,
        fontFamily: "var(--font-inter)",
        color: "#111827"
      }}
    >
      {node.tutela}
    </p>
  </div>
)}

          {(node.eventSubcategory || node.eventDetail) && (
            <div style={{
              marginTop: "22px",
              marginBottom: "22px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: 0,
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e5e7eb",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                Evento
              </h3>

              {node.eventSubcategory && (
                <p
                  style={{
                    margin: "12px 0 6px 0",
                    fontSize: "16px",
                    lineHeight: 1.5,
                    color: "#111827",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.eventSubcategory}
                </p>
              )}

              {node.eventDetail && (
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.eventDetail}
                </p>
              )}
            </div>
          )}

          {(node.placeCategory || node.place) && (
            <div style={{ marginBottom: "22px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: 0,
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e5e7eb",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                Luogo
              </h3>

              {node.placeCategory && (
                <p
                  style={{
                    margin: "12px 0 6px 0",
                    fontSize: "16px",
                    lineHeight: 1.5,
                    color: "#111827",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.placeCategory}
                </p>
              )}

              {node.place && (
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.place}
                </p>
              )}
            </div>
          )}

          {(node.traceCategory || node.traceSubcategory) && (
            <div style={{ marginBottom: "22px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: 0,
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e5e7eb",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                Tipo di traccia
              </h3>

              {node.traceCategory && (
                <p
                  style={{
                    margin: "12px 0 6px 0",
                    fontSize: "16px",
                    lineHeight: 1.5,
                    color: "#111827",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.traceCategory}
                </p>
              )}

              {node.traceSubcategory && (
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.traceSubcategory}
                </p>
              )}
            </div>
          )}

          {(node.communityCategory || node.communitySubcategory) && (
            <div style={{ marginBottom: "22px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: 0,
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e5e7eb",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                Comunità
              </h3>

              {node.communityCategory && (
                <p
                  style={{
                    margin: "12px 0 6px 0",
                    fontSize: "16px",
                    lineHeight: 1.5,
                    color: "#111827",
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.communityCategory}
                </p>
              )}

              {node.communitySubcategory && (
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  {node.communitySubcategory}
                </p>
              )}
            </div>
          )}

          {Array.isArray(node.keywords) && node.keywords.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px"
                }}
              >
                {node.keywords.map((word, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "999px",
                      padding: "4px 8px",
                      fontFamily: "Inter, sans-serif"
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {node.other && node.other !== "-" && (
            <div style={{ marginBottom: "22px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  margin: 0,
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e5e7eb",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                Altro
              </h3>

              <p
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: "#374151",
                  fontFamily: "Inter, sans-serif"
                }}
              >
                {node.other}
              </p>
            </div>
          )}
        </div>
      </div>

      {lightbox}
    </>
  );
}