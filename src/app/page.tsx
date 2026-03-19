"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useMotionValueEvent, useTransform, AnimatePresence } from "motion/react";
import { useRef } from "react";
import GlitchLogo from "./GlitchLogo";
import PhotoCarousel from "./PhotoCarousel";
import useWindowSize from "./useWindowSize";

const font = "AT Season Sans VF, system-ui, sans-serif";

// Motion tokens inspired by addmore.studio
const ease = {
  default: [0.4, 0, 0.2, 1] as const,
  enter: [0.625, 0.05, 0, 1] as const,
  exit: [0.625, 0, 0.875, 0] as const,
};

function AnimateIn({
  children,
  delay = 0,
  y = 30,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, ease: ease.enter, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function Badge({
  label,
  variant = "light",
  gradientColors,
}: {
  label: string;
  variant?: "light" | "dark";
  gradientColors?: [string, string];
}) {
  const borderColor =
    variant === "dark" ? "rgba(255,255,255,0.23)" : "#E0DCDB";
  const textColor =
    variant === "dark" ? "rgba(255,255,255,0.86)" : "rgba(22,22,22,0.7)";
  const defaultGradient: [string, string] =
    variant === "dark"
      ? ["rgba(255,186,5,0.2)", "rgba(255,186,5,1)"]
      : ["rgba(221,4,168,0.2)", "rgba(221,4,168,1)"];
  const [from, to] = gradientColors || defaultGradient;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 4,
        border: `1px solid ${borderColor}`,
        fontFamily: font,
        fontWeight: 650,
        fontSize: 14,
        lineHeight: "1.35em",
        color: textColor,
        width: "fit-content",
      }}
    >
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: `linear-gradient(-90deg, ${from} 0%, ${to} 77%)`,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}

