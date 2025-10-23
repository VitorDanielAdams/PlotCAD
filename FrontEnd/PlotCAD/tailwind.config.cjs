module.exports = {
	content: ['./src/**/*.tsx', './index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
	mode: 'jit',
	darkMode: false,
	theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B5E20",
          light: "#43A047",
          soft: "#C8E6C9",
        },
        accent: "#00C853",
        neutral: {
          white: "#FFFFFF",
          gray: "#F5F7F6",
        },
        text: {
          dark: "#1A1A1A",
          light: "#4A4A4A",
          white: "#FFFFFF",
        },
      },
    },
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
}