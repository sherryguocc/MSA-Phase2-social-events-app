import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",      // Light theme
      "dark",       // Dark theme
    ],
    darkTheme: "dark", // Default dark theme
    base: true,
    styled: true,
    utils: true,
  },
}
