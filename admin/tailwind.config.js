/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#24211F',
          dark: '#191715',
          light: '#2E2B28',
          card: '#292623',
        },
        ivory: {
          DEFAULT: '#F7F2EA',
          warm: '#F7F2EA',
          light: '#FAF8F5',
          card: '#EFE7DC',
          dark: '#E5DCCE',
        },
        cream: {
          DEFAULT: '#EFE7DC',
          light: '#F5EFE6',
          dark: '#E2D7C8',
        },
        gold: {
          DEFAULT: '#C7A66A',
          champagne: '#C7A66A',
          hover: '#B89558',
          deep: '#9E804D',
          light: '#E6D7BA',
          subtle: 'rgba(199, 166, 106, 0.18)',
        },
        taupe: {
          DEFAULT: '#B7AAA0',
          light: '#CBC0B7',
          dark: '#93867D',
        },
        mutedBrown: {
          DEFAULT: '#71665D',
          light: '#8B7F76',
          dark: '#584F47',
        },
        ink: '#24211F',
        cream: '#ECE5DB',
        muted: '#71665D',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'Jost', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Jost', 'system-ui', 'sans-serif'],
        script: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      maxWidth: {
        page: '96rem',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
      boxShadow: {
        editorial: '0 20px 40px -15px rgba(36, 33, 31, 0.15)',
        gold: '0 10px 30px -10px rgba(199, 166, 106, 0.35)',
      },
    },
  },
}
