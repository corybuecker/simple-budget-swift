/** @type {import('tailwindcss').Config} */
export default {
  content: ["Views/**/*.leaf", "Assets/src/**/*.tsx"],
  theme: {
    extend: {},
  },

  plugins: [
    require("@tailwindcss/forms"), 
    require("@tailwindcss/typography"), 
    require("@tailwindcss/container-queries")
  ],
};
