"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useScroll, useSpring, useInView } from "motion/react";
import useWindowSize from "./useWindowSize";

const font = "AT Season Sans VF, system-ui, sans-serif";

function TypewriterText({
  text,
  delay = 0,
  speed = 30,
  inView,
}: {
  text: string;
  delay?: number;
  speed?: number;
  inView: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

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

const PHOTOS = [
  { src: "/airspace-assets/carousel-1.png", w: 4096, h: 2731 },
  { src: "/airspace-assets/carousel-2-3a6216.png", w: 2415, h: 2415 },
  { src: "/airspace-assets/carousel-3-41a47a.png", w: 2731, h: 2731 },
  { src: "/airspace-assets/carousel-4.png", w: 4096, h: 2731 },
  { src: "/airspace-assets/carousel-5.png", w: 4096, h: 2305 },
  { src: "/airspace-assets/carousel-6.png", w: 4096, h: 2730 },
  { src: "/airspace-assets/carousel-7.png", w: 4096, h: 2730 },
  { src: "/airspace-assets/carousel-8-2e8eb9.png", w: 2258, h: 2258 },
  { src: "/airspace-assets/carousel-9.png", w: 4096, h: 2731 },
  { src: "/airspace-assets/carousel-10-1f5743.png", w: 2421, h: 2421 },
  { src: "/airspace-assets/carousel-11.png", w: 4096, h: 2731 },
  { src: "/airspace-assets/carousel-12-5a3473.png", w: 2731, h: 2731 },
  { src: "/airspace-assets/carousel-13-192603.png", w: 1593, h: 1593 },
  { src: "/airspace-assets/carousel-14-533fe2.png", w: 2731, h: 2731 },
  { src: "/airspace-assets/carousel-15.png", w: 4096, h: 2731 },
];

const TOTAL_CARDS = 15;

// Scale based on normalized screen position (0 = left edge, 1 = right edge)
// Small on left, large on right — exaggerated staircase
function getScale(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  // Quadratic ease for more dramatic staircase
  return 0.35 + clamped * clamped * 0.95; // 0.35 → 1.3
}

function getOpacity(t: number): number {
  if (t < -0.1) return 0;
  if (t < 0.05) return 0.4 + ((t + 0.1) / 0.15) * 0.4;
  if (t > 1.1) return 0;
  if (t > 0.95) return 1 - ((t - 0.95) / 0.15) * 0.5;
  return 0.8 + Math.min(t, 1) * 0.2;
}

export default function PhotoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const headlineInView = useInView(headlineRef, { once: true, margin: "-100px" });

  const { width: viewportW, height: viewportH, isMobile, isTablet, isDesktop } = useWindowSize();
  const isCompact = isMobile || isTablet;

  // Card base size — responsive
  const CARD_SIZE = isMobile ? viewportH * 0.35 : isTablet ? viewportH * 0.45 : viewportH * 0.5;

  // Compute exact max offset by simulating layout:
  // Find the offset where the last card's right edge aligns with viewport right edge
  const maxScrollOffset = (() => {
    // Binary search for the offset where last card right edge = viewportW
    let lo = 0;
    let hi = TOTAL_CARDS * CARD_SIZE * 1.3; // generous upper bound
    for (let iter = 0; iter < 50; iter++) {
      const mid = (lo + hi) / 2;
      // Simulate layout at this offset
      let cumX = 0;
      let lastRight = 0;
      for (let i = 0; i < TOTAL_CARDS; i++) {
        const screenLeft = cumX - mid;
        const normalizedX = screenLeft / viewportW;
        const scale = getScale(normalizedX);
        const cardWidth = scale * CARD_SIZE;
        cumX += cardWidth;
        lastRight = screenLeft + cardWidth;
      }
      if (lastRight > viewportW) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return Math.max(0, lo);
  })();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring for buttery scroll feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Layout all cards on each frame — positions computed cumulatively so no gaps
  const layoutCards = useCallback(
    (progress: number) => {
      const offset = progress * maxScrollOffset;

      let cumX = 0;

      for (let i = 0; i < TOTAL_CARDS; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        // This card's left edge on screen
        const screenLeft = cumX - offset;

        // Normalized position (0 = left edge, 1 = right edge of viewport)
        const normalizedX = screenLeft / viewportW;
        const scale = getScale(normalizedX);
        const cardWidth = scale * CARD_SIZE;
        const cardHeight = scale * CARD_SIZE;

        // Advance cumulative position by actual card width — no gaps!
        cumX += cardWidth;

        // Cull off-screen cards
        if (screenLeft > viewportW + CARD_SIZE || screenLeft + cardWidth < -CARD_SIZE) {
          el.style.visibility = "hidden";
          continue;
        }

        const opacity = getOpacity(normalizedX);

        el.style.visibility = "visible";
        el.style.width = `${cardWidth}px`;
        el.style.height = `${cardHeight}px`;
        el.style.transform = `translate3d(${screenLeft}px, 0, 0)`;
        el.style.opacity = `${opacity}`;
        el.style.zIndex = `${i}`;
      }
    },
    [CARD_SIZE, viewportW, maxScrollOffset]
  );

  // Subscribe to smoothed scroll value
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", layoutCards);
    // Initial layout
    layoutCards(smoothProgress.get());
    return unsubscribe;
  }, [smoothProgress, layoutCards]);

  const scrollHeight = Math.max(
    200,
    Math.round((maxScrollOffset / viewportW) * 100) + 100
  );

  // Tablet/mobile — no scroll-jacking, simple horizontal scroll strip
  if (isCompact) {
    const compactCardSize = isMobile ? 200 : 280;
    return (
      <section
        style={{
          width: "100%",
          backgroundColor: "#F8F6F6",
          display: "flex",
          flexDirection: "column",
          gap: 40,
          padding: isMobile ? "40px 0 0" : "48px 0 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            padding: isMobile ? "0 20px" : "0 40px",
            boxSizing: "border-box",
          }}
        >
          <h2
            ref={headlineRef}
            style={{
              fontFamily: font,
              fontWeight: 550,
              fontSize: isMobile ? 28 : 36,
              lineHeight: "1.15em",
              color: "#161616",
              margin: 0,
            }}
          >
            One day. Hundreds of builders. Endless possibilities.
          </h2>
          <p
            style={{
              fontFamily: font,
              fontWeight: 550,
              fontSize: isMobile ? 14 : 16,
              lineHeight: "1.35em",
              color: "rgba(22,22,22,0.7)",
              margin: 0,
              maxWidth: 658,
            }}
          >
            Hands-on sessions, live demos, and the energy of a community that builds for a living. Whether you&apos;re shipping your first app or scaling systems across your org, Airspace is where the most ambitious builders come to learn, compete, and connect.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {PHOTOS.map((photo, i) => {
            // Staircase: large on left, small on right
            const t = 1 - i / (TOTAL_CARDS - 1);
            const baseSize = isMobile ? 120 : 160;
            const maxSize = isMobile ? 320 : 450;
            const size = baseSize + t * t * (maxSize - baseSize);
            return (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: size,
                height: size,
                overflow: "hidden",
              }}
            >
              <Image
                src={photo.src}
                alt=""
                width={photo.w}
                height={photo.h}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        height: `${scrollHeight}vh`,
        width: "100%",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#F8F6F6",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: isMobile ? "100%" : 1117,
            width: "100%",
            margin: "0 auto",
            padding: isMobile ? "6vh 20px 0" : isTablet ? "6vh 40px 0" : "14vh 0 0",
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <h2
            ref={headlineRef}
            style={{
              fontFamily: font,
              fontWeight: 550,
              fontSize: isMobile ? 28 : isTablet ? 36 : 48,
              lineHeight: "1.15em",
              color: "#161616",
              margin: 0,
              maxWidth: isMobile ? "100%" : 658,
            }}
          >
One day. Hundreds of builders. Endless possibilities.
          </h2>

          <p
            style={{
              fontFamily: font,
              fontWeight: 550,
              fontSize: isMobile ? 14 : 16,
              lineHeight: "1.35em",
              color: "rgba(22,22,22,0.7)",
              margin: 0,
              maxWidth: isMobile ? "100%" : 658,
            }}
          >
            Hands-on sessions, live demos, and the energy of a community that builds for a living. Whether you&apos;re shipping your first app or scaling systems across your org, Airspace is where the most ambitious builders come to learn, compete, and connect.
          </p>
        </div>

        {/* Carousel area — anchored to bottom */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: TOTAL_CARDS }).map((_, i) => {
            const photo = PHOTOS[i];
            return (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  overflow: "hidden",
                  willChange: "transform, width, height",
                }}
              >
                <Image
                  src={photo.src}
                  alt=""
                  width={photo.w}
                  height={photo.h}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
