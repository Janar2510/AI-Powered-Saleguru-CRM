/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          750: '#2a3441',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '8.5': '2.125rem',   // 34px
        '9.5': '2.375rem',   // 38px
        '11': '2.75rem',     // 44px - Touch target minimum
        '13': '3.25rem',     // 52px
        '15': '3.75rem',     // 60px
        '17': '4.25rem',     // 68px
        '18': '4.5rem',      // 72px
        '19': '4.75rem',     // 76px
        '21': '5.25rem',     // 84px
        '22': '5.5rem',      // 88px
        '23': '5.75rem',     // 92px
        '25': '6.25rem',     // 100px
        '26': '6.5rem',      // 104px
        '27': '6.75rem',     // 108px
        '28': '7rem',        // 112px
        '29': '7.25rem',     // 116px
        '30': '7.5rem',      // 120px
        '31': '7.75rem',     // 124px
        '33': '8.25rem',     // 132px
        '34': '8.5rem',      // 136px
        '35': '8.75rem',     // 140px
        '37': '9.25rem',     // 148px
        '38': '9.5rem',      // 152px
        '39': '9.75rem',     // 156px
        '41': '10.25rem',    // 164px
        '42': '10.5rem',     // 168px
        '43': '10.75rem',    // 172px
        '45': '11.25rem',    // 180px
        '46': '11.5rem',     // 184px
        '47': '11.75rem',    // 188px
        '49': '12.25rem',    // 196px
        '50': '12.5rem',     // 200px
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
        'input': '0.5rem',
      },
      boxShadow: {
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'button': '0 4px 12px rgba(124, 58, 237, 0.4)',
        'focus': '0 0 0 3px rgba(124, 58, 237, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      lineHeight: {
        'tight': '1.1',
        'snug': '1.2',
        'normal': '1.5',
        'relaxed': '1.6',
        'loose': '1.8',
      },
      maxWidth: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        'full': '100%',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'screen-2xl': '1536px',
      },
      minHeight: {
        'touch': '2.75rem', // 44px minimum touch target
        'button': '2.5rem',  // 40px standard button
        'input': '2.75rem',  // 44px form input
        'card': '8rem',      // 128px minimum card height
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        // Touch-specific breakpoints
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
        // Reduced motion
        'reduce-motion': { 'raw': '(prefers-reduced-motion: reduce)' },
        // High contrast
        'high-contrast': { 'raw': '(prefers-contrast: high)' },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [
    // Custom plugin for consistent spacing utilities
    function({ addUtilities, theme }) {
      const spacing = theme('spacing');
      const spacingUtilities = {};

      // Generate responsive spacing utilities
      Object.entries(spacing).forEach(([key, value]) => {
        // Padding utilities
        spacingUtilities[`.p-${key}`] = { padding: value };
        spacingUtilities[`.px-${key}`] = { 
          paddingLeft: value, 
          paddingRight: value 
        };
        spacingUtilities[`.py-${key}`] = { 
          paddingTop: value, 
          paddingBottom: value 
        };
        spacingUtilities[`.pt-${key}`] = { paddingTop: value };
        spacingUtilities[`.pr-${key}`] = { paddingRight: value };
        spacingUtilities[`.pb-${key}`] = { paddingBottom: value };
        spacingUtilities[`.pl-${key}`] = { paddingLeft: value };

        // Margin utilities
        spacingUtilities[`.m-${key}`] = { margin: value };
        spacingUtilities[`.mx-${key}`] = { 
          marginLeft: value, 
          marginRight: value 
        };
        spacingUtilities[`.my-${key}`] = { 
          marginTop: value, 
          marginBottom: value 
        };
        spacingUtilities[`.mt-${key}`] = { marginTop: value };
        spacingUtilities[`.mr-${key}`] = { marginRight: value };
        spacingUtilities[`.mb-${key}`] = { marginBottom: value };
        spacingUtilities[`.ml-${key}`] = { marginLeft: value };

        // Gap utilities
        spacingUtilities[`.gap-${key}`] = { gap: value };
        spacingUtilities[`.gap-x-${key}`] = { columnGap: value };
        spacingUtilities[`.gap-y-${key}`] = { rowGap: value };

        // Space between utilities
        spacingUtilities[`.space-x-${key} > * + *`] = { marginLeft: value };
        spacingUtilities[`.space-y-${key} > * + *`] = { marginTop: value };
      });

      addUtilities(spacingUtilities);
    },

    // Custom plugin for touch-friendly utilities
    function({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          minHeight: '2.75rem',
          minWidth: '2.75rem',
        },
        '.touch-target-lg': {
          minHeight: '3rem',
          minWidth: '3rem',
        },
        '.touch-target-xl': {
          minHeight: '3.5rem',
          minWidth: '3.5rem',
        },
      });
    },

    // Custom plugin for focus states
    function({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
            borderColor: '#7c3aed',
          },
        },
        '.focus-ring-danger': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
          },
        },
        '.focus-ring-success': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
          },
        },
      });
    },
  ],
};