function Button({
  label,
  variant = "dark",
  onClick,
}: {
  label: string;
  variant?: "dark" | "light";
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const getBg = () => {
    if (variant === "dark") {
      if (pressed) return "rgba(22, 22, 22, 0.8)";
      if (hovered) return "rgba(22, 22, 22, 0.64)";
      return "#161616";
    }
    if (pressed) return "rgba(224, 220, 219, 0.86)";
    if (hovered) return "rgba(224, 220, 219, 0.86)";
    return "#FFFFFF";
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        fontFamily: font,
        fontWeight: 650,
        fontSize: 16,
        lineHeight: "1.35em",
        backgroundColor: getBg(),
        color: variant === "dark" ? "#FFFFFF" : "#161616",
        transition: "background-color 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function RegistrationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(600px, calc(100vw - 48px))",
          height: "min(1000px, calc(100vh - 96px))",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(0,0,0,0.1)",
            color: "#333",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
        <iframe
          src="https://airtable.com/embed/appHWy4gIswVEynIw/pagyK3KmohIOEsQ5H/form"
          style={{ width: "100%", height: "100%", border: "none" }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

function TypewriterLabel({
  text,
  delay = 0,
  speed = 60,
  inView,
}: {
  text: string;
  delay?: number;
  speed?: number;
  inView: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const prevTextRef = useRef(text);

  // Reset when text changes (for re-triggering on new content)
  useEffect(() => {
    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
      setDisplayText("");
      setStarted(false);
    }
  }, [text]);

  useEffect(() => {
    if (!inView || started) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [inView, delay, started]);

  useEffect(() => {
    if (!started) return;
    if (displayText.length >= text.length) return;
    const timer = setTimeout(() => {
      setDisplayText(text.substring(0, displayText.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [started, displayText, text, speed]);

  return (
    <span>
      {displayText}
      {started && displayText.length < text.length && (
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            backgroundColor: "#F797EF",
            marginLeft: 4,
            animation: "blink 1s step-end infinite",
            verticalAlign: "middle",
          }}
        />
      )}
    </span>
  );
}

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  isLast = false,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderTop: "1px solid #014D47",
        borderBottom: isLast ? "1px solid #014D47" : "none",
      }}
    >
      <button
        onClick={onClick}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 0",
          textAlign: "left",
          cursor: "pointer",
          background: "none",
          border: "none",
        }}
      >
        <span
          style={{
            fontFamily: font,
            fontWeight: 550,
            fontSize: 18,
            lineHeight: "1.35em",
            color: "#FFFFFF",
            opacity: 0.9,
            flex: 1,
          }}
        >
          {question}
        </span>
        <div
          style={{
            marginLeft: 16,
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: 4,
            border: "1px solid #014D47",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <path d="M8 10.5L3 5.5H13L8 10.5Z" fill="#FFFFFF" />
          </svg>
        </div>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              paddingBottom: 24,
              fontFamily: font,
              fontWeight: 550,
              fontSize: 16,
              lineHeight: "1.5em",
              color: "rgba(255,255,255,0.65)",
              margin: 0,
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

const speakerStates = [
  {
    heading: "50+ speakers",
    body: "Industry leaders, Airtable power users, and product visionaries sharing what they've built and what's next.",
    image: "/airspace-assets/speakers-new-1-47dd28.png",
    imageW: 2446,
    imageH: 2731,
  },
  {
    heading: "10+ sessions",
    body: "Teams from startups to the Fortune 500 — all building on Airtable and pushing the platform forward.",
    image: "/airspace-assets/speakers-new-2-455785.png",
    imageW: 2446,
    imageH: 2731,
  },
  {
    heading: "500+ builders",
    body: "Deep dives, live builds, and workshops designed to level up how you work with Airtable.",
    image: "/airspace-assets/speakers-new-3.png",
    imageW: 4096,
    imageH: 2730,
  },
];

function CompactSpeakerCard({
  state,
  overlays,
  font: f,
  isMobile,
  index,
}: {
  state: { heading: string; body: string; image: string; imageW: number; imageH: number };
  overlays: { vLines: string[]; hLines: string[]; fills: { left: string | number; top: string | number; w: string; h: string; bg: string }[] };
  font: string;
  isMobile: boolean;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const white = "rgba(255,255,255,0.23)";

  return (
    <div ref={ref} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          backgroundColor: "#161616",
          padding: isMobile ? "40px 20px" : "48px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h2
          style={{
            fontFamily: f,
            fontWeight: 550,
            fontSize: isMobile ? 48 : 64,
            lineHeight: "1em",
            color: "#FFFFFF",
            margin: 0,
          }}
        >
          <TypewriterLabel text={state.heading} inView={inView} speed={60} delay={0} />
        </h2>
        <p
          style={{
            fontFamily: f,
            fontWeight: 550,
            fontSize: 16,
            lineHeight: "1.35em",
            color: "#FFFFFF",
            margin: 0,
            maxWidth: isMobile ? "100%" : 500,
          }}
        >
          {state.body}
        </p>
      </div>
      <div style={{ width: "100%", aspectRatio: "4 / 3", position: "relative", overflow: "hidden" }}>
        <Image
          src={state.image}
          alt={state.heading}
          width={state.imageW}
          height={state.imageH}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {overlays.vLines.map((x, vi) => (
          <div key={`v-${vi}`} style={{ position: "absolute", left: x, top: 0, width: 1, height: "100%", backgroundColor: white, pointerEvents: "none", zIndex: 3 }} />
        ))}
        {overlays.hLines.map((y, hi) => (
          <div key={`h-${hi}`} style={{ position: "absolute", left: 0, top: y, width: "100%", height: 1, backgroundColor: white, pointerEvents: "none", zIndex: 3 }} />
        ))}
        {overlays.fills.map((fi, idx) => (
          <div
            key={`f-${idx}`}
            style={{ position: "absolute", left: fi.left, top: fi.top, width: fi.w, height: fi.h, background: fi.bg, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}
          >
            <div style={{ position: "absolute", inset: 0, filter: "url(#noise)", opacity: 0.3 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeakersSection({
  states,
  font,
  isMobile = false,
  isTablet = false,
}: {
  states: {
    heading: string;
    body: string;
    image: string;
    imageW: number;
    imageH: number;
  }[];
  font: string;
  isMobile?: boolean;
  isTablet?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [speakerOverlayVisible, setSpeakerOverlayVisible] = useState(false);
  const prevActiveRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      // How far we've scrolled into the container
      const scrolled = -rect.top;
      const scrollableDistance = containerHeight - viewportHeight;
      if (scrollableDistance <= 0) return;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      const segmentSize = 1 / states.length;
      const idx = Math.min(states.length - 1, Math.floor(progress / segmentSize));
      setActiveIndex(idx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [states.length]);

  // Re-trigger overlay animation when active index changes
  useEffect(() => {
    if (prevActiveRef.current !== activeIndex) {
      prevActiveRef.current = activeIndex;
      setSpeakerOverlayVisible(false);
      // Brief delay then animate in
      const timer = setTimeout(() => setSpeakerOverlayVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  // Trigger on first mount when section is in view
  useEffect(() => {
    const timer = setTimeout(() => setSpeakerOverlayVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const current = states[activeIndex];

  const isCompact = isMobile || isTablet;

  // On tablet/mobile, render stacked cards without scroll-jacking
  if (isCompact) {
    const greenGrad = "linear-gradient(-90deg, rgba(23, 114, 81, 0.2) 0%, rgba(23, 114, 94, 1) 77%)";
    const gold = "linear-gradient(180deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)";
    const pinkGrad = "linear-gradient(-90deg, rgba(221,4,168,0.2) 0%, rgba(221,4,168,1) 77%)";
    const white = "rgba(255,255,255,0.23)";

    const overlaySets = [
      {
        vLines: ["30%", "65%"],
        hLines: ["25%", "70%"],
        fills: [
          { left: 0, top: 0, w: "30%", h: "25%", bg: greenGrad },
          { left: "65%", top: "70%", w: "35%", h: "30%", bg: gold },
        ],
      },
      {
        vLines: ["40%", "75%"],
        hLines: ["35%", "60%"],
        fills: [
          { left: "75%", top: 0, w: "25%", h: "35%", bg: gold },
          { left: 0, top: "60%", w: "40%", h: "40%", bg: greenGrad },
        ],
      },
      {
        vLines: ["25%", "55%", "80%"],
        hLines: ["40%", "75%"],
        fills: [
          { left: "55%", top: 0, w: "25%", h: "40%", bg: greenGrad },
          { left: 0, top: "75%", w: "25%", h: "25%", bg: pinkGrad },
        ],
      },
    ];

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {states.map((s, i) => {
          const overlays = overlaySets[i];
          return (
            <CompactSpeakerCard key={i} state={s} overlays={overlays} font={font} isMobile={isMobile} index={i} />
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: `${states.length * 100}vh`,
        position: "relative",
        width: "100%",
      }}
    >
      <div
        ref={stickyRef}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        {/* Left: Dark bg */}
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: "#161616",
          }}
        />
        {/* Right: Photo */}
        <div
          style={{
            width: "50%",
            height: "100%",
            position: "relative",
          }}
        >
          {states.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: i === activeIndex ? 1 : 0,
                transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Image
                src={s.image}
                alt={s.heading}
                width={s.imageW}
                height={s.imageH}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
          {/* Hover grid overlay */}
          {(() => {
            const greenGrad = "linear-gradient(-90deg, rgba(23, 114, 81, 0.2) 0%, rgba(23, 114, 94, 1) 77%)";
            const gold = "linear-gradient(180deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)";
            const white = "rgba(255,255,255,0.23)";

            const overlaySets = [
              {
                vLines: ["30%", "65%"],
                hLines: ["25%", "70%"],
                fills: [
                  { left: 0, top: 0, w: "30%", h: "25%", bg: greenGrad, wipe: "right" as const, delay: 0.05 },
                  { left: "65%", top: "70%", w: "35%", h: "30%", bg: gold, wipe: "top" as const, delay: 0.15 },
                ],
                tile: { left: "30%", top: "25%", wipe: "bottom" as const, delay: 0.2 },
              },
              {
                vLines: ["40%", "75%"],
                hLines: ["35%", "60%"],
                fills: [
                  { left: "75%", top: 0, w: "25%", h: "35%", bg: gold, wipe: "bottom" as const, delay: 0.05 },
                  { left: 0, top: "60%", w: "40%", h: "40%", bg: greenGrad, wipe: "right" as const, delay: 0.1 },
                ],
                tile: null,
              },
              {
                vLines: ["25%", "55%", "80%"],
                hLines: ["40%", "75%"],
                fills: [
                  { left: "55%", top: 0, w: "25%", h: "40%", bg: greenGrad, wipe: "left" as const, delay: 0.05 },
                  { left: 0, top: "75%", w: "25%", h: "25%", bg: "linear-gradient(-90deg, rgba(221,4,168,0.2) 0%, rgba(221,4,168,1) 77%)", wipe: "top" as const, delay: 0.15 },
                ],
                tile: null,
              },
            ];

            const overlays = overlaySets[activeIndex];
            const wipeHidden: Record<string, string> = {
              top: "inset(100% 0 0 0)",
              bottom: "inset(0 0 100% 0)",
              left: "inset(0 0 0 100%)",
              right: "inset(0 100% 0 0)",
            };

            return (
              <>
                {overlays.vLines.map((x, i) => (
                  <motion.div
                    key={`sv-${activeIndex}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: speakerOverlayVisible ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: speakerOverlayVisible ? 0.05 : 0 }}
                    style={{ position: "absolute", left: x, top: 0, width: 1, height: "100%", backgroundColor: white, pointerEvents: "none", zIndex: 3 }}
                  />
                ))}
                {overlays.hLines.map((y, i) => (
                  <motion.div
                    key={`sh-${activeIndex}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: speakerOverlayVisible ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: speakerOverlayVisible ? 0.05 : 0 }}
                    style={{ position: "absolute", left: 0, top: y, width: "100%", height: 1, backgroundColor: white, pointerEvents: "none", zIndex: 3 }}
                  />
                ))}
                {overlays.fills.map((f, i) => (
                  <motion.div
                    key={`sf-${activeIndex}-${i}`}
                    initial={{ clipPath: wipeHidden[f.wipe] }}
                    animate={{ clipPath: speakerOverlayVisible ? "inset(0 0 0 0)" : wipeHidden[f.wipe] }}
                    transition={{ duration: 0.5, ease: [0.625, 0.05, 0, 1], delay: speakerOverlayVisible ? f.delay : 0 }}
                    style={{ position: "absolute", left: f.left, top: f.top, width: f.w, height: f.h, background: f.bg, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}
                  >
                    <div style={{ position: "absolute", inset: 0, filter: "url(#noise)", opacity: 0.3 }} />
                  </motion.div>
                ))}
                {/* AIRSPACE logo tile - only on first photo */}
                {overlays.tile && (
                  <motion.div
                    key={`tile-${activeIndex}`}
                    initial={{ clipPath: wipeHidden[overlays.tile.wipe] }}
                    animate={{ clipPath: speakerOverlayVisible ? "inset(0 0 0 0)" : wipeHidden[overlays.tile.wipe] }}
                    transition={{ duration: 0.6, ease: [0.625, 0.05, 0, 1], delay: speakerOverlayVisible ? overlays.tile.delay : 0 }}
                    style={{
                      position: "absolute",
                      left: overlays.tile.left,
                      top: overlays.tile.top,
                      width: 96,
                      height: 96,
                      pointerEvents: "none",
                      zIndex: 3,
                      transform: "translateY(-100%)",
                    }}
                  >
                    <img
                      src="/airspace-assets/airspace-tile-pink.svg"
                      alt=""
                      style={{ width: "100%", height: "100%" }}
                    />
                  </motion.div>
                )}
              </>
            );
          })()}
          {/* Pink overlay rectangle */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 230,
              height: 147,
              backgroundColor: "#161616",
              zIndex: 4,
            }}
          />
        </div>

        {/* Grid lines overlay */}
        {(() => {
          const pink = "rgba(247, 151, 239, 0.4)";
          return (
            <>
              {/* Left vertical line — at content grid left edge */}
              <div
                style={{
                  position: "absolute",
                  left: "calc(50% - 557px)",
                  top: 0,
                  width: 1,
                  height: "100%",
                  backgroundColor: pink,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
{/* Right vertical line removed — was overlapping photo column */}
              {/* Upper horizontal line — spans from left edge to center (photo boundary) */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "20.5%",
                  width: "50%",
                  height: 1,
                  backgroundColor: pink,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
              {/* Lower horizontal line — spans from left edge to photo column boundary */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "81%",
                  width: "50%",
                  height: 1,
                  backgroundColor: pink,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
            </>
          );
        })()}

        {/* Content overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 1114,
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 0 0 40px",
            boxSizing: "border-box",
            zIndex: 3,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 426,
              gap: 40,
            }}
          >
            <h2
              style={{
                fontFamily: font,
                fontWeight: 550,
                fontSize: 96,
                lineHeight: "1em",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              <TypewriterLabel
                text={current.heading}
                inView={true}
                speed={60}
                delay={0}
              />
            </h2>
            <div style={{ position: "relative" }}>
              {states.map((s, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: font,
                    fontWeight: 550,
                    fontSize: 16,
                    lineHeight: "1.35em",
                    color: "#FFFFFF",
                    margin: 0,
                    maxWidth: 388,
                    position: i === 0 ? "relative" : "absolute",
                    bottom: 0,
                    left: 0,
                    opacity: i === activeIndex ? 1 : 0,
                    filter: i === activeIndex ? "blur(0px)" : "blur(8px)",
                    transition: "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {s.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AirspacePage() {
  const { width: viewportW, isMobile, isTablet, isDesktop } = useWindowSize();
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tabsSectionRef = useRef(null);
  const tabsInView = useInView(tabsSectionRef, { once: true, margin: "-100px" });
  const [imageHovered, setImageHovered] = useState(false);
  const videoSectionRef = useRef(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const footerRef = useRef(null);
  const footerInView = useInView(footerRef, { once: true });
  const footerNavRef = useRef(null);
  const footerVisible = useInView(footerNavRef);
  const [videoInView, setVideoInView] = useState(true);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { margin: "0px" });
  const [regModalOpen, setRegModalOpen] = useState(false);
  const openRegModal = useCallback(() => setRegModalOpen(true), []);
  const closeRegModal = useCallback(() => setRegModalOpen(false), []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (video && video.readyState >= 2) {
      setHeroVideoReady(true);
    }
  }, []);

  const faqs = [
    {
      question: "How long is the session?",
      answer:
        "Airspace runs for one full day, from 8:00 AM to late evening. There's plenty of time to attend sessions, build during the hackathon, and connect with the community.",
    },
    {
      question: "What are the prizes?",
      answer:
        "There's $100,000 in total prizes including a $50,000 grand prize, $2,000 bounties for AI-powered builds, championship belts, and Aircoins redeemable for exclusive merch.",
    },
    {
      question: "What if I have to cancel?",
      answer:
        "Full refunds are available up to 14 days before the event. After that, you can transfer your ticket to someone else. Email airspace@airtable.com for help.",
    },
    {
      question: "Is Airspace right for me?",
      answer:
        "Yes — whether you're a no-code builder, a developer, or somewhere in between. Teams of all skill levels compete, and there are categories for every experience level.",
    },
    {
      question: "Other questions?",
      answer:
        "Reach out to airspace@airtable.com and we'll get back to you within 24 hours.",
    },
  ];

  const tabs = [
    {
      label: "What to expect",
      headline: "A day built for building",
      body: "A full day of keynotes, breakout sessions, hands-on workshops, and networking. Whether you're just getting started or pushing the limits of the platform, every session is designed to give you something you can take home and ship.",
      image: "/airspace-assets/tab-new-1-39bc7f.png",
    },
    {
      label: "What you'll learn",
      headline: "Skills you'll actually use Monday",
      body: "New platform capabilities, advanced automation patterns, and real-world workflows from teams who've scaled with Airtable. You'll walk away with proven strategies for building smarter apps, streamlining operations, and unlocking the full potential of AI-native tools.",
      image: "/airspace-assets/tab-new-2.png",
    },
    {
      label: "Who you'll meet",
      headline: "Builders gearing up for what's next",
      body: "Product leaders, developers, operations teams, and Airtable's own engineers — all in one place, ready to connect. From hallway conversations to structured meetups, Airspace is where lasting professional relationships and unexpected collaborations begin.",
      image: "/airspace-assets/tab-new-3.png",
    },
  ];

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#F8F6F6",
        fontFamily: font,
      }}
    >
      {/* Floating Navigation */}
      <AnimatePresence>
        {!heroInView && !footerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.35, ease: [0.625, 0.05, 0, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: isMobile ? "12px 20px" : "12px 24px",
              backgroundColor: "rgba(255,255,255,0.95)",
              borderBottom: "1px solid rgba(22,22,22,0.06)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxSizing: "border-box",
              pointerEvents: "auto",
            }}
          >
            <a href="/" style={{ width: 112, display: "block" }}>
              <GlitchLogo color="#161616" />
            </a>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[
                  { label: "Speakers", href: "#speakers" },
                  { label: "Sessions", href: "#sessions" },
                  { label: "FAQs", href: "#faqs" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(22,22,22,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(22,22,22,0.05)";
                    }}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "rgba(22,22,22,0.05)",
                      borderRadius: 100,
                      fontSize: 13,
                      fontWeight: 550,
                      color: "#161616",
                      textDecoration: "none",
                      lineHeight: "18px",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            <Button label="Register" variant="dark" onClick={openRegModal} />
          </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Hero Header */}
      <section
        ref={heroRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 1114,
          padding: isMobile ? "48px 20px" : isTablet ? "72px 40px" : "96px 0",
          gap: isMobile ? 32 : 64,
          boxSizing: "border-box",
        }}
      >
        <GlitchLogo />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              gap: 16,
            }}
          >
            <h1
              style={{
                fontFamily: font,
                fontWeight: 550,
                fontSize: isMobile ? 24 : isTablet ? 32 : 32,
                lineHeight: "1.25em",
                textAlign: "center",
                color: "#161616",
                margin: 0,
              }}
            >
              The flagship event for builders who ship with Airtable
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 16,
                ...(isMobile ? { flexWrap: "wrap" as const, justifyContent: "center" } : {}),
              }}
            >
              <span
                style={{
                  fontWeight: 550,
                  fontSize: 16,
                  lineHeight: "1.35em",
                  color: "rgba(22,22,22,0.7)",
                }}
              >
                <TypewriterLabel text="July 1, 2026" delay={400} speed={60} inView={true} />
              </span>
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: "linear-gradient(-90deg, rgba(23,114,81,0.2) 0%, rgba(23,114,94,1) 77%)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontWeight: 550,
                  fontSize: 16,
                  lineHeight: "1.35em",
                  color: "rgba(22,22,22,0.7)",
                }}
              >
                <TypewriterLabel text="Moscone Center" delay={400} speed={60} inView={true} />
              </span>
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: "linear-gradient(-90deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontWeight: 550,
                  fontSize: 16,
                  lineHeight: "1.35em",
                  color: "rgba(22,22,22,0.7)",
                }}
              >
                <TypewriterLabel text="San Francisco, CA" delay={400} speed={40} inView={true} />
              </span>
            </div>
          </div>

          <Button label="Register" variant="dark" onClick={openRegModal} />
        </div>
      </section>

      {/* SECTION 2: Hero Video */}
      <section ref={videoSectionRef} style={{ width: "100%", position: "relative", aspectRatio: "1440 / 810", overflow: "hidden" }}>
        <video
          ref={heroVideoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setHeroVideoReady(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/airspace-assets/hero.mp4" type="video/mp4" />
        </video>
        {/* Grid overlay lines */}
        {(() => {
          const white = "rgba(255,255,255,0.15)";
          const vLines = ["19.58%", "48.4%", "67.28%", "79.51%"];
          const hLines = ["14.81%", "21.48%", "63.37%", "75.06%", "87.77%"];
          return (
            <>
              {vLines.map((x, i) => (
                <motion.div
                  key={`hv-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: heroVideoReady ? 1 : 0 }}
                  transition={{ duration: 0.4, delay: heroVideoReady ? 0.05 : 0 }}
                  style={{ position: "absolute", left: x, top: 0, width: 1, height: "100%", backgroundColor: white, pointerEvents: "none", zIndex: 2 }}
                />
              ))}
              {hLines.map((y, i) => (
                <motion.div
                  key={`hh-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: heroVideoReady ? 1 : 0 }}
                  transition={{ duration: 0.4, delay: heroVideoReady ? 0.05 : 0 }}
                  style={{ position: "absolute", left: 0, top: y, width: "100%", height: 1, backgroundColor: white, pointerEvents: "none", zIndex: 2 }}
                />
              ))}
            </>
          );
        })()}
        {/* SVG noise filter definition */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
        </svg>
        {/* Decorative overlay rectangles — clip-path wipe reveal */}
        {[
          // wipeFrom: which edge the shape reveals from (the clip-path origin)
          { left: "0%", top: "-1.3%", width: "19.58%", height: "16.17%", bg: "#F8F6F6", delay: 0, wipeFrom: "top", noise: false },
          { left: "79.51%", top: "-1.3%", width: "20.49%", height: "9.75%", bg: "#F8F6F6", delay: 0, wipeFrom: "right", noise: false },
          { left: "19.58%", top: "14.81%", width: "28.82%", height: "6.67%", bg: "linear-gradient(-90deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)", delay: 0.3, wipeFrom: "right", noise: true },
          { left: "86.72%", top: "21.48%", width: "13.28%", height: "19.26%", bg: "linear-gradient(-90deg, rgba(221,4,168,0.2) 0%, rgba(221,4,168,1) 77%)", delay: 0.15, wipeFrom: "top", noise: true },
          { left: "9.79%", top: "75.06%", width: "18.26%", height: "12.72%", bg: "linear-gradient(-90deg, rgba(23,114,81,0.2) 0%, rgba(23,114,94,1) 77%)", delay: 0.4, wipeFrom: "left", noise: true },
          { left: "59.64%", top: "75.06%", width: "7.64%", height: "12.71%", bg: "linear-gradient(-90deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)", delay: 0.5, wipeFrom: "bottom", noise: true },
          { left: "67.28%", top: "87.77%", width: "12.23%", height: "12.23%", bg: "#F8F6F6", delay: 0, wipeFrom: "bottom", noise: false },
          { left: "0%", top: "87.78%", width: "9.79%", height: "12.22%", bg: "#F8F6F6", delay: 0, wipeFrom: "left", noise: false },
        ].map((rect, i) => {
          // Define clip-path for wipe-in from each edge
          const clipHidden = {
            top: "inset(0 0 100% 0)",
            bottom: "inset(100% 0 0 0)",
            left: "inset(0 100% 0 0)",
            right: "inset(0 0 0 100%)",
          }[rect.wipeFrom];

          return (
            <motion.div
              key={i}
              initial={{ clipPath: clipHidden }}
              animate={heroVideoReady ? { clipPath: "inset(0 0 0 0)" } : { clipPath: clipHidden }}
              transition={{
                duration: 0.7,
                ease: [0.625, 0.05, 0, 1],
                delay: rect.delay,
              }}
              style={{
                position: "absolute",
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                background: rect.bg,
                overflow: "hidden",
              }}
            >
              {rect.noise && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    filter: "url(#noise)",
                    opacity: 0.3,
                  }}
                />
              )}
            </motion.div>
          );
        })}
        {/* AIRSPACE logo tile */}
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={heroVideoReady ? { clipPath: "inset(0 0 0 0)" } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.625, 0.05, 0, 1], delay: 0.2 }}
          style={{
            position: "absolute",
            left: "28.26%",
            top: "63.37%",
            width: "6.6%",
            height: "11.73%",
          }}
        >
          <Image
            src="/airspace-assets/airspace-tile.svg"
            alt="Airspace"
            width={96}
            height={96}
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
      </section>

      {/* SECTION 3: Scroll-jacked Photo Carousel */}
      <PhotoCarousel />

      {/* SECTION 4: 50+ Speakers — scroll-jacked */}
      <div id="speakers" style={{ width: "100%" }}>
        <SpeakersSection
          states={speakerStates}
          font={font}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </div>

      {/* SECTION 5: What to Expect (Dark Green) */}
      <section
        id="sessions"
        ref={tabsSectionRef}
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: "#00302C",
          padding: isDesktop ? "96px 0 0" : "0",
          overflow: "hidden",
        }}
      >
        {/* Content wrapper — positions the grid lines relative to content width */}
        <div
          style={{
            maxWidth: 1114,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Full-bleed horizontal lines — stretch beyond content to viewport edges */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              height: 1,
              backgroundColor: "#014D47",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              height: 1,
              backgroundColor: "#014D47",
            }}
          />
          {/* Vertical lines — aligned to content edges, full height including padding */}
          {isDesktop && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: -96,
                  left: 0,
                  width: 1,
                  bottom: 0,
                  backgroundColor: "#014D47",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -96,
                  right: 0,
                  width: 1,
                  bottom: 0,
                  backgroundColor: "#014D47",
                }}
              />
            </>
          )}

          {isDesktop ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              position: "relative",
            }}
          >
          {/* Left: Tabs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            {tabs.map((tab, i) => {
              const isActive = activeTab === i;
              const isHovered = hoveredTab === i && !isActive;
              return (
              <motion.div
                key={tab.label}
                onClick={() => setActiveTab(i)}
                onMouseEnter={() => setHoveredTab(i)}
                onMouseLeave={() => setHoveredTab(null)}
                animate={{
                  backgroundColor: isHovered ? "#014D47" : "rgba(0,48,44,0)",
                  paddingTop: isActive ? 48 : isHovered ? 64 : 48,
                  paddingBottom: isActive ? 48 : isHovered ? 64 : 48,
                }}
                transition={{
                  backgroundColor: { duration: 0.5, ease: [0.4, 0, 0.05, 1] },
                  paddingTop: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                  paddingBottom: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 24,
                  paddingLeft: 40,
                  paddingRight: 40,
                  borderTop: "1px solid #014D47",
                  cursor: "pointer",
                }}
              >
                {/* Tab label — AT Season Sans */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: `1px solid ${
                      isHovered
                        ? "rgba(255,255,255,0.23)"
                        : "#014D47"
                    }`,
                    width: "fit-content",
                    fontFamily: font,
                    fontWeight: 650,
                    fontSize: 14,
                    lineHeight: "1.35em",
                    color: isActive
                      ? "#F797EF"
                      : "rgba(255,255,255,0.48)",
                    transition:
                      "color 0.2s ease, border-color 0.25s ease",
                  }}
                >
                  <TypewriterLabel
                    text={tab.label}
                    delay={i * 400}
                    speed={50}
                    inView={tabsInView}
                  />
                </div>

                {/* Expanded content for active tab */}
                {activeTab === i && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: font,
                        fontWeight: 550,
                        fontSize: 48,
                        lineHeight: "1.15em",
                        color: "#FFFFFF",
                        margin: 0,
                      }}
                    >
                      {tab.headline}
                    </p>
                    <p
                      style={{
                        fontFamily: font,
                        fontWeight: 550,
                        fontSize: 16,
                        lineHeight: "1.35em",
                        color: "rgba(255,255,255,0.86)",
                        margin: 0,
                      }}
                    >
                      {tab.body}
                    </p>
                  </div>
                )}
              </motion.div>
              );
            })}
          </div>

          {/* Right: Image */}
          <div
            onMouseEnter={() => setImageHovered(true)}
            onMouseLeave={() => setImageHovered(false)}
            style={{
              width: 574,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              border: "1px solid #014D47",
            }}
          >
            <Image
              key={tabs[activeTab].image}
              src={tabs[activeTab].image}
              alt="Event experience"
              fill
              style={{
                objectFit: "cover",
              }}
            />
            {/* Hover overlay vectors — unique per tab */}
            {(() => {
              const pink = "linear-gradient(-90deg, rgba(221,4,168,0.2) 0%, rgba(221,4,168,1) 77%)";
              const gold = "linear-gradient(-90deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)";
              const teal = "linear-gradient(-90deg, rgba(23,114,81,0.2) 0%, rgba(23,114,94,1) 77%)";

              const overlays = [
                // Tab 0: WHAT TO EXPECT
                {
                  vLines: ["16.9%", "57.5%", "80%"],
                  hLines: ["46.5%", "62%", "83.7%"],
                  fills: [
                    { left: 0, top: "46.5%", w: "16.9%", h: "15.5%", bg: pink, wipe: "right", delay: 0.1 },
                    { left: "80%", top: "83.7%", w: "20%", h: "16.3%", bg: gold, wipe: "top", delay: 0.2 },
                    { left: "80%", top: 0, w: "20%", h: "46.5%", bg: pink, wipe: "bottom", delay: 0.05 },
                  ],
                },
                // Tab 1: WHAT YOU'LL LEARN
                {
                  vLines: ["25%", "65%", "85%"],
                  hLines: ["30%", "55%", "78%"],
                  fills: [
                    { left: "65%", top: 0, w: "20%", h: "30%", bg: teal, wipe: "bottom", delay: 0.05 },
                    { left: 0, top: "55%", w: "25%", h: "23%", bg: gold, wipe: "right", delay: 0.15 },
                    { left: "85%", top: "78%", w: "15%", h: "22%", bg: pink, wipe: "top", delay: 0.1 },
                  ],
                },
                // Tab 2: WHO YOU'LL MEET
                {
                  vLines: ["20%", "50%", "75%"],
                  hLines: ["35%", "60%", "85%"],
                  fills: [
                    { left: 0, top: 0, w: "20%", h: "35%", bg: gold, wipe: "bottom", delay: 0.05 },
                    { left: "50%", top: "60%", w: "25%", h: "25%", bg: teal, wipe: "left", delay: 0.1 },
                    { left: "75%", top: "35%", w: "25%", h: "25%", bg: pink, wipe: "right", delay: 0.2 },
                  ],
                },
              ][activeTab];

              const wipeHidden: Record<string, string> = {
                top: "inset(100% 0 0 0)",
                bottom: "inset(0 0 100% 0)",
                left: "inset(0 0 0 100%)",
                right: "inset(0 100% 0 0)",
              };

              return (
                <>
                  {/* Grid lines */}
                  {overlays.vLines.map((x, i) => (
                    <motion.div
                      key={`v-${activeTab}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: imageHovered ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: imageHovered ? 0.05 : 0 }}
                      style={{ position: "absolute", left: x, top: 0, width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.23)", pointerEvents: "none" }}
                    />
                  ))}
                  {overlays.hLines.map((y, i) => (
                    <motion.div
                      key={`h-${activeTab}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: imageHovered ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: imageHovered ? 0.05 : 0 }}
                      style={{ position: "absolute", left: 0, top: y, width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.23)", pointerEvents: "none" }}
                    />
                  ))}
                  {/* Filled rectangles */}
                  {overlays.fills.map((f, i) => (
                    <motion.div
                      key={`fill-${activeTab}-${i}`}
                      initial={{ clipPath: wipeHidden[f.wipe] }}
                      animate={{ clipPath: imageHovered ? "inset(0 0 0 0)" : wipeHidden[f.wipe] }}
                      transition={{ duration: 0.5, ease: [0.625, 0.05, 0, 1], delay: imageHovered ? f.delay : 0 }}
                      style={{ position: "absolute", left: f.left, top: f.top, width: f.w, height: f.h, background: f.bg, pointerEvents: "none", overflow: "hidden" }}
                    >
                      <div style={{ position: "absolute", inset: 0, filter: "url(#noise)", opacity: 0.3 }} />
                    </motion.div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
          ) : (
          /* Compact: all tabs expanded with photos inline */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {tabs.map((tab, i) => {
              const pink = "linear-gradient(-90deg, rgba(221,4,168,0.2) 0%, rgba(221,4,168,1) 77%)";
              const gold = "linear-gradient(-90deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)";
              const teal = "linear-gradient(-90deg, rgba(23,114,81,0.2) 0%, rgba(23,114,94,1) 77%)";
              const overlayData = [
                { vLines: ["16.9%", "57.5%", "80%"], hLines: ["46.5%", "62%", "83.7%"], fills: [
                  { left: 0, top: "46.5%", w: "16.9%", h: "15.5%", bg: pink },
                  { left: "80%", top: "83.7%", w: "20%", h: "16.3%", bg: gold },
                  { left: "80%", top: 0, w: "20%", h: "46.5%", bg: pink },
                ]},
                { vLines: ["25%", "65%", "85%"], hLines: ["30%", "55%", "78%"], fills: [
                  { left: "65%", top: 0, w: "20%", h: "30%", bg: teal },
                  { left: 0, top: "55%", w: "25%", h: "23%", bg: gold },
                  { left: "85%", top: "78%", w: "15%", h: "22%", bg: pink },
                ]},
                { vLines: ["20%", "50%", "75%"], hLines: ["35%", "60%", "85%"], fills: [
                  { left: 0, top: 0, w: "20%", h: "35%", bg: gold },
                  { left: "50%", top: "60%", w: "25%", h: "25%", bg: teal },
                  { left: "75%", top: "35%", w: "25%", h: "25%", bg: pink },
                ]},
              ][i];
              return (
                <div key={tab.label}>
                  {/* Tab content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 24,
                      padding: isMobile ? "32px 20px" : "40px 20px",
                      borderTop: "1px solid #014D47",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #014D47",
                        width: "fit-content",
                        fontFamily: font,
                        fontWeight: 650,
                        fontSize: 14,
                        lineHeight: "1.35em",
                        color: "#F797EF",
                      }}
                    >
                      <TypewriterLabel text={tab.label} delay={i * 400} speed={50} inView={tabsInView} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <p style={{ fontFamily: font, fontWeight: 550, fontSize: isMobile ? 28 : 32, lineHeight: "1.15em", color: "#FFFFFF", margin: 0 }}>
                        {tab.headline}
                      </p>
                      <p style={{ fontFamily: font, fontWeight: 550, fontSize: 16, lineHeight: "1.35em", color: "rgba(255,255,255,0.86)", margin: 0 }}>
                        {tab.body}
                      </p>
                    </div>
                  </div>
                  {/* Photo with vector overlays — always visible */}
                  <div style={{ width: "100%", aspectRatio: "4 / 3", position: "relative", overflow: "hidden", border: "1px solid #014D47" }}>
                    <Image src={tab.image} alt={tab.headline} fill style={{ objectFit: "cover" }} />
                    {overlayData.vLines.map((x, vi) => (
                      <div key={`cv-${i}-${vi}`} style={{ position: "absolute", left: x, top: 0, width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.23)", pointerEvents: "none" }} />
                    ))}
                    {overlayData.hLines.map((y, hi) => (
                      <div key={`ch-${i}-${hi}`} style={{ position: "absolute", left: 0, top: y, width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.23)", pointerEvents: "none" }} />
                    ))}
                    {overlayData.fills.map((f, fi) => (
                      <div key={`cf-${i}-${fi}`} style={{ position: "absolute", left: f.left, top: f.top, width: f.w, height: f.h, background: f.bg, pointerEvents: "none", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, filter: "url(#noise)", opacity: 0.3 }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* AIRSPACE Logo Marquee */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#00302C",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1114,
            height: isMobile ? 56 : isTablet ? 72 : 96,
            overflow: "hidden",
            position: "relative",
            borderLeft: "1px solid #014D47",
            borderRight: "1px solid #014D47",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              animation: "marquee 20s linear infinite",
            }}
          >
            {[0, 1].map((half) => (
              <div
                key={half}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  gap: 80,
                  flexShrink: 0,
                  paddingRight: 80,
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <img
                    key={i}
                    src="/airspace-assets/airspace-marquee-single.svg"
                    alt=""
                    style={{
                      height: isMobile ? 16 : isTablet ? 20 : 27,
                      width: isMobile ? 114 : isTablet ? 143 : 196,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Left fade */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 146,
              height: "100%",
              background:
                "linear-gradient(90deg, #00302C 0%, rgba(0,48,44,0) 100%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
          {/* Right fade */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 146,
              height: "100%",
              background:
                "linear-gradient(-90deg, #00302C 0%, rgba(0,48,44,0) 100%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </div>
      </div>

      {/* SECTION 5: FAQs — seamless continuation of dark green */}
      <section
        id="faqs"
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: "#00302C",
          overflow: "hidden",
        }}
      >
        {/* Vertical lines — aligned to 1114px content edges, full section height */}
        {isDesktop && (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: -557,
                width: 1,
                bottom: 0,
                backgroundColor: "#014D47",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                marginLeft: 557,
                width: 1,
                bottom: 0,
                backgroundColor: "#014D47",
              }}
            />
          </>
        )}

        {/* Full-bleed horizontal lines */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: 1,
            backgroundColor: "#014D47",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100vw",
            height: 1,
            backgroundColor: "#014D47",
          }}
        />

        <div
          style={{
            maxWidth: 1114,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Vertical lines — these no longer need to be here, moved to section level */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: isMobile ? "0 20px 32px" : "0 40px 48px",
            }}
          >
            {/* Header */}
            <div style={{ padding: "48px 0 48px" }}>
              <h2
                style={{
                  fontFamily: font,
                  fontWeight: 550,
                  fontSize: 32,
                  lineHeight: "1.15em",
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                FAQs
              </h2>
            </div>

            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                isLast={i === faqs.length - 1}
              />
            ))}
          </div>

          {/* Bottom padding spacer — mirrors top of green tabs */}
        </div>

        {/* Full-bleed bottom horizontal line */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#014D47",
          }}
        />

        {/* Bottom breathing room below the line */}
        {isDesktop && <div style={{ height: 96 }} />}
      </section>

      {/* SECTION 7: Footer */}
      <footer
        ref={(el) => {
          (footerRef as React.MutableRefObject<HTMLElement | null>).current = el;
          (footerNavRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }}
        style={{
          position: "relative",
          width: "100%",
          height: isDesktop ? 860 : "auto",
          minHeight: isDesktop ? undefined : "auto",
          overflow: "hidden",
        }}
      >
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/airspace-assets/clouds-slow.mp4" type="video/mp4" />
        </video>

        {/* Grid overlay lines — aligned to vector shape edges, avoid content area */}
        {isDesktop && (() => {
          const white = "rgba(255,255,255,0.15)";
          const contentLeft = "calc(50% - 558px)";
          const contentRight = "calc(50% + 558px)";
          // Horizontal lines at vector shape top/bottom edges (px values)
          // Left side: green top 0-63, gold 148-284
          // Right side: green top 0-113, green2 113-313, pink 313-374
          const hLines = [
            { top: 63, side: "left" as const },   // bottom of top-left green
            { top: 113, side: "right" as const },  // bottom of top-right green
            { top: 148, side: "left" as const },   // top of gold
            { top: 284, side: "left" as const },   // bottom of gold
            { top: 313, side: "right" as const },  // top of pink / bottom of right green
            { top: 374, side: "right" as const },  // bottom of pink
          ];
          return (
            <>
              {/* Vertical lines at content grid edges — full height */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 }}
                style={{ position: "absolute", left: contentLeft, top: 0, width: 1, height: "100%", backgroundColor: white, pointerEvents: "none", zIndex: 2 }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 }}
                style={{ position: "absolute", left: contentRight, top: 0, width: 1, height: "100%", backgroundColor: white, pointerEvents: "none", zIndex: 2 }}
              />
              {/* Horizontal lines — only on the side where the vector shape lives */}
              {hLines.map((line, i) => (
                <motion.div
                  key={`fh-${i}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  style={{
                    position: "absolute",
                    top: line.top,
                    ...(line.side === "left"
                      ? { left: 0, width: contentLeft }
                      : { left: contentRight, right: 0 }),
                    height: 1,
                    backgroundColor: white,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
              ))}
            </>
          );
        })()}

        {/* Vector overlay shapes — matching Figma layout */}
        {isDesktop && (() => {
          const contentLeft = "calc(50% - 558px)";
          const contentRight = "calc(50% + 558px)";
          const ease = [0.625, 0.05, 0, 1] as const;
          return (
            <>
              {/* Dark green — top left block (fills from left edge to content grid) */}
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                whileInView={{ clipPath: "inset(0 0 0 0)" }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, ease, delay: 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: contentLeft,
                  height: 63,
                  backgroundColor: "#00302C",
                  zIndex: 2,
                }}
              />
              {/* Gold gradient — left side below top-left green */}
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0 0 0 0)" }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, ease, delay: 0.15 }}
                style={{
                  position: "absolute",
                  top: 148,
                  left: 0,
                  width: 102,
                  height: 136,
                  background: "linear-gradient(90deg, rgba(255, 186, 5, 0.2) 0%, rgba(255, 186, 5, 1) 77%)",
                  zIndex: 2,
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", inset: 0, filter: "url(#noise)", opacity: 0.3 }} />
              </motion.div>
              {/* Dark green — top right block (stretches from content edge to viewport edge) */}
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                whileInView={{ clipPath: "inset(0 0 0 0)" }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, ease, delay: 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: contentRight,
                  right: 0,
                  height: 113,
                  backgroundColor: "#00302C",
                  zIndex: 2,
                }}
              />
              {/* Dark green — right side below top-right (104x200) */}
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                whileInView={{ clipPath: "inset(0 0 0 0)" }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, ease, delay: 0.1 }}
                style={{
                  position: "absolute",
                  top: 113,
                  right: 0,
                  width: 104,
                  height: 200,
                  backgroundColor: "#00302C",
                  zIndex: 2,
                }}
              />
              {/* Pink gradient — right side (next to right green block) */}
              <motion.div
                initial={{ clipPath: "inset(0 0 0 100%)" }}
                whileInView={{ clipPath: "inset(0 0 0 0)" }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
                style={{
                  position: "absolute",
                  top: 313,
                  right: 106,
                  width: 104,
                  height: 61,
                  background: "linear-gradient(-90deg, rgba(221, 4, 168, 0.2) 0%, rgba(221, 4, 168, 1) 77%)",
                  zIndex: 2,
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", inset: 0, filter: "url(#noise)", opacity: 0.3 }} />
              </motion.div>
            </>
          );
        })()}

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            maxWidth: 1115,
            margin: "0 auto",
            padding: isMobile ? "48px 20px 64px" : isTablet ? "64px 40px 96px" : "64px 40px 128px",
            gap: 64,
            height: "100%",
            boxSizing: "border-box",
            zIndex: 3,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            {/* Event info row — same format as hero */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: font,
                  fontWeight: 550,
                  fontSize: 16,
                  lineHeight: "1.35em",
                  color: "#FFFFFF",
                }}
              >
                <TypewriterLabel text="July 1, 2026" delay={400} speed={60} inView={footerInView} />
              </span>
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: "linear-gradient(-90deg, rgba(23,114,81,0.2) 0%, rgba(23,114,94,1) 77%)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: font,
                  fontWeight: 550,
                  fontSize: 16,
                  lineHeight: "1.35em",
                  color: "#FFFFFF",
                }}
              >
                <TypewriterLabel text="Moscone Center" delay={400} speed={60} inView={footerInView} />
              </span>
              <div
                style={{
                  width: 9,
                  height: 9,
                  background: "linear-gradient(-90deg, rgba(255,186,5,0.2) 0%, rgba(255,186,5,1) 77%)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: font,
                  fontWeight: 550,
                  fontSize: 16,
                  lineHeight: "1.35em",
                  color: "#FFFFFF",
                }}
              >
                <TypewriterLabel text="San Francisco, CA" delay={400} speed={40} inView={footerInView} />
              </span>
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 40,
                maxWidth: 542,
              }}
            >
              <h2
                style={{
                  fontFamily: font,
                  fontWeight: 550,
                  fontSize: isMobile ? 28 : isTablet ? 36 : 48,
                  lineHeight: "1.15em",
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                Join 500+ builders at Airtable&apos;s flagship event.
              </h2>
              <div>
                <Button label="Register" variant="light" onClick={openRegModal} />
              </div>
            </div>

            {/* Footer links */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 24 : 0,
                paddingTop: 40,
                borderTop: "1px solid rgba(255,255,255,0.23)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 4,
                  flexWrap: isMobile ? "wrap" as const : undefined,
                }}
              >
                <span
                  style={{
                    fontFamily: font,
                    fontWeight: 550,
                    fontSize: 14,
                    lineHeight: "1.35em",
                    color: "rgba(255,255,255,0.86)",
                  }}
                >
                  For support, please email:{" "}
                </span>
                <a
                  href="mailto:airspace@airtable.com"
                  style={{
                    fontFamily: font,
                    fontWeight: 650,
                    fontSize: 14,
                    lineHeight: "1.35em",
                    color: "rgba(255,255,255,0.86)",
                    textDecoration: "none",
                  }}
                >
                  airspace@airtable.com
                </a>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                }}
              >
                <a
                  href="https://airtable.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: font,
                    fontWeight: 550,
                    fontSize: 14,
                    lineHeight: "1.35em",
                    color: "rgba(255,255,255,0.86)",
                    textDecoration: "none",
                  }}
                >
                  Visit Airtable.com
                </a>
                <a
                  href="https://www.airtable.com/company/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: font,
                    fontWeight: 550,
                    fontSize: 14,
                    lineHeight: "1.35em",
                    color: "rgba(255,255,255,0.86)",
                    textDecoration: "none",
                  }}
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Bottom grid logo — glitch animation in white */}
          <div>
            <GlitchLogo color="#FFFFFF" inView={footerInView} />
          </div>
        </div>
      </footer>
      <RegistrationModal isOpen={regModalOpen} onClose={closeRegModal} />
    </main>
  );
}
