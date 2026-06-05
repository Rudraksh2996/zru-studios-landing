import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  animate,
} from "framer-motion";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  bg: "#08080C",
  surface: "#0F0F15",
  surface2: "#14141C",
  border: "rgba(255,255,255,0.07)",
  borderHov: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.42)",
  dim: "rgba(255,255,255,0.22)",
  accent: "#7B7BFF",
  accentDim: "rgba(123,123,255,0.18)",
  green: "#3DDB82",
  greenDim: "rgba(61,219,130,0.15)",
};

/* ─────────────────────────────────────────────
   SPRING PRESETS
───────────────────────────────────────────── */
const sp = { type: "spring", stiffness: 220, damping: 22 };
const spFast = { type: "spring", stiffness: 320, damping: 24 };
const spSlow = { type: "spring", stiffness: 100, damping: 18 };

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');

    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    :root {
      --bg:        ${C.bg};
      --surface:   ${C.surface};
      --surface2:  ${C.surface2};
      --border:    ${C.border};
      --borderHov: ${C.borderHov};
      --text:      ${C.text};
      --muted:     ${C.muted};
      --dim:       ${C.dim};
      --accent:    ${C.accent};
      --accentDim: ${C.accentDim};
      --green:     ${C.green};
      --greenDim:  ${C.greenDim};
    }

    html { scroll-behavior:smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Geist', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* Noise grain overlay */
    body::before {
      content:'';
      position:fixed;
      inset:0;
      pointer-events:none;
      z-index:9999;
      opacity:.028;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 128px 128px;
    }

    ::selection { background:rgba(123,123,255,.28); }

    ::-webkit-scrollbar { width:4px; background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }

    section { position:relative; }

    /* Grid dot pattern utility */
    .dot-grid {
      background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 28px 28px;
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   FADE-UP WRAPPER
───────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      style={style}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...sp, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   3-D TILT HOOK
───────────────────────────────────────────── */
function useTilt(strength = 8) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(
    useTransform(my, [-0.5, 0.5], [strength, -strength]),
    spSlow
  );
  const ry = useSpring(
    useTransform(mx, [-0.5, 0.5], [-strength, strength]),
    spSlow
  );
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };
  return { ref, rx, ry, onMove, onLeave };
}

