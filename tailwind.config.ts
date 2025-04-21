import type { Config } from "tailwindcss"
import colors from 'tailwindcss/colors'

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        amber: colors.amber,
        zinc: colors.zinc,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: ({ theme }: { theme: any }) => ({
        retro: {
          css: {
            '--tw-prose-body': theme('colors.amber[200]'),
            '--tw-prose-headings': theme('colors.amber[300]'),
            '--tw-prose-lead': theme('colors.amber[300]'),
            '--tw-prose-links': theme('colors.amber[400]'),
            '--tw-prose-bold': theme('colors.amber[200]'),
            '--tw-prose-counters': theme('colors.amber[400]'),
            '--tw-prose-bullets': theme('colors.amber[600]'),
            '--tw-prose-hr': theme('colors.amber[800]'),
            '--tw-prose-quotes': theme('colors.amber[300]'),
            '--tw-prose-quote-borders': theme('colors.amber[700]'),
            '--tw-prose-captions': theme('colors.amber[400]'),
            '--tw-prose-code': theme('colors.amber[300]'),
            '--tw-prose-pre-code': theme('colors.amber[300]'),
            '--tw-prose-pre-bg': theme('colors.zinc[800]'),
            '--tw-prose-th-borders': theme('colors.amber[700]'),
            '--tw-prose-td-borders': theme('colors.amber[800]'),
            'a:hover': {
              color: theme('colors.amber[200]'),
            },
            'h1, h2, h3, h4, h5, h6': {
              fontWeight: '600',
            },
            'pre': {
              border: `1px solid ${theme('colors.amber[800]')}`,
              borderRadius: theme('borderRadius.md'),
            },
            'code': {
               padding: '0.2em 0.4em',
               margin: '0',
               fontSize: '85%',
               backgroundColor: theme('colors.zinc[700]'),
               borderRadius: theme('borderRadius.sm'),
               fontWeight: 'normal',
               '&::before': { content: 'none' }, 
               '&::after': { content: 'none' }, 
            },
            'ul > li::marker': {
                color: theme('colors.amber[600]'),
            },
            'ol > li::marker': {
                color: theme('colors.amber[400]'),
            },
            'blockquote': {
                borderLeftColor: theme('colors.amber[700]'),
                fontStyle: 'normal',
                fontWeight: 'normal',
                color: theme('colors.amber[300]'),
            }
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
