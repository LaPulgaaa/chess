const base = require("@repo/config/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    ...base,
  	content: [...base.content],
	theme: {...base.theme},
  	plugins: [require("tailwindcss-animate")],
}

