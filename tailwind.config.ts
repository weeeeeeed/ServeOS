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
        // BitePoint - Warm Culinary Modernism Palette
        brand: {
          amber: '#efa736',
          amberHover: '#e09827',
          yellow: '#FDC544',
          yellowHover: '#f5ba33',
          teal: '#1f4e47',
          tealDark: '#133e36',
          tealLight: '#2a6a61',
          emerald: '#2f6858',
          sage: '#e2edea',
          warmBg: '#eae9e4',
          cream: '#F7F6F1',
          surface: '#faf9f6',
          card: '#ffffff',
          cardBorder: '#eceae6',
          border: '#e7e5e4',
          softBorder: '#ECEAE4',
          dark: '#1c1917',
          muted: '#78716c',
          // Functional status engine
          mint: '#e4f8ed',
          mintText: '#109955',
          amberSoft: '#fff6e5',
          amberText: '#d97706',
          blueSoft: '#eef4ff',
          blueText: '#3b82f6',
          purpleSoft: '#f2edff',
          purpleText: '#6d3bd7',
          graySoft: '#f3f4f6',
          grayText: '#6b7280',
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
