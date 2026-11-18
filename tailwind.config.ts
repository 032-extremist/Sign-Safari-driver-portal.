import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        safari: {
          cream: '#f6f1e7',
          sand: '#e5dcc0',
          green: '#173b2c',
          greenSoft: '#2f5c44',
          accent: '#d9b75d',
          meadow: '#cfe6b8',
        },
      },
      boxShadow: {
        soft: '0 10px 28px rgba(23, 59, 44, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
