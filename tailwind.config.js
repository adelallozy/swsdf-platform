// tailwind.config.js
const colors = require("tailwindcss/colors");

module.exports = {
  prefix: "tw-",
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/v3/**/*.{vue,js,ts,jsx,tsx,css,scss}",
    "./components/**/*.{js,vue,ts}",
    "./v3/components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./v3/layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
    "./node_modules/primevue/**/*.{vue,js}",
  ],
  theme: {
    screens: {
      sm: "600px",
      md: "800px",
      lg: "1024px",
      xl: "1200px",
      "2xl": "1400px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        lg: "1rem",
        xl: "1rem",
        "2xl": "2rem",
      },
    },
    extend: {
      colors: {
        // PrimeVue Aura tokens
        p: {
          primary: {
            50: "var(--p-primary-50)",
            100: "var(--p-primary-100)",
            200: "var(--p-primary-200)",
            300: "var(--p-primary-300)",
            400: "var(--p-primary-400)",
            500: "var(--p-primary-500)",
            600: "var(--p-primary-600)",
            700: "var(--p-primary-700)",
            800: "var(--p-primary-800)",
            900: "var(--p-primary-900)",
            950: "var(--p-primary-950)",
            DEFAULT: "var(--p-primary-500)",
          },
          surface: {
            0: "var(--p-surface-0)",
            50: "var(--p-surface-50)",
            100: "var(--p-surface-100)",
            200: "var(--p-surface-200)",
            300: "var(--p-surface-300)",
            400: "var(--p-surface-400)",
            500: "var(--p-surface-500)",
            600: "var(--p-surface-600)",
            700: "var(--p-surface-700)",
            800: "var(--p-surface-800)",
            900: "var(--p-surface-900)",
            950: "var(--p-surface-950)",
            DEFAULT: "var(--p-surface-0)",
          },
          text: {
            DEFAULT: "var(--p-text-color)",
            muted: "var(--p-text-muted-color)",
            hover: "var(--p-text-hover-color)",
            "hover-muted": "var(--p-text-hover-muted-color)",
          },
          content: {
            DEFAULT: "var(--p-content-background)",
            hover: "var(--p-content-hover-background)",
            border: "var(--p-content-border-color)",
            color: "var(--p-content-color)",
            "hover-color": "var(--p-content-hover-color)",
          },
          highlight: {
            bg: "var(--p-highlight-background)",
            "bg-focus": "var(--p-highlight-focus-background)",
            color: "var(--p-highlight-color)",
            "color-focus": "var(--p-highlight-focus-color)",
          },
        },

        // SWSDF brand tokens
        primary: {
          DEFAULT: "#035796",
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#badbff",
          300: "#8ac2ff",
          400: "#57a6ff",
          500: "#2b8aff",
          600: "#1f6cdb",
          700: "#1955ae",
          800: "#153f82",
          900: "#0f2c5d",
          950: "#0a1e42",
        },
        secondary: { DEFAULT: "#181E3C" },

        // Brand “surface” (this is the one that powers tw-bg-surface)
        surface: {
          DEFAULT: "#F4F7FA",
          50: "#f7fafc", // optional: add light steps if you plan to use -50/-100
          100: "#eef3f7",
        },

        divider: { DEFAULT: "#F5F6FF" },
        border: { DEFAULT: "#0257960D" },
        foreground: { DEFAULT: "#22294A" },
        muted: { DEFAULT: "#697E95", strong: "#8896B2" },

        success: { DEFAULT: colors.green[600] },
        warning: { DEFAULT: colors.amber[600] },
        danger: { DEFAULT: colors.red[600] },

        // Keep selected Tailwind palettes
        gray: colors.gray,
        slate: colors.slate,
        blue: colors.blue,
        indigo: colors.indigo,
        emerald: colors.emerald,
        yellow: colors.yellow,
        sky: colors.sky,
        cyan: colors.cyan,
        red: colors.red,
        orange: colors.orange,
        black: colors.black,
        white: colors.white,
        transparent: "transparent",
        current: "currentColor",
      },

      fontFamily: {
        sans: [
          "Cairo",
          "Open Sans",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
        grotesk: ["Grotesk", "sans-serif"],
        open: ["Open Sans", "sans-serif"],
        cairo: ["Cairo", "sans-serif"],
      },
      boxShadow: { card: "0px 0px 20px 0px rgba(3, 87, 150, 0.16)" },
      minHeight: { "3/4": "75%" },
      maxWidth: { "3/4": "75%" },
    },
  },

  safelist: [
    "tw-bg-gradient-to-br",
    "tw-from-primary-50",
    "tw-via-white",
    "tw-to-primary-100",
    "tw-from-slate-50",
    "tw-to-slate-100",
    // (optional) ensure these never purge
    "tw-bg-surface",
    "tw-text-foreground",
    "tw-border-border",
  ],

  plugins: [],
};
