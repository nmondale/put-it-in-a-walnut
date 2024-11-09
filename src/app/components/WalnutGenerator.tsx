"use client";

import { useEffect, useState } from "react";
import NutMeat from "./NutMeat";

// Types
interface WalnutGeneratorProps {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

// Utility class for deterministic random number generation
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

// Main Component
export default function WalnutGenerator({
  width,
  height,
}: WalnutGeneratorProps) {
  // State
  const [points, setPoints] = useState<string>("");
  const [inputSeed, setInputSeed] = useState<string>("walnut");
  const [currentSeed, setCurrentSeed] = useState<string>("walnut");
  const [isOpen, setIsOpen] = useState(false);

  // Helpers
  const generatePoints = (
    rng: SeededRandom,
    numPoints: number,
    baseRadius: number,
    center: Point
  ) => {
    const points: Point[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const angle = Math.PI / 2 + (Math.PI / numPoints) * i;
      const radiusVariation = 0.8 + rng.random() * 0.4;
      const radius = baseRadius * radiusVariation;

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
    const controlX = p1.x + (midX - p1.x) * (cornerRadius / 30);
    const controlY = p1.y + (midY - p1.y) * (cornerRadius / 30);
    return `Q ${controlX} ${controlY} ${midX} ${midY}`;
  };

  // Main generation function
  const generateWalnut = (seedString: string) => {
    const rng = new SeededRandom(seedString);
    const center = { x: width / 2, y: height / 2 };
    const numPoints = Math.floor(rng.random() * 30) + 4;
    const baseRadius = Math.min(width, height) * 0.4;
    const cornerRadius = rng.random() * 15;

    // Generate left side
    const leftSidePoints = generatePoints(rng, numPoints, baseRadius, center);

    // Generate path
    const pathPoints: string[] = [];
    pathPoints.push(`M ${leftSidePoints[0].x} ${leftSidePoints[0].y}`);

    // Add left side corners
    for (let i = 1; i < leftSidePoints.length; i++) {
      pathPoints.push(
        createRoundedCorner(
          leftSidePoints[i - 1],
          leftSidePoints[i],
          cornerRadius
        )
      );
    }

    // Mirror points for right side
    const rightSidePoints = leftSidePoints
      .map((p) => ({ x: center.x + (center.x - p.x), y: p.y }))
      .reverse();

    // Add right side corners
    for (let i = 0; i < rightSidePoints.length - 1; i++) {
      pathPoints.push(
        createRoundedCorner(
          rightSidePoints[i],
          rightSidePoints[i + 1],
          cornerRadius
        )
      );
    }

    // Close the path
    pathPoints.push(
      createRoundedCorner(
        rightSidePoints[rightSidePoints.length - 1],
        leftSidePoints[0],
        cornerRadius
      )
    );

    setPoints(pathPoints.join(" "));
  };

  // Event handlers
  const handleSave = () => setCurrentSeed(inputSeed);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  // Effects
  useEffect(() => {
    generateWalnut(currentSeed);
  }, [currentSeed]);

  // Render
  return (
    <div className="relative">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={inputSeed}
          onChange={(e) => setInputSeed(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-4 py-2 bg-transparent border border-white rounded text-white"
          placeholder="Enter seed text..."
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-white rounded text-white 
                   hover:bg-white hover:text-black transition-colors"
        >
          Generate
        </button>
      </div>
      <svg
        width={width}
        height={height}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer relative"
      >
        <path
          d={points}
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          className="transition-all duration-300 hover:stroke-gray-300"
        />
      </svg>
      <NutMeat
        width={width}
        height={height}
        seed={currentSeed}
        visible={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
