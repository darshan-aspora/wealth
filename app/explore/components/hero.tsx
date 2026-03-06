"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.25,
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

export function Hero() {
  return (
    <section className="bg-background pt-5 pb-6">
      <div className="px-5">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Aspora Logo — small mark */}
          <motion.div custom={0} variants={fadeUp} className="mb-5">
            <svg
              width="44"
              height="18"
              viewBox="0 0 202 82"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-foreground"
            >
              <path
                d="M95.4665 82H0C44.4529 56.4364 135.365 6.92627 155.33 0H202C189.563 24.6994 184.114 57.7199 199.815 82H127.658C130.54 66.3937 151.244 27.4827 176.738 5.88415H172.923C155.98 12.9343 116.416 50.6952 95.4665 82Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-[26px] leading-[1.15] font-bold tracking-tight text-foreground text-center"
          >
            One platform.
            <br />
            Infinite possibilities.
          </motion.h1>

          {/* Product categories — single line */}
          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-[13px] tracking-wide text-muted-foreground mt-3 text-center"
          >
            Stocks · ETFs · Options
            <br />
            Advisory Baskets · 1-Click Algo Strategies
          </motion.p>

          {/* Video placeholder */}
          <motion.div
            custom={3}
            variants={fadeUp}
            className="w-full mt-5 rounded-2xl overflow-hidden bg-muted aspect-video flex items-center justify-center cursor-pointer"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-foreground ml-0.5"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-muted-foreground text-xs">
                Explore what&apos;s possible
              </span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            id="hero-cta"
            custom={4}
            variants={fadeUp}
            className="mt-5 w-full"
          >
            <button className="bg-foreground text-background h-[46px] px-6 rounded-md font-semibold text-[15px] w-full transition-opacity active:opacity-80">
              Create Free Account
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
