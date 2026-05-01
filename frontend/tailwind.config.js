/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adult Theme: 'Helpful Neighbor'
        neighbor: {
          primary: '#3b82f6', // Cool Blue
          neutral: '#f5f5f4', // Warm Neutral (Stone-100/50)
          accent: '#991b1b',  // Garnet/Red-800
          success: '#10b981', // Success Green
        },
        // Kids Theme: 'The Junior Scout'
        scout: {
          yellow: '#fde047', // Banana Yellow
          orange: '#f97316', // Persimmon Orange
          green: '#4ade80',  // Mint Green
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'], // Trustworthy Serif
        sans: ['Inter', 'sans-serif'],    // Readable Sans
        rounded: ['Quicksand', 'sans-serif'], // Playful Rounded for Kids
      },
      boxShadow: {
        'bubble': '0 4px 0 0 rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
        'bubble-pressed': '0 2px 0 0 rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
  darkMode: 'class', // We'll use this for Kids Mode or similar
}
