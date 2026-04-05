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
  communitySubcategory
}) {
  const ref = useRef(null);
  const cyRef = useRef(null);
  const layoutPositionsRef = useRef(null);
  const baseSizeRef = useRef(null);
  const graphFrameRef = useRef(null);
  

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
    Tracce: { x: width * 0.20, y: height * 0.40 },
    Comunità: { x: width * 0.45, y: height * 0.38 },
    Luoghi: { x: width * 0.72, y: height * 0.56 },
    Eventi: { x: width * 0.75, y: height * 0.22 }
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

    const positionedElements = generateStarPositions(
      elements,
      containerWidth,
      containerHeight
    );
    if (!layoutPositionsRef.current) {
  layoutPositionsRef.current = generateStarPositions(
    elements,
    containerWidth,
    containerHeight
  );
}

layoutPositionsRef.current = generateStarPositions(
  elements,
  containerWidth,
  containerHeight
);

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

        // ETICHETTE FISSE SOLO NODI GRANDI
        {
          selector: 'node[size > 46]',
          style: {
            label: "data(label)",
            "font-size": 24,
            "font-family": "var(--font-inter)",
            "font-weight": 400,
            color: "#111827",
            "text-valign": "center",
            "text-halign": "center",
            "text-margin-y": 0
          }
        },

        // ETICHETTE TEMPORANEE
        {
          selector: ".show-label",
          style: {
            label: "data(label)",
            "font-size": 11,
            "font-family": "var(--font-inter)",
            color: "#111827",
            "text-valign": "top",
            "text-halign": "center",
            "text-margin-y": -10,
            "text-background-opacity": 1,
            "text-background-color": "#ffffff",
            "text-background-padding": 2
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
        {
          selector: ".filter-secondary",
          style: {
          opacity: 0.18
         }
        },
      ]
    });

    cyRef.current = cy;

    cy.fit(undefined, 120);

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

    function clearNodeHighlightStyles() {
  cy.nodes().forEach((node) => {
    node.removeStyle(
      "background-color border-color border-width underlay-color underlay-padding underlay-opacity underlay-shape color"
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
    color: "#ffffff"
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
        "faded faded-edge active-node neighbor-node active-edge show-label clicked-label search-match search-faded search-edge filter-focus filter-context filter-secondary filter-faded interaction-edge-muted"
      );

      clearNodeHighlightStyles();
}

    function applySearch(term) {
      cy.elements().removeClass("search-match search-faded search-edge");

      const normalized = term.trim().toLowerCase();

      if (!normalized) {
        return;
      }

      const matchedNodes = cy.nodes().filter((node) => {
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

        const neighborhood = node.closedNeighborhood();
        neighborhood.removeClass("search-faded");

        node.connectedEdges().addClass("search-edge");
      });

      if (matchedNodes.length === 1) {
         const matchedSize = Number(matchedNodes[0].data("size"));

         if (matchedSize === 10) {
           onNodeSelect(matchedNodes[0].data());
         } else {
            onNodeSelect(null);
         }
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
        return;
      }

      cy.elements().addClass("filter-faded");

      const matchedNodes = cy.nodes().filter((node) => {
        return sections.every((matchFn) => matchFn(node));
      });

      const contextNodeIds = new Set();
      const focusNodeIds = new Set();

      function addContextFromNode(node) {
        const data = node.data();

        focusNodeIds.add(node.id());

        const labelsToKeep = [];

        if (data.eventSubcategory) {
          labelsToKeep.push("Eventi");
          labelsToKeep.push(data.eventSubcategory);
        }

        if (data.eventDetail) {
          labelsToKeep.push(data.eventDetail);
        }

        if (data.placeCategory) {
          labelsToKeep.push("Luoghi");
          labelsToKeep.push(data.placeCategory);
        }

        if (data.traceCategory) {
          labelsToKeep.push("Tracce");

          if (data.traceCategory === "Tracce intenzionali") {
            labelsToKeep.push("Intenzionali");
          }

          if (data.traceCategory === "Tracce non intenzionali") {
            labelsToKeep.push("Non intenzionali");
          }
        }

        if (data.traceSubcategory) {
          labelsToKeep.push(data.traceSubcategory);
        }

        if (data.communitySubcategory) {
          labelsToKeep.push("Comunità");
          labelsToKeep.push(data.communitySubcategory);
        }

        cy.nodes().forEach((candidate) => {
          const label = candidate.data("label") || "";
          if (labelsToKeep.includes(label)) {
            contextNodeIds.add(candidate.id());
          }
        });
      }

      matchedNodes.forEach((node) => {
        addContextFromNode(node);
      });

      cy.nodes().forEach((node) => {
        if (focusNodeIds.has(node.id())) {
          node.removeClass("filter-faded");
          node.addClass("filter-focus");
        } else if (contextNodeIds.has(node.id())) {
          node.removeClass("filter-faded");
          node.addClass("filter-context");
        }
      });

      cy.edges().forEach((edge) => {
        const sourceId = edge.source().id();
        const targetId = edge.target().id();

        if (
          (focusNodeIds.has(sourceId) || contextNodeIds.has(sourceId)) &&
          (focusNodeIds.has(targetId) || contextNodeIds.has(targetId))
        ) {
          edge.removeClass("filter-faded");
          edge.addClass("filter-context");
        }
      });

    }
    cy.on("mouseover", "node", (e) => {
      const node = e.target;
      const size = Number(node.data("size"));

      if (size <= 46) {
        node.addClass("show-label");
      }
    });

    cy.on("mouseout", "node", (e) => {
      const node = e.target;
      const size = Number(node.data("size"));

      if (size <= 46 && !node.hasClass("clicked-label")) {
        node.removeClass("show-label");
      }
    });

    cy.on("tap", "node", (e) => {
      const node = e.target;
      const size = Number(node.data("size"));

      if (size === 10) {
        onNodeSelect(node.data());
      } else {
        onNodeSelect(null);
      }

      cy.nodes().removeClass("clicked-label");
      cy.nodes().removeClass("show-label");

      if (size <= 46) {
        node.addClass("show-label");
        node.addClass("clicked-label");
      }

      const hasFilteredResults =
        cy.nodes(".filter-focus").length > 0 ||
        cy.nodes(".filter-context").length > 0;

      if (hasFilteredResults) {
        const currentFocusNodes = cy.nodes(".filter-focus");
        const currentContextNodes = cy.nodes(".filter-context");

        currentFocusNodes.forEach((n) => {
          if (n.id() !== node.id()) {
            n.removeClass("filter-focus");
            n.addClass("filter-secondary");
          }
        });

        node.removeClass("filter-secondary");
        node.addClass("filter-focus");

        currentContextNodes.forEach((n) => {
          if (n.id() !== node.id()) {
            n.addClass("filter-context");
          }
        });

        return;
      }

      cy.elements().addClass("faded");
      cy.edges().addClass("faded-edge");

      node.removeClass("faded");
      node.addClass("active-node");

      const neighborhood = node.neighborhood();
      neighborhood.removeClass("faded");

      node.connectedEdges().addClass("active-edge");
      node.connectedNodes().addClass("neighbor-node");

      clearNodeHighlightStyles();
      highlightNode(node);
    });

    cy.on("tap", (e) => {
      if (e.target === cy) {
        clearFocus();
        onNodeSelect(null);
        applySearch(searchTerm || "");
        applyFilters();
      }
    });

    cy.on("pan zoom", () => {
      handleViewportInteraction();
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
    clearFocus();
    applySearch(searchTerm || "");
    applyFilters();

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
        "background-color border-color border-width underlay-color underlay-padding underlay-opacity underlay-shape color"
      );
    });
  }

  function clearFocus() {
    cy.elements().removeClass(
      "faded faded-edge active-node neighbor-node active-edge show-label clicked-label search-match search-faded search-edge filter-focus filter-context filter-secondary filter-faded interaction-edge-muted"
    );
    clearNodeHighlightStyles();
  }

  function applySearch(term) {
    cy.elements().removeClass("search-match search-faded search-edge");

    const normalized = term.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    const matchedNodes = cy.nodes().filter((node) => {
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

    cy.elements().addClass("search-faded");

    matchedNodes.forEach((node) => {
      node.removeClass("search-faded");
      node.addClass("search-match");

      const neighborhood = node.closedNeighborhood();
      neighborhood.removeClass("search-faded");

      node.connectedEdges().addClass("search-edge");
    });

    if (matchedNodes.length === 1) {
      const matchedSize = Number(matchedNodes[0].data("size"));

      if (matchedSize === 10) {
        onNodeSelect(matchedNodes[0].data());
      } else {
        onNodeSelect(null);
      }
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
      return;
    }

    cy.elements().addClass("filter-faded");

    const matchedNodes = cy.nodes().filter((node) => {
      return sections.every((matchFn) => matchFn(node));
    });

    const contextNodeIds = new Set();
    const focusNodeIds = new Set();

    function addContextFromNode(node) {
      const data = node.data();

      focusNodeIds.add(node.id());

      const labelsToKeep = [];

      if (data.eventSubcategory) {
        labelsToKeep.push("Eventi");
        labelsToKeep.push(data.eventSubcategory);
      }

      if (data.eventDetail) {
        labelsToKeep.push(data.eventDetail);
      }

      if (data.placeCategory) {
        labelsToKeep.push("Luoghi");
        labelsToKeep.push(data.placeCategory);
      }

      if (data.traceCategory) {
        labelsToKeep.push("Tracce");

        if (data.traceCategory === "Tracce intenzionali") {
          labelsToKeep.push("Intenzionali");
        }

        if (data.traceCategory === "Tracce non intenzionali") {
          labelsToKeep.push("Non intenzionali");
        }
      }

      if (data.traceSubcategory) {
        labelsToKeep.push(data.traceSubcategory);
      }

      if (data.communitySubcategory) {
        labelsToKeep.push("Comunità");
        labelsToKeep.push(data.communitySubcategory);
      }

      cy.nodes().forEach((candidate) => {
        const label = candidate.data("label") || "";
        if (labelsToKeep.includes(label)) {
          contextNodeIds.add(candidate.id());
        }
      });
    }

    matchedNodes.forEach((node) => {
      addContextFromNode(node);
    });

    cy.nodes().forEach((node) => {
      if (focusNodeIds.has(node.id())) {
        node.removeClass("filter-faded");
        node.addClass("filter-focus");
      } else if (contextNodeIds.has(node.id())) {
        node.removeClass("filter-faded");
        node.addClass("filter-context");
      }
    });

    cy.edges().forEach((edge) => {
      const sourceId = edge.source().id();
      const targetId = edge.target().id();

      if (
        (focusNodeIds.has(sourceId) || contextNodeIds.has(sourceId)) &&
        (focusNodeIds.has(targetId) || contextNodeIds.has(targetId))
      ) {
        edge.removeClass("filter-faded");
        edge.addClass("filter-context");
      }
    });

    onNodeSelect(null);
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