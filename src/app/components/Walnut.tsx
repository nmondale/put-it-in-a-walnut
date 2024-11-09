"use client";
import { useEffect, useState } from "react";

interface WalnutProps {
  seed: string;
  width: number;
  height: number;
  className?: string;
  transform?: string;
}

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

export default function Walnut({
  seed,
  width,
  height,
  className,
}: WalnutProps) {
  const [points, setPoints] = useState<string>("");

  const generatePoints = (
    rng: SeededRandom,
    numPoints: number,
    baseRadius: number,
    center: { x: number; y: number }
  ) => {
    const points = [];
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

  const createRoundedCorner = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    cornerRadius: number
  ) => {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const controlX = p1.x + (midX - p1.x) * (cornerRadius / 30);
    const controlY = p1.y + (midY - p1.y) * (cornerRadius / 30);
    return `Q ${controlX} ${controlY} ${midX} ${midY}`;
  };

  useEffect(() => {
    const rng = new SeededRandom(seed);
    const center = { x: width / 2, y: height / 2 };
    const numPoints = Math.floor(rng.random() * 30) + 4;
    const baseRadius = Math.min(width, height) * 0.4;
    const cornerRadius = rng.random() * 15;

    const leftSidePoints = generatePoints(rng, numPoints, baseRadius, center);
    const pathPoints: string[] = [];
    pathPoints.push(`M ${leftSidePoints[0].x} ${leftSidePoints[0].y}`);

    for (let i = 1; i < leftSidePoints.length; i++) {
      pathPoints.push(
        createRoundedCorner(
          leftSidePoints[i - 1],
          leftSidePoints[i],
          cornerRadius
        )
      );
    }

    const rightSidePoints = leftSidePoints
      .map((p) => ({ x: center.x + (center.x - p.x), y: p.y }))
      .reverse();

    for (let i = 0; i < rightSidePoints.length - 1; i++) {
      pathPoints.push(
        createRoundedCorner(
          rightSidePoints[i],
          rightSidePoints[i + 1],
          cornerRadius
        )
      );
    }

    pathPoints.push(
      createRoundedCorner(
        rightSidePoints[rightSidePoints.length - 1],
        leftSidePoints[0],
        cornerRadius
      )
    );

    setPoints(pathPoints.join(" "));
  }, [seed, width, height]);

  return (
    <svg width={width} height={height} className={className}>
      <g className="transition-transform duration-500 ease-in-out">
        <path d={points} stroke="#ffffff" strokeWidth="1" fill="black" />
      </g>
    </svg>
  );
}
