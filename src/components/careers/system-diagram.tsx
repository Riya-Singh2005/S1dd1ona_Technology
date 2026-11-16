"use client";

import React from "react";
import { cn } from "@/lib/utils";
import styles from "./careers.module.css";

/**
 * The careers hero's system diagram.
 *
 * People, Business and Technology route into Integration. That is the
 * argument Siddiona makes about its own work, so the drawing states it
 * literally: three disciplines, real orthogonal connections, one
 * convergence point, and a signal that only ever travels toward it.
 *
 * Motion is isolated in the careers CSS module, so it runs off the main
 * thread and keeps going smoothly while the rest of the page hydrates.
 */

interface SourceNode {
  id: string;
  label: string;
  y: number;
  /** Orthogonal route from the node, into the bus, then to the core. */
  path: string;
  delay: string;
}

const BUS_X = 272;
const CORE_X = 430;
const CORE_Y = 200;
const SOURCE_X = 92;

const SOURCES: SourceNode[] = [
  {
    id: "people",
    label: "People",
    y: 64,
    path: `M ${SOURCE_X} 64 H ${BUS_X} V ${CORE_Y} H ${CORE_X}`,
    delay: "0s",
  },
  {
    id: "business",
    label: "Business",
    y: CORE_Y,
    path: `M ${SOURCE_X} ${CORE_Y} H ${CORE_X}`,
    delay: "1.05s",
  },
  {
    id: "technology",
    label: "Technology",
    y: 336,
    path: `M ${SOURCE_X} 336 H ${BUS_X} V ${CORE_Y} H ${CORE_X}`,
    delay: "2.1s",
  },
];

export interface SystemDiagramProps {
  /** Held false until the branded loader hands off, so nothing animates unseen. */
  ready?: boolean;
  className?: string;
}

export function SystemDiagram({ ready = false, className }: SystemDiagramProps) {
  return (
    <svg
      viewBox="0 0 520 400"
      role="img"
      aria-labelledby="careers-system-diagram-title"
      className={cn(styles.diagram, ready && styles.diagramReady, className)}
    >
      <title id="careers-system-diagram-title">
        A diagram showing People, Business and Technology converging on Integration.
      </title>

      {/* Base traces sit underneath, so a pulse reads as a signal on an
          existing connection rather than as the connection itself. */}
      {SOURCES.map((source) => (
        <path key={`trace-${source.id}`} d={source.path} className={styles.diagramTrace} />
      ))}

      {SOURCES.map((source) => (
        <path
          key={`pulse-${source.id}`}
          d={source.path}
          className={styles.diagramPulse}
          style={{ "--pulse-delay": source.delay } as React.CSSProperties}
        />
      ))}

      {/* Source markers. 9px squares, the same marker the site uses for
          its navigation and section eyebrows. */}
      {SOURCES.map((source) => (
        <g key={`node-${source.id}`}>
          <rect
            x={SOURCE_X - 4.5}
            y={source.y - 4.5}
            width={9}
            height={9}
            className={styles.diagramNode}
          />
          <text
            x={SOURCE_X - 6}
            y={source.y - 18}
            className={styles.diagramLabel}
            textAnchor="start"
          >
            {source.label}
          </text>
        </g>
      ))}

      {/* The convergence point, marked differently because it is the
          outcome rather than another input. */}
      <circle cx={CORE_X} cy={CORE_Y} r={19} className={styles.diagramNodeRing} />
      <circle cx={CORE_X} cy={CORE_Y} r={9} className={styles.diagramNode} />
      <circle cx={CORE_X} cy={CORE_Y} r={3} className={styles.diagramCore} />
      <text
        x={CORE_X}
        y={CORE_Y - 38}
        className={cn(styles.diagramLabel, styles.diagramLabelAccent)}
        textAnchor="middle"
      >
        Integration
      </text>
    </svg>
  );
}

export default SystemDiagram;
