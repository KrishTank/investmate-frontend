/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep "vault" surface — the new app background
        vault: {
          DEFAULT: "#0A1B14",
          deep: "#050F0A",
          rim: "#122E22",
        },
        paper: {
          DEFAULT: "#F2F4EF",
          dim: "#E9ECE3",
          card: "#FBFBF8",
        },
        ink: {
          DEFAULT: "#13231C",
          soft: "#3A473F",
          faint: "#7C8A80",
        },
        // On-dark text
        mist: {
          DEFAULT: "#EAF1EC",
          soft: "#B9C6BC",
          faint: "#7E9184",
        },
        emerald: {
          DEFAULT: "#1B5E44",
          light: "#2C7A5B",
          bright: "#3FA576",
          dark: "#0F3E2C",
        },
        moss: {
          DEFAULT: "#8CA890",
          light: "#B7CBB8",
        },
        gold: {
          DEFAULT: "#C99A3C",
          light: "#E4C077",
          bright: "#F4D785",
          dark: "#9C7326",
        },
        brick: {
          DEFAULT: "#A6402F",
          light: "#C46A54",
        },
        line: "#D9DFD3",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        ledger:
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(19,35,28,0.06) 28px)",
        "ledger-dark":
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(234,241,236,0.045) 28px)",
        "vault-radial":
          "radial-gradient(60% 50% at 15% 0%, rgba(63,165,118,0.24) 0%, rgba(63,165,118,0) 60%), radial-gradient(50% 45% at 100% 10%, rgba(201,154,60,0.18) 0%, rgba(201,154,60,0) 60%), radial-gradient(70% 60% at 50% 120%, rgba(15,62,44,0.55) 0%, rgba(15,62,44,0) 60%)",
        "gold-sheen":
          "linear-gradient(120deg, rgba(228,192,119,0) 30%, rgba(244,215,133,0.55) 50%, rgba(228,192,119,0) 70%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(19,35,28,0.04), 0 8px 24px -12px rgba(19,35,28,0.15)",
        "card-dark": "0 1px 0 rgba(234,241,236,0.06) inset, 0 20px 44px -20px rgba(0,0,0,0.65)",
        "glow-gold": "0 0 0 1px rgba(201,154,60,0.35), 0 0 32px -4px rgba(228,192,119,0.45)",
        "glow-emerald": "0 0 0 1px rgba(63,165,118,0.35), 0 0 32px -6px rgba(63,165,118,0.5)",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "seal-in": {
          "0%": { transform: "scale(0.6) rotate(-18deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(-6deg)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, -4%) scale(1.05)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(63,165,118,0.45)" },
          "70%": { boxShadow: "0 0 0 14px rgba(63,165,118,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(63,165,118,0)" },
        },
        sheen: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "250% 0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "seal-in": "seal-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        "fade-up": "fade-up 0.5s ease-out both",
        drift: "drift 14s ease-in-out infinite",
        "drift-slow": "drift 22s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
        sheen: "sheen 2.8s linear infinite",
      },
    },
  },
  plugins: [],
};
