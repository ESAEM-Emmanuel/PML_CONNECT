/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: "#106270",
          secondary: "#FCD116",
          accent: "#009E60",
          neutral: "#3A75C4",
          "base-100": "#ffffff"
        },
        dark: {
          primary: "#EED1",
          secondary: "#3A75C4",
          accent: "#009E60",
          neutral: "#FCD116",
          "base-100": "#1e1e1e"
        }
      }
    ]
  },
  plugins: [require("daisyui")],
}
