/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#000000",
          charcoal: "#0A0B0D",
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
          goldDark: "#AA7C11",
          purpleDark: "#090214",
          purpleDeep: "#120524",
          purpleMid: "#1E0B36",
          purpleLight: "#35155D",
          purpleGlow: "#5E17EB",
          cardBg: "rgba(15, 6, 28, 0.6)",
          border: "rgba(212, 175, 55, 0.15)",
          borderHover: "rgba(212, 175, 55, 0.4)",
        }
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        goldGlow: "0 0 20px rgba(212, 175, 55, 0.15)",
        purpleGlow: "0 0 25px rgba(94, 23, 235, 0.2)",
        goldGlowStrong: "0 0 30px rgba(212, 175, 55, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #090214 0%, #120524 50%, #000000 100%)',
        'gold-metallic': 'linear-gradient(135deg, #AA7C11 0%, #F3E5AB 50%, #D4AF37 100%)',
      }
    },
  },
  plugins: [],
}
