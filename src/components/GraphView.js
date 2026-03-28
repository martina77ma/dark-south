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

  useEffect(() => {
    if (!elements.length) return;

    const cy = cytoscape({
      container: ref.current,
      elements,
      layout: { name: "cose" },

      style: [
        // STILE BASE NODI
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
            "font-family": "Inter, sans-serif",
            width: "data(size)",
            height: "data(size)"
          }
        },

        // ETICHETTE SEMPRE VISIBILI SOLO PER I NODI GRANDI (> 46)
        {
          selector: 'node[size > 46]',
          style: {
            label: "data(label)",
            "font-size": 12,
            "font-family": "Poppins, sans-serif",
            "font-weight": 600,
            color: "#ffffff",
            "text-valign": "center",
            "text-halign": "center",
            "text-margin-y": 0
          }
        },

        // ETICHETTE TEMPORANEE PER NODI PICCOLI (hover/click)
        {
          selector: ".show-label",
          style: {
            label: "data(label)",
            "font-size": 11,
            "font-family": "Inter, sans-serif",
            color: "#111827",
            "text-valign": "top",
            "text-halign": "center",
            "text-margin-y": -10,
            "text-background-opacity": 1,
            "text-background-color": "#ffffff",
            "text-background-padding": 2
          }
        },

        // TEMATISMI
        {
          selector: 'node[editorSection = "Tematismi"]',
          style: {
            "background-color": "#111827"
          }
        },

        // EVENTI (base)
        {
          selector: 'node[eventCategory = "Eventi"]',
          style: {
            "background-color": "#dc2626"
          }
        },

        // EVENTI - sottocategorie
        {
          selector: 'node[eventSubcategory = "Rivolte"]',
          style: {
            "background-color": "#ef4444"
          }
        },
        {
          selector: 'node[eventSubcategory = "Pratiche di segregazione"]',
          style: {
            "background-color": "#b91c1c"
          }
        },
        {
          selector: 'node[eventSubcategory = "Confino"]',
          style: {
            "background-color": "#7f1d1d"
          }
        },
        {
          selector: 'node[eventSubcategory = "Fatalità"]',
          style: {
            "background-color": "#f97316"
          }
        },
        {
          selector: 'node[eventSubcategory = "Stragi e attentati"]',
          style: {
            "background-color": "#ea580c"
          }
        },
        {
          selector: 'node[eventSubcategory = "Politica"]',
          style: {
            "background-color": "#fb7185"
          }
        },
        {
          selector: 'node[eventSubcategory = "Lavoro"]',
          style: {
            "background-color": "#f59e0b"
          }
        },
        {
          selector: 'node[eventSubcategory = "Conflitti"]',
          style: {
            "background-color": "#e11d48"
          }
        },

        // LUOGHI
        {
          selector: 'node[editorSection = "Luoghi"]',
          style: {
            "background-color": "#2563eb"
          }
        },

        // TRACCE
        {
          selector: 'node[traceCategory = "Tracce"]',
          style: {
            "background-color": "#960579"
          }
        },
        {
          selector: 'node[traceCategory = "Tracce intenzionali"]',
          style: {
            "background-color": "#b97b10"
          }
        },
        {
          selector: 'node[traceCategory = "Tracce non intenzionali"]',
          style: {
            "background-color": "#d39e34"
          }
        },

        // TRACCE - sottocategorie specifiche
        {
          selector: 'node[traceSubcategory = "Musei"]',
          style: {
            "background-color": "#a16207"
          }
        },
        {
          selector: 'node[traceSubcategory = "Memoriali"]',
          style: {
            "background-color": "#b45309"
          }
        },
        {
          selector: 'node[traceSubcategory = "Monumenti"]',
          style: {
            "background-color": "#c2410c"
          }
        },
        {
          selector: 'node[traceSubcategory = "Altri dispositivi di spazializzazione"]',
          style: {
            "background-color": "#d97706"
          }
        },
        {
          selector: 'node[traceSubcategory = "Segni"]',
          style: {
            "background-color": "#ca8a04"
          }
        },
        {
          selector: 'node[traceSubcategory = "Edifici"]',
          style: {
            "background-color": "#a16207"
          }
        },
        {
          selector: 'node[traceSubcategory = "Spazi urbani"]',
          style: {
            "background-color": "#b45309"
          }
        },
        {
          selector: 'node[traceSubcategory = "Paesaggi"]',
          style: {
            "background-color": "#d97706"
          }
        },

        // COMUNITÀ
        {
          selector: 'node[communityCategory = "Comunità"]',
          style: {
            "background-color": "#7c3aed"
          }
        },
        {
          selector: 'node[communitySubcategory = "Riconoscimento"]',
          style: {
            "background-color": "#8b5cf6"
          }
        },
        {
          selector: 'node[communitySubcategory = "Modalità di fruizione"]',
          style: {
            "background-color": "#a78bfa"
          }
        },

        // SEZIONE SPECIALE: CARCERI
        {
          selector: 'node[editorSection = "Carceri"]',
          style: {
            "background-color": "#020617",
            "border-width": 1,
            "border-color": "#60a5fa"
          }
        },

        // SEZIONE SPECIALE: CAMPI DI CONCENTRAMENTO E INTERNAMENTO
        {
          selector: 'node[editorSection = "Campi di concentramento e internamento"]',
          style: {
            "background-color": "#d911b1",
            "border-width": 1,
            "border-color": "#bfd121"
          }
        },

        // NODI PRINCIPALI (livello 1)
        {
          selector: 'node[editorSection = "Tematismi"]',
          style: {
            "background-color": "#1f2937"
          }
        },

        // ARCHI NORMALI
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#d1d5db",
            "curve-style": "bezier",
            opacity: 0.6,
            "transition-property": "opacity, width, line-color",
            "transition-duration": "220ms"
          }
        },

        // ARCHI ATTENUATI DURANTE PAN/ZOOM
        {
          selector: ".interaction-edge-muted",
          style: {
            opacity: 0.06
          }
        },

        // STATO ATTENUATO GENERICO
        {
          selector: ".faded",
          style: {
            opacity: 0.15
          }
        },

        // NODO ATTIVO GENERICO
        {
          selector: ".active-node",
          style: {
            "border-width": 4,
            "border-color": "#111827",
            opacity: 1
          }
        },

        // NODI VICINI GENERICI
        {
          selector: ".neighbor-node",
          style: {
            opacity: 1,
            "border-width": 2,
            "border-color": "#6b7280"
          }
        },

        // RISULTATO DELLA RICERCA
        {
          selector: ".search-match",
          style: {
            "border-width": 4,
            "border-color": "#facc15",
            opacity: 1
          }
        },

        // ELEMENTI ATTENUATI DALLA RICERCA
        {
          selector: ".search-faded",
          style: {
            opacity: 0.08
          }
        },

        // FUORI DAL FILTRO
        {
          selector: ".filter-faded",
          style: {
            opacity: 0.08
          }
        },

        // NODI FINALI TROVATI DAI FILTRI
        {
          selector: ".filter-focus",
          style: {
            opacity: 1,
            "border-width": 4,
            "border-color": "#111827"
          }
        },

        // CONTESTO DEL PERCORSO
        {
          selector: ".filter-context",
          style: {
            opacity: 0.7
          }
        },

        // ALTRI NODI FINALI NON CLICCATI
        {
          selector: ".filter-secondary",
          style: {
            opacity: 0.18
          }
        },

        // ARCHI ATTIVI GENERICI
        {
          selector: ".active-edge",
          style: {
            width: 3,
            "line-color": "#111827",
            opacity: 1
          }
        }
      ]
    });

    let interactionTimeout;

    function clearFocus() {
      cy.elements().removeClass(
        "faded active-node neighbor-node active-edge show-label clicked-label filter-focus filter-context filter-secondary filter-faded interaction-edge-muted"
      );
    }

    function muteEdgesDuringInteraction() {
      cy.edges().addClass("interaction-edge-muted");

      clearTimeout(interactionTimeout);

      interactionTimeout = setTimeout(() => {
        cy.edges().removeClass("interaction-edge-muted");
      }, 220);
    }

    function applySearch(term) {
      cy.elements().removeClass("search-match search-faded");

      const normalized = term.trim().toLowerCase();

      if (!normalized) {
        return;
      }

      const matchedNodes = cy.nodes().filter((node) => {
        const keywords = node.data("keywords") || [];

        if (!Array.isArray(keywords)) {
          return false;
        }

        return keywords.some((keyword) =>
          String(keyword).toLowerCase().includes(normalized)
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
      });

      if (matchedNodes.length === 1) {
        onNodeSelect(matchedNodes[0].data());
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
      const size = node.data("size");

      if (size <= 46) {
        node.addClass("show-label");
      }
    });

    cy.on("mouseout", "node", (e) => {
      const node = e.target;
      const size = node.data("size");

      if (size <= 46 && !node.hasClass("clicked-label")) {
        node.removeClass("show-label");
      }
    });

    cy.on("tap", "node", (e) => {
      const node = e.target;

      onNodeSelect(node.data());

      cy.nodes().removeClass("clicked-label");
      cy.nodes().removeClass("show-label");

      const size = node.data("size");
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

      node.removeClass("faded");
      node.addClass("active-node");

      const neighborhood = node.neighborhood();
      neighborhood.removeClass("faded");

      node.connectedEdges().addClass("active-edge");
      node.connectedNodes().addClass("neighbor-node");
    });

    cy.on("tap", (e) => {
      if (e.target === cy) {
        clearFocus();
        onNodeSelect(null);
        applySearch(searchTerm || "");
        applyFilters();
      }
    });

    // DURANTE PAN E ZOOM GLI ARCHI SI ATTENUANO MOLTO
    cy.on("pan zoom", () => {
      muteEdgesDuringInteraction();
    });

    clearFocus();
    applySearch(searchTerm || "");
    applyFilters();

    return () => {
      clearTimeout(interactionTimeout);
      cy.destroy();
    };
  }, [
    elements,
    onNodeSelect,
    searchTerm,
    eventSubcategory,
    eventDetail,
    placeCategory,
    traceCategory,
    traceSubcategory,
    communitySubcategory
  ]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}