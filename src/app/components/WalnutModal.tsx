"use client";

import { useState, useRef, useEffect } from "react";
import Walnut from "./Walnut";
import NutMeat from "./NutMeat";
import MightyTree from "../assets/MightyTree.svg";
import Lippie from "../assets/Lippie.svg";
import Dialog from "./Dialog";
import "../styles/Styles.css";

// Constants
const DEFAULT_TREE_MESSAGE =
  "i hope you like the walnut i made for you. it's unique to the message i received. give the walnut a kiss and she might let you see her nut meats.";

// Types
interface WalnutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  seed: string;
}

// Utility functions
const getRandomAngle = () => Math.random() * 60 - 30;

export default function WalnutModal({
  isOpen,
  onClose,
  onReset,
  seed,
}: WalnutModalProps) {
  // State
  const [showNutMeat, setShowNutMeat] = useState(false);
  const [treeMessage, setTreeMessage] = useState(DEFAULT_TREE_MESSAGE);
  const [showTreeDialog, setShowTreeDialog] = useState(true);
  const [isSplitting, setIsSplitting] = useState(false);
  const [showLippie, setShowLippie] = useState(false);
  const [lippiePosition, setLippiePosition] = useState({ x: 0, y: 0 });
  const [lippieAngle, setLippieAngle] = useState(0);

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const bottomShellRef = useRef<HTMLDivElement>(null);
  const topShellRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    if (isOpen) {
      setShowTreeDialog(true);
      setShowNutMeat(false);
      setTreeMessage(DEFAULT_TREE_MESSAGE);
      setIsSplitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!showNutMeat) {
      setTreeMessage(DEFAULT_TREE_MESSAGE);
    }
  }, [showNutMeat]);

  // Event Handlers
  const handleWalnutClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLippiePosition({ x, y });
    setLippieAngle(getRandomAngle());
    setShowLippie(true);

    setTimeout(() => setShowLippie(false), 1000);

    const newSplittingState = !isSplitting;
    setIsSplitting(newSplittingState);
    setShowNutMeat(true);

    setTreeMessage(
      newSplittingState ? "she must really like you" : DEFAULT_TREE_MESSAGE
    );
  };

  const handleClose = () => {
    // Reset all modal states
    setShowNutMeat(false);
    setShowTreeDialog(true);
    setTreeMessage(DEFAULT_TREE_MESSAGE);
    setIsSplitting(false);
    setShowLippie(false);
    // Call parent close handler
    onClose();
  };

  const handleReset = () => {
    // Reset all modal states
    setShowNutMeat(false);
    setShowTreeDialog(true);
    setTreeMessage(DEFAULT_TREE_MESSAGE);
    setIsSplitting(false);
    setShowLippie(false);
    // Call parent reset handler
    onReset();
  };

  const handleDownload = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      canvas.height = 400;
      // Set background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 400, 400);
      // Function to draw SVG to canvas
      const drawSVGToCanvas = (element: SVGSVGElement): Promise<void> => {
        return new Promise((resolve) => {
          const svgString = new XMLSerializer().serializeToString(element);
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      };
      // Create temporary SVG elements for the split state
      const tempSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      tempSvg.setAttribute("width", "400");
      tempSvg.setAttribute("height", "400");
      // Clone the nut meat and walnut paths
      const nutMeatPath = document
        .querySelector('svg path[stroke="#ffffff"]')
        ?.cloneNode(true) as SVGPathElement;
      const walnutPath = document
        .querySelector(".cursor-pointer svg path")
        ?.cloneNode(true) as SVGPathElement;
      if (!nutMeatPath || !walnutPath) {
        throw new Error("SVG paths not found");
      }
      // Set attributes for visibility
      nutMeatPath.setAttribute("fill", "none");
      nutMeatPath.setAttribute("stroke", "#ffffff");
      nutMeatPath.setAttribute("stroke-width", "2");
      walnutPath.setAttribute("fill", "black");
      walnutPath.setAttribute("stroke", "#ffffff");
      walnutPath.setAttribute("stroke-width", "2");
      nutMeatPath.setAttribute("stroke", "#ffffff");
      // Add paths to temporary SVG in correct order
      tempSvg.appendChild(nutMeatPath);
      tempSvg.appendChild(walnutPath);
      // Draw the combined SVG to canvas
      await drawSVGToCanvas(tempSvg);
      // Convert to PNG and download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `walnut-${seed}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error downloading walnut:", err);
    }
  };

  // Component Sections
  const TreeDialogSection = () => (
    <div className="flex items-center">
      <div className="w-[130px] h-[130px] border border-white p-4 bg-black overflow-hidden mr-[-1px]">
        <MightyTree
          width="350%"
          height="350%"
          className="mighty-tree -translate-x-[30%] -translate-y-[10%]"
        />
      </div>
      {showTreeDialog && <Dialog text={treeMessage} variant="modal" />}
    </div>
  );

  const ButtonSection = () => (
    <div className="flex flex-col h-full border border-white ml-[-1px]">
      <button
        onClick={handleClose}
        className="flex-1 py-2 px-4 text-white hover:bg-white hover:text-black text-left"
      >
        ✣ close this screen
      </button>
      <button
        onClick={handleDownload}
        className="flex-1 border-t border-white py-2 px-4 text-white hover:bg-white hover:text-black text-left"
      >
        ↶ download walnut pic
      </button>
      <button
        onClick={handleReset}
        className="flex-1 border-t border-white py-2 px-4 text-white hover:bg-white hover:text-black text-left"
      >
        ↩ make another walnut
      </button>
    </div>
  );

  const WalnutSection = () => (
    <div className="flex-1 flex items-center justify-center -mt-10">
      <div
        className="relative cursor-pointer w-[400px] h-[400px]"
        onClick={handleWalnutClick}
      >
        {showLippie && (
          <div
            className="lippie-container"
            style={{
              left: `${lippiePosition.x}px`,
              top: `${lippiePosition.y}px`,
              transform: `translate(-50%, -50%) rotate(${lippieAngle}deg)`,
              opacity: 1,
            }}
          >
            <Lippie width={150} height={150} className="lippie-svg" />
          </div>
        )}
        <div
          ref={bottomShellRef}
          className={`absolute inset-0 ${
            isSplitting ? "-translate-x-[200px]" : ""
          }`}
        >
          <Walnut seed={seed} width={400} height={400} />
        </div>
        <div
          className={`absolute inset-0 ${
            isSplitting ? "-translate-x-[200px]" : ""
          }`}
        >
          <NutMeat
            width={400}
            height={400}
            seed={seed}
            visible={showNutMeat}
            onToggle={() => {
              setIsSplitting(false);
              setShowNutMeat(false);
            }}
          />
        </div>
        <div
          ref={topShellRef}
          className={`absolute inset-0 ${
            isSplitting ? "translate-x-[200px]" : ""
          }`}
        >
          <Walnut seed={seed} width={400} height={400} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-black border border-white p-8 items-center w-[80vw] h-[80vh] flex flex-col relative"
      >
        <div className="flex">
          <TreeDialogSection />
          <ButtonSection />
        </div>
        <WalnutSection />
      </div>
    </div>
  );
}
