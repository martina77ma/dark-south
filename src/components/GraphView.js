"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function GraphView({
  elements,
  onNodeSelect,
  searchTerm,
  eventSubcategory,
  eventDetail,
  placeCategory,
  traceCategory,
  traceSubcategory,
  communitySubcategory,
  onReady,
  sidebarOpen,
  sidebarWidth
}) {
  const ref = useRef(null);
  const cyRef = useRef(null);
  const layoutPositionsRef = useRef(null);
  const baseSizeRef = useRef(null);
  const graphFrameRef = useRef(null);
  const sidebarOpenRef = useRef(sidebarOpen);
  const sidebarWidthRef = useRef(sidebarWidth);
  const searchTermRef = useRef(searchTerm);
  const eventSubcategoryRef = useRef(eventSubcategory);
  const eventDetailRef = useRef(eventDetail);
  const placeCategoryRef = useRef(placeCategory);
  const traceCategoryRef = useRef(traceCategory);
  const traceSubcategoryRef = useRef(traceSubcategory);
  const communitySubcategoryRef = useRef(communitySubcategory);

  useEffect(() => {
  sidebarOpenRef.current = sidebarOpen;
  sidebarWidthRef.current = sidebarWidth;

  searchTermRef.current = searchTerm;
  eventSubcategoryRef.current = eventSubcategory;
  eventDetailRef.current = eventDetail;
  placeCategoryRef.current = placeCategory;
  traceCategoryRef.current = traceCategory;
  traceSubcategoryRef.current = traceSubcategory;
  communitySubcategoryRef.current = communitySubcategory;
}, [
  sidebarOpen,
  sidebarWidth,
  searchTerm,
  eventSubcategory,
  eventDetail,
  placeCategory,
  traceCategory,
  traceSubcategory,
  communitySubcategory
]);

  useEffect(() => {
    if (!elements.length || !ref.current) return;

    if (!baseSizeRef.current) {
     baseSizeRef.current = {
       width: graphFrameRef.current?.clientWidth || 1400,
       height: graphFrameRef.current?.clientHeight || 900
    };
  }

  const containerWidth = baseSizeRef.current.width;
  const containerHeight = baseSizeRef.current.height;

    function getVisualSize(nodeData) {
      const label = nodeData.label;
      const size = Number(nodeData.size);

      const isRegionNode = [
        "Calabria",
        "Campania",
        "Puglia",
        "Sicilia",
        "Basilicata"
      ].includes(label);

      if (isRegionNode) return 32;
      if (size === 75) return 120;
      if (size === 45) return 60;
      if (size === 25) return 32;
      if (size === 15) return 18;
      if (size === 10) return 10;

      return 18;
    }

    function generateStarPositions(elementsList, width, height) {
  const nodeElements = elementsList.filter((el) => !el.data.source);
  const edgeElements = elementsList.filter((el) => el.data.source);

  const positions = new Map();
  const placed = [];

  const centerX = width / 2;
  const centerY = height / 2;

  const usableWidth = width * 0.84;
  const usableHeight = height * 0.84;

  const minX = centerX - usableWidth / 2;
  const maxX = centerX + usableWidth / 2;
  const minY = centerY - usableHeight / 2;
  const maxY = centerY + usableHeight / 2;

  function getRadius(nodeData) {
    return getVisualSize(nodeData) / 2;
  }

  function overlaps(x, y, radius, extraGap = 22) {
    for (const item of placed) {
      const dx = item.x - x;
      const dy = item.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = item.radius + radius + extraGap;

      if (distance < minDistance) {
        return true;
      }
    }
    return false;
  }

  function placeNodeWithAttempts(node, preferredX, preferredY, radius, spreadX, spreadY, extraGap = 22) {
    let x = preferredX;
    let y = preferredY;

    for (let attempt = 0; attempt < 1200; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const rx = (Math.random() - 0.5) * spreadX;
      const ry = (Math.random() - 0.5) * spreadY;

      x = preferredX + Math.cos(angle) * rx;
      y = preferredY + Math.sin(angle) * ry;

      x = Math.max(minX + radius, Math.min(maxX - radius, x));
      y = Math.max(minY + radius, Math.min(maxY - radius, y));

      if (!overlaps(x, y, radius, extraGap)) {
        positions.set(node.data.id, { x, y });
        placed.push({ x, y, radius });
        return true;
      }
    }

    return false;
  }

  // 1. POSIZIONI GUIDATE DEI 4 NODI PRINCIPALI
  const mainAnchors = {
  Eventi: { x: width * 0.20, y: height * 0.40 },     
  Tracce: { x: width * 0.45, y: height * 0.38 },     
  Comunità: { x: width * 0.72, y: height * 0.56 },   
  Luoghi: { x: width * 0.75, y: height * 0.22 }      
};

  const mainNodes = nodeElements.filter(
    (node) =>
      Number(node.data.size) === 75 &&
      ["Tracce", "Comunità", "Luoghi", "Eventi"].includes(node.data.label)
  );

  mainNodes.forEach((node) => {
    const anchor = mainAnchors[node.data.label];
    const radius = getRadius(node.data);

    const x = Math.max(minX + radius, Math.min(maxX - radius, anchor.x));
    const y = Math.max(minY + radius, Math.min(maxY - radius, anchor.y));

    positions.set(node.data.id, { x, y });
    placed.push({ x, y, radius });
  });

  // 2. NODI 45: sparsi ma con una tendenza morbida verso il centro
  const mediumLargeNodes = nodeElements.filter(
    (node) => Number(node.data.size) === 45 && !positions.has(node.data.id)
  );

  mediumLargeNodes.forEach((node) => {
    const radius = getRadius(node.data);

    const ok = placeNodeWithAttempts(
      node,
      centerX,
      centerY,
      radius,
      usableWidth * 0.7,
      usableHeight * 0.55,
      28
    );

    if (!ok) {
      positions.set(node.data.id, {
        x: minX + radius + Math.random() * (usableWidth - radius * 2),
        y: minY + radius + Math.random() * (usableHeight - radius * 2)
      });
    }
  });

  // 3. TUTTI GLI ALTRI NODI: distribuzione mista “cielo”
  const remainingNodes = nodeElements.filter((node) => !positions.has(node.data.id));

  remainingNodes.forEach((node, index) => {
    const radius = getRadius(node.data);
    let x = centerX;
    let y = centerY;
    let placedSuccessfully = false;

    for (let attempt = 0; attempt < 1400; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.pow(Math.random(), 0.82);

      const rx = (usableWidth / 2 - radius - 20) * spread;
      const ry = (usableHeight / 2 - radius - 20) * spread;

      x = centerX + Math.cos(angle) * rx;
      y = centerY + Math.sin(angle) * ry;

      x = Math.max(minX + radius, Math.min(maxX - radius, x));
      y = Math.max(minY + radius, Math.min(maxY - radius, y));

      if (!overlaps(x, y, radius, 18)) {
        placedSuccessfully = true;
        break;
      }
    }

    // fallback ordinato
    if (!placedSuccessfully) {
      const cols = Math.ceil(Math.sqrt(remainingNodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;

      x = minX + 70 + col * ((usableWidth - 140) / Math.max(cols - 1, 1));
      y = minY + 70 + row * ((usableHeight - 140) / Math.max(cols - 1, 1));
    }

    positions.set(node.data.id, { x, y });
    placed.push({ x, y, radius });
  });

  const positionedNodes = nodeElements.map((node) => ({
    ...node,
    position: positions.get(node.data.id)
  }));

  return [...positionedNodes, ...edgeElements];
}

    layoutPositionsRef.current = generateStarPositions(
      elements,
      containerWidth,
      containerHeight
   );

    const positionedElements = layoutPositionsRef.current;

    const cy = cytoscape({
      container: ref.current,
      elements: positionedElements,
      layout: {
        name: "preset",
        fit: false,
        padding: 120
      },

      style: [
        // BASE NODI
        {
          selector: "node",
          style: {
            label: "",
            "background-color": "#9ca3af",
            color: "#111827",
            "text-valign": "top",
            "text-halign": "center",
            "text-margin-y": -10,
            "font-size": 11,
            "font-family": "var(--font-inter)",
            width: 18,
            height: 18,
            "z-index": 2,
            "transition-property": "opacity, border-width, border-color, background-color",
            "transition-duration": "220ms",
          }
        },

        // GERARCHIA DIMENSIONALE
        {
          selector: 'node[size = 75]',
          style: {
            width: 120,
            height: 120,
            "z-index": 40
          }
        },
        {
          selector: 'node[size = 45]',
          style: {
            width: 60,
            height: 60,
            "z-index": 30
          }
        },
        {
          selector: 'node[size = 25]',
          style: {
            width: 32,
            height: 32,
            "z-index": 20
          }
        },
        {
          selector: 'node[size = 15]',
          style: {
            width: 18,
            height: 18,
            "z-index": 15
          }
        },
        {
          selector: 'node[size = 10]',
          style: {
            width: 10,
            height: 10,
            "z-index": 10
          }
        },

        // ETICHETTE FISSE - NODI DA 75
{
  selector: 'node[size = 75]',
  style: {
    label: "data(label)",
    "font-size": 24,
    "font-family": "var(--font-inter)",
    "font-weight": 500,
    color: "#111827",
    "text-valign": "center",
    "text-halign": "center",
    "text-margin-y": 0,
    "text-wrap": "wrap",
    "text-max-width": 90,
    "text-outline-width": 3,
    "text-outline-color": "#ffffff"
  }
},

// ETICHETTE FISSE - NODI DA 45
{
  selector: 'node[size = 45]',
  style: {
    label: "",
    "font-size": 8,
    "font-family": "var(--font-inter)",
    "font-weight": 400,
    color: "#000000",
    "text-valign": "center",
    "text-halign": "center",
    "text-margin-y": 0,
    "text-wrap": "wrap",
    "text-max-width": 44,
    "text-outline-width": 1.5,
    "text-outline-color": "#ffffff"
  }
},
{
  selector: 'node[size = 45].show-45-fixed',
  style: {
    label: "data(label)"
  }
},
{
  selector: 'node[size = 45][label = "Riconoscimento"]',
  style: {
    "font-size": 7,
    "text-max-width": 40
  }
},
{
  selector: 'node[label = "Calabria"], node[label = "Campania"], node[label = "Puglia"], node[label = "Sicilia"], node[label = "Basilicata"]',
  style: {
    "text-opacity": 0
  }
},
{
  selector: 'node[label = "Calabria"].show-region-label, node[label = "Campania"].show-region-label, node[label = "Puglia"].show-region-label, node[label = "Sicilia"].show-region-label, node[label = "Basilicata"].show-region-label',
  style: {
    label: "data(label)",
    "text-opacity": 1,
    "font-size": 10,
    "font-family": "var(--font-inter)",
    "font-weight": 500,
    color: "#111827",
    "text-valign": "top",
    "text-halign": "center",
    "text-margin-y": -10,
    "text-wrap": "wrap",
    "text-max-width": 80,
    "text-background-opacity": 1,
    "text-background-color": "#ffffff",
    "text-background-padding": 4,
    "text-border-width": 1,
    "text-border-color": "#e5e7eb",
    "text-border-opacity": 1,
    "text-border-style": "solid",
    "text-outline-width": 0,
    "z-index": 999
  }
},

// ETICHETTE TEMPORANEE - NODI SOTTO 45
{
  selector: ".show-label",
  style: {
    label: "data(label)",
    "font-size": 10,
    "font-family": "var(--font-inter)",
    "font-weight": 500,
    color: "#111827",
    "text-valign": "top",
    "text-halign": "center",
    "text-margin-y": -10,
    "text-wrap": "wrap",
    "text-max-width": 110,
    "text-background-opacity": 1,
    "text-background-color": "#ffffff",
    "text-background-padding": 4,
    "text-border-width": 1,
    "text-border-color": "#e5e7eb",
    "text-border-opacity": 1,
    "text-border-style": "solid",
    "text-outline-width": 0,
    "text-opacity": 1,
    "z-index": 999
  }
},
{
  selector: ".show-label-center",
  style: {
    label: "data(label)",
    "font-size": 7,
    "font-family": "var(--font-inter)",
    "font-weight": 400,
    color: "#374151",
    "text-valign": "center",
    "text-halign": "center",
    "text-margin-y": 0,
    "text-wrap": "wrap",
    "text-max-width": 44,
    "text-outline-width": 1.5,
    "text-outline-color": "#ffffff",
    "text-opacity": 1,
    "z-index": 999
  }
},

        // TEMATISMI GENERALI
        {
          selector: 'node[editorSection = "Tematismi"]',
          style: {
            "background-color": "#ffffff"
          }
        },

        // COLORI DI FAMIGLIA - BASE
        {
            selector: 'node[eventCategory = "Eventi"]',
            style: {
                 "background-color": "#6e0d25"
                }
        },
        {
            selector: 'node[editorSection = "Luoghi"]',
            style: {
                "background-color": "#939f5c"
            }
        },
        {

            selector: 'node[communityCategory = "Comunità"]',
            style: {
                "background-color": "#197278"
            }
        },
        {
            selector: 'node[traceCategory != ""]',
            style: {
                "background-color": "#F1A208"
            }
        },

        // NODI 45 - BIANCHI CON BORDO
        {
          selector: 'node[size = 45]',
          style: {
            "background-color": "#ffffff",
            "border-width": 4
          }
        },
        {
          selector: 'node[size = 45][eventCategory = "Eventi"]',
          style: {
            "border-color": "#6e0d25"
          }
        },
        {
          selector: 'node[size = 45][placeCategory != ""]',
          style: {
            "border-color": "#8bb75f"
          }
        },
        {
          selector: 'node[size = 45][communityCategory = "Comunità"]',
          style: {
            "border-color": "#197278"
          }
        },
        {
          selector: 'node[size = 45][traceCategory != ""]',
          style: {
            "border-color": "#F1A208"
          }
        },

        // REGIONI - OTTAGONI PIÙ PICCOLI
        {
          selector:
            'node[label = "Calabria"], node[label = "Campania"], node[label = "Puglia"], node[label = "Sicilia"], node[label = "Basilicata"]',
          style: {
            shape: "octagon",
            width: 32,
            height: 32,
            "background-color": "#939f5c",
            "border-width": 0,
            "z-index": 20
          }
        },

        // NODI 25 - PIENI
        {
          selector: 'node[size = 25][eventCategory = "Eventi"]',
          style: {
            "background-color": "#6e0d25",
            "border-width": 0,
            opacity: 1
          }
        },
        {
          selector: 'node[size = 25][placeCategory != ""]',
          style: {
            "background-color": "#939f5c",
            "border-width": 0,
            opacity: 0.95
          }
        },
        {
          selector: 'node[size = 25][communityCategory = "Comunità"]',
          style: {
            "background-color": "#197278",
            "border-width": 0,
            opacity: 1
          }
        },
        {
          selector: 'node[size = 25][traceCategory != ""]',
          style: {
            "background-color": "#F1A208",
            "border-width": 0,
            opacity: 1
          }
        },

        // NODI 15 - STESSI COLORI, PIÙ LEGGERI
        {
          selector: 'node[size = 15][eventCategory = "Eventi"]',
          style: {
            "background-color": "#6e0d25",
            "border-width": 0,
            opacity: 1
          }
        },
        {
          selector: 'node[size = 15][placeCategory != ""]',
          style: {
            "background-color": "#939f5c",
            "border-width": 0,
            opacity: 1
          }
        },
        {
          selector: 'node[size = 15][communityCategory = "Comunità"]',
          style: {
            "background-color": "#197278",
            "border-width": 0,
            opacity: 1
          }
        },
        {
          selector: 'node[size = 15][traceCategory != ""]',
          style: {
            "background-color": "#F1A208",
            "border-width": 0,
            opacity: 1
          }
        },

        // NODI 10 - TUTTI BLU SCURO
        {
          selector: 'node[size = 10]',
          style: {
            "background-color": "#0b3c49",
            "border-width": 0,
            opacity: 1
          }
        },

        // SEZIONI SPECIALI
        {
          selector: 'node[editorSection = "Carceri"]',
          style: {
            "background-color": "#0b3c49",
            "border-width": 1,
            "border-color": "#ffffff"
          }
        },
        {
          selector: 'node[editorSection = "Campi di concentramento e internamento"]',
          style: {
            "background-color": "#0b3c49",
            "border-width": 1,
            "border-color": "#ffffff"
          }
        },

        // 4 NODI PRINCIPALI
        {
          selector: 'node[editorSection = "Tematismi"][label = "Eventi"]',
          style: {
            "background-color": "#ffffff",
            "border-width": 6,
            "border-color": "#6e0d25"
          }
        },
        {
          selector: 'node[editorSection = "Tematismi"][label = "Luoghi"]',
          style: {
            "background-color": "#ffffff",
            "border-width": 6,
            "border-color": "#939f5c"
          }
        },
        {
          selector: 'node[editorSection = "Tematismi"][label = "Comunità"]',
          style: {
            "background-color": "#ffffff",
            "border-width": 6,
            "border-color": "#197278"
          }
        },
        {
          selector: 'node[editorSection = "Tematismi"][label = "Tracce"]',
          style: {
            "background-color": "#ffffff",
            "border-width": 6,
            "border-color": "#f1a208"
          }
        },

        // ARCHI
        {
          selector: "edge",
          style: {
            width: 1,
            "curve-style": "bezier",
            "line-fill": "linear-gradient",
            "line-gradient-stop-positions": "0% 100%",
            opacity: 0.24,
            "z-index": 1,
            "transition-property": "opacity, width",
            "transition-duration": "320ms"
          }
        },
        {
  selector: ".interaction-edge-muted",
  style: {
    opacity: 0.01,
    width: 0.1
  }
},

{
  selector: ".faded",
  style: {
    opacity: 0.15
  }
},
{
  selector: ".faded-edge",
  style: {
    opacity: 0.03
  }
},

{
  selector: ".search-faded",
  style: {
    opacity: 0.08
  }
},
{
  selector: ".filter-faded",
  style: {
    opacity: 0.08
  }
},
{
  selector: ".filter-secondary",
  style: {
    opacity: 0.18
  }
},

{
  selector: ".search-match",
  style: {
    opacity: 1,
    "z-index": 999
  }
},
{
  selector: ".filter-focus",
  style: {
    opacity: 1,
    "z-index": 999
  }
},
{
  selector: ".filter-context",
  style: {
    opacity: 0.7
  }
},

{
  selector: ".active-node",
  style: {
    opacity: 1,
    "z-index": 999
  }
},
{
  selector: ".neighbor-node",
  style: {
    opacity: 1,
    "z-index": 998
  }
},

{
  selector: ".active-node.faded, .active-node.search-faded, .active-node.filter-faded, .active-node.filter-secondary",
  style: {
    opacity: 1,
    "z-index": 999
  }
},
{
  selector: ".neighbor-node.faded, .neighbor-node.search-faded, .neighbor-node.filter-faded, .neighbor-node.filter-secondary",
  style: {
    opacity: 1,
    "z-index": 998
  }
},

{
  selector: "edge.filter-context",
  style: {
    width: 2,
    opacity: 0.65
  }
},
{
  selector: ".active-edge",
  style: {
    width: 2.0,
    opacity: 0.65
  }
},
{
  selector: ".search-edge",
  style: {
    width: 2,
    opacity: 0.6
  }
},
      ]
    });

    cyRef.current = cy;
    cy.fit(undefined, 85);

    if (onReady) {
  onReady({
    zoomIn: () => {
      const currentZoom = cy.zoom();
      cy.zoom({
        level: currentZoom * 1.2,
        renderedPosition: {
          x: cy.width() / 2,
          y: cy.height() / 2
        }
      });
    },

    zoomOut: () => {
      const currentZoom = cy.zoom();
      cy.zoom({
        level: currentZoom / 1.2,
        renderedPosition: {
          x: cy.width() / 2,
          y: cy.height() / 2
        }
      });
    },

    recenter: () => {
      cy.fit(undefined, 85);
    },

    focusSelection: () => {
      const activeNode = cy.nodes(".active-node");
      const searchMatches = cy.nodes(".search-match");
      const filterFocus = cy.nodes(".filter-focus");
      const filterContext = cy.nodes(".filter-context");

      let targetNodes = cy.collection();

      if (activeNode.length > 0) {
        const neighborhood = activeNode.closedNeighborhood();
        targetNodes = neighborhood;
    } else if (searchMatches.length > 0) {
         targetNodes = searchMatches.closedNeighborhood();
        } else if (filterFocus.length > 0 || filterContext.length > 0) {
            targetNodes = filterFocus
            .union(filterContext)
            .union(cy.edges(".filter-context"));
        }

      if (targetNodes.length === 0) return;

      const bb = targetNodes.boundingBox();

      let basePadding = 120;
      if (activeNode.length > 0) basePadding = 160;
      if (searchMatches.length > 0) basePadding = 130;
      if (filterFocus.length > 0 || filterContext.length > 0) basePadding = 140;

      const reservedRight = sidebarOpenRef.current
        ? (sidebarWidthRef.current || 0) + 40
        : 0;

      const fullWidth = cy.width();
      const fullHeight = cy.height();

      const usableWidth = fullWidth - reservedRight;
      const usableHeight = fullHeight;

      if (bb.w <= 0 || bb.h <= 0 || usableWidth <= 0 || usableHeight <= 0) {
        return;
      }

      const zoomX = (usableWidth - basePadding * 2) / bb.w;
      const zoomY = (usableHeight - basePadding * 2) / bb.h;

      let zoom = Math.min(zoomX, zoomY);

      const minZoom = cy.minZoom ? cy.minZoom() : 0.1;
      const maxZoom = cy.maxZoom ? cy.maxZoom() : 10;

      zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

      const bbCenterX = bb.x1 + bb.w / 2;
      const bbCenterY = bb.y1 + bb.h / 2;

      const usableCenterX = usableWidth / 2;
      const usableCenterY = usableHeight / 2;

      const panX = usableCenterX - bbCenterX * zoom;
      const panY = usableCenterY - bbCenterY * zoom;

      cy.animate(
        {
          zoom,
          pan: { x: panX, y: panY }
        },
        {
          duration: 220,
          easing: "ease-out"
        }
      );
    }
  });
}

    let interactionTimeout;
    let isPointerDown = false;
    let hasDragged = false;

    function muteEdges() {
      cy.edges().addClass("interaction-edge-muted");
    }

    function restoreEdges() {
      clearTimeout(interactionTimeout);

      interactionTimeout = setTimeout(() => {
        if (!isPointerDown) {
          cy.edges().removeClass("interaction-edge-muted");
        }
      }, 220);
    }

    function handleViewportInteraction() {
      muteEdges();

      if (!isPointerDown) {
        restoreEdges();
      }
    }

    function getNodeEdgeColor(node) {
      const label = node.data("label");
      const editorSection = node.data("editorSection");
      const size = Number(node.data("size"));

      const isMainThematicNode =
        editorSection === "Tematismi" &&
        ["Eventi", "Luoghi", "Comunità", "Tracce"].includes(label);

      const isRegionNode = [
        "Calabria",
        "Campania",
        "Puglia",
        "Sicilia",
        "Basilicata"
      ].includes(label);

      const isWhiteBorderNode = size === 45;

      if (isMainThematicNode || isRegionNode || isWhiteBorderNode) {
        return node.style("border-color");
      }

      return node.style("background-color");
    }

    function applyEdgeGradients() {
      cy.edges().forEach((edge) => {
        const sourceNode = edge.source();
        const targetNode = edge.target();

        const sourceColor = getNodeEdgeColor(sourceNode);
        const targetColor = getNodeEdgeColor(targetNode);

        edge.style({
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": `${sourceColor} ${targetColor}`,
          "line-gradient-stop-positions": "0% 100%"
        });
      });
    }
    function updateZoomLabelMode() {
  const zoom = cy.zoom();

  const regionNodes = cy.nodes(
    '[label = "Calabria"], [label = "Campania"], [label = "Puglia"], [label = "Sicilia"], [label = "Basilicata"]'
  );

  const regular45Nodes = cy.nodes('[size = 45]').difference(regionNodes);

  regionNodes.removeClass("show-45-fixed");

  if (zoom >= 2) {
    regular45Nodes.addClass("show-45-fixed");
  } else {
    regular45Nodes.removeClass("show-45-fixed");
  }
}

    function clearNodeHighlightStyles() {
  cy.nodes().forEach((node) => {
    node.removeStyle(
      "background-color border-color border-width underlay-color underlay-padding underlay-opacity underlay-shape color text-outline-width text-outline-color text-opacity"
    );
  });
}

function highlightNode(node) {
  const size = Number(node.data("size"));
  const label = node.data("label");
  const isRegionNode = [
    "Calabria",
    "Campania",
    "Puglia",
    "Sicilia",
    "Basilicata"
  ].includes(label);

// livello 1: nodi da 75
if (size === 75) {
  const fillColor = node.style("border-color");

  node.style({
    "background-color": fillColor,
    "border-color": fillColor,
    "border-width": 6,
    color: "#ffffff",
    "text-outline-width": 0,
    "text-outline-color": "transparent"
  });

  return;
}

// livello 2: nodi da 45, ma NON gli ottagoni
if (size === 45 && !isRegionNode) {
  const strokeColor = node.style("border-color");

  node.style({
    "background-color": "#ffffff",
    "border-color": strokeColor,
    "border-width": 7
  });

  return;
}

// ottagoni + nodi da 25
if (isRegionNode || size === 25) {
  const fillColor = node.style("background-color");

  node.style({
    "border-color": fillColor,
    "border-width": 4
  });

  return;
}

// nodi da 15
if (size === 15) {
  const fillColor = node.style("background-color");

  node.style({
    "border-color": fillColor,
    "border-width": 3
  });

  return;
}

// nodi piccoli
  node.style({
    "underlay-shape": "ellipse",
    "underlay-color": "#a0aab2",
    "underlay-padding": 4,
    "underlay-opacity": 1,
    "border-width": 0
  });
}

function highlightCollection(nodesCollection) {
  nodesCollection.forEach((node) => {
    highlightNode(node);
  });
}

    function clearFocus() {
  cy.elements().removeClass(
    "faded faded-edge active-node neighbor-node active-edge show-label show-label-center show-region-label clicked-label search-match search-faded search-edge filter-focus filter-context filter-secondary filter-faded interaction-edge-muted"
  );

  clearNodeHighlightStyles();
  updateZoomLabelMode();
}

   function applySearch(term) {
  cy.elements().removeClass("search-match search-faded search-edge");

  const normalized = term.trim().toLowerCase();

  if (!normalized) {
    return;
  }

  const matchedNodes = cy.nodes().filter((node) => {
    const size = Number(node.data("size"));
    if (size !== 10) return false;

    const label = String(node.data("label") || "").toLowerCase();
    const description = String(node.data("description") || "").toLowerCase();
    const keywords = node.data("keywords") || [];

    const keywordMatch =
      Array.isArray(keywords) &&
      keywords.some((keyword) =>
        String(keyword).toLowerCase().includes(normalized)
      );

    return (
      label.includes(normalized) ||
      description.includes(normalized) ||
      keywordMatch
    );
  });

  if (matchedNodes.length === 0) {
    cy.elements().addClass("search-faded");
    return;
  }

  cy.elements().addClass("search-faded");

  matchedNodes.forEach((node) => {
    node.removeClass("search-faded");
    node.addClass("search-match");
    node.addClass("show-label");
  });
}

    function applyFilters() {
  cy.elements().removeClass(
    "filter-faded filter-focus filter-context filter-secondary"
  );

  const currentEventSubcategory = eventSubcategoryRef.current || "";
  const currentEventDetail = eventDetailRef.current || "";
  const currentPlaceCategory = placeCategoryRef.current || "";
  const currentTraceCategory = traceCategoryRef.current || "";
  const currentTraceSubcategory = traceSubcategoryRef.current || "";
  const currentCommunitySubcategory = communitySubcategoryRef.current || "";

  const sections = [];

  if (currentEventSubcategory || currentEventDetail) {
    sections.push((node) => {
      const nodeEventSubcategory = node.data("eventSubcategory") || "";
      const nodeEventDetail = node.data("eventDetail") || "";

      const subcategoryMatch =
        !currentEventSubcategory || nodeEventSubcategory === currentEventSubcategory;

      const detailMatch =
        !currentEventDetail || nodeEventDetail === currentEventDetail;

      return subcategoryMatch && detailMatch;
    });
  }

  if (currentPlaceCategory) {
    sections.push((node) => {
      const nodePlaceCategory = node.data("placeCategory") || "";
      return nodePlaceCategory === currentPlaceCategory;
    });
  }

  if (currentTraceCategory || currentTraceSubcategory) {
    sections.push((node) => {
      const nodeTraceCategory = node.data("traceCategory") || "";
      const nodeTraceSubcategory = node.data("traceSubcategory") || "";

      const categoryMatch =
        !currentTraceCategory || nodeTraceCategory === currentTraceCategory;

      const subcategoryMatch =
        !currentTraceSubcategory || nodeTraceSubcategory === currentTraceSubcategory;

      return categoryMatch && subcategoryMatch;
    });
  }

  if (currentCommunitySubcategory) {
    sections.push((node) => {
      const nodeCommunitySubcategory = node.data("communitySubcategory") || "";
      return nodeCommunitySubcategory === currentCommunitySubcategory;
    });
  }

  if (sections.length === 0) {
    return;
  }

  cy.elements().addClass("filter-faded");

  const matchedNodes = cy.nodes().filter((node) => {
    const size = Number(node.data("size"));
    if (size !== 10) return false;

    return sections.every((matchFn) => matchFn(node));
  });

  matchedNodes.forEach((node) => {
    node.removeClass("filter-faded");
    node.addClass("filter-focus");
    node.addClass("show-label");
  });
}
cy.on("mouseover", "node", (e) => {
  const node = e.target;
  const size = Number(node.data("size"));
  const label = node.data("label");
  const zoom = cy.zoom();

  const isRegionNode = [
    "Calabria",
    "Campania",
    "Puglia",
    "Sicilia",
    "Basilicata"
  ].includes(label);

  const shouldShow45Hover = size === 45 && zoom < 2 && !isRegionNode;

  if (size < 45 && !isRegionNode) {
    node.addClass("show-label");
  }

  if (shouldShow45Hover) {
    node.addClass("show-label-center");
  }

  if (isRegionNode) {
    node.removeClass("show-45-fixed");
    node.addClass("show-region-label");
  }
});

cy.on("mouseout", "node", (e) => {
  const node = e.target;
  const size = Number(node.data("size"));
  const label = node.data("label");
  const zoom = cy.zoom();

  const isRegionNode = [
    "Calabria",
    "Campania",
    "Puglia",
    "Sicilia",
    "Basilicata"
  ].includes(label);

  const shouldShow45Hover = size === 45 && zoom < 2 && !isRegionNode;

  if (size < 45 && !isRegionNode && !node.hasClass("clicked-label")) {
    node.removeClass("show-label");
  }

  if (shouldShow45Hover && !node.hasClass("clicked-label")) {
    node.removeClass("show-label-center");
  }

  if (isRegionNode && !node.hasClass("clicked-label")) {
    node.removeClass("show-region-label");
  }
});

cy.on("tap", "node", (e) => {
  const node = e.target;
  const size = Number(node.data("size"));
  const zoom = cy.zoom();
  const label = node.data("label");

  const isRegionNode = [
    "Calabria",
    "Campania",
    "Puglia",
    "Sicilia",
    "Basilicata"
  ].includes(label);

  const shouldShow45Hover = size === 45 && zoom < 2 && !isRegionNode;

  const hasFilteredResults =
    cy.nodes(".filter-focus").length > 0 ||
    cy.nodes(".filter-context").length > 0;

  // reset completo dello stato precedente
  cy.elements().removeClass(
    "faded faded-edge active-node neighbor-node active-edge filter-secondary search-faded filter-faded"
  );

  // reset label temporanee/clickate
  cy.nodes().removeClass("clicked-label");
  cy.nodes().removeClass("show-label");
  cy.nodes().removeClass("show-label-center");
  cy.nodes().removeClass("show-region-label");

  // sideboard solo per nodi da 10
  if (size === 10) {
    onNodeSelect(node.data());
  } else {
    onNodeSelect(null);
  }

  // label del nodo cliccato
  if (size < 45 && !isRegionNode) {
    node.addClass("show-label");
    node.addClass("clicked-label");
  }

  if (shouldShow45Hover) {
    node.addClass("show-label-center");
    node.addClass("clicked-label");
  }

  if (isRegionNode) {
    node.removeClass("show-45-fixed");
    node.addClass("show-region-label");
    node.addClass("clicked-label");
  }

  // ===== CASO CLICK NORMALE =====
  cy.elements().addClass("faded");
  cy.edges().addClass("faded-edge");

  const neighborhood = node.closedNeighborhood();
  const connectedNodes = neighborhood.nodes().difference(node);
  const connectedEdges = neighborhood.edges();

  // nodo attivo
  node.removeClass(
    "faded search-faded filter-faded filter-secondary neighbor-node"
  );
  node.addClass("active-node");

  // nodi collegati
  connectedNodes.removeClass(
    "faded search-faded filter-faded filter-secondary active-node"
  );
  connectedNodes.addClass("neighbor-node");

  // archi collegati
  connectedEdges.removeClass(
    "faded-edge interaction-edge-muted search-edge filter-context"
  );
  connectedEdges.addClass("active-edge");

  clearNodeHighlightStyles();
  highlightNode(node);
});

cy.on("tap", (e) => {
  if (e.target === cy) {
    clearFocus();
    onNodeSelect(null);

    const currentSearch = searchTermRef.current || "";
    const currentEventSubcategory = eventSubcategoryRef.current || "";
    const currentEventDetail = eventDetailRef.current || "";
    const currentPlaceCategory = placeCategoryRef.current || "";
    const currentTraceCategory = traceCategoryRef.current || "";
    const currentTraceSubcategory = traceSubcategoryRef.current || "";
    const currentCommunitySubcategory = communitySubcategoryRef.current || "";

    const hasSearch = currentSearch.trim().length > 0;
    const hasFilters =
      !!currentEventSubcategory ||
      !!currentEventDetail ||
      !!currentPlaceCategory ||
      !!currentTraceCategory ||
      !!currentTraceSubcategory ||
      !!currentCommunitySubcategory;

    if (hasSearch) {
      applySearch(currentSearch);
    }

    if (hasFilters) {
      applyFilters();
    }
  }
});

cy.on("pan", () => {
  handleViewportInteraction();
});

cy.on("zoom", () => {
  handleViewportInteraction();
  updateZoomLabelMode();
});

    const container = ref.current;

    function handleMouseDown() {
      isPointerDown = true;
      hasDragged = false;
    }

    function handleMouseMove() {
      if (!isPointerDown) return;

      if (!hasDragged) {
        hasDragged = true;
        muteEdges();
      }
    }

    function handleMouseUp() {
      if (hasDragged) {
        restoreEdges();
      }

      isPointerDown = false;
      hasDragged = false;
    }

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    applyEdgeGradients();
    updateZoomLabelMode();

return () => {
      clearTimeout(interactionTimeout);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cy.destroy();
    };
  }, [
    elements,
    onNodeSelect
  ]);

  useEffect(() => {
  const cy = cyRef.current;
  if (!cy) return;

  function clearNodeHighlightStyles() {
    cy.nodes().forEach((node) => {
      node.removeStyle(
        "background-color border-color border-width underlay-color underlay-padding underlay-opacity underlay-shape color text-outline-width text-outline-color text-opacity"
      );
    });
  }

  function clearFocus() {
    cy.elements().removeClass(
      "faded faded-edge active-node neighbor-node active-edge show-label show-label-center show-region-label clicked-label search-match search-faded search-edge filter-focus filter-context filter-secondary filter-faded interaction-edge-muted"
    );
    clearNodeHighlightStyles();
  }

  function applySearch(term) {
  cy.elements().removeClass("search-match search-faded search-edge");

  const normalized = term.trim().toLowerCase();

  if (!normalized) {
    onNodeSelect(null);
    return;
  }

  const matchedNodes = cy.nodes().filter((node) => {
    const size = Number(node.data("size"));
    if (size !== 10) return false;

    const label = String(node.data("label") || "").toLowerCase();
    const description = String(node.data("description") || "").toLowerCase();
    const keywords = node.data("keywords") || [];

    const keywordMatch =
      Array.isArray(keywords) &&
      keywords.some((keyword) =>
        String(keyword).toLowerCase().includes(normalized)
      );

    return (
      label.includes(normalized) ||
      description.includes(normalized) ||
      keywordMatch
    );
  });

  if (matchedNodes.length === 0) {
    cy.elements().addClass("search-faded");
    onNodeSelect(null);
    return;
  }

  // attenua tutto
  cy.elements().addClass("search-faded");

  // riaccende solo i nodi da 10 trovati
  matchedNodes.forEach((node) => {
    node.removeClass("search-faded");
    node.addClass("search-match");
    node.addClass("show-label");
  });

  // niente apertura automatica della scheda, a meno che tu non voglia mantenerla
  if (matchedNodes.length === 1) {
    onNodeSelect(matchedNodes[0].data());
  } else {
    onNodeSelect(null);
  }
}

  function applyFilters() {
  cy.elements().removeClass(
    "filter-faded filter-focus filter-context filter-secondary"
  );

  const sections = [];

  if (eventSubcategory || eventDetail) {
    sections.push((node) => {
      const nodeEventSubcategory = node.data("eventSubcategory") || "";
      const nodeEventDetail = node.data("eventDetail") || "";

      const subcategoryMatch =
        !eventSubcategory || nodeEventSubcategory === eventSubcategory;

      const detailMatch =
        !eventDetail || nodeEventDetail === eventDetail;

      return subcategoryMatch && detailMatch;
    });
  }

  if (placeCategory) {
    sections.push((node) => {
      const nodePlaceCategory = node.data("placeCategory") || "";
      return nodePlaceCategory === placeCategory;
    });
  }

  if (traceCategory || traceSubcategory) {
    sections.push((node) => {
      const nodeTraceCategory = node.data("traceCategory") || "";
      const nodeTraceSubcategory = node.data("traceSubcategory") || "";

      const categoryMatch =
        !traceCategory || nodeTraceCategory === traceCategory;

      const subcategoryMatch =
        !traceSubcategory || nodeTraceSubcategory === traceSubcategory;

      return categoryMatch && subcategoryMatch;
    });
  }

  if (communitySubcategory) {
    sections.push((node) => {
      const nodeCommunitySubcategory = node.data("communitySubcategory") || "";
      return nodeCommunitySubcategory === communitySubcategory;
    });
  }

  if (sections.length === 0) {
    onNodeSelect(null);
    return;
  }

  // attenua tutto
  cy.elements().addClass("filter-faded");

  // FILTRO SOLO SUI NODI DA 10
  const matchedNodes = cy.nodes().filter((node) => {
    const size = Number(node.data("size"));
    if (size !== 10) return false;

    return sections.every((matchFn) => matchFn(node));
  });

  // accende solo questi nodi
  matchedNodes.forEach((node) => {
    node.removeClass("filter-faded");
    node.addClass("filter-focus");
    node.addClass("show-label");
  });

  if (matchedNodes.length === 1) {
    onNodeSelect(matchedNodes[0].data());
  } else {
    onNodeSelect(null);
  }
}

  clearFocus();
  applySearch(searchTerm || "");
  applyFilters();
}, [
  searchTerm,
  eventSubcategory,
  eventDetail,
  placeCategory,
  traceCategory,
  traceSubcategory,
  communitySubcategory,
  onNodeSelect
]);

  return (
  <div
    ref={graphFrameRef}
    style={{
      width: "100%",
      height: "100%",
      overflow: "hidden",
      position: "relative"
    }}
  >
    <div
      ref={ref}
      style={{
        width: baseSizeRef.current ? `${baseSizeRef.current.width}px` : "100%",
        height: baseSizeRef.current ? `${baseSizeRef.current.height}px` : "100%"
      }}
    />
  </div>
);
}
