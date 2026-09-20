import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // ServeOS - Cozy Botanical Premium Restaurant OS Palette
        serveos: {
          cream: '#faf8f5',
          creamLight: '#fcfbf9',
          creamDark: '#f3eee6',
          forest: '#1b3b2f',
          forestDark: '#122820',
          forestLight: '#244e3f',
          sage: '#3a7d5c',
          sageLight: '#eef4f0',
          sageMuted: '#95ab9c',
          moss: '#5a6b57',
          olive: '#738570',
          wood: '#b08968',
          clay: '#c57b57',
          earth: '#162820',
          border: '#e4ede5',
        },
        brand: {
          amber: '#df9b56',
          amberHover: '#ca8540',
          yellow: '#eec765',
          yellowHover: '#e0b54f',
          teal: '#1b3b2f',
          tealDark: '#122820',
          tealLight: '#244e3f',
          emerald: '#2d6a4f',
          sage: '#eef4f0',
          warmBg: '#faf8f5',
          cream: '#fbfaf7',
          surface: '#ffffff',
          card: '#ffffff',
          cardBorder: '#e6ede7',
          border: '#e4ede5',
          softBorder: '#edf2ee',
          dark: '#162820',
          muted: '#6b7c72',
          // Functional status engine
          mint: '#eaf4ee',
          mintText: '#2d6a4f',
          amberSoft: '#fdf4ea',
          amberText: '#b45309',
          blueSoft: '#eef4ff',
          blueText: '#3b82f6',
          purpleSoft: '#f4f0fa',
          purpleText: '#6d3bd7',
          graySoft: '#f4f6f4',
          grayText: '#68776f',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.25rem',
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        board: "0 25px 60px -15px rgba(22, 28, 36, 0.10)",
        elevated: "0 10px 30px -5px rgba(28, 31, 35, 0.08), 0 4px 12px -2px rgba(28, 31, 35, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
