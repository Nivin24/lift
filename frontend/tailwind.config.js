/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        workspace: {
          bg: '#F0F1EC',        // warm linen / stone background (not bright white)
          panel: '#FFFFFF',     // crisp white card surface
          card: '#FFFFFF',      // crisp white card surface
          cardDark: '#161917',  // deep graphite dark card (like Box Breathing in image)
          border: '#E3E5DE',    // soft stone hairline border
          borderLight: '#ECEEE8',
          hover: '#F5F6F2',
          subtle: '#E8EAE3',
        },
        pastel: {
          apricot: '#FDD7AE',
          apricotText: '#733700',
          sage: '#CDE9D6',
          sageText: '#144D26',
          butter: '#FCE8A6',
          butterText: '#634800',
          periwinkle: '#D4E2F8',
          periwinkleText: '#1A3B8B',
          mintBtn: '#9DE8BA',
          mintBtnHover: '#8CE2AB',
          mintBtnText: '#0D381E',
        },
        text: {
          primary: '#161917',
          secondary: '#5C625D',
          muted: '#888F89',
        },
        lift: {
          accent: '#2563EB',
          accentHover: '#1D4ED8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
