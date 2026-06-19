"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const WORDMARK_SRC = "/external/images/logos/logo-text-putih.png";

function TrackSegment() {
  return (
    <span className="flex shrink-0 items-center gap-5 px-6 sm:gap-6 sm:px-8">
      <Image
        src={WORDMARK_SRC}
        alt=""
        width={200}
        height={32}
        className="h-5 w-auto opacity-[0.32] sm:h-6"
      />
      <span className="hmm-sans text-[0.65rem] font-semibold tracking-[0.28em] whitespace-nowrap text-white/25 sm:text-xs">
        EST · 1946 · HIMPUNAN MAHASISWA MESIN ITB ·
      </span>
    </span>
  );
}

function MarqueeTrack({ keyPrefix }: { keyPrefix: string }) {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <TrackSegment key={`${keyPrefix}-${i}`} />
      ))}
    </>
  );
}

export function ExternalWordmarkRail() {
  const reduceMotion = useReducedMotion() ?? false;

  if (reduceMotion) {
    return (
      <div
        className="border-y border-white/10 bg-[var(--color-hmm-navy-deep)] py-5 sm:py-6"
        aria-hidden
      >
        <div className="mx-auto flex max-w-[86rem] flex-wrap items-center justify-center gap-4 px-4 sm:px-8">
          <Image
            src={WORDMARK_SRC}
            alt=""
            width={220}
            height={36}
            className="h-6 w-auto opacity-[0.35] sm:h-7"
          />
          <span className="hmm-sans text-center text-[0.65rem] font-semibold tracking-[0.22em] text-white/30 sm:text-xs">
            EST · 1946 · HIMPUNAN MAHASISWA MESIN ITB
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden border-y border-white/10 bg-[var(--color-hmm-navy-deep)] py-3 sm:py-4"
      aria-hidden
    >
      <motion.div
        className="flex w-max will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 28,
          ease: "linear",
        }}
      >
        <div className="flex shrink-0">
          <MarqueeTrack keyPrefix="a" />
        </div>
        <div className="flex shrink-0">
          <MarqueeTrack keyPrefix="b" />
        </div>
      </motion.div>
    </div>
  );
}
