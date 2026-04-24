/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        'primary-dark': '#E85555',
        'primary-light': '#FF8E8E',
        secondary: '#4ECDC4',
        'secondary-dark': '#38B2AB',
        background: '#F7F9FC',
        surface: '#FFFFFF',
        'surface-alt': '#F0F4F8',
        ink: '#2D3436',
        dim: '#636E72',
        muted: '#B2BEC3',
        border: '#DFE6E9',
        danger: '#FF7675',
        breakfast: '#FFB347',
        lunch: '#87CEEB',
        dinner: '#9B89C9',
        snack: '#90EE90',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
