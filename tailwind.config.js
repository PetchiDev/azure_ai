/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0078D4",
        background: "#0A0A0F",
        surface: "#12121A",
        card: "#1A1A2E",
        azure: {
          blue: "#0078D4",
          indigo: "#6366F1",
        },
      },
      fontFamily: {
        inter: ["Inter-Regular"],
        "inter-bold": ["Inter-Bold"],
        "inter-black": ["Inter-Black"],
        "inter-medium": ["Inter-Medium"],
        mono: ["JetBrainsMono-Regular"],
      },
    },
  },
  plugins: [],
};
