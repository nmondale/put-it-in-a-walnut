import { useState, useEffect } from "react";
import Hello from "../assets/hello.svg";
import Down from "../assets/down.svg";
import Standard from "../assets/standard.svg";
import Whisper from "../assets/whisper.svg";
import Dialog from "./Dialog";

type MascotMode = "hello" | "down" | "standard" | "whisper";

interface MascotProps {
  mode?: MascotMode;
  width?: string;
  height?: string;
  className?: string;
  message?: string;
}

export default function Mascot({
  mode = "hello",
  width = "200px",
  height = "200px",
  className,
  message = "",
}: MascotProps) {
  const getMascotSVG = () => {
    switch (mode) {
      case "down":
        return <Down width={width} height={height} className={className} />;
      case "standard":
        return <Standard width={width} height={height} className={className} />;
      case "whisper":
        return <Whisper width={width} height={height} className={className} />;
      default:
        return <Hello width={width} height={height} className={className} />;
    }
  };

  return (
    <div className="flex items-center gap-4 mb-[-1px]">
      <div className={`mascot-svg ${className}`}>{getMascotSVG()}</div>
      <Dialog text={message} />
    </div>
  );
}
