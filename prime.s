/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  prefix: 'tw-',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    // Your custom breakpoints (kept as-is)
    screens: {
      sm: '600px',
      md: '800px',
      lg: '1024px',
      xl: '1200px',
      '2xl': '1400px',
    },

    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        lg: '1rem',
        xl: '1rem',
        '2xl': '2rem',
      },
    },

    extend: {
      // ──────────────────────────────────────────────────────────────
      // 1) PRIME AURA VARIABLE MIRROR (always in sync with Prime)
      //    Use these when you want Tailwind utilities to match Aura.
      //    Example: tw-bg-p-surface-0, tw-text-p-text, tw-border-p-content
      // ──────────────────────────────────────────────────────────────
      colors: {
        p: {
          // Aura primary scale & DEFAULT
          primary: {
            50:  'var(--p-primary-50)',
            100: 'var(--p-primary-100)',
            200: 'var(--p-primary-200)',
            300: 'var(--p-primary-300)',
            400: 'var(--p-primary-400)',
            500: 'var(--p-primary-500)',
            600: 'var(--p-primary-600)',
            700: 'var(--p-primary-700)',
            800: 'var(--p-primary-800)',
            900: 'var(--p-primary-900)',
            950: 'var(--p-primary-950)',
            DEFAULT: 'var(--p-primary-500)',
          },

          // Aura surfaces
          surface: {
            0:   'var(--p-surface-0)',
            50:  'var(--p-surface-50)',
            100: 'var(--p-surface-100)',
            200: 'var(--p-surface-200)',
            300: 'var(--p-surface-300)',
            400: 'var(--p-surface-400)',
            500: 'var(--p-surface-500)',
            600: 'var(--p-surface-600)',
            700: 'var(--p-surface-700)',
            800: 'var(--p-surface-800)',
            900: 'var(--p-surface-900)',
            950: 'var(--p-surface-950)',
            DEFAULT: 'var(--p-surface-0)',
          },

          // Text & content colors from Aura
          text: {
            DEFAULT: 'var(--p-text-color)',
            muted: 'var(--p-text-muted-color)',
            hover: 'var(--p-text-hover-color)',
            'hover-muted': 'var(--p-text-hover-muted-color)',
          },

          // Borders & content borders from Aura
          content: {
            DEFAULT: 'var(--p-content-background)',
            hover: 'var(--p-content-hover-background)',
            border: 'var(--p-content-border-color)',
            color: 'var(--p-content-color)',
            'hover-color': 'var(--p-content-hover-color)',
          },

          // Highlights used by lists/selections in Aura
          highlight: {
            bg: 'var(--p-highlight-background)',
            'bg-focus': 'var(--p-highlight-focus-background)',
            color: 'var(--p-highlight-color)',
            'color-focus': 'var(--p-highlight-focus-color)',
          },
        },

        // ──────────────────────────────────────────────────────────
        // 2) SWSDF BRAND TOKENS (semantic & stable)
        //    Use these for app-specific brand usage.
        // ──────────────────────────────────────────────────────────
        primary: {
          DEFAULT: '#035796', // SWSDF blue
        },
        secondary: {
          DEFAULT: '#181E3C', // deep navy
        },
        surface: {
          DEFAULT: '#F4F7FA', // light background/surface
        },
        divider: {
          DEFAULT: '#F5F6FF', // subtle lines/dividers
        },
        border: {
          DEFAULT: '#0257960D', // ultra-light stroke (brand blue @ ~5% alpha)
        },
        foreground: {
          DEFAULT: '#22294A',
        },
        muted: {
          DEFAULT: '#697E95',
          strong: '#8896B2',
        },

        // Status (can be branded later)
        success: { DEFAULT: colors.green[600] },
        warning: { DEFAULT: colors.amber[600] },
        danger:  { DEFAULT: colors.red[600] },

        // Keep full Tailwind palette accessible
        gray: colors.gray,
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
        transparent: 'transparent',
        current: 'currentColor',
      },

      fontFamily: {
        // Arabic-first sans; keeps Latin nice with Open Sans/system
        sans: [
          'Cairo',
          'Open Sans',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
        grotesk: ['Grotesk', 'sans-serif'],
        open: ['Open Sans', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },

      boxShadow: {
        card: '0px 0px 20px 0px rgba(3, 87, 150, 0.16)',
      },

      minHeight: {
        '3/4': '75%',
      },
      maxWidth: {
        '3/4': '75%',
      },
    },
  },

  // Optional: add official plugins as needed
  // plugins: [
  //   require('@tailwindcss/forms'),
  //   require('@tailwindcss/typography'),
  //   require('@tailwindcss/line-clamp'),
  //   require('@tailwindcss/aspect-ratio'),
  // ],
  plugins: [],
};
