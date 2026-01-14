/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roxo: "#9966FF",
        limao: "#EBEB70",
        darkbg: "#121212",
        darkpanel: "#1E1E1E",
        lightbg: "#FFFFFF",
        lightpanel: "#F4F4F4",
      },
    },
  },
  plugins: [],
};
