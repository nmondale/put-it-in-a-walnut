"use client";

import { useEffect, useState } from "react";

interface NutMeatProps {
  width: number;
  height: number;
  seed: string;
  visible: boolean;
  onToggle: () => void;
}

interface Point {
  x: number;
  y: number;
}

// Configuration object for easy tweaking
const NUT_MEAT_CONFIG = {
  // Size and position
  baseRadiusRatio: 0.25, // Ratio of min(width, height)
  verticalOffsetRatio: 0.02, // Ratio of height for vertical positioning
  horizontalOffsetRatio: 0.1, // Ratio for spacing between halves
  lengthMultiplier: 1, // New parameter to control nut meat length

  // Shape generation
  minPoints: 15,
  maxPoints: 40,
  cornerRadiusMax: 15,

  // Main curve parameters
  outerRadiusRatio: 0.9, // Multiplier for the outer curve radius
  innerRadiusRatio: 0.7, // Multiplier for the inner curve radius
  radiusVariation: {
    min: 0.8,
    max: 1.0, // 0.8 + 0.2
  },

  // Protrusion parameters
  minProtrusions: 3,
  maxProtrusions: 7,
  protrusionStrengthMax: 0.4,
  protrusionSharpnessMin: 5,
  protrusionSharpnessMax: 20,
  protrusionThreshold: 0.9,

  // Visual style
  strokeWidth: 1,
  strokeColor: "#ffffff",
} as const;

// Reuse the SeededRandom class from WalnutGenerator
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

export default function NutMeat({
  width,
  height,
  seed,
  visible,
  onToggle,
}: NutMeatProps) {
  const [points, setPoints] = useState<string>("");

  const generatePoints = (
    rng: SeededRandom,
    numPoints: number,
    baseRadius: number,
    center: Point,
    isLeftSide: boolean
  ) => {
    const points: Point[] = [];

    // Adjust angles based on whether it's the left or right side
    const startAngle = isLeftSide ? Math.PI * 1.5 : Math.PI * 0.5; // Start from bottom
    const endAngle = isLeftSide ? Math.PI * 0.5 : Math.PI * 1.5; // End at top
    const angleSpan = endAngle - startAngle;

    // Calculate number of protrusions
    const numProtrusions =
      Math.floor(
        rng.random() *
          (NUT_MEAT_CONFIG.maxProtrusions - NUT_MEAT_CONFIG.minProtrusions + 1)
      ) + NUT_MEAT_CONFIG.minProtrusions;
    const protrusionAngles: number[] = [];

    // Generate random angles for protrusions
    for (let i = 0; i < numProtrusions; i++) {
      protrusionAngles.push(startAngle + rng.random() * angleSpan);
    }

    // Generate points along the C shape
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const angle = startAngle + angleSpan * t;

      // Base radius with variation
      let radius =
        baseRadius *
        NUT_MEAT_CONFIG.lengthMultiplier *
        (NUT_MEAT_CONFIG.radiusVariation.min +
          rng.random() *
            (NUT_MEAT_CONFIG.radiusVariation.max -
              NUT_MEAT_CONFIG.radiusVariation.min));

      // Add protrusions
      for (const protrusionAngle of protrusionAngles) {
        const angleDiff = Math.abs(angle - protrusionAngle);
        if (angleDiff < 0.5) {
          // Create a protrusion
          const protrusionStrength = rng.random() * 0.4; // Random length
          const protrusionSharpness = 5 + rng.random() * 15; // Random pointiness
          radius +=
            baseRadius *
            protrusionStrength *
            Math.exp(-protrusionSharpness * angleDiff * angleDiff);
        }
      }

      // Calculate point position
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }

    // Close the C shape with an inner curve
    const innerRadius = baseRadius * 0.4;
    const innerPoints = Math.floor(numPoints / 3);

    for (let i = 0; i <= innerPoints; i++) {
      const t = i / innerPoints;
      const angle = endAngle - angleSpan * t;
      const radius = innerRadius * (0.8 + rng.random() * 0.2);

      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }

    return points;
  };

  const createRoundedCorner = (p1: Point, p2: Point, cornerRadius: number) => {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const controlX = p1.x + (midX - p1.x) * (cornerRadius / 20);
    const controlY = p1.y + (midY - p1.y) * (cornerRadius / 20);
    return `Q ${controlX} ${controlY} ${midX} ${midY}`;
  };

  const generateNutMeat = (seedString: string) => {
    const rng = new SeededRandom(seedString + "_pearl");
    const verticalOffset = height * NUT_MEAT_CONFIG.verticalOffsetRatio;
    const center = { x: width / 2, y: height / 2 + verticalOffset };
    const numPoints =
      Math.floor(rng.random() * NUT_MEAT_CONFIG.maxPoints) +
      NUT_MEAT_CONFIG.minPoints;
    const baseRadius =
      Math.min(width, height) * NUT_MEAT_CONFIG.baseRadiusRatio;
    const cornerRadius = rng.random() * NUT_MEAT_CONFIG.cornerRadiusMax;

    // Offset the centers for left and right halves
    const offset = baseRadius * NUT_MEAT_CONFIG.horizontalOffsetRatio;
    const leftCenter = { x: center.x - offset, y: center.y };
    const rightCenter = { x: center.x + offset, y: center.y };

    // Generate points for left half
    const leftHalfPoints = generatePoints(
      rng,
      numPoints,
      baseRadius * 0.9,
      leftCenter,
      true
    );
    const leftPathPoints: string[] = [];
    leftPathPoints.push(`M ${leftHalfPoints[0].x} ${leftHalfPoints[0].y}`);

    // Create left half shape
    for (let i = 1; i < leftHalfPoints.length; i++) {
      leftPathPoints.push(
        createRoundedCorner(
          leftHalfPoints[i - 1],
          leftHalfPoints[i],
          cornerRadius
        )
      );
    }
    // Close the left path
    leftPathPoints.push("Z");

    // Generate points for right half (mirror of left half)
    const rightHalfPoints = leftHalfPoints.map((p) => ({
      x: center.x + (center.x - p.x),
      y: p.y,
    }));
    const rightPathPoints: string[] = [];
    rightPathPoints.push(`M ${rightHalfPoints[0].x} ${rightHalfPoints[0].y}`);

    // Create right half shape
    for (let i = 1; i < rightHalfPoints.length; i++) {
      rightPathPoints.push(
        createRoundedCorner(
          rightHalfPoints[i - 1],
          rightHalfPoints[i],
          cornerRadius
        )
      );
    }
    // Close the right path
    rightPathPoints.push("Z");

    // Combine both paths
    setPoints(leftPathPoints.join(" ") + " " + rightPathPoints.join(" "));
  };

  useEffect(() => {
    generateNutMeat(seed);
  }, [seed]);

  if (!visible) return null;

  return (
    <svg
      width={width}
      height={height}
      className="absolute top-0 left-0 transition-opacity duration-300 cursor-pointer"
      style={{ opacity: visible ? 1 : 0 }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering the shell's click event
        onToggle();
      }}
    >
      <path
        d={points}
        stroke={NUT_MEAT_CONFIG.strokeColor}
        strokeWidth={NUT_MEAT_CONFIG.strokeWidth}
      />
    </svg>
  );
}
