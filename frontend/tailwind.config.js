/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#60a5fa', // blue-400
          dark: '#1e40af', // blue-800
        },
        accent: {
          DEFAULT: '#22d3ee', // cyan-400
          light: '#67e8f9', // cyan-300
        },
        card: '#f8fafc', // slate-50
      },
      boxShadow: {
        magic: '0 8px 32px 0 rgba(34,211,238,0.15), 0 1.5px 4px 0 rgba(37,99,235,0.10)',
      },
    },
  },
  plugins: [],
} 