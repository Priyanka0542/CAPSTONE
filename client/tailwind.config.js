/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#05010F',
        'nebula-navy': '#12102A',
        'comet-violet': '#8A5CFF',
        'aurora-teal': '#00F0C0',
        'pulsar-pink': '#FF6FA8',
        'solar-amber': '#FFB84D',
        'meteor-red': '#FF5C7A',
        'starlight': '#F1EFFF',
        'dust-gray': '#7C7A99',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
};
