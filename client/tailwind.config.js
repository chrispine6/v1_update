// Import the plugin from the NextUI package
const { nextui } = require('@nextui-org/react'); // If 'nextui' is indeed exported from here

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/react/dist/**/*.{js,ts,jsx,tsx}" // Adjusted path if the package is `@nextui-org/react`
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // This toggles dark mode via a class rather than media queries
  plugins: [
    nextui() // Ensure this plugin function is correctly referenced and available
  ],
};
