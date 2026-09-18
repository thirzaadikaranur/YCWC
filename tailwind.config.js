/** @type {import('tailwindcss').Config} */
const token = (name) => `var(--${name})`;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: token("color-bg"),
        surface: token("color-surface"),
        accent: token("color-accent"),
        "accent-hover": token("color-accent-hover"),
        success: token("color-success"),
        warning: token("color-warning"),
        danger: token("color-danger"),
        border: token("color-border"),
        ink: token("color-ink"),
        "ink-muted": token("color-ink-muted"),
        "surface-muted": token("color-surface-muted"),
        "surface-bright": token("color-surface-bright"),
        "on-accent": token("color-on-accent"),
      },
      fontFamily: {
        display: token("font-display"),
        body: token("font-body"),
      },
      borderRadius: {
        card: token("radius-card"),
        control: token("radius-control"),
      },
      boxShadow: {
        card: token("shadow-card"),
      },
    },
  },
};
