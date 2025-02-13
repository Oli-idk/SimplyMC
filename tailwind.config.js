/** @type {import('tailwindcss').Config} */

import { content, theme } from '@luminescent/ui-qwik/config';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', ...content],
  theme: {
    extend: {
      animation: {
        ...theme.extend.animation,
      },
      keyframes: {
        ...theme.extend.keyframes,
      },
    },
  },
};
