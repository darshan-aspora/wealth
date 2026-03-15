"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Expression types ────────────────────────────────────────────────
type Expression =
  | "idle"
  | "blink"
  | "look-left"
  | "look-right"
  | "excited"
  | "wink"
  | "thinking"
  | "sleepy";

const EXPRESSION_SEQUENCE: Expression[] = [
  "idle",
  "blink",
  "idle",
  "look-left",
  "look-right",
  "idle",
  "blink",
  "excited",
  "idle",
  "wink",
  "idle",
  "blink",
  "thinking",
  "idle",
  "sleepy",
  "blink",
];

function getDuration(expr: Expression): number {
  switch (expr) {
    case "blink": return 200;
    case "look-left": return 600;
    case "look-right": return 600;
    case "excited": return 1200;
    case "wink": return 800;
    case "thinking": return 1400;
    case "sleepy": return 1000;
    case "idle": default: return 3000;
  }
}

// ─── Eye center positions ───────────────────────────────────────────
// Base eye centers (inside the glasses frames)
const LEFT_EYE_CX = 11;
const LEFT_EYE_CY = 13.5;
const RIGHT_EYE_CX = 21;
const RIGHT_EYE_CY = 13.5;
const EYE_MOVE_RANGE = 2.2; // max px the pupil can shift

interface EyeState {
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
  leftRx: number;
  leftRy: number;
  rightRx: number;
  rightRy: number;
}

function getEyes(expr: Expression): EyeState {
  const base: EyeState = {
    leftX: LEFT_EYE_CX,
    leftY: LEFT_EYE_CY,
    rightX: RIGHT_EYE_CX,
    rightY: RIGHT_EYE_CY,
    leftRx: 1.9,
    leftRy: 2.1,
    rightRx: 1.9,
    rightRy: 2.1,
  };

  switch (expr) {
    case "blink":
      return { ...base, leftRy: 0.3, rightRy: 0.3 };
    case "look-left":
      return { ...base, leftX: LEFT_EYE_CX - 1.5, rightX: RIGHT_EYE_CX - 1.5 };
    case "look-right":
      return { ...base, leftX: LEFT_EYE_CX + 1.5, rightX: RIGHT_EYE_CX + 1.5 };
    case "excited":
      return { ...base, leftRy: 2.8, rightRy: 2.8, leftRx: 2.2, rightRx: 2.2, leftY: LEFT_EYE_CY - 0.8, rightY: RIGHT_EYE_CY - 0.8 };
    case "wink":
      return { ...base, rightRy: 0.3 };
    case "thinking":
      return { ...base, leftX: LEFT_EYE_CX + 1, rightX: RIGHT_EYE_CX + 1, leftY: LEFT_EYE_CY - 1.2, rightY: RIGHT_EYE_CY - 1.2 };
    case "sleepy":
      return { ...base, leftRy: 0.8, rightRy: 0.8, leftY: LEFT_EYE_CY + 0.5, rightY: RIGHT_EYE_CY + 0.5 };
    default:
      return base;
  }
}

// Apply lookAt override to eye positions
function applyLookAt(eyes: EyeState, lookAt: { x: number; y: number } | null): EyeState {
  if (!lookAt) return eyes;
  const dx = lookAt.x * EYE_MOVE_RANGE;
  const dy = lookAt.y * EYE_MOVE_RANGE * 0.6; // less vertical range
  return {
    ...eyes,
    leftX: LEFT_EYE_CX + dx,
    leftY: LEFT_EYE_CY + dy,
    rightX: RIGHT_EYE_CX + dx,
    rightY: RIGHT_EYE_CY + dy,
  };
}

// ─── Mouth shapes ───────────────────────────────────────────────────
function getMouth(expr: Expression): string {
  switch (expr) {
    case "excited": return "M 12,21 Q 16,25 20,21";
    case "wink": return "M 13,21.5 Q 16,23 19,21.5";
    case "thinking": return "M 13,22.5 L 19,22.5";
    case "sleepy": return "M 13,21.5 Q 16,22.5 19,21.5";
    default: return "M 13,21.5 Q 16,23.5 19,21.5";
  }
}

// ─── Eyebrow positions ─────────────────────────────────────────────
interface BrowState {
  leftD: string;
  rightD: string;
  opacity: number;
}

