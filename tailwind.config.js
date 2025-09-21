/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        barber: {
          // Deep, rich blacks and grays
          midnight: '#0A0A0A',
          charcoal: '#1A1A1A',
          black: '#181818',
          dark: '#232323',
          slate: '#2D2D2D',
          
          // Premium golds and metallics
          gold: '#D4AF37',
          'gold-light': '#F4E4BC',
          'gold-dark': '#B8941F',
          copper: '#B87333',
          bronze: '#CD7F32',
          
          // Rich browns and earth tones
          brown: '#6B4F27',
          'brown-light': '#8B6914',
          mahogany: '#C04000',
          
          // Clean whites and creams
          white: '#FEFEFE',
          cream: '#F8F6F2',
          pearl: '#F5F5DC',
          gray: '#E5E5E5',
          
          // Accent colors
          crimson: '#DC143C',
          emerald: '#50C878',
          sapphire: '#0F52BA',
        },
      },
      fontFamily: {
        barber: ['Playfair Display', 'Oswald', 'Montserrat', 'serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        barber: '0 4px 24px 0 rgba(0,0,0,0.12)',
        'barber-xl': '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
        'barber-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'neon-gold': '0 0 5px #D4AF37, 0 0 10px #D4AF37, 0 0 15px #D4AF37',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'barber-pattern': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212, 175, 55, 0.1) 10px, rgba(212, 175, 55, 0.1) 20px)',
      },
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke',
        'spacing': 'margin, padding',
        'transform': 'transform',
        'all': 'all',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'pop': 'pop 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
