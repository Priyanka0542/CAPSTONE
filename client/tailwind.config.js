/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-black': 'var(--background)',
        'nebula-navy': 'var(--surface)',
        'comet-violet': 'var(--primary)',
        'aurora-teal': 'var(--success)',
        'pulsar-pink': 'var(--pulsar-pink)',
        'solar-amber': 'var(--warning)',
        'meteor-red': 'var(--danger)',
        'starlight': 'var(--text-primary)',
        'dust-gray': 'var(--text-secondary)',
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