/* ─────────────────────────────────────────────
   BENTO CARD
───────────────────────────────────────────── */
function BentoCard({ children, className = "", style = {}, glow = false }) {
  const { ref, rx, ry, onMove, onLeave } = useTilt(5);
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        onLeave();
        setHov(false);
      }}
      onMouseEnter={() => setHov(true)}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
        background: C.surface,
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        transition: "border-color .25s",
        ...style,
      }}
      className={className}
      whileHover={{ scale: 1.015 }}
      transition={sp}
    >
      {/* inner glow on hover */}
      {glow && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 20,
            background: `radial-gradient(ellipse 70% 60% at 50% -10%, ${C.accentDim}, transparent)`,
            pointerEvents: "none",
          }}
          animate={{ opacity: hov ? 1 : 0 }}
          transition={{ duration: 0.35 }}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding: 24,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        padding: scrolled ? "10px 20px" : "20px 20px",
        transition: "padding .3s",
      }}
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...sp, delay: 0.08 }}
    >
      <div
        style={{
          maxWidth: 1080,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(8,8,12,0.72)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.4)" : "none",
          border: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
          borderRadius: 14,
          padding: "10px 18px",
          transition: "background .3s, border-color .3s, backdrop-filter .3s",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7B7BFF 0%, #5252cc 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(123,123,255,.38)",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "-.02em",
              }}
            >
              Z
            </span>
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "-.02em",
            }}
          >
            Zru Studios
          </span>
        </div>

        {/* Links */}
        <nav style={{ display: "flex", gap: 28 }}>
          {["Services", "Work", "Process", "Pricing"].map((l) => (
            <motion.a
              key={l}
              href={`#${l.toLowerCase()}`}
              style={{
                color: C.muted,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: "none",
                letterSpacing: "-.01em",
              }}
              whileHover={{ color: C.text }}
              transition={{ duration: 0.18 }}
            >
              {l}
            </motion.a>
          ))}
        </nav>

        {/* CTA */}
        <motion.button
          style={{
            background: C.text,
            color: C.bg,
            border: "none",
            borderRadius: 9,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-.01em",
            fontFamily: "inherit",
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 22px rgba(255,255,255,.18)",
          }}
          whileTap={{ scale: 0.96 }}
          transition={spFast}
        >
          Book a Call ↗️
        </motion.button>
      </div>
    </motion.header>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function HeroBrowserMockup() {
  return (
    <motion.div
      style={{
        background: C.surface2,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        width: "100%",
        maxWidth: 620,
        boxShadow:
          "0 40px 100px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04)",
      }}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...sp, delay: 0.7 }}
    >
      {/* toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,.025)",
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 22,
            borderRadius: 6,
            background: "rgba(255,255,255,.06)",
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            marginLeft: 6,
            fontSize: 11,
            color: C.dim,
          }}
        >
          zru.studio
        </div>
      </div>

      {/* content skeleton */}
      <div style={{ padding: 20 }}>
        {/* nav */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 60,
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,.1)",
              }}
            />
            <div
              style={{
                width: 48,
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,.06)",
              }}
            />
            <div
              style={{
                width: 48,
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,.06)",
              }}
            />
          </div>
          <div
            style={{
              width: 64,
              height: 22,
              borderRadius: 6,
              background: C.accent,
              opacity: 0.8,
            }}
          />
        </div>

        {/* hero text */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              width: "75%",
              height: 18,
              borderRadius: 6,
              background: "rgba(255,255,255,.18)",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              width: "60%",
              height: 18,
              borderRadius: 6,
              background: "rgba(255,255,255,.14)",
              marginBottom: 16,
            }}
          />
          <div
            style={{
              width: "90%",
              height: 7,
              borderRadius: 4,
              background: "rgba(255,255,255,.06)",
              marginBottom: 5,
            }}
          />
          <div
            style={{
              width: "80%",
              height: 7,
              borderRadius: 4,
              background: "rgba(255,255,255,.05)",
              marginBottom: 20,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 88,
                height: 28,
                borderRadius: 7,
                background: C.accent,
              }}
            />
            <div
              style={{
                width: 88,
                height: 28,
                borderRadius: 7,
                background: "rgba(255,255,255,.08)",
                border: `1px solid ${C.border}`,
              }}
            />
          </div>
        </div>

        {/* bento preview mini */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            {
              h: 80,
              span: 2,
              grad: "linear-gradient(135deg,rgba(123,123,255,.18),rgba(123,123,255,.05))",
            },
            {
              h: 80,
              span: 1,
              grad: "linear-gradient(135deg,rgba(61,219,130,.12),transparent)",
            },
            {
              h: 60,
              span: 1,
              grad: "linear-gradient(135deg,rgba(255,255,255,.06),transparent)",
            },
            {
              h: 60,
              span: 2,
              grad: "linear-gradient(135deg,rgba(123,123,255,.09),transparent)",
            },
          ].map((b, i) => (
            <motion.div
              key={i}
              style={{
                gridColumn: `span ${b.span}`,
                height: b.h,
                borderRadius: 10,
                background: b.grad,
                border: `1px solid ${C.border}`,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.07, ...sp }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FloatingPill({ style, delay, children }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        background: "rgba(15,15,21,0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "8px 13px",
        fontSize: 12,
        color: C.muted,
        boxShadow: "0 8px 30px rgba(0,0,0,.35)",
        ...style,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { delay, duration: 0.4 },
        y: {
          delay,
          duration: 3.6 + delay * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function Hero() {
  return (
    <section
      style={{
        paddingTop: 140,
        paddingBottom: 100,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(123,123,255,.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* badge */}
        <motion.div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${C.border}`,
            borderRadius: 100,
            padding: "5px 14px 5px 8px",
            fontSize: 12.5,
            color: C.muted,
            marginBottom: 32,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...sp, delay: 0.15 }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              width: 8,
              height: 8,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: C.green,
                animation: "ping 1.4s ease-in-out infinite",
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.green,
                display: "block",
              }}
            />
          </span>
          Now accepting global clients
          <style>{`@keyframes ping { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:0;transform:scale(2.2)} }`}</style>
        </motion.div>

        {/* headline */}
        <motion.h1
          style={{
            fontSize: "clamp(44px,6vw,82px)",
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-.04em",
            marginBottom: 22,
            maxWidth: 820,
            margin: "0 auto 22px",
          }}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.28 }}
        >
          We design and build
          <br />
          <span
            style={{
              background:
                "linear-gradient(90deg, #fff 0%, rgba(255,255,255,.55) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            the future of the web.
          </span>
        </motion.h1>

        {/* sub */}
        <motion.p
          style={{
            fontSize: 17,
            color: C.muted,
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.38 }}
        >
          UI/UX, Web Design, Graphic Design, Template Systems, and full Website
          Development — crafted to captivate and convert.
        </motion.p>

        {/* CTAs */}
        <motion.div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 72,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sp, delay: 0.48 }}
        >
          <motion.button
            style={{
              background: C.text,
              color: C.bg,
              border: "none",
              borderRadius: 10,
              padding: "11px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-.01em",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255,255,255,.15)",
            }}
            whileTap={{ scale: 0.96 }}
            transition={spFast}
          >
            View Work ↗️
          </motion.button>
          <motion.button
            style={{
              background: "transparent",
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "11px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-.01em",
            }}
            whileHover={{
              borderColor: C.borderHov,
              background: "rgba(255,255,255,.04)",
              scale: 1.04,
            }}
            whileTap={{ scale: 0.96 }}
            transition={spFast}
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* browser + floating pills */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <HeroBrowserMockup />

          <FloatingPill
            style={{
              top: 24,
              left: "5%",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            delay={0.9}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.green,
              }}
            />
            <span style={{ color: C.text, fontWeight: 500 }}>
              Project deployed
            </span>
          </FloatingPill>

          <FloatingPill
            style={{
              top: 24,
              right: "5%",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
            delay={1.05}
          >
            <span
              style={{
                color: C.dim,
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Performance
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              {[55, 75, 50, 88, 68, 95].map((h, i) => (
                <motion.div
                  key={i}
                  style={{
                    width: 5,
                    borderRadius: 2,
                    background: `linear-gradient(to top,${C.accent},rgba(123,123,255,.4))`,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: h * 0.38 }}
                  transition={{ delay: 1.3 + i * 0.07, ...sp }}
                />
              ))}
            </div>
          </FloatingPill>

          <FloatingPill
            style={{
              bottom: 48,
              left: "4%",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            delay={1.15}
          >
            <div style={{ display: "flex" }}>
              {["#7B7BFF", "#3DDB82", "#FF7B7B"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: c,
                    marginLeft: i ? -6 : 0,
                    border: "2px solid #0F0F15",
                  }}
                />
              ))}
            </div>
            <span style={{ color: C.text, fontWeight: 500 }}>+12 clients</span>
          </FloatingPill>

          <FloatingPill style={{ bottom: 48, right: "4%" }} delay={1.0}>
            <span
              style={{
                color: C.dim,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                display: "block",
                marginBottom: 2,
              }}
            >
              Design Score
            </span>
            <span
              style={{
                color: C.text,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-.03em",
              }}
            >
              98<span style={{ color: C.dim, fontWeight: 400, fontSize: 12 }}>
                /100
              </span>
            </span>
          </FloatingPill>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SERVICES BENTO
───────────────────────────────────────────── */

/* Card 1 – UI/UX */
function UIUXPreview() {
  const [on, setOn] = useState([true, false, true]);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[C.accent, "#3DDB82", "#FF7B7B"].map((c, i) => (
          <motion.div
            key={i}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: c,
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.25, y: -4, opacity: 1 }}
            transition={sp}
          >
            {String.fromCharCode(65 + i)}
          </motion.div>
        ))}
        <span
          style={{
            color: C.dim,
            fontSize: 11,
            alignSelf: "center",
            marginLeft: 4,
          }}
        >
          Active team
        </span>
      </div>
      {["Dark Mode", "Analytics", "Real-time Sync"].map((label, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: C.muted,
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <motion.button
            style={{
              width: 38,
              height: 20,
              borderRadius: 10,
              position: "relative",
              cursor: "pointer",
              border: "none",
              background: on[i] ? C.accent : "rgba(255,255,255,.1)",
              outline: "none",
            }}
            onClick={() =>
              setOn((p) => p.map((v, j) => (j === i ? !v : v)))
            }
            whileTap={{ scale: 0.9 }}
            transition={spFast}
          >
            <motion.div
              style={{
                position: "absolute",
                top: 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
              }}
              animate={{ left: on[i] ? 20 : 2 }}
              transition={sp}
            />
          </motion.button>
        </div>
      ))}
    </div>
  );
}

/* Card 2 – Web Design */
function WebDesignPreview() {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: C.bg,
        cursor: "pointer",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "8px 12px",
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,.02)",
        }}
      >
        {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c,
              opacity: 0.75,
            }}
          />
        ))}
      </div>
      <div
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <motion.div
          style={{ height: 8, borderRadius: 4 }}
          animate={{
            background: hov ? C.accent : "rgba(255,255,255,.1)",
            width: hov ? "70%" : "50%",
          }}
          transition={sp}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ borderRadius: 8 }}
              animate={{
                height: hov ? 36 : 24,
                background: hov
                  ? [
                      "rgba(123,123,255,.2)",
                      "rgba(61,219,130,.15)",
                      "rgba(255,123,123,.15)",
                    ][i]
                  : "rgba(255,255,255,.07)",
              }}
              transition={{ ...sp, delay: i * 0.04 }}
            />
          ))}
        </div>
        <motion.div
          style={{ height: 24, borderRadius: 7, width: 80 }}
          animate={{
            background: hov ? C.text : "rgba(255,255,255,.12)",
          }}
          transition={sp}
        />
      </div>
    </div>
  );
}

/* Card 3 – Graphic Design */
function GraphicDesignPreview() {
  const shapes = [
    {
      x: 0,
      y: 0,
      c: "linear-gradient(135deg,#7B7BFF,#5252CC)",
      label: "Aa",
      r: 14,
    },
    {
      x: 30,
      y: 18,
      c: "linear-gradient(135deg,#3DDB82,#1aae5a)",
      label: "Bb",
      r: 14,
    },
    {
      x: 12,
      y: 36,
      c: "linear-gradient(135deg,#FF7B7B,#cc5252)",
      label: "Cc",
      r: 14,
    },
  ];
  return (
    <div
      style={{
        position: "relative",
        height: 88,
        marginTop: 4,
      }}
    >
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: 72,
            height: 48,
            background: s.c,
            borderRadius: s.r,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            zIndex: i,
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(0,0,0,.4)",
          }}
          whileHover={{
            scale: 1.15,
            zIndex: 10,
            rotate: [-2, 2, -2, 0],
            y: -4,
          }}
          transition={sp}
        >
          {s.label}
        </motion.div>
      ))}
    </div>
  );
}

/* Card 4 – Templates */
function TemplatesPreview() {
  const [active, setActive] = useState(0);
  const cards = [
    "linear-gradient(135deg,rgba(123,123,255,.25),rgba(123,123,255,.08))",
    "linear-gradient(135deg,rgba(61,219,130,.2),rgba(61,219,130,.06))",
    "linear-gradient(135deg,rgba(255,123,123,.2),rgba(255,123,123,.06))",
  ];
  return (
    <div
      style={{ position: "relative", height: 90, cursor: "pointer" }}
      onClick={() => setActive((a) => (a + 1) % 3)}
    >
      {cards.map((g, i) => {
        const off = (i - active + 3) % 3;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              inset: "0 0 auto 0",
              height: 60,
              borderRadius: 14,
              background: g,
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,.35)",
            }}
            animate={{
              y: off * 11,
              scale: 1 - off * 0.035,
              zIndex: 3 - off,
            }}
            transition={sp}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 14px",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "rgba(255,255,255,.12)",
                }}
              />
              <div>
                <div
                  style={{
                    width: 80,
                    height: 7,
                    borderRadius: 4,
                    background: "rgba(255,255,255,.2)",
                    marginBottom: 5,
                  }}
                />
                <div
                  style={{
                    width: 56,
                    height: 5,
                    borderRadius: 4,
                    background: "rgba(255,255,255,.1)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          fontSize: 10,
          color: C.dim,
        }}
      >
        Click to cycle
      </span>
    </div>
  );
}

/* Card 5 – Website Building */
function WebBuildingPreview() {
  const [built, setBuilt] = useState(false);
  return (
    <div style={{ cursor: "pointer" }} onClick={() => setBuilt((b) => !b)}>
      <AnimatePresence mode="wait">
        {!built ? (
          <motion.div
            key="code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              background: "rgba(255,255,255,.03)",
              borderRadius: 12,
              padding: "12px 14px",
              lineHeight: 1.7,
              border: `1px solid ${C.border}`,
            }}
          >
            <div>
              <span style={{ color: "#7B7BFF" }}>const</span>{" "}
              <span style={{ color: "#3DDB82" }}>App</span> = () =&gt; {"{"}
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: "#7B7BFF" }}>return</span> {"("}
              <span style={{ color: "#FF7B7B" }}>&lt;Hero /&gt;</span>
              {")"}
            </div>
            <div style={{ color: C.dim }}>{"}"}</div>
          </motion.div>
        ) : (
          <motion.div
            key="ui"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={sp}
            style={{
              background:
                "linear-gradient(135deg,rgba(123,123,255,.12),rgba(61,219,130,.06))",
              borderRadius: 12,
              padding: 14,
              border: "1px solid rgba(123,123,255,.2)",
            }}
          >
            <div
              style={{
                height: 7,
                background: "rgba(255,255,255,.25)",
                borderRadius: 4,
                width: "72%",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 5,
                background: "rgba(255,255,255,.1)",
                borderRadius: 4,
                marginBottom: 5,
              }}
            />
            <div
              style={{
                height: 5,
                background: "rgba(255,255,255,.07)",
                borderRadius: 4,
                width: "85%",
                marginBottom: 12,
              }}
            />
            <div
              style={{
                height: 24,
                background: C.accent,
                borderRadius: 7,
                width: 72,
                opacity: 0.85,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        style={{
          fontSize: 10,
          color: C.dim,
          textAlign: "right",
          marginTop: 8,
        }}
      >
        {built ? "← Code view" : "→ Preview"}
      </div>
    </div>
  );
}

/* Services section */
function Services() {
  const services = [
    {
      title: "UI/UX Design",
      desc: "Intuitive interfaces users love.",
      preview: <UIUXPreview />,
      cols: 5,
    },
    {
      title: "Web Design",
      desc: "Pixel-perfect adaptive layouts.",
      preview: <WebDesignPreview />,
      cols: 7,
    },
    {
      title: "Graphic Design",
      desc: "Bold visuals that communicate.",
      preview: <GraphicDesignPreview />,
      cols: 4,
    },
    {
      title: "Template Designs",
      desc: "Launch faster with crafted foundations.",
      preview: <TemplatesPreview />,
      cols: 4,
    },
    {
      title: "Website Building",
      desc: "Code that becomes polished experiences.",
      preview: <WebBuildingPreview />,
      cols: 4,
    },
  ];

  return (
    <section id="services" style={{ padding: "100px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <FadeUp>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11.5,
              fontWeight: 600,
              color: C.accent,
              background: C.accentDim,
              border: "1px solid rgba(123,123,255,.22)",
              borderRadius: 100,
              padding: "4px 13px",
              marginBottom: 16,
              letterSpacing: ".04em",
            }}
          >
            SERVICES
          </div>
          <h2
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 800,
              letterSpacing: "-.04em",
              lineHeight: 1.1,
              marginBottom: 14,
            }}
          >
            Crafted with intent.
            <br />
            <span style={{ color: C.muted }}>Built to last.</span>
          </h2>
          <p
            style={{
              color: C.muted,
              fontSize: 16,
              maxWidth: 440,
              margin: "0 auto",
            }}
          >
            Every service we offer is designed to deliver maximum impact —
            beautiful, functional, and scalable.
          </p>
        </div>
      </FadeUp>

      {/* Bento grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12,1fr)",
          gap: 12,
        }}
      >
        {services.map((s, i) => (
          <FadeUp
            key={i}
            delay={i * 0.07}
            style={{ gridColumn: `span ${s.cols}` }}
          >
            <BentoCard glow style={{ height: "100%" }}>
              <div style={{ marginBottom: 16 }}>{s.preview}</div>
              <div
                style={{
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 14,
                  marginTop: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    marginBottom: 3,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            </BentoCard>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PORTFOLIO
───────────────────────────────────────────── */
const projects = [
  {
    title: "Luminary Dashboard",
    tag: "Web App",
    year: "2025",
    grad: "linear-gradient(135deg,#1a1040 0%,#2a1a6e 100%)",
    accent: "#7B7BFF",
  },
  {
    title: "Apex Brand Identity",
    tag: "Branding",
    year: "2025",
    grad: "linear-gradient(135deg,#0f2210 0%,#1a3d20 100%)",
    accent: "#3DDB82",
  },
  {
    title: "Orbit SaaS Platform",
    tag: "UI/UX",
    year: "2025",
    grad: "linear-gradient(135deg,#281010 0%,#4a1010 100%)",
    accent: "#FF7B7B",
  },
  {
    title: "Prism Design System",
    tag: "System Design",
    year: "2026",
    grad: "linear-gradient(135deg,#10202a 0%,#0d2f46 100%)",
    accent: "#7BC8FF",
  },
];

function PortfolioCard({ p, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...sp, delay: i * 0.09 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        background: C.surface,
        boxShadow: hov
          ? "0 30px 60px rgba(0,0,0,.45)"
          : "0 4px 20px rgba(0,0,0,.25)",
        transition: "border-color .25s, box-shadow .3s",
      }}
    >
      {/* image area */}
      <div
        style={{
          height: 200,
          background: p.grad,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{ scale: hov ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: "rgba(255,255,255,.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: p.accent,
                opacity: 0.8,
              }}
            />
          </div>
        </motion.div>
        {/* tag */}
        <motion.div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(8,8,12,.7)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: C.muted,
          }}
          initial={{ x: 12, opacity: 0 }}
          animate={{ x: hov ? 0 : 12, opacity: hov ? 1 : 0 }}
          transition={sp}
        >
          {p.tag}
        </motion.div>
      </div>
      {/* meta */}
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "-.02em",
              marginBottom: 2,
            }}
          >
            {p.title}
          </div>
          <div style={{ fontSize: 11, color: C.dim }}>{p.year}</div>
        </div>
        <motion.div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(255,255,255,.05)",
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            cursor: "pointer",
          }}
          animate={{
            background: hov ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.05)",
          }}
          transition={sp}
        >
          ↗️
        </motion.div>
      </div>
    </motion.div>
  );
}

function Portfolio() {
  return (
    <section id="work" style={{ padding: "100px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <FadeUp>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 52,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                fontSize: 11.5,
                fontWeight: 600,
                color: C.green,
                background: C.greenDim,
                border: "1px solid rgba(61,219,130,.18)",
                borderRadius: 100,
                padding: "4px 13px",
                marginBottom: 14,
                letterSpacing: ".04em",
              }}
            >
              WORK
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,4vw,50px)",
                fontWeight: 800,
                letterSpacing: "-.04em",
                lineHeight: 1.1,
              }}
            >
              Work that speaks.
            </h2>
          </div>
          <motion.button
            style={{
              background: "transparent",
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            whileHover={{
              color: C.text,
              borderColor: C.borderHov,
              scale: 1.04,
            }}
            whileTap={{ scale: 0.97 }}
            transition={spFast}
          >
            View all ↗️
          </motion.button>
        </div>
      </FadeUp>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {projects.map((p, i) => (
          <PortfolioCard key={i} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PROCESS
───────────────────────────────────────────── */
const steps = [
  {
    n: "01",
    title: "Discovery",
    desc: "We dive deep into your goals, audience, and competitive landscape to build a shared vision that drives every decision.",
    icon: "🔍",
  },
  {
    n: "02",
    title: "Design",
    desc: "Wireframes, prototypes, and high-fidelity mockups — crafted with obsessive attention to detail and brand alignment.",
    icon: "✦",
  },
  {
    n: "03",
    title: "Development",
    desc: "Clean, performant code that brings the design to life pixel-perfect and fully responsive across every device.",
    icon: "⌨️",
  },
  {
    n: "04",
    title: "Launch",
    desc: "Rigorous QA, smooth deployment, and white-glove post-launch support to ensure everything runs flawlessly.",
    icon: "🚀",
  },
];

function Process() {
  const [active, setActive] = useState(0);

  return (
    <section id="process" style={{ padding: "100px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <FadeUp>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11.5,
              fontWeight: 600,
              color: C.muted,
              background: "rgba(255,255,255,.04)",
              border: `1px solid ${C.border}`,
              borderRadius: 100,
              padding: "4px 13px",
              marginBottom: 14,
              letterSpacing: ".04em",
            }}
          >
            PROCESS
          </div>
          <h2
            style={{
              fontSize: "clamp(30px,4vw,50px)",
              fontWeight: 800,
              letterSpacing: "-.04em",
              lineHeight: 1.1,
            }}
          >
            From idea to impact.
          </h2>
        </div>
      </FadeUp>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {/* left: steps */}
        <FadeUp delay={0.1} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {steps.map((s, i) => {
            const isActive = active === i;
            return (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: isActive
                    ? "rgba(123,123,255,.1)"
                    : C.surface,
                  border: `1px solid ${isActive ? "rgba(123,123,255,.35)" : C.border}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .2s, border-color .2s",
                }}
                whileHover={{ x: isActive ? 0 : 4 }}
                transition={sp}
              >
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.dim,
                      marginBottom: 3,
                      letterSpacing: ".05em",
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: "-.02em",
                      color: isActive ? C.text : C.muted,
                    }}
                  >
                    {s.title}
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spFast}
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: C.accent,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </FadeUp>

        {/* right: detail */}
        <FadeUp delay={0.2}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={sp}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 340,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* glow */}
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${C.accentDim}, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 44, marginBottom: 20 }}>
                  {steps[active].icon}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.dim,
                    letterSpacing: ".06em",
                    marginBottom: 8,
                  }}
                >
                  PHASE {steps[active].n}
                </div>
                <h3
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    letterSpacing: "-.04em",
                    marginBottom: 14,
                  }}
                >
                  {steps[active].title}
                </h3>
                <p
                  style={{
                    color: C.muted,
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  {steps[active].desc}
                </p>
              </div>
              {/* progress dots */}
              <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    style={{ height: 3, borderRadius: 2 }}
                    animate={{
                      width: i === active ? 28 : 6,
                      background:
                        i === active
                          ? C.accent
                          : "rgba(255,255,255,.12)",
                    }}
                    transition={sp}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
const plans = [
  {
    name: "Starter",
    price: "$1,499",
    desc: "For founders and small projects",
    features: [
      "1 landing page",
      "UI/UX design",
      "Mobile responsive",
      "2 revision rounds",
      "7-day delivery",
    ],
    cta: "Get Started",
  },
  {
    name: "Studio",
    price: "$4,999",
    desc: "For teams that need full-scale design",
    features: [
      "Up to 10 pages",
      "Brand identity included",
      "Design system",
      "Unlimited revisions",
      "Priority support",
    ],
    cta: "Book a Call",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Full-service for ambitious brands",
    features: [
      "Unlimited scope",
      "Dedicated designer",
      "Dev handoff",
      "Ongoing retainer",
      "White-glove support",
    ],
    cta: "Contact Us",
  },
];

function Pricing() {
  return (
    <section id="pricing" style={{ padding: "100px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <FadeUp>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11.5,
              fontWeight: 600,
              color: C.accent,
              background: C.accentDim,
              border: "1px solid rgba(123,123,255,.22)",
              borderRadius: 100,
              padding: "4px 13px",
              marginBottom: 14,
              letterSpacing: ".04em",
            }}
          >
            PRICING
          </div>
          <h2
            style={{
              fontSize: "clamp(30px,4vw,50px)",
              fontWeight: 800,
              letterSpacing: "-.04em",
            }}
          >
            Simple, transparent pricing.
          </h2>
        </div>
      </FadeUp>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
        }}
      >
        {plans.map((p, i) => {
          const pop = p.popular;
          return (
            <FadeUp key={i} delay={i * 0.09}>
              <motion.div
                style={{
                  background: pop
                    ? "rgba(123,123,255,.08)"
                    : C.surface,
                  border: `1px solid ${pop ? "rgba(123,123,255,.3)" : C.border}`,
                  borderRadius: 20,
                  padding: "28px 24px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: pop
                    ? "0 0 60px rgba(123,123,255,.08)"
                    : "none",
                }}
                whileHover={{
                  y: -6,
                  boxShadow: pop
                    ? "0 30px 60px rgba(123,123,255,.12)"
                    : "0 20px 40px rgba(0,0,0,.35)",
                }}
                transition={sp}
              >
                {pop && (
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: C.accent,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: 100,
                      whiteSpace: "nowrap",
                      letterSpacing: ".02em",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.dim,
                      letterSpacing: ".06em",
                      marginBottom: 10,
                    }}
                  >
                    {p.name.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      letterSpacing: "-.04em",
                      marginBottom: 4,
                    }}
                  >
                    {p.price}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    {p.desc}
                  </div>
                </div>
                <ul
                  style={{
                    flex: 1,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: pop
                            ? C.accentDim
                            : "rgba(255,255,255,.06)",
                          border: `1px solid ${pop ? "rgba(123,123,255,.3)" : C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          color: pop ? C.accent : C.dim,
                        }}
                      >
                        ✓
                      </div>
                      <span style={{ color: C.muted }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 11,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background: pop
                      ? C.accent
                      : "rgba(255,255,255,.07)",
                    color: pop ? "#fff" : C.text,
                  }}
                  whileHover={{
                    scale: 1.03,
                    background: pop
                      ? "#9090ff"
                      : "rgba(255,255,255,.12)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={spFast}
                >
                  {p.cta} →
                </motion.button>
              </motion.div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA BAND
───────────────────────────────────────────── */
function CTABand() {
  return (
    <FadeUp>
      <section style={{ padding: "0 24px 100px", maxWidth: 1080, margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 24,
            padding: "64px 48px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(123,123,255,.12) 0%, rgba(61,219,130,.06) 100%)",
            border: "1px solid rgba(123,123,255,.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 500,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(123,123,255,.07), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontSize: "clamp(28px,4vw,48px)",
                fontWeight: 800,
                letterSpacing: "-.04em",
                marginBottom: 14,
              }}
            >
              Ready to build something great?
            </h2>
            <p
              style={{
                color: C.muted,
                marginBottom: 32,
                fontSize: 16,
              }}
            >
              Let's turn your vision into a world-class digital product.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <motion.button
                style={{
                  background: C.text,
                  color: C.bg,
                  border: "none",
                  borderRadius: 11,
                  padding: "12px 26px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                whileHover={{
                  scale: 1.06,
                  boxShadow: "0 0 32px rgba(255,255,255,.2)",
                }}
                whileTap={{ scale: 0.96 }}
                transition={spFast}
              >
                Start a Project ↗️
              </motion.button>
              <motion.button
                style={{
                  background: "transparent",
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 11,
                  padding: "12px 26px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                whileHover={{
                  borderColor: C.borderHov,
                  background: "rgba(255,255,255,.04)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={spFast}
              >
                View Work
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </FadeUp>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  const cols = [
    {
      head: "Services",
      links: [
        "UI/UX Design",
        "Web Design",
        "Graphic Design",
        "Templates",
        "Development",
      ],
    },
    {
      head: "Company",
      links: ["About", "Careers", "Blog", "Press"],
    },
    {
      head: "Legal",
      links: ["Privacy", "Terms", "Cookies"],
    },
  ];

  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        background: C.surface,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
          }}
        >
          {/* brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background:
                    "linear-gradient(135deg,#7B7BFF,#5252cc)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 0 14px rgba(123,123,255,.3)",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  Z
                </span>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "-.02em",
                }}
              >
                Zru Studios
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: C.muted,
                lineHeight: 1.7,
                maxWidth: 220,
                marginBottom: 20,
              }}
            >
              We design and build exceptional digital experiences for ambitious
              brands worldwide.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["𝕏", "in", "⊕", "◉"].map((s, i) => (
                <motion.a
                  key={i}
                  href="#"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,255,255,.05)",
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: C.dim,
                    textDecoration: "none",
                  }}
                  whileHover={{
                    borderColor: C.borderHov,
                    color: C.text,
                    scale: 1.1,
                  }}
                  transition={spFast}
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </div>

          {/* link cols */}
          {cols.map((col, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.dim,
                  letterSpacing: ".08em",
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                {col.head}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {col.links.map((l, j) => (
                  <li key={j}>
                    <motion.a
                      href="#"
                      style={{
                        fontSize: 13,
                        color: C.muted,
                        textDecoration: "none",
                      }}
                      whileHover={{ color: C.text, x: 2 }}
                      transition={sp}
                    >
                      {l}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            marginTop: 48,
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: C.dim,
            }}
          >
            ©️ 2025 Zru Studios. All rights reserved.
          </span>
          <span
            style={{
              fontSize: 12,
              color: C.dim,
            }}
          >
            Designed with precision. Shipped with pride.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function ZruStudios() {
  return (
    <>
      <GlobalStyle />
      <Nav />
      <main>
        <Hero />
        {/* divider */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.border},transparent)`,
            }}
          />
        </div>
        <Services />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.border},transparent)`,
            }}
          />
        </div>
        <Portfolio />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.border},transparent)`,
            }}
          />
        </div>
        <Process />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,transparent,${C.border},transparent)`,
            }}
          />
        </div>
        <Pricing />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
