/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        heading: ["var(--font-sora)", "sans-serif"],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
          'glow': '0 0 18px rgba(0, 240, 192, 0.4)',
          'glow-hover': '0 0 35px rgba(0, 240, 192, 0.6)'
      },
  		colors: {
          'conclave-green': '#27584F',
          'meetings-pink': '#EFB3AF',
          'profile-blue': '#A6C8D5',
          'settings-purple': '#A69CBE',
          cyan: { DEFAULT: 'rgb(var(--color-cyan-rgb) / <alpha-value>)', },
          green: { DEFAULT: 'rgb(var(--color-green-rgb) / <alpha-value>)', },
          yellow: { DEFAULT: 'rgb(var(--color-yellow-rgb) / <alpha-value>)', },
          purple: { DEFAULT: 'rgb(var(--color-purple-rgb) / <alpha-value>)', },
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
        cyber: {
            bg: '#0a0c12',
            component: '#181c27',
            input: 'rgba(30, 35, 50, 0.6)',
            accent: '#00f0c0',
            accentHover: '#00ffde',
            text: '#e0e7ff',
            secondary: '#a0aed0',
            muted: '#707a95',
            border: '#3a3f5e'
        },
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
        warning: 'hsl(var(--warning))',
        success: 'hsl(var(--success))',
        border: 'hsl(var(--border))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
