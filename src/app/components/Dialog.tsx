import { useState, useEffect } from "react";

interface DialogProps {
  text: string;
  speed?: number;
  variant?: "default" | "modal";
}

export default function Dialog({
  text,
  speed = 25,
  variant = "default",
}: DialogProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  const widthClass = variant === "modal" ? "w-[45vw]" : "w-[40vw]";

  return (
    <div
      className={`bg-black border border-white p-4 h-[130px] ${widthClass} relative`}
    >
      <div className="text-white">{displayedText}</div>
    </div>
  );
}
