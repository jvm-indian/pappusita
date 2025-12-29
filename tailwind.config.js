export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Ayurvedic Palette (Earth Tones)
        'ayur-cream': '#F9F7F2',      // Rice paper background
        'ayur-gold': '#D4AF37',        // Vedic gold
        'ayur-sage': '#8FBC8F',        // Pale sage (Autism calming)
        'ayur-sky': '#87CEEB',         // Sky blue
        'ayur-olive': '#556B2F',       // Dark olive (grounding)
        'ayur-slate': '#2F4F4F',       // Deep slate (text)
        'ayur-sand': '#F4A460',        // Warm sand
        'ayur-clay': '#D2B48C',        // Soft clay
        // Dosha Colors
        'vata-wind': '#88B04B',        // Muted sage (ADHD)
        'pitta-fire': '#E09F3E',       // Soft turmeric
        'kapha-earth': '#A0522D',      // Sienna clay
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'dyslexia': ['OpenDyslexic', 'Lexend', 'Verdana', 'sans-serif'],
        'body': ['OpenDyslexic', 'Lexend', 'sans-serif'],
      },
      fontSize: {
        'sm': '14px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-lite': 'bounce-lite 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bounce-lite': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: [],
}