function getBrows(expr: Expression): BrowState {
  const hidden = { leftD: "M 7,8.5 L 14.5,8.5", rightD: "M 17.5,8.5 L 25,8.5", opacity: 0 };
  switch (expr) {
    case "excited":
      return { leftD: "M 7,7 L 14.5,8", rightD: "M 17.5,8 L 25,7", opacity: 1 };
    case "thinking":
      return { leftD: "M 7,8.5 L 14.5,7.5", rightD: "M 17.5,7.5 L 25,8.5", opacity: 1 };
    default:
      return hidden;
  }
}

// ─── Glasses path ───────────────────────────────────────────────────
// Round specs: two circles + bridge + temple arms
const GLASSES_LEFT = `M 6,13.5 a 5.2,5 0 1,1 10.4,0 a 5.2,5 0 1,1 -10.4,0`;
const GLASSES_RIGHT = `M 15.6,13.5 a 5.2,5 0 1,1 10.4,0 a 5.2,5 0 1,1 -10.4,0`;
const GLASSES_BRIDGE = `M 16.2,12 Q 16,10.8 15.8,12`;
const GLASSES_ARM_L = `M 6,12.5 L 3,11`;
const GLASSES_ARM_R = `M 26,12.5 L 29,11`;
const GLASSES_D = `${GLASSES_LEFT} ${GLASSES_RIGHT} ${GLASSES_BRIDGE} ${GLASSES_ARM_L} ${GLASSES_ARM_R}`;

// ─── Component ──────────────────────────────────────────────────────
export function AIBuddy({
  size = 28,
  lookAt = null,
}: {
  size?: number;
  lookAt?: { x: number; y: number } | null;
}) {
  const [step, setStep] = useState(0);
  const isTracking = lookAt !== null;

  // When tracking a tap, pause the expression cycle
  const expr: Expression = isTracking ? "idle" : EXPRESSION_SEQUENCE[step % EXPRESSION_SEQUENCE.length];

  useEffect(() => {
    if (isTracking) return; // pause cycle while tracking
    const duration = getDuration(expr);
    const timer = setTimeout(() => setStep((s) => s + 1), duration);
    return () => clearTimeout(timer);
  }, [step, expr, isTracking]);

  const baseEyes = getEyes(expr);
  const eyes = isTracking ? applyLookAt(baseEyes, lookAt) : baseEyes;
  const mouth = getMouth(expr);
  const brows = getBrows(expr);

  const spring = { type: "spring" as const, stiffness: 300, damping: 20 };
  const fast = { duration: 0.12 };
  const eyeTransition = expr === "blink" ? fast : spring;

  return (
    <svg
      width={size}
      height={size}
      viewBox="1 4 30 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glasses frame — always visible */}
      <motion.path
        d={GLASSES_D}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.5}
      />

      {/* Left eye (pupil) */}
      <motion.ellipse
        fill="currentColor"
        animate={{
          cx: eyes.leftX,
          cy: eyes.leftY,
          rx: eyes.leftRx,
          ry: eyes.leftRy,
        }}
        transition={eyeTransition}
      />

      {/* Right eye (pupil) */}
      <motion.ellipse
        fill="currentColor"
        animate={{
          cx: eyes.rightX,
          cy: eyes.rightY,
          rx: eyes.rightRx,
          ry: eyes.rightRy,
        }}
        transition={eyeTransition}
      />

      {/* Mouth */}
      <motion.path
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
        animate={{ d: mouth }}
        transition={spring}
      />

      {/* Eyebrows */}
      <motion.path
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        animate={{ d: brows.leftD, opacity: brows.opacity }}
        transition={spring}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        animate={{ d: brows.rightD, opacity: brows.opacity }}
        transition={spring}
      />

      {/* Sparkle — "excited" */}
      <AnimatePresence>
        {expr === "excited" && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.path
              d="M 27,4 L 27,8 M 25,6 L 29,6"
              stroke="currentColor"
              strokeWidth={1.3}
              strokeLinecap="round"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.6, repeat: 1 }}
              style={{ transformOrigin: "27px 6px" }}
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Zzz — "sleepy" */}
      <AnimatePresence>
        {expr === "sleepy" && (
          <motion.text
            x={25}
            y={7}
            fill="currentColor"
            fontSize={5.5}
            fontWeight={700}
            initial={{ opacity: 0, y: 11 }}
            animate={{ opacity: [0, 1, 1, 0], y: [11, 7, 5, 3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            z
          </motion.text>
        )}
      </AnimatePresence>
    </svg>
  );
}
