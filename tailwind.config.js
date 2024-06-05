const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    require('flowbite/plugin')
],
content: [
  "./node_modules/flowbite/**/*.js"
],
  plugins: [
    // ...
    flowbite.plugin(),
  ],
};