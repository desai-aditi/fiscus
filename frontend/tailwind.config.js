/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1B4332",
        "primary-light": "#004B29",
        secondary: "#184E77",
        "light-green": "#40916C",
        red: "#9B2C2C",
        accent: "#D4A373",

        offwhite: "#F8F8F8",
        "gray-200": "#ECECEC",
        "gray-400": "#5b5b5b",
        "gray-700": "#383838",
        "gray-800": "#292929",

        white: "#fff",
        black: "#000",
      }
    },
  },
  plugins: [],
}