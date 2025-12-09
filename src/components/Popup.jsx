import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const GAP = 2;
const VIEWPORT_PADDING = 4;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getViewportRect() {
  return {
    right: window.innerWidth,
    bottom: window.innerHeight,
  };
}

/**
 * Props:
 * - content: JSX (popup contents)
 * - triggerButton: JSX (button that triggers the popup)
 * - open: boolean (controlled)
 * - onOpenChange: (nextOpen:boolean) => void   <-- needed to close on outside click/scroll
 */
export default function Popup({ content, triggerButton, open, onOpenChange }) {
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const portalRoot = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.body;
  }, []);

  const trigger = useMemo(() => {
    if (!isValidElement(triggerButton)) return null;
    return cloneElement(triggerButton, { ref: triggerRef });
  }, [triggerButton]);

  const requestClose = () => {
    if (typeof onOpenChange === "function") onOpenChange(false);
  };

  const computePosition = () => {
    const triggerEl = triggerRef.current;
    const popupEl = popupRef.current;
    if (!triggerEl || !popupEl) return;

    const t = triggerEl.getBoundingClientRect();
    const p = popupEl.getBoundingClientRect();
    const vp = getViewportRect();

    const space = {
      top: t.top - VIEWPORT_PADDING,
      bottom: vp.bottom - t.bottom - VIEWPORT_PADDING,
      left: t.left - VIEWPORT_PADDING,
      right: vp.right - t.right - VIEWPORT_PADDING,
    };

    const candidates = [
      {
        name: "bottom",
        score: space.bottom,
        pos: () => ({
          x: clamp(
            t.left,
            VIEWPORT_PADDING,
            vp.right - p.width - VIEWPORT_PADDING
          ),
          y: t.bottom + GAP,
        }),
      },
      {
        name: "top",
        score: space.top,
        pos: () => ({
          x: clamp(
            t.left,
            VIEWPORT_PADDING,
            vp.right - p.width - VIEWPORT_PADDING
          ),
          y: t.top - p.height - GAP,
        }),
      },
      {
        name: "right",
        score: space.right,
        pos: () => ({
          x: t.right + GAP,
          y: clamp(
            t.top,
            VIEWPORT_PADDING,
            vp.bottom - p.height - VIEWPORT_PADDING
          ),
        }),
      },
      {
        name: "left",
        score: space.left,
        pos: () => ({
          x: t.left - p.width - GAP,
          y: clamp(
            t.top,
            VIEWPORT_PADDING,
            vp.bottom - p.height - VIEWPORT_PADDING
          ),
        }),
      },
    ];

    // Prefer first direction that fully fits; otherwise pick the max-space direction
    const fits = (c) => {
      if (c.name === "bottom" || c.name === "top")
        return c.score >= p.height + GAP;
      return c.score >= p.width + GAP;
    };

    let chosen = candidates.find(fits);
    if (!chosen)
      chosen = candidates.slice().sort((a, b) => b.score - a.score)[0];

    let { x, y } = chosen.pos();
    x = clamp(x, VIEWPORT_PADDING, vp.right - p.width - VIEWPORT_PADDING);
    y = clamp(y, VIEWPORT_PADDING, vp.bottom - p.height - VIEWPORT_PADDING);

    setCoords({ x, y });
    setReady(true);
  };

  // Position on open
  useLayoutEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, content]);

  // Close on outside click + close on scroll (only when open)
  useEffect(() => {
    if (!open) return;

    const onPointerDownCapture = (e) => {
      const popupEl = popupRef.current;
      const triggerEl = triggerRef.current;
      if (!popupEl || !triggerEl) return;

      const target = e.target;

      // If click is inside popup OR on trigger, do nothing.
      if (popupEl.contains(target) || triggerEl.contains(target)) return;

      requestClose();
    };

    const onScrollCapture = () => {
      requestClose();
    };

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    // Any scroll anywhere (including nested containers) will close it
    window.addEventListener("scroll", onScrollCapture, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
      window.removeEventListener("scroll", onScrollCapture, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Optional: reposition on resize while open (doesn't conflict with close-on-scroll)
  useEffect(() => {
    if (!open) return;
    const onResize = () => computePosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Optional: if popup content size changes while open, reposition
  useEffect(() => {
    if (!open) return;
    const el = popupRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => computePosition());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {trigger}

      {portalRoot &&
        createPortal(
          <div
            ref={popupRef}
            className={[
              "fixed z-[999]",
              open ? "block" : "hidden",
              open && !ready ? "opacity-0 pointer-events-none" : "opacity-100",
              "transition-opacity duration-100",
            ].join(" ")}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
              maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
            }}
          >
            <div className="">{content}</div>
          </div>,
          portalRoot
        )}
    </>
  );
}
