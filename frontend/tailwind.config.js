/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#080810',
        darkCard: 'rgba(15, 15, 25, 0.7)',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
        brandPrimary: '#6366f1', // Indigo
        brandSecondary: '#a855f7', // Purple
        brandAccent: '#10b981', // Emerald
        brandAlert: '#ef4444', // Red
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        glowPrimary: '0 0 20px rgba(99, 102, 241, 0.15)',
        glowSecondary: '0 0 20px rgba(168, 85, 247, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}